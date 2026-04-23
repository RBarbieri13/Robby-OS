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
  5. `styles-v6-light.css` — light-mode polish + layout refinements
  6. `theme-cognitive-calm.css` — **FINAL theme: 3-anchor structured
     palette (warm paper / cool stone / ink) with sage accent, muted
     per-project pastel hero tints, Fyxer-orange upright wordmark,
     charcoal AI Brief badge.** Bump `?v=N` on the `<link>` in
     `index.html` after edits or the browser will serve stale CSS.

- **Active theme = Cognitive Calm.** The design explicitly uses three
  color anchors that repeat across the interface:
  - Warm paper `#faf8f2` → canvas, subbar, kanban, agenda, topbar
  - Cool stone `#eceae2` → sidebar, insights strip, status bar
  - Ink `#1b1c19` → text, primary buttons, AI Brief badge, wordmark (when not using brand orange)
  - Sage green `#7a9178` → every active state (sidebar active item, today
    columns in agenda + mini-month, focus rings, unread dots)
  - Brand orange `#FF5733` → Robby OS wordmark only
  - Per-project hero backgrounds: oklch 95% L / 0.014 C with unique hues
    (work=230, personal=295, house=80, health=155, ai=20) + 2px left
    bar in oklch 55% L of the same hue.

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

## Polish pass (v6 second half — senior-dev audit)

Applied as a single pass at the bottom of `styles-v6-light.css` plus targeted
aria-label additions in JSX:

- **Topbar search** never wraps anymore — `nowrap + overflow: hidden + ellipsis`
  on placeholder and hint spans. Locked at ~30px.
- **Unified `:focus-visible` ring** across buttons, segmented controls,
  side-items, cards, pills, palette items. Double-ring style
  (`canvas offset + accent halo`) reads on every pane background.
- **`prefers-reduced-motion` respected** — transitions/animations clamp to
  instant, `.pulse` dot halo removed.
- **Sidebar** got a right-edge drop shadow (matches other pane elevation),
  and the active-item contrast was bumped with an inset 2px blue bar + bolder
  bg. Resolves the old follow-up.
- **Status bar** direct children locked to consistent 15–20px heights;
  `.sb-chip` and `.seg.mini` pinned to 20px with 1-line-height seg-items.
- **Email item** grid cleaned up to `4px 36px minmax(0, 1fr)` — "via Gmail"
  no longer collapsed. Chip row wraps cleanly.
- **Compact density** tightens email item padding, line-heights, avatar size,
  and `.eh-big`. Resolves the old follow-up.
- **Task/note/event/goal titles** use 2-line clamp with ellipsis — no more
  mid-word clips.
- **Scrollbars** unified to 8px thin with rounded thumbs in `--hair-2` that
  darken on hover. Applied to sidebar, kanban, agenda, email, palette,
  inspector, and sb-filter-pop.
- **Cursor affordances** — every clickable cursor is `pointer`; the topbar
  search shows `text`.
- **Selection color** matches the accent and reads on all pane tints.
- **Today column in the agenda** gets a subtle light-blue tint.
- **`now-line`** in the agenda uses the accent blue.
- **Disabled state** tokenized via `button[disabled]` and `.is-disabled`.
- **`aria-label` + `title`** added to all icon-only buttons (7 total):
  mm-nav (×2), sb-caret, chev-btn (×4).
- **CSS/JSX cache-busters bumped** — `?v=4` on styles-v6-light,
  `?v=2` on all JSX sources to force fresh loads in Chromium.

Post-polish interaction smoke test (all pass): `⌘K` opens/closes palette,
`Esc` closes, row-collapse shrinks kanban + grows agenda, insights "More"
expands, SubBar "View" popover opens.

## Known follow-ups (not blocking, can be done later)

- Card-type clickables (`.tcard`, `.email-item-v2`, `.side-item`) aren't
  keyboard-reachable — they rely on `onClick` on `<div>`s. If/when we want
  full keyboard traversal, add `role="button"` + `tabIndex={0}` + keydown
  handlers. The `⌘K` palette + `G`-prefix shortcuts cover primary nav today.
- The filter popover's state (`groupBy`) is local to SubBar; if we ever wire
  up actual grouping in the kanban, lift that state into App.
- Inspector scrim blur is 4px — consider reducing on reduced-motion
  preference in a future pass.

## Run

```bash
cd ~/Desktop/"Robby OS Cockpit"
./serve.sh          # http://localhost:8765
```
