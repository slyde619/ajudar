import { CheckIcon } from "@phosphor-icons/react/ssr";
import { GATE_CHECKS } from "../content";
import { RevealItem } from "../reveal";
import { AgreementScene } from "../scenes/agreement-scene";
import { GateCheckScene } from "../scenes/gate-check-scene";
import { PaydayScene } from "../scenes/payday-scene";
import { WaitingScene } from "../scenes/waiting-scene";
import { StoryBeat } from "../story-beat";
import { STORY } from "../styles";

const SCENE = "mx-auto block max-h-[30svh] w-full lg:max-h-[58svh]";

/** The Saturday story: the wait without ajudar, then three pinned beats with it. */
export function HowItWorks() {
  return (
    <div id="how" className="relative scroll-mt-24 px-2 pb-[30svh] md:px-4">
      <WaitingScene />

      <StoryBeat
        id="price-title"
        index={1}
        tone="bg-scene-mint"
        title="Price agreed before he leaves."
        kicker={
          <h2 className="mb-3 font-mono text-[13px] tracking-widest text-ink-950 uppercase">
            The same Saturday, with ajudar
          </h2>
        }
        scene={<AgreementScene className={SCENE} />}
      >
        <RevealItem>
          <p className={STORY}>
            No &ldquo;madam, the work is bigger than I thought&rdquo; at the gate. You see the estimate
            line by line, he can only counter on labour, and your money waits in escrow until the job is
            done.
          </p>
        </RevealItem>
      </StoryBeat>

      <StoryBeat
        id="gate-title"
        index={2}
        tone="bg-scene-lilac"
        title="You know who's at your gate."
        scene={<GateCheckScene className={SCENE} />}
        flip
      >
        <RevealItem>
          <p className={STORY}>
            Letting a stranger into your home takes trust. So he earns it before he ever sees your
            request.
          </p>
        </RevealItem>
        <RevealItem>
          <ul className="mt-4 flex max-w-md flex-col gap-2.5 md:mt-6 md:gap-3.5">
            {GATE_CHECKS.map((check) => (
              <li key={check.title} className="flex gap-3 text-[15px] leading-snug text-ink-950 md:text-base">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-ink-950 text-celo-500">
                  <CheckIcon className="size-3.5" aria-hidden />
                </span>
                <span>
                  <strong className="font-semibold">{check.title}</strong>, {check.detail}
                </span>
              </li>
            ))}
          </ul>
        </RevealItem>
      </StoryBeat>

      <StoryBeat
        id="code-title"
        index={3}
        tone="bg-scene-peach"
        title="Paid when you say it's done."
        scene={<PaydayScene className={SCENE} />}
      >
        <RevealItem>
          <p className={STORY}>
            When the tap stops dripping, you read him a six-digit code. That releases the money, and his
            phone buzzes before he has packed his tools. Not happy? Don&apos;t give the code, and we step
            in.
          </p>
        </RevealItem>
      </StoryBeat>
    </div>
  );
}
