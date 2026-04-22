/* global React */
// Icon set — Lucide-style, hand-drawn, stroke 1.75. All share sizing classes.
const I = {};

const mk = (paths, opts = {}) => ({ className = "icon", ...p } = {}) =>
  React.createElement("svg", {
    className, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: opts.sw ?? 1.75,
    strokeLinecap: "round", strokeLinejoin: "round", ...p
  }, paths.map((d, i) => React.createElement("path", { key: i, d })));

I.Search       = mk(["M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z", "M21 21l-4.35-4.35"]);
I.Bell         = mk(["M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9", "M10 21a2 2 0 0 0 4 0"]);
I.Sun          = mk(["M12 3v2", "M12 19v2", "M5.6 5.6l1.4 1.4", "M17 17l1.4 1.4", "M3 12h2", "M19 12h2", "M5.6 18.4 7 17", "M17 7l1.4-1.4", "M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"]);
I.Moon         = mk(["M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"]);
I.ChevL        = mk(["M15 18l-6-6 6-6"]);
I.ChevR        = mk(["M9 18l6-6-6-6"]);
I.ChevD        = mk(["M6 9l6 6 6-6"]);
I.ChevU        = mk(["M6 15l6-6 6 6"]);
I.Plus         = mk(["M12 5v14", "M5 12h14"]);
I.X            = mk(["M18 6 6 18", "M6 6l12 12"]);
I.Filter       = mk(["M4 5h16", "M7 12h10", "M10 19h4"]);
I.Layout       = mk(["M3 3h7v18H3z", "M14 3h7v10h-7z", "M14 17h7v4h-7z"]);
I.Sparkles     = mk(["M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z", "M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"]);
I.Dots         = mk(["M5 12h.01", "M12 12h.01", "M19 12h.01"], { sw: 2.5 });
I.PopOut       = mk(["M15 3h6v6", "M10 14 21 3", "M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"]);
I.Collapse     = mk(["M4 14h6v6", "M20 10h-6V4", "M14 10l7-7", "M3 21l7-7"]);
I.Grid         = mk(["M3 3h7v7H3z", "M14 3h7v7h-7z", "M3 14h7v7H3z", "M14 14h7v7h-7z"]);
I.Check        = mk(["M5 12l5 5L20 7"], { sw: 2.25 });
I.Clock        = mk(["M12 7v5l3 2", "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z"]);
I.Flag         = mk(["M4 21V4", "M4 4h14l-3 5 3 5H4"]);
I.Paperclip    = mk(["M21 11 12 20a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 0 1-3-3l8-8"]);
I.Star         = mk(["M12 3l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8-5.4 2.8 1-6L3.3 9.4l6-.9z"]);
I.FileText     = mk(["M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z", "M14 3v6h6", "M8 13h8", "M8 17h6"]);
I.CheckSquare  = mk(["M9 11l2 2 4-4", "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"]);
I.Calendar     = mk(["M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z", "M16 2v4", "M8 2v4", "M3 10h18"]);
I.Target       = mk(["M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z", "M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10z", "M12 11a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"]);
I.Mail         = mk(["M3 6h18v12H3z", "M3 6l9 7 9-7"]);
I.Inbox        = mk(["M21 12H3", "M3 12l4-7h10l4 7v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M7 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2"]);
I.Zap          = mk(["M13 3 4 14h7l-1 7 9-11h-7z"]);
I.Reply        = mk(["M9 17 4 12l5-5", "M4 12h10a6 6 0 0 1 6 6v2"]);
I.Newspaper    = mk(["M4 4h13v16H6a2 2 0 0 1-2-2z", "M17 8h3v10a2 2 0 0 1-2 2", "M7 8h7", "M7 12h7", "M7 16h4"]);
I.Archive      = mk(["M3 5h18v4H3z", "M5 9v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9", "M10 13h4"]);
I.Grip         = mk(["M9 6h.01", "M15 6h.01", "M9 12h.01", "M15 12h.01", "M9 18h.01", "M15 18h.01"], { sw: 2.5 });
I.Command      = mk(["M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 0-6H6a3 3 0 0 0 0 6 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0 0 6h12a3 3 0 0 0 0-6z"]);
I.Users        = mk(["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M9 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z", "M23 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"]);
I.Edit         = mk(["M12 20h9", "M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4z"]);
I.Folder       = mk(["M3 7a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"]);
I.Link         = mk(["M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1", "M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"]);
I.TrendUp      = mk(["M3 17l6-6 4 4 8-8", "M14 7h7v7"]);

window.I = I;
