import { HandCoinsIcon, KeyIcon, ShieldCheckIcon } from "@phosphor-icons/react/ssr";
import { CountUpNumber } from "@/components/motion/count-up-number";
import type { Estimate, NegotiationMode } from "@/lib/types";
import { formatNaira } from "@/lib/utils/money";
import { LineItems } from "./line-items";

interface EstimateRevealProps {
  estimate: Estimate;
  mode: NegotiationMode;
  categoryLabel: string;
  areaName: string;
}

const ESCROW_STEPS = [
  { icon: HandCoinsIcon, text: "You pay into escrow only after you pick an artisan and agree the price." },
  { icon: ShieldCheckIcon, text: "ajudar holds it. The artisan can see it's there before they set off." },
  { icon: KeyIcon, text: "They're paid when you give them your completion code — not before." },
];

/** Reveals the system's opening estimate, counted up and broken into lines. */
export function EstimateReveal({ estimate, mode, categoryLabel, areaName }: EstimateRevealProps) {
  const { min, max } = estimate.negotiableBand;
  return (
    <div>
      <p className="font-mono text-[11px] tracking-widest text-ink-500 uppercase">
        {categoryLabel} · {areaName}
      </p>
      <h1 className="mt-1 text-[15px] font-medium text-ink-700">Your estimate</h1>
      <CountUpNumber
        value={estimate.total}
        format="naira"
        durationMs={1100}
        className="mt-1 block text-[44px] leading-none font-semibold tracking-tight text-ink-950"
      />
      {mode === "bounded" ? (
        <p className="mt-3 text-sm text-ink-500">
          Fair range{" "}
          <span className="font-medium text-ink-950" data-tabular>
            {formatNaira(min)} – {formatNaira(max)}
          </span>
          . Artisans can counter on labour, inside this range only.
        </p>
      ) : (
        <p className="mt-3 text-sm text-ink-500">
          <span className="font-medium text-ink-950">Fixed price.</span> No haggling — the first artisan to accept can come.
        </p>
      )}

      <section className="mt-6 rounded-2xl bg-surface-raised px-4 shadow-card ring-1 ring-line-200" aria-label="Estimate breakdown">
        <LineItems items={estimate.lineItems} stagger />
        <div className="flex items-center justify-between border-t border-line-200 py-3">
          <span className="text-sm font-semibold text-ink-950">Total</span>
          <span className="text-sm font-semibold text-ink-950" data-tabular>
            {formatNaira(estimate.total)}
          </span>
        </div>
      </section>

      <section className="mt-6" aria-labelledby="escrow-heading">
        <h2 id="escrow-heading" className="text-sm font-semibold text-ink-950">
          How payment works
        </h2>
        <ul className="mt-3 space-y-3">
          {ESCROW_STEPS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-ink-700">
                <Icon className="size-4" aria-hidden />
              </span>
              <p className="pt-1.5 text-sm leading-relaxed text-ink-700">{text}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
