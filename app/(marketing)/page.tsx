import { ArrowRight, BadgeCheck, Check, Lock, MapPin } from "lucide-react";
import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";
import { EXAMPLE_ESTIMATE, GATE_CHECKS, PLACES } from "@/components/landing/content";
import { CloudEdge, TornEdge } from "@/components/landing/edges";
import { Faq } from "@/components/landing/faq";
import { HeroGreeting } from "@/components/landing/hero-greeting";
import { ProofFeed } from "@/components/landing/proof-feed";
import { Reveal, RevealItem } from "@/components/landing/reveal";
import { AgreementScene } from "@/components/landing/scenes/agreement-scene";
import { ArrivalScene } from "@/components/landing/scenes/arrival-scene";
import { GateCheckScene } from "@/components/landing/scenes/gate-check-scene";
import { HeroScene } from "@/components/landing/scenes/hero-scene";
import { PaydayScene } from "@/components/landing/scenes/payday-scene";
import { WaitingScene } from "@/components/landing/scenes/waiting-scene";
import { TradeDeck } from "@/components/landing/trade-deck";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatNaira } from "@/lib/utils/money";

const WRAP = "mx-auto w-full max-w-6xl px-4 md:px-8";
const H2 = "text-[38px] leading-[1.02] font-bold tracking-tighter text-balance text-ink-950 md:text-[60px]";
const LEAD = "mt-4 max-w-md text-lg leading-relaxed text-ink-950";
const STORY = "mt-3 max-w-md text-base leading-relaxed text-ink-950 md:mt-4 md:text-lg";
const NAV = [
  ["#trades", "What we fix"],
  ["#how", "How it works"],
  ["#artisans", "For artisans"],
  ["#faq", "FAQs"],
] as const;

function Cloud({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 140" className={className} aria-hidden>
      <path
        d="M24 140 C-6 140 -6 96 28 92 C24 56 70 44 92 66 C104 22 168 10 192 52 C214 30 262 38 262 78 C300 72 330 112 300 140 Z"
        className="fill-scene-cloud"
      />
    </svg>
  );
}

const PEEK = 14;

const HERO_SCENE = cn(
  "pointer-events-none mt-auto h-[44svh] max-h-100 min-h-80 w-full shrink-0",
  "md:h-(--scene-h) md:max-h-none md:min-h-0 md:mt-[calc(12px-0.367*var(--scene-h))]",
  "md:[--scene-h:min(41.667vw,max(260px,calc((100svh-482px)/0.633)))]",
  "short:[--scene-h:min(41.667vw,max(260px,calc((100svh-412px)/0.633)))]",
);
const SCENE = "mx-auto block max-h-[30svh] w-full lg:max-h-[58svh]";

