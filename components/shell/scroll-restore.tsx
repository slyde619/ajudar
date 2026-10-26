"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useNavStore } from "@/stores/nav";

/** Saves and restores scroll position per pathname. */
export function ScrollRestore() {
  const pathname = usePathname();

  useEffect(() => {
    const saved =
      useNavStore.getState().scrollPositions.get(pathname) ?? 0;
    window.scrollTo({ top: saved, left: 0, behavior: "instant" });
  }, [pathname]);

  useEffect(() => {
    let frame = 0;

    const save = () => {
      useNavStore.getState().rememberScroll(pathname, window.scrollY);
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(save);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      save();
    };
  }, [pathname]);

  return null;
}
