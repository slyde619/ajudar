import { MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";

export interface JobCardProps {
  title: string;
  location: string;
  when: string;
  status: string;
  tone: StatusTone;
}

/** Pure presentational card. Navigation and data arrive as props later. */
export function JobCard({ title, location, when, status, tone }: JobCardProps) {
  return (
    <Card className="gap-2.5 rounded-xl ring-line-200">
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm leading-snug font-semibold text-ink-950">
            {title}
          </h3>
          <StatusBadge tone={tone}>{status}</StatusBadge>
        </div>
      </CardHeader>
      <CardContent className="flex items-center gap-1.5 text-xs text-ink-500">
        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="truncate">{location}</span>
        <span aria-hidden>·</span>
        <span className="shrink-0 font-mono text-[11px]" data-tabular>
          {when}
        </span>
      </CardContent>
    </Card>
  );
}
