/* global React, ReactDOM */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "cockpitName": "Cockpit",
  "defaultColorBy": "project",
  "railCollapsed": false,
  "density": "comfortable",
  "showInsights": true,
  "showStatusBar": true
}/*EDITMODE-END*/;

function App() {
  const [view, setView] = React.useState("cockpit");
  const [theme, setTheme] = React.useState("light");
  const [railCollapsed, setRailCollapsed] = React.useState(TWEAK_DEFAULTS.railCollapsed);
  const [projectFilters, setProjectFilters] = React.useState(["work","personal","house","health","ai"]);
  const [colorBy, setColorBy] = React.useState(TWEAK_DEFAULTS.defaultColorBy);
  const [collapsedRows, setCollapsedRows] = React.useState([]);
  const [emailCollapsed, setEmailCollapsed] = React.useState(false);
  const [kanbanFrac, setKanbanFrac] = React.useState(null);
  const [tweaksOpen, setTweaksOpen] = React.useState(false);
  const [edits, setEdits] = React.useState(TWEAK_DEFAULTS);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [inspector, setInspector] = React.useState(null);
  const [openedEmail, setOpenedEmail] = React.useState(null);
  const [density, setDensity] = React.useState(TWEAK_DEFAULTS.density);
  const [showInsights, setShowInsights] = React.useState(TWEAK_DEFAULTS.showInsights);

  React.useEffect(() => { document.body.setAttribute("data-theme", theme); }, [theme]);
  React.useEffect(() => { document.body.setAttribute("data-density", density); }, [density]);

  React.useEffect(() => {
    const onMsg = (e) => {
      if (!e?.data?.type) return;
      if (e.data.type === "__activate_edit_mode")   setTweaksOpen(true);
      if (e.data.type === "__deactivate_edit_mode") setTweaksOpen(false);
    };
    window.addEventListener("message", onMsg);
    try { window.parent.postMessage({ type: "__edit_mode_available" }, "*"); } catch (_) {}
    return () => window.removeEventListener("message", onMsg);
  }, []);

  // Global keyboard shortcuts
  React.useEffect(() => {
    let gTimer = null, gMode = false;
    const onKey = (e) => {
      const tag = (e.target?.tagName || "").toLowerCase();
      const typing = tag === "input" || tag === "textarea" || e.target?.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); setPaletteOpen(o => !o); return;
      }
      if (typing) return;
      if (e.key === "Escape") { setInspector(null); setOpenedEmail(null); setPaletteOpen(false); }
      if (e.shiftKey && e.key.toLowerCase() === "d") setTheme(t => t === "dark" ? "light" : "dark");
      if (e.shiftKey && e.key.toLowerCase() === "e") setEmailCollapsed(v => !v);
      if (e.shiftKey && e.key.toLowerCase() === "s") setRailCollapsed(v => !v);
      if (e.shiftKey && e.key.toLowerCase() === "y") setDensity(d => d === "compact" ? "comfortable" : d === "comfortable" ? "roomy" : "compact");
      if (e.key.toLowerCase() === "g" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
        gMode = true; clearTimeout(gTimer); gTimer = setTimeout(() => { gMode = false; }, 900);
        return;
      }
      if (gMode) {
        const map = { c: "cockpit", i: "inbox", m: "mail", a: "cal", t: "tasks", n: "notes", l: "goals" };
        const to = map[e.key.toLowerCase()];
        if (to) { setView(to); gMode = false; }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const pushEdit = (k, v) => {
    setEdits(prev => ({ ...prev, [k]: v }));
    try { window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { [k]: v } }, "*"); } catch (_) {}
  };

  const runAction = (id) => {
    if (id.startsWith("go-")) {
      const map = { "go-cockpit": "cockpit", "go-inbox": "inbox", "go-mail": "mail", "go-cal": "cal", "go-tasks": "tasks", "go-notes": "notes", "go-goals": "goals" };
      setView(map[id]); return;
    }
    if (id === "toggle-theme") setTheme(t => t === "dark" ? "light" : "dark");
    if (id === "toggle-density") setDensity(d => d === "compact" ? "comfortable" : d === "comfortable" ? "roomy" : "compact");
    if (id === "toggle-email") setEmailCollapsed(v => !v);
    if (id === "toggle-side") setRailCollapsed(v => !v);
    if (id === "layout-focus") { setRailCollapsed(true); setEmailCollapsed(true); }
    if (id === "layout-morning") { setRailCollapsed(false); setEmailCollapsed(false); setShowInsights(true); }
    if (id === "layout-review") { setRailCollapsed(false); setEmailCollapsed(false); setShowInsights(true); setColorBy("priority"); }
  };

  const dragRef = React.useRef(null);
  const onDividerMouseDown = (e) => {
    e.preventDefault();
    const centerEl = e.currentTarget.parentElement;
    const rect = centerEl.getBoundingClientRect();
    dragRef.current = { topY: rect.top, bottomY: rect.bottom };
    const onMove = (ev) => {
      const { topY, bottomY } = dragRef.current;
      const f = Math.max(0.25, Math.min(0.85, (ev.clientY - topY) / (bottomY - topY)));
      setKanbanFrac(f);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // Kanban row heights (comfortable density): hero ~56 (slim rectangle),
  // each open row ~160, each collapsed row ~38. Plus pane-head 36 +
  // paddings 24. We pin the kanban track to a pixel height computed
  // from the open-row count so the agenda naturally grows as rows
  // collapse. Manual drag via kanbanFrac always wins when set.
  const TOTAL_ROWS = 4;
  const openRows = TOTAL_ROWS - collapsedRows.length;
  const kanbanPx =
    36  /* pane-head */ +
    60  /* slim hero strip */ +
    openRows * 160 +
    collapsedRows.length * 38 +
    28  /* add-row footer */ +
    16  /* paddings */;
  const centerStyle = kanbanFrac != null
    ? { gridTemplateRows: `${kanbanFrac * 100}% var(--gutter) 1fr` }
    : { gridTemplateRows: `minmax(260px, ${kanbanPx}px) var(--gutter) minmax(260px, 1fr)` };

  const weekLabel = "Apr 21–27, 2026";

  return (
    <div className={"app " + (railCollapsed ? "rail-collapsed" : "") + (emailCollapsed ? " email-collapsed-outer" : "")}>
      <window.Sidebar
        collapsed={railCollapsed} setCollapsed={setRailCollapsed}
        view={view} setView={setView}
        cockpitName={edits.cockpitName}
        projectFilters={projectFilters} setProjectFilters={setProjectFilters} />

      <div className="main">
        <window.TopBarV2
          view={view}
          theme={theme} setTheme={setTheme}
          cockpitName={edits.cockpitName}
          onOpenTweaks={() => setTweaksOpen(o => !o)}
          onOpenPalette={() => setPaletteOpen(true)}
          density={density} setDensity={setDensity} />

        <window.SubBarV2
          projectFilters={projectFilters} setProjectFilters={setProjectFilters}
          colorBy={colorBy} setColorBy={setColorBy}
          weekLabel={weekLabel}
          density={density} setDensity={setDensity}
          onPrev={() => {}} onNext={() => {}} onToday={() => {}} />

        {showInsights ? <window.InsightsV2 onDismiss={() => setShowInsights(false)} /> : null}

        <div className={"workspace " + (emailCollapsed ? "email-collapsed" : "")}>
          <div className="center-col" style={centerStyle}>
            <window.KanbanV2
              projectFilters={projectFilters}
              colorBy={colorBy}
              collapsedRows={collapsedRows} setCollapsedRows={setCollapsedRows}
              onOpenCard={setInspector} />

            <div className="divider-h" onMouseDown={onDividerMouseDown} />

            <window.AgendaV2
              weekLabel={weekLabel}
              projectFilters={projectFilters}
              onPrev={() => {}} onNext={() => {}} />
          </div>

          <window.EmailRailV2
            collapsed={emailCollapsed} setCollapsed={setEmailCollapsed}
            openedEmail={openedEmail} setOpenedEmail={setOpenedEmail} />
        </div>

        <window.StatusBarV2
          density={density} setDensity={setDensity}
          onOpenPalette={() => setPaletteOpen(true)} />
      </div>

      <window.PaletteV2
        open={paletteOpen} setOpen={setPaletteOpen}
        ctx={{ theme, density, emailCollapsed, railCollapsed, runAction }} />

      <window.InspectorV2 item={inspector} onClose={() => setInspector(null)} />

      {tweaksOpen ? (
        <div className="tweaks-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h4 style={{ margin: 0 }}>Tweaks</h4>
            <button className="ic-btn" onClick={() => setTweaksOpen(false)} style={{ width: 24, height: 24 }}>
              <window.I.X className="icon-sm" />
            </button>
          </div>

          <div className="tweak-row">
            <label>Dashboard name</label>
            <input type="text" value={edits.cockpitName}
                   onChange={e => pushEdit("cockpitName", e.target.value)} />
          </div>

          <div className="tweak-row">
            <label>Color by</label>
            <div className="seg">
              {["project","priority","type","account"].map(m => (
                <div key={m} className={"seg-item " + (colorBy === m ? "active" : "")}
                     onClick={() => setColorBy(m)}>{m[0].toUpperCase() + m.slice(1,3)}</div>
              ))}
            </div>
          </div>

          <div className="tweak-row">
            <label>Density</label>
            <div className="seg">
              {["compact","comfortable","roomy"].map(d => (
                <div key={d} className={"seg-item " + (density === d ? "active" : "")}
                     onClick={() => setDensity(d)}>{d[0].toUpperCase() + d.slice(1,4)}</div>
              ))}
            </div>
          </div>

          <div className="tweak-row">
            <label>Theme</label>
            <div className="seg">
              <div className={"seg-item " + (theme === "dark" ? "active" : "")}  onClick={() => setTheme("dark")}>Dark</div>
              <div className={"seg-item " + (theme === "light" ? "active" : "")} onClick={() => setTheme("light")}>Light</div>
            </div>
          </div>

          <div className="tweak-row">
            <label>AI brief strip</label>
            <div className="seg">
              <div className={"seg-item " + (showInsights ? "active" : "")}  onClick={() => setShowInsights(true)}>On</div>
              <div className={"seg-item " + (!showInsights ? "active" : "")} onClick={() => setShowInsights(false)}>Off</div>
            </div>
          </div>

          <div className="tweak-row">
            <label>Email rail</label>
            <div className="seg">
              <div className={"seg-item " + (!emailCollapsed ? "active" : "")} onClick={() => setEmailCollapsed(false)}>Open</div>
              <div className={"seg-item " + (emailCollapsed ? "active" : "")}  onClick={() => setEmailCollapsed(true)}>Rail</div>
            </div>
          </div>

          <div className="tweak-row">
            <label>Sidebar</label>
            <div className="seg">
              <div className={"seg-item " + (!railCollapsed ? "active" : "")} onClick={() => setRailCollapsed(false)}>Full</div>
              <div className={"seg-item " + (railCollapsed ? "active" : "")}  onClick={() => setRailCollapsed(true)}>Icons</div>
            </div>
          </div>

          <div className="foot">
            Cockpit v0.3 · ⌘K palette, card inspector, AI brief strip, status bar, density modes, keyboard shortcuts.
          </div>
        </div>
      ) : null}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
