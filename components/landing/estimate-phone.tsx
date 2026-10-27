import { formatNaira } from "@/lib/utils/money";
import { EXAMPLE_ESTIMATE } from "./content";

/** Phone mock showing an example estimate, the escrowed total and the matched artisan. */
export function EstimatePhone() {
  return (
    <div className="mx-auto w-full max-w-82.5">
      <div className="rounded-[2.75rem] border-10 border-ink-950 bg-surface-warm p-4 pt-8 text-left shadow-pop">
        <p className="font-mono text-[12px] tracking-wide text-ink-500 uppercase">Example estimate</p>
        <p className="mt-1 text-[22px] font-bold tracking-tight text-ink-950">Leaking kitchen tap</p>
        <dl className="mt-4 rounded-2xl bg-surface-raised px-4 pt-1.5 text-ink-950" data-tabular>
          {EXAMPLE_ESTIMATE.items.map((item) => (
            <div key={item.id} className="flex items-baseline justify-between gap-3 py-2.5">
              <dt className="min-w-0">
                <span className="block text-[15px] leading-snug">{item.label}</span>
                <span className="block text-[13px] text-ink-500">
                  {item.negotiable ? "Labour, open to a counter" : "Fixed"}
                </span>
              </dt>
              <dd className="text-right text-[15px] font-medium">{formatNaira(item.amount)}</dd>
            </div>
          ))}
          <div className="-mx-4 mt-1 flex items-baseline justify-between rounded-b-2xl bg-celo-500 px-4 py-3 font-semibold">
            <dt>Agreed, in escrow</dt>
            <dd className="text-right">{formatNaira(EXAMPLE_ESTIMATE.total)}</dd>
          </div>
        </dl>
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-surface-raised p-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-ink-950 text-[15px] font-semibold text-surface-raised">
            CO
          </span>
          <span className="text-left">
            <span className="block text-[15px] font-semibold text-ink-950">Chinedu O.</span>
            <span className="block text-[13px] text-ink-500" data-tabular>
              Plumber · 4.8 · 12 min away
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
