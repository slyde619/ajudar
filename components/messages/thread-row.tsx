import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initialsOf } from "@/lib/utils/verification";

export interface ThreadRowProps {
  name: string;
  role: string;
  snippet: string;
  time: string;
  unread?: boolean;
}

/** Message thread row. */
export function ThreadRow({
  name,
  role,
  snippet,
  time,
  unread = false,
}: ThreadRowProps) {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      <Avatar className="mt-0.5">
        <AvatarFallback className="bg-surface-sunken text-xs font-semibold text-ink-700">
          {initialsOf(name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="truncate text-sm font-semibold text-ink-950">{name}</p>
          <span
            className="shrink-0 font-mono text-[11px] text-ink-400"
            data-tabular
          >
            {time}
          </span>
        </div>
        <p className="text-xs text-ink-500">{role}</p>
        <p className="mt-1 truncate text-sm text-ink-700">{snippet}</p>
      </div>

      {unread ? (
        <span
          aria-label="Unread"
          className="mt-2 h-2 w-2 shrink-0 rounded-pill bg-ink-950"
        />
      ) : null}
    </div>
  );
}
