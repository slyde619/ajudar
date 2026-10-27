import { BrandMark } from "@/components/brand/brand-mark";
import { LiquidLink } from "@/components/ui/liquid-link";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "../content";
import { WRAP } from "../styles";

/** Floating brand, section nav and sign-up pills over the hero. */
export function LandingHeader() {
  return (
    <header className="absolute inset-x-0 top-0">
      <div className={cn(WRAP, "flex items-center justify-between gap-3 pt-safe")}>
        <div className="mt-4 animate-drop-in rounded-pill bg-surface-raised py-1.5 pr-4 pl-1.5 shadow-card [animation-delay:950ms]">
          <BrandMark />
        </div>
        <nav
          aria-label="Sections"
          className="mt-4 hidden animate-drop-in items-center rounded-pill bg-surface-raised p-1.5 shadow-card [animation-delay:1010ms] lg:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-pill px-4 py-2 text-[15px] font-medium text-ink-950 hover:bg-surface-sunken"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="mt-4 animate-drop-in [animation-delay:1070ms]">
          <LiquidLink tone="light" href="/signup">
            Sign up
          </LiquidLink>
        </div>
      </div>
    </header>
  );
}
