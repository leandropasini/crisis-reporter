# Crisis Reporter — Dev Guidelines

## Global Style Rules

- Never hard-code style variables. Always import/reference from `src/index.css` `@theme` block.
- Minimum touch target: 48×48px for all interactive elements.
- Minimum contrast ratio: 4.5:1 for all text (WCAG AA).

## Branch Strategy

- Never commit directly to main.
- Each feature block gets its own branch: `feature/[name]`.
- Merge only after confirming zero new TS errors (`npm run build` passes).

## CSS Variable Naming (index.css @theme)

| Token | Purpose |
|---|---|
| `--color-label` | Field labels, secondary text |
| `--color-value` | Primary values, selected options |
| `--color-primary` | Brand accent (amber/orange) |
| `--color-surface` | Page/screen backgrounds |
| `--color-critical` | Damage complete (red) |
| `--color-warning` | Damage partial (amber) |
| `--color-minimal` | Damage minimal (green) |
| `--min-touch` | 48px minimum interactive area |
| `--font-label` | 14px — label font size |
| `--font-value` | 16px — value/option font size |

## GLOBAL RULE — TWO MODES

Every feature, behavior, and fix must be implemented considering 
both system modes:

DEMO (/demo):
- Data locked to Porto Alegre RS Floods 2024
- Settings hardcoded (do not depend on database)
- GPS disabled, fixed coordinates: -30.029, -51.228
- disaster_type fixed: flood
- Community Map filters: is_demo = true
- DEMO badge visible on all screens
- Purpose: submission video, immersive narrative

LIVE (/app):
- Real device GPS
- All settings read from database
- disaster_type as configured by operator
- Community Map filters: is_demo = false
- No badge, clean experience
- Purpose: evaluator tests the real system

Before implementing any feature, explicitly define 
the behavior in both modes.
