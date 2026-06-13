# UN Crisis Reporter

Community-sourced damage reporting app for UNDP crisis response.
Built for the UNDP "Build the Future of Crisis Mapping" challenge.

## Live app

- Demo mode (explore safely): https://crisis-reporter-submission.vercel.app/demo
- Live mode (agent + citizen): https://crisis-reporter-submission.vercel.app/app

## Quick start — agent

1. Open `/app` on desktop
2. Click "Agent Dashboard" → "Activate Crisis"
3. Set crisis name, confirm GPS location, select type
4. Share `/app` link with community members in the field
5. Monitor incoming reports on the dashboard map
6. Export data as CSV or GeoJSON for UNDP systems

## Quick start — citizen

1. Open `/app` on mobile browser (no install required)
2. Take a photo of damaged infrastructure
3. Confirm location via GPS or manual pin on map
4. Select infrastructure type and damage level
5. Answer Community Impact questions (optional)
6. Submit — report appears on agent map immediately

## Features

- 6 UN official languages: Arabic, Chinese, English, French, Russian, Spanish
- Offline-first PWA: reports queue locally and sync when connectivity returns
- Building footprints from OpenStreetMap via Overpass API
- 3 damage levels per UNDP spec: Minimal / Partially damaged / Completely damaged
- 11 crisis types: flood, earthquake, tsunami, hurricane, wildfire, explosion, chemical incident, conflict, civil unrest, landslide, drought
- Community Impact module: electricity, health services, pressing needs (Appendix 1)
- Export: GeoJSON and CSV with full field coverage

## Tech stack

- Frontend: React 18, TypeScript, Vite, Leaflet, i18next
- Backend: Supabase (PostgreSQL + PostGIS + RLS)
- Hosting: Vercel
- Offline: PWA with Workbox service worker + IndexedDB queue
- Maps: OpenStreetMap tiles + Overpass API (building footprints)
- Open source — MIT license

## Setup for developers

1. `cp .env.example .env`
2. Fill in Supabase credentials (URL + anon key + demo crisis ID)
3. `npm install`
4. Run migrations in order: `supabase/migrations/001` → last
5. `npm run dev`

See `_SUBMISSION/PROPOSAL.md` for full technical documentation.
