import type { IsoDateTime, JobTiming } from "@/lib/types";

const LAGOS_TZ = "Africa/Lagos";

const clockFormatter = new Intl.DateTimeFormat("en-NG", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: LAGOS_TZ,
});

const dateFormatter = new Intl.DateTimeFormat("en-NG", {
  day: "numeric",
  month: "short",
  timeZone: LAGOS_TZ,
});

export function formatShortDate(iso: IsoDateTime): string {
  return dateFormatter.format(new Date(iso));
}

const dayFormatter = new Intl.DateTimeFormat("en-NG", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: LAGOS_TZ,
});

export function formatDay(iso: IsoDateTime): string {
  return dayFormatter.format(new Date(iso)).replace(",", "");
}

export function formatTiming(timing: JobTiming): string {
  if (timing.mode === "now") return "Now";
  const end = new Date(Date.parse(timing.scheduledFor) + timing.windowMinutes * 60_000).toISOString();
  return `${formatDay(timing.scheduledFor)}, ${formatClock(timing.scheduledFor)}–${formatClock(end)}`;
}

export function formatClock(iso: IsoDateTime): string {
  return clockFormatter
    .format(new Date(iso))
    .replace(/\s/g, "")
    .toLowerCase();
}

export function minutesBetween(from: IsoDateTime, to: IsoDateTime): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / 60_000);
}

export function formatAgo(iso: IsoDateTime, now: IsoDateTime): string {
  const seconds = Math.max(0, Math.round((Date.parse(now) - Date.parse(iso)) / 1000));
  if (seconds < 20) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return `${hours} hr ago`;
}

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.max(1, Math.round(totalSeconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

const STALE_AFTER_MS = 30 * 60_000;

export function isStale(resolvedAt: IsoDateTime, now: IsoDateTime): boolean {
  return Date.parse(now) - Date.parse(resolvedAt) > STALE_AFTER_MS;
}
