/* global React, I */
// Left sidebar — primary nav + projects + utility group.

function Sidebar({ collapsed, setCollapsed, view, setView, cockpitName, projectFilters, setProjectFilters }) {
  const { PROJECTS, TASKS, NOTES, EVENTS_ROW, GOALS } = window.DATA;

  const navPrimary = [
    { id: "cockpit", label: cockpitName, icon: I.Grid,       count: null },
    { id: "inbox",   label: "Inbox",     icon: I.Inbox,      count: 14, badge: "14" },
  ];
  const navModules = [
    { id: "mail",    label: "Mail",       icon: I.Mail,        count: 25 },
    { id: "cal",     label: "Calendar",   icon: I.Calendar,    count: null },
    { id: "tasks",   label: "Tasks",      icon: I.CheckSquare, count: 18 },
    { id: "notes",   label: "Notes",      icon: I.FileText,    count: 9 },
    { id: "goals",   label: "Goals",      icon: I.Target,      count: 7 },
  ];

  const totalFor = (pid) =>
    (TASKS[pid]?.length || 0) + (NOTES[pid]?.length || 0) +
    (EVENTS_ROW[pid]?.length || 0) + (GOALS[pid]?.length || 0);

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark" />
        <span className="brand-name">Robby OS</span>
      </div>

      <div className="sidebar-scroll">
      <div className="side-section">
        {navPrimary.map(n => (
          <div key={n.id}
               className={"side-item " + (view === n.id ? "active" : "")}
               onClick={() => setView(n.id)}>
            <n.icon className="side-icon" />
            <span>{n.label}</span>
            {n.badge ? <span className="badge">{n.badge}</span> : null}
          </div>
        ))}
      </div>

      <div className="side-section">
        <div className="side-label">Modules</div>
        {navModules.map(n => (
          <div key={n.id}
               className={"side-item " + (view === n.id ? "active" : "")}
               onClick={() => setView(n.id)}>
            <n.icon className="side-icon" />
            <span>{n.label}</span>
            {n.count != null ? <span className="count">{n.count}</span> : null}
          </div>
        ))}
      </div>

      <div className="side-section">
        <div className="side-label">Projects</div>
        {PROJECTS.map(p => {
          const on = projectFilters.includes(p.id);
          return (
            <div key={p.id}
                 className="side-proj"
                 style={{ opacity: on ? 1 : 0.45 }}
                 onClick={() => setProjectFilters(on
                   ? projectFilters.filter(x => x !== p.id)
                   : [...projectFilters, p.id])}>
              <span className="sw" style={{ background: p.color }} />
              <span>{p.name}</span>
              <span className="count">{totalFor(p.id)}</span>
            </div>
          );
        })}
        <div className="side-proj" style={{ color: "var(--text-4)" }}>
          <I.Plus className="icon-xs" style={{ opacity: 0.6 }} />
          <span>New project</span>
        </div>
      </div>

      <div className="side-section">
        <div className="side-label">Calendar</div>
        <window.MiniMonth currentDay={22} />
      </div>

      <div className="side-sep" />

      <div className="side-section">
        <div className="side-item">
          <I.Sparkles className="side-icon" />
          <span>AI Assistant</span>
          <span className="badge beta">BETA</span>
        </div>
        <div className="side-item">
          <I.Command className="side-icon" />
          <span>Shortcuts</span>
          <span className="count">⌘K</span>
        </div>
      </div>
      </div>

      <div className="sidebar-foot">
      <div className="side-user">
        <div className="avatar">R</div>
        <div className="who">
          <b>Robby</b>
          <small>3 accounts connected</small>
        </div>
      </div>

      <button className="rail-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? <I.ChevR className="icon-xs" /> : <I.ChevL className="icon-xs" />}
        <span style={{ display: collapsed ? "none" : "inline" }}>Collapse</span>
      </button>
      </div>
    </aside>
  );
}

window.Sidebar = Sidebar;
