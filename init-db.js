const db = require('./db');

async function init() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS trending_videos (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        views TEXT,
        scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
}

init();
