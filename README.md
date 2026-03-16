# COPY // DARK CYBERPUNK AI OPS DASHBOARD

## Setup
1. **Database**: 
   - Ensure PostgreSQL is running.
   - Create a database named `copy_db`.
   - Update the `.env` file with your actual `DB_USER` and `DB_PASSWORD`.

2. **Initialize Database**:
   ```bash
   node init-db.js
   ```

3. **Start Dashboard**:
   ```bash
   node server.js
   ```

## Features
- **Puppeteer Scraper**: Navigates YouTube Trending, extracts titles and view counts.
- **PostgreSQL**: Persistent storage for all scraped data.
- **Cyberpunk UI**: High-contrast dark theme with neon accents and monospace logs.
- **Real-time Ops**: Trigger scraping directly from the dashboard.

## Tech Stack
- Backend: Node.js, Express
- Scraping: Puppeteer
- DB: PostgreSQL
- UI: Tailwind CSS, Orbitron & JetBrains Mono fonts
