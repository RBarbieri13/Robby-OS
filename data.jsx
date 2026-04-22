/* global React */
// ───────────────────────── Sample data ─────────────────────────
// Five projects, varied tasks/notes/events/goals. Populated enough
// to read as a real product, not a template skeleton.

const PROJECTS = [
  { id: "work",     name: "Work",     color: "var(--work)",     bg: "var(--work-bg)",
    spark: [3,5,4,7,6,8,9], trend: "up",   health: "ok",   dueWk: { done: 7, total: 12 } },
  { id: "personal", name: "Personal", color: "var(--personal)", bg: "var(--personal-bg)",
    spark: [2,2,3,2,4,3,3], trend: "flat", health: "ok",   dueWk: { done: 2, total: 5 } },
  { id: "house",    name: "House",    color: "var(--house)",    bg: "var(--house-bg)",
    spark: [1,2,2,3,2,4,5], trend: "up",   health: "warn", dueWk: { done: 1, total: 6 } },
  { id: "health",   name: "Health",   color: "var(--health)",   bg: "var(--health-bg)",
    spark: [4,3,4,5,4,4,6], trend: "up",   health: "ok",   dueWk: { done: 4, total: 5 } },
  { id: "ai",       name: "AI",       color: "var(--ai)",       bg: "var(--ai-bg)",
    spark: [2,3,5,4,6,5,7], trend: "up",   health: "ok",   dueWk: { done: 2, total: 8 } },
];

const ACCOUNTS = [
  { id: "gmail",   name: "Gmail",   handle: "robby@gmail.com",     color: "oklch(70% 0.14 25)",  on: true, unread: 14 },
  { id: "outlook", name: "Outlook", handle: "robby@company.com",   color: "oklch(65% 0.14 240)", on: true, unread: 8 },
  { id: "icloud",  name: "iCloud",  handle: "robby@icloud.com",    color: "oklch(72% 0.10 210)", on: true, unread: 3 },
];

// Tasks row ────────────────
const TASKS = {
  work: [
    { id: "t1", title: "Finalize Q2 board deck — investor narrative",   due: "Today 4:00p",  dueDay: 0, overdue: false, soon: true, priority: "high", done: false, subs: {done: 4, total: 7}, people: ["CR","ML"], links: 2, tags: ["deck","investor"], est: 90 },
    { id: "t2", title: "Review pricing model with Finance",             due: "Tue", dueDay: 1,  priority: "high", done: false, attach: 2, subs: {done: 1, total: 3}, people: ["JS"], tags: ["finance"], est: 45 },
    { id: "t3", title: "1:1 prep notes · eng leads",                    due: "Wed", dueDay: 2,  priority: "med", done: false, subs: {done: 0, total: 5}, tags: ["eng","1:1"], est: 30 },
    { id: "t4", title: "Approve marketing brief v3",                    due: "Thu", dueDay: 3,  priority: "low", done: false, people: ["DN"], tags: ["marketing"], est: 15 },
    { id: "t5", title: "Sign MSA — Acme rollout",                       done: true, subs: {done: 4, total: 4}, tags: ["legal"] },
  ],
  personal: [
    { id: "t6", title: "Book flights for Lisbon (Jun 12–19)",           due: "Fri",  dueDay: 4, priority: "med", done: false, links: 3, tags: ["travel"], est: 30 },
    { id: "t7", title: "Renew passport — expires Aug",                  due: "Mon",  dueDay: 0, priority: "high", done: false, overdue: true, subs: {done: 1, total: 4}, tags: ["admin","urgent"], est: 60 },
    { id: "t8", title: "Call mom for Sunday dinner",                    priority: "low", done: false, tags: ["family"] },
  ],
  house: [
    { id: "t9",  title: "Schedule HVAC tune-up",                        due: "This wk", dueDay: 3, priority: "med", done: false, links: 1, tags: ["vendor"] },
    { id: "t10", title: "Replace dishwasher filter",                    priority: "low", done: true, tags: ["chore"] },
    { id: "t11", title: "Get quotes — deck refinish",                   due: "Fri", dueDay: 4, priority: "med", done: false, attach: 4, subs: {done: 2, total: 3}, tags: ["contractor","$"], est: 45 },
    { id: "t12", title: "Order mulch & pots (spring)",                  priority: "low", done: false, tags: ["garden"] },
  ],
  health: [
    { id: "t13", title: "Annual physical · book with Dr. Yu",           due: "Next wk", priority: "med", done: false, tags: ["medical"] },
    { id: "t14", title: "Hit 3 gym sessions this week",                 priority: "med", done: false, subs: {done: 2, total: 3}, tags: ["habit"] },
  ],
  ai: [
    { id: "t15", title: "Wire Opus-4 agent to email triage",            due: "Wed", dueDay: 2,  priority: "high", done: false, subs: {done: 3, total: 8}, people: ["PS"], links: 4, tags: ["agent","triage"], est: 120 },
    { id: "t16", title: "Benchmark vector store latency · Qdrant vs pg",due: "Fri", dueDay: 4,  priority: "med",  done: false, attach: 1, subs: {done: 2, total: 5}, tags: ["infra","eval"], est: 60 },
    { id: "t17", title: "Draft system prompt v0.3 for Cockpit ⌘K",      priority: "med",  done: false, tags: ["prompt"] },
    { id: "t18", title: "Replay failed traces in Langsmith",            priority: "low",  done: false, subs: {done: 0, total: 2}, tags: ["debug"] },
  ],
};

