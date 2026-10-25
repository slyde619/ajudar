import type { Coordinates, GeoPolygon, LgaBoundary } from "@/lib/types";

/**
 * Pure geometry. LGA point-in-polygon is the hard eligibility gate (§10.1):
 * eligibility removes supply, ranking sorts what remains.
 */

type Ring = number[][];

/** Ray casting on a single [lng, lat] ring. */
function insideRing(lng: number, lat: number, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const crosses =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
}

/** First ring is the outer boundary; any further rings are holes. */
export function pointInPolygon(point: Coordinates, polygon: GeoPolygon): boolean {
  const [outer, ...holes] = polygon.coordinates;
  if (!outer || !insideRing(point.lng, point.lat, outer)) return false;
  return !holes.some((hole) => insideRing(point.lng, point.lat, hole));
}

export function findLgaForPoint(
  point: Coordinates,
  boundaries: readonly LgaBoundary[],
): LgaBoundary | undefined {
  return boundaries.find((boundary) =>
    boundary.polygons.some((polygon) => pointInPolygon(point, polygon)),
  );
}

const EARTH_RADIUS_M = 6_371_000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Great-circle distance in metres. Ranking only, never eligibility. */
export function haversineM(a: Coordinates, b: Coordinates): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export function formatDistance(metres: number): string {
  if (metres < 1000) return `${Math.round(metres / 10) * 10} m`;
  return `${(metres / 1000).toFixed(metres < 10_000 ? 1 : 0)} km`;
}

type LngLat = [number, number];

function lngLatDistance(a: LngLat, b: LngLat): number {
  return haversineM({ lng: a[0], lat: a[1] }, { lng: b[0], lat: b[1] });
}

export function pathLengthM(path: readonly LngLat[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i++) total += lngLatDistance(path[i - 1], path[i]);
  return total;
}

/**
 * Splits a path at `fraction` (0–1) of its length. Returns the point there and
 * the remaining leg, so tracking can draw only the road still ahead.
 */
export function splitPath(
  path: readonly LngLat[],
  fraction: number,
): { point: LngLat; remaining: LngLat[] } {
  if (path.length === 0) throw new RangeError("Path must have at least one point.");
  const clamped = Math.min(Math.max(fraction, 0), 1);
  const target = pathLengthM(path) * clamped;

  let travelled = 0;
  for (let i = 1; i < path.length; i++) {
    const segment = lngLatDistance(path[i - 1], path[i]);
    if (travelled + segment >= target) {
      const t = segment === 0 ? 0 : (target - travelled) / segment;
      const [x0, y0] = path[i - 1];
      const [x1, y1] = path[i];
      const point: LngLat = [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t];
      return { point, remaining: [point, ...path.slice(i)] };
    }
    travelled += segment;
  }

  const last = path[path.length - 1];
  return { point: last, remaining: [last] };
}

/** [[west, south], [east, north]] around a set of points. */
export function boundsOf(points: readonly LngLat[]): [LngLat, LngLat] {
  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;
  for (const [lng, lat] of points) {
    west = Math.min(west, lng);
    south = Math.min(south, lat);
    east = Math.max(east, lng);
    north = Math.max(north, lat);
  }
  return [
    [west, south],
    [east, north],
  ];
}
