/* global React, I */
// ⌘K command palette — searchable actions + recent items + navigation.

function Palette({ open, setOpen, ctx }) {
  const [q, setQ] = React.useState("");
  const [idx, setIdx] = React.useState(0);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (open) {
      setQ(""); setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const actions = React.useMemo(() => {
    const list = [];
    list.push({ id: "new-task",  group: "Create", label: "New task",        hint: "T",       icon: "CheckSquare", accent: "var(--type-tasks)" });
    list.push({ id: "new-note",  group: "Create", label: "New note",        hint: "N",       icon: "FileText",    accent: "var(--type-notes)" });
    list.push({ id: "new-event", group: "Create", label: "New event",       hint: "E",       icon: "Calendar",    accent: "var(--type-events)" });
    list.push({ id: "new-goal",  group: "Create", label: "New goal",        hint: "G",       icon: "Target",      accent: "var(--type-goals)" });
    list.push({ id: "compose",   group: "Create", label: "Compose email",   hint: "C",       icon: "Mail",        accent: "var(--work)" });

    list.push({ id: "go-cockpit", group: "Navigate", label: "Go to Cockpit",  hint: "G C", icon: "Grid" });
    list.push({ id: "go-inbox",   group: "Navigate", label: "Go to Inbox",    hint: "G I", icon: "Inbox" });
    list.push({ id: "go-mail",    group: "Navigate", label: "Go to Mail",     hint: "G M", icon: "Mail" });
    list.push({ id: "go-cal",     group: "Navigate", label: "Go to Calendar", hint: "G A", icon: "Calendar" });
    list.push({ id: "go-tasks",   group: "Navigate", label: "Go to Tasks",    hint: "G T", icon: "CheckSquare" });
    list.push({ id: "go-notes",   group: "Navigate", label: "Go to Notes",    hint: "G N", icon: "FileText" });
    list.push({ id: "go-goals",   group: "Navigate", label: "Go to Goals",    hint: "G L", icon: "Target" });

    list.push({ id: "layout-morning", group: "Layouts", label: "Morning layout",        icon: "Layout" });
    list.push({ id: "layout-focus",   group: "Layouts", label: "Focus layout — hide rail", icon: "Layout" });
    list.push({ id: "layout-review",  group: "Layouts", label: "Weekly review layout",   icon: "Layout" });

    list.push({ id: "toggle-theme",   group: "View", label: ctx.theme === "dark" ? "Switch to light" : "Switch to dark", hint: "⇧ D", icon: ctx.theme === "dark" ? "Sun" : "Moon" });
    list.push({ id: "toggle-density", group: "View", label: "Cycle density · " + (ctx.density || "comfortable"),         hint: "⇧ Y", icon: "Grid" });
    list.push({ id: "toggle-email",   group: "View", label: ctx.emailCollapsed ? "Expand email rail" : "Collapse email rail", hint: "⇧ E", icon: "Mail" });
    list.push({ id: "toggle-side",    group: "View", label: ctx.railCollapsed  ? "Expand sidebar"    : "Collapse sidebar",    hint: "⇧ S", icon: "Layout" });

    list.push({ id: "ai-brief",       group: "AI", label: "Ask AI to summarize today",   icon: "Sparkles", accent: "var(--ai)" });
    list.push({ id: "ai-plan",        group: "AI", label: "Plan my day from open tasks", icon: "Sparkles", accent: "var(--ai)" });
    list.push({ id: "ai-triage",      group: "AI", label: "Triage unread email",         icon: "Zap",      accent: "var(--ai)" });

    return list;
  }, [ctx.theme, ctx.density, ctx.emailCollapsed, ctx.railCollapsed]);

  const filtered = React.useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return actions;
    return actions.filter(a => (a.label + " " + a.group).toLowerCase().includes(qq));
  }, [q, actions]);

  const grouped = React.useMemo(() => {
    const m = new Map();
    filtered.forEach(a => {
      if (!m.has(a.group)) m.set(a.group, []);
      m.get(a.group).push(a);
    });
    return [...m.entries()];
  }, [filtered]);

  const run = (a) => {
    if (!a) return;
    ctx.runAction(a.id);
    setOpen(false);
  };

  const onKey = (e) => {
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx(i => Math.min(filtered.length - 1, i + 1)); return; }
    if (e.key === "ArrowUp")   { e.preventDefault(); setIdx(i => Math.max(0, i - 1)); return; }
    if (e.key === "Enter")     { e.preventDefault(); run(filtered[idx]); return; }
  };

  React.useEffect(() => { setIdx(0); }, [q]);

  if (!open) return null;

  let flatIdx = -1;
  return (
    <div className="palette-scrim" onClick={() => setOpen(false)}>
      <div className="palette" onClick={e => e.stopPropagation()}>
        <div className="palette-head">
          <I.Search className="icon-sm" />
          <input
            ref={inputRef}
            placeholder="Search actions, jump anywhere, ask AI…"
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={onKey}
          />
          <span className="kbd kbd-esc">esc</span>
        </div>
        <div className="palette-body">
          {grouped.length === 0 ? (
            <div className="palette-empty">
              No matches. <span style={{ color: "var(--ai)" }}>Press ⏎ to ask AI.</span>
            </div>
          ) : grouped.map(([group, items]) => (
            <div key={group} className="palette-group">
              <div className="palette-group-label">{group}</div>
              {items.map(a => {
                flatIdx++;
                const active = flatIdx === idx;
                const Icon = I[a.icon] || I.Dots;
                return (
                  <div
                    key={a.id}
                    className={"palette-item " + (active ? "active" : "")}
                    onMouseEnter={() => setIdx(flatIdx)}
                    onClick={() => run(a)}
                  >
                    <span className="pi-icon" style={{ color: a.accent || "var(--text-2)" }}>
                      <Icon className="icon-sm" />
                    </span>
                    <span className="pi-label">{a.label}</span>
                    {a.hint ? <span className="pi-hint">{a.hint}</span> : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="palette-foot">
          <span><span className="kbd">↑</span><span className="kbd">↓</span> navigate</span>
          <span><span className="kbd">⏎</span> run</span>
          <span><span className="kbd">esc</span> close</span>
          <div className="spacer" />
          <span style={{ color: "var(--text-4)" }}>{filtered.length} results</span>
        </div>
      </div>
    </div>
  );
}

window.PaletteV2 = Palette;
