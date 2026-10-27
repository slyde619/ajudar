import { cn } from "@/lib/utils";
import { Reveal, RevealItem } from "./reveal";

const PEEK = 14;

interface StoryBeatProps {
  id: string;
  index: number;
  tone: string;
  title: string;
  kicker?: React.ReactNode;
  children: React.ReactNode;
  scene: React.ReactNode;
  flip?: boolean;
}

/** One pinned card of the landing story stack; each later card peeks 14px lower than the last. */
export function StoryBeat({ id, index, tone, title, kicker, children, scene, flip = false }: StoryBeatProps) {
  return (
    <section
      aria-labelledby={id}
      style={{ top: index * PEEK, height: `calc(100svh - ${index * PEEK}px)` }}
      className={cn("sticky overflow-hidden rounded-2xl border-2 border-ink-950", tone)}
    >
      <div className="mx-auto grid h-full max-w-6xl content-center items-center gap-5 px-5 py-6 md:px-10 lg:grid-cols-2 lg:gap-12">
        <Reveal className={cn(flip && "lg:order-2")}>
          <RevealItem>
            {kicker}
            <h3
              id={id}
              className="text-[30px] leading-[1.05] font-bold tracking-tighter text-balance text-ink-950 md:text-[48px]"
            >
              {title}
            </h3>
          </RevealItem>
          {children}
        </Reveal>
        <Reveal>
          <RevealItem className="rounded-2xl bg-surface-raised/60 p-2">{scene}</RevealItem>
        </Reveal>
      </div>
    </section>
  );
}