// Notes row ────────────────
const NOTES = {
  work: [
    { id: "n1", title: "Board narrative — ARR bridge & expansion story", snippet: "Net new logos softer, expansion strong. Lead w/ retention curve, then pipeline coverage.", updated: "2h", tags: ["deck"] },
    { id: "n2", title: "Exec offsite agenda — draft 2",                   snippet: "Day 1: strategy refresh. Day 2: planning + team dinners. Need Celia's feedback on track 3.", updated: "yest" },
  ],
  personal: [
    { id: "n3", title: "Lisbon itinerary",                                 snippet: "Chiado 2 nights, Alfama 3 nights. Reservations: Cervejaria Ramiro, Prado, Belcanto.", updated: "3d" },
    { id: "n4", title: "Books to read · 2026",                             snippet: "The Creative Act, Rough Sleepers, Piranesi, Status & Culture.", updated: "1w" },
  ],
  house: [
    { id: "n5", title: "Renovation wishlist",                              snippet: "Kitchen: cabinet refinish, pendant lights, countertop. Budget ceiling ~$18k.", updated: "5d" },
  ],
  health: [
    { id: "n6", title: "Marathon training block — wk 6",                   snippet: "Legs felt heavy on Tue tempo. Pushing Sat long run to Sun; add 10min warmup.", updated: "today" },
    { id: "n7", title: "Supplements — AM/PM stack",                        snippet: "AM: creatine 5g, vit D 2k IU, fish oil. PM: mag glycinate, l-theanine.", updated: "2w" },
  ],
  ai: [
    { id: "n8", title: "Agent memory architecture sketch",                 snippet: "Episodic (recent), semantic (pinned facts), procedural (workflows). Use hybrid retrieval.", updated: "4h" },
    { id: "n9", title: "⌘K copilot · UX patterns survey",                  snippet: "Raycast, Linear, Superhuman, Arc. Best: command → preview → confirm w/ suggested follow-ups.", updated: "1d" },
  ],
};

// Events row (summary cards, not the agenda itself) ─────
const EVENTS_ROW = {
  work: [
    { id: "e1", title: "Board prep · Celia + Marcus",  when: "Mon 9:00–10:00",   loc: "Zoom" },
    { id: "e2", title: "Q2 kickoff · all-hands",        when: "Wed 11:00",        loc: "HQ / Union" },
    { id: "e3", title: "Sales review",                  when: "Thu 3:00",         loc: "Zoom" },
  ],
  personal: [
    { id: "e4", title: "Dinner · Kai & Noor",           when: "Fri 7:30",         loc: "Rintaro" },
  ],
  house: [
    { id: "e5", title: "Landscaper walk-through",        when: "Sat 10:00",       loc: "Home" },
  ],
  health: [
    { id: "e6", title: "Long run — 14mi",                when: "Sun 7:00",        loc: "GGP loop" },
    { id: "e7", title: "Strength · lower",               when: "Tue 6:30",        loc: "Fort Mason" },
  ],
  ai: [
    { id: "e8", title: "Lab sync w/ Priya",              when: "Thu 2:00",         loc: "Zoom" },
  ],
};

