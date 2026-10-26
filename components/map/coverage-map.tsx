"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { MapBoundary, MapFrame, MapMarker } from "@/components/map/map-canvas";
import { useLgaBoundaries } from "@/hooks/use-lga-boundaries";
import { DESKTOP_QUERY, useMediaQuery } from "@/hooks/use-media-query";
import { useViewportHeight } from "@/hooks/use-viewport-height";
import type { Coordinates, LgaCode } from "@/lib/types";
import { boundsOf } from "@/lib/utils/geo";

const MapCanvas = dynamic(() => import("@/components/map/map-canvas"), {
  ssr: false,
  loading: () => <div className="size-full bg-ink-950" />,
});

interface CoverageMapProps {
  lgaCodes: LgaCode[];
  base: Coordinates;
  initials: string;
  coveredFraction: number;
}

/** Artisan home map showing the LGAs they serve and their base. */
export function CoverageMap({ lgaCodes, base, initials, coveredFraction }: CoverageMapProps) {
  const boundaries = useLgaBoundaries();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const viewportHeight = useViewportHeight();

  const served = useMemo(
    () => (boundaries.status === "ready" ? boundaries.boundaries.filter((entry) => lgaCodes.includes(entry.lgaCode)) : []),
    [boundaries, lgaCodes],
  );
  const boundary: MapBoundary | null = served.length > 0 ? { polygons: served.flatMap((entry) => entry.polygons), tone: "inside" } : null;

  const markers = useMemo<MapMarker[]>(
    () => [{ id: "base", kind: "artisan", position: base, label: "Your base", initials }],
    [base, initials],
  );

  const frame: MapFrame | undefined =
    served.length > 0
      ? {
          key: `${lgaCodes.join(",")}:${isDesktop ? "d" : "m"}`,
          bounds: boundsOf(
            served.flatMap((entry) =>
              entry.polygons.flatMap((polygon) => polygon.coordinates.flat() as [number, number][]),
            ),
          ),
          padding: isDesktop
            ? { top: 80, right: 80, bottom: 80, left: 80 + 512 }
            : { top: 120, right: 32, bottom: Math.round(viewportHeight * coveredFraction) + 24, left: 32 },
        }
      : undefined;

  return (
    <MapCanvas
      center={base}
      zoom={11}
      frame={frame}
      markers={markers}
      boundary={boundary}
      interactive={false}
    />
  );
}
