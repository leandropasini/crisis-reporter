# Session 8 Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 8 blocos of issues in Crisis Reporter: i18n hardcoded strings, location name+coords, community map title/brightness, demo submit path, dashboard UI fixes, crisis settings modal, DEMO badge z-index, and test data cleanup.

**Architecture:** All fixes touch existing files only. No new components needed except the Crisis Settings modal (inline in DashboardScreen). Each bloco is independent; execute sequentially to avoid merge conflicts.

**Tech Stack:** React + TypeScript, i18next, Leaflet/react-leaflet, Supabase (anon RLS), Nominatim for reverse geocode, Netlify deploy.

**Branch:** `feature/session8-fixes`  
**Tag after merge:** `v0.6-session8`

---

## Pre-task: Create branch

- [ ] **Create branch**
```bash
git checkout -b feature/session8-fixes
```

---

## Task 1: BLOCO 1 — i18n hardcoded strings + landing copy

**Root cause:** LocationScreen line 368 hardcodes `"Confirm location →"` instead of `t("location.confirm")`. ReviewScreen line 275 hardcodes `"Submit report →"` instead of `t("review.submit")`. `review.submit` value in en.json is `"Submit →"` — needs updating to `"Submit report →"`. LandingPage subtitle needs copy change.

**Files:**
- Modify: `src/i18n/locales/en.json` (update `review.submit` value)
- Modify: `src/i18n/locales/es.json`, `fr.json`, `ar.json`, `zh.json`, `ru.json` (add/update `review.submit`)
- Modify: `src/screens/citizen/LocationScreen.tsx` (use t key)
- Modify: `src/screens/citizen/ReviewScreen.tsx` (use t key)
- Modify: `src/pages/LandingPage.tsx` (subtitle copy)

- [ ] **Step 1: Update en.json review.submit value**

In `src/i18n/locales/en.json`, change:
```json
"submit": "Submit →",
```
to:
```json
"submit": "Submit report →",
```

- [ ] **Step 2: Update review.submit in all other locales**

`src/i18n/locales/es.json` — find `"submit":` under `review` section and update:
```json
"submit": "Enviar reporte →",
```

`src/i18n/locales/fr.json`:
```json
"submit": "Soumettre le rapport →",
```

`src/i18n/locales/ar.json`:
```json
"submit": "إرسال التقرير →",
```

`src/i18n/locales/zh.json`:
```json
"submit": "提交报告 →",
```

`src/i18n/locales/ru.json`:
```json
"submit": "Отправить отчёт →",
```

- [ ] **Step 3: Fix LocationScreen hardcoded CTA**

In `src/screens/citizen/LocationScreen.tsx`, line 368, replace:
```tsx
            Confirm location →
```
with:
```tsx
            {t("location.confirm")}
```

- [ ] **Step 4: Fix ReviewScreen hardcoded CTA**

In `src/screens/citizen/ReviewScreen.tsx`, line 275, replace:
```tsx
            : "Submit report →"}
```
with:
```tsx
            : t("review.submit")}
```

- [ ] **Step 5: Update LandingPage subtitle**

In `src/pages/LandingPage.tsx`, replace:
```tsx
          Community-powered damage assessment
```
with:
```tsx
          Damage & crisis reporting
```

- [ ] **Step 6: Build check**
```bash
npm run build 2>&1 | tail -20
```
Expected: zero new TypeScript errors.

- [ ] **Step 7: Commit**
```bash
git add src/i18n/locales/ src/screens/citizen/LocationScreen.tsx src/screens/citizen/ReviewScreen.tsx src/pages/LandingPage.tsx
git commit -m "fix(i18n): use t() for Confirm/Submit CTAs; update review.submit copy; fix landing subtitle"
```

---

## Task 2: BLOCO 2 — Location: city name + coordinates

**Root cause:** LocationScreen shows name OR coords, never both. Live mode shows only coords; demo mode shows only city name. Nominatim reverse geocode needed for live mode. ReviewScreen also shows only coords.

**Files:**
- Modify: `src/types/observation.ts` (add `placeName?`)
- Modify: `src/screens/citizen/LocationScreen.tsx` (reverse geocode + show both)
- Modify: `src/App.tsx` (pass placeName through observationInput)
- Modify: `src/screens/citizen/ReviewScreen.tsx` (show name + coords)

