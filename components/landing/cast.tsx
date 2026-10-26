export type Mood = "calm" | "worried" | "happy" | "tired";

/** Ankara print pattern for Adaeze's wrapper and gele. */
export function Ankara({ id }: { id: string }) {
  return (
    <pattern id={id} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
      <rect width="12" height="12" className="fill-celo-500" />
      <circle cx="3" cy="3" r="2.2" className="fill-ink-950" />
      <circle cx="9" cy="9" r="1.2" className="fill-ink-950" />
      <path d="M0 9 h3 M6 3 h6" className="stroke-ink-950" strokeWidth="0.8" />
    </pattern>
  );
}

function Face({ x = 0, y, mood, profile = false }: { x?: number; y: number; mood: Mood; profile?: boolean }) {
  const eyes = profile ? [x + 7] : [x - 6, x + 6];
  const mouth = {
    calm: `M${x + (profile ? 4 : -4)} ${y + 9} h8`,
    happy: `M${x + (profile ? 3 : -6)} ${y + 7} q${profile ? 5 : 6} 7 ${profile ? 10 : 12} 0`,
    worried: `M${x + (profile ? 4 : -5)} ${y + 11} q${profile ? 4 : 5} -4 ${profile ? 8 : 10} 0`,
    tired: `M${x + (profile ? 4 : -4)} ${y + 10} q4 -1.5 8 0`,
  }[mood];
  return (
    <g className="stroke-ink-950" strokeLinecap="round" fill="none">
      {eyes.map((ex) =>
        mood === "tired" ? (
          <path key={ex} d={`M${ex - 2.5} ${y} h5`} strokeWidth="1.8" />
        ) : mood === "happy" ? (
          <path key={ex} d={`M${ex - 2.5} ${y + 0.8} q2.5 -3 5 0`} strokeWidth="1.8" />
        ) : (
          <circle key={ex} cx={ex} cy={y} r="1.6" className="fill-ink-950" strokeWidth="0" />
        ),
      )}
      {mood === "worried"
        ? eyes.map((ex, i) => (
            <path key={`b${ex}`} d={i === 0 && !profile ? `M${ex - 3} ${y - 5} l6 -2` : `M${ex - 3} ${y - 7} l6 2`} strokeWidth="1.6" />
          ))
        : null}
      <path d={mouth} strokeWidth="1.8" />
    </g>
  );
}

function Limb({ d, sleeve, width = 10 }: { d: string; sleeve: string; width?: number }) {
  return <path d={d} className={sleeve} fill="none" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />;
}

type ArmPose = "down" | "wave" | "phone" | "box";

interface PersonProps {
  mood?: Mood;
  arm?: ArmPose;
  phone?: React.ReactNode;
}

