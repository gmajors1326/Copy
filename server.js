const express = require('express');
const path = require('path');
const db = require('./db');
const scrapeTrending = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

// API to get data
app.get('/api/videos', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM trending_videos ORDER BY scraped_at DESC LIMIT 20');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API to trigger scraper
app.post('/api/scrape', async (req, res) => {
  try {
    const videos = await scrapeTrending();
    res.json({ message: 'Scrape successful', count: videos.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`COPY OS running on http://localhost:${PORT}`);
});
