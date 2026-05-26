# Crisis Reporter — Demo Script
**Audience:** technical jury / stakeholders  
**Duration:** ~8 minutes  
**Setup required:** see Pre-flight checklist below

---

## Pre-flight Checklist

Run 10 minutes before recording. Do not skip steps.

```bash
# 1. Seed the database (once per project)
psql "$DATABASE_URL" -f supabase/seed/001_crisis.sql
psql "$DATABASE_URL" -f supabase/seed/002_buildings.sql
psql "$DATABASE_URL" -f supabase/seed/003_observations.sql

# 2. Verify 30 observations exist
psql "$DATABASE_URL" -c "SELECT damage_level, COUNT(*) FROM observations WHERE crisis_id='c0000000-0000-0000-0000-000000000001' GROUP BY 1 ORDER BY 1;"
# Expected: complete=10, minimal=10, partial=10

# 3. Set env and start dev server
cp .env.example .env
# Edit .env:
#   VITE_SUPABASE_URL=<your-project-url>
#   VITE_SUPABASE_ANON_KEY=<your-anon-key>
#   VITE_DEMO_CRISIS_ID=c0000000-0000-0000-0000-000000000001
npm run dev

# 4. Open citizen view:  http://localhost:5173
# 5. Open agent view:    VITE_APP_MODE=agent npm run dev -- --port 5174

# 6. Open Supabase dashboard in a separate browser tab
#    → Table Editor → observations
#    → Storage → observation-photos

# 7. Set browser window to 390×844 (iPhone 14 viewport) for citizen view
# 8. Set agent view to full desktop width
```

---

## Scene 1 — Citizen Flow (3 min)

> **Goal:** Show the complete citizen reporting flow from photo to confirmation.

### Step 1 · Camera Screen

1. Open `http://localhost:5173` on the 390×844 browser window
2. The **Camera Screen** appears (Step 1 of 5)
3. Tap **"Take Photo"** — camera opens; take a photo of a flood-damaged building OR use a saved test photo
4. The photo preview fills the screen
5. Tap **"Use this photo"** to confirm

*Narration:* "The citizen app opens directly to the camera. No login required — the goal is minimum friction during a crisis."

---

### Step 2 · Location Screen

1. The map zooms to the device's GPS location (Porto Alegre area)
2. A draggable amber pin appears at the GPS fix
3. Show the pin position and the coordinate display (3 decimal places, ~50m precision)
4. **Do not drag the pin** — accept the GPS location
5. Tap **"Confirm location →"**

*Narration:* "GPS fixes automatically. Coordinates are truncated to 50m precision for citizen privacy — we don't store exact home addresses."

---

### Step 3 · Classification Screen

1. Tap the **"Complete"** damage card (red house icon — fully destroyed)
2. Tap **"Government"** from the infrastructure type grid
3. Under Crisis type, tap **"Flood"** chip
4. Toggle **Debris clearing needed** → ON
5. Tap **"Next →"**

*Narration:* "Three questions: how bad, what kind of building, what type of crisis. The debris clearing flag goes directly to the operations queue."

---

### Step 4 · Details Screen

1. Infrastructure name: type "Hospital de Pronto Socorro"
2. Description: type "Térreo alagado, acesso bloqueado"
3. Electricity: select **"No service"**
4. Health services: select **"Not functional"**
5. Pressing needs: tap **Water**, **Medical care**, **Shelter**
6. Tap **"Next →"**

*Narration:* "The modular fields are configurable per crisis type. For a flood, we collect electricity status and health service availability — the exact data the emergency committee needs."

---

### Step 5 · Review + Submit

1. The review screen shows a summary of all entered data
2. Photo thumbnail visible at the top
3. All fields shown: infrastructure, damage level, location, debris flag, modular fields
4. Tap **"Submit →"**
5. Brief "Submitting…" state

*Narration:* "The review screen is the final checkpoint. The submit sends to Supabase Storage (photo) and the observations table atomically."

---

### Step 6 · Confirmation Screen

1. Green checkmark appears — **"Report received"**
2. Show the **8-character report ID** (e.g., `A0B1C2D3`)
3. The **community impact counter** loads: "**31 reports** from your area are helping prioritize response"
4. Tap **"Report another"** to return to camera

*Narration:* "The confirmation shows real data from the `area_stats` table — a materialized view updated by trigger on every insert. The citizen knows their report landed and how many others have reported nearby."

---

## Scene 2 — Supabase Storage + Data (1.5 min)

> **Goal:** Show the backend data layer — photo storage and raw observations table.

### Step 7 · Storage Bucket

1. Switch to Supabase dashboard tab
2. Navigate to **Storage → observation-photos**
3. Show the uploaded photo file (UUID filename, JPEG)
4. Click the file → show the public URL → open it in a new tab
5. The photo of the damaged building appears

*Narration:* "Photos upload directly to Supabase Storage with a UUID filename — no PII in the path. The bucket is public-read, so the photo URL works in any GIS tool or report."

---

### Step 8 · Observations Table

1. Navigate to **Table Editor → observations**
2. Show the 31 rows (30 seed + 1 just submitted)
3. Filter by `damage_level = complete` → shows 10-11 rows
4. Click one row — show the full JSON of `modular_fields`
5. Show `confidence`, `version_number`, `client_created_at` columns

