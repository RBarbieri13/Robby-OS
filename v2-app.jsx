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

  // ─── Card edits + expanded state + reorder map — all persisted ───
  const LS_EDITS    = "robbyOS.cardEdits.v1";
  const LS_EXPANDED = "robbyOS.expandedCards.v1";
  const LS_ORDER    = "robbyOS.cardOrder.v1";
  const [cardEdits, setCardEdits] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_EDITS) || "{}"); }
    catch (_) { return {}; }
  });
  const [expandedCards, setExpandedCards] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_EXPANDED) || "{}"); }
    catch (_) { return {}; }
  });
  // cardOrder shape: { [rowId]: { [projectId]: [cardId, ...] } }
  const [cardOrder, setCardOrder] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_ORDER) || "{}"); }
    catch (_) { return {}; }
  });

  React.useEffect(() => {
    try { localStorage.setItem(LS_EDITS, JSON.stringify(cardEdits)); } catch (_) {}
  }, [cardEdits]);
  React.useEffect(() => {
    try { localStorage.setItem(LS_EXPANDED, JSON.stringify(expandedCards)); } catch (_) {}
  }, [expandedCards]);
  React.useEffect(() => {
    try { localStorage.setItem(LS_ORDER, JSON.stringify(cardOrder)); } catch (_) {}
  }, [cardOrder]);

  const onCardEdit = React.useCallback((id, field, value) => {
    setCardEdits(prev => {
      const prior = prev[id] || {};
      return { ...prev, [id]: { ...prior, [field]: value } };
    });
  }, []);

  const toggleExpandCard = React.useCallback((id) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const onReorderCards = React.useCallback((nextOrder) => {
    setCardOrder(nextOrder);
  }, []);

  // ─── Resizable layout — sidebar width, email rail width, both
  //     persisted to localStorage. Unbounded sidebar (min 40 for icons).
  //     Double-click a resizer to reset to default. ───
  const LS_LAYOUT = "robbyOS.layout.v1";
  const LAYOUT_DEFAULTS = { railW: 180, emailW: 300 };
  const [railW, setRailW]   = React.useState(() => {
    try {
      const o = JSON.parse(localStorage.getItem(LS_LAYOUT) || "{}");
      return typeof o.railW === "number" ? o.railW : LAYOUT_DEFAULTS.railW;
    } catch (_) { return LAYOUT_DEFAULTS.railW; }
  });
  const [emailW, setEmailW] = React.useState(() => {
    try {
      const o = JSON.parse(localStorage.getItem(LS_LAYOUT) || "{}");
      return typeof o.emailW === "number" ? o.emailW : LAYOUT_DEFAULTS.emailW;
    } catch (_) { return LAYOUT_DEFAULTS.emailW; }
  });
  React.useEffect(() => {
    try {
      const prior = JSON.parse(localStorage.getItem(LS_LAYOUT) || "{}");
      localStorage.setItem(LS_LAYOUT, JSON.stringify({ ...prior, railW, emailW, kanbanFrac }));
    } catch (_) {}
  }, [railW, emailW, kanbanFrac]);

  // Load persisted kanbanFrac on first mount
  React.useEffect(() => {
    try {
      const o = JSON.parse(localStorage.getItem(LS_LAYOUT) || "{}");
      if (typeof o.kanbanFrac === "number") setKanbanFrac(o.kanbanFrac);
    } catch (_) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Auto-collapse thresholds ───
  // When the user drags a pane below its threshold, flip into the
  // collapsed icon-only mode. When they drag back above it, expand.
  // Keeps the pane contents usable at any width instead of squashing
  // text into an unreadable sliver.
  const RAIL_COLLAPSE_AT = 120;            // px
  const EMAIL_COLLAPSE_AT = 80;
  const RAIL_EXPAND_AT = 140;
  const EMAIL_EXPAND_AT = 120;
  React.useEffect(() => {
    if (!railCollapsed && railW < RAIL_COLLAPSE_AT) setRailCollapsed(true);
    else if (railCollapsed && railW > RAIL_EXPAND_AT) setRailCollapsed(false);
  }, [railW, railCollapsed]);
  React.useEffect(() => {
    if (!emailCollapsed && emailW < EMAIL_COLLAPSE_AT) setEmailCollapsed(true);
    else if (emailCollapsed && emailW > EMAIL_EXPAND_AT) setEmailCollapsed(false);
  }, [emailW, emailCollapsed]);

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

  // Kanban row heights with compact task cards (~42px) + expanded rows
  // when user expands cards. Each open row displays up to ~5 compact
  // cards before scrolling. We estimate: compact card ~44px, plus
  // row label area ~30px of vertical padding. Hero ~56. Collapsed
  // row ~38. Allow generous min so the agenda always has room.
  const TOTAL_ROWS = 4;
  const openRows = TOTAL_ROWS - collapsedRows.length;
  const kanbanPx =
    36  /* pane-head */ +
    60  /* slim hero strip */ +
    openRows * 240 +   /* ~5 compact cards per row */
    collapsedRows.length * 38 +
    28  /* add-row footer */ +
    16  /* paddings */;
  const centerStyle = kanbanFrac != null
    ? { gridTemplateRows: `${kanbanFrac * 100}% var(--gutter) 1fr` }
    : { gridTemplateRows: `minmax(260px, ${kanbanPx}px) var(--gutter) minmax(260px, 1fr)` };

  const weekLabel = "Apr 21–27, 2026";

  // App grid template — sidebar + resizer + main column. Resizer column
  // is fixed 6px wide; sidebar width is dynamic.
  const appStyle = railCollapsed
    ? { gridTemplateColumns: `var(--rail-w-collapsed) 6px 1fr` }
    : { gridTemplateColumns: `${railW}px 6px 1fr` };

  // Workspace inner grid — center column + resizer + email rail.
  // When collapsed, email rail locks to the narrow icon-stack width.
  const workspaceStyle = emailCollapsed
    ? { gridTemplateColumns: `1fr 6px 48px` }
    : { gridTemplateColumns: `1fr 6px ${emailW}px` };

  // Kanban↔Agenda horizontal resizer — wrap the existing divider with
  // a fraction-setter so double-click resets and drag matches the
  // Resizer component's pattern.
  const kanbanFracRef = React.useRef(null);
  const onKanbanFracChange = (absPx) => {
    // absPx is the running sidebar- or email-width for vertical; for
    // horizontal kanban we convert deltaPx on mousedown-registered
    // startFrac. We use a custom drag here because the fraction is
    // expressed in % of the center column height, not absolute pixels.
    if (!kanbanFracRef.current) return;
    const { topY, bottomY } = kanbanFracRef.current;
    const f = Math.max(0.05, Math.min(0.95, (absPx - topY) / (bottomY - topY)));
    setKanbanFrac(f);
  };

  const onHDividerMouseDown = (e) => {
    e.preventDefault();
    const centerEl = e.currentTarget.parentElement;
    const rect = centerEl.getBoundingClientRect();
    kanbanFracRef.current = { topY: rect.top, bottomY: rect.bottom };
    document.body.classList.add("body-row-resize");
    const onMove = (ev) => onKanbanFracChange(ev.clientY);
    const onUp = () => {
      document.body.classList.remove("body-row-resize");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div className={"app " + (railCollapsed ? "rail-collapsed" : "") + (emailCollapsed ? " email-collapsed-outer" : "")}
         style={appStyle}>
      <window.Sidebar
        collapsed={railCollapsed} setCollapsed={setRailCollapsed}
        view={view} setView={setView}
        cockpitName={edits.cockpitName}
        projectFilters={projectFilters} setProjectFilters={setProjectFilters} />

      {/* Sidebar ↔ main — vertical resizer (drag left/right).
          Hidden when sidebar collapsed so users can't resize an icon rail. */}
      {!railCollapsed ? (
        <window.Resizer
          orient="vertical"
          value={railW}
          onChange={setRailW}
          min={40}
          onReset={() => setRailW(LAYOUT_DEFAULTS.railW)}
          title="Drag to resize sidebar · double-click to reset" />
      ) : <div className="resizer-spacer" />}

      <div className="main">
        <window.TopBarV2
          view={view}
          theme={theme} setTheme={setTheme}
          cockpitName={edits.cockpitName}
          onOpenTweaks={() => setTweaksOpen(o => !o)}
          onOpenPalette={() => setPaletteOpen(true)}
          density={density} setDensity={setDensity} />

        {/* SubBar (date nav + Week/Day/Month + View) has been folded into
            InsightsV2 — one combined command row instead of two. */}
        {showInsights ? (
          <window.InsightsV2
            onDismiss={() => setShowInsights(false)}
            colorBy={colorBy} setColorBy={setColorBy}
            density={density} setDensity={setDensity}
            weekLabel={weekLabel}
            onPrev={() => {}} onNext={() => {}} onToday={() => {}} />
        ) : null}

        <div className={"workspace " + (emailCollapsed ? "email-collapsed" : "")}
             style={workspaceStyle}>
          <div className="center-col" style={centerStyle}>
            <window.KanbanV2
              projectFilters={projectFilters}
              colorBy={colorBy}
              collapsedRows={collapsedRows} setCollapsedRows={setCollapsedRows}
              onOpenCard={setInspector}
              cardEdits={cardEdits}
              onCardEdit={onCardEdit}
              expandedCards={expandedCards}
              toggleExpandCard={toggleExpandCard}
              cardOrder={cardOrder}
              onReorder={onReorderCards} />

            {/* Kanban ↔ Agenda — horizontal resizer */}
            <div className="resizer resizer-horizontal"
                 role="separator"
                 aria-orientation="horizontal"
                 title="Drag to resize · double-click to reset"
                 onMouseDown={onHDividerMouseDown}
                 onDoubleClick={(e) => { e.preventDefault(); setKanbanFrac(null); }}>
              <div className="resizer-grip" />
            </div>

            <window.AgendaV2
              weekLabel={weekLabel}
              projectFilters={projectFilters}
              onPrev={() => {}} onNext={() => {}} />
          </div>

          {/* Center ↔ Email rail — vertical resizer (invert: drag left
              reduces email width, drag right grows it). Hidden when
              email rail is collapsed. */}
          {!emailCollapsed ? (
            <window.Resizer
              orient="vertical"
              value={emailW}
              onChange={setEmailW}
              min={40}
              invert={true}
              onReset={() => setEmailW(LAYOUT_DEFAULTS.emailW)}
              title="Drag to resize email rail · double-click to reset" />
          ) : <div className="resizer-spacer" />}

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