// Goals row ────────────────
const GOALS = {
  work: [
    { id: "g1", title: "Hit $14M ARR by end of Q2",                            progress: 0.62, detail: "$8.7M / $14M", pace: "on",     spark: [0.48,0.52,0.54,0.56,0.58,0.60,0.62] },
    { id: "g2", title: "Ship Cockpit MVP to design partners",                  progress: 0.35, detail: "3 / 8 surfaces", pace: "behind", spark: [0.20,0.22,0.25,0.28,0.30,0.33,0.35] },
  ],
  personal: [
    { id: "g3", title: "Read 24 books this year",                               progress: 0.42, detail: "10 / 24", pace: "on", spark: [0.25,0.28,0.31,0.34,0.37,0.40,0.42] },
  ],
  house: [
    { id: "g4", title: "Finish 1st-floor refinish · summer",                    progress: 0.2,  detail: "2 / 10 tasks", pace: "behind", spark: [0.10,0.12,0.15,0.17,0.18,0.19,0.20] },
  ],
  health: [
    { id: "g5", title: "Sub-3:30 marathon — Oct",                               progress: 0.55, detail: "wk 6 / 16", pace: "on",    spark: [0.30,0.35,0.40,0.45,0.48,0.52,0.55] },
    { id: "g6", title: "Lift 3×/wk for 8 consecutive weeks",                    progress: 0.75, detail: "wk 6 / 8", pace: "ahead",  spark: [0.45,0.52,0.58,0.63,0.68,0.72,0.75] },
  ],
  ai: [
    { id: "g7", title: "Ship agent eval harness v1",                            progress: 0.48, detail: "on track", pace: "on",     spark: [0.20,0.26,0.32,0.36,0.40,0.44,0.48] },
  ],
};

// Agenda events for weekly grid (time-based) ─────
// day: 0=Mon…6=Sun, start/end in hours (0–24)
const AGENDA_EVENTS = [
  { day: 0, start: 9,    end: 10,   title: "Board prep",                  project: "work"     },
  { day: 0, start: 11,   end: 11.5, title: "1:1 · Ren",                   project: "work"     },
  { day: 0, start: 14,   end: 15,   title: "Pricing review",              project: "work"     },
  { day: 1, start: 6.5,  end: 7.5,  title: "Strength · lower",            project: "health"   },
  { day: 1, start: 10,   end: 11,   title: "Eng standup",                 project: "work"     },
  { day: 1, start: 13,   end: 14,   title: "Lunch · Sam",                 project: "personal" },
  { day: 1, start: 16,   end: 17,   title: "Agent eval review",           project: "ai"       },
  { day: 2, start: 11,   end: 12,   title: "Q2 kickoff",                  project: "work"     },
  { day: 2, start: 14,   end: 15,   title: "HVAC tune-up",                project: "house"    },
  { day: 3, start: 9,    end: 10,   title: "Physical · Dr. Yu",           project: "health"   },
  { day: 3, start: 14,   end: 15,   title: "Lab sync · Priya",            project: "ai"       },
  { day: 3, start: 15,   end: 16,   title: "Sales review",                project: "work"     },
  { day: 4, start: 10,   end: 11,   title: "Design crit",                 project: "work"     },
  { day: 4, start: 19.5, end: 21.5, title: "Dinner · Kai & Noor",         project: "personal" },
  { day: 5, start: 10,   end: 11,   title: "Landscaper walk-through",     project: "house"    },
  { day: 6, start: 7,    end: 10,   title: "Long run · 14mi",             project: "health"   },
];

// All-day events (top strip in agenda)
const AGENDA_ALLDAY = [
  { day: 2, title: "Q2 kickoff day",       project: "work" },
  { day: 4, title: "Design crit",          project: "work" },
  { day: 5, title: "Kai's visit",          project: "personal" },
  { day: 6, title: "Long run",             project: "health" },
];

