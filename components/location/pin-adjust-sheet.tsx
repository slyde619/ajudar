"use client";

import { InfoIcon, XIcon } from "@phosphor-icons/react/ssr";
import dynamic from "next/dynamic";
import { useState } from "react";
import type { MapBoundary } from "@/components/map/map-canvas";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { Coordinates, Lga, LgaBoundary } from "@/lib/types";
import { cn } from "@/lib/utils";
import { findLgaForPoint } from "@/lib/utils/geo";

const MapCanvas = dynamic(() => import("@/components/map/map-canvas"), {
  ssr: false,
  loading: () => <div className="size-full bg-ink-950" />,
});

export interface PinConfirmation {
  coords: Coordinates;
  lga: LgaBoundary;
}

interface PinAdjustSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCenter: Coordinates;
  boundaries: LgaBoundary[] | null;
  lgas: Lga[];
  onConfirm: (confirmation: PinConfirmation) => void;
  onChooseManually: () => void;
}

/** Sheet where the customer moves the map under a fixed pin to confirm their location. */
export function PinAdjustSheet({
  open,
  onOpenChange,
  initialCenter,
  boundaries,
  lgas,
  onConfirm,
  onChooseManually,
}: PinAdjustSheetProps) {
  const [center, setCenter] = useState(initialCenter);
  const [moving, setMoving] = useState(false);

  const lga = boundaries ? findLgaForPoint(center, boundaries) : undefined;
  const outside = boundaries !== null && !lga;
  const stateName = lgas.find((entry) => entry.code === lga?.lgaCode)?.stateName;
  const boundary: MapBoundary | null = lga ? { polygons: lga.polygons, tone: "inside" } : null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
      <DrawerContent className="h-[94dvh] max-h-[94dvh] rounded-t-2xl border-0 bg-surface-raised">
        <div className="relative px-5 pt-3 pb-4">
          <DrawerClose
            aria-label="Close"
            className="absolute top-1 right-3 flex size-11 items-center justify-center rounded-full text-ink-500 hover:bg-surface-sunken hover:text-ink-950"
          >
            <XIcon className="size-5" aria-hidden />
          </DrawerClose>
          <DrawerTitle className="text-lg font-semibold tracking-tight text-ink-950">
            Confirm the exact spot
          </DrawerTitle>
          <DrawerDescription className="mt-0.5 text-sm text-ink-500">
            Move the map until the pin sits on your gate.
          </DrawerDescription>
        </div>

        <div data-base-ui-swipe-ignore="" className="relative mx-3 flex-1 overflow-hidden rounded-2xl">
          <MapCanvas
            center={initialCenter}
            zoom={16}
            boundary={boundary}
            onCenterChange={(next, settled) => {
              setCenter(next);
              setMoving(!settled);
            }}
          />

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
            <div
              className={cn(
                "-mt-12 flex flex-col items-center transition-transform duration-200 ease-out-quint",
                moving && "-translate-y-2",
              )}
            >
              <span className="flex size-10 items-center justify-center rounded-full border-[3px] border-surface-raised bg-celo-500 shadow-pop">
                <span className="size-2.5 rounded-full bg-ink-950" />
              </span>
              <span className="h-4 w-[3px] rounded-b-full bg-surface-raised" />
            </div>
            <span
              className={cn(
                "absolute size-2 rounded-full bg-surface-raised/60 transition-transform duration-200",
                moving ? "scale-150" : "scale-100",
              )}
            />
          </div>

          <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center px-3" aria-live="polite">
            <span
              className={cn(
                "max-w-full truncate rounded-pill px-3.5 py-2 font-mono text-[11px] font-medium shadow-pop",
                outside ? "bg-danger-600 text-surface-raised" : "bg-surface-raised text-ink-950",
              )}
            >
              {boundaries === null
                ? "Loading areas…"
                : lga
                  ? [lga.name, stateName].filter(Boolean).join(", ")
                  : "Outside Rivers & Akwa Ibom"}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 px-5 pt-4 pb-safe">
          {outside ? (
            <p className="flex items-start gap-2 text-sm text-ink-700">
              <InfoIcon className="mt-0.5 size-4 shrink-0 text-danger-600" aria-hidden />
              We&apos;re live in Rivers and Akwa Ibom only. Move the pin inside an area we
              serve, or pick one from the list.
            </p>
          ) : null}
          <Button
            size="lg"
            disabled={!lga || moving}
            onClick={() => lga && onConfirm({ coords: center, lga })}
            className="h-13 rounded-xl text-base font-semibold"
          >
            Confirm this spot
          </Button>
          <Button variant="ghost" onClick={onChooseManually} className="mb-3 h-11 rounded-xl text-ink-500">
            Pick my area from a list
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
