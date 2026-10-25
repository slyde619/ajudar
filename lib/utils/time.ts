import type { IsoDateTime } from "@/lib/types";

/**
 * Pure time formatting. Callers pass `now` explicitly so components stay
 * pure (§20.2) — nothing here reads the clock.
 */

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

/** "25 Oct" */
export function formatShortDate(iso: IsoDateTime): string {
  return dateFormatter.format(new Date(iso));
}

/** "2:14pm" */
export function formatClock(iso: IsoDateTime): string {
  return clockFormatter
    .format(new Date(iso))
    .replace(/\s/g, "")
    .toLowerCase();
}

export function minutesBetween(from: IsoDateTime, to: IsoDateTime): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / 60_000);
}

/** "just now" · "2 min ago" · "1 hr ago" — honest freshness, §10.6. */
export function formatAgo(iso: IsoDateTime, now: IsoDateTime): string {
  const seconds = Math.max(0, Math.round((Date.parse(now) - Date.parse(iso)) / 1000));
  if (seconds < 20) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return `${hours} hr ago`;
}

/** "8 min" · "1 hr 5 min" */
export function formatDuration(totalSeconds: number): string {
  const minutes = Math.max(1, Math.round(totalSeconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

const STALE_AFTER_MS = 30 * 60_000;

/** Location older than 30 min is `stale` (§10.5). */
export function isStale(resolvedAt: IsoDateTime, now: IsoDateTime): boolean {
  return Date.parse(now) - Date.parse(resolvedAt) > STALE_AFTER_MS;
}
