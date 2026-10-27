import { cn } from "@/lib/utils";
import { Faq } from "../faq";
import { Reveal, RevealItem } from "../reveal";
import { WRAP } from "../styles";

/** The FAQ accordion in the page grid. */
export function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-title" className={cn(WRAP, "scroll-mt-4 py-16 md:py-24")}>
      <Reveal>
        <RevealItem>
          <Faq />
        </RevealItem>
      </Reveal>
    </section>
  );
}
