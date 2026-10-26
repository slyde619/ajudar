"use client";

import { useEffect } from "react";
import { reportLocationAction } from "@/app/_actions/supply";

const MIN_INTERVAL_MS = 10_000;

/** Sends the artisan's position while the screen is open and visible. */
export function useForegroundLocation(enabled: boolean): void {
  useEffect(() => {
    if (!enabled || !("geolocation" in navigator)) return;
    let watch: number | null = null;
    let lastSentAt = 0;

    const start = () => {
      if (watch !== null) return;
      watch = navigator.geolocation.watchPosition(
        (position) => {
          const now = Date.now();
          if (now - lastSentAt < MIN_INTERVAL_MS) return;
          lastSentAt = now;
          void reportLocationAction(
            { lat: position.coords.latitude, lng: position.coords.longitude },
            Math.round(position.coords.accuracy),
          );
        },
        () => undefined,
        { enableHighAccuracy: true, maximumAge: 5000 },
      );
    };
    const stop = () => {
      if (watch !== null) navigator.geolocation.clearWatch(watch);
      watch = null;
    };
    const onVisibility = () => (document.visibilityState === "visible" ? start() : stop());

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled]);
}
