"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface StickyHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  action?: React.ReactNode;
}

/** Hides on scroll down, reveals on scroll up (200ms, §9.3). */
export function StickyHeader({
  title,
  subtitle,
  back = false,
  action,
}: StickyHeaderProps) {
  const router = useRouter();
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (Math.abs(delta) < 8) return;
      setHidden(delta > 0 && y > 24);
      lastY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-20 border-b border-line-200 bg-background/85 pt-safe backdrop-blur-xl transition-transform duration-200 ease-out-quint ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3 lg:px-8">
        {back ? (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="-ml-1 flex h-10 w-10 items-center justify-center rounded-full text-ink-700 hover:bg-surface-sunken"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
        ) : null}

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[17px] font-semibold tracking-tight text-ink-950">
            {title}
          </h1>
          {subtitle ? (
            <p className="truncate text-xs text-ink-500">{subtitle}</p>
          ) : null}
        </div>

        {action}
      </div>
    </header>
  );
}
