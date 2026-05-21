/* global React, I */
// Card inspector — right-side detail panel, slides over workspace.

function relativeTime(iso) {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0 || !Number.isFinite(ms)) return null;
  const s = Math.round(ms / 1000);
  if (s < 60) return s + "s ago";
  const m = Math.round(s / 60);
  if (m < 60) return m + "m ago";
  const h = Math.round(m / 60);
  if (h < 24) return h + "h ago";
  return Math.round(h / 24) + "d ago";
}

function Inspector({ item, onClose, onEdit, onDelete, cardEdits }) {
  if (!item) return null;
  const { row, project } = item;
  // Re-merge cardEdits on every render so Mark-done immediately reflects
  // in the visible state — the parent passes a snapshot at click-time, but
  // localStorage edits flow through `cardEdits` reactively.
  const baseData = item.data;
  const liveEdits = (cardEdits && cardEdits[baseData?.id]) || {};
  const data = { ...baseData, ...liveEdits };

  const rowLabel = { tasks: "Task", notes: "Note", events: "Event", goals: "Goal" }[row];
  const RowIcon = { tasks: I.CheckSquare, notes: I.FileText, events: I.Calendar, goals: I.Target }[row];

  const isTask = row === "tasks";
  const canEdit = isTask && typeof onEdit === "function";
  const canDelete = isTask && typeof onDelete === "function" && data.userAdded;
  const createdRel = data.createdAt ? relativeTime(data.createdAt) : null;

  const handleMarkDone = () => {
    if (!canEdit) return;
    onEdit(data.id, "done", !data.done);
    // Keep panel open so user sees the state change; close button is the next step
  };
  const handleDelete = () => {
    if (!canDelete) return;
    onDelete(data.id);
    onClose?.();
  };

  return (
    <div className="inspector-scrim" onClick={onClose}>
      <div className="inspector" onClick={e => e.stopPropagation()}>
        <div className="insp-head">
          <div className="insp-kind" style={{ background: project?.color || "var(--text-4)" }}>
            <RowIcon className="icon-xs" /> {rowLabel}
          </div>
          <div className="spacer" />
          <button className="ic-btn" onClick={onClose} title="Close (Esc)"><I.X className="icon-sm" /></button>
        </div>

        <div className="insp-body">
          <h2 className="insp-title" style={data.done ? { textDecoration: "line-through", color: "var(--text-3)" } : {}}>
            {data.title}
          </h2>

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
            {data.userAdded ? (
              <span className="insp-pill" title="Added via Quick Add">user-added</span>
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

          {createdRel ? (
            <div className="insp-section">
              <div className="insp-label">Activity</div>
              <div className="insp-activity">
                <div className="ia-row"><span className="ia-dot" /> You created this · {createdRel}</div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="insp-foot">
          {canEdit ? (
            <button className="btn primary" onClick={handleMarkDone}>
              <I.Check className="icon-xs" /> {data.done ? "Mark active" : "Mark done"}
            </button>
          ) : null}
          <div className="spacer" />
          {canDelete ? (
            <button className="btn ghost" onClick={handleDelete}>Delete</button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

window.InspectorV2 = Inspector;
