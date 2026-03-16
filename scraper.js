const puppeteer = require('puppeteer');
const db = require('./db');

async function scrapeTrending() {
  console.log('Using Puppeteer Cache:', process.env.PUPPETEER_CACHE_DIR);
  const browser = await puppeteer.launch({ 
    headless: "new",
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to YouTube Trending...');
    await page.goto('https://www.youtube.com/feed/trending', { waitUntil: 'networkidle2' });

    const videos = await page.evaluate(() => {
      const videoElements = document.querySelectorAll('ytd-video-renderer');
      return Array.from(videoElements).slice(0, 12).map(v => {
        const title = v.querySelector('#video-title').innerText;
        const videoUrl = v.querySelector('#video-title').href;
        const channelName = v.querySelector('#channel-info').innerText.split('\n')[0];
        const thumbnailUrl = v.querySelector('img').src;
        const metadata = v.querySelector('#metadata-line').innerText.split('\n');
        const viewsStr = metadata[0] || '0 views';
        
        // Parse views to integer for velocity calculation
        const viewCount = parseInt(viewsStr.replace(/[^0-9]/g, '')) * (viewsStr.includes('K') ? 1000 : viewsStr.includes('M') ? 1000000 : 1);
        
        return { title, videoUrl, channelName, thumbnailUrl, views: viewsStr, viewCount };
      });
    });

    console.log(`Found ${videos.length} videos. Syncing with Neural Link...`);

    for (const video of videos) {
      // Logic to calculate velocity could go here (comparing with last known count)
      const velocity = Math.floor(Math.random() * 5000); // Placeholder velocity
      const twistScore = Math.floor(Math.random() * 100);

      await db.query(
        `INSERT INTO trending_videos (title, video_url, channel_name, thumbnail_url, views, view_count, velocity, twist_score) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [video.title, video.videoUrl, video.channelName, video.thumbnailUrl, video.views, video.viewCount, velocity, twistScore]
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
