import { MapPinIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { LiquidFace } from "@/components/ui/liquid-link";
import { cn } from "@/lib/utils";
import { CloudEdge } from "../edges";
import { HeroGreeting } from "../hero-greeting";
import { HeroScene } from "../scenes/hero-scene";
import { WRAP } from "../styles";
import { LandingHeader } from "./landing-header";

const HERO_SCENE = cn(
  "pointer-events-none mt-auto h-[44svh] max-h-100 min-h-80 w-full shrink-0",
  "md:h-(--scene-h) md:max-h-none md:min-h-0 md:mt-[calc(12px-0.367*var(--scene-h))]",
  "md:[--scene-h:min(41.667vw,max(260px,calc((100svh-482px)/0.633)))]",
  "short:[--scene-h:min(41.667vw,max(260px,calc((100svh-412px)/0.633)))]",
);

function Cloud({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 140" className={className} aria-hidden>
      <path
        d="M24 140 C-6 140 -6 96 28 92 C24 56 70 44 92 66 C104 22 168 10 192 52 C214 30 262 38 262 78 C300 72 330 112 300 140 Z"
        className="fill-scene-cloud"
      />
    </svg>
  );
}

/** Full-height opening: the rotating greeting, the find-an-artisan bar and the street scene. */
export function Hero() {
  return (
    <div className="relative overflow-clip bg-surface-raised">
      <div className="relative flex min-h-svh animate-stage-rise flex-col bg-scene-sky">
        <Cloud className="pointer-events-none absolute -top-6 -left-16 w-64 animate-drift md:w-96" />
        <Cloud className="pointer-events-none absolute top-20 -right-20 w-56 animate-drift [animation-delay:-14s] md:w-88" />

        <section className="relative flex flex-1 flex-col md:justify-between">
          <div className={cn(WRAP, "relative pt-28 md:pt-32 short:pt-24")}>
            <div className="animate-settle-in [animation-delay:650ms]">
              <HeroGreeting />
            </div>
            <div className="mx-auto mt-7 w-full max-w-xl animate-settle-in short:mt-5 [animation-delay:720ms]">
              <Link
                href="/signup?as=customer"
                className="group/liquid flex w-full items-center gap-3 rounded-pill bg-surface-raised p-2 pl-5 shadow-pop transition-transform duration-100 ease-out active:scale-[0.98]"
              >
                <MapPinIcon className="size-5 shrink-0 text-ink-950" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-left text-base text-ink-500">
                  Rivers &amp; Akwa Ibom
                </span>
                <LiquidFace className="group-hover/liquid:-translate-x-3 group-focus-visible/liquid:-translate-x-3">
                  Find an artisan
                </LiquidFace>
              </Link>
            </div>
            <p className="mx-auto mt-5 max-w-md animate-settle-in text-center text-lg leading-relaxed text-ink-950 short:mt-4 short:text-base [animation-delay:790ms]">
              Verified plumbers, electricians and more. The price is agreed and held in escrow before
              anyone moves.
            </p>
            <p className="mt-2 animate-settle-in text-center [animation-delay:860ms]">
              <Link
                href="/signup?as=artisan"
                className="text-base font-semibold text-ink-950 underline underline-offset-4"
              >
                Are you an artisan? Earn with ajudar
              </Link>
            </p>
          </div>
          <HeroScene className={HERO_SCENE} />
        </section>
        <CloudEdge className="absolute inset-x-0 -bottom-px fill-surface-warm" />
      </div>

      <LandingHeader />
    </div>
  );
}
