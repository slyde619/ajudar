"use client";

import { CaretLeftIcon, CrosshairIcon } from "@phosphor-icons/react/ssr";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { MapFrame, MapMarker } from "@/components/map/map-canvas";
import { ArtisanEtaCard, ArtisanNavigationPanel } from "@/components/map/overlays/artisan-navigation-bar";
import { CustomerTrackingSheet } from "@/components/map/overlays/customer-tracking-sheet";
import { ArrivalAction } from "@/components/supply/arrival-action";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { useForegroundLocation } from "@/hooks/use-foreground-location";
import { useJobTracking } from "@/hooks/use-job-tracking";
import { DESKTOP_QUERY, useMediaQuery } from "@/hooks/use-media-query";
import { useViewportHeight } from "@/hooks/use-viewport-height";
import { isMockMode } from "@/lib/api/client";
import type { ArtisanProfile, JobRequest } from "@/lib/types";
import { cn } from "@/lib/utils";
import { boundsOf } from "@/lib/utils/geo";
import { initialsOf } from "@/lib/utils/verification";

const MapCanvas = dynamic(() => import("@/components/map/map-canvas"), {
  ssr: false,
  loading: () => <div className="size-full bg-ink-950" />,
});

const SNAP_POINTS = [0.15, 0.5, 0.9] as const;
type SnapPoint = (typeof SNAP_POINTS)[number];

const SIDEBAR_WIDTH = 360;

const ARTISAN_TOP_PX = 200;
const ARTISAN_PANEL_PX = 300;

interface LiveTrackingShellProps {
  role: "customer" | "artisan";
  job: JobRequest;
  artisan: ArtisanProfile;
  lgaName: string;
  since: number;
}

/** Travel-mode screen with a full-bleed map and a sheet, or a sidebar on desktop. */
export function LiveTrackingShell({ role, job, artisan, lgaName, since }: LiveTrackingShellProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const viewportHeight = useViewportHeight();
  const { tracking, now } = useJobTracking(job.id, since);
  const isArtisan = role === "artisan";
  const backHref = isArtisan ? "/artisan" : "/jobs";
  useForegroundLocation(isArtisan && !isMockMode());
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
          : isArtisan
            ? { top: ARTISAN_TOP_PX, right: 48, bottom: ARTISAN_PANEL_PX + 24, left: 48 }
            : { top: 112, right: 56, bottom: sheetPx + 40, left: 56 },
      }
    : undefined;

  const sheet = isArtisan ? (
    <ArtisanNavigationPanel
      job={job}
      lgaName={lgaName}
      action={<ArrivalAction jobId={job.id} distanceM={tracking?.route.distanceM ?? null} />}
    />
  ) : (
    <CustomerTrackingSheet
      job={job}
      artisan={artisan}
      lgaName={lgaName}
      tracking={tracking}
      now={now}
    />
  );
  const etaCard = <ArtisanEtaCard tracking={tracking} now={now} landmark={job.site.landmark} />;

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-ink-950">
      <div className="fixed inset-0 z-0">
        <MapCanvas
          center={{ lat: job.site.lat, lng: job.site.lng }}
          zoom={14}
          frame={frame}
          markers={markers}
          route={tracking?.route.coordinates}
          interactive={isArtisan || snap !== 0.9}
        />
      </div>

      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-safe lg:left-90"
      >
        <Link
          href={backHref}
          aria-label={isArtisan ? "Back to requests" : "Back to jobs"}
          className="pointer-events-auto mt-3 flex size-11 items-center justify-center rounded-full bg-surface-raised text-ink-950 shadow-pop transition-transform duration-150 active:scale-95 lg:hidden"
        >
          <CaretLeftIcon className="size-5" aria-hidden />
        </Link>
        <button
          type="button"
          onClick={() => setRecenterCount((count) => count + 1)}
          aria-label="Recenter map"
          className="pointer-events-auto mt-3 ml-auto flex size-11 items-center justify-center rounded-full bg-surface-raised text-ink-950 shadow-pop transition-transform duration-150 active:scale-95"
        >
          <CrosshairIcon className="size-5" aria-hidden />
        </button>
      </div>
      {isArtisan && !isDesktop ? (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-10 px-4 pt-safe">
          <div className="pointer-events-auto mt-17">{etaCard}</div>
        </div>
      ) : null}

      {isDesktop ? (
        <aside
          className="fixed inset-y-0 left-0 z-20 flex w-90 flex-col overflow-y-auto border-r border-line-200 bg-surface-raised pt-safe shadow-sheet"
        >
          <div className="flex items-center gap-2 px-3 pt-4">
            <Link
              href={backHref}
              className="flex h-9 items-center gap-1 rounded-md px-2 text-sm text-ink-500 hover:bg-surface-sunken hover:text-ink-950"
            >
              <CaretLeftIcon className="size-4" aria-hidden />
              {isArtisan ? "Requests" : "Jobs"}
            </Link>
          </div>
          {isArtisan ? <div className="px-5 pt-2">{etaCard}</div> : null}
          {sheet}
        </aside>
      ) : isArtisan ? (
        <section
          aria-label="Navigation"
          className="fixed inset-x-0 bottom-0 z-20 rounded-t-2xl bg-surface-raised shadow-sheet"
        >
          {sheet}
        </section>
      ) : (
        <Drawer
          open
          modal={false}
          disablePointerDismissal
          showSwipeHandle
          snapPoints={[...SNAP_POINTS]}
          snapPoint={snap}
          onSnapPointChange={(next) => {
            if (typeof next === "number") setSnap(next as SnapPoint);
          }}
        >
          <DrawerContent className="rounded-t-2xl border-0 bg-surface-raised shadow-sheet">
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