*Narration:* "Every observation has a confidence score from the auto-trigger, a version number for update tracking, and the full modular field JSON. The table is partitioned by crisis ID for horizontal scalability."

---

### Step 9 · area_stats Table (bonus — 30 seconds)

1. Navigate to **Table Editor → area_stats**
2. Show the geohash cells with `observation_count`, `complete_count`, etc.
3. Point out: counts updated automatically by the `update_area_stats` trigger

*Narration:* "The area stats table updates on every observation insert via PostgreSQL trigger — no application-layer aggregation needed. The confirmation screen reads from here."

---

## Scene 3 — Agent Dashboard + Export (3 min)

> **Goal:** Show the agent map view, filters, and real GeoJSON export.

### Step 10 · Agent Dashboard — Cluster View

1. Open `http://localhost:5174` (agent mode) in full desktop view
2. Map loads with Porto Alegre — clusters visible
3. Show the sidebar: **31 total reports**, damage level counts (Complete, Partial, Minimal)
4. Zoom in on the map — clusters split into individual pins
5. Color coding: red = complete, amber = partial, green = minimal

*Narration:* "The agent dashboard loads all observations from the database. Clustering is automatic — zoom in to see individual reports."

---

### Step 11 · Filters

1. Uncheck **"Complete"** from the Damage Level filter
2. The map immediately updates — red pins disappear, cluster count drops
3. From the **Infrastructure type** dropdown, select **"Government"**
4. Pins narrow to government buildings only (hospital, schools, UBS)
5. Show the footer: "Showing X of 31 reports"
6. Reset filters (re-enable Complete, set type back to All)

*Narration:* "Filters apply in real time to the loaded dataset — no extra database round-trips. The agent can isolate critical infrastructure in seconds."

---

### Step 12 · Heatmap Toggle

1. Click **"Heatmap"** in the Map View toggle
2. The cluster pins disappear — a heat gradient appears over Porto Alegre
3. Red hotspot over Navegantes/Humaitá (most complete-damage observations)
4. Green edges toward Moinhos de Vento (minimal damage area)
5. Click **"Clusters"** — map returns to pin view

*Narration:* "The heatmap weights observations by severity: complete = 1.0, partial = 0.6, minimal = 0.3. The red zone immediately identifies the priority intervention area."

---

### Step 13 · Observation Detail Panel

1. Click a red pin (complete-damage observation) on the map
2. The detail panel slides in from the right
3. Show: infrastructure name, red Complete badge, green confidence badge (>80%)
4. Show: Type, Source, Debris field, Coordinates, Timestamp
5. Show: modular fields section (electricity, health services, pressing needs)
6. Show: Version history ("Current: v2 / 1 earlier version — detail view in F2")
7. Click **✕** to close panel

*Narration:* "Clicking any marker opens the full observation record — every field from the database including the modular JSONB fields and version history stub."

---

### Step 14 · Export GeoJSON

1. Click **"↓ Export ▾"** button at the bottom of the sidebar
2. Dropdown opens with two options: `.geojson` and `.csv`
3. Click **"Export GeoJSON"**
4. File downloads: `crisis-reporter-2026-05-26.geojson`
5. Open the file in [geojson.io](https://geojson.io) (drag and drop the file)
6. All 31 points appear on the map with colored markers

*Narration:* "The GeoJSON export is a real FeatureCollection — RFC 7946 compliant, coordinates in [lng, lat] order. Drag it into QGIS, ArcGIS, or geojson.io and it works immediately."

---

### Step 15 · Export CSV (optional — 1 minute)

1. Click **"↓ Export ▾"** again → click **"Export CSV"**
2. File downloads: `crisis-reporter-2026-05-26.csv`
3. Open in LibreOffice Calc or Google Sheets
4. Show the 19 columns: id, crisis_id, infrastructure_name, infrastructure_type, damage_level, debris_clearing_needed, latitude, longitude, source, confidence, version_number, is_proxy, language, client_created_at, electricity_condition, health_services, pressing_needs, photo_url
5. Show that `pressing_needs` is pipe-separated (e.g. `water|shelter|medical_care`)

*Narration:* "The CSV flattens the modular JSONB fields into columns, pipe-separating multi-value arrays. Opens cleanly in any spreadsheet tool."

---

## Common Issues + Fixes

| Symptom | Fix |
|---------|-----|
| GPS not triggering on Location screen | Click "Use map pin instead" and drag the pin manually |
| Confirmation shows "Be the first to report" | Seed didn't run — check `area_stats` table in Supabase |
| Export button shows "Exporting…" then fails | Supabase RLS may block SELECT — check anon key has read on `observations` |
| Heatmap not visible | Zoom in closer to Porto Alegre; heatmap needs points within viewport |
| Cluster count doesn't match expected 31 | Verify `VITE_DEMO_CRISIS_ID=c0000000-0000-0000-0000-000000000001` in `.env` |

---

## .env Template for Demo

```bash
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_DEMO_CRISIS_ID=c0000000-0000-0000-0000-000000000001
```
