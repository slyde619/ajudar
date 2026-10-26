"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { JobSite, LocationState } from "@/lib/types";
import { isStale } from "@/lib/utils/time";

interface LocationStore {
  location: LocationState;
  request: () => void;
  resolve: () => void;
  confirm: (site: JobSite) => void;
  setManual: (site: JobSite) => void;
  deny: () => void;
  markUnavailable: () => void;
  reset: () => void;
}

const PERSISTED = new Set<LocationState["status"]>(["confirmed", "manual", "stale"]);

export const useLocationStore = create<LocationStore>()(
  persist(
    (set) => ({
      location: { status: "unknown" },
      request: () => set({ location: { status: "requesting" } }),
      resolve: () => set({ location: { status: "resolving" } }),
      confirm: (site) =>
        set({
          location: {
            status: "confirmed",
            site,
            resolvedAt: new Date().toISOString(),
          },
        }),
      setManual: (site) => set({ location: { status: "manual", site } }),
      deny: () => set({ location: { status: "denied" } }),
      markUnavailable: () => set({ location: { status: "unavailable" } }),
      reset: () => set({ location: { status: "unknown" } }),
    }),
    {
      name: "ajudar.location",
      version: 1,
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        location: PERSISTED.has(state.location.status)
          ? state.location
          : ({ status: "unknown" } as LocationState),
      }),
      onRehydrateStorage: () => (state) => {
        const location = state?.location;
        if (
          location?.status === "confirmed" &&
          isStale(location.resolvedAt, new Date().toISOString())
        ) {
          useLocationStore.setState({
            location: { status: "stale", site: location.site, resolvedAt: location.resolvedAt },
          });
        }
      },
    },
  ),
);

export function matchableSite(location: LocationState): JobSite | null {
  return location.status === "confirmed" || location.status === "manual"
    ? location.site
    : null;
}
