/* global React, I */
// Combined Insights + command row (v3) — merges the old SubBar into
// the AI Brief strip so there's one consolidated row under the topbar
// instead of two. Order (left→right):
//   AI Brief badge · summary pills · More · week-nav · Today · Week|Day|Month · Replan day · View ▾ · ✕

function InsightsStrip({ onDismiss, colorBy, setColorBy, density, setDensity, weekLabel, onPrev, onNext, onToday }) {
  const { ACCOUNTS, EMAILS, TASKS, AGENDA_EVENTS } = window.DATA;
  const [expanded, setExpanded]       = React.useState(false);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [groupBy, setGroupBy]         = React.useState("project");
  const [focusMode, setFocusMode]     = React.useState(false);
  const popRef = React.useRef(null);

  const unread   = ACCOUNTS.reduce((a, x) => a + x.unread, 0);
  const urgent   = ACCOUNTS.reduce((a, x) => a + (EMAILS[x.id]?.urgent?.length || 0), 0);
  const overdue  = Object.values(TASKS).flat().filter(t => t.overdue).length;
  const meetings = AGENDA_EVENTS.filter(e => e.day === 1).length;

  // Close the View popover on outside-click
  React.useEffect(() => {
    if (!filtersOpen) return;
    const onDoc = (e) => {
      if (popRef.current && !popRef.current.contains(e.target)) setFiltersOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [filtersOpen]);

  const activeFilterCount =
    (groupBy !== "project" ? 1 : 0) +
    (colorBy !== "project" ? 1 : 0) +
    (focusMode ? 1 : 0);

  return (
    <div className={"insights-strip insights-compact insights-combined " + (expanded ? "expanded" : "")} data-screen-label="Command Row">
      <div className="insights-badge">
        <I.Sparkles className="icon-sm" />
        <span>AI Brief</span>
        <span className="pulse" />
      </div>

      {/* Summary pills (always visible) */}
      <div className="insights-summary">
        <span className="is-item"><b>{meetings}</b> mtgs</span>
        <span className="is-sep">·</span>
        <span className={"is-item " + (overdue ? "warn" : "")}><b>{overdue}</b> overdue</span>
        <span className="is-sep">·</span>
        <span className={"is-item " + (urgent ? "hot" : "")}><b>{urgent}</b> urgent</span>
        <span className="is-sep">·</span>
        <span className="is-item"><b>{unread}</b> unread</span>
        <span className="is-sep">·</span>
        <span className="is-item is-next">Next: <b>10:00</b> Eng standup</span>
      </div>

      <button
        className="btn btn-ghost is-expand-btn"
        onClick={() => setExpanded(x => !x)}
        title={expanded ? "Hide details" : "Show details"}>
        {expanded ? "Less" : "More"}
        {expanded ? <I.ChevU className="icon-xs" /> : <I.ChevD className="icon-xs" />}
      </button>

      {/* Vertical divider between brief summary and date/view controls */}
      <span className="ic-sep" aria-hidden="true" />

      {/* Week navigation (was the top menu bar) */}
      <div className="week-nav ic-week-nav">
        <button className="chev-btn" onClick={onPrev} aria-label="Previous week" title="Previous week">
          <I.ChevL className="icon-sm" />
        </button>
        <span className="date">{weekLabel}</span>
        <button className="chev-btn" onClick={onNext} aria-label="Next week" title="Next week">
          <I.ChevR className="icon-sm" />
        </button>
      </div>

      <button className="btn ic-today-btn" onClick={onToday}>Today</button>

      <div className="seg seg-sm ic-view-seg">
        <div className="seg-item active">Week</div>
        <div className="seg-item">Day</div>
        <div className="seg-item">Month</div>
      </div>

      <span className="ic-sep" aria-hidden="true" />

      {/* Primary action */}
      <button className="btn is-replan" title="Replan my day">
        <I.Sparkles className="icon-xs" /> Replan day
      </button>

      {/* View popover (Group / Color / Density / Focus) — formerly in SubBar */}
      <div className="sb-filter-wrap ic-view-wrap" ref={popRef}>
        <button
          className={"btn " + (filtersOpen ? "primary " : "") + (activeFilterCount ? "has-active " : "")}
          style={{ padding: "4px 10px" }}
          onClick={() => setFiltersOpen(o => !o)}
          title="View options">
          <I.Filter className="icon-xs" />
          <span>View</span>
          {activeFilterCount ? <span className="kbd-inline">{activeFilterCount}</span> : null}
          <I.ChevD className="icon-xs" />
        </button>

        {filtersOpen ? (
          <div className="sb-filter-pop">
            <div className="sbf-row">
              <span className="sbf-label">Group by</span>
              <div className="seg">
                {[["project","Project"],["priority","Priority"],["deadline","Deadline"]].map(([k, label]) => (
                  <div key={k}
                       className={"seg-item " + (groupBy === k ? "active" : "")}
                       onClick={() => setGroupBy(k)}>{label}</div>
                ))}
              </div>
            </div>

            <div className="sbf-row">
              <span className="sbf-label">Color by</span>
              <div className="seg">
                {["project","priority","type","account"].map(m => (
                  <div key={m}
                       className={"seg-item " + (colorBy === m ? "active" : "")}
                       onClick={() => setColorBy?.(m)}>
                    {m[0].toUpperCase() + m.slice(1)}
                  </div>
                ))}
              </div>
            </div>

            <div className="sbf-row">
              <span className="sbf-label">Density</span>
              <div className="seg seg-sm">
                {["compact","comfortable","roomy"].map(d => (
                  <div key={d}
                       className={"seg-item " + (density === d ? "active" : "")}
                       onClick={() => setDensity?.(d)}>{d[0].toUpperCase() + d.slice(1,4)}</div>
                ))}
              </div>
            </div>

            <div className="sbf-sep" />

            <div className="sbf-row">
              <label className="sbf-toggle">
                <input type="checkbox" checked={focusMode} onChange={e => setFocusMode(e.target.checked)} />
                <I.Sparkles className="icon-xs" style={{ color: "var(--ai)" }} />
                <span>Focus mode</span>
                <span className="sbf-hint">hide non-priority</span>
              </label>
            </div>

            <div className="sbf-sep" />

            <div className="sbf-row sbf-row-foot">
              <span className="sbf-label">Advanced filters</span>
              <button className="btn btn-ghost" style={{ padding: "2px 8px" }}>
                Open… <span className="kbd-inline">0</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <button className="ic-btn" onClick={onDismiss} title="Dismiss">
        <I.X className="icon-xs" />
      </button>

      {/* Expanded details row (below, full width) */}
      {expanded ? (
        <div className="insights-expanded">
          <div className="insight">
            <span className="ins-k">Today</span>
            <span className="ins-v"><b>{meetings}</b> mtgs · <b>4h 15m</b> focus</span>
          </div>
          <div className="insight warn">
            <span className="ins-k">Overdue</span>
            <span className="ins-v"><b>{overdue}</b> · passport</span>
          </div>
          <div className="insight hot">
            <span className="ins-k">Urgent</span>
            <span className="ins-v"><b>{urgent}</b> flagged</span>
          </div>
          <div className="insight">
            <span className="ins-k">Inbox</span>
            <span className="ins-v"><b>{unread}</b> · ~42m triage</span>
          </div>
          <div className="insight">
            <span className="ins-k">Next</span>
            <span className="ins-v"><b>10:00</b> Eng standup</span>
          </div>
          <div className="insight">
            <span className="ins-k">Goals</span>
            <span className="ins-v"><b style={{ color: "var(--p-good)" }}>on track</b></span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

window.InsightsV2 = InsightsStrip;
