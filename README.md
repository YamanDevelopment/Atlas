# UCF Data Scraper

A comprehensive TypeScript tool for collecting and standardizing data from UCF's various platforms including events, student organizations, and activities.

## Features

- **Campus Labs API**: Student organizations and their events with rich organizational data
- **events.ucf.edu**: Official UCF events with recurring patterns and categories
- **Standardized Output**: Unified JSON format combining both sources
- **Data Types**: Events, organizations, categories with source attribution

## Scripts

- `ucfData.ts` - Core data fetching and processing logic
- `fetchData.ts` - Simple execution script that saves to `ucf-data-YYYY-MM-DD.json`

## Usage

```bash
npx tsx fetchData.ts
```

Outputs a comprehensive JSON file with events, organizations, and categories from both UCF data sources.