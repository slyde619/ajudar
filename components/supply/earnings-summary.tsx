import { ArrowLineDownIcon, LockKeyIcon, WalletIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import type { ArtisanEarnings, PayoutStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatNaira } from "@/lib/utils/money";
import { formatShortDate } from "@/lib/utils/time";

const PAYOUT: Record<PayoutStatus, { label: string; tone: StatusTone }> = {
  in_escrow: { label: "In escrow", tone: "neutral" },
  released: { label: "Released", tone: "success" },
  paid_out: { label: "Paid out", tone: "neutral" },
  refunded: { label: "Refunded", tone: "neutral" },
};

/** Artisan earnings split into held, available and paid out. */
export function EarningsSummary({ earnings }: { earnings: ArtisanEarnings }) {
  const figures = [
    { label: "Released to you", amount: earnings.released, icon: WalletIcon, strong: true },
    { label: "In escrow", amount: earnings.inEscrow, icon: LockKeyIcon, strong: false },
    { label: "Paid out", amount: earnings.paidOut, icon: ArrowLineDownIcon, strong: false },
  ];

  return (
    <>
      <section className="grid grid-cols-2 gap-3" aria-label="Totals">
        {figures.map((figure) => {
          const Icon = figure.icon;
          return (
            <div
              key={figure.label}
              className={cn(
                "rounded-2xl p-4 ring-1",
                figure.strong ? "col-span-2 bg-ink-950 text-surface-raised ring-ink-950" : "bg-surface-raised ring-line-200",
              )}
            >
              <p
                className={cn(
                  "flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase",
                  figure.strong ? "text-ink-300" : "text-ink-500",
                )}
              >
                <Icon className="size-3.5" aria-hidden />
                {figure.label}
              </p>
              <p
                className={cn("mt-1 font-semibold tracking-tight", figure.strong ? "text-[32px] leading-none" : "text-xl text-ink-950")}
                data-tabular
              >
                {formatNaira(figure.amount)}
              </p>
            </div>
          );
        })}
      </section>
      <p className="mt-3 text-xs leading-relaxed text-ink-500">
        Money is released the moment you type a customer&apos;s code. Transfers to your bank are being set up.
      </p>

      <section className="mt-6" aria-labelledby="earnings-jobs">
        <h2 id="earnings-jobs" className="text-sm font-semibold text-ink-950">
          By job
        </h2>
        {earnings.lines.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">Paid jobs show up here.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line-200 overflow-hidden rounded-2xl bg-surface-raised ring-1 ring-line-200">
            {earnings.lines.map((line) => (
              <li key={line.jobId}>
                <Link
                  href={`/artisan/jobs/${line.jobId}`}
                  className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-sunken/60"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink-950">{line.title}</span>
                    <span className="mt-0.5 block font-mono text-[11px] text-ink-500" data-tabular>
                      {formatShortDate(line.at)}
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <span className="text-sm font-semibold text-ink-950" data-tabular>
                      {formatNaira(line.amount)}
                    </span>
                    <StatusBadge tone={PAYOUT[line.status].tone}>{PAYOUT[line.status].label}</StatusBadge>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
