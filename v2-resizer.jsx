/* global React */
// Universal Resizer — vertical (drag left/right) or horizontal (drag
// up/down). Self-contained: each instance owns its drag listeners and
// commits to the parent's setter via onDrag(deltaPx) or onSet(value).
//
// Usage:
//   <Resizer orient="vertical"
//            value={railW}
//            onChange={setRailW}
//            min={80}
//            onReset={() => setRailW(180)} />
//
// - orient "vertical" = drag left/right, pixel delta applied
// - orient "horizontal" = drag up/down, pixel delta applied
// - Double-click calls onReset()
// - While dragging, adds .dragging class and .body-dragging-cursor on <body>

function Resizer({ orient = "vertical", value, onChange, min = 60, max = 9999, onReset, invert = false, title }) {
  const ref = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);

  const onDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startVal = value;
    const startCoord = orient === "vertical" ? e.clientX : e.clientY;
    setDragging(true);

    document.body.classList.add(orient === "vertical" ? "body-col-resize" : "body-row-resize");

    const onMove = (ev) => {
      const now = orient === "vertical" ? ev.clientX : ev.clientY;
      let delta = now - startCoord;
      if (invert) delta = -delta;
      const next = Math.max(min, Math.min(max, startVal + delta));
      onChange(next);
    };
    const onUp = () => {
      setDragging(false);
      document.body.classList.remove("body-col-resize");
      document.body.classList.remove("body-row-resize");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const onDblClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onReset) onReset();
  };

  return (
    <div
      ref={ref}
      className={"resizer resizer-" + orient + (dragging ? " dragging" : "")}
      onMouseDown={onDown}
      onDoubleClick={onDblClick}
      role="separator"
      aria-orientation={orient}
      title={title || (orient === "vertical" ? "Drag to resize · double-click to reset" : "Drag to resize · double-click to reset")}
    >
      <div className="resizer-grip" />
    </div>
  );
}

window.Resizer = Resizer;
