"use client";

import { useCallback, useId, useRef, useState } from "react";
import { LiquidLink } from "@/components/ui/liquid-link";
import { useDismiss, type DismissReason } from "@/hooks/use-dismiss";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "./content";

const EASE = "duration-300 ease-out-quint";
const STAGGER = ["delay-60", "delay-90", "delay-120", "delay-150", "delay-180"];

function MenuGlyph({ open }: { open: boolean }) {
  const line = cn("col-start-1 row-start-1 h-[1.5px] w-full rounded-full bg-current transition-transform", EASE);
  return (
    <span aria-hidden className="grid h-3 w-5.5 place-items-center">
      <span className={cn(line, open ? "rotate-45" : "-translate-y-1")} />
      <span className={cn(line, open ? "-rotate-45" : "translate-y-1")} />
    </span>
  );
}

function MenuLabel({ open }: { open: boolean }) {
  const face = cn("col-start-1 row-start-1 transition-[opacity,translate]", EASE);
  return (
    <span className="grid overflow-hidden text-[15px] font-medium">
      <span aria-hidden={open} className={cn(face, open && "-translate-y-full opacity-0")}>
        Menu
      </span>
      <span aria-hidden={!open} className={cn(face, !open && "translate-y-full opacity-0")}>
        Close
      </span>
    </span>
  );
}

/** Ink "Menu" pill that grows a panel of section links (and the sign-up CTA below md) around itself. */
export function SiteMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const dismiss = useCallback((reason: DismissReason) => {
    setOpen(false);
    if (reason === "escape") buttonRef.current?.focus();
  }, []);
  useDismiss(rootRef, open, dismiss);

  const item = (index: number) =>
    cn("transition-[opacity,translate]", EASE, open ? STAGGER[index] : "translate-y-2 opacity-0");

  return (
    <div ref={rootRef} className="relative w-56">
      <div
        id={panelId}
        inert={!open}
        className={cn(
          "absolute -inset-x-2 -top-2 origin-top rounded-[32px] bg-surface-warm px-2 pt-16 pb-2 shadow-pop transition-[opacity,scale,visibility] transition-discrete motion-reduce:scale-100",
          EASE,
          open ? "visible" : "invisible scale-95 opacity-0",
        )}
      >
        <nav aria-label="Sections" className="px-4 pt-2 pb-3">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link, index) => (
              <li key={link.href} className={item(index)}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-1.5 text-2xl font-semibold tracking-tight text-ink-950 hover:text-ink-500"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className={cn("mx-2 border-t border-line-200 pt-3 pb-1 md:hidden", item(NAV_LINKS.length))}>
          <LiquidLink tone="celo" href="/signup">
            Sign up
          </LiquidLink>
        </div>
      </div>

      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-12 w-full items-center justify-center gap-2 rounded-pill bg-ink-950 px-5 text-surface-raised shadow-card ring-1 ring-surface-raised/15 transition-transform duration-100 ease-out select-none active:scale-[0.97]"
      >
        <MenuGlyph open={open} />
        <MenuLabel open={open} />
      </button>
    </div>
  );
}
