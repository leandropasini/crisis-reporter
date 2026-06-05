# Changelog

## v0.20 — 2026-06-04
- Map auto-centers on crisis bounding box coordinates in live mode
- Fallback to world view (zoom 2) when no bbox defined

## v0.19 — 2026-06-04
- Fixed live mode dashboard loading wrong crisis data due to hardcoded fallback UUID
- CrisisSetupScreen: improved error display with actual Supabase error messages
- DB migration 006: added `disaster_type` column to live database

## v0.18 — 2026-06-04
- Crisis Setup screen for live mode: GPS reverse geocode, crisis name/description/type, coordinates, start date
- "Activate Crisis" gate before dashboard — only appears when no active crisis exists
- Live crisis ID propagated to all screens via App.tsx state

## v0.17 — 2026-06-03
- PWA fullscreen on iOS: suppress browser chrome when launched from home screen
- Safe-area insets for bottom nav on iPhone
- Overscroll bounce suppressed

## v0.16 — 2026-06-03
- DEMO badge: vertical pill on left edge of BottomNav
- Map tiles switched to OSM standard for readability on all viewports

## v0.15 — 2026-06-03
- DEMO badge re-added for desktop (no BottomNav on wide screens)
- Dashboard filter row: `flexWrap: wrap` to prevent button clipping

## v0.14 — 2026-06-03
- ObservationDetail panel: `zIndex: 1000` + `isolation: isolate` — renders above all Leaflet panes
- DEMO badge moved inline to BottomNav Home label (no prop drilling)

## v0.13 — 2026-06-03
- DEMO badge repositioned to clear bottom nav on iPhone
- ObservationDetail: explicit `background: var(--color-surface)` for full opacity
- Chrome macOS fix: `pointer-events: none` on sidebar mini-map (Leaflet z-index escape)

## v0.12 — 2026-06-03
- Three crisis modes: Rapid (3 steps), Full (5 steps), Contextual (5 steps + modular fields)
- Mode selector in Dashboard with localStorage persistence
- All citizen screens accept adaptive header (mode label + total steps)
- WCAG AA contrast on all text; 48px minimum touch targets

## v0.11 — 2026-06-03
- Submit: damage level mapping for disaster-specific keys to valid DB values
- ExportButton: 50ms delay between GeoJSON and CSV downloads
- DB migration 007: `update_area_stats()` trigger `SECURITY DEFINER` to unblock anon insert

## v0.10 — 2026-06-03
- Submit debug logging (entry, payload, Supabase response, branch taken)
- ExportButton: single-click downloads GeoJSON + CSV
- Dashboard: internal scroll only on critical list; content div no longer scrolls whole page

## v0.9 — 2026-06-03
- Demo submit: non-fatal photo upload (DB insert proceeds if Storage RLS blocks photo)
- Disaster category + severity selectors in citizen Step 3 (7 disaster types, i18n all 6 locales)
- DemoWelcomeScreen: role selection overlay on first `/demo` load with sessionStorage gate

## v0.7 — 2026-06-03
- i18next: removed `initImmediate`, synchronous init with bundled resources
- ExportButton: fixed-position dropdown using `getBoundingClientRect()`
- Dashboard cluster toggle: no longer clipped by `overflow: hidden`

## v0.6 — 2026-06-03
- Default language forced to English
- All CTAs translated in all 6 languages
- Location step: city/neighborhood name + coordinates in both modes
- Community Map title shows crisis name + location
- Crisis Settings modal: full-screen bottom sheet with disaster type selector

## v0.5 — 2026-06-02
- Disaster-contextual damage options: 7 types with custom taxonomies
- DB migration 006: `damage_level` → text, `is_demo` column, `disaster_type` on crises
- Agent dashboard: disaster type selector in Crisis Settings

## v0.4 — 2026-06-02
- Landing page at `/` with Demo and Live entry cards
- `/demo` route: GPS locked, Porto Alegre dataset, DEMO badge
- `/app` route: real GPS, live data, clean experience
- React Router v6; `is_demo` flag through full observation pipeline

## v0.3 — 2026-06-01
- Design system: Tabler Icons, design tokens, full UI pass on all screens
- RapidClassificationScreen: 4 damage levels with descriptions, 8 infra categories
- Dashboard: metric cards, live map, filter pills, critical list
- Seed data: 8 observations in Porto Alegre
- Submit fix: removed `navigator.onLine` gate blocking mobile submissions
- Added `DamageLevel.SEVERE` between PARTIAL and COMPLETE

## v0.2 — 2026-05-30
- Dashboard: mobile responsive layout, urgency-coded map markers with pulse animation
- Mobile: full-screen map with collapsible filter accordion and FAB

## v0.1 — 2026-05-25
- Initial working prototype: camera → location → classification → review → submit
- Supabase integration (PostgreSQL + Storage + RLS)
- Community map with real-time observations
- Offline queue (localStorage fallback when offline)
- Six UN languages (EN, ES, FR, AR, ZH, RU) via i18next
