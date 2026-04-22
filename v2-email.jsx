/* global React, I */
// Email rail v2 — account-keyed surfaces, avatar tokens, per-email action row,
// save-to-folder + convert-to-task, quick-reply suggestion chips for urgent.

const CATEGORIES = [
  { id: "urgent",      label: "Urgent",          long: "AI-flagged · needs attention",  icon: "Zap",       class: "urgent" },
  { id: "reply",       label: "Needs reply",     long: "Waiting on you",                icon: "Reply",     class: "reply" },
  { id: "updates",     label: "Updates",         long: "Automated + tool",              icon: "Inbox",     class: "" },
  { id: "newsletters", label: "Newsletters",     long: "Read-later queue",              icon: "Newspaper", class: "" },
];

const FOLDERS = ["Board", "Finance", "Legal", "Personal", "Follow-ups"];

function initials(name) {
  return name.split(/\s+/).slice(0, 2).map(p => p[0]).join("").toUpperCase();
}

// Stylized brand marks for the account pills. Inline SVG so the prototype
// stays self-contained (no external assets).
function AcctMark({ id, size = 18 }) {
  const w = size, h = size;
  if (id === "gmail") {
    return (
      <svg width={w} height={h} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="2.5" fill="#fff" stroke="#d14836" strokeWidth="1.7" />
        <path d="M3 7l9 6 9-6" stroke="#d14836" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <text x="12" y="16.5" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="8" fill="#d14836">M</text>
      </svg>
    );
  }
  if (id === "outlook") {
    return (
      <svg width={w} height={h} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="3" fill="#0078d4" />
        <ellipse cx="12" cy="12" rx="4" ry="4.8" fill="none" stroke="#fff" strokeWidth="1.9" />
      </svg>
    );
  }
  if (id === "icloud") {
    return (
      <svg width={w} height={h} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 17.5a4.3 4.3 0 0 1-.4-8.58 5.5 5.5 0 0 1 10.67-1.3 4 4 0 0 1 .43 7.88z"
              fill="#cfd9e4" stroke="#6b7a8e" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    );
  }
  return null;
}

