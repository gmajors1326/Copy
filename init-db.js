const db = require('./db');

async function init() {
  try {
    // Drop existing table to ensure schema matches the new Viral Clone & Twist requirements
    await db.query(`DROP TABLE IF EXISTS trending_videos`);
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS trending_videos (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        channel_name TEXT,
        thumbnail_url TEXT,
        video_url TEXT,
        views TEXT,
        view_count INTEGER,
        velocity INTEGER DEFAULT 0,
        category TEXT DEFAULT 'Market Pulse',
        twist_score INTEGER DEFAULT 0,
        scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized successfully with new schema.');
    process.exit(0);
  } catch (err) {
    // On Render, the DB might take a second to be ready
    console.error('Database initialization warning (retrying may be needed):', err.message);
    process.exit(0); // Exit gracefully so the server can attempt to start/retry
  }
}

init();