/** Chinedu the artisan, drawn flat with a mood and an arm pose. */
export function Chinedu({ mood = "calm", arm = "box", phone }: PersonProps) {
  return (
    <g>
      <ellipse cx="0" cy="1" rx="30" ry="5" className="fill-line-300" />
      <rect x="-15" y="-74" width="13" height="70" rx="6" className="fill-ink-800" />
      <rect x="2" y="-74" width="13" height="70" rx="6" className="fill-ink-800" />
      <rect x="-19" y="-9" width="18" height="9" rx="4" className="fill-ink-950" />
      <rect x="1" y="-9" width="18" height="9" rx="4" className="fill-ink-950" />
      <rect x="-24" y="-138" width="48" height="72" rx="17" className="fill-celo-500" />
      <rect x="-24" y="-82" width="48" height="14" rx="6" className="fill-ink-800" />
      <rect x="-14" y="-118" width="28" height="44" rx="5" className="fill-ink-800" />
      <path d="M-11 -118 L-16 -136 M11 -118 L16 -136" className="stroke-ink-800" strokeWidth="4" strokeLinecap="round" />
      <rect x="-6" y="-110" width="12" height="9" rx="2" className="fill-ink-950" />
      {arm === "phone" ? null : (
        <>
          <Limb d="M-22 -128 L-28 -104" sleeve="stroke-celo-500" width={12} />
          <Limb d="M-28 -104 L-29 -82" sleeve="stroke-skin-700" width={9} />
        </>
      )}
      {arm === "box" ? (
        <>
          <Limb d="M22 -128 L28 -104" sleeve="stroke-celo-500" width={12} />
          <Limb d="M28 -104 L31 -84" sleeve="stroke-skin-700" width={9} />
          <path d="M22 -72 v-8 q0 -6 6 -6 h8 q6 0 6 6 v8" className="stroke-ink-950" fill="none" strokeWidth="3.5" />
          <rect x="14" y="-74" width="36" height="26" rx="5" className="fill-ink-950" />
          <rect x="28" y="-68" width="8" height="5" rx="1.5" className="fill-celo-500" />
        </>
      ) : arm === "phone" ? (
        <>
          <Limb d="M-22 -128 L-30 -108" sleeve="stroke-celo-500" width={12} />
          <Limb d="M-30 -108 L-42 -100" sleeve="stroke-skin-700" width={9} />
          <g transform="translate(-48 -108) rotate(12)">{phone}</g>
          <Limb d="M22 -128 L28 -104" sleeve="stroke-celo-500" width={12} />
          <Limb d="M28 -104 L29 -82" sleeve="stroke-skin-700" width={9} />
        </>
      ) : (
        <>
          <Limb d="M22 -128 L28 -104" sleeve="stroke-celo-500" width={12} />
          <Limb d="M28 -104 L29 -82" sleeve="stroke-skin-700" width={9} />
        </>
      )}
      <rect x="-5" y="-150" width="10" height="14" className="fill-skin-700" />
      <circle cx="-17" cy="-164" r="4" className="fill-skin-700" />
      <circle cx="17" cy="-164" r="4" className="fill-skin-700" />
      <circle cx="0" cy="-165" r="17" className="fill-skin-700" />
      <path d="M-17 -169 a17 17 0 0 1 34 0 z" className="fill-ink-950" />
      <rect x="-2" y="-173" width="26" height="5" rx="2.5" className="fill-ink-950" />
      <Face y={-162} mood={mood} />
    </g>
  );
}

/** Adaeze the customer, drawn flat with a mood and an arm pose. */
export function Adaeze({ mood = "calm", arm = "down", pattern, phone }: PersonProps & { pattern: string }) {
  return (
    <g>
      <ellipse cx="0" cy="1" rx="28" ry="5" className="fill-line-300" />
      <path d="M-19 -86 L19 -86 L24 -6 L-24 -6 Z" fill={`url(#${pattern})`} />
      <rect x="-15" y="-8" width="12" height="7" rx="3.5" className="fill-ink-950" />
      <rect x="3" y="-8" width="12" height="7" rx="3.5" className="fill-ink-950" />
      <rect x="-21" y="-140" width="42" height="62" rx="16" className="fill-ink-800" />
      <Limb d="M-19 -130 L-25 -108" sleeve="stroke-ink-800" width={12} />
      <Limb d="M-25 -108 L-26 -86" sleeve="stroke-skin-500" width={8.5} />
      {arm === "wave" ? (
        <>
          <Limb d="M19 -130 L32 -146" sleeve="stroke-ink-800" width={12} />
          <Limb d="M32 -146 L38 -168" sleeve="stroke-skin-500" width={8.5} />
          <circle cx="39" cy="-171" r="5.5" className="fill-skin-500" />
        </>
      ) : arm === "phone" ? (
        <>
          <Limb d="M19 -130 L28 -108" sleeve="stroke-ink-800" width={12} />
          <Limb d="M28 -108 L40 -100" sleeve="stroke-skin-500" width={8.5} />
          <g transform="translate(46 -108) rotate(-12)">{phone}</g>
        </>
      ) : (
        <>
          <Limb d="M19 -130 L25 -108" sleeve="stroke-ink-800" width={12} />
          <Limb d="M25 -108 L26 -86" sleeve="stroke-skin-500" width={8.5} />
        </>
      )}
      <rect x="-5" y="-152" width="10" height="14" className="fill-skin-500" />
      <circle cx="0" cy="-166" r="16" className="fill-skin-500" />
      <path d="M-25 -170 Q-30 -200 -2 -197 Q27 -204 27 -172 Q4 -182 -25 -170 Z" fill={`url(#${pattern})`} />
      <path d="M-25 -170 Q4 -182 27 -172" className="stroke-ink-950" strokeWidth="1.2" fill="none" />
      <circle cx="-16" cy="-157" r="2.2" className="fill-celo-500" />
      <circle cx="16" cy="-157" r="2.2" className="fill-celo-500" />
      <Face y={-164} mood={mood} />
    </g>
  );
}

