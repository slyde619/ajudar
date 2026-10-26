function Plumbing() {
  return (
    <>
      <rect x="0" y="46" width="120" height="22" className="fill-ink-950" />
      <rect x="108" y="34" width="22" height="46" rx="4" className="fill-ink-800" />
      <path d="M130 50 h36 q16 0 16 16 v18" className="stroke-ink-950" strokeWidth="20" fill="none" />
      <rect x="140" y="20" width="10" height="24" className="fill-ink-950" />
      <rect x="124" y="12" width="42" height="12" rx="6" className="fill-scene-clay" />
      <path d="M182 110 q-8 12 0 18 q8 -6 0 -18 z" className="fill-scene-cloud" />
      <path d="M182 138 q-6 9 0 14 q6 -5 0 -14 z" className="fill-scene-cloud" />
    </>
  );
}

function Electrical() {
  return (
    <>
      <rect x="40" y="30" width="110" height="110" rx="14" className="fill-scene-cloud stroke-ink-950" strokeWidth="5" />
      <rect x="72" y="62" width="12" height="26" rx="3" className="fill-ink-950" />
      <rect x="106" y="62" width="12" height="26" rx="3" className="fill-ink-950" />
      <circle cx="95" cy="108" r="7" className="fill-ink-950" />
      <path d="M170 18 l-22 40 h18 l-14 36 l36 -48 h-20 l14 -28 z" className="fill-celo-500 stroke-ink-950" strokeWidth="4" strokeLinejoin="round" />
    </>
  );
}

function AirCon() {
  return (
    <>
      <rect x="10" y="20" width="190" height="62" rx="14" className="fill-scene-cloud stroke-ink-950" strokeWidth="5" />
      <rect x="28" y="60" width="154" height="8" rx="4" className="fill-ink-950" />
      <circle cx="176" cy="38" r="5" className="fill-scene-leaf" />
      {[40, 90, 140].map((x) => (
        <path key={x} d={`M${x} 96 q12 16 0 30 q-12 14 0 28`} className="stroke-scene-blue" strokeWidth="7" fill="none" strokeLinecap="round" />
      ))}
    </>
  );
}

function Generator() {
  return (
    <>
      <rect x="20" y="52" width="160" height="92" rx="10" className="fill-scene-clay stroke-ink-950" strokeWidth="5" />
      <path d="M36 52 v-20 h128 v20" className="stroke-ink-950" strokeWidth="8" fill="none" />
      <rect x="40" y="72" width="64" height="40" rx="6" className="fill-ink-950" />
      <circle cx="140" cy="92" r="16" className="fill-scene-cloud stroke-ink-950" strokeWidth="5" />
      <rect x="182" y="70" width="14" height="10" className="fill-ink-950" />
      <circle cx="204" cy="56" r="10" className="fill-ink-300" />
      <circle cx="212" cy="34" r="7" className="fill-ink-300" />
      <rect x="28" y="144" width="20" height="10" className="fill-ink-950" />
      <rect x="152" y="144" width="20" height="10" className="fill-ink-950" />
    </>
  );
}

function Carpentry() {
  return (
    <>
      <rect x="0" y="104" width="220" height="30" rx="4" className="fill-scene-sand stroke-ink-950" strokeWidth="5" />
      <path d="M40 119 h40 M120 119 h60" className="stroke-ink-700" strokeWidth="3" />
      <path d="M62 30 L196 92 L180 106 L52 50 Z" className="fill-scene-cloud stroke-ink-950" strokeWidth="5" strokeLinejoin="round" />
      <path d="M78 52 l6 -8 M102 63 l6 -8 M126 74 l6 -8 M150 85 l6 -8" className="stroke-ink-950" strokeWidth="3" />
      <rect x="18" y="18" width="46" height="34" rx="10" className="fill-scene-clay stroke-ink-950" strokeWidth="5" transform="rotate(24 41 35)" />
    </>
  );
}

function Painting() {
  return (
    <>
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <rect key={`${r}${c}`} x={92 + c * 32} y={70 + r * 30} width="28" height="26" rx="3" className={(r + c) % 2 ? "fill-scene-cloud" : "fill-scene-lilac"} />
        )),
      )}
      <rect x="16" y="22" width="120" height="34" rx="10" className="fill-scene-clay stroke-ink-950" strokeWidth="5" />
      <path d="M136 39 h18 v30 h-74 v24" className="stroke-ink-950" strokeWidth="7" fill="none" strokeLinejoin="round" />
      <rect x="70" y="92" width="20" height="56" rx="8" className="fill-ink-950" />
    </>
  );
}

const ART = {
  plumbing: Plumbing,
  electrical: Electrical,
  ac: AirCon,
  generator: Generator,
  carpentry: Carpentry,
  painting: Painting,
} as const;

/** Decorative drawing of a trade, picked by id. */
export function TradeArt({ id, className }: { id: string; className?: string }) {
  const Art = ART[id as keyof typeof ART];
  if (!Art) return null;
  return (
    <svg viewBox="0 0 220 160" className={className} aria-hidden>
      <Art />
    </svg>
  );
}
