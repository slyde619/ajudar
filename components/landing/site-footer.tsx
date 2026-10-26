import { cacheLife } from "next/cache";
import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";
import { DotGrid } from "@/components/landing/dot-grid";
import { cn } from "@/lib/utils";

const GLYPHS: Record<string, readonly string[]> = {
  a: [".....", ".....", ".###.", "....#", ".####", "#...#", ".####"],
  j: ["...#.", ".....", "..##.", "...#.", "...#.", "#..#.", ".##.."],
  u: [".....", ".....", "#...#", "#...#", "#...#", "#..##", ".##.#"],
  d: ["....#", "....#", ".####", "#...#", "#...#", "#...#", ".####"],
  r: [".....", ".....", "#.##.", "##..#", "#....", "#....", "#...."],
};

const WORD = "ajudar";
const CELL = 10;
const GAP_COLS = 1;
const COLS = WORD.length * 5 + (WORD.length - 1) * GAP_COLS;

const LINKS = [
  {
    title: "Customers",
    items: [
      { href: "/signup?as=customer", label: "Find an artisan" },
      { href: "#how", label: "How it works" },
      { href: "#trades", label: "What we fix" },
      { href: "#faq", label: "FAQs" },
    ],
  },
  {
    title: "Artisans",
    items: [
      { href: "/signup?as=artisan", label: "Earn with ajudar" },
      { href: "#artisans", label: "How you get paid" },
    ],
  },
] as const;

/** Current year, prerendered and refreshed daily so it rolls over without a request-time render. */
async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

/** The ajudar wordmark drawn as a dot matrix, lit dots over a faint grid. */
function DotMatrixWordmark({ className }: { className?: string }) {
  const dots: { x: number; y: number; on: boolean }[] = [];
  [...WORD].forEach((letter, index) => {
    const offset = index * (5 + GAP_COLS);
    GLYPHS[letter].forEach((row, y) => {
      [...row].forEach((cell, x) =>
        dots.push({ x: offset + x, y, on: cell === "#" }),
      );
    });
  });

  return (
    <svg
      viewBox={`0 0 ${COLS * CELL} ${7 * CELL}`}
      className={className}
      role="img"
      aria-label="ajudar"
    >
      {dots.map((dot) => (
        <circle
          key={`${dot.x}-${dot.y}`}
          cx={dot.x * CELL + CELL / 2}
          cy={dot.y * CELL + CELL / 2}
          r={dot.on ? CELL * 0.4 : CELL * 0.14}
          className={dot.on ? "fill-ink-950" : "fill-ink-950/15"}
        />
      ))}
    </svg>
  );
}

/** Landing footer on the hero cream: links, a dot-matrix wordmark and a springy dot grid. */
export function SiteFooter({ wrap }: { wrap: string }) {
  return (
    <footer className="overflow-hidden border-t border-ink-950/10 bg-scene-sky text-ink-950">
      <div className={cn(wrap, "pt-14 md:pt-20")}>
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <BrandMark />
            <p className="mt-4 text-base leading-relaxed text-ink-700">
              Verified artisans, fair prices and escrow-backed jobs. Your money
              moves only when you say the work is done.
            </p>
          </div>
          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-10 gap-y-10 md:gap-x-20"
          >
            {LINKS.map((group) => (
              <div key={group.title}>
                <p className="font-mono text-[12px] tracking-widest text-ink-500 uppercase">
                  {group.title}
                </p>
                <ul className="mt-4 flex flex-col gap-3 text-base">
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-ink-700 underline-offset-4 transition-colors hover:text-ink-950 hover:underline"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <DotMatrixWordmark className="mt-16 block w-full md:mt-24" />

        <p className="mt-10 flex flex-col items-center justify-center gap-x-3 gap-y-1.5 text-center font-mono text-[12px] tracking-widest text-ink-500 uppercase sm:flex-row sm:flex-wrap">
          <span>
            © <CopyrightYear /> ajudar
          </span>
          <span aria-hidden className="max-sm:hidden">
            ·
          </span>
          <span>Illustrations by ajudar</span>
        </p>
      </div>
      <DotGrid
        className="mt-6 h-48 md:h-64"
        baseColor="--color-ink-300"
        activeColor="--color-ink-950"
        dotSize={4}
        gap={14}
        proximity={120}
        glow={0}
        fade={0.35}
      />
      <div className="pb-safe" />
    </footer>
  );
}
