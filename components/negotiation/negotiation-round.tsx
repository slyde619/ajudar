import { CheckIcon } from "@phosphor-icons/react/ssr";
import type { NegotiationRound as Round } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatNaira } from "@/lib/utils/money";
import { formatClock } from "@/lib/utils/time";
import { LineItems } from "./line-items";

interface NegotiationRoundProps {
  round: Round;
  previous?: Round;
  counterpartName: string;
  latest: boolean;
  viewer?: "customer" | "artisan";
}

/** One structured offer in a negotiation, shown as a card. */
export function NegotiationRound({ round, previous, counterpartName, latest, viewer = "customer" }: NegotiationRoundProps) {
  const mine = round.actor === viewer;
  const who = round.actor === "system" ? "ajudar estimate" : mine ? "You" : counterpartName;
  return (
    <li
      className={cn(
        "rounded-2xl p-4 ring-1",
        mine ? "bg-surface-sunken ring-transparent" : "bg-surface-raised ring-line-200",
        latest && !mine && "shadow-card ring-ink-950/15",
        !latest && "opacity-80",
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-[10px] tracking-widest text-ink-500 uppercase">
          {who} · {formatClock(round.createdAt)}
        </p>
        {round.accepted ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-success-600">
            <CheckIcon className="size-3.5" weight="bold" aria-hidden />
            Agreed
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-xl font-semibold tracking-tight text-ink-950" data-tabular>
        {formatNaira(round.total)}
      </p>
      {round.actor !== "system" ? (
        <p className="mt-1.5 text-sm leading-relaxed text-ink-700">“{round.reason}”</p>
      ) : null}
      {latest ? (
        <LineItems items={round.lineItems} previous={previous?.lineItems} className="mt-2 border-t border-line-200" />
      ) : null}
    </li>
  );
}
