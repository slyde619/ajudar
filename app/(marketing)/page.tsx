import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";

/**
 * Structural placeholder only. The three-act landing narrative, hairline
 * scene, and trust/supply sections belong to Phase 6 per §16.
 */
export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col px-6 pt-safe pb-safe">
      <header className="flex items-center justify-between py-5">
        <BrandMark />
        <span className="font-mono text-[10px] tracking-widest text-ink-400 uppercase">
          Lagos · Abia
        </span>
      </header>

      <section className="flex flex-1 flex-col justify-center py-16">
        <p className="font-mono text-[11px] tracking-[0.2em] text-ink-500 uppercase">
          Verified supply, agreed price
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-ink-950 sm:text-6xl">
          Find an artisan who actually shows up.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-700">
          Bolt for artisans, but the price is agreed and held in escrow before
          anyone moves.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild size="lg" className="h-12 px-6">
            <Link href="/signup">
              Find an artisan
              <ArrowRight aria-hidden />
            </Link>
          </Button>
          <p className="font-mono text-[10px] tracking-widest text-ink-400 uppercase">
            Artisan onboarding opens in Phase 5
          </p>
        </div>
      </section>

      <footer className="border-t border-line-200 py-5 font-mono text-[10px] tracking-widest text-ink-400 uppercase">
        Foundation build · landing narrative ships in Phase 6
      </footer>
    </main>
  );
}
