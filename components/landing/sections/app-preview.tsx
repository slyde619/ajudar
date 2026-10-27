import { cn } from "@/lib/utils";
import { EstimatePhone } from "../estimate-phone";
import { Reveal, RevealItem } from "../reveal";
import { H2, LEAD, WRAP } from "../styles";

/** "One app" pitch with the example estimate on a phone. */
export function AppPreview() {
  return (
    <section aria-labelledby="app-title" className={cn(WRAP, "pt-16 pb-10 text-center md:pt-24")}>
      <Reveal>
        <RevealItem>
          <h2 id="app-title" className={cn(H2, "mx-auto max-w-3xl")}>
            One app, from &ldquo;it&apos;s broken&rdquo; to &ldquo;it&apos;s fixed&rdquo;.
          </h2>
        </RevealItem>
        <RevealItem>
          <p className={cn(LEAD, "mx-auto")}>
            Ask, see the price, watch them come, and pay only when you&apos;re happy.
          </p>
        </RevealItem>
      </Reveal>

      <Reveal>
        <RevealItem className="mt-12">
          <EstimatePhone />
        </RevealItem>
      </Reveal>
    </section>
  );
}
