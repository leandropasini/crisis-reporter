# Crisis Reporter — Session Progress

## Last updated: 2026-06-04

---

## v0.18 — Crisis Setup Screen ✅ CONCLUÍDO
**Branch:** `feature/crisis-setup`
**Tag:** `v0.18-crisis-setup`

### O que foi feito
- **DB Migration 008**: `landslide` + `drought` added to `crisis_subtype` enum; `description TEXT` column added to `crises`; `crises_insert_anon` RLS policy added
- **CrisisSetupScreen**: full-screen form for live mode — GPS reverse geocode via Nominatim, crisis name/description/nature/city/coordinates/start date, orange "Activate Crisis" CTA
- **App.tsx**: `liveCrisisId` state replaces hardcoded `CRISIS_ID` in live mode; crisis check on mount; `CrisisSetupScreen` gate before dashboard; `effectiveCrisisId` propagated to DashboardScreen, CommunityMapScreen, and observation inputs

### Done criteria
| Criterion | Status |
|---|---|
| Crisis Setup screen appears on first load of Live mode with no active crisis | ✅ |
| GPS auto-fills city and coordinates | ✅ |
| Agent can edit city name | ✅ |
| Coordinates are read-only | ✅ |
| Start date shows today, read-only | ✅ |
| "Activate Crisis" disabled until name, description, and nature filled | ✅ |
| On submit, new row created in Supabase crises table | ✅ |
| Agent Dashboard loads with the new crisis data | ✅ |
| Screen does not appear if active crisis already exists | ✅ |
| Zero new TS errors | ✅ |

---

## v0.17 — PWA Fullscreen Fix ✅ CONCLUÍDO
**Branch:** `feature/pwa-fullscreen`
**Tag:** `v0.17-pwa-fullscreen`

### Fix
- **PWA fullscreen on iOS**: suppress browser navigation chrome when app is added to home screen
  - `index.html`: added `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style: black-translucent`, `mobile-web-app-capable`
  - `src/index.css`: `html, body, #root` now include `min-height: 100dvh` and `overscroll-behavior: none`
  - `src/components/BottomNav.tsx`: nav gets `paddingBottom: env(safe-area-inset-bottom)` for home indicator clearance
  - `public/manifest.json`: `display: standalone` confirmed — no change needed

### Done criteria
| Criterion | Status |
|---|---|
| App fills full screen when launched from iOS home screen | ✅ |
| Status bar uses black-translucent (content under bar) | ✅ |
| Bottom nav clears iPhone home indicator | ✅ |
| Overscroll bounce suppressed | ✅ |
| Zero new TS errors | ✅ |

---

## v0.16 — Session 10 r4 Fixes ✅ CONCLUÍDO
**Branch:** `feature/session10-r4`
**Tag:** `v0.16-session10-fixes`

