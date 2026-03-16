# COPY // DARK CYBERPUNK AI OPS DASHBOARD

## Deployment (Render.com)
This project is configured for **Render Web Services** (not Static Sites, as it requires a Node.js backend and Database).

1. **Blueprints**: Connect your GitHub repo to Render and it will automatically detect the `render.yaml` file to set up both the Web Service and PostgreSQL database.
2. **Manual Setup**:
   - Create a **Web Service**.
   - Use `Build Command`: `./render-build.sh`
   - Use `Start Command`: `npm start`
   - Add Environment Variable `DATABASE_URL` from your Render PostgreSQL instance.


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