/** One pinned card of the landing story stack. */
function Beat({
  id,
  index,
  tone,
  title,
  kicker,
  children,
  scene,
  flip = false,
}: {
  id: string;
  index: number;
  tone: string;
  title: string;
  kicker?: React.ReactNode;
  children: React.ReactNode;
  scene: React.ReactNode;
  flip?: boolean;
}) {
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
            <h3 id={id} className="text-[30px] leading-[1.05] font-bold tracking-tighter text-balance text-ink-950 md:text-[48px]">
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

/** Marketing landing page that tells the ajudar story from problem to payday. */
export default function LandingPage() {
  return (
    <main className="overflow-x-clip">
      <div className="relative overflow-clip bg-surface-raised">
        <div className="relative flex min-h-svh animate-stage-rise flex-col bg-scene-sky">
          <Cloud className="pointer-events-none absolute -top-6 -left-16 w-64 animate-drift md:w-96" />
          <Cloud className="pointer-events-none absolute top-20 -right-20 w-56 animate-drift [animation-delay:-14s] md:w-88" />

          <section className="relative flex flex-1 flex-col md:justify-between">
            <div className={cn(WRAP, "relative pt-28 md:pt-32 short:pt-24")}>
              <div className="animate-settle-in [animation-delay:650ms]">
                <HeroGreeting />
              </div>
              <div className="mx-auto mt-7 w-full max-w-xl animate-settle-in short:mt-5 [animation-delay:720ms]">
                <Link
                  href="/signup?as=customer"
                  className="flex w-full items-center gap-3 rounded-pill bg-surface-raised p-2 pl-5 shadow-pop transition-transform duration-150 ease-out active:scale-[0.98]"
                >
                  <MapPin className="size-5 shrink-0 text-ink-950" aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-left text-base text-ink-500">Rivers &amp; Akwa Ibom</span>
                  <span className={cn(buttonVariants({ size: "cta" }), "h-12 rounded-pill px-5")}>
                    Find an artisan
                    <ArrowRight aria-hidden />
                  </span>
                </Link>
              </div>
              <p className="mx-auto mt-5 max-w-md animate-settle-in text-center text-lg leading-relaxed text-ink-950 short:mt-4 short:text-base [animation-delay:790ms]">
                Verified plumbers, electricians and more. The price is agreed and held in escrow before anyone moves.
              </p>
              <p className="mt-2 animate-settle-in text-center [animation-delay:860ms]">
                <Link href="/signup?as=artisan" className="text-base font-semibold text-ink-950 underline underline-offset-4">
                  Are you an artisan? Earn with ajudar
                </Link>
              </p>
            </div>
            <HeroScene className={HERO_SCENE} />
          </section>
          <CloudEdge className="absolute inset-x-0 -bottom-px fill-surface-warm" />
        </div>

        <header className="absolute inset-x-0 top-0">
          <div className={cn(WRAP, "flex items-center justify-between gap-3 pt-safe")}>
            <div className="mt-4 animate-drop-in rounded-pill bg-surface-raised py-1.5 pr-4 pl-1.5 shadow-card [animation-delay:950ms]">
              <BrandMark />
            </div>
            <nav
              aria-label="Sections"
              className="mt-4 hidden animate-drop-in items-center rounded-pill bg-surface-raised p-1.5 shadow-card [animation-delay:1010ms] lg:flex"
            >
              {NAV.map(([href, label]) => (
                <a key={href} href={href} className="rounded-pill px-4 py-2 text-[15px] font-medium text-ink-950 transition-colors hover:bg-surface-sunken">
                  {label}
                </a>
              ))}
            </nav>
            <div className="mt-4 animate-drop-in [animation-delay:1070ms]">
              <Button
                variant="secondary"
                className="h-11 rounded-pill px-5 text-[15px] font-semibold active:scale-[0.97]"
                nativeButton={false}
                render={<Link href="/signup" />}
              >
                Sign up
              </Button>
            </div>
          </div>
        </header>
      </div>

      <section aria-labelledby="app-title" className={cn(WRAP, "pt-16 pb-10 text-center md:pt-24")}>
        <Reveal>
          <RevealItem>
            <h2 id="app-title" className={cn(H2, "mx-auto max-w-3xl")}>
              One app, from &ldquo;it&apos;s broken&rdquo; to &ldquo;it&apos;s fixed&rdquo;.
            </h2>
          </RevealItem>
          <RevealItem>
            <p className={cn(LEAD, "mx-auto")}>Ask, see the price, watch them come, and pay only when you&apos;re happy.</p>
          </RevealItem>
        </Reveal>

        <Reveal>
          <RevealItem>
        <div className="relative mx-auto mt-12 w-full max-w-[330px]">
          <div className="rounded-[2.75rem] border-[10px] border-ink-950 bg-surface-warm p-4 pt-8 text-left shadow-pop">
            <p className="font-mono text-[12px] tracking-wide text-ink-500 uppercase">Example estimate</p>
            <p className="mt-1 text-[22px] font-bold tracking-tight text-ink-950">Leaking kitchen tap</p>
            <dl className="mt-4 rounded-2xl bg-surface-raised px-4 pt-1.5 text-ink-950" data-tabular>
              {EXAMPLE_ESTIMATE.items.map((item) => (
                <div key={item.id} className="flex items-baseline justify-between gap-3 py-2.5">
                  <dt className="min-w-0">
                    <span className="block text-[15px] leading-snug">{item.label}</span>
                    <span className="block text-[13px] text-ink-500">{item.negotiable ? "Labour, open to a counter" : "Fixed"}</span>
                  </dt>
                  <dd className="text-[15px] font-medium">{formatNaira(item.amount)}</dd>
                </div>
              ))}
              <div className="-mx-4 mt-1 flex items-baseline justify-between rounded-b-2xl bg-celo-500 px-4 py-3 font-semibold">
                <dt>Agreed, in escrow</dt>
                <dd>{formatNaira(EXAMPLE_ESTIMATE.total)}</dd>
              </div>
            </dl>
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-surface-raised p-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-ink-950 text-[15px] font-semibold text-surface-raised">CO</span>
              <span className="text-left">
                <span className="block text-[15px] font-semibold text-ink-950">Chinedu O.</span>
                <span className="block text-[13px] text-ink-500">Plumber · 4.8 · 12 min away</span>
              </span>
            </div>
          </div>
          <span
            aria-hidden
            className="absolute -top-5 -left-6 flex animate-bob items-center gap-1.5 rounded-pill border-2 border-ink-950 bg-scene-mint px-3.5 py-2 text-[15px] font-semibold text-ink-950 [--tilt:-8deg] md:-left-20"
          >
            <BadgeCheck className="size-4.5" />
            Verified
          </span>
          <span
            aria-hidden
            className="absolute -right-3 -bottom-4 flex animate-bob items-center gap-1.5 rounded-pill border-2 border-ink-950 bg-scene-peach px-3.5 py-2 text-[15px] font-semibold text-ink-950 [animation-delay:-1.4s] [--tilt:7deg] md:top-1/2 md:-right-24 md:bottom-auto"
          >
            <Lock className="size-4" />
            In escrow
          </span>
        </div>
          </RevealItem>
        </Reveal>
      </section>

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

      <div id="how" className="relative scroll-mt-4 px-2 pb-[30svh] md:px-4">
        <WaitingScene />

        <Beat
          id="price-title"
          index={1}
          tone="bg-scene-mint"
          title="Price agreed before he leaves."
          kicker={<h2 className="mb-3 font-mono text-[13px] tracking-widest text-ink-950 uppercase">The same Saturday, with ajudar</h2>}
          scene={<AgreementScene className={SCENE} />}
        >
          <RevealItem>
            <p className={STORY}>
              No &ldquo;madam, the work is bigger than I thought&rdquo; at the gate. You see the estimate line by line, he can only
              counter on labour, and your money waits in escrow until the job is done.
            </p>
          </RevealItem>
        </Beat>

        <Beat id="gate-title" index={2} tone="bg-scene-lilac" title="You know who's at your gate." scene={<GateCheckScene className={SCENE} />} flip>
          <RevealItem>
            <p className={STORY}>Letting a stranger into your home takes trust. So he earns it before he ever sees your request.</p>
          </RevealItem>
          <RevealItem>
            <ul className="mt-4 flex max-w-md flex-col gap-2.5 md:mt-6 md:gap-3.5">
              {GATE_CHECKS.map((check) => (
                <li key={check.title} className="flex gap-3 text-[15px] leading-snug text-ink-950 md:text-base">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-ink-950 text-celo-500">
                    <Check className="size-3.5" aria-hidden />
                  </span>
                  <span>
                    <strong className="font-semibold">{check.title}</strong>, {check.detail}
                  </span>
                </li>
              ))}
            </ul>
          </RevealItem>
        </Beat>

        <Beat id="code-title" index={3} tone="bg-scene-peach" title="Paid when you say it's done." scene={<PaydayScene className={SCENE} />}>
          <RevealItem>
            <p className={STORY}>
              When the tap stops dripping, you read him a six-digit code. That releases the money, and his phone buzzes before he has
              packed his tools. Not happy? Don&apos;t give the code, and we step in.
            </p>
          </RevealItem>
        </Beat>
      </div>

      <TornEdge className="fill-ink-950" />
      <section aria-labelledby="feed-title" className="bg-ink-950">
        <div className={cn(WRAP, "grid items-center gap-10 py-16 md:py-24 lg:grid-cols-2 lg:gap-16")}>
          <Reveal>
            <RevealItem>
              <Badge className="h-auto bg-celo-500 px-2.5 py-1 font-mono text-[12px] tracking-wide text-ink-950 uppercase">Example</Badge>
            </RevealItem>
            <RevealItem>
            <h2 id="feed-title" className="mt-4 text-[38px] leading-[1.02] font-bold tracking-tighter text-balance text-surface-raised md:text-[60px]">
              Every step, on your phone.
            </h2>
            </RevealItem>
            <RevealItem>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-line-200">
                Who accepted, the price you agreed, where they are, the face at your gate, the code, and the money moving. No calling
                to ask &ldquo;where are you?&rdquo;.
              </p>
            </RevealItem>
          </Reveal>
          <ProofFeed className="mx-auto w-full max-w-md" />
        </div>
      </section>
      <TornEdge className="fill-ink-950" flip />

      <TornEdge className="fill-scene-palm" />
      <section id="artisans" aria-labelledby="artisan-title" className="scroll-mt-4 bg-scene-palm text-surface-raised">
        <div className={cn(WRAP, "grid gap-10 py-16 md:py-24 lg:grid-cols-2 lg:gap-16")}>
          <Reveal>
            <RevealItem>
              <h2 id="artisan-title" className="text-[38px] leading-[1.02] font-bold tracking-tighter text-balance md:text-[60px]">
                For artisans: no more chasing.
              </h2>
            </RevealItem>
            <RevealItem>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-scene-cloud">
                You see the money is in escrow before you set out. You finish, they read you the code, and it&apos;s yours. No
                &ldquo;come back next week for the balance&rdquo;.
              </p>
            </RevealItem>
            <RevealItem>
              <div className="mt-8">
                <Button size="cta" className="rounded-pill sm:w-auto sm:px-7" nativeButton={false} render={<Link href="/signup?as=artisan" />}>
                  Earn with ajudar
                  <ArrowRight aria-hidden />
                </Button>
              </div>
            </RevealItem>
          </Reveal>
          <Reveal className="flex flex-col gap-3 self-end">
            {[
              ["Requests near you, priced up front", "Only jobs in the areas you choose, with the estimate on the card."],
              ["Verified once, picked again", "Your checks and ratings travel with you to every customer."],
              ["Paid the day you finish", "The code releases escrow on the spot. Transfers to your bank follow."],
            ].map(([title, detail]) => (
              <RevealItem key={title} className="rounded-2xl border-2 border-ink-950 bg-surface-raised p-5 text-ink-950">
                <p className="text-lg font-semibold">{title}</p>
                <p className="mt-1 text-base leading-relaxed text-ink-500">{detail}</p>
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </section>
      <TornEdge className="fill-scene-palm" flip />

      <section id="faq" aria-labelledby="faq-title" className={cn(WRAP, "scroll-mt-4 py-16 md:py-24")}>
        <Reveal>
          <RevealItem>
            <Faq />
          </RevealItem>
        </Reveal>
      </section>

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
            <RevealItem className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="cta" className="rounded-pill sm:w-auto sm:px-7" nativeButton={false} render={<Link href="/signup?as=customer" />}>
                Find an artisan
                <ArrowRight aria-hidden />
              </Button>
              <Button
                size="cta"
                variant="outline"
                className="rounded-pill border-2 border-ink-950 bg-transparent text-ink-950 hover:bg-scene-cloud sm:w-auto sm:px-7"
                nativeButton={false}
                render={<Link href="/signup?as=artisan" />}
              >
                Earn with ajudar
              </Button>
            </RevealItem>
          </Reveal>
          <ArrivalScene className="w-full max-md:-mx-4 max-md:w-[calc(100%+2rem)] max-md:max-w-none" />
        </div>
      </section>

      <footer className="bg-ink-950 text-line-300">
        <div className={cn(WRAP, "pt-14 pb-safe")}>
          <Reveal className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <RevealItem>
              <p className="font-mono text-[12px] tracking-widest text-ink-400 uppercase">Customers</p>
              <ul className="mt-4 flex flex-col gap-3 text-base">
                <li><Link href="/signup?as=customer" className="hover:text-surface-raised">Find an artisan</Link></li>
                <li><a href="#how" className="hover:text-surface-raised">How it works</a></li>
                <li><a href="#trades" className="hover:text-surface-raised">What we fix</a></li>
                <li><a href="#faq" className="hover:text-surface-raised">FAQs</a></li>
              </ul>
            </RevealItem>
            <RevealItem>
              <p className="font-mono text-[12px] tracking-widest text-ink-400 uppercase">Artisans</p>
              <ul className="mt-4 flex flex-col gap-3 text-base">
                <li><Link href="/signup?as=artisan" className="hover:text-surface-raised">Earn with ajudar</Link></li>
                <li><a href="#artisans" className="hover:text-surface-raised">How you get paid</a></li>
              </ul>
            </RevealItem>
            {(["Rivers", "Akwa Ibom"] as const).map((state) => (
              <RevealItem key={state}>
                <p className="font-mono text-[12px] tracking-widest text-ink-400 uppercase">{state}</p>
                <ul className="mt-4 flex flex-col gap-3 text-base">
                  {PLACES.filter((p) => p.state === state).map((p) => (
                    <li key={p.id}>{p.name}</li>
                  ))}
                </ul>
              </RevealItem>
            ))}
          </Reveal>
          <Reveal>
            <RevealItem>
              <p aria-hidden className="mt-16 text-[26vw] leading-[0.8] font-bold tracking-tighter text-surface-raised select-none lg:text-[18vw]">
                ajudar
              </p>
            </RevealItem>
          </Reveal>
          <p className="border-t border-ink-800 py-6 text-[13px] leading-relaxed">Illustrations by ajudar. Prices shown are examples.</p>
        </div>
      </footer>
    </main>
  );
}