- [ ] **Step 1: Add placeName to ObservationInput**

In `src/types/observation.ts`, after `address?: string;` add:
```typescript
  placeName?: string;
```

Also add `placeName?` to the `LocationResult` interface in `src/screens/citizen/LocationScreen.tsx`. After `buildingName?: string;`:
```typescript
  placeName?: string;
```

- [ ] **Step 2: Update LocationScreen — reverse geocode + show name+coords**

In `src/screens/citizen/LocationScreen.tsx`:

After `const [selectedBuilding, setSelectedBuilding] = useState...` line, add:
```tsx
  const [placeName, setPlaceName] = useState<string>(
    demoMode ? "Porto Alegre, Rio Grande do Sul" : ""
  );
```

Add a `reverseGeocode` function after the existing useEffect:
```tsx
  async function reverseGeocode(lat: number, lng: number) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12`,
        { headers: { "Accept-Language": "en" } }
      );
      const json = await res.json();
      const addr = json.address ?? {};
      const name = [addr.suburb ?? addr.neighbourhood ?? addr.town, addr.city ?? addr.municipality ?? addr.county]
        .filter(Boolean)
        .join(", ");
      if (name) setPlaceName(name);
    } catch {
      // fallback: coords only
    }
  }
```

In the geolocation success callback (inside `navigator.geolocation.getCurrentPosition`), after `setGpsStatus("ok")`, add:
```tsx
        reverseGeocode(lat, lng);
```

Update `handleConfirm` to include `placeName`:
```tsx
  function handleConfirm() {
    if (!pin) return;
    onConfirm({
      lat: pin.lat,
      lng: pin.lng,
      locationMethod: method,
      address: method === "address" ? address.trim() : undefined,
      buildingId: selectedBuilding?.id,
      buildingName: selectedBuilding?.name,
      placeName: demoMode ? "Porto Alegre, Rio Grande do Sul" : placeName || undefined,
    });
  }
