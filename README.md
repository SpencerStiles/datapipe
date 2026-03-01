# DataPipe

**ETL pipeline dashboard.** Build, run, and monitor data transformation pipelines with a visual step editor and run log viewer.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Status: Backburner.** UI and pipeline definition complete. Real execution engine is simulated — would need a real worker for production use.

## Quick Start

```bash
git clone https://github.com/SpencerStiles/datapipe
cd datapipe
pnpm install && pnpm prisma generate && pnpm prisma migrate dev
cp .env.example .env.local
pnpm dev
```

## Features

- Pipeline builder with extract, transform, load, filter, map, and aggregate steps
- Visual step flow with color-coded type badges
- One-click run with simulated data processing
- Run history with status, duration, and row counts
- Timestamped log viewer per run
- Enable/disable and cron scheduling fields

## Tech Stack

Next.js 14 · TypeScript · Prisma · SQLite · Tailwind CSS

## License

MIT
