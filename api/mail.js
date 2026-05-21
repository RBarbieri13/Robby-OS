// Vercel serverless function — returns the AI-triaged inbox shape that
// v2-email.jsx consumes. Currently a STUB that mirrors the synthetic data
// from data.jsx so the client can switch from window.DATA.EMAILS to a
// network fetch without any UI changes. When Gmail OAuth is wired (see
// TODO block below), only the data source changes; the response shape and
// the v2-email rail stay identical.
//
// Response shape (matches window.DATA.EMAILS):
//   {
//     accounts: [{ id, name, handle, color, on, unread }],
//     emails:   { <accountId>: { <category>: [ {id, from, subj, snippet, time, ...} ] } },
//     loadState: "stub" | "live",
//     generatedAt: ISO,
//   }

// ───────────────────────────── TODO: wire real OAuth ─────────────────────
// To go live:
//   1. Provision a Google Cloud project, enable Gmail API.
//   2. Add OAuth credentials → env vars: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET,
//      GMAIL_REFRESH_TOKEN (one per account).
//   3. Replace the SYNTHETIC block below with `await fetchGmailTriaged()`
//      using `googleapis` or raw REST against `users.messages.list/get`.
//   4. Mirror the same pattern for Microsoft Graph (outlook) and CalDAV
//      (icloud doesn't expose mail via simple auth — likely IMAP via
//      app-specific password, same APPLE_APP_PASSWORD already in env).
//   5. Flip loadState from "stub" to "live".
// Estimated effort: 4–6h. Keep this stub running until that lands so the
// UI never depends on a half-wired data layer.
// ──────────────────────────────────────────────────────────────────────────

const SYNTHETIC_ACCOUNTS = [
  { id: "gmail",   name: "Gmail",   handle: "robby@gmail.com",     color: "oklch(70% 0.14 25)",  on: true, unread: 14 },
  { id: "outlook", name: "Outlook", handle: "robby@company.com",   color: "oklch(65% 0.14 240)", on: true, unread: 8 },
  { id: "icloud",  name: "iCloud",  handle: "robby@icloud.com",    color: "oklch(72% 0.10 210)", on: true, unread: 3 },
];

const SYNTHETIC_EMAILS = {
  gmail: {
    urgent: [
      { id: "m1", from: "Celia Rao",       subj: "Re: Q2 board deck — can you push your slides tonight?", snippet: "Need them before I head into my dinner. Even drafts work — I want to skim the narrative and flag anything before we send it.", time: "14m", unread: true, flagged: true, chips: ["board"], sentiment: "urgent", quickReplies: ["On it — drafts by 8p", "Pushing now", "Need 1 more hour"] },
      { id: "m2", from: "Acme Legal",      subj: "MSA redline — needs your initials on §6.3",             snippet: "Attaching the redline. Sign-off blocks the rollout, apologies for the noise. Counsel can turn it around in an hour once you've initialed.", time: "1h", unread: true, chips: ["legal"], sentiment: "blocking", quickReplies: ["Signing today", "Looping in counsel"] },
    ],
    reply: [
      { id: "m3", from: "Ren Kapoor",       subj: "Eng 1:1 prep — topics for Wed",                         snippet: "Want to cover the eval harness, hiring pipeline, and on-call rotation. Also a heads-up on the perf review cycle coming next month.", time: "3h", unread: true },
      { id: "m4", from: "Priya Shah",       subj: "Thursday lab sync — can we bump 30min?",                snippet: "Got a customer intro I can't move. Start at 2:30 instead of 2? Happy to send the pre-read earlier so we hit the ground running.", time: "5h", unread: false },
    ],
    newsletters: [
      { id: "m5", from: "Stratechery",      subj: "The next platform shift (free)",                         snippet: "Ben's take on agentic workflows and vertical integration — why the next wave of companies will own the full stack instead of renting it.", time: "6h", unread: false, chips: ["read later"] },
      { id: "m6", from: "Hacker Newsletter",subj: "Issue 742 · best of the week",                           snippet: "Highlights: 'A Philosophy of Software Design', LLM eval tooling deep-dives, and a surprisingly good post on vibes-driven decision making.", time: "1d", unread: false },
    ],
  },
  outlook: {
    urgent: [
      { id: "m7", from: "Marcus Lin",       subj: "Forecast diff — please review before 5p",                snippet: "Finance pulled a new cut; deltas to the board model attached. Biggest swing is expansion ARR — want your take on whether we hold the line.", time: "22m", unread: true, flagged: true, chips: ["finance"], sentiment: "urgent", quickReplies: ["Reviewing now", "Meet at 4?"] },
    ],
    reply: [
      { id: "m8", from: "Tanya (EA)",       subj: "Scheduling — can I move Friday?",                        snippet: "Have a conflict with Kevin's team. Proposing Mon 3p or Tue 4p — both work for the others. Let me know which you prefer and I'll hold it.", time: "2h", unread: true },
      { id: "m9", from: "Jordan (Sales)",   subj: "Acme intro — warm handoff?",                              snippet: "They asked about the new pricing tier. Mind replying directly? I can frame the intro if you want — just need ~2 sentences on positioning.", time: "4h", unread: false },
    ],
    updates: [
      { id: "m10", from: "GitHub",          subj: "PR #1284 — agent-eval-v1 ready for review",               snippet: "Priya opened a pull request in predictivity/agent-eval. +812 / −47 across 9 files. CI green. Needs your approval plus one more reviewer.", time: "1h", unread: true, chips: ["pr"] },
      { id: "m11", from: "Linear",          subj: "Daily digest — 3 issues assigned to you",                 snippet: "COCK-214, COCK-232, COCK-240 · due this week. Two marked High priority by Ren. Estimated 4h total if nothing unblocks mid-flight.", time: "8h", unread: false },
    ],
  },
  icloud: {
    urgent: [],
    reply: [
      { id: "m12", from: "Kai Brennan",     subj: "Friday at Rintaro — 7:30 still good?",                    snippet: "Noor can make it too. Planning on the omakase — let me know if you want to splurge on the tasting menu or keep it à la carte.", time: "5h", unread: true, chips: ["personal"] },
    ],
    updates: [
      { id: "m13", from: "iCloud",          subj: "Photo memory · This week last year",                      snippet: "12 photos from Lisbon — Alfama, the rooftop at Park, and that long dinner at Cervejaria Ramiro. A good week to revisit on a Tuesday.", time: "1d", unread: false },
    ],
    newsletters: [
      { id: "m14", from: "Patagonia",       subj: "New spring collection is here",                            snippet: "Fresh drops across hike, climb, and trail. The Houdini jacket is restocked in the sand color you had your eye on last October.", time: "2d", unread: false },
    ],
  },
};

module.exports = async (req, res) => {
  const startedAt = Date.now();
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");

  res.status(200).json({
    accounts: SYNTHETIC_ACCOUNTS,
    emails: SYNTHETIC_EMAILS,
    loadState: "stub",
    generatedAt: new Date().toISOString(),
    tookMs: Date.now() - startedAt,
  });
};
