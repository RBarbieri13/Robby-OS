# Robby OS — Cockpit · Skills & Tooling Bootstrap

## Context

You are working on **Robby OS — Cockpit v2**, a single-user personal dashboard recreated from the Claude Design `robby-os` handoff bundle. It runs as pure static HTML/CSS/JS with React 18 + Babel-in-browser — **no build step, no framework deps, no Tailwind, no shadcn.** Components are exposed via `window.*` globals (e.g., `window.Sidebar`, `window.KanbanV2`, `window.AgendaV2`) rather than ES module imports.

The app has eleven surfaces: sidebar, topbar/subbar, kanban command grid, weekly agenda, AI-triaged email rail across Gmail/Outlook/iCloud, insights strip, status bar, command palette (⌘K), inspector panel, mini-month, and the `App` root that owns global state.

The user is Robby. This is his cockpit. Treat design decisions as serving *his* daily workflow, not a generic audience.

## Before doing any UI or design work, verify the following skills are available

Check each skill below. If it is not installed, install it before proceeding. If installation fails, flag it and continue with what is available rather than stopping. Fewer skills apply here than on a Next.js/shadcn project — that is by design.

### 1. frontend-design (Anthropic)
- **Purpose:** Forces distinctive design direction and breaks out of generic AI defaults.
- **When to use:** Whenever adding or substantially reworking a surface. BUT — respect the design language already established (see operating rules below). Use `frontend-design` to *extend* the existing aesthetic, not to pivot it. The Cockpit already has a committed direction: warm ivory sidebar, white kanban, cool-tint agenda, lavender email rail, 2px borders, layered shadows, Inter + Instrument Serif + JetBrains Mono. Do not start over.
- **Install:** `/plugin install frontend-design@claude-plugins-official`
- **Repo:** https://github.com/anthropics/skills/tree/main/skills/frontend-design

### 2. ui-ux-pro-max-skill (nextlevelbuilder)
- **Purpose:** Searchable database of 50+ UI styles, 97 color palettes, 57 font pairings, 99 UX guidelines, and 25 chart types across 9 stacks.
- **When to use:** When exploring new typography pairings, evaluating palette adjustments for `styles-v6-light.css`, or when Robby explicitly asks for alternatives rather than a single recommendation. Useful reference; not a default.
- **Repo:** https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

### 3. web-design-guidelines (Vercel Labs)
- **Purpose:** 100+ rules for accessibility, performance, and UX.
- **When to use:** As a review tool, not a blocker. Robby OS is single-user, so run the full ruleset for spot checks on new surfaces but apply judgment on which rules matter. Always enforce: visible focus states, full keyboard navigation (the `G then C/I/M/A/T/N/L` nav and `⌘K` palette are first-class), `prefers-reduced-motion` support, and sufficient contrast in light mode. Relax: ARIA rules that assume assistive-tech users, touch-target minimums (desktop-only app).
- **Repo:** https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines

### 4. composition-patterns (Vercel Labs)
- **Purpose:** Avoids boolean-prop soup in React components; prefers compound components and explicit variants.
- **When to use:** When adding a new surface or splitting an existing one. Lower leverage here than on a typed/built React project since this codebase uses `window.*` globals and no TypeScript — but the architectural principles still apply.
- **Repo:** https://github.com/vercel-labs/agent-skills/tree/main/skills/composition-patterns

### 5. theme-factory (Anthropic) — narrow fit
- **Purpose:** Generates coherent theme tokens.
- **When to use:** Only when Robby explicitly asks for an adjacent palette, a theme variant, or a color exploration for the light-mode system. Do not use this to override existing tokens in `styles-v6-light.css`.
- **Repo:** https://github.com/anthropics/skills/tree/main/skills/theme-factory

### 6. canvas-design (Anthropic) — out-of-app only
- **Purpose:** Original PNG/PDF visuals.
- **When to use:** For *about* Robby OS — promo screenshots, README graphics, personal website tiles. Not for in-app UI.
- **Repo:** https://github.com/anthropics/skills/tree/main/skills/canvas-design