// Task drops onto agenda (dashed chips)
const AGENDA_TASKS = [
  { day: 0, start: 17,   title: "Finalize board deck",      project: "work" },
  { day: 2, start: 17,   title: "Wire Opus-4 triage",       project: "ai" },
  { day: 4, start: 13,   title: "Quotes — deck refinish",   project: "house" },
  { day: 5, start: 12,   title: "Order mulch",              project: "house" },
];

// Emails, grouped by account → category
const EMAILS = {
  gmail: {
    urgent: [
      { id: "m1", from: "Celia Rao",       subj: "Re: Q2 board deck — can you push your slides tonight?", snippet: "Need them before I head into my dinner. Even drafts work.", time: "14m", unread: true, flagged: true, chips: ["board"], sentiment: "urgent", quickReplies: ["On it — drafts by 8p", "Pushing now", "Need 1 more hour"] },
      { id: "m2", from: "Acme Legal",      subj: "MSA redline — needs your initials on §6.3",             snippet: "Attaching the redline. Sign-off blocks the rollout, apologies for the noise.", time: "1h", unread: true, chips: ["legal"], sentiment: "blocking", quickReplies: ["Signing today", "Looping in counsel"] },
    ],
    reply: [
      { id: "m3", from: "Ren Kapoor",       subj: "Eng 1:1 prep — topics for Wed",                         snippet: "Want to cover the eval harness, hiring pipeline, and on-call rotation.", time: "3h", unread: true },
      { id: "m4", from: "Priya Shah",       subj: "Thursday lab sync — can we bump 30min?",                snippet: "Got a customer intro I can't move. Start at 2:30 instead of 2?", time: "5h", unread: false },
    ],
    newsletters: [
      { id: "m5", from: "Stratechery",      subj: "The next platform shift (free)",                         snippet: "Ben's take on agentic workflows and vertical integration…", time: "6h", unread: false, chips: ["read later"] },
      { id: "m6", from: "Hacker Newsletter",subj: "Issue 742 · best of the week",                           snippet: "Highlights: 'A Philosophy of Software Design', LLM eval tooling…", time: "1d", unread: false },
    ],
  },
  outlook: {
    urgent: [
      { id: "m7", from: "Marcus Lin",       subj: "Forecast diff — please review before 5p",                snippet: "Finance pulled a new cut; deltas to the board model attached.", time: "22m", unread: true, flagged: true, chips: ["finance"], sentiment: "urgent", quickReplies: ["Reviewing now", "Meet at 4?"] },
    ],
    reply: [
      { id: "m8", from: "Tanya (EA)",       subj: "Scheduling — can I move Friday?",                        snippet: "Have a conflict with Kevin's team. Proposing Mon 3p or Tue 4p.", time: "2h", unread: true },
      { id: "m9", from: "Jordan (Sales)",   subj: "Acme intro — warm handoff?",                              snippet: "They asked about the new pricing tier. Mind replying directly?", time: "4h", unread: false },
    ],
    updates: [
      { id: "m10", from: "GitHub",          subj: "PR #1284 — agent-eval-v1 ready for review",               snippet: "Priya opened a pull request in predictivity/agent-eval.", time: "1h", unread: true, chips: ["pr"] },
      { id: "m11", from: "Linear",          subj: "Daily digest — 3 issues assigned to you",                 snippet: "COCK-214, COCK-232, COCK-240 · due this week", time: "8h", unread: false },
    ],
  },
  icloud: {
    urgent: [],
    reply: [
      { id: "m12", from: "Kai Brennan",     subj: "Friday at Rintaro — 7:30 still good?",                    snippet: "Noor can make it too. Planning on the omakase.", time: "5h", unread: true, chips: ["personal"] },
    ],
    updates: [
      { id: "m13", from: "iCloud",          subj: "Photo memory · This week last year",                      snippet: "12 photos from Lisbon…", time: "1d", unread: false },
    ],
    newsletters: [
      { id: "m14", from: "Patagonia",       subj: "New spring collection is here",                            snippet: "Fresh drops across hike, climb, and trail.", time: "2d", unread: false },
    ],
  },
};

window.DATA = { PROJECTS, ACCOUNTS, TASKS, NOTES, EVENTS_ROW, GOALS, AGENDA_EVENTS, AGENDA_TASKS, EMAILS };
