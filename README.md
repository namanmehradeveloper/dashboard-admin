# Belize Tourism Analytics (React)

A complete Vite + React + Recharts dashboard based on the supplied Belize tourism dashboard screenshots.

## Included
- 100,000 deterministic synthetic mock records (generated in memory)
- Global filters: year, destination, origin and visitor type
- Per-chart filters: year, destination, origin and visitor type on each filtered chart panel
- Dashboard sections: Overview, International arrivals, Travel reasons, Entry methods, Origin markets, Stay & spending, Cruise tourism and Data records
- Recharts donut, stacked bar, horizontal bar, annual trend, year-over-year, monthly arrivals, hotel occupancy, tourism revenue, seasonality, stay duration, spending and cruise visitor charts
- Interactive tooltips, legends, sortable/searchable records table, pagination and CSV export including bookings, occupancy and revenue fields
- Responsive layout for desktop, tablet and mobile

## Run locally
Requires Node.js 18+.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Production build
```bash
npm run build
npm run preview
```

## Important data note
All 100,000 records are synthetic demo data generated locally by `src/App.jsx`. Values and categories are for UI/functionality testing only and are NOT official Belize Tourism Board statistics. The charts calculate from the generated rows and respond to their filters. No backend or database is required for this mock-data demo.
