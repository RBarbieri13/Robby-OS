/* global React, I */
// AI Insights strip — thin horizontal row above the Kanban, editorial briefing.

function InsightsStrip({ onDismiss }) {
  const { ACCOUNTS, EMAILS, TASKS, AGENDA_EVENTS } = window.DATA;
  const [expanded, setExpanded] = React.useState(false);
  const unread   = ACCOUNTS.reduce((a, x) => a + x.unread, 0);
  const urgent   = ACCOUNTS.reduce((a, x) => a + (EMAILS[x.id]?.urgent?.length || 0), 0);
  const overdue  = Object.values(TASKS).flat().filter(t => t.overdue).length;
  const meetings = AGENDA_EVENTS.filter(e => e.day === 1).length;

  return (
    <div className={"insights-strip insights-compact " + (expanded ? "expanded" : "")} data-screen-label="AI Brief">
      <div className="insights-badge">
        <I.Sparkles className="icon-sm" />
        <span>AI Brief</span>
        <span className="pulse" />
      </div>

      {/* Condensed single-line summary (always visible) */}
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

      <div className="spacer" />

      <button
        className="btn btn-ghost is-expand-btn"
        onClick={() => setExpanded(x => !x)}
        title={expanded ? "Hide details" : "Show details"}>
        {expanded ? "Less" : "More"}
        {expanded ? <I.ChevU className="icon-xs" /> : <I.ChevD className="icon-xs" />}
      </button>
      <button className="btn is-replan" title="Replan my day">
        <I.Sparkles className="icon-xs" /> Replan day
      </button>
      <button className="ic-btn" onClick={onDismiss} title="Dismiss">
        <I.X className="icon-xs" />
      </button>

      {/* Expanded details row */}
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
