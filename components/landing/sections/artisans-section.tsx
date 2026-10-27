import { LiquidLink } from "@/components/ui/liquid-link";
import { cn } from "@/lib/utils";
import { ARTISAN_PERKS } from "../content";
import { TornEdge } from "../edges";
import { Reveal, RevealItem } from "../reveal";
import { WRAP } from "../styles";

/** The artisan pitch on palm green: escrow before you set out, paid on the code. */
export function ArtisansSection() {
  return (
    <>
      <TornEdge className="fill-scene-palm" />
      <section id="artisans" aria-labelledby="artisan-title" className="scroll-mt-24 bg-scene-palm text-surface-raised">
        <div className={cn(WRAP, "grid gap-10 py-16 md:py-24 lg:grid-cols-2 lg:gap-16")}>
          <Reveal>
            <RevealItem>
              <h2
                id="artisan-title"
                className="text-[38px] leading-[1.02] font-bold tracking-tighter text-balance md:text-[60px]"
              >
                For artisans: no more chasing.
              </h2>
            </RevealItem>
            <RevealItem>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-scene-cloud">
                You see the money is in escrow before you set out. You finish, they read you the code, and
                it&apos;s yours. No &ldquo;come back next week for the balance&rdquo;.
              </p>
            </RevealItem>
            <RevealItem className="mt-8">
              <LiquidLink href="/signup?as=artisan">
                Earn with ajudar
              </LiquidLink>
            </RevealItem>
          </Reveal>
          <Reveal className="flex flex-col gap-3 self-end">
            {ARTISAN_PERKS.map((perk) => (
              <RevealItem
                key={perk.title}
                className="rounded-2xl border-2 border-ink-950 bg-surface-raised p-5 text-ink-950"
              >
                <p className="text-lg font-semibold">{perk.title}</p>
                <p className="mt-1 text-base leading-relaxed text-ink-500">{perk.detail}</p>
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </section>
      <TornEdge className="fill-scene-palm" flip />
    </>
  );
}
