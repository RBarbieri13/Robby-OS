# Robby OS — Cockpit v2

**Live:** https://rbarbieri13.github.io/Robby-OS/
**Repo:** https://github.com/RBarbieri13/Robby-OS

Standalone implementation of the Cockpit v2 design from the Claude Design handoff
(`robby-os` bundle).

## Run

```bash
./serve.sh          # defaults to port 8765
./serve.sh 3000     # or pick any port
```

Then open `http://localhost:8765`.

Requires Python 3 for the dev server. Any static-file server works — the app is
pure HTML/CSS/JS (no build step).

## What's here

A single-page React dashboard built with React 18 + Babel-in-browser. Everything
loads from `index.html`.

### Entry

- `index.html` — loads fonts, CSS layers, React/Babel, and all JSX modules.
- `v2-app.jsx` — root `<App />`, owns global state (view, theme, density,
  rail/email collapse, filters, color-by, inspector, palette, tweaks).

### Shared

- `data.jsx` — sample data (projects, accounts, tasks, notes, events, goals,
  agenda events, emails). Exposed on `window.DATA`.
- `icons.jsx` — Lucide-style inline SVG icon set. Exposed on `window.I`.

### Surfaces

| File | Exposes | Purpose |
|---|---|---|
| `v2-sidebar.jsx` | `window.Sidebar` | Left rail: brand, nav, modules, project filters, mini-month, user footer. |
| `v2-topbar.jsx` | `window.TopBarV2`, `window.SubBarV2` | Breadcrumb + ⌘K search + quick-add split button + layout/notif/view popovers. Sub bar: week nav, group-by, color-by, density. |
| `v2-insights.jsx` | `window.InsightsV2` | AI Brief strip (toggleable). |
| `v2-kanban.jsx` | `window.KanbanV2` | Command Grid: projects × (tasks/notes/events/goals) matrix with per-project hero headers + sparklines. |
| `v2-agenda.jsx` | `window.AgendaV2` | Weekly agenda (6a–10p, 7 days), draggable events and task chips. |
| `v2-email.jsx` | `window.EmailRailV2` | Right rail: AI-triaged inbox across 3 accounts, grouped by category, with per-email action rail. |
| `v2-statusbar.jsx` | `window.StatusBarV2` | Sync / task counters / focus timer / model / clock. |
| `v2-palette.jsx` | `window.PaletteV2` | ⌘K command palette. |
| `v2-inspector.jsx` | `window.InspectorV2` | Right-side detail panel for opened cards. |
| `v2-minimonth.jsx` | `window.MiniMonth` | Compact month grid used in the sidebar. |

### Styles

CSS is layered (load order matters — each sheet refines or overrides the prior):

1. `styles-v2.css` — base tokens, layout shell, sidebar, kanban, agenda, email rail.
2. `styles-v3.css` — density modes, topbar popovers, command palette, inspector.
3. `styles-v4.css` — v2 kanban hero headers, task card redesign, AI brief strip.
4. `styles-v5-type.css` — typography refinements (tabular numerics, tracked labels).

## Keyboard shortcuts

| Keys | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Toggle command palette |
| `⇧D` | Toggle dark/light |
| `⇧E` | Collapse/expand email rail |
| `⇧S` | Collapse/expand sidebar |
| `⇧Y` | Cycle density (compact → comfortable → roomy) |
| `G` then `C/I/M/A/T/N/L` | Go to Cockpit / Inbox / Mail / Calendar / Tasks / Notes / Goals |
| `Esc` | Close inspector / opened email / palette |

## Provenance

Recreated from the `robby-os` Claude Design handoff bundle at
`~/.claude/projects-workspace/Robby OS/robby-os/`. Only the Cockpit v2 files
(`v2-*.jsx` + four CSS layers + `data.jsx` + `icons.jsx`) are included — the v1
prototypes (`app.jsx`, `topbar.jsx`, `kanban.jsx`, `agenda.jsx`, `email.jsx`,
`styles.css`) are unused and not copied.
