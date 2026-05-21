/* global React, I */
// Bottom status bar — sync state, counters, live clock, focus timer.

function StatusBar({ density, setDensity, onOpenPalette }) {
  const { ACCOUNTS, TASKS } = window.DATA;
  const [now, setNow] = React.useState(() => new Date());
  const [health, setHealth] = React.useState(null); // {overall, subsystems, ...}
  const [healthError, setHealthError] = React.useState(false);
  const [lastSyncAt, setLastSyncAt] = React.useState(null);

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    async function probe() {
      try {
        const r = await fetch("/api/health", { cache: "no-store" });
        const j = await r.json();
        if (cancelled) return;
        setHealth(j);
        setHealthError(false);
        setLastSyncAt(new Date());
      } catch (_) {
        if (cancelled) return;
        setHealthError(true);
      }
    }
    probe();
    const id = setInterval(probe, 60000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const openTasks = Object.values(TASKS).flat().filter(t => !t.done).length;
  const doneToday = 7;

  const hhmm = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const overall = healthError ? "down" : (health ? health.overall : null);
  const dotClass = overall === "ok" ? "ok" : overall === "degraded" ? "warn" : overall === "down" ? "err" : "";
  const statusLabel = overall === "ok" ? "Synced" : overall === "degraded" ? "Degraded" : overall === "down" ? "Offline" : "Syncing";
  const lastSyncLabel = lastSyncAt
    ? (() => {
        const s = Math.max(0, Math.round((now - lastSyncAt) / 1000));
        if (s < 60) return `last: ${s}s ago`;
        const m = Math.round(s / 60);
        return `last: ${m}m ago`;
      })()
    : "last: —";
  const tooltip = health
    ? `Calendar: ${health.subsystems?.calendar?.status} · Mail: ${health.subsystems?.mail?.status}`
    : healthError ? "Health probe failed" : "Probing…";

  return (
    <div className="statusbar" data-screen-label="Status Bar">
      <div className="sb-group" title={tooltip}>
        <span className={"sb-dot " + dotClass} />
        <span className="sb-label">{statusLabel}</span>
        <span className="sb-sep">·</span>
        <span className="sb-label">{ACCOUNTS.length} accounts</span>
        <span className="sb-sub">{lastSyncLabel}</span>
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
