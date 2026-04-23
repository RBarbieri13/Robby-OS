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

// ───────────── Inline edit popover primitives ─────────────
// Self-contained — positioned absolute inside the anchor, outside-click
// closes. Each popover writes through onCommit(newValue).

function Popover({ open, onClose, children, className = "" }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    document.addEventListener("mousedown", onDoc);
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div ref={ref} className={"tc-pop " + className} onClick={e => e.stopPropagation()}>
      {children}
    </div>
  );
}

function DateEditor({ value, onCommit, onClose }) {
  const quick = [
    { label: "Today",    value: "Today" },
    { label: "Tomorrow", value: "Tomorrow" },
    { label: "Mon",      value: "Mon" },
    { label: "Tue",      value: "Tue" },
    { label: "Wed",      value: "Wed" },
    { label: "Thu",      value: "Thu" },
    { label: "Fri",      value: "Fri" },
    { label: "Next wk",  value: "Next wk" },
    { label: "No date",  value: null },
  ];
  const [custom, setCustom] = React.useState(value || "");
  return (
    <div className="tc-pop-body">
      <div className="tc-pop-label">Quick pick</div>
      <div className="tc-pop-grid">
        {quick.map(q => (
          <button key={q.label}
                  className={"tc-pop-opt " + (value === q.value ? "active" : "")}
                  onClick={() => { onCommit(q.value); onClose(); }}>
            {q.label}
          </button>
        ))}
      </div>
      <div className="tc-pop-label" style={{ marginTop: 8 }}>Custom</div>
      <div style={{ display: "flex", gap: 4 }}>
        <input className="tc-pop-input" type="text" value={custom}
               placeholder="e.g. Apr 28"
               onChange={e => setCustom(e.target.value)}
               onKeyDown={e => { if (e.key === "Enter") { onCommit(custom); onClose(); } }}
               autoFocus />
        <button className="tc-pop-go" onClick={() => { onCommit(custom); onClose(); }}>Set</button>
      </div>
    </div>
  );
}

