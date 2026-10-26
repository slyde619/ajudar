import { MapPinIcon } from "@phosphor-icons/react/ssr";

/** Calm ripple shown while artisans are being asked. */
export function SearchingPulse({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="flex flex-col items-center text-center" role="status" aria-live="polite">
      <div className="relative flex size-44 items-center justify-center" aria-hidden>
        {[0, 1, 2].map((ring) => (
          <span
            key={ring}
            className="absolute inset-0 animate-ripple rounded-full border border-ink-950/25 motion-reduce:hidden"
            style={{ animationDelay: `${ring * 0.93}s` }}
          />
        ))}
        <span className="absolute inset-10 rounded-full bg-surface-sunken" />
        <span className="relative flex size-12 items-center justify-center rounded-full bg-ink-950 text-celo-500 shadow-pop">
          <MapPinIcon className="size-5" weight="bold" />
        </span>
      </div>
      <p className="mt-2 text-[17px] font-semibold tracking-tight text-ink-950">{label}</p>
      <p className="mt-1 max-w-72 text-sm leading-relaxed text-ink-500">{detail}</p>
    </div>
  );
}
