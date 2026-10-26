import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface ProfileRowProps {
  icon: LucideIcon;
  label: string;
  meta?: string;
  tone?: "default" | "danger";
  href?: string;
}

/** Profile row, as a button or a link. */
export function ProfileRow({
  icon: Icon,
  label,
  meta,
  tone = "default",
  href,
}: ProfileRowProps) {
  const destructive = tone === "danger";
  const className =
    "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-sunken/60 active:bg-surface-sunken";

  const content = (
    <>
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-md",
          destructive
            ? "bg-danger-100 text-danger-600"
            : "bg-surface-sunken text-ink-700",
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>

      <span
        className={cn(
          "flex-1 text-sm font-medium",
          destructive ? "text-danger-600" : "text-ink-950",
        )}
      >
        {label}
      </span>

      {meta ? (
        <span className="font-mono text-[11px] text-ink-400" data-tabular>
          {meta}
        </span>
      ) : (
        <ChevronRight
          className={cn(
            "h-4 w-4",
            destructive ? "text-danger-600/50" : "text-ink-300",
          )}
          aria-hidden
        />
      )}
    </>
  );

  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <button type="button" className={className}>
      {content}
    </button>
  );
}
