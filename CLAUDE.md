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
