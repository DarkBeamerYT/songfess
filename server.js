require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const confessionsRouter = require('./routes/confessions');
const spotifyRouter = require('./routes/spotify');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/confessions', confessionsRouter);
app.use('/api/spotify', spotifyRouter);

// Page routes
app.get('/confess', (req, res) => res.sendFile(path.join(__dirname, 'public', 'confess.html')));
app.get('/browse', (req, res) => res.sendFile(path.join(__dirname, 'public', 'browse.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'public', 'contact.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'public', 'about.html')));

// Catch-all
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✦ songfess running on port ${PORT}`);
});