```

Replace the location card JSX (the `{pin && (...)}` block) to show BOTH name and coords:
```tsx
        {pin && (
          <div
            style={{
              background: "var(--cr-surface)",
              borderRadius: 14,
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span
              style={{
                fontSize: 13,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--cr-label)",
              }}
            >
              {demoMode ? "DEMO LOCATION" : gpsStatus === "ok" ? "GPS" : "Manual"}
            </span>
            <span style={{ fontSize: 16, fontWeight: 700, color: "var(--cr-text)" }}>
              {demoMode ? "Porto Alegre, Rio Grande do Sul" : placeName || `${pin.lat.toFixed(5)}°, ${pin.lng.toFixed(5)}°`}
            </span>
            <span style={{ fontSize: 13, color: "var(--cr-label)" }}>
              {pin.lat.toFixed(5)}°, {pin.lng.toFixed(5)}°
            </span>
          </div>
        )}
```

- [ ] **Step 3: Pass placeName through App.tsx**

In `src/App.tsx`, in the `fullObservationInput` object, after `address: locationData.address,` add:
```tsx
          placeName: locationData.placeName,
```

In the `rapidObservationInput` object, after `address: locationData.address,` add:
```tsx
          placeName: locationData.placeName,
```

- [ ] **Step 4: Update ReviewScreen location row**

In `src/screens/citizen/ReviewScreen.tsx`, the location row currently shows:
```tsx
          value: `${data.lat.toFixed(3)}°, ${data.lng.toFixed(3)}°`,
          color: "var(--cr-label)",
          sub: data.address,
```

Replace with:
```tsx
          value: data.placeName ?? `${data.lat.toFixed(3)}°, ${data.lng.toFixed(3)}°`,
          color: "var(--cr-label)",
          sub: `${data.lat.toFixed(5)}°, ${data.lng.toFixed(5)}°`,
```

This shows the place name (or coords if no name) as the primary value, and coords as the sub-line.

- [ ] **Step 5: Build check**
```bash
npm run build 2>&1 | tail -20
```
Expected: zero new TS errors.

- [ ] **Step 6: Commit**
```bash
git add src/types/observation.ts src/screens/citizen/LocationScreen.tsx src/App.tsx src/screens/citizen/ReviewScreen.tsx
git commit -m "feat(location): show city name + coords in Step 2 and Review; Nominatim reverse geocode in live mode"
```

---

## Task 3: BLOCO 3 — Community Map title bar + brightness

**Root cause:** CommunityMapScreen shows generic "Community Crisis Map" header; no crisis name/location. TileLayer in CrisisMap uses CARTO dark_all with no opacity override — the map appears too dark.

**Files:**
- Modify: `src/screens/CommunityMapScreen.tsx` (add title bar, fetch crisis name in live mode)
- Modify: `src/components/map/CrisisMap.tsx` (TileLayer opacity 0.85)

- [ ] **Step 1: Add crisis name fetching to CommunityMapScreen**

In `src/screens/CommunityMapScreen.tsx`, add state for crisis title and fetch it:

After `const [loading, setLoading] = useState(true);`, add:
```tsx
  const [crisisTitle, setCrisisTitle] = useState<string>(
    isDemo ? "RS Floods 2024 · Porto Alegre, RS" : ""
  );
```

Add a useEffect to fetch crisis name in live mode:
```tsx
  useEffect(() => {
    if (isDemo) return;
    async function fetchCrisisTitle() {
      try {
        const { data } = await db
          .from("crises")
          .select("name, location")
          .eq("id", crisisId)
          .single() as { data: { name: string; location: string } | null };
        if (data) {
          setCrisisTitle([data.name, data.location].filter(Boolean).join(" · "));
        }
      } catch {
        // keep empty
      }
    }
    fetchCrisisTitle();
  }, [crisisId, isDemo]);
```

- [ ] **Step 2: Replace the header with crisis title bar**

Replace the existing header JSX in CommunityMapScreen:
```tsx
      {/* Header */}
      <div
        className="flex-none flex items-center gap-3 border-b border-border"
        style={{ padding: "14px 16px" }}
      >
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-text-muted active:opacity-70"
        >
          {t("common.back")}
        </button>
        <div className="flex-1 text-center">
          <p className="text-sm font-semibold text-text-primary">
            {t("community_map.title")}
          </p>
        </div>
        {/* Balance the back button */}
        <div style={{ width: 48 }} />
      </div>
```

with:
```tsx
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
          borderBottom: "1px solid var(--cr-border)",
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: "var(--cr-label)",
            fontSize: 14,
            cursor: "pointer",
            padding: "4px 0",
            flexShrink: 0,
          }}
        >
          {t("common.back")}
        </button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--cr-label)", fontWeight: 600, margin: 0 }}>
            {t("community_map.title")}
          </p>
          {crisisTitle && (
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--cr-text)", margin: "2px 0 0" }}>
              {crisisTitle}
            </p>
          )}
        </div>
        <div style={{ width: 40, flexShrink: 0 }} />
      </div>
```

- [ ] **Step 3: Increase TileLayer opacity in CrisisMap**

In `src/components/map/CrisisMap.tsx`, update the TileLayer:
```tsx
      <TileLayer
        url={TILE_URL}
        attribution={TILE_ATTRIBUTION}
        detectRetina
        maxZoom={20}
        opacity={0.85}
      />
```

- [ ] **Step 4: Build check**
```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 5: Commit**
```bash
git add src/screens/CommunityMapScreen.tsx src/components/map/CrisisMap.tsx
git commit -m "feat(map): community map title bar with crisis name; TileLayer opacity 0.85"
```

---

## Task 4: BLOCO 4 — Demo submit to Supabase

**Root cause:** `CRISIS_ID` fallback in App.tsx is `"c0000000-0000-0000-0000-000000000001"` — a placeholder that doesn't exist in the database. Foreign key violation causes submit to fail → catch → offline queue. Real demo crisis ID is `f58c928d-9fc7-4499-8987-f8f4f92924ed`.

**Files:**
- Modify: `src/App.tsx` (fix CRISIS_ID fallback)

- [ ] **Step 1: Fix CRISIS_ID fallback**

