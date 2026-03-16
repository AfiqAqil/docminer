# UI Foundation Design

**Date:** 2026-03-16
**Status:** Approved
**Scope:** Frontend design system, page rebuilds, documentation updates

---

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Visual personality | Bold & distinctive | Portfolio showcase — needs to stand out |
| Accent color | Violet/Purple | Signals AI-powered, pairs well with dark theme |
| Sidebar style | Compact icon rail + labels | Clean dev-tool feel, right-sized for 4 pages |
| Dark mode | Dark only | Easier to polish one theme; violet pops on dark |
| Approach | Design system first, rebuild pages | Consistency over incremental patches |

---

## 1. Theme & Color Palette

Dark only. Apply `.dark` class on `<html>`.

Violet accent system replacing the neutral `--primary`:

| Token | Role | Approx Value |
|---|---|---|
| `--primary` | Buttons, active nav, CTAs | Violet 500 (`oklch(0.55 0.25 285)`) |
| `--primary-foreground` | Text on primary | White |
| `--accent` | Hover states, subtle highlights | Violet 500 at 10% opacity |
| `--accent-foreground` | Text on accent | Violet 300 |
| `--chart-1` to `--chart-5` | Stats, badges | Violet gradient light to deep |
| `--destructive` | Errors | Red (keep current) |
| `--success` (new) | Extraction complete | Emerald 500 |

Typography: Geist Sans + Geist Mono (keep current).

Borders & surfaces: subtle `ring-1 ring-white/5` on cards for glass-like edges.

## 2. Sidebar Navigation

Fixed width ~200px, full height, dark surface.

```
Logo area:    Gem icon (violet) + "docminer" semibold
Navigation:   LayoutDashboard  Dashboard
              Sparkles         Extract
              FileText         Documents
              Braces           Schemas
Separator:    ───────────
Bottom:       Settings         Settings (future placeholder)
```

Active item: violet bg at 10%, violet text, 2px left border accent.
Hover: `white/5%` background.
Icons: 18px, muted-foreground default, violet when active.
Not collapsible (unnecessary for 4 pages).

## 3. Dashboard Page

Two states: empty and populated.

### Empty State (Onboarding)

Three step cards connected with dashed lines/arrows:

1. **Upload a document** — FileUp icon, CTA links to /documents
2. **Define a schema** — Braces icon, CTA links to /schemas
3. **Extract data** — Sparkles icon, CTA links to /extract

Steps show checkmarks when the user has completed them (has documents/schemas).
Subtle violet gradient or glow on the heading area.
Heading: "Welcome to docminer" + subtitle.

### Populated State (Stats + Activity)

Stat cards row: document count, schema count, extraction count, success rate.
Recent extractions table: document name, schema name, status badge, relative time.
"New Extraction" CTA button in top right.

Note: requires a list-extractions API endpoint. If unavailable, show stats + CTA only.

## 4. Shared UI Components

### Install from shadcn

- `Input` — replace raw `<input>`
- `Label` — proper form labels
- `Select` — replace raw `<select>`
- `Skeleton` — loading states
- `Sonner` (toast) — replace inline error `<p>` tags
- `Dialog` — confirmations (delete schema)
- `Table` — dashboard recent extractions

### Keep existing

Button, Card, Badge, Separator.

### Custom components to build

| Component | Purpose |
|---|---|
| `PageHeader` | Page title + optional action button. Standardizes the h1 + button pattern. |
| `EmptyState` | Icon, title, description, CTA. Reused on Documents, Schemas, Dashboard. |
| `StatusBadge` | Extraction status with semantic colors: violet=processing, emerald=completed, red=failed, muted=pending. |

### Patterns

**Loading:** Skeleton cards matching content shape (2-3 skeletons for lists, skeleton stat boxes for dashboard). Replace all "Loading..." text.

**Errors:** Sonner toasts for all errors and success messages. No inline red `<p>` tags.

## 5. Page Rebuilds

Business logic (API calls, state management) stays identical. UI shells get rebuilt.

### Documents Page

- `PageHeader` with title + Upload button
- Card list: filename, content type badge, upload date
- `EmptyState` when no documents
- Upload success/error via toast
- Skeleton cards while loading

### Schemas Page

- `PageHeader` with title + "New Schema" button
- "New Schema" opens a `Dialog` (not inline form toggle)
- Schema cards: field count badge + field name chips
- Delete triggers confirmation `Dialog`
- `EmptyState` when no schemas
- shadcn `Input`, `Label`, `Select` in the form
- Toasts for create/delete

### Extract Page

- `PageHeader` with title
- shadcn `Select` replacing raw dropdowns
- Clear left panel (inputs) / right panel (results) card layout
- `StatusBadge` with animated pulse on "processing"
- JSON result: styled monospace pre, copy-to-clipboard button
- `EmptyState` in results panel when no job
- Toasts for errors

### Layout

- `.dark` class on `<html>`
- New `Sidebar` component replaces `Nav`
- Main content: `max-w-6xl` container, consistent padding

## 6. Documentation Updates

- **README.md:** Add "Web App" section with tech stack, setup instructions, screenshots placeholder
- **TODO.md:** Mark completed items, add new items if discovered
- **CLAUDE.md:** Add frontend conventions (component patterns, shadcn usage, dark-only theme, violet palette)
- **This design doc:** Source of truth for all UI decisions
