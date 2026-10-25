"use client";

import { useEffect, useState } from "react";
import { useLocationStore } from "@/stores/location";

/** persist is absent during SSR (no storage), present in the browser. */
function hasHydrated(): boolean {
  return useLocationStore.persist?.hasHydrated() ?? false;
}

/**
 * Reads the location store after rehydrating it from storage on mount.
 * `hydrated` is false on the server and the first client paint, so both
 * render the same skeleton; client navigations start hydrated.
 */
export function useLocation() {
  const location = useLocationStore((state) => state.location);
  const [hydrated, setHydrated] = useState(hasHydrated);

  useEffect(() => {
    const persist = useLocationStore.persist;
    if (!persist || persist.hasHydrated()) return;
    const unsubscribe = persist.onFinishHydration(() => setHydrated(true));
    void persist.rehydrate();
    return unsubscribe;
  }, []);

  return { location, hydrated };
}