/** Adaeze seated side-on at a table, chin on her hand. */
export function AdaezeWaiting({ pattern, mood = "tired" }: { pattern: string; mood?: Mood }) {
  return (
    <g>
      <rect x="-22" y="0" width="34" height="5" rx="2" className="fill-ink-950" />
      <rect x="-22" y="0" width="4" height="54" className="fill-ink-950" />
      <rect x="8" y="0" width="4" height="54" className="fill-ink-950" />
      <rect x="-24" y="-56" width="5" height="60" rx="2.5" className="fill-ink-950" />
      <rect x="-14" y="-14" width="56" height="16" rx="8" fill={`url(#${pattern})`} />
      <rect x="30" y="-6" width="13" height="58" rx="6" fill={`url(#${pattern})`} />
      <rect x="28" y="48" width="20" height="7" rx="3.5" className="fill-ink-950" />
      <rect x="-14" y="-70" width="30" height="64" rx="14" className="fill-ink-800" transform="rotate(10 0 -10)" />
      <Limb d="M6 -58 L40 -30" sleeve="stroke-ink-800" width={11} />
      <Limb d="M40 -30 L30 -64" sleeve="stroke-skin-500" width={8} />
      <circle cx="22" cy="-82" r="15" className="fill-skin-500" />
      <path d="M2 -86 Q-2 -114 22 -112 Q46 -116 42 -88 Q22 -98 2 -86 Z" fill={`url(#${pattern})`} />
      <path d="M2 -86 Q22 -98 42 -88" className="stroke-ink-950" strokeWidth="1.2" fill="none" />
      <circle cx="16" cy="-72" r="2" className="fill-celo-500" />
      <Face x={24} y={-80} mood={mood} profile />
    </g>
  );
}

/** A phone drawn face-on, with an optionally lit screen. */
export function Handset({ children, lit = false, scale = 1 }: { children?: React.ReactNode; lit?: boolean; scale?: number }) {
  return (
    <g transform={`scale(${scale})`}>
      <rect x="-12" y="-21" width="24" height="42" rx="5" className="fill-ink-950" />
      <rect x="-9.5" y="-17" width="19" height="33" rx="2.5" className={lit ? "fill-celo-500" : "fill-ink-800"} />
      {children}
    </g>
  );
}

/** A keke drawn side-on, with an optional rider. */
export function Keke({ rider }: { rider?: React.ReactNode }) {
  return (
    <g>
      <path d="M8 -86 Q10 -100 26 -100 H92 Q108 -100 112 -86 Z" className="fill-scene-palm" />
      <rect x="10" y="-88" width="5" height="54" className="fill-ink-950" />
      <rect x="98" y="-88" width="4" height="40" className="fill-ink-950" />
      {rider ? <g transform="translate(82 0) scale(0.45)">{rider}</g> : null}
      <path d="M0 -50 Q0 -60 10 -60 H64 L76 -40 H104 Q118 -40 122 -24 L124 -12 H0 Z" className="fill-celo-500" />
      <path d="M104 -88 L120 -40" className="stroke-ink-950" strokeWidth="4" strokeLinecap="round" />
      <rect x="6" y="-54" width="44" height="20" rx="3" className="fill-ink-800" />
      <rect x="0" y="-26" width="124" height="3" className="fill-scene-palm" />
      <rect x="114" y="-34" width="10" height="6" rx="2" className="fill-surface-raised" />
      <circle cx="26" cy="-8" r="10" className="fill-ink-950" />
      <circle cx="26" cy="-8" r="4" className="fill-ink-500" />
      <circle cx="110" cy="-8" r="9" className="fill-ink-950" />
      <circle cx="110" cy="-8" r="3.5" className="fill-ink-500" />
    </g>
  );
}
