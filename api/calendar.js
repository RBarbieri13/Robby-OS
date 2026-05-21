// Vercel serverless function — reads the user's iCloud calendar via CalDAV
// and returns events for the current Monday–Sunday week.
//
// Env vars (set in Vercel project settings):
//   APPLE_ID              — Apple ID email (e.g. rbarbieri13@gmail.com)
//   APPLE_APP_PASSWORD    — 16-char app-specific password from appleid.apple.com
//
// Response shape:
//   {
//     weekStart: ISO,  // Monday 00:00 local-ish (UTC ISO)
//     weekEnd:   ISO,  // Sunday 23:59
//     todayIdx:  0..6, // 0=Mon
//     events: [{ title, calendar, start: ISO, end: ISO, allDay: bool }],
//     generatedAt: ISO
//   }

const { DAVClient } = require("tsdav");
const ICAL = require("ical.js");

function weekBounds(now = new Date(), anchor = null) {
  // anchor is a Date pointing at any day within the target week. When null,
  // uses `now` (current week). Lets the client request prev/next weeks via
  // ?week=YYYY-MM-DD.
  const base = anchor ? new Date(anchor) : new Date(now);
  const dow = base.getDay(); // 0=Sun..6=Sat
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(base);
  monday.setDate(base.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  // todayIdx is relative to *real today*, not the requested week. -1 if today
  // falls outside the requested week.
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const dayMs = 24 * 3600 * 1000;
  const diff = Math.round((today - monday) / dayMs);
  const todayIdx = diff >= 0 && diff <= 6 ? diff : -1;
  return { monday, sunday, todayIdx };
}

function pushOccurrence(out, title, calName, startJS, endJS, allDay, monday, sunday) {
  if (endJS < monday || startJS > sunday) return;
  out.push({
    title,
    calendar: calName,
    start: startJS.toISOString(),
    end: endJS.toISOString(),
    allDay: !!allDay,
  });
}

module.exports = async (req, res) => {
  const startedAt = Date.now();
  try {
    if (!process.env.APPLE_ID || !process.env.APPLE_APP_PASSWORD) {
      res.status(500).json({
        error: "Missing APPLE_ID or APPLE_APP_PASSWORD env vars",
        events: [],
      });
      return;
    }

    const client = new DAVClient({
      serverUrl: "https://caldav.icloud.com",
      credentials: {
        username: process.env.APPLE_ID,
        password: process.env.APPLE_APP_PASSWORD,
      },
      authMethod: "Basic",
      defaultAccountType: "caldav",
    });

    await client.login();
    const calendars = await client.fetchCalendars();

    // Parse ?week=YYYY-MM-DD if provided. Any day inside the target week
    // works; weekBounds snaps to that Monday–Sunday.
    let anchor = null;
    const weekParam = req.query && req.query.week;
    if (weekParam && /^\d{4}-\d{2}-\d{2}$/.test(String(weekParam))) {
      anchor = new Date(String(weekParam) + "T12:00:00Z");
      if (isNaN(anchor.getTime())) anchor = null;
    }
    const { monday, sunday, todayIdx } = weekBounds(new Date(), anchor);

    const events = [];
    for (const cal of calendars) {
      let objects;
      try {
        objects = await client.fetchCalendarObjects({
          calendar: cal,
          timeRange: {
            start: monday.toISOString(),
            end: sunday.toISOString(),
          },
        });
      } catch (calErr) {
        continue;
      }

      for (const obj of objects) {
        if (!obj.data) continue;
        try {
          const jcal = ICAL.parse(obj.data);
          const comp = new ICAL.Component(jcal);
          const vevents = comp.getAllSubcomponents("vevent");
          for (const ve of vevents) {
            const ev = new ICAL.Event(ve);
            const allDay = ev.startDate && ev.startDate.isDate;

            if (ev.isRecurring()) {
              const iter = ev.iterator();
              let next;
              let safety = 0;
              while ((next = iter.next()) && safety++ < 500) {
                const startJS = next.toJSDate();
                if (startJS > sunday) break;
                const occ = ev.getOccurrenceDetails(next);
                const endJS = occ.endDate.toJSDate();
                if (endJS < monday) continue;
                pushOccurrence(events, ev.summary || "(untitled)", cal.displayName || "Calendar", startJS, endJS, allDay, monday, sunday);
              }
            } else {
              if (!ev.startDate || !ev.endDate) continue;
              const startJS = ev.startDate.toJSDate();
              const endJS = ev.endDate.toJSDate();
              pushOccurrence(events, ev.summary || "(untitled)", cal.displayName || "Calendar", startJS, endJS, allDay, monday, sunday);
            }
          }
        } catch (parseErr) {
          // skip malformed event objects silently
        }
      }
    }

    events.sort((a, b) => a.start.localeCompare(b.start));

    res.status(200).json({
      weekStart: monday.toISOString(),
      weekEnd: sunday.toISOString(),
      todayIdx,
      events,
      generatedAt: new Date().toISOString(),
      tookMs: Date.now() - startedAt,
    });
  } catch (err) {
    res.status(500).json({
      error: err && err.message ? err.message : String(err),
      events: [],
    });
  }
};
