/* global React, I */
// Kanban v2 — colored hero headers per project column, borderless cards,
// tabular numerics, uppercase tracked row labels, asset-type accent on cards.

const ROW_DEFS = [
  { id: "tasks",  label: "TASKS",  icon: "CheckSquare", source: "TASKS",      typeColor: "var(--type-tasks)"  },
  { id: "notes",  label: "NOTES",  icon: "FileText",    source: "NOTES",      typeColor: "var(--type-notes)"  },
  { id: "events", label: "EVENTS", icon: "Calendar",    source: "EVENTS_ROW", typeColor: "var(--type-events)" },
  { id: "goals",  label: "GOALS",  icon: "Target",      source: "GOALS",      typeColor: "var(--type-goals)"  },
];

function Chip({ kind, children }) {
  return <span className={"chip " + (kind || "")}>{children}</span>;
}

function accentFor(project, row, colorBy, typeColor, item) {
  if (colorBy === "project")  return project.color;
  if (colorBy === "type")     return typeColor;
  if (colorBy === "priority") {
    const p = item?.priority;
    return p === "high" ? "var(--p-high)" : p === "med" ? "var(--p-med)" : "var(--p-low)";
  }
  return "var(--text-4)";
}

function TaskCard({ t, accent, project }) {
  const weekLetters = ["M","T","W","T","F","S","S"];
  const pct = t.subs ? (t.subs.done / t.subs.total) : null;
  const urgencyClass = t.overdue ? "over" : t.soon ? "soon" : t.priority === "high" ? "hi" : t.priority === "med" ? "md" : "lo";
  return (
    <div className={"tcard " + (t.done ? "done" : "") + " u-" + urgencyClass} style={{ "--accent": accent }}>
      <div className="tcard-rail" />
      <div className="tcard-body">
        <div className="tcard-top">
          <span className={"checkbox " + (t.done ? "checked" : "")}>
            {t.done ? <I.Check className="icon-xs" style={{ stroke: "#fff" }} /> : null}
          </span>
          <span className="tcard-title">{t.title}</span>
          {t.priority ? <span className={"prio-pip p-" + t.priority} title={t.priority} /> : null}
        </div>

        {/* Week calendar strip — shows which day the task falls */}
        {t.dueDay != null ? (
          <div className="tcard-week">
            {weekLetters.map((lt, i) => (
              <span key={i} className={"twd " + (i === t.dueDay ? "on" : "") + (i < t.dueDay && t.overdue ? " past" : "")}>
                {lt}
              </span>
            ))}
            <span className="twd-due">{t.due}</span>
          </div>
        ) : null}

        {/* Tags row */}
        {(t.tags && t.tags.length) || project ? (
          <div className="tcard-tags">
            {project ? (
              <span className="tag-proj" style={{ "--tp": project.color }}>
                <span className="tp-dot" />{project.name}
              </span>
            ) : null}
            {(t.tags || []).map(tag => <span key={tag} className="tag-pill">{tag}</span>)}
          </div>
        ) : null}

        {/* Meta foot — subs, people, attachments, links, est */}
        <div className="tcard-foot">
          {t.subs ? (
            <span className="tf-seg tf-subs" title={`${t.subs.done} of ${t.subs.total} subtasks`}>
              <I.CheckSquare className="icon-xs" />
              <span className="tabnum">{t.subs.done}/{t.subs.total}</span>
              {pct != null ? (
                <span className="tf-bar">
                  <span className="tf-bar-fill" style={{ width: (pct * 100) + "%" }} />
                </span>
              ) : null}
            </span>
          ) : null}
          {t.people && t.people.length ? (
            <span className="tf-seg tf-people">
              {t.people.slice(0, 3).map((p, i) => <span key={i} className="avatar-xs">{p}</span>)}
              {t.people.length > 3 ? <span className="avatar-xs avatar-more">+{t.people.length - 3}</span> : null}
            </span>
          ) : null}
          {t.attach ? <span className="tf-seg"><I.Paperclip className="icon-xs" /><span className="tabnum">{t.attach}</span></span> : null}
          {t.links ? <span className="tf-seg"><I.Link className="icon-xs" /><span className="tabnum">{t.links}</span></span> : null}
          {t.est ? <span className="tf-seg tf-est"><I.Clock className="icon-xs" /><span className="tabnum">{t.est}m</span></span> : null}
          <span className="tf-spacer" />
          {t.overdue ? <span className="tf-flag overdue">OVER</span> : t.soon ? <span className="tf-flag soon">SOON</span> : null}
        </div>
      </div>
    </div>
  );
}

