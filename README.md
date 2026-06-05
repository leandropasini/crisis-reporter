# Crisis Reporter

Open-source community damage reporting platform for crisis response.

Built for the UNDP "Build the Future of Crisis Mapping" challenge.

**Live prototype:** https://crisis-reporter.vercel.app

---

## What it does

Crisis Reporter turns affected communities into real-time sensor networks during disasters. Citizens capture and submit geolocated damage reports from their phones; emergency coordinators monitor the incoming data on a live dashboard and prioritize response.

The system supports two roles:

- **Citizen**: mobile-first report flow — photo, location, damage classification — completed in under 30 seconds, works offline
- **Agent (coordinator)**: dashboard with live map, damage filters, area statistics, and data export

---

## Key features

- Offline-first PWA — reports queue locally and sync when connectivity returns
- Six disaster types with contextual damage taxonomies (flood, earthquake, hurricane, landslide, fire, drought)
- Six UN languages (EN, ES, FR, AR, ZH, RU)
- GPS reverse geocoding via Nominatim
- Real-time community map with urgency-coded markers
- GeoJSON + CSV export for coordination handoff
- Demo mode with locked Porto Alegre dataset for evaluation

---

## Stack

- React 18 + TypeScript + Vite
- Supabase (PostgreSQL + Storage + RLS)
- Leaflet for maps
- i18next for localization
- Deployed on Vercel

---

## Running locally

```bash
git clone https://github.com/leandropasini/crisis-reporter
cd crisis-reporter
cp .env.example .env   # add your Supabase credentials
npm install
npm run dev
```

---

## Database

Migrations are in `supabase/migrations/`. Apply in order (001 → 008) via the Supabase SQL Editor or CLI.

---

## License

MIT
