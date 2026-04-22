/* global React, I */
// Card inspector — right-side detail panel, slides over workspace.

function Inspector({ item, onClose }) {
  if (!item) return null;
  const { row, data, project } = item;

  const rowLabel = { tasks: "Task", notes: "Note", events: "Event", goals: "Goal" }[row];
  const RowIcon = { tasks: I.CheckSquare, notes: I.FileText, events: I.Calendar, goals: I.Target }[row];

  return (
    <div className="inspector-scrim" onClick={onClose}>
      <div className="inspector" onClick={e => e.stopPropagation()}>
        <div className="insp-head">
          <div className="insp-kind" style={{ background: project?.color || "var(--text-4)" }}>
            <RowIcon className="icon-xs" /> {rowLabel}
          </div>
          <div className="spacer" />
          <button className="ic-btn" title="Pin"><I.Star className="icon-sm" /></button>
          <button className="ic-btn" title="Pop out"><I.PopOut className="icon-sm" /></button>
          <button className="ic-btn" onClick={onClose} title="Close"><I.X className="icon-sm" /></button>
        </div>

        <div className="insp-body">
          <h2 className="insp-title">{data.title}</h2>

          <div className="insp-meta">
            {project ? (
              <span className="insp-pill" style={{ background: project.color, color: "#fff" }}>
                {project.name}
              </span>
            ) : null}
            {data.priority ? (
              <span className={"chip priority-" + data.priority}>{data.priority}</span>
            ) : null}
            {data.due ? (
              <span className="insp-pill"><I.Clock className="icon-xs" /> {data.due}</span>
            ) : null}
            {data.when ? (
              <span className="insp-pill"><I.Clock className="icon-xs" /> {data.when}</span>
            ) : null}
            {data.loc ? (
              <span className="insp-pill">📍 {data.loc}</span>
            ) : null}
            {data.updated ? (
              <span className="insp-pill">Updated {data.updated}</span>
            ) : null}
          </div>

          {data.snippet ? (
            <div className="insp-section">
              <div className="insp-label">Preview</div>
              <p className="insp-text">{data.snippet}</p>
            </div>
          ) : null}

          {row === "goals" ? (
            <div className="insp-section">
              <div className="insp-label">Progress</div>
              <div className="progress-bar big"><div style={{ width: (data.progress * 100) + "%" }} /></div>
              <div className="progress-meta big">
                <span>{data.detail}</span>
                <b>{Math.round(data.progress * 100)}%</b>
              </div>
            </div>
          ) : null}

          <div className="insp-section">
            <div className="insp-label">Activity</div>
            <div className="insp-activity">
              <div className="ia-row"><span className="ia-dot" /> You created this · 2d ago</div>
              <div className="ia-row"><span className="ia-dot" /> Celia commented · 14h ago</div>
              <div className="ia-row"><span className="ia-dot" /> Status changed · 2h ago</div>
            </div>
          </div>

          <div className="insp-section">
            <div className="insp-label">AI suggestions</div>
            <div className="insp-ai">
              <div className="ia-sug"><I.Sparkles className="icon-xs" /> Schedule 45m focus block Tue 2p</div>
              <div className="ia-sug"><I.Sparkles className="icon-xs" /> Draft a reply to Celia's thread</div>
              <div className="ia-sug"><I.Sparkles className="icon-xs" /> Link to Q2 deck note</div>
            </div>
          </div>
        </div>

        <div className="insp-foot">
          <button className="btn primary"><I.Check className="icon-xs" /> Mark done</button>
          <button className="btn">Snooze</button>
          <button className="btn">Move…</button>
          <div className="spacer" />
          <button className="btn ghost">Delete</button>
        </div>
      </div>
    </div>
  );
}

window.InspectorV2 = Inspector;
