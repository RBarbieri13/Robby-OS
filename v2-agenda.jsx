/* global React, I */
// Weekly agenda v2 — color-blocked events, task drops as pinned chips, today fill.

const HOURS_START = 6;
const HOURS_END   = 22;
const HOUR_PX     = 30;
const hourToY = h => (h - HOURS_START) * HOUR_PX;

// Calendar-name → project mapping. iCloud calendars rarely match project IDs
// verbatim, so we keyword-match. First hit wins; fallback is "personal".
const PROJECT_KEYWORDS = {
  work:     ["work", "office", "numotion", "job"],
  personal: ["personal", "icloud", "family", "friends"],
  house:    ["house", "home", "chores"],
  health:   ["health", "doctor", "medical", "gym", "fitness", "pt", "dr."],
  ai:       ["ai", "claude", "dev", "code"],
};
function calendarToProject(calName, validProjIds) {
  const cn = (calName || "").toLowerCase();
  for (const pid of validProjIds) {
    const kws = PROJECT_KEYWORDS[pid];
    if (kws && kws.some(k => cn.includes(k))) return pid;
  }
  return validProjIds.includes("personal") ? "personal" : validProjIds[0];
}

const CAL_CACHE_KEY = "robbyos.calendar.v1";

function Agenda({ weekLabel, projectFilters, onPrev, onNext }) {
  const { PROJECTS, AGENDA_TASKS } = window.DATA;
  const projMap = Object.fromEntries(PROJECTS.map(p => [p.id, p]));
  const projIds = PROJECTS.map(p => p.id);
  const days  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  const [apiData, setApiData] = React.useState(null);
  const [loadState, setLoadState] = React.useState("loading"); // loading | live | empty | error
  const [errorMsg, setErrorMsg] = React.useState(null);
  const [events, setEvents] = React.useState([]);
  const [tasks, setTasks]   = React.useState(AGENDA_TASKS);

  // Fetch the real calendar from /api/calendar — initial + every 60s.
  // Warm-start: paint the previous response from localStorage immediately so a
  // cold reload isn't a 3s blank week, then refresh in the background.
  React.useEffect(() => {
    let cancelled = false;
    function mapPayload(j) {
      const monday = new Date(j.weekStart);
      const dayMs = 24 * 3600 * 1000;
      return (j.events || []).map(e => {
        const s = new Date(e.start);
        const en = new Date(e.end);
        const dayIdx = Math.max(0, Math.min(6, Math.floor((s - monday) / dayMs)));
        const startHour = s.getHours() + s.getMinutes() / 60;
        let endHour = en.getHours() + en.getMinutes() / 60;
        if (endHour <= startHour) endHour = startHour + 0.5;
        const project = calendarToProject(e.calendar, projIds);
        return { title: e.title, project, day: dayIdx, start: startHour, end: endHour, allDay: e.allDay, calendar: e.calendar };
      }).filter(e => !e.allDay && e.end > HOURS_START && e.start < HOURS_END);
    }
    try {
      const cached = localStorage.getItem(CAL_CACHE_KEY);
      if (cached) {
        const j = JSON.parse(cached);
        // Only use cache if it covers the current week.
        const monday = new Date(j.weekStart);
        const now = new Date();
        const dow = now.getDay();
        const off = dow === 0 ? -6 : 1 - dow;
        const thisMonday = new Date(now); thisMonday.setDate(now.getDate() + off); thisMonday.setHours(0,0,0,0);
        if (Math.abs(monday - thisMonday) < 24 * 3600 * 1000) {
          setApiData(j);
          const mapped = mapPayload(j);
          setEvents(mapped);
          setLoadState(mapped.length ? "live" : "empty");
        }
      }
    } catch (_) { /* cache miss is fine */ }

    async function load() {
      try {
        const r = await fetch("/api/calendar", { cache: "no-store" });
        const j = await r.json();
        if (cancelled) return;
        if (j.error) {
          setLoadState("error");
          setErrorMsg(j.error);
          return;
        }
        setApiData(j);
        const mapped = mapPayload(j);
        setEvents(mapped);
        setLoadState(mapped.length ? "live" : "empty");
        setErrorMsg(null);
        try { localStorage.setItem(CAL_CACHE_KEY, JSON.stringify(j)); } catch (_) { /* quota */ }
      } catch (err) {
        if (cancelled) return;
        setLoadState("error");
        setErrorMsg((err && err.message) ? err.message : String(err));
      }
    }
    load();
    const id = setInterval(load, 60000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const today = apiData ? apiData.todayIdx : new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const dates = React.useMemo(() => {
    const base = apiData ? new Date(apiData.weekStart) : (() => {
      const n = new Date();
      const dow = n.getDay();
      const off = dow === 0 ? -6 : 1 - dow;
      const m = new Date(n); m.setDate(n.getDate() + off); m.setHours(0,0,0,0);
      return m;
    })();
    return [0,1,2,3,4,5,6].map(i => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return String(d.getDate());
    });
  }, [apiData]);
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
        <span className="count">
          {visibleEvents.length} events · {visibleTasks.length} drops
          {loadState === "loading" ? <span style={{ marginLeft: 8, color: "var(--text-3)" }}>· loading…</span> : null}
          {loadState === "live"    ? <span style={{ marginLeft: 8, color: "var(--c-sage-dim, #5e7258)" }}>· live</span> : null}
          {loadState === "empty"   ? <span style={{ marginLeft: 8, color: "var(--text-3)" }}>· empty week</span> : null}
          {loadState === "error"   ? <span style={{ marginLeft: 8, color: "#a43a2a" }} title={errorMsg || ""}>· calendar error</span> : null}
        </span>
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