In `src/App.tsx`, replace:
```tsx
const CRISIS_ID = import.meta.env.VITE_DEMO_CRISIS_ID ?? "c0000000-0000-0000-0000-000000000001";
```
with:
```tsx
const CRISIS_ID = import.meta.env.VITE_DEMO_CRISIS_ID ?? "f58c928d-9fc7-4499-8987-f8f4f92924ed";
```

- [ ] **Step 2: Build check**
```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 3: Commit**
```bash
git add src/App.tsx
git commit -m "fix(demo): hardcode real crisis UUID as CRISIS_ID fallback so demo submits reach Supabase"
```

---

## Task 5: BLOCO 5 — Agent Dashboard fixes

**Root cause issues:**
1. Clusters/Heat toggle div is before `<MapContainer>` in DOM — Leaflet pane z-indexes can paint over it. Fix: move toggle div after `</MapContainer>`.
2. Export + Settings buttons in `display:flex` row — Export button text may truncate on narrow screens. Fix: `flexDirection: "column"`.
3. BottomNav in Dashboard: `onMap={undefined}` — map tab does nothing. Fix: add `onGoMap` prop.
4. Demo Mode toggle in Crisis Settings: remove completely.

**Files:**
- Modify: `src/screens/agent/DashboardScreen.tsx`
- Modify: `src/App.tsx` (pass `onGoMap` and `isDemo`)

- [ ] **Step 1: Move toggle div after MapContainer in mapArea**

In `src/screens/agent/DashboardScreen.tsx`, inside the `mapArea` const, the structure is:
```jsx
<div style={{ ... position: "relative" ... }}>
  {loading && <div>loading</div>}
  {/* Heat/Cluster toggle */}
  <div style={{ position: "absolute", bottom: 10, right: 10, zIndex: 1001, ... }}>...</div>
  <MapContainer ...>...</MapContainer>
</div>
```

Move the toggle div to AFTER `</MapContainer>` (but still inside the outer div):
```jsx
<div style={{ height: 220, borderRadius: 16, overflow: "hidden", position: "relative", flexShrink: 0 }}>
  {loading && (
    <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", zIndex: 1000, background: "var(--cr-surface)", border: "1px solid var(--cr-border)", borderRadius: 8, padding: "5px 12px", fontSize: 12, color: "var(--cr-label)" }}>
      {t("dashboard.loading")}
    </div>
  )}
  <MapContainer
    center={center}
    zoom={zoom}
    style={{ height: "100%", width: "100%" }}
    zoomControl={false}
  >
    <TileLayer
      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
      maxZoom={20}
    />
    {!loading && mapMode === "clusters" && (
      <ClusterLayer observations={filtered} onSelect={setSelectedObs} />
    )}
    {!loading && mapMode === "heatmap" && (
      <HeatmapLayer points={filtered} />
    )}
  </MapContainer>
  {/* Heat/Cluster toggle — after MapContainer so it stacks on top */}
  <div style={{ position: "absolute", bottom: 10, right: 10, zIndex: 1001, display: "flex", gap: 4 }}>
    {(["clusters", "heatmap"] as const).map((m) => (
      <button
        key={m}
        type="button"
        onClick={() => setMapMode(m)}
        style={{
          padding: "5px 10px",
          borderRadius: 8,
          border: `1px solid ${mapMode === m ? "var(--cr-primary)" : "var(--cr-border)"}`,
          background: mapMode === m ? "var(--cr-primary-dim)" : "rgba(0,0,0,0.6)",
          color: mapMode === m ? "var(--cr-primary)" : "var(--cr-label)",
          fontSize: 11,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {m === "clusters" ? "Clusters" : "Heat"}
      </button>
    ))}
  </div>
</div>
```

- [ ] **Step 2: Stack Export + Settings buttons vertically**

Find the `div` wrapping ExportButton + Settings button (around line 512):
```jsx
<div style={{ display: "flex", gap: 10 }}>
  <ExportButton ... />
  <button ... >Crisis settings</button>
</div>
```

Replace with:
```jsx
<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
  <ExportButton ... />
  <button ... >Crisis settings</button>
</div>
```

Also update the ExportButton's button style to use `width: "100%"` so it fills the container. In `src/components/agent/ExportButton.tsx`, the trigger button needs `width: "100%"` and `justifyContent: "center"`:
```tsx
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          width: "100%",
          padding: "7px 12px",
          minHeight: "var(--min-touch)",
          borderRadius: 14,
          border: "1px solid var(--cr-border)",
          background: open ? "var(--cr-surface2)" : "var(--cr-surface)",
          color: loading ? "var(--cr-label)" : "var(--cr-text)",
          fontSize: 14,
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          whiteSpace: "nowrap",
        }}
