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

- The filter popover's state (`groupBy`) is local to SubBar; if we ever wire
  up actual grouping in the kanban, lift that state into App.
- Inspector scrim blur is 4px — consider reducing on reduced-motion
  preference in a future pass.
- **Real Gmail/Outlook/iCloud OAuth.** `api/mail.js` ships as a stub with
  the wire-up checklist in its header comments. Estimated 4–6h once
  credentials are provisioned.
- **`ui-ux-pro-max-skill` clone** at `.claude/skills/` — blocked by sandbox
  policy as "untrusted code integration". Either clone manually
  (`git clone --depth 1 https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git`)
  or add a Bash permission rule.

## Data layer (as of 2026-05-20)

API surface, all on Vercel serverless under `api/`:

| Endpoint | Purpose | Status |
|---|---|---|
| `/api/calendar` | iCloud CalDAV → events for current week | **live** (uses APPLE_ID + APPLE_APP_PASSWORD env) |
| `/api/calendar?week=YYYY-MM-DD` | Any week's events | **live** |
| `/api/mail` | AI-triaged inbox shape | **stub** — synthetic data, awaiting OAuth |
| `/api/health` | calendar + mail subsystem status | **live** |

Client wiring:
- `v2-agenda.jsx` fetches `/api/calendar?week=<weekIsoDate>` from App state.
  Warm-start cache keyed `robbyos.calendar.v1:YYYY-MM-DD` so prev/next don't
  clobber each other. Refresh every 60s.
- `v2-email.jsx` fetches `/api/mail`, falls back to `window.DATA.EMAILS` on
  cold load. Refresh every 120s. Surfaces `stub`/`live`/`mail error` chip
  in the pane head sub-title.

## Persistence model

Four localStorage keys back the cockpit:

| Key | Owner | Contents |
|---|---|---|
| `robbyOS.ui.v1` | App | view, theme, density, rail/email collapse, projectFilters, collapsedRows, colorBy, showInsights |
| `robbyOS.layout.v1` | App | railW, emailW, kanbanFrac |
| `robbyOS.cardEdits.v1` | App | per-card title/due/priority edits |
| `robbyOS.expandedCards.v1` | App | which cards are open |
| `robbyOS.cardOrder.v1` | App | per-row per-project ordering |
| `robbyos.calendar.v1:YYYY-MM-DD` | Agenda | warm-start cache, one key per week |

Deliberately *not* persisted (always reset per session): paletteOpen,
inspector, openedEmail, tweaksOpen, weekAnchor.

## Week navigation

`weekAnchor: Date` lives in `App`. Chevrons in InsightsV2 (top bar) and
AgendaV2 (pane head) both call `shiftWeek(±7)`. App derives:
- `weekLabel` ("May 18–24, 2026" or cross-month form)
- `weekIsoDate` ("2026-05-18", always the Monday) passed to AgendaV2

The agenda re-fetches `/api/calendar?week=<isoDate>` whenever weekIsoDate
changes. `todayIdx` from the API is `-1` when today falls outside the
requested week — today-tint and now-line naturally suppress.

## Vendored libs (no CDN)

`vendor/` ships React 18.3.1, ReactDOM 18.3.1, Babel-standalone 7.29.0
(~4.3MB total). `index.html` no longer references unpkg.com — protects
against CDN outages and cold-DNS perf cliffs.

## Project-level Claude Code automation

Wired in `.claude/`:
- **Hooks** (PostToolUse + SessionStart): `bump-css-version.sh` (auto ?v=N),
  `check-border-2px.sh` (warn on 1px borders), `session-start-screenshot.sh`
  (cockpit baseline if serve up)
- **Subagents**: `typography-reviewer`, `css-layer-auditor` (both read-only)
- **MCP**: chrome-devtools (in `.mcp.json`)

## Run

```bash
cd ~/Desktop/"Robby OS Cockpit"
./serve.sh          # http://localhost:8765
```
