import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";

interface ActiveJobBannerProps {
  title: string;
  status: string;
  tone: StatusTone;
  hint: string;
  href: string;
}

/** Banner for the artisan's current job, pinned above the feed. */
export function ActiveJobBanner({ title, status, tone, hint, href }: ActiveJobBannerProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl bg-ink-950 p-4 text-surface-raised shadow-pop transition-transform duration-100 ease-out active:scale-[0.98]"
    >
      <span className="min-w-0 flex-1">
        <StatusBadge tone={tone}>{status}</StatusBadge>
        <span className="mt-2 block truncate text-[15px] font-semibold">{title}</span>
        <span className="mt-0.5 block text-xs text-ink-300">{hint}</span>
      </span>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-celo-500 text-ink-950">
        <ArrowRightIcon className="size-5" aria-hidden />
      </span>
    </Link>
  );
}