### Fixes
- **DEMO badge (final)**: vertical pill on far-left of BottomNav — `position:absolute, left:4px, top:50%, transform:translateY(-50%) rotate(-90deg)` — nav gets `position:relative`; inline badge beside Home label removed
- **Map tiles — all viewports**: replaced CARTO Dark Matter with OSM standard (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`) in `CrisisMap.tsx` (community map) and `DashboardScreen.tsx` sidebar mini-map; also removed `opacity:0.9` from all TileLayers for full brightness

### Done criteria
| Criterion | Status |
|---|---|
| DEMO badge vertical on left edge of bottom nav | ✅ |
| Map readable on iPhone Safari/Chrome and Chrome macOS | ✅ |
| No dark/low-contrast tiles at any viewport | ✅ |
| Zero new TS errors | ✅ |

---

## v0.15 — Session 10 r3 Fixes ✅ CONCLUÍDO
**Branch:** `feature/session10-r3`
**Tag:** `v0.15-session10-fixes`

### Fixes
- **DEMO badge desktop**: re-added `position:fixed` badge to App.tsx for `window.innerWidth >= 768` — desktop has no BottomNav, badge was invisible after r2 move. Mobile still gets it via BottomNav
- **Education button clipped**: filter row `overflowX:auto` → `flexWrap:wrap` — 4 buttons total ~381px but sidebar inner width is 320px; last button was cut by sidebar edge

---

## v0.14 — Session 10 r2 Fixes ✅ CONCLUÍDO
**Branch:** `feature/session10-r2`
**Tag:** `v0.14-session10-fixes`

### Fixes
- **ObservationDetail opacity (final)**: `zIndex: 1000` (up from 300, above all Leaflet panes at max 700) + `isolation: "isolate"` — panel renders above escaped Leaflet panes that previously sat at z-index 400–700 above the panel
- **DEMO badge in BottomNav**: removed `position:fixed` badge from App.tsx; BottomNav now reads `window.location.pathname.startsWith("/demo")` internally and renders an inline orange DEMO tag beside the "Home" label when on `/demo` route — no prop drilling, no overlap

### Done criteria
| Criterion | Status |
|---|---|
| Detail panel fully opaque — map not visible behind it | ✅ |
| DEMO badge inline beside Home in bottom nav, no overlap | ✅ |
| Click handlers intact — iPhone and Chrome macOS | ✅ |
| Zero new TS errors | ✅ |

---

## v0.13 — Session 10 Fixes ✅ CONCLUÍDO
**Branch:** `feature/session10-fixes`
**Tag:** `v0.13-session10-fixes`

### Fixes
- **DEMO badge**: `bottom: 72, left: 8` — clears bottom nav bar on iPhone (was `bottom: 16, left: 16`)
- **ObservationDetail hole**: added explicit `background: var(--color-surface)` to content div — panel fully opaque regardless of parent background propagation
- **Chrome macOS click issue**: Leaflet's z-indexed panes (overlay/marker, z-index 400–700) escape the sidebar mini-map's `overflow: hidden` container on Chrome desktop, eating clicks on the main map and list items. Fix: `pointer-events: none` on the mini-map inner wrapper when `!isMobile` — mobile behavior unchanged, main map and list buttons respond on Chrome macOS

### Done criteria
| Criterion | Status |
|---|---|
| DEMO badge visible above bottom nav — no overlap | ✅ |
| Detail panel fully opaque — no empty sections | ✅ |
| List item click on Chrome macOS opens detail | ✅ |
| Map marker click on Chrome macOS opens detail | ✅ |
| iPhone Safari / Chrome behavior unchanged | ✅ |
| Zero new TS errors | ✅ |

---

## Bloco 2 — Três Modos de Crise ✅ CONCLUÍDO
**Branch:** `feature/three-modes`
**Commit:** `Feature: three crisis modes, operator override, adaptive flow`

### O que foi feito
- `CrisisMode` type adicionado ao schema (`rapid` / `full` / `contextual`)
- `CrisisModeContext` com localStorage persistence e `MODE_META` (label + totalSteps)
- `RapidClassificationScreen`: Step 3 do Mode 1 — damage level em 3 botões full-width empilhados + infra type em grid de ícones (label aparece ao selecionar)
- `App.tsx` refatorado: `CrisisModeProvider` envolve app, fluxo branchia por modo
  - **rapid**: camera → location → rapid-classification → review (3 steps)
  - **full**: camera → location → classification → details → review (5 steps)
  - **contextual**: igual ao full + campos modulares habilitados (5 steps)
- `DashboardScreen`: painel de seletor de modo acima do FilterPanel, persistência localStorage
- Todas as citizen screens aceitam props `modeLabel`/`totalSteps` para header adaptativo
- `ObservationInput`: campos opcionais para suportar rapid mode sem details step
- i18n: `dashboard.report_mode` adicionado nos 6 idiomas

---

## Bloco 3+4 — Contraste, Legibilidade e Toque ✅ CONCLUÍDO
**Branch:** `feature/ui-contrast`
**Commit:** `UI: contrast WCAG AA, touch targets 48px, typography scale`

### O que foi feito
- Todos os botões Back: outline style, `--color-label`, min 48px × 120px
- Todos os botões Next/Submit: `--color-primary` fill, min 48px × 120px
- Todas as `SectionLabel`: `--color-label` + `--font-label` (14px)
- `SummaryRow` (ReviewScreen): label em `--color-label`, valor em `--color-value` + `--font-value`
- Crisis type chips: min 48px altura (era py-1.5 ≈ 20px), `--color-value` para não selecionado
- Infra type chips: min 48px, padding 12px, `--color-primary` quando selecionado
- Debris / single-select: min 48px, `--color-primary`
- Multi-select (pressing needs): min 48px, `--color-value` não selecionado
- `color-mix` backgrounds: sempre sobre `surface-2` (sem `transparent`)

---

## Bloco 5 — Responsividade e Dashboard ✅ CONCLUÍDO
**Branch:** `feature/dashboard-mobile`
**Commit:** `Dashboard: mobile responsive, urgency gradient, animated markers`

### O que foi feito
- **Mobile (< 768px)**: mapa tela cheia, acordeão colapsável de filtros acima do mapa, botão FAB "Filters" flutuante (min 48px, acessível sem scroll)
- **Desktop**: sidebar inalterada (mode selector + FilterPanel)
- **Gradação de urgência**:
  - `complete`: marcador vermelho com anel de pulso animado (CSS `@keyframes`, sem biblioteca externa)
  - `partial`: marcador âmbar estático
  - `minimal`: marcador verde com opacity 0.7
- Classe CSS `damage-{level}` no wrapper DivIcon habilita opacity/animation por nível
- i18n: `filters_open` / `filters_close` adicionados nos 6 idiomas

---

## Status dos Critérios de Done

| Critério | Status |
|---|---|
| Tag v0.1-pre-uxui criada antes de qualquer alteração | ✅ |
| Submit funciona end-to-end | ✅ (Blocos 0+1) |
| Reporte aparece no mapa | ✅ (Blocos 0+1) |
| Feedback diferido ativo | ✅ (Blocos 0+1) |
| Três modos implementados e selecionáveis | ✅ (Bloco 2) |
| Mode 1 em 3 steps demonstrável | ✅ (Bloco 2) |
| Zero texto com contraste abaixo 4.5:1 | ✅ (Bloco 3+4) |
| Todos os tocáveis min 48×48px | ✅ (Bloco 3+4) |
| Dashboard utilizável em mobile | ✅ (Bloco 5) |
| Zero TS errors novos | ✅ (tsc --noEmit passa limpo em todos os blocos) |
| Blocos em branches separadas | ✅ |
| CLAUDE.md atualizado | ⚠️ Pendente |

---

---

## v0.3 — Design Approved ✅ CONCLUÍDO
**Branch:** `feature/design-approved`
**Tag:** `v0.3-design-approved`

### O que foi feito
- **Design tokens v0.3**: `--cr-*` variables em `:root` (global.css / index.css)
- **Tabler Icons** webfont via CDN em index.html
- **IndexScreen**: badge "Active crisis" animado, cidade 38px, 3 cards uniformes com Tabler icons + chevron
- **CameraScreen**: progress bar 3px, viewfinder quadrado com cantos em primary, botões full-width
- **LocationScreen**: mapa 300px com border-radius, card de localização GPS, privacy note com ícone
- **RapidClassificationScreen**: **4 níveis de dano** (Minimal/Partial/Severe/Complete) com dot colorido + descrição, grid 4x2 de infra com labels sempre visíveis
- **ReviewScreen**: foto 4:3, summary card com 3 linhas separadas por border 0.5px
- **ConfirmationScreen**: checkmark 72px, Community Impact View com grid 3 colunas
- **DashboardScreen**: header com badge "Live", 3 metric cards, mapa 220px, quick filter pills, lista de críticos
- **BottomNav**: novo componente compartilhado (Home, Report, Map)
- **LanguageSelector**: suporte a variant="inline" para headers de tela
- **Seed data**: 8 reportes em Porto Alegre (Humaitá, Sarandi, Navegantes, Anchieta) inseridos no Supabase
- Zero TS errors novos (10 pré-existentes mantidos: FilterPanel + ClusterLayer + DEMO_OBSERVATIONS)

### Critérios de Done
| Critério | Status |
|---|---|
| IndexScreen com 3 cards + badge | ✅ |
| Fluxo Mode 1 completo em < 30s | ✅ |
| 4 níveis de dano com descrição (Minimal/Partial/Severe/Complete) | ✅ |
| 8 categorias de infra com ícones + labels | ✅ |
| Confirmação com Community Impact View | ✅ |
| Dashboard com métricas, mapa, filtros, lista | ✅ |
| Seed data em Porto Alegre | ✅ (8 rows) |
| Zero TS errors novos | ✅ |
| PROGRESS.md atualizado | ✅ |
| Branch mergeada + tag | ✅ |

---

## v0.3 patch — Severe damage level + submit fix ✅ CONCLUÍDO
**Branch:** `feature/design-approved` (2026-06-01)
**Tag:** `v0.3-design-approved` (retagged)

### O que foi feito
- **Submit fix**: removido `navigator.onLine` gate que bloqueava submit em mobile (iOS Safari / Android WebView)
- **schema.ts**: `DamageLevel.SEVERE = "severe"` adicionado entre PARTIAL e COMPLETE
- **RapidClassificationScreen**: 4º nível de dano — Severe (#F59E0B) "Collapsed walls, unsafe to enter"
- **ReviewScreen + DashboardScreen**: `DAMAGE_COLORS` atualizado com `severe: "#F59E0B"`
- **DashboardScreen**: `criticalCount`, `criticalList`, `applyQuickFilter`, `isCrit` incluem "severe"
- **i18n**: `damage_severe` adicionado em EN/ES/FR/AR/ZH/RU (4 seções cada)
- Zero TS errors (npx tsc --noEmit limpo)

## v0.4-landing (2026-06-02)
- Landing page at `/` with Demo card (IconPlayerPlay) and Live card (IconDeviceMobile)
- `/demo`: GPS locked to Porto Alegre (-30.029, -51.228), is_demo=true filter on community map, DEMO badge overlay
- `/app`: real GPS, is_demo=false filter, clean experience without badge
- React Router v6 added; BrowserRouter routes wired in main.tsx
- `is_demo` flag propagated through ObservationInput → ObservationInsert → Supabase
- Desktop: cards side-by-side via `.landing-cards` media query
- Zero new TS errors

## v0.7-session8-r2 (2026-06-03)
**Branch:** `feature/session8-fixes` → main  
**Tag:** `v0.7-session8-r2`

- Language: `initImmediate` removed (dropped in i18next v26); `lng: "en"` hardcoded; init always synchronous with bundled resources
- Map brightness: all 3 TileLayers at opacity={0.9} (CrisisMap + 2 in DashboardScreen)
- ExportButton: fixed-position dropdown using `getBoundingClientRect()` — escapes scroll containers, no longer pushes content
- Dashboard clusters toggle: outer map wrapper has no `overflow:hidden`; toggle absolutely positioned on outer wrapper, not clipped by inner border-radius div
- LanguageSelector inline variant: `zIndex: 10001` clears DEMO badge
- Demo submit: `console.log` before Supabase insert shows full payload in DevTools
- DashboardScreen: `disasterType` defaults to `"flood"` when `isDemo=true`; `fetchCrisisConfig` skipped in demo
- LandingPage buttons: `outline: "none"` removes browser default focus ring
- Zero new TS errors

---

## v0.6-session8 (2026-06-03)
**Branch:** `feature/session8-fixes` → main  
**Tag:** `v0.6-session8`

- Default language forced to English (localStorage or "en" — no browser locale detection)
- All CTAs translated: "Confirm location →" and "Submit report →" use `t()` keys in all 6 languages
- LandingPage subtitle: "Damage & crisis reporting"
- Step 2 (Location): shows city/neighborhood name + coordinates in both modes
  - Demo: "Porto Alegre, Rio Grande do Sul" hardcoded + fixed coords
  - Live: Nominatim reverse geocode; fallback to coords if request fails
- Review (Step 4): shows place name as primary + coords as sub-line
- Community Map: title bar shows crisis name + location
  - Demo: "RS Floods 2024 · Porto Alegre, RS"
  - Live: fetched from crises table (name · location)
- Map brightness: TileLayer opacity 0.85 (CARTO dark tiles were too dark)
- Demo submit: CRISIS_ID fallback is now real crisis UUID `f58c928d-...`; demo submissions reach Supabase with is_demo=true
- Dashboard — Clusters/Heat toggle: moved after MapContainer in DOM for correct z-stacking
- Dashboard — Export button: full-width, stacked above Settings (no text truncation)
- Dashboard — BottomNav Map tab: wired to navigate to Community Map
- Dashboard — Demo Mode toggle: removed from both /demo and /app
- Dashboard — Crisis Settings: full-screen bottom-sheet modal with X + outside-tap-to-close
  - Disaster type selector: locked (Flood) in demo, editable in live
- DEMO badge z-index: 9000 (below language dropdown at 9999+)
- Live DB: dirty test observations deleted (see BLOCO 8 SQL)
- Zero new TS errors

---

## v0.11-session9-r4 (2026-06-03)
**Branch:** `feature/session9-fixes` → main
**Tag:** `v0.11-session9-r4`

- **Fix 1**: submit.ts — DAMAGE_LEVEL_MAP maps disaster-specific keys (flood_partial, eq_hairline, etc.) to valid DB text values; insertData uses `mappedDamageLevel` instead of raw `input.damageLevel`
- **Fix 2**: ObservationDetail — `background: "var(--color-surface)"` (solid); was `var(--color-surface-1)` which leaked map through panel
- **Fix 3**: ExportButton — 50ms setTimeout between GeoJSON and CSV downloads; browser blocked simultaneous programmatic downloads
- **Migration 007**: `update_area_stats()` trigger function now `SECURITY DEFINER` — anon trigger was blocked by `area_stats_write_service` RLS requiring `service_role`, causing full transaction rollback and submit falling to local queue
- Zero new TS errors

---

## v0.10-session9-r3 (2026-06-03)
**Branch:** `feature/session9-fixes` → main  
**Tag:** `v0.10-session9-r3`

- **Fix 1**: ObservationDetail — photo/img removed entirely; plain close-button header only
- **Fix 2**: submit.ts — LOG1 (entry: mode + crisis UUID), LOG2 (full payload), LOG3 (Supabase response), LOG4 (branch taken); no isDemo guard blocks DB insert in either mode
- **Fix 3**: ExportButton — single Export click downloads `crisis-reporter-porto-alegre.geojson` + `.csv` simultaneously; hardcoded Porto Alegre demo data; `exported_at` uses `new Date().toISOString()`
- **Fix 4**: DEMO badge moved to `bottom: 16, left: 16` (bottom-left), `zIndex: 50`; no longer overlaps language selector
- **Fix 5**: Dashboard content div removes `overflowY: auto`; critical list gets `maxHeight: 260, overflowY: auto` for internal scroll only
- **Fix 6**: Dashboard headers use `crisisTitle` state (demo = "RS Floods 2024 · Porto Alegre", live = fetched from DB or "Active Crisis")
- **Fix 7**: CommunityMapScreen defaults `crisisTitle` to "Community Crisis Map" in live mode
- Zero new TS errors

---

## v0.9-session9 (2026-06-03)
**Branch:** `feature/session9-fixes` → main  
**Tag:** `v0.9-session9`

### Fixes
- **Fix 1 (CRITICAL)**: Demo submit non-fatal photo upload — inner try-catch around `uploadPhoto` in `submit.ts`; DB insert proceeds with empty `photo_url` even if Storage RLS blocks upload
- **Fix 2**: Z-index hierarchy corrected — map:1, toggle:100, language:200, detail:300; DashboardScreen toggle at 100, ObservationDetail at 300
- **Fix 3**: All TileLayers `opacity={0.9}`, removed CSS brightness/contrast filters and dark overlays
- **Fix 4**: Observation images — `onError` hides broken image placeholder by hiding parent element
- **Fix 5**: DEMO badge `zIndex: 50` (below language selector at 200)
- **Fix 6**: Landing page "Try the app" button — `boxShadow: "none"` removes focus ring

### Features
- **Disaster category + severity selectors** (Step 3 citizen flow): `DISASTER_CATEGORY_OPTIONS` per disaster type; non-generic shows category picker + severity selector; generic shows only 4 severity options; i18n in all 6 locales (35 `cat_*` keys per locale + `severity_*` + `category_section` + `validation_hint_generic`)
- **DemoWelcomeScreen**: full-screen overlay on first `/demo` load with Agent View + Citizen View role cards + 3-step sequence; `sessionStorage` gate (`demo_welcome_seen`); wired in App.tsx before index

### Done criteria
- Zero new TS errors (`npm run build` clean)
- Deployed to Netlify production
- Merged `feature/session9-fixes` → main, tagged `v0.9-session9`

---

## v0.5-disaster-types (2026-06-02)
- Disaster-contextual damage options in Step 3 (citizen flow)
- 7 disaster types: flood (5 opts), earthquake (5), hurricane (5), landslide (4), fire (4), drought (4), generic (4)
- DEMO mode hardcodes flood; LIVE mode fetches disaster_type from DB on mount
- Agent Dashboard: disaster type selector in Crisis Settings (7 pill buttons, updates DB)
- DB migration 006: damage_level enum → text, is_demo column, disaster_type on crises, anon UPDATE RLS
- getDisplayLevel() maps any stored value back to DamageLevel color bucket for map pins
- ReviewScreen uses damageLevelLabel for display; falls back to i18n key for legacy values
- Zero new TS errors

---

## Claude Code Workflows

### Patterns to use for Crisis Reporter

**Deep verification (use before video recording)**
Verify every claim in the proposal against the actual codebase.
One subagent per claim. Adversarial verifier for each.
Prompt: "Use a workflow to verify every claim in the proposal
against the actual codebase. One subagent per claim.
Adversarial verifier for each. Flag anything the code
doesn't actually deliver yet."

**Fan-out-and-synthesize (use for large feature blocks)**
Split task into smaller steps, one subagent per step,
synthesize results. Use when implementing multiple
independent features in parallel (e.g. all 6 disaster types).

**Adversarial verification (use for UX/UI changes)**
One subagent implements, a separate subagent tries to break it.
Prevents the "declared done without testing" failure mode
that happened in the UX/UI sessions.

**Loop until done (use for bug hunts)**
Spawn agents until stop condition is met (zero errors,
zero TS errors). Don't use fixed number of passes.

### When NOT to use workflows
- Regular focused tasks (disaster types, single bug fixes)
- When token budget is tight near deadline
- Tasks already well-defined with clear done criteria

### Trigger words
- "Use a workflow" — explicit
- "ultracode" — forces workflow creation
- "quick workflow" — lightweight adversarial review
