import { LockIcon } from "@phosphor-icons/react/ssr";
import type { EstimateLineItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatNaira } from "@/lib/utils/money";

const KIND_LABEL: Record<EstimateLineItem["kind"], string> = {
  labour: "Labour",
  transport: "Transport",
  materials: "Materials",
};

interface LineItemsProps {
  items: EstimateLineItem[];
  previous?: EstimateLineItem[];
  stagger?: boolean;
  className?: string;
}

/** Labour, transport and materials as separate lines, with a lock on fixed ones. */
export function LineItems({ items, previous, stagger = false, className }: LineItemsProps) {
  return (
    <ul className={cn("divide-y divide-line-200", className)}>
      {items.map((item, index) => {
        const before = previous?.[index];
        const moved = before !== undefined && before.amount !== item.amount;
        return (
          <li
            key={item.id}
            className={cn(
              "flex items-start gap-3 py-3",
              stagger && "animate-in fade-in slide-in-from-bottom-1 fill-mode-both duration-300 ease-out-quint",
            )}
            style={stagger ? { animationDelay: `${700 + index * 90}ms` } : undefined}
          >
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] tracking-widest text-ink-400 uppercase">{KIND_LABEL[item.kind]}</p>
              <p className="mt-0.5 text-sm font-medium text-ink-950">{item.label}</p>
              {item.note ? <p className="mt-0.5 text-xs text-ink-500">{item.note}</p> : null}
            </div>
            <div className="flex shrink-0 flex-col items-end">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-950" data-tabular>
                {item.negotiable ? null : <LockIcon className="size-3 text-ink-400" aria-label="Not negotiable" />}
                {formatNaira(item.amount)}
              </span>
              {moved ? (
                <span className="text-xs text-ink-400 line-through" data-tabular>
                  {formatNaira(before.amount)}
                </span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
