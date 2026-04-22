# CLAUDE.md — Robby OS Cockpit

## Read these first, in order, every session

1. **[`./skills-bootstrap.md`](./skills-bootstrap.md)** — skills to verify/install and the non-negotiable operating rules (light-mode canonical, CSS layer discipline, `?v=N` cache bump, no new deps, `window.*` wiring pattern, pane color system, keyboard-first design).
2. **[`./memory.md`](./memory.md)** — session history, confirmed behaviors, architectural notes, and captured user preferences.
3. **[`./README.md`](./README.md)** — file map and surface-by-surface component inventory.

Do not start work until you have read all three. If any are missing, stop and tell me before proceeding.

These files pair intentionally:
- `skills-bootstrap.md` captures **tooling and operating rules** — things that are true regardless of what's happened in any given session.
- `memory.md` captures **session history and preferences** — things learned across conversations.
- `README.md` captures **file structure and component inventory** — the map of what lives where.

## Project at a glance

**Robby OS — Cockpit v2.** Single-user personal dashboard. React 18 + Babel-in-browser. Pure static HTML/CSS/JS, no build step, no npm deps, no Tailwind, no shadcn. Components exposed via `window.*` globals.

- **Live:** https://rbarbieri13.github.io/Robby-OS/
- **Repo:** https://github.com/RBarbieri13/Robby-OS
- **Run locally:** `./serve.sh` (defaults to port 8765)

## Who you're working with

Robby Barbieri. This is his personal cockpit — his daily driver dashboard pulling together tasks, calendar, email across three accounts, notes, and goals. Design decisions serve *his* workflow specifically, not a generic audience. When in doubt about a tradeoff, optimize for his daily use over theoretical best practice.

## Hard constraints (duplicated from skills-bootstrap for emphasis)

- **Light mode only.** Dark mode toggles via `⇧D` but is not the design target.
- **CSS edits go in `styles-v6-light.css`** unless the change is genuinely foundational to an earlier layer.
- **Bump `?v=N` in `index.html`** after any CSS edit or the browser serves stale styles.
- **No build step. No new dependencies.** Vanilla React via Babel-in-browser is the stack — keep it that way.
- **`window.*` component pattern.** New components get assigned to `window.ComponentName` and loaded via `<script type="text/babel">` tags in `index.html`. No ES module imports.
- **Preserve the pane color system.** Sidebar ivory, kanban white, agenda cool tint, email lavender, topbar warm grey — these are load-bearing, not decorative.
- **Synthetic data only** (`window.DATA` from `data.jsx`) unless I explicitly ask to wire real APIs.

## Verification

For non-trivial visual changes, start `./serve.sh`, open the app in headless Chromium, and confirm the change rendered correctly before calling it done. This is the established workflow — don't skip it.

## On startup

Report back:
- [ ] Confirmation you've read `skills-bootstrap.md`, `memory.md`, and `README.md`
- [ ] Skill availability check (per `skills-bootstrap.md`)
- [ ] Any open items from `memory.md`'s "Known follow-ups" section that you notice are relevant to my task

Then wait for my task.
