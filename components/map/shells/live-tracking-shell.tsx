"use client";

import { ChevronLeft, LocateFixed } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { MapFrame, MapMarker } from "@/components/map/map-canvas";
import { CustomerTrackingSheet } from "@/components/map/overlays/customer-tracking-sheet";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { useJobTracking } from "@/hooks/use-job-tracking";
import { DESKTOP_QUERY, useMediaQuery } from "@/hooks/use-media-query";
import { useViewportHeight } from "@/hooks/use-viewport-height";
import type { ArtisanProfile, JobRequest } from "@/lib/types";
import { cn } from "@/lib/utils";
import { boundsOf } from "@/lib/utils/geo";
import { initialsOf } from "@/lib/utils/verification";

const MapCanvas = dynamic(() => import("@/components/map/map-canvas"), {
  ssr: false,
  loading: () => <div className="size-full bg-ink-950" />,
});

/** §8.2 snap points: peek 15% / half 50% / full 90%. */
const SNAP_POINTS = [0.15, 0.5, 0.9] as const;
type SnapPoint = (typeof SNAP_POINTS)[number];

/** Matches w-90 / left-90 (360px, §8.2). */
const SIDEBAR_WIDTH = 360;

interface LiveTrackingShellProps {
  /** Artisan overlay (route + "Arrived" bar) arrives in Phase 5. */
  role: "customer";
  job: JobRequest;
  artisan: ArtisanProfile;
  lgaName: string;
}

/**
 * Travel mode (§13.1): full-bleed map at z-0, sheet at z-20. On desktop the
 * sheet becomes a 360px left sidebar — same tree, different layout (§8.2).
 */
export function LiveTrackingShell({ job, artisan, lgaName }: LiveTrackingShellProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const viewportHeight = useViewportHeight();
  const { tracking, now } = useJobTracking(job.id);
  const [snap, setSnap] = useState<SnapPoint>(0.5);
  const [recenterCount, setRecenterCount] = useState(0);

  const artisanPosition = tracking?.artisanLocation.coords;

  const markers = useMemo<MapMarker[]>(() => {
    const site: MapMarker = {
      id: "site",
      kind: "site",
      position: { lat: job.site.lat, lng: job.site.lng },
      label: `Job site: ${job.site.landmark}`,
    };
    if (!artisanPosition) return [site];
    return [
      site,
      {
        id: artisan.id,
        kind: "artisan",
        position: artisanPosition,
        label: `${artisan.displayName}, live position`,
        initials: initialsOf(artisan.displayName),
      },
    ];
  }, [job.site, artisan, artisanPosition]);

  // Frame once tracking exists, again on layout change or a recenter tap.
  const sheetPx = isDesktop ? 0 : Math.round(viewportHeight * Math.min(snap, 0.5));
  const frame: MapFrame | undefined = artisanPosition
    ? {
        key: `${recenterCount}:${isDesktop ? "d" : "m"}:${snap === 0.15 ? "peek" : "half"}`,
        bounds: boundsOf([
          [artisanPosition.lng, artisanPosition.lat],
          [job.site.lng, job.site.lat],
        ]),
        padding: isDesktop
          ? { top: 96, right: 80, bottom: 80, left: SIDEBAR_WIDTH + 80 }
          : { top: 112, right: 56, bottom: sheetPx + 40, left: 56 },
      }
    : undefined;

  const sheet = (
    <CustomerTrackingSheet
      job={job}
      artisan={artisan}
      lgaName={lgaName}
      tracking={tracking}
      now={now}
    />
  );

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-ink-950">
      {/* z-0 — map canvas */}
      <div className="fixed inset-0 z-0">
        <MapCanvas
          center={{ lat: job.site.lat, lng: job.site.lng }}
          zoom={14}
          frame={frame}
          markers={markers}
          route={tracking?.route.coordinates}
          interactive={snap !== 0.9}
        />
      </div>

      {/* z-10 — map chrome */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-safe lg:left-90"
      >
        <Link
          href="/jobs"
          aria-label="Back to jobs"
          className="pointer-events-auto mt-3 flex size-11 items-center justify-center rounded-full bg-surface-raised text-ink-950 shadow-pop transition-transform duration-150 active:scale-95 lg:hidden"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </Link>
        <button
          type="button"
          onClick={() => setRecenterCount((count) => count + 1)}
          aria-label="Recenter map"
          className="pointer-events-auto mt-3 ml-auto flex size-11 items-center justify-center rounded-full bg-surface-raised text-ink-950 shadow-pop transition-transform duration-150 active:scale-95"
        >
          <LocateFixed className="size-5" aria-hidden />
        </button>
      </div>

      {isDesktop ? (
        <aside
          className="fixed inset-y-0 left-0 z-20 flex w-90 flex-col overflow-y-auto border-r border-line-200 bg-surface-raised pt-safe shadow-sheet"
        >
          <div className="flex items-center gap-2 px-3 pt-4">
            <Link
              href="/jobs"
              className="flex h-9 items-center gap-1 rounded-md px-2 text-sm text-ink-500 hover:bg-surface-sunken hover:text-ink-950"
            >
              <ChevronLeft className="size-4" aria-hidden />
              Jobs
            </Link>
          </div>
          {sheet}
        </aside>
      ) : (
        <Drawer
          open
          modal={false}
          dismissible={false}
          noBodyStyles
          snapPoints={[...SNAP_POINTS]}
          activeSnapPoint={snap}
          setActiveSnapPoint={(next) => {
            if (typeof next === "number") setSnap(next as SnapPoint);
          }}
        >
          <DrawerContent
            overlay={false}
            aria-describedby={undefined}
            className="z-20 h-full max-h-[96dvh] rounded-t-2xl border-0 bg-surface-raised shadow-sheet outline-none data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:max-h-[96dvh]"
          >
            <DrawerTitle className="sr-only">Live job tracking</DrawerTitle>
            <div className={cn("no-scrollbar flex-1", snap === 0.9 ? "overflow-y-auto" : "overflow-hidden")}>
              {sheet}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
