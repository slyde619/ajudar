import type { Coordinates, JobTracking, RoutePath } from "@/lib/types";
import { pathLengthM, splitPath } from "@/lib/utils/geo";
import type { MockTrip } from "./store";

type LngLat = [number, number];

export const SEED_TRIP_PATHS: Record<string, { artisanId: string; path: LngLat[] }> = {
  job_001: {
    artisanId: "art_kunle_adebayo",
    path: [
      [6.98795, 4.86743], [6.98781, 4.86791], [6.98537, 4.8679],
      [6.98557, 4.86863], [6.9976, 4.86699], [6.99596, 4.8647],
      [6.99389, 4.86069], [6.99315, 4.8567], [6.99029, 4.84695],
      [6.99146, 4.84637], [6.99325, 4.84459], [6.99742, 4.84303],
      [6.99805, 4.84206], [6.99999, 4.84198], [6.99993, 4.84163],
      [7.00234, 4.84231], [7.00295, 4.84102], [7.00434, 4.84144],
      [7.00546, 4.84064], [7.00598, 4.84136], [7.00664, 4.84125],
      [7.00674, 4.84155], [7.00635, 4.84164],
    ],
  },
};

export function synthesizePath(from: Coordinates, to: Coordinates, steps = 4): LngLat[] {
  const path: LngLat[] = [[from.lng, from.lat]];
  let lat = from.lat;
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const lng = from.lng + (to.lng - from.lng) * t;
    path.push([lng, lat]);
    lat = from.lat + (to.lat - from.lat) * t;
    path.push([lng, lat]);
  }
  return path;
}

export function tripSeconds(path: readonly LngLat[]): number {
  return Math.min(240, Math.max(90, Math.round((pathLengthM(path) / 1000) * 45)));
}

export function tripFraction(trip: MockTrip, nowMs: number): number {
  const elapsed = (nowMs - trip.startsAtMs) / 1000;
  return Math.min(Math.max(elapsed / tripSeconds(trip.path), 0), 1);
}

export function trackingSnapshot(jobId: string, trip: MockTrip, nowMs: number): JobTracking {
  const total = tripSeconds(trip.path);
  const fraction = tripFraction(trip, nowMs);
  const { point, remaining } = splitPath(trip.path, fraction);
  const remainingSeconds = Math.round(total * (1 - fraction));
  const route: RoutePath = {
    coordinates: remaining,
    distanceM: Math.round(pathLengthM(remaining)),
    durationSeconds: remainingSeconds,
  };
  const now = new Date(nowMs).toISOString();

  return {
    jobId,
    artisanLocation: {
      artisanId: trip.artisanId,
      coords: { lng: point[0], lat: point[1] },
      accuracyM: 15,
      updatedAt: now,
      source: "foreground",
    },
    route,
    etaAt: new Date(nowMs + remainingSeconds * 1000).toISOString(),
  };
}
