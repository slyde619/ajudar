import { CaretRightIcon, MapPinIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";

export interface JobCardProps {
  title: string;
  location: string;
  when: string;
  status: string;
  tone: StatusTone;
  href?: string;
}

/** Job summary card, linked when given an href. */
export function JobCard({ title, location, when, status, tone, href }: JobCardProps) {
  const card = (
    <Card className="gap-2.5 rounded-xl ring-line-200 transition-[box-shadow,transform] duration-150 group-active/job:scale-[0.99] group-hover/job:shadow-card">
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm leading-snug font-semibold text-ink-950">{title}</h3>
          <StatusBadge tone={tone}>{status}</StatusBadge>
        </div>
      </CardHeader>
      <CardContent className="flex items-center gap-1.5 text-xs text-ink-500">
        <MapPinIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="truncate">{location}</span>
        <span aria-hidden>·</span>
        <span className="shrink-0 font-mono text-[11px]" data-tabular>
          {when}
        </span>
        {href ? (
          <CaretRightIcon className="ml-auto size-4 shrink-0 text-ink-300" aria-hidden />
        ) : null}
      </CardContent>
    </Card>
  );

  if (!href) return card;
  return (
    <Link href={href} className="group/job block rounded-xl">
      {card}
    </Link>
  );
}
