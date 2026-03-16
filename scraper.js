const puppeteer = require('puppeteer');
const db = require('./db');

async function scrapeTrending() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to YouTube Trending...');
    await page.goto('https://www.youtube.com/feed/trending', { waitUntil: 'networkidle2' });

    const videos = await page.evaluate(() => {
      const videoElements = document.querySelectorAll('ytd-video-renderer');
      return Array.from(videoElements).slice(0, 10).map(v => {
        const title = v.querySelector('#video-title').innerText;
        const metadata = v.querySelector('#metadata-line').innerText.split('\n');
        const views = metadata[0] || 'Unknown views';
        return { title, views };
      });
    });

    console.log(`Found ${videos.length} videos. Saving to database...`);

    for (const video of videos) {
      await db.query(
        'INSERT INTO trending_videos (title, views) VALUES ($1, $2)',
        [video.title, video.views]
      );
    }

    console.log('Scraping complete.');
    return videos;
  } catch (err) {
    console.error('Scraping failed:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

module.exports = scrapeTrending;
