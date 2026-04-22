/* global React, I */
// Weekly agenda v2 — color-blocked events, task drops as pinned chips, today fill.

const HOURS_START = 6;
const HOURS_END   = 22;
const HOUR_PX     = 30;
const hourToY = h => (h - HOURS_START) * HOUR_PX;

function Agenda({ weekLabel, projectFilters, onPrev, onNext }) {
  const { PROJECTS, AGENDA_EVENTS, AGENDA_TASKS } = window.DATA;
  const projMap = Object.fromEntries(PROJECTS.map(p => [p.id, p]));
  const today = 1;
  const days  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const dates = ["21","22","23","24","25","26","27"];

  const [events, setEvents] = React.useState(AGENDA_EVENTS);
  const [tasks, setTasks]   = React.useState(AGENDA_TASKS);
  const [dragging, setDragging] = React.useState(null); // {kind,idx,origDay,origStart}
  const [ghost, setGhost]       = React.useState(null);   // {day,start,duration,title,project}

  const gridRef = React.useRef(null);

  const visibleEvents = events.filter(e => projectFilters.includes(e.project));
  const visibleTasks  = tasks.filter(t => projectFilters.includes(t.project));

  const startDrag = (e, kind, idx) => {
    e.stopPropagation();
    const item = kind === "event" ? events[idx] : tasks[idx];
    const duration = kind === "event" ? (item.end - item.start) : 0.5;
    setDragging({ kind, idx, duration, offsetY: e.nativeEvent.offsetY });
    setGhost({ day: item.day, start: item.start, duration, title: item.title, project: item.project });

    const onMove = (ev) => {
      if (!gridRef.current) return;
      const rect  = gridRef.current.getBoundingClientRect();
      const hourCol = 40; // width of hour col
      const cols = 7;
      const colW = (rect.width - hourCol) / cols;
      const relX = ev.clientX - rect.left - hourCol;
      const day  = Math.max(0, Math.min(6, Math.floor(relX / colW)));
      const relY = ev.clientY - rect.top - 28; // body offset after hour header
      const snappedHour = HOURS_START + Math.round((relY / HOUR_PX) * 2) / 2; // 30min snap
      const start = Math.max(HOURS_START, Math.min(HOURS_END - duration, snappedHour));
      setGhost({ day, start, duration, title: item.title, project: item.project });
    };
    const onUp = (ev) => {
      setGhost(g => {
        if (g) {
          if (kind === "event") {
            setEvents(prev => prev.map((x, i) => i === idx ? { ...x, day: g.day, start: g.start, end: g.start + (x.end - x.start) } : x));
          } else {
            setTasks(prev => prev.map((x, i) => i === idx ? { ...x, day: g.day, start: g.start } : x));
          }
        }
        return null;
      });
      setDragging(null);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const eventsOn = (d) => visibleEvents.filter(e => e.day === d).length + visibleTasks.filter(t => t.day === d).length;

  const hours = []; for (let h = HOURS_START; h < HOURS_END; h++) hours.push(h);

  const fmtH = h => { const ap = h >= 12 ? "p" : "a"; const hh = ((h + 11) % 12) + 1; return hh + ap; };
  const fmtHm = h => {
    const hh = Math.floor(h); const mm = Math.round((h - hh) * 60);
    const ap = hh >= 12 ? "p" : "a"; const hh12 = ((hh + 11) % 12) + 1;
    return hh12 + (mm ? ":" + String(mm).padStart(2, "0") : "") + ap;
  };
  const nowY = hourToY(10.4);

  return (
    <div className="pane agenda" data-screen-label="Weekly Agenda">
      <div className="pane-head">
        <I.Grip className="grip icon-sm" />
        <I.Calendar className="icon-sm" style={{ color: "var(--text-2)" }} />
        <span className="title">Weekly Agenda</span>
        <span className="title-sub">· 7-day · 6a–10p</span>
        <span className="count">{visibleEvents.length} events · {visibleTasks.length} drops</span>
        <button className="chev-btn" onClick={onPrev} style={{ marginLeft: 6 }} aria-label="Previous week" title="Previous week">
          <I.ChevL className="icon-sm" />
        </button>
        <span style={{ fontSize: 11.5, color: "var(--text-1)", fontWeight: 600 }}>{weekLabel}</span>
        <button className="chev-btn" onClick={onNext} aria-label="Next week" title="Next week"><I.ChevR className="icon-sm" /></button>

        <div className="spacer" />
        <div className="seg">
          <div className="seg-item active">Week</div>
          <div className="seg-item">Day</div>
        </div>
        <div className="icons">
          <button className="ic-btn" title="Filter calendars"><I.Filter className="icon-sm" /></button>
          <button className="ic-btn" title="Pop out"><I.PopOut className="icon-sm" /></button>
          <button className="ic-btn" title="More"><I.Dots className="icon-sm" /></button>
        </div>
      </div>

      {/* Day tile headers */}
      <div className="agenda-head">
        <div className="ag-cell hour-head">PT</div>
        {days.map((d, i) => (
          <div key={d} className={"ag-cell " + (i === today ? "today" : "")}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span className="day-name">{d}</span>
              <span className="day-num">{dates[i]}</span>
            </div>
            <span className="day-count">{eventsOn(i)}</span>
          </div>
        ))}
      </div>

      <div className="agenda-body">
        <div className="agenda-grid" ref={gridRef}>
          <div className="hour-col">
            {hours.map(h => <div key={h} className="hour">{fmtH(h)}</div>)}
          </div>
          {days.map((d, dayIdx) => (
            <div key={d} className={"day-col " + (dayIdx === today ? "today" : "")}>
              {hours.map(h => <div key={h} className="hour-line" />)}

              {events.map((e, origIdx) => ({ e, origIdx })).filter(({ e }) => e.day === dayIdx && projectFilters.includes(e.project)).map(({ e, origIdx }) => {
                const proj = projMap[e.project];
                const top = hourToY(e.start);
                const height = Math.max(24, (e.end - e.start) * HOUR_PX - 4);
                const isDragging = dragging?.kind === "event" && dragging?.idx === origIdx;
                return (
                  <div key={"ev" + origIdx}
                       className={"event " + (isDragging ? "dragging" : "")}
                       style={{ top, height, "--accent": proj.color }}
                       onMouseDown={(me) => startDrag(me, "event", origIdx)}>
                    <div className="ev-handle" />
                    <div className="ev-title">{e.title}</div>
                    <div className="ev-time">{fmtHm(e.start)}–{fmtHm(e.end)}</div>
                  </div>
                );
              })}

              {tasks.map((t, origIdx) => ({ t, origIdx })).filter(({ t }) => t.day === dayIdx && projectFilters.includes(t.project)).map(({ t, origIdx }) => {
                const proj = projMap[t.project];
                const top = hourToY(t.start);
                const isDragging = dragging?.kind === "task" && dragging?.idx === origIdx;
                return (
                  <div key={"tsk" + origIdx}
                       className={"task-chip " + (isDragging ? "dragging" : "")}
                       style={{ top, "--accent": proj.color }}
                       onMouseDown={(me) => startDrag(me, "task", origIdx)}>
                    <span className="dot" />
                    <span className="label">{t.title}</span>
                  </div>
                );
              })}

              {/* drag ghost */}
              {ghost && ghost.day === dayIdx ? (
                <div className="event-ghost" style={{
                  top: hourToY(ghost.start),
                  height: Math.max(24, ghost.duration * HOUR_PX - 4),
                  "--accent": projMap[ghost.project].color,
                }}>
                  <div className="ev-title">{ghost.title}</div>
                  <div className="ev-time">{fmtHm(ghost.start)}</div>
                </div>
              ) : null}

              {dayIdx === today ? <div className="now-line" style={{ top: nowY }} /> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.AgendaV2 = Agenda;
