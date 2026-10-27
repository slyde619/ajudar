import { BrandMark } from "@/components/brand/brand-mark";
import { LiquidLink } from "@/components/ui/liquid-link";
import { cn } from "@/lib/utils";
import { SiteMenu } from "../site-menu";
import { WRAP } from "../styles";

/** Fixed brand, menu and sign-up pills that stay put while the page scrolls. */
export function LandingHeader() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 pt-safe">
      <div className={cn(WRAP, "relative mt-4 flex items-center justify-between gap-3")}>
        <div className="pointer-events-auto animate-drop-in rounded-pill bg-surface-raised py-1.5 pr-4 pl-1.5 shadow-card [animation-delay:950ms]">
          <BrandMark />
        </div>
        <div className="pointer-events-auto md:absolute md:top-1/2 md:left-1/2 md:-translate-1/2">
          <div className="animate-drop-in [animation-delay:1010ms]">
            <SiteMenu />
          </div>
        </div>
        <div className="pointer-events-auto hidden animate-drop-in [animation-delay:1070ms] md:block">
          <LiquidLink tone="celo" href="/signup">
            Sign up
          </LiquidLink>
        </div>
      </div>
    </header>
  );
}
