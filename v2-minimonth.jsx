/* global React, I */
// Mini-month calendar — compact month view for the sidebar.

function MiniMonth({ currentDay = 22 }) {
  const days = [];
  // April 2026: starts on Wed (1st). 30 days.
  for (let i = 0; i < 2; i++) days.push({ blank: true });
  for (let d = 1; d <= 30; d++) days.push({ d });
  const eventDays = new Set([20, 21, 22, 23, 24, 25, 26, 27, 29]);
  const busyDays = new Set([21, 22, 23, 24]);

  return (
    <div className="mini-month">
      <div className="mm-head">
        <button className="mm-nav" aria-label="Previous month" title="Previous month"><I.ChevL className="icon-xs" /></button>
        <span className="mm-title">April 2026</span>
        <button className="mm-nav" aria-label="Next month" title="Next month"><I.ChevR className="icon-xs" /></button>
      </div>
      <div className="mm-grid mm-dow">
        {["S","M","T","W","T","F","S"].map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="mm-grid">
        {days.map((c, i) => {
          if (c.blank) return <span key={i} className="mm-cell blank" />;
          const isToday = c.d === currentDay;
          const isWeek = c.d >= 21 && c.d <= 27;
          const hasEv = eventDays.has(c.d);
          const busy = busyDays.has(c.d);
          return (
            <span key={i}
                  className={"mm-cell " + (isToday ? "today " : "") + (isWeek ? "inwk " : "") + (busy ? "busy" : "")}>
              {c.d}
              {hasEv ? <span className="mm-dot" /> : null}
            </span>
          );
        })}
      </div>
    </div>
  );
}

window.MiniMonth = MiniMonth;
