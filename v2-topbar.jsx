/* global React, I */
// Top bar (breadcrumb + search + utilities) and sub bar (week nav + filters).

function TopBar({ view, theme, setTheme, cockpitName, onOpenTweaks, onOpenPalette, onOpenLayouts, layoutPreset, density, setDensity }) {
  const viewLabel = {
    cockpit: cockpitName,
    inbox: "Inbox",
    mail: "Mail",
    cal: "Calendar",
    tasks: "Tasks",
    notes: "Notes",
    goals: "Goals",
  }[view] || cockpitName;

  const [addOpen, setAddOpen]       = React.useState(false);
  const [layoutOpen, setLayoutOpen] = React.useState(false);
  const [notifOpen, setNotifOpen]   = React.useState(false);
  const [viewOpen, setViewOpen]     = React.useState(false);

  // Close all popovers on outside click
  React.useEffect(() => {
    const onClick = () => { setAddOpen(false); setLayoutOpen(false); setNotifOpen(false); setViewOpen(false); };
    if (addOpen || layoutOpen || notifOpen || viewOpen) {
      document.addEventListener("click", onClick);
      return () => document.removeEventListener("click", onClick);
    }
  }, [addOpen, layoutOpen, notifOpen, viewOpen]);

  const stop = (e) => e.stopPropagation();

  return (
    <div className="topbar">
      <div className="crumb">
        <span>Workspace</span>
        <span className="sep">/</span>
        <b>{viewLabel}</b>
        <span className="sep" style={{ marginLeft: 4 }}>·</span>
        <span className="crumb-date">Tue, Apr 21</span>
      </div>

      <div className="search" onClick={onOpenPalette} style={{ cursor: "text" }}>
        <I.Search className="icon-sm" />
        <span className="search-placeholder">
          Search or ask <span className="search-hint">tasks · notes · events · mail</span>
        </span>
        <span className="kbd">⌘K</span>
      </div>

      <div className="topbar-right">
        {/* Quick add — grouped split button */}
        <div className="split-btn" onClick={stop}>
          <button className="sb-primary" onClick={() => setAddOpen(false)}>
            <I.Plus className="icon-sm" />
            Quick add
          </button>
          <button className="sb-caret" onClick={() => setAddOpen(o => !o)}>
            <I.ChevD className="icon-xs" />
          </button>
          {addOpen ? (
            <div className="tb-pop">
              <div className="tbp-section">Create new</div>
              <div className="tbp-row"><I.CheckSquare className="icon-sm" /> Task <span className="kbd">T</span></div>
              <div className="tbp-row"><I.FileText className="icon-sm" /> Note <span className="kbd">N</span></div>
              <div className="tbp-row"><I.Calendar className="icon-sm" /> Event <span className="kbd">E</span></div>
              <div className="tbp-row"><I.Target className="icon-sm" /> Goal</div>
              <div className="tbp-sep" />
              <div className="tbp-row"><I.Sparkles className="icon-sm" style={{ color: "var(--ai)" }} /> Ask Cockpit…</div>
            </div>
          ) : null}
        </div>

        {/* Layout preset dropdown */}
        <div className="tb-group" onClick={stop}>
          <button className="btn" onClick={() => setLayoutOpen(o => !o)}>
            <I.Layout className="icon-sm" />
            {layoutPreset || "Morning"}
            <I.ChevD className="icon-xs" />
          </button>
          {layoutOpen ? (
            <div className="tb-pop">
              <div className="tbp-section">Layout preset</div>
              <div className="tbp-row active"><span className="tbp-dot" style={{ background: "var(--work)" }} /> Morning</div>
              <div className="tbp-row"><span className="tbp-dot" style={{ background: "var(--health)" }} /> Focus</div>
              <div className="tbp-row"><span className="tbp-dot" style={{ background: "var(--personal)" }} /> Review</div>
              <div className="tbp-row"><span className="tbp-dot" style={{ background: "var(--house)" }} /> Planning</div>
              <div className="tbp-sep" />
              <div className="tbp-row tbp-muted"><I.Plus className="icon-xs" /> Save current as…</div>
              <div className="tbp-row tbp-muted"><I.Edit className="icon-xs" /> Manage presets</div>
            </div>
          ) : null}
        </div>

        {/* Notifications */}
        <div className="tb-group" onClick={stop}>
          <button className="ic-btn" onClick={() => setNotifOpen(o => !o)} title="Notifications">
            <I.Bell className="icon-sm" />
            <span className="dot" />
          </button>
          {notifOpen ? (
            <div className="tb-pop tb-pop-wide">
              <div className="tbp-section">Notifications · 3 new</div>
              <div className="tbp-item">
                <span className="tbp-item-dot" style={{ background: "var(--p-high)" }} />
                <div>
                  <b>Celia Rao</b> replied to Q2 board deck
                  <div className="tbp-item-sub">14 minutes ago · Gmail</div>
                </div>
              </div>
              <div className="tbp-item">
                <span className="tbp-item-dot" style={{ background: "var(--ai)" }} />
                <div>
                  Agent flagged <b>3 emails</b> as urgent
                  <div className="tbp-item-sub">28 minutes ago · AI</div>
                </div>
              </div>
              <div className="tbp-item">
                <span className="tbp-item-dot" style={{ background: "var(--health)" }} />
                <div>
                  <b>Long run</b> starts Sunday 7:00a
                  <div className="tbp-item-sub">reminder · Calendar</div>
                </div>
              </div>
              <div className="tbp-sep" />
              <div className="tbp-row tbp-muted">Mark all read</div>
            </div>
          ) : null}
        </div>

        {/* Consolidated view menu — theme, density, tweaks */}
        <div className="tb-group" onClick={stop}>
          <button className="ic-btn" onClick={() => setViewOpen(o => !o)} title="View options">
            <I.Dots className="icon-sm" />
          </button>
          {viewOpen ? (
            <div className="tb-pop">
              <div className="tbp-section">Appearance</div>
              <div className="tbp-seg-row">
                <span>Theme</span>
                <div className="seg seg-sm">
                  <div className={"seg-item " + (theme === "dark" ? "active" : "")} onClick={() => setTheme("dark")}>Dark</div>
                  <div className={"seg-item " + (theme === "light" ? "active" : "")} onClick={() => setTheme("light")}>Light</div>
                </div>
              </div>
              <div className="tbp-seg-row">
                <span>Density</span>
                <div className="seg seg-sm">
                  {["compact","comfortable","roomy"].map(d => (
                    <div key={d} className={"seg-item " + (density === d ? "active" : "")} onClick={() => setDensity?.(d)}>
                      {d[0].toUpperCase() + d.slice(1, 4)}
                    </div>
                  ))}
                </div>
              </div>
              <div className="tbp-sep" />
              <div className="tbp-row" onClick={() => { onOpenTweaks?.(); setViewOpen(false); }}>
                <I.Layout className="icon-sm" /> Open Tweaks panel
              </div>
              <div className="tbp-row">
                <I.Grid className="icon-sm" /> Reset cockpit layout
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SubBar({ projectFilters, setProjectFilters, colorBy, setColorBy, weekLabel, onPrev, onNext, onToday, density, setDensity, onOpenLayouts }) {
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [groupBy, setGroupBy]         = React.useState("project");
  const [focusMode, setFocusMode]     = React.useState(false);
  const popRef = React.useRef(null);

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
    <div className="subbar subbar-compact">
      <div className="week-nav">
        <button className="chev-btn" onClick={onPrev}><I.ChevL className="icon-sm" /></button>
        <span className="date">{weekLabel}</span>
        <button className="chev-btn" onClick={onNext}><I.ChevR className="icon-sm" /></button>
        <button className="btn" style={{ padding: "3px 9px", marginLeft: 6 }} onClick={onToday}>Today</button>
      </div>

      <div className="seg seg-sm" style={{ marginLeft: 10 }}>
        <div className="seg-item active">Week</div>
        <div className="seg-item">Day</div>
        <div className="seg-item">Month</div>
      </div>

      <div style={{ flex: 1 }} />

      <div className="sb-filter-wrap" ref={popRef}>
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
                       onClick={() => setColorBy(m)}>
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
    </div>
  );
}

window.TopBarV2 = TopBar;
window.SubBarV2 = SubBar;
