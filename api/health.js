// Vercel serverless function — surfaces the health of the data layer at a
// glance. Currently checks: calendar (CalDAV login + calendar list), mail
// (stub for now). Returns 200 even on subsystem failure so the status bar
// can always read a JSON body; client decides what to render.

const { DAVClient } = require("tsdav");

async function checkCalendar() {
  const t0 = Date.now();
  if (!process.env.APPLE_ID || !process.env.APPLE_APP_PASSWORD) {
    return { status: "unconfigured", tookMs: 0, error: "Missing APPLE_ID or APPLE_APP_PASSWORD" };
  }
  try {
    const client = new DAVClient({
      serverUrl: "https://caldav.icloud.com",
      credentials: { username: process.env.APPLE_ID, password: process.env.APPLE_APP_PASSWORD },
      authMethod: "Basic",
      defaultAccountType: "caldav",
    });
    await client.login();
    const calendars = await client.fetchCalendars();
    return { status: "ok", tookMs: Date.now() - t0, calendars: calendars.length };
  } catch (err) {
    return { status: "error", tookMs: Date.now() - t0, error: (err && err.message) ? err.message : String(err) };
  }
}

function checkMail() {
  // Mail is currently a stub. When OAuth lands, swap to a real probe.
  return { status: "stub", tookMs: 0 };
}

module.exports = async (req, res) => {
  const startedAt = Date.now();
  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=120");

  const [calendar, mail] = await Promise.all([checkCalendar(), Promise.resolve(checkMail())]);
  const overall = calendar.status === "ok" && (mail.status === "ok" || mail.status === "stub") ? "ok" : "degraded";

  res.status(200).json({
    overall,
    subsystems: { calendar, mail },
    generatedAt: new Date().toISOString(),
    tookMs: Date.now() - startedAt,
  });
};