```

- [ ] **Step 3: Add `onGoMap` and `isDemo` to DashboardScreen props**

In `src/screens/agent/DashboardScreen.tsx`, update the Props interface:
```typescript
interface Props {
  crisisId?: string;
  center?: [number, number];
  zoom?: number;
  onGoHome?: () => void;
  onGoMap?: () => void;
  isDemo?: boolean;
}
```

Update the function signature to destructure `onGoMap` and `isDemo`:
```typescript
export default function DashboardScreen({
  crisisId = import.meta.env.VITE_DEMO_CRISIS_ID ?? "f58c928d-9fc7-4499-8987-f8f4f92924ed",
  center = [-30.029, -51.228],
  zoom = 13,
  onGoHome,
  onGoMap,
  isDemo = false,
}: Props) {
```

Update both BottomNav instances (mobile and desktop) from `onMap={undefined}` to `onMap={onGoMap}`.

- [ ] **Step 4: Remove Demo Mode toggle from Settings panel**

In `src/screens/agent/DashboardScreen.tsx`:
- Delete the `DEMO_MODE_KEY` constant
- Delete `toggleDemoMode` function  
- Delete the `demoMode` state and `setDemoMode`
- Remove `onDemoModeChange` from Props interface
- Remove the entire `{/* Demo mode toggle */}` section (the `<div>` containing "Demo Settings" heading and the toggle button)

- [ ] **Step 5: Wire props in App.tsx**

In `src/App.tsx`, update the DashboardScreen usage:
```tsx
  if (appMode === "agent") {
    return (
      <DashboardScreen
        onGoHome={() => setAppMode("index")}
        onGoMap={() => setAppMode("map")}
        isDemo={isDemo}
      />
    );
  }
```

- [ ] **Step 6: Build check**
```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 7: Commit**
```bash
git add src/screens/agent/DashboardScreen.tsx src/components/agent/ExportButton.tsx src/App.tsx
git commit -m "fix(dashboard): toggle inside map container, stacked export/settings, onGoMap wired, demo toggle removed"
```

---

## Task 6: BLOCO 6 — Crisis Settings full-screen modal

**Root cause:** Settings currently expand as an inline section in the scroll container. Spec requires a full-screen modal with X close button and outside-tap-to-close. In demo mode, disaster_type selector is visible but locked.

**Files:**
- Modify: `src/screens/agent/DashboardScreen.tsx`

- [ ] **Step 1: Replace inline settings with full-screen modal**

Remove the `{showSettings && <div ...>...</div>}` inline settings section from the `content` variable.

Add a `CrisisSettingsModal` component at the top of the file (before `export default`):

```tsx
function CrisisSettingsModal({
  onClose,
  disasterType,
  onDisasterTypeChange,
  isDemo,
}: {
  onClose: () => void;
  disasterType: DisasterType;
  onDisasterTypeChange: (t: DisasterType) => void;
  isDemo: boolean;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 5000,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      <div
        style={{
          width: "100%",
          maxHeight: "85dvh",
          background: "var(--cr-bg)",
          borderRadius: "24px 24px 0 0",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Modal header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 20px 16px",
            borderBottom: "1px solid var(--cr-border)",
          }}
        >
          <div>
            <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--cr-label)", fontWeight: 600, margin: 0 }}>
              Agent Dashboard
            </p>
            <p style={{ fontSize: 20, fontWeight: 700, color: "var(--cr-text)", margin: "4px 0 0" }}>
              Crisis Settings
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "1px solid var(--cr-border)",
              background: "var(--cr-surface)",
              color: "var(--cr-label)",
              fontSize: 18,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {/* Disaster Type */}
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--cr-label)", fontWeight: 700, marginBottom: 6 }}>
              Disaster Type
            </p>
            {isDemo && (
              <p style={{ fontSize: 12, color: "var(--cr-primary)", marginBottom: 12, opacity: 0.8 }}>
                🔒 Locked in demo mode
              </p>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(Object.keys(DISASTER_TYPE_LABELS) as DisasterType[]).map((type) => {
                const active = disasterType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => !isDemo && onDisasterTypeChange(type)}
                    disabled={isDemo}
                    style={{
                      padding: "10px 18px",
                      borderRadius: 24,
                      border: `1px solid ${active ? "var(--cr-primary)" : "var(--cr-border)"}`,
                      background: active ? "var(--cr-primary-dim)" : "var(--cr-surface)",
                      color: active ? "var(--cr-primary)" : isDemo ? "var(--cr-border)" : "var(--cr-label)",
                      fontSize: 14,
                      fontWeight: active ? 700 : 400,
                      cursor: isDemo ? "default" : "pointer",
                      minHeight: "var(--min-touch)",
                      transition: "all 0.15s",
                      opacity: isDemo && !active ? 0.5 : 1,
                    }}
                  >
                    {DISASTER_TYPE_LABELS[type]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

Note: this component uses `useRef` — add `useRef` to the import from React at the top of DashboardScreen:
```tsx
import { useEffect, useRef, useState } from "react";
```
(It's already imported — verify and keep as is.)

- [ ] **Step 2: Wire the modal into DashboardScreen render**

In DashboardScreen, after the `content` variable, render the modal conditionally. In the return statements (both mobile and desktop layouts), add before `</div>` at the top level:

```tsx
        {showSettings && (
          <CrisisSettingsModal
            onClose={() => setShowSettings(false)}
            disasterType={disasterType}
            onDisasterTypeChange={handleDisasterTypeChange}
            isDemo={isDemo}
          />
        )}
```

Place this in both the mobile return and the desktop return, just before the closing `</div>` of the outermost container.

- [ ] **Step 3: Build check**
```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 4: Commit**
```bash
git add src/screens/agent/DashboardScreen.tsx
git commit -m "feat(dashboard): Crisis Settings as full-screen modal, demo mode locks disaster type"
```

---

## Task 7: BLOCO 7 — DEMO badge z-index

**Root cause:** DEMO badge has `zIndex: 9999`. LanguageSelector `variant="fixed"` wrapper has `zIndex: 9999`. Both at same level; when dropdown opens (`zIndex: 10000`) the badge may overlap the trigger button, depending on DOM order and scroll. Fix: lower badge z-index to 9000 so it's always below the language selector.

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Lower DEMO badge z-index**

In `src/App.tsx`, in the DEMO badge inline style, change:
```tsx
            zIndex: 9999,
```
to:
```tsx
            zIndex: 9000,
```

- [ ] **Step 2: Build check**
```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 3: Commit**
```bash
git add src/App.tsx
git commit -m "fix(ui): lower DEMO badge z-index to 9000, below language dropdown"
```

---

## Task 8: BLOCO 8 — Clean test data from live DB

**This is a Supabase SQL operation, not a code change.**

- [ ] **Step 1: Run cleanup SQL in Supabase dashboard**

Go to Supabase project → SQL editor. Run:
```sql
DELETE FROM observations
WHERE crisis_id = 'f58c928d-9fc7-4499-8987-f8f4f92924ed'
AND is_demo = false
AND (
  infrastructure_name IS NULL
  OR infrastructure_name IN ('CURL TEST', 'Test building', 'Municipal Hall')
  OR latitude NOT BETWEEN -30.10 AND -29.90
  OR longitude NOT BETWEEN -51.35 AND -51.10
);
```

Verify: `SELECT COUNT(*) FROM observations WHERE crisis_id = 'f58c928d-9fc7-4499-8987-f8f4f92924ed' AND is_demo = false;` — should return only real observations within Porto Alegre bounds.

---

## Task 9: Build + Deploy

- [ ] **Step 1: Full build**
```bash
npm run build 2>&1 | tail -30
```
Expected: zero TS errors, dist/ produced.

- [ ] **Step 2: Deploy to Netlify**
```bash
netlify deploy --prod --dir=dist --site=120f1e72-45ec-4cbe-bf71-83f4a45b7a97
```

- [ ] **Step 3: Smoke test checklist**
After deploy, verify on the Netlify URL:
- [ ] Landing page shows "Damage & crisis reporting" subtitle
- [ ] `/demo`: DEMO badge visible, below language dropdown
- [ ] `/demo` → Step 2: shows "Porto Alegre, Rio Grande do Sul" + coords
- [ ] `/demo` → Step 2: "Confirm location" button text is in active language
- [ ] `/demo` → Review: shows place name + coords in location row
- [ ] `/demo` → Review: "Submit report" button text is in active language
- [ ] `/demo` → Submit: observation appears in Supabase with is_demo=true
- [ ] `/app` → Step 2 (live GPS): shows Nominatim city name + coords
- [ ] Community Map: shows "RS Floods 2024 · Porto Alegre, RS" title bar in demo
- [ ] Community Map: map tiles brighter (opacity 0.85)
- [ ] Agent Dashboard → Clusters/Heat toggle: inside map container
- [ ] Agent Dashboard → Export button: full width, not truncated
- [ ] Agent Dashboard → Map tab in BottomNav: navigates to Community Map
- [ ] Agent Dashboard → Crisis Settings: opens as full-screen modal
- [ ] Agent Dashboard (demo): Crisis Settings → Flood locked, selector visible but disabled
- [ ] Agent Dashboard (live): Crisis Settings → disaster type editable

- [ ] **Step 4: Merge and tag**
```bash
git checkout main
git merge feature/session8-fixes --no-ff
git tag v0.6-session8
git push origin main --tags
```

---

## Task 10: Update PROGRESS.md

- [ ] **Step 1: Add v0.6-session8 entry**

Add to `PROGRESS.md`:

```markdown
## v0.6-session8 (2026-06-03)
- Default language forced to English (localStorage or "en" — no browser detection)
- All CTAs translated: "Confirm location →" and "Submit report →" use t() keys in all 6 languages
- LandingPage subtitle: "Damage & crisis reporting"
- Step 2 (Location): shows city/neighborhood name + coordinates in both modes
  - Demo: "Porto Alegre, Rio Grande do Sul" hardcoded
  - Live: Nominatim reverse geocode; fallback to coords if request fails
- Review (Step 4): shows place name + coords (not coords only)
- Community Map: title bar shows crisis name + location
  - Demo: "RS Floods 2024 · Porto Alegre, RS"
  - Live: fetched from crises table (name + location)
- Map brightness: TileLayer opacity 0.85 (was 1.0 with dark CARTO tiles = too dark)
- Demo submit: CRISIS_ID fallback is now the real crisis UUID; demo submissions reach Supabase with is_demo=true
- Dashboard - Clusters/Heat toggle: moved after MapContainer in DOM for correct z-stacking
- Dashboard - Export button: full-width, stacked above Settings (no truncation)
- Dashboard - BottomNav Map tab: wired to navigate to Community Map
- Dashboard - Demo Mode toggle: removed from both /demo and /app
- Dashboard - Crisis Settings: converted to full-screen modal with X + outside-tap-to-close
  - Disaster type selector: locked (Flood) in demo, editable in live
- DEMO badge z-index: 9000 (below language dropdown at 9999+)
- Live DB: dirty test observations deleted (CURL TEST, out-of-bounds coords)
- Zero new TS errors
```

- [ ] **Step 2: Commit PROGRESS.md**
```bash
git add PROGRESS.md
git commit -m "docs: update PROGRESS.md for v0.6-session8"
```

---

## Done criteria checklist

| Criterion | Task |
|---|---|
| Default language is English | 1 |
| All buttons translated in active language | 1 |
| Step 2 shows name + coords in both modes | 2 |
| Community Map has title bar | 3 |
| Map brightness readable (opacity 0.85) | 3 |
| Demo submits to Supabase with is_demo=true | 4 |
| Clusters button inside map container | 5 |
| Export links not truncated | 5 |
| Crisis map link (BottomNav Map) works | 5 |
| Demo Mode toggle gone from both modes | 5 |
| Crisis Settings opens as full-screen modal | 6 |
| Flood locked in demo, editable in live | 6 |
| DEMO badge z-index below language dropdown | 7 |
| Dirty test data removed from live DB | 8 |
| Zero new TS errors | 1–7 |
