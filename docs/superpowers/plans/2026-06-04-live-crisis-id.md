# Live Crisis ID Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove Porto Alegre fallback from DashboardScreen so Live mode uses the crisis ID from App.tsx.

**Architecture:** DashboardScreen has a default param `crisisId = VITE_DEMO_CRISIS_ID ?? "f58c..."`. When App passes a valid UUID after crisis creation, this default never fires — but if the prop is ever undefined or empty, it falls back to Porto Alegre data. Root fix: remove the fallback default entirely.

**Tech Stack:** React, TypeScript, Supabase

---

### Task 1: Remove Porto Alegre fallback from DashboardScreen

**Files:**
- Modify: `src/screens/agent/DashboardScreen.tsx:244,253`
- Modify: `docs/PROGRESS.md`

- [ ] **Step 1: Change crisisId prop to required with empty default**

In `src/screens/agent/DashboardScreen.tsx`:

```typescript
// Line 244: make required (remove ?)
crisisId: string;

// Line 253: default to empty string instead of Porto Alegre UUID
crisisId = "",
```

- [ ] **Step 2: Build — verify zero TS errors**

```bash
npm run build
```
Expected: clean build.

- [ ] **Step 3: Update PROGRESS.md**

Add v0.19-live-crisis-id entry.

- [ ] **Step 4: Deploy**

```bash
netlify deploy --prod --dir=dist --site=120f1e72-45ec-4cbe-bf71-83f4a45b7a97
```

- [ ] **Step 5: Create git tag**

```bash
git add src/screens/agent/DashboardScreen.tsx docs/PROGRESS.md
git commit -m "fix: remove Porto Alegre fallback from DashboardScreen crisisId"
git tag v0.19-live-crisis-id
```
