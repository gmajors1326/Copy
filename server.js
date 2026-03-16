const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const db = require('./db');
const scrapeTrending = require('./scraper');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

// API to get data
app.get('/api/videos', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM trending_videos ORDER BY scraped_at DESC LIMIT 24');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API to trigger scraper
app.post('/api/scrape', async (req, res) => {
  try {
    io.emit('log', { message: 'SYSTEM: Initializing Puppeteer cluster...', type: 'info' });
    const videos = await scrapeTrending();
    io.emit('log', { message: `SUCCESS: ${videos.length} data points synchronized.`, type: 'success' });
    io.emit('data-update');
    res.json({ message: 'Scrape successful', count: videos.length });
  } catch (err) {
    io.emit('log', { message: `ERROR: ${err.message}`, type: 'error' });
    res.status(500).json({ error: err.message });
  }
});

io.on('connection', (socket) => {
  console.log('Operator connected to Neural Link');
});

server.listen(PORT, () => {
  console.log(`COPY OS running on http://localhost:${PORT}`);
});
