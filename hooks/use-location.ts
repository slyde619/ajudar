"use client";

import { useEffect, useState } from "react";
import { useLocationStore } from "@/stores/location";

function hasHydrated(): boolean {
  return useLocationStore.persist?.hasHydrated() ?? false;
}

/** Reads the location store after rehydrating it on mount. */
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
