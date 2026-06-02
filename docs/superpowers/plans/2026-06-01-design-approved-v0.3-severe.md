# Design Approved v0.3 — Severe Damage Level + Submit Fix

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add "Severe" as a 4th damage level throughout the app, merge the submit-offline fix, and ship as feature/design-approved merged to main with tag v0.3-design-approved.

**Architecture:** v0.3 design is already in main. The previous execution missed one spec item: 4 damage levels (Minimal/Partial/Severe/Complete). The submit fix is staged on fix/submit-offline-gate. Both land together in feature/design-approved.

**Tech Stack:** React/TypeScript, Vite, i18next (6 UN languages), Supabase

---

## File Map

| File | Change |
|---|---|
| `src/types/schema.ts` | Add `SEVERE: "severe"` to DamageLevel |
| `src/screens/citizen/RapidClassificationScreen.tsx` | Add 4th DAMAGE_OPTION (Severe) |
| `src/screens/citizen/ReviewScreen.tsx` | Add `severe` to DAMAGE_COLORS |
| `src/screens/agent/DashboardScreen.tsx` | Add `severe` to DAMAGE_COLORS, update criticalCount/criticalList |
| `src/i18n/locales/en.json` | Add `damage_severe` in 4 sections |
| `src/i18n/locales/es.json` | Same |
| `src/i18n/locales/fr.json` | Same |
| `src/i18n/locales/ar.json` | Same |
| `src/i18n/locales/zh.json` | Same |
| `src/i18n/locales/ru.json` | Same |
| `PROGRESS.md` | Update status |

---

## Task 1: Git setup — commit submit fix, create feature branch

**Files:** git operations only

- [ ] **Step 1: Commit the submit fix on fix/submit-offline-gate**

```bash
git add src/services/submit.ts
git commit -m "fix: remove navigator.onLine gate that blocked submit on mobile"
```

- [ ] **Step 2: Create feature/design-approved from current branch**

```bash
# Branch already exists (was merged). Delete old one, create fresh from here.
git branch -D feature/design-approved 2>/dev/null || true
git checkout -b feature/design-approved
```

- [ ] **Step 3: Verify we're on feature/design-approved with submit fix included**

```bash
git log --oneline -3
# Should show: fix commit + previous main commits
```

---

## Task 2: Add "severe" to schema.ts

**Files:**
- Modify: `src/types/schema.ts:10-15`

- [ ] **Step 1: Update DamageLevel**

Replace:
```typescript
export const DamageLevel = {
  MINIMAL:  "minimal",
  PARTIAL:  "partial",
  COMPLETE: "complete",
} as const;
```

With:
```typescript
export const DamageLevel = {
  MINIMAL:  "minimal",
  PARTIAL:  "partial",
  SEVERE:   "severe",
  COMPLETE: "complete",
} as const;
```

- [ ] **Step 2: Run tsc to verify no breakage**

```bash
npx tsc --noEmit 2>&1 | head -20
# Expected: same pre-existing errors, no new ones
```

---

## Task 3: Add Severe to RapidClassificationScreen

**Files:**
- Modify: `src/screens/citizen/RapidClassificationScreen.tsx:27-36`

- [ ] **Step 1: Update DAMAGE_OPTIONS array**

Replace:
```typescript
const DAMAGE_OPTIONS: {
  value: DamageLevel;
  label: string;
  desc: string;
  color: string;
}[] = [
  { value: "minimal",  label: "Minimal",  desc: "Cracks in plaster, broken windows",    color: "#22C55E" },
  { value: "partial",  label: "Partial",  desc: "Large wall cracks, partial roof loss",  color: "#E8823A" },
  { value: "complete", label: "Complete", desc: "Complete collapse, rubble only",         color: "#EF4444" },
];
```

With:
```typescript
const DAMAGE_OPTIONS: {
  value: DamageLevel;
  label: string;
  desc: string;
  color: string;
}[] = [
  { value: "minimal",  label: "Minimal",  desc: "Cracks in plaster, broken windows",    color: "#22C55E" },
  { value: "partial",  label: "Partial",  desc: "Large wall cracks, partial roof loss",  color: "#E8823A" },
  { value: "severe",   label: "Severe",   desc: "Collapsed walls, unsafe to enter",      color: "#F59E0B" },
  { value: "complete", label: "Complete", desc: "Complete collapse, rubble only",         color: "#EF4444" },
];
```

---

## Task 4: Update DAMAGE_COLORS in ReviewScreen and DashboardScreen

**Files:**
- Modify: `src/screens/citizen/ReviewScreen.tsx:28-32`
- Modify: `src/screens/agent/DashboardScreen.tsx:103-107`

- [ ] **Step 1: ReviewScreen DAMAGE_COLORS**