### Skills intentionally NOT used on this project
- **shadcn** — no shadcn/ui in the stack. If you catch yourself wanting `<Button>` from `@/components/ui/button`, stop. Use the existing CSS classes.
- **Anything that assumes a build step, TypeScript, or Tailwind** — this is vanilla React + Babel-in-browser + hand-written CSS layers.

## Operating rules — non-negotiable

These reflect decisions already made. Do not relitigate them without asking.

1. **Light mode is canonical.** Dark mode still toggles via `⇧D` but do not design for it. All new work references light-mode appearance only. If Robby says "try something new," he means in light mode unless he explicitly says otherwise.

2. **CSS layer discipline.** The stack loads in order and each layer overrides the prior:
   1. `styles-v2.css` — base tokens, layout shell
   2. `styles-v3.css` — density modes, topbar popovers, palette
   3. `styles-v4.css` — kanban hero headers, task cards, AI brief
   4. `styles-v5-type.css` — typography
   5. `styles-v6-light.css` — **latest light-mode polish; new changes go HERE**

   Do not edit earlier layers unless the change is genuinely foundational. When in doubt, add to v6-light.

3. **After any CSS edit, bump `?v=N` on the corresponding `<link>` in `index.html`.** The browser will serve stale CSS otherwise. This has bitten us before.

4. **No build step. No new framework deps.** Do not add Vite, Next.js, Tailwind, TypeScript, or any npm dependency. If the answer seems to require one, reconsider first. Babel-in-browser handles JSX at runtime; everything else is hand-written.

5. **Component wiring pattern is `window.*`.** New components should follow the existing convention: define locally, assign to `window.ComponentName` at the bottom of the file, add a `<script type="text/babel" src="...">` tag to `index.html`. No imports.

6. **Respect the pane color system.** Each surface has a distinct background and this is load-bearing for Robby's ability to navigate at a glance:
   - Sidebar: warm ivory
   - Kanban: white
   - Agenda: cool tint
   - Email rail: lavender
   - Topbar: warm grey

   Do not flatten these to a single neutral.

7. **2px borders and layered shadows are the house style.** Not 1px. Not borderless. Shadows stack — they are not a mistake.

8. **Typography is load-bearing.** Inter (UI), Instrument Serif (display accents), JetBrains Mono (numerics, code, keybind labels). Tabular numerics on anything counting. Tracked labels on section headers. Do not substitute fonts.

9. **Prefer condensed, aggregated controls over horizontal bars.** Robby has expressed this directly — popovers and collapsed groups beat visible toolbar real estate.

10. **Multi-account contexts use brand marks, not text.** Gmail = envelope + red M, Outlook = blue O square, iCloud = cloud glyph. Preserve this pattern anywhere accounts are listed.

11. **Keyboard shortcuts are first-class.** Any new surface should be reachable via the `G` prefix nav or the `⌘K` palette. Destructive actions need keyboard equivalents. `Esc` universally closes the topmost overlay.

12. **Synthetic data only, unless asked.** `data.jsx` exposes `window.DATA`. Do not wire up real APIs, real Gmail, real calendar, etc. unless Robby explicitly requests it.

13. **Verify in headless Chromium** when a change is non-trivial — Robby has established this as the verification workflow. Spin up `./serve.sh` and confirm visual correctness before calling a change done.

## Kanban center-column resize formula (reference)

The center column's `gridTemplateRows` is computed as:
`36 + 148 + openRows*150 + collapsedRows*38 + 28 + 16` pixels.
When `kanbanFrac` (manual drag) is set, it overrides. Preserve this formula — it's what makes row-collapse grow the agenda with no whitespace gap.

## On startup of any Robby OS session

Run through this checklist and report back:
- [ ] Which of the six applicable skills above are available (skip shadcn — not used here)
- [ ] Which (if any) failed to install
- [ ] Confirmation you understand the light-mode canonical rule, the CSS layer discipline, the `?v=N` cache bump, and the no-new-deps constraint

Then wait for my task.
