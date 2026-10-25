import type { JobTracking, RoutePath } from "@/lib/types";
import { pathLengthM, splitPath } from "@/lib/utils/geo";

/**
 * Simulated travel leg for mock mode. The trip clock starts the first time a
 * job is polled in this browser session, so the demo always shows movement.
 * Real tracking comes from PATCH /artisan/location (§10.6).
 */

const ROUTES: Record<string, { artisanId: string; path: [number, number][] }> = {
  job_001: {
    artisanId: "art_chinedu_okafor",
    // Ogba → Opebi, road-snapped once via OSRM (5.8 km) and frozen here.
    path: [
      [3.33982, 6.62681], [3.33953, 6.62747], [3.34973, 6.63179],
      [3.35391, 6.63093], [3.35447, 6.62738], [3.35254, 6.62397],
      [3.35241, 6.62318], [3.35333, 6.617], [3.35518, 6.61383],
      [3.35239, 6.60956], [3.34907, 6.60716], [3.35162, 6.60235],
      [3.35094, 6.60194], [3.35065, 6.60248], [3.34911, 6.60191],
      [3.3491, 6.6018],
    ],
  },
};

/** Demo-compressed trip length. */
const TRIP_SECONDS = 4 * 60;

const tripStartedAt = new Map<string, number>();

export function getMockJobTracking(jobId: string, nowMs: number): JobTracking | undefined {
  const route = ROUTES[jobId];
  if (!route) return undefined;

  if (!tripStartedAt.has(jobId)) tripStartedAt.set(jobId, nowMs);
  const elapsed = (nowMs - (tripStartedAt.get(jobId) ?? nowMs)) / 1000;
  const fraction = Math.min(elapsed / TRIP_SECONDS, 1);

  const { point, remaining } = splitPath(route.path, fraction);
  const remainingSeconds = Math.round(TRIP_SECONDS * (1 - fraction));
  const path: RoutePath = {
    coordinates: remaining,
    distanceM: Math.round(pathLengthM(remaining)),
    durationSeconds: remainingSeconds,
  };
  const now = new Date(nowMs).toISOString();

  return {
    jobId,
    artisanLocation: {
      artisanId: route.artisanId,
      coords: { lng: point[0], lat: point[1] },
      accuracyM: 15,
      updatedAt: now,
      source: "foreground",
    },
    route: path,
    etaAt: new Date(nowMs + remainingSeconds * 1000).toISOString(),
  };
}
