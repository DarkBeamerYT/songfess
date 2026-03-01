const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const pool = require('../middleware/db');

// Rate limit submissions — 5 per hour per IP
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'too many confessions from this IP, slow down ✦' }
});

// GET /api/confessions — fetch latest confessions
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const order = req.query.random === 'true' ? 'RAND()' : 'created_at DESC';
    const [rows] = await pool.query(
      'SELECT * FROM confessions ORDER BY ' + order + ' LIMIT ? OFFSET ?',
      [limit, offset]
    );
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM confessions');

    res.json({ data: rows, count: total, page, limit });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'database error' });
  }
});

// GET /api/confessions/random — for the floating label
router.get('/random', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT message, recipient FROM confessions ORDER BY RAND() LIMIT 5'
    );
    if (!rows.length) return res.json({ message: null });
    res.json(rows);
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'database error' });
  }
});

// POST /api/confessions — submit a new confession
router.post('/', submitLimiter, async (req, res) => {
  const { recipient, message, song_title, song_artist, song_cover, spotify_url, preview_url } = req.body;

  if (!recipient || !message || !song_title || !song_artist) {
    return res.status(400).json({ error: 'missing required fields' });
  }
  if (message.length > 300) {
    return res.status(400).json({ error: 'message too long (max 300 chars)' });
  }
  if (recipient.length > 50) {
    return res.status(400).json({ error: 'recipient name too long (max 50 chars)' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO confessions (recipient, message, song_title, song_artist, song_cover, spotify_url, preview_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [recipient, message, song_title, song_artist, song_cover || null, spotify_url || null, preview_url || null]
    );

    res.status(201).json({ data: { id: result.insertId, recipient, message, song_title, song_artist } });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'database error' });
  }
});

module.exports = router;

// GET /api/confessions/search?name=xyz — search by recipient (case-insensitive)
router.get('/search', async (req, res) => {
  const name = req.query.name;
  if (!name) return res.status(400).json({ error: 'missing name' });

  try {
    const [rows] = await pool.query(
      'SELECT * FROM confessions WHERE LOWER(recipient) = LIKE LOWER(?) ORDER BY created_at DESC',
      ['%' + name.trim() + '%']
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'database error' });
  }
});
