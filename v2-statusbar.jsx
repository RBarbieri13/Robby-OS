/* global React, I */
// Bottom status bar — sync state, counters, live clock, focus timer.

function StatusBar({ density, setDensity, onOpenPalette }) {
  const { ACCOUNTS, TASKS } = window.DATA;
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const openTasks = Object.values(TASKS).flat().filter(t => !t.done).length;
  const doneToday = 7;

  const hhmm = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  return (
    <div className="statusbar" data-screen-label="Status Bar">
      <div className="sb-group">
        <span className="sb-dot ok" />
        <span className="sb-label">Synced</span>
        <span className="sb-sep">·</span>
        <span className="sb-label">{ACCOUNTS.length} accounts</span>
        <span className="sb-sub">last: 14s ago</span>
      </div>

      <div className="sb-group">
        <I.CheckSquare className="icon-xs" style={{ color: "var(--type-tasks)" }} />
        <span><b>{openTasks}</b> open · <b>{doneToday}</b> done today</span>
      </div>

      <div className="sb-group">
        <span className="sb-dot focus" />
        <span>Focus · <b>23:14</b></span>
        <span className="sb-sub">board deck</span>
      </div>

      <div className="sb-group">
        <I.Sparkles className="icon-xs" style={{ color: "var(--ai)" }} />
        <span>Haiku 4.5</span>
        <span className="sb-sub">· 1.4k tok</span>
      </div>

      <div style={{ flex: 1 }} />

      <div className="sb-group">
        <span className="sb-label">Density</span>
        <div className="seg mini">
          {["compact","comfortable","roomy"].map(d => (
            <div key={d}
                 className={"seg-item " + (density === d ? "active" : "")}
                 onClick={() => setDensity(d)}>
              {d[0].toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      <button className="sb-chip" onClick={onOpenPalette}>
        <I.Command className="icon-xs" /> <span>K</span>
      </button>

      <div className="sb-group">
        <span className="sb-time">{hhmm}</span>
        <span className="sb-sub">PT</span>
      </div>
    </div>
  );
}

window.StatusBarV2 = StatusBar;