function NoteCard({ n, accent }) {
  return (
    <div className="card note" style={{ "--accent": accent }}>
      <div className="card-top">
        <I.FileText className="card-icon icon-sm" />
        <span className="title-text">{n.title}</span>
      </div>
      <div className="note-snippet">{n.snippet}</div>
      <div className="card-meta">
        <span>{n.updated}</span>
        {(n.tags || []).map(t => <Chip key={t}>#{t}</Chip>)}
      </div>
    </div>
  );
}

function EventCard({ e, accent }) {
  const [d, t] = e.when.split(" ");
  return (
    <div className="card event" style={{ "--accent": accent }}>
      <div className="card-top">
        <div className="time-col">
          <small>{d}</small>
          {t || ""}
        </div>
        <span className="title-text">{e.title}</span>
      </div>
      <div className="card-meta">
        <I.Clock className="icon-xs" /> <span>{e.loc}</span>
      </div>
    </div>
  );
}

function GoalCard({ g, accent, hero }) {
  return (
    <div className={"card goal " + (hero ? "goal-hero" : "")} style={{ "--accent": accent }}>
      <div className="card-top">
        {!hero ? <I.Target className="card-icon icon-sm" /> : null}
        <span className="title-text">{g.title}</span>
      </div>
      <div className="progress-bar"><div style={{ width: (g.progress * 100) + "%" }} /></div>
      <div className="progress-meta">
        <span>{g.detail}</span>
        <b>{Math.round(g.progress * 100)}%</b>
      </div>
    </div>
  );
}

function CardFor({ row, item, accent, isHero, project }) {
  if (row === "tasks")  return <TaskCard  t={item} accent={accent} project={project} />;
  if (row === "notes")  return <NoteCard  n={item} accent={accent} project={project} />;
  if (row === "events") return <EventCard e={item} accent={accent} project={project} />;
  if (row === "goals")  return <GoalCard  g={item} accent={accent} hero={isHero} project={project} />;
  return null;
}

function Kanban({ projectFilters, colorBy, collapsedRows, setCollapsedRows, onOpenCard }) {
  const { PROJECTS, TASKS, NOTES, EVENTS_ROW, GOALS } = window.DATA;
  const sources = { tasks: TASKS, notes: NOTES, events: EVENTS_ROW, goals: GOALS };
  const projects = PROJECTS.filter(p => projectFilters.includes(p.id));
  const cols = projects.length;

  const openTasks = (pid) => (TASKS[pid] || []).filter(t => !t.done).length;

  return (
    <div className="pane kanban-wrap" data-screen-label="Cockpit Grid" data-empty={cols === 0 ? "true" : "false"}>
      <div className="pane-head">
        <I.Grip className="grip icon-sm" />
        <I.Grid className="icon-sm" style={{ color: "var(--text-2)" }} />
        <span className="title">Command Grid</span>
        <span className="title-sub">· {cols}×4 matrix</span>
        <span className="count">
          {projects.reduce((a, p) => a + openTasks(p.id), 0)} open · {projects.length} projects
        </span>
        <div className="spacer" />
        <button className="btn" style={{ padding: "4px 8px" }}>
          <I.Plus className="icon-xs" /> Row
        </button>
        <div className="icons">
          <button className="ic-btn" title="Filter"><I.Filter className="icon-sm" /></button>
          <button className="ic-btn" title="Layout"><I.Layout className="icon-sm" /></button>
          <button className="ic-btn" title="Pop out"><I.PopOut className="icon-sm" /></button>
          <button className="ic-btn" title="More"><I.Dots className="icon-sm" /></button>
        </div>
      </div>

      <div className="kanban-grid">
        {/* Column hero headers */}
        <div className="kgrid-head" style={{ "--cols": cols }}>
          <div className="kh-row-spacer" />
          {projects.map(p => {
            const tCount    = (TASKS[p.id]      || []).length;
            const tOpen     = (TASKS[p.id]      || []).filter(t => !t.done).length;
            const eCount    = (EVENTS_ROW[p.id] || []).length;
            const nCount    = (NOTES[p.id]      || []).length;
            const sp        = p.spark || [];
            const spMax     = Math.max(1, ...sp);
            const dueWk     = p.dueWk || { done: 0, total: 0 };
            const duePct    = dueWk.total ? dueWk.done / dueWk.total : 0;
            const trendIcon = p.trend === "up" ? "↗" : p.trend === "down" ? "↘" : "→";
            return (
              <div key={p.id} className={"proj-hero health-" + (p.health || "ok")} style={{ "--proj-bg": p.color }}>
                <div className="ph-top">
                  <div className="ph-name"><span className="sw" />{p.name}</div>
                  <div className="ph-trend" title={"Trend " + p.trend}>
                    {trendIcon}
                  </div>
                </div>
                <div className="ph-meta">
                  <span><b>{tOpen}</b>OPEN</span>
                  <span><b>{eCount}</b>EV</span>
                  <span><b>{nCount}</b>NOTES</span>
                </div>
                <div className="ph-stat-row">
                  <div className="ph-stat">
                    {tCount}
                    <small>Tasks</small>
                  </div>
                  <svg className="ph-spark" viewBox="0 0 70 24" preserveAspectRatio="none">
                    <polyline
                      fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
                      points={sp.map((v, i) => `${(i / (sp.length - 1)) * 68 + 1},${22 - (v / spMax) * 20}`).join(" ")}
                    />
                    {sp.length ? (
                      <circle
                        cx={(sp.length - 1) / (sp.length - 1) * 68 + 1}
                        cy={22 - (sp[sp.length - 1] / spMax) * 20}
                        r="1.8" fill="#fff"
                      />
                    ) : null}
                  </svg>
                </div>
                <div className="ph-due">
                  <div className="ph-due-bar">
                    <div className="ph-due-fill" style={{ width: (duePct * 100) + "%" }} />
                  </div>
                  <span className="ph-due-label"><span className="tabnum">{dueWk.done}/{dueWk.total}</span> THIS WK</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rows */}
        {ROW_DEFS.map(row => {
          const collapsed = collapsedRows.includes(row.id);
          const RowIcon = I[row.icon];
          const totalInRow = projects.reduce((acc, p) => acc + (sources[row.id][p.id]?.length || 0), 0);
          return (
            <div key={row.id} className={"krow " + (collapsed ? "collapsed" : "")}>
              <div className="kgrid-body" style={{ "--cols": cols }}>
                <div className="krow-label" style={{ "--type-color": row.typeColor }}>
                  <div className="row-chev"
                       onClick={() => setCollapsedRows(collapsed
                         ? collapsedRows.filter(x => x !== row.id)
                         : [...collapsedRows, row.id])}>
                    {collapsed ? <I.ChevR className="icon-xs" /> : <I.ChevD className="icon-xs" />}
                    <RowIcon className="icon-xs" />
                  </div>
                  <div className="tag">
                    {row.label}
                    <span className="count">{totalInRow}</span>
                  </div>
                </div>

                {projects.map((p, pi) => {
                  const items = sources[row.id][p.id] || [];
                  return (
                    <div key={p.id} className="kcell">
                      {collapsed ? (
                        <div className="collapsed-pill">
                          <span>{row.label.toLowerCase()}</span>
                          <b>{items.length}</b>
                        </div>
                      ) : (
                        <React.Fragment>
                          {items.map((item, ii) => (
                            <div key={item.id} onClick={() => onOpenCard?.({ row: row.id, data: item, project: p })}>
                              <CardFor
                                row={row.id}
                                item={item}
                                accent={accentFor(p, row.id, colorBy, row.typeColor, item)}
                                isHero={row.id === "goals" && ii === 0 && colorBy === "project"}
                                project={p}
                              />
                            </div>
                          ))}
                          <div className="kcell-add">
                            <I.Plus className="icon-xs" /> Add {row.id.replace(/s$/, "")}
                          </div>
                        </React.Fragment>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div style={{
          padding: "10px 8px 4px", color: "var(--text-4)", fontSize: 11,
          display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
          fontWeight: 500, letterSpacing: "0.04em"
        }}>
          <I.Plus className="icon-xs" /> ADD CUSTOM ROW — habits, contacts, docs…
        </div>
      </div>
    </div>
  );
}

window.KanbanV2 = Kanban;
