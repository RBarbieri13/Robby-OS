# Robby OS — Cockpit · Session Memory

## Project summary

Standalone React 18 + Babel-in-browser dashboard recreated from the Claude
Design `robby-os` handoff bundle. Runs as pure static HTML/CSS/JS (no build).

## Key decisions

- **Light theme is the default.** Dark mode is still available via `⇧D` or the
  topbar View menu, but **all future design changes reference the light
  version**. Do not tweak dark mode unless asked.
- **CSS layer stack (load order matters — each later sheet overrides prior):**
  1. `styles-v2.css` — base tokens, layout shell
  2. `styles-v3.css` — density modes, topbar popovers, command palette
  3. `styles-v4.css` — v2 kanban hero headers, task card redesign
  4. `styles-v5-type.css` — typography (tabular nums, tracked labels)
  5. `styles-v6-light.css` — **light-mode polish + layout refinements (the
     latest changes live here).** Bump `?v=N` on the `<link>` in `index.html`
     after edits or the browser will serve stale CSS.

## Confirmed behaviors (verified in headless Chromium)

| Feature | Status |
|---|---|
| `⌘K` / `Ctrl+K` opens command palette | ✅ |
| `Esc` closes palette | ✅ |
| `⇧D` toggles theme | ✅ |
| Row collapse → kanban shrinks → agenda grows (no whitespace gap) | ✅ |
| AI Brief "More" expands to 6 pill row | ✅ |
| SubBar "View" popover shows Group / Color / Density / Focus mode | ✅ |
| Email account pills show Gmail/Outlook/iCloud brand marks | ✅ |
| All panes visually distinct: sidebar (warm ivory), kanban (white), agenda (cool tint), email (lavender), topbar (warm grey) | ✅ |
| 2px component borders + layered shadows in light mode | ✅ |

## Architectural notes

- **Kanban auto-resize logic** (`v2-app.jsx`): the center column's
  `gridTemplateRows` is computed from the number of open Kanban rows. Formula:
  `36 + 148 + openRows*150 + collapsedRows*38 + 28 + 16` pixels. When
  `kanbanFrac` (manual drag) is set, it overrides.
- **Email item v2 layout** (`v2-email.jsx`): single-line `from — subject`
  with time right-aligned, snippet clamped to 1 line, chips row with
  sentiment + folder + task + "via Account" at end. Same or slightly more
  vertical space per item; much better info density.
- **Account pill brand marks**: inline SVG in `AcctMark` component inside
  `v2-email.jsx`. Gmail = envelope with red outline + M; Outlook = blue
  rounded square with O; iCloud = cloud glyph.
- **Filter popover state** (`v2-topbar.jsx SubBar`): lives local to SubBar
  (`filtersOpen`, `groupBy`, `focusMode`). `colorBy` and `density` are passed
  in from App and mutated through this popover.

## User preferences captured

- Work only in light mode from now on.
- Thick borders (2px), shadows, and distinct backgrounds between components.
- Prefers condensed/aggregated controls over busy horizontal bars.
- Prefers brand logos over generic text labels for multi-account contexts.

## Known follow-ups (not blocking, can be done later)

- The light-mode sidebar's brand mark + top items could use a touch more
  contrast; current active-item bg (`--bg-4`) is subtle.
- If the user changes density, `is-compact` mode may want tighter line-height
  on email items.
- The filter popover's state (`groupBy`) is local to SubBar; if we ever wire
  up actual grouping in the kanban, lift that state into App.

## Run

```bash
cd ~/Desktop/"Robby OS Cockpit"
./serve.sh          # http://localhost:8765
```
