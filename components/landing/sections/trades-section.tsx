import { cn } from "@/lib/utils";
import { Reveal, RevealItem } from "../reveal";
import { H2, LEAD, WRAP } from "../styles";
import { TradeDeck } from "../trade-deck";

/** The six launch trades as a scroll-driven card deck. */
export function TradesSection() {
  return (
    <section id="trades" aria-labelledby="trades-title" className={cn(WRAP, "scroll-mt-4 py-16 md:py-24")}>
      <Reveal className="mb-8 lg:mb-0">
        <RevealItem>
          <h2 id="trades-title" className={H2}>
            What can we fix?
          </h2>
        </RevealItem>
        <RevealItem>
          <p className={LEAD}>Six trades to start, every artisan checked before they see a single request.</p>
        </RevealItem>
      </Reveal>
      <TradeDeck />
    </section>
  );
}
