const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'too many searches, slow down ✦' }
});

let spotifyToken = null;
let tokenExpiry = null;

// Get/refresh Spotify access token
async function getSpotifyToken() {
  if (spotifyToken && tokenExpiry && Date.now() < tokenExpiry) {
    return spotifyToken;
  }

  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();

  if (!data.access_token) throw new Error('Failed to get Spotify token');

  spotifyToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // refresh 1 min early
  return spotifyToken;
}


// Fetch preview URL from iTunes API
async function getItunesPreview(title, artist) {
  try {
    const query = encodeURIComponent(`${title} ${artist}`);
    const res = await fetch(`https://itunes.apple.com/search?term=${query}&media=music&limit=1`);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].previewUrl || null;
    }
  } catch (e) {}
  return null;
}

// GET /api/spotify/search?q=query
router.get('/search', searchLimiter, async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'missing query' });

  try {
    const token = await getSpotifyToken();

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=6`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await response.json();

    const tracks = await Promise.all(data.tracks.items.map(async (track) => {
      const artist = track.artists.map((a) => a.name).join(', ');
      const preview_url = track.preview_url || await getItunesPreview(track.name, artist);
      return {
        id: track.id,
        title: track.name,
        artist,
        cover: track.album.images[1]?.url || track.album.images[0]?.url,
        spotify_url: track.external_urls.spotify,
        preview_url,
      };
    }));

    res.json({ tracks });
  } catch (err) {
    console.error('Spotify search error:', err);
    res.status(500).json({ error: 'spotify search failed' });
  }
});

module.exports = router;
