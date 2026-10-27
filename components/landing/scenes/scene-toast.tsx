const TOAST_W = 244;
const TOAST_H = 60;

/** Sonner-style toast in SVG units, centred on x = 0 with its top edge at y = 0. */
export function SceneToast({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  const left = -TOAST_W / 2;
  return (
    <g className="drop-shadow-pop">
      <rect
        x={left}
        y="0"
        width={TOAST_W}
        height={TOAST_H}
        rx="12"
        className="fill-surface-raised stroke-line-200"
        strokeWidth="1"
      />
      <g transform={`translate(${left + 26} ${TOAST_H / 2})`}>{icon}</g>
      <text x={left + 48} y="26" className="fill-ink-950 font-sans text-[15px] font-semibold">
        {title}
      </text>
      <text x={left + 48} y="45" className="fill-ink-500 font-sans text-[13px] tabular-nums">
        {detail}
      </text>
    </g>
  );
}