function PriorityEditor({ value, onCommit, onClose }) {
  const opts = [
    { id: "high", label: "HIGH", color: "var(--p-high)" },
    { id: "med",  label: "MED",  color: "var(--p-med)"  },
    { id: "low",  label: "LOW",  color: "var(--p-low)"  },
    { id: null,   label: "—",    color: "var(--text-4)" },
  ];
  return (
    <div className="tc-pop-body">
      <div className="tc-pop-label">Priority</div>
      <div className="tc-pop-col">
        {opts.map(o => (
          <button key={String(o.id)}
                  className={"tc-pop-opt tc-pop-prio " + (value === o.id ? "active" : "")}
                  onClick={() => { onCommit(o.id); onClose(); }}>
            <span className="tc-pop-prio-sw" style={{ background: o.color }} />
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function TitleEditor({ value, onCommit, onClose }) {
  const [txt, setTxt] = React.useState(value);
  return (
    <div className="tc-pop-body tc-pop-title-edit">
      <input className="tc-pop-input" type="text" value={txt}
             onChange={e => setTxt(e.target.value)}
             onKeyDown={e => {
               if (e.key === "Enter") { onCommit(txt); onClose(); }
               if (e.key === "Escape") onClose();
             }}
             autoFocus />
      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
        <button className="tc-pop-go" onClick={() => { onCommit(txt); onClose(); }}>Save</button>
        <button className="tc-pop-cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}


// ───────────── TaskCard — compact by default, expand for detail ─────────────

function TaskCard({ t, accent, project, expanded, onToggleExpand, onEdit, onInspect }) {
  const weekLetters = ["M","T","W","T","F","S","S"];
  const pct = t.subs ? (t.subs.done / t.subs.total) : null;
  const urgencyClass = t.overdue ? "over" : t.soon ? "soon" : t.priority === "high" ? "hi" : t.priority === "med" ? "md" : "lo";

  const [pop, setPop] = React.useState(null);  // "title" | "date" | "priority" | null
  const close = () => setPop(null);
  const stop = (e) => e.stopPropagation();

  const priorityLabel = t.priority ? t.priority.toUpperCase() : null;

  return (
    <div className={"tcard tcard-compact " + (t.done ? "done " : "") + (expanded ? "expanded " : "") + "u-" + urgencyClass}
         style={{ "--accent": accent }}
         onClick={(e) => {
           // Card body → Inspector (unless click landed on an interactive el)
           if (e.target.closest(".tc-edit, .tcard-expand, .checkbox")) return;
           onInspect?.();
         }}>
      <div className="tcard-rail" />
      <div className="tcard-body">
        {/* Row 1: checkbox + title + expand */}
        <div className="tcard-line1" onClick={stop}>
          <span className={"checkbox " + (t.done ? "checked" : "")}
                role="checkbox"
                aria-checked={t.done ? "true" : "false"}
                aria-label="Toggle done"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); onEdit?.("done", !t.done); }}>
            {t.done ? <I.Check className="icon-xs" style={{ stroke: "#fff" }} /> : null}
          </span>

          <span className="tcard-title tc-edit"
                role="button"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); setPop("title"); }}
                title="Click to edit title">
            {t.title}
          </span>

          <button className="tcard-expand"
                  aria-label={expanded ? "Collapse details" : "Expand details"}
                  title={expanded ? "Collapse details" : "Expand details"}
                  onClick={(e) => { e.stopPropagation(); onToggleExpand?.(); }}>
            {expanded ? <I.ChevU className="icon-xs" /> : <I.ChevD className="icon-xs" />}
          </button>

          {pop === "title" ? (
            <Popover open onClose={close} className="tc-pop-anchor-title">
              <TitleEditor value={t.title} onCommit={(v) => onEdit?.("title", v)} onClose={close} />
            </Popover>
          ) : null}
        </div>

        {/* Row 2: date chip + priority chip */}
        <div className="tcard-line2" onClick={stop}>
          <button className={"tc-chip tc-chip-date tc-edit " + (t.overdue ? "overdue" : t.soon ? "soon" : "")}
                  onClick={(e) => { e.stopPropagation(); setPop("date"); }}
                  title="Click to change date">
            <I.Clock className="icon-xs" />
            <span>{t.due || "No date"}</span>
            {pop === "date" ? (
              <Popover open onClose={close}>
                <DateEditor value={t.due} onCommit={(v) => onEdit?.("due", v)} onClose={close} />
              </Popover>
            ) : null}
          </button>

          <button className={"tc-chip tc-chip-prio tc-edit prio-" + (t.priority || "none")}
                  onClick={(e) => { e.stopPropagation(); setPop("priority"); }}
                  title="Click to change priority">
            {priorityLabel || "—"}
            {pop === "priority" ? (
              <Popover open onClose={close}>
                <PriorityEditor value={t.priority} onCommit={(v) => onEdit?.("priority", v)} onClose={close} />
              </Popover>
            ) : null}
          </button>

          {t.overdue ? <span className="tc-flag overdue">OVER</span>
            : t.soon ? <span className="tc-flag soon">SOON</span>
            : null}
        </div>

        {/* Expanded details — everything else */}
        {expanded ? (
          <div className="tcard-expanded" onClick={stop}>
            {/* Week strip */}
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

            {/* Tags */}
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

            {/* Meta foot */}
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
            </div>
          </div>
        ) : null}
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

function CardFor({ row, item, accent, isHero, project, expanded, onToggleExpand, onEdit, onInspect }) {
  if (row === "tasks")  return <TaskCard t={item} accent={accent} project={project}
                                         expanded={expanded}
                                         onToggleExpand={onToggleExpand}
                                         onEdit={onEdit}
                                         onInspect={onInspect} />;
  if (row === "notes")  return <NoteCard  n={item} accent={accent} project={project} />;
  if (row === "events") return <EventCard e={item} accent={accent} project={project} />;
  if (row === "goals")  return <GoalCard  g={item} accent={accent} hero={isHero} project={project} />;
  return null;
}

function Kanban({ projectFilters, colorBy, collapsedRows, setCollapsedRows, onOpenCard, cardEdits, onCardEdit, expandedCards, toggleExpandCard, cardOrder, onReorder }) {
  const { PROJECTS, TASKS, NOTES, EVENTS_ROW, GOALS } = window.DATA;
  const sources = { tasks: TASKS, notes: NOTES, events: EVENTS_ROW, goals: GOALS };
  const projects = PROJECTS.filter(p => projectFilters.includes(p.id));
  const cols = projects.length;

  const openTasks = (pid) => (TASKS[pid] || []).filter(t => !t.done).length;

  // Drag-and-drop state. dragging identifies the source card; dropHint
  // identifies where the drop indicator should render (target card id +
  // before/after, or an empty cell).
  const [dragging, setDragging] = React.useState(null);      // { id, row, projectId, idx }
  const [dropHint, setDropHint] = React.useState(null);      // { targetId, edge } | { emptyCell: projectId, row }

  const resolveOrder = (rowId, projectId, items) => {
    const savedIds = cardOrder?.[rowId]?.[projectId] || [];
    if (!savedIds.length) return items;
    const byId = Object.fromEntries(items.map(it => [it.id, it]));
    const ordered = [];
    // Saved order first (skipping any IDs no longer in items)
    for (const id of savedIds) {
      if (byId[id]) { ordered.push(byId[id]); delete byId[id]; }
    }
    // Append any new items that didn't have a saved position
    ordered.push(...items.filter(it => byId[it.id]));
    return ordered;
  };

  const onDragStartCard = (e, id, rowId, projectId, idx) => {
    e.stopPropagation();
    try { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", id); } catch (_) {}
    setDragging({ id, row: rowId, projectId, idx });
  };
  const onDragEndCard = () => {
    setDragging(null);
    setDropHint(null);
  };
  const onDragOverCard = (e, targetId, rowId, projectId) => {
    if (!dragging || dragging.row !== rowId) return;     // only reorder within same row type
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    const rect = e.currentTarget.getBoundingClientRect();
    const edge = (e.clientY - rect.top) < rect.height / 2 ? "before" : "after";
    setDropHint({ targetId, edge });
  };
  const onDropCard = (e, targetId, rowId, projectId) => {
    if (!dragging || dragging.row !== rowId) return;
    e.preventDefault();
    e.stopPropagation();
    const { id: dragId, projectId: srcProject } = dragging;
    if (dragId === targetId) { setDragging(null); setDropHint(null); return; }
    const edge = dropHint?.edge || "before";
    // Build the new ordered ID list for the target (row, projectId) cell
    const targetItems = resolveOrder(rowId, projectId, sources[rowId][projectId] || []);
    const targetIds = targetItems.map(it => it.id).filter(id => id !== dragId);
    const idx = targetIds.indexOf(targetId);
    const insertAt = edge === "before" ? idx : idx + 1;
    targetIds.splice(insertAt, 0, dragId);

    // If the drag crossed project columns within the same row, remove
    // dragId from the source column's order too
    let nextOrder = { ...(cardOrder || {}) };
    nextOrder[rowId] = { ...(nextOrder[rowId] || {}) };
    if (srcProject !== projectId) {
      const srcItems = resolveOrder(rowId, srcProject, sources[rowId][srcProject] || []);
      const srcIds = srcItems.map(it => it.id).filter(id => id !== dragId);
      nextOrder[rowId][srcProject] = srcIds;
    }
    nextOrder[rowId][projectId] = targetIds;
    onReorder?.(nextOrder);
    setDragging(null);
    setDropHint(null);
  };
  const onDragOverEmpty = (e, rowId, projectId) => {
    if (!dragging || dragging.row !== rowId) return;
    e.preventDefault();
    e.stopPropagation();
    setDropHint({ emptyCell: projectId, row: rowId });
  };
  const onDropEmpty = (e, rowId, projectId) => {
    if (!dragging || dragging.row !== rowId) return;
    e.preventDefault();
    const { id: dragId, projectId: srcProject } = dragging;
    let nextOrder = { ...(cardOrder || {}) };
    nextOrder[rowId] = { ...(nextOrder[rowId] || {}) };
    if (srcProject !== projectId) {
      const srcItems = resolveOrder(rowId, srcProject, sources[rowId][srcProject] || []);
      nextOrder[rowId][srcProject] = srcItems.map(it => it.id).filter(id => id !== dragId);
    }
    const destItems = resolveOrder(rowId, projectId, sources[rowId][projectId] || []);
    const destIds = destItems.map(it => it.id).filter(id => id !== dragId);
    destIds.push(dragId);
    nextOrder[rowId][projectId] = destIds;
    onReorder?.(nextOrder);
    setDragging(null);
    setDropHint(null);
  };

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
                  const baseItems = sources[row.id][p.id] || [];
                  const items = resolveOrder(row.id, p.id, baseItems);
                  const isEmptyDropTarget = dropHint?.emptyCell === p.id
                    && dropHint?.row === row.id
                    && items.length === 0;
                  return (
                    <div key={p.id}
                         className={"kcell " + (isEmptyDropTarget ? "drop-target" : "")}
                         onDragOver={items.length === 0 ? (e => onDragOverEmpty(e, row.id, p.id)) : undefined}
                         onDrop={items.length === 0 ? (e => onDropEmpty(e, row.id, p.id)) : undefined}>
                      {collapsed ? (
                        <div className="collapsed-pill">
                          <span>{row.label.toLowerCase()}</span>
                          <b>{items.length}</b>
                        </div>
                      ) : (
                        <React.Fragment>
                          {items.map((item, ii) => {
                            // Merge user edits on top of base data so all fields
                            // reflect the latest localStorage-persisted state.
                            const edits = cardEdits?.[item.id] || {};
                            const mergedItem = { ...item, ...edits };
                            if (edits.due !== undefined) {
                              mergedItem.overdue = false;
                              mergedItem.soon = false;
                            }
                            const isDragging = dragging?.id === item.id;
                            const isDropTarget = dropHint?.targetId === item.id;
                            const dropEdgeClass = isDropTarget
                              ? (dropHint.edge === "before" ? "drop-before" : "drop-after")
                              : "";
                            return (
                              <div
                                key={item.id}
                                draggable={true}
                                onDragStart={(e) => onDragStartCard(e, item.id, row.id, p.id, ii)}
                                onDragEnd={onDragEndCard}
                                onDragOver={(e) => onDragOverCard(e, item.id, row.id, p.id)}
                                onDrop={(e) => onDropCard(e, item.id, row.id, p.id)}
                                className={"kdrag " + (isDragging ? "dragging " : "") + dropEdgeClass}
                              >
                                <CardFor
                                  row={row.id}
                                  item={mergedItem}
                                  accent={accentFor(p, row.id, colorBy, row.typeColor, mergedItem)}
                                  isHero={row.id === "goals" && ii === 0 && colorBy === "project"}
                                  project={p}
                                  expanded={!!expandedCards?.[item.id]}
                                  onToggleExpand={() => toggleExpandCard?.(item.id)}
                                  onEdit={(field, value) => onCardEdit?.(item.id, field, value)}
                                  onInspect={() => onOpenCard?.({ row: row.id, data: mergedItem, project: p })}
                                />
                              </div>
                            );
                          })}
                          <div className="kcell-add"
                               onDragOver={(e) => onDragOverEmpty(e, row.id, p.id)}
                               onDrop={(e) => onDropEmpty(e, row.id, p.id)}>
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