function EmailRail({ collapsed, setCollapsed, openedEmail, setOpenedEmail }) {
  const { ACCOUNTS, EMAILS } = window.DATA;
  const [activeAccts, setActiveAccts] = React.useState(["gmail","outlook","icloud"]);
  const [allAccounts, setAllAccounts] = React.useState(true);
  const [openGroups, setOpenGroups] = React.useState(["urgent","reply","updates"]);
  const [savedToFolder, setSavedToFolder] = React.useState({});   // id → folder
  const [convertedTasks, setConvertedTasks] = React.useState([]); // ids
  const [folderPickerFor, setFolderPickerFor] = React.useState(null);

  const totalUnread = ACCOUNTS.reduce((a, x) => a + x.unread, 0);
  const urgentCount = ACCOUNTS.reduce((a, x) => a + (EMAILS[x.id]?.urgent?.length || 0), 0);
  const replyCount  = ACCOUNTS.reduce((a, x) => a + (EMAILS[x.id]?.reply?.length  || 0), 0);

  if (collapsed) {
    return (
      <div className="email-rail collapsed" data-screen-label="Inbox (collapsed)">
        <div className="pane-head">
          <button className="ic-btn" onClick={() => setCollapsed(false)} title="Expand">
            <I.ChevL className="icon-sm" />
          </button>
          <I.Mail className="icon-sm" style={{ color: "var(--text-2)" }} />
          <div className="vert-label">Inbox · {totalUnread}</div>
          <div className="acct-dot-stack">
            {ACCOUNTS.map(a => (
              <div key={a.id} className="acct-dot-col" title={a.name + " · " + a.unread + " unread"}>
                <span className="acct-dot" style={{ background: a.color }} />
                <span className="acct-dot-count">{a.unread}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const combined = {};
  CATEGORIES.forEach(c => { combined[c.id] = []; });
  const visibleAccts = allAccounts ? ACCOUNTS : ACCOUNTS.filter(a => activeAccts.includes(a.id));
  visibleAccts.forEach(a => {
    CATEGORIES.forEach(c => {
      (EMAILS[a.id]?.[c.id] || []).forEach(m => combined[c.id].push({ ...m, account: a }));
    });
  });

  const saveTo = (id, folder) => {
    setSavedToFolder(s => ({ ...s, [id]: folder }));
    setFolderPickerFor(null);
  };
  const toTask = (id) => setConvertedTasks(t => t.includes(id) ? t : [...t, id]);

  return (
    <div className="email-rail" data-screen-label="Inbox">
      <div className="pane-head">
        <I.Grip className="grip icon-sm" />
        <I.Mail className="icon-sm" style={{ color: "var(--text-2)" }} />
        <span className="title">Inbox</span>
        <span className="title-sub">· AI-triaged · {visibleAccts.length} of {ACCOUNTS.length}</span>
        <div className="spacer" />
        <div className="icons">
          <button className="btn primary" style={{ padding: "4px 10px", fontWeight: 600 }}>
            <I.Edit className="icon-xs" /> Compose
          </button>
          <button className="ic-btn" title="Search"><I.Search className="icon-sm" /></button>
          <button className="ic-btn" title="Filter"><I.Filter className="icon-sm" /></button>
          <button className="ic-btn" title="Pop out"><I.PopOut className="icon-sm" /></button>
          <button className="ic-btn" onClick={() => setCollapsed(true)} title="Collapse">
            <I.ChevR className="icon-sm" />
          </button>
        </div>
      </div>

      {/* AI triage summary card */}
      <div className="email-hero">
        <div className="eh-left">
          <div className="eh-label"><I.Sparkles className="icon-xs" /> AI Triage · Today</div>
          <div className="eh-big tabnum">{totalUnread}</div>
          <div className="eh-sub">unread across {ACCOUNTS.length} accounts</div>
        </div>
        <div className="eh-stats">
          <div className="eh-stat urgent">
            <span className="eh-stat-num tabnum">{urgentCount}</span>
            <span className="eh-stat-lbl">URGENT</span>
          </div>
          <div className="eh-stat">
            <span className="eh-stat-num tabnum">{replyCount}</span>
            <span className="eh-stat-lbl">NEEDS REPLY</span>
          </div>
          <div className="eh-stat">
            <span className="eh-stat-num tabnum">~42<small>m</small></span>
            <span className="eh-stat-lbl">EST. TRIAGE</span>
          </div>
        </div>
      </div>

      {/* Account tiles — brand-marked, prominent */}
      <div className="email-accounts email-accounts-big">
        <div className={"acct-pill all " + (allAccounts ? "active" : "")}
             onClick={() => setAllAccounts(!allAccounts)}>
          <span className="acct-mark acct-mark-all"><I.Inbox className="icon-sm" /></span>
          <span className="acct-name">All</span>
          <span className="acct-badge">{totalUnread}</span>
        </div>
        {ACCOUNTS.map(a => {
          const on = activeAccts.includes(a.id);
          const active = on && !allAccounts;
          return (
            <div key={a.id}
                 className={"acct-pill " + (active ? "active" : "") + (!on ? " off" : "")}
                 style={{ "--acct-color": a.color }}
                 onClick={() => {
                   setAllAccounts(false);
                   setActiveAccts(on ? activeAccts.filter(x => x !== a.id) : [...activeAccts, a.id]);
                 }}
                 title={a.handle}>
              <span className="acct-rail" />
              <span className="acct-mark"><AcctMark id={a.id} size={18} /></span>
              <span className="acct-name">{a.name}</span>
              <span className="acct-badge">{a.unread}</span>
            </div>
          );
        })}
      </div>

      <div className="email-body">
        {CATEGORIES.map(cat => {
          const items = combined[cat.id];
          if (!items.length) return null;
          const open = openGroups.includes(cat.id);
          const Icon = I[cat.icon];
          return (
            <div key={cat.id} className="email-group">
              <div className={"egrp-head " + cat.class}
                   onClick={() => setOpenGroups(open
                     ? openGroups.filter(x => x !== cat.id)
                     : [...openGroups, cat.id])}>
                <Icon className="icon-xs" />
                <span className="egrp-title">{cat.label}</span>
                <span className="egrp-sub">{cat.long}</span>
                <div className="spacer" />
                <span className="egrp-count">{items.length}</span>
                {open ? <I.ChevD className="icon-xs" /> : <I.ChevR className="icon-xs" />}
              </div>
              {open ? items.map(m => {
                const isOpen   = openedEmail === m.id;
                const folder   = savedToFolder[m.id];
                const toTaskOn = convertedTasks.includes(m.id);
                const pickerOn = folderPickerFor === m.id;
                return (
                  <div key={m.id}
                       className={"email-item email-item-v2 "
                          + (m.unread ? "unread " : "")
                          + (cat.id === "urgent" ? "urgent " : "")
                          + (isOpen ? "opened " : "")
                          + "sent-" + (m.sentiment || "normal") }
                       onClick={() => setOpenedEmail?.(isOpen ? null : m.id)}
                       style={{ "--acct-color": m.account.color }}>
                    <span className="ei-acctrail" />
                    <div className="ei-avatar" style={{ "--acct-color": m.account.color }}>
                      {initials(m.from)}
                      <span className="ei-avatar-mark" title={m.account.name}>
                        <AcctMark id={m.account.id} size={12} />
                      </span>
                    </div>
                    <div className="ei-main">
                      <div className="ei-line1">
                        <span className="ei-from">{m.from}</span>
                        {m.flagged ? <I.Flag className="icon-xs" style={{ color: "var(--p-high)" }} /> : null}
                        <span className="ei-subj-inline">— {m.subj}</span>
                        <div className="spacer" />
                        {m.unread ? <span className="ei-dot-unread" /> : null}
                        <span className="ei-time tabnum">{m.time}</span>
                      </div>
                      <div className="ei-snip ei-snip-tight">{m.snippet}</div>

                      {/* Chips row — sentiment, tags, folder, task */}
                      <div className="ei-chips ei-chips-tight">
                        {m.sentiment === "urgent" ? <span className="sent-chip sent-urgent">URGENT</span> : null}
                        {m.sentiment === "blocking" ? <span className="sent-chip sent-blocking">BLOCKING</span> : null}
                        {(m.chips || []).map(c => <span key={c} className="ei-chip">#{c}</span>)}
                        {folder ? <span className="ei-chip ei-chip-folder"><I.Folder className="icon-xs" /> {folder}</span> : null}
                        {toTaskOn ? <span className="ei-chip ei-chip-task"><I.CheckSquare className="icon-xs" /> Task</span> : null}
                        <span className="ei-via">via {m.account.name}</span>
                      </div>

                      {/* Quick replies on urgent, when collapsed */}
                      {!isOpen && m.quickReplies && m.quickReplies.length ? (
                        <div className="ei-quickreplies" onClick={e => e.stopPropagation()}>
                          <I.Sparkles className="icon-xs" style={{ color: "var(--ai)" }} />
                          {m.quickReplies.slice(0, 3).map((q, i) => (
                            <span key={i} className="qr-chip">{q}</span>
                          ))}
                        </div>
                      ) : null}

                      {/* Expanded view */}
                      {isOpen ? (
                        <div className="ei-preview" onClick={e => e.stopPropagation()}>
                          <div className="eip-body">
                            {m.snippet} Adding more context here: the ask is specific, the timing is tight, and the downstream dependencies are nontrivial. Happy to jump on a quick call before EOD if it's easier than async.
                          </div>
                          <div className="eip-ai">
                            <I.Sparkles className="icon-xs" /> <span>AI suggests: confirm tonight, attach v3 deck, loop in Finance.</span>
                          </div>
                          <div className="eip-actions">
                            <button className="btn primary"><I.Reply className="icon-xs" /> Reply</button>
                            <button className="btn">Reply all</button>
                            <button className="btn">Forward</button>
                            <div className="spacer" />
                            <button className="btn ghost">Archive</button>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {/* Hover action rail — save to folder, convert to task, snooze, archive */}
                    <div className="ei-actions" onClick={e => e.stopPropagation()}>
                      <button className={"ei-act " + (folder ? "on" : "")}
                              onClick={() => setFolderPickerFor(pickerOn ? null : m.id)}
                              title="Save to folder">
                        <I.Folder className="icon-xs" />
                      </button>
                      <button className={"ei-act " + (toTaskOn ? "on" : "")}
                              onClick={() => toTask(m.id)}
                              title="Convert to task">
                        <I.CheckSquare className="icon-xs" />
                      </button>
                      <button className="ei-act" title="Snooze"><I.Clock className="icon-xs" /></button>
                      <button className="ei-act" title="Archive"><I.Archive className="icon-xs" /></button>
                    </div>

                    {/* Folder picker popover */}
                    {pickerOn ? (
                      <div className="ei-folder-pop" onClick={e => e.stopPropagation()}>
                        <div className="eifp-head">Save <b>{m.from}</b> to…</div>
                        {FOLDERS.map(f => (
                          <div key={f} className="eifp-opt" onClick={() => saveTo(m.id, f)}>
                            <I.Folder className="icon-xs" /> {f}
                          </div>
                        ))}
                        <div className="eifp-opt eifp-new"><I.Plus className="icon-xs" /> New folder…</div>
                      </div>
                    ) : null}
                  </div>
                );
              }) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.EmailRailV2 = EmailRail;
