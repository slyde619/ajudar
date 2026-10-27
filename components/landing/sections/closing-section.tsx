import { LiquidLink } from "@/components/ui/liquid-link";
import { cn } from "@/lib/utils";
import { CloudEdge } from "../edges";
import { Reveal, RevealItem } from "../reveal";
import { ArrivalScene } from "../scenes/arrival-scene";
import { H2, LEAD, WRAP } from "../styles";

/** Last call to action over the arrival scene, for customers and artisans. */
export function ClosingSection() {
  return (
    <section aria-labelledby="close-title" className="relative bg-scene-sky">
      <CloudEdge className="fill-surface-warm" flip />
      <div className={cn(WRAP, "grid items-end gap-8 pt-10 lg:grid-cols-[1fr_1.1fr]")}>
        <Reveal className="pb-6 lg:pb-20">
          <RevealItem>
            <h2 id="close-title" className={H2}>
              Get your Saturday back.
            </h2>
          </RevealItem>
          <RevealItem>
            <p className={LEAD}>He actually comes. The gate opens. The tap stops.</p>
          </RevealItem>
          <RevealItem className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
            <LiquidLink href="/signup?as=customer">
              Find an artisan
            </LiquidLink>
            <LiquidLink tone="light" href="/signup?as=artisan">
              Earn with ajudar
            </LiquidLink>
          </RevealItem>
        </Reveal>
        <ArrivalScene className="w-full max-md:-mx-4 max-md:w-[calc(100%+2rem)] max-md:max-w-none" />
      </div>
    </section>
  );
}
