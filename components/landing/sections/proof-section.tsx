import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TornEdge } from "../edges";
import { ProofFeed } from "../proof-feed";
import { Reveal, RevealItem } from "../reveal";
import { WRAP } from "../styles";

/** Dark band with the live-looking job feed: every step lands on the customer's phone. */
export function ProofSection() {
  return (
    <>
      <TornEdge className="fill-ink-950" />
      <section aria-labelledby="feed-title" className="bg-ink-950">
        <div className={cn(WRAP, "grid items-center gap-10 py-16 md:py-24 lg:grid-cols-2 lg:gap-16")}>
          <Reveal>
            <RevealItem>
              <Badge className="h-auto bg-celo-500 px-2.5 py-1 font-mono text-[12px] tracking-wide text-ink-950 uppercase">
                Example
              </Badge>
            </RevealItem>
            <RevealItem>
              <h2
                id="feed-title"
                className="mt-4 text-[38px] leading-[1.02] font-bold tracking-tighter text-balance text-surface-raised md:text-[60px]"
              >
                Every step, on your phone.
              </h2>
            </RevealItem>
            <RevealItem>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-line-200">
                Who accepted, the price you agreed, where they are, the face at your gate, the code, and the
                money moving. No calling to ask &ldquo;where are you?&rdquo;.
              </p>
            </RevealItem>
          </Reveal>
          <ProofFeed className="mx-auto w-full max-w-md" />
        </div>
      </section>
      <TornEdge className="fill-ink-950" flip />
    </>
  );
}