Replace:
```typescript
const DAMAGE_COLORS: Record<string, string> = {
  minimal:  "#22C55E",
  partial:  "#E8823A",
  complete: "#EF4444",
};
```

With:
```typescript
const DAMAGE_COLORS: Record<string, string> = {
  minimal:  "#22C55E",
  partial:  "#E8823A",
  severe:   "#F59E0B",
  complete: "#EF4444",
};
```

- [ ] **Step 2: DashboardScreen DAMAGE_COLORS**

Replace:
```typescript
const DAMAGE_COLORS: Record<string, string> = {
  minimal:  "#22C55E",
  partial:  "#E8823A",
  complete: "#EF4444",
};
```

With:
```typescript
const DAMAGE_COLORS: Record<string, string> = {
  minimal:  "#22C55E",
  partial:  "#E8823A",
  severe:   "#F59E0B",
  complete: "#EF4444",
};
```

---

## Task 5: Update DashboardScreen criticalCount and criticalList

**Files:**
- Modify: `src/screens/agent/DashboardScreen.tsx`

- [ ] **Step 1: Update criticalCount filter**

In DashboardScreen, find:
```typescript
const criticalCount = observations.filter((o) => o.damage_level === "complete" || o.damage_level === "partial").length;
```

Replace with:
```typescript
const criticalCount = observations.filter(
  (o) => o.damage_level === "complete" || o.damage_level === "severe" || o.damage_level === "partial"
).length;
```

- [ ] **Step 2: Update criticalList filter**

Find:
```typescript
const criticalList = [...observations]
  .filter((o) => o.damage_level === "complete" || o.damage_level === "partial")
```

Replace with:
```typescript
const criticalList = [...observations]
  .filter((o) => o.damage_level === "complete" || o.damage_level === "severe" || o.damage_level === "partial")
```

- [ ] **Step 3: Update applyQuickFilter "critical" case**

Find:
```typescript
case "critical":  return obs.filter((o) => o.damage_level === "complete" || o.damage_level === "partial");
```

Replace with:
```typescript
case "critical":  return obs.filter(
  (o) => o.damage_level === "complete" || o.damage_level === "severe" || o.damage_level === "partial"
);
```

- [ ] **Step 4: Update pulse animation — severe should also pulse**

Find (in the criticalList rendering):
```typescript
animation: isCrit ? "pulse-dot 1.2s ease-in-out infinite" : "none",
```

The `isCrit` variable is `obs.damage_level === "complete"`. Update to include severe:
```typescript
const isCrit = obs.damage_level === "complete" || obs.damage_level === "severe";
```

---

## Task 6: Update i18n — 6 languages

**Files:** All 6 locale JSON files

For each language, add `"damage_severe"` in 4 sections: `classification`, `dashboard`, `observation`, and `enum`.

- [ ] **Step 1: en.json**

In `classification` section, after `"damage_partial"`:
```json
"damage_severe": "Severe",
```

In `dashboard` section, after `"damage_partial"`:
```json
"damage_severe": "Severe",
```

In `observation` section, after `"damage_partial"`:
```json
"damage_severe": "Severe",
```

In `enum` section, after `"damage_partial"`:
```json
"damage_severe": "Severe",
```

- [ ] **Step 2: es.json** — `"damage_severe": "Grave"`

- [ ] **Step 3: fr.json** — `"damage_severe": "Grave"`

- [ ] **Step 4: ar.json** — `"damage_severe": "شديد"`

- [ ] **Step 5: zh.json** — `"damage_severe": "严重"`

- [ ] **Step 6: ru.json** — `"damage_severe": "Тяжёлый"`

---

## Task 7: Final check + commit + merge + tag

- [ ] **Step 1: TypeScript check**

```bash
npx tsc --noEmit 2>&1
# Expected: same pre-existing error count, zero new errors
```

- [ ] **Step 2: Commit all changes**

```bash
git add src/types/schema.ts \
  src/screens/citizen/RapidClassificationScreen.tsx \
  src/screens/citizen/ReviewScreen.tsx \
  src/screens/agent/DashboardScreen.tsx \
  src/i18n/locales/en.json \
  src/i18n/locales/es.json \
  src/i18n/locales/fr.json \
  src/i18n/locales/ar.json \
  src/i18n/locales/zh.json \
  src/i18n/locales/ru.json \
  PROGRESS.md

git commit -m "feat: add Severe as 4th damage level (schema, classification, dashboard, i18n)"
```

- [ ] **Step 3: Merge to main**

```bash
git checkout main
git merge feature/design-approved --no-ff -m "Merge feature/design-approved: v0.3 Severe damage level + submit fix"
```

- [ ] **Step 4: Retag (delete old, create new)**

```bash
git tag -d v0.3-design-approved
git tag v0.3-design-approved
```

- [ ] **Step 5: Update PROGRESS.md**

Record completion: 4 damage levels, submit fix merged, tag updated.
