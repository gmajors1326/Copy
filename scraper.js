const puppeteer = require('puppeteer');
const db = require('./db');

async function scrapeTrending(niche = '') {
  console.log('Using Puppeteer Cache:', process.env.PUPPETEER_CACHE_DIR);
  const browser = await puppeteer.launch({ 
    headless: "new",
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });
    
    let targetUrl = 'https://m.youtube.com/feed/trending';
    if (niche) {
      // Search for niche + sort by "This Week" and "View Count"
      // &sp=CAM%253D is the filter for view count
      targetUrl = `https://m.youtube.com/results?search_query=${encodeURIComponent(niche)}&sp=CAM%253D`;
    }

    console.log(`Navigating to: ${targetUrl}`);
    await page.goto(targetUrl, { 
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    });

    console.log('Checking for consent screen...');
    try {
      const consentButtons = await page.$$('button[aria-label*="Accept"], button[aria-label*="Agree"], .VfPpkd-LgbsSe');
      if (consentButtons.length > 0) {
        await consentButtons[0].click();
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (e) {}

    console.log('Waiting for results...');
    // Search results use ytm-video-renderer
    await page.waitForSelector('ytm-video-renderer, ytm-video-with-context-renderer, ytd-video-renderer', { timeout: 30000 });

    const videos = await page.evaluate(() => {
      let videoElements = document.querySelectorAll('ytm-video-renderer, ytm-video-with-context-renderer');
      if (videoElements.length === 0) {
        videoElements = document.querySelectorAll('ytd-video-renderer');
      }

      return Array.from(videoElements).slice(0, 12).map(v => {
        const titleEl = v.querySelector('h3, #video-title');
        const linkEl = v.querySelector('a');
        const channelEl = v.querySelector('.ytm-badge-and-byline-item, #channel-info');
        const imgEl = v.querySelector('img');
        const metadataEl = v.querySelector('.ytm-badge-and-byline-item-byline, #metadata-line');
        
        const viewsStr = metadataEl ? metadataEl.innerText : '0 views';
        const viewCount = parseInt(viewsStr.replace(/[^0-9]/g, '')) * (viewsStr.includes('K') ? 1000 : viewsStr.includes('M') ? 1000000 : 1) || 0;
        
        return { 
          title: titleEl ? titleEl.innerText : 'Unknown',
          videoUrl: linkEl ? linkEl.href : '#',
          channelName: channelEl ? channelEl.innerText.split('•')[0].trim() : 'Unknown',
          thumbnail_url: imgEl ? imgEl.src : '',
          views: viewsStr,
          viewCount
        };
      });
    });

    console.log(`Found ${videos.length} targets.`);

    for (const video of videos) {
      const velocity = Math.floor(Math.random() * 5000); 
      const twistScore = Math.floor(Math.random() * 100);

      await db.query(
        `INSERT INTO trending_videos (title, video_url, channel_name, thumbnail_url, views, view_count, velocity, twist_score) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [video.title, video.videoUrl, video.channelName, video.thumbnail_url, video.views, video.viewCount, velocity, twistScore]
      );
    }
    } catch (e) {
      console.log('No consent screen found or failed to click.');
    }

    console.log('Waiting for video elements...');
    // Mobile selector is different: ytm-video-with-context-renderer
    await page.waitForSelector('ytm-video-with-context-renderer, ytd-video-renderer', { timeout: 30000 });

    const videos = await page.evaluate(() => {
      // Try both desktop and mobile selectors
      let videoElements = document.querySelectorAll('ytm-video-with-context-renderer');
      if (videoElements.length === 0) {
        videoElements = document.querySelectorAll('ytd-video-renderer');
      }

      return Array.from(videoElements).slice(0, 12).map(v => {
        const titleEl = v.querySelector('h3, #video-title');
        const title = titleEl ? titleEl.innerText : 'Unknown Title';
        
        const linkEl = v.querySelector('a');
        const videoUrl = linkEl ? linkEl.href : '#';
        
        const channelEl = v.querySelector('.ytm-badge-and-byline-item, #channel-info');
        const channelName = channelEl ? channelEl.innerText.split('•')[0].trim() : 'Unknown Channel';
        
        const imgEl = v.querySelector('img');
        const thumbnailUrl = imgEl ? imgEl.src : '';
        
        const metadataEl = v.querySelector('.ytm-badge-and-byline-item-byline, #metadata-line');
        const viewsStr = metadataEl ? metadataEl.innerText : '0 views';
        
        // Parse views
        const viewCount = parseInt(viewsStr.replace(/[^0-9]/g, '')) * (viewsStr.includes('K') ? 1000 : viewsStr.includes('M') ? 1000000 : 1) || 0;
        
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
