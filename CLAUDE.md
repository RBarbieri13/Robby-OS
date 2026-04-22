# CLAUDE.md

**Before any work on this project, read and comply with:**

1. [`./skills-bootstrap.md`](./skills-bootstrap.md) — tooling, operating rules, and non-negotiables for Robby OS (design language, CSS layer discipline, no-build-step constraint, component wiring pattern, keyboard shortcut expectations).
2. [`./memory.md`](./memory.md) — session history, confirmed behaviors, and user preferences captured over time.

These two files pair intentionally:
- `skills-bootstrap.md` captures **tooling and operating rules** — things that are true regardless of what's happened in any given session.
- `memory.md` captures **session history and preferences** — things learned across conversations.

Together they give the agent everything it needs to pick up work without repeatedly rediscovering context. Read both at session start.

On every session start, run the checklist at the bottom of `skills-bootstrap.md` and report back before waiting for the task.
