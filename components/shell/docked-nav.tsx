"use client";

import {
  ClipboardList,
  House,
  MessageSquare,
  User,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand/brand-mark";

export type AppRole = "customer" | "artisan";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: Record<AppRole, NavItem[]> = {
  customer: [
    { href: "/dashboard", label: "Home", icon: House },
    { href: "/jobs", label: "Jobs", icon: ClipboardList },
    { href: "/messages", label: "Messages", icon: MessageSquare },
    { href: "/profile", label: "Profile", icon: User },
  ],
  artisan: [
    { href: "/artisan", label: "Feed", icon: Zap },
    { href: "/artisan/jobs", label: "Jobs", icon: ClipboardList },
    { href: "/artisan/earnings", label: "Earnings", icon: Wallet },
    { href: "/artisan/profile", label: "Profile", icon: User },
  ],
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard" || href === "/artisan") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DockedNav({ role }: { role: AppRole }) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role];
  const homeHref = role === "customer" ? "/dashboard" : "/artisan";

  return (
    <>
      {/* Mobile dock — 4 tabs, safe-area padding, content blurs underneath. */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line-200 bg-background/80 pb-safe backdrop-blur-xl lg:hidden"
      >
        <ul className="grid grid-cols-4">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className="flex min-h-11 flex-col items-center justify-center gap-1 px-2 pt-2 pb-1.5"
                >
                  <span className="relative flex h-7 w-7 items-center justify-center">
                    {active ? (
                      <span
                        aria-hidden
                        className="absolute -top-1 h-1.5 w-1.5 rounded-pill bg-celo-500"
                      />
                    ) : null}
                    <Icon
                      aria-hidden
                      className={
                        active
                          ? "h-5 w-5 text-ink-950"
                          : "h-5 w-5 text-ink-500"
                      }
                      strokeWidth={active ? 2.25 : 1.75}
                    />
                  </span>
                  <span
                    className={
                      active
                        ? "text-[11px] leading-none font-semibold text-ink-950"
                        : "text-[11px] leading-none text-ink-500"
                    }
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Desktop sidebar — same data, different shell. */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line-200 bg-background pt-safe lg:flex">
        <BrandMark href={homeHref} className="px-6 pt-6 pb-8" />

        <nav aria-label="Primary" className="flex-1 px-3">
          <ul className="space-y-1">
            {items.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "flex items-center gap-3 rounded-md bg-surface-sunken px-3 py-2.5 text-sm font-semibold text-ink-950"
                        : "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-ink-500 hover:bg-surface-sunken/60 hover:text-ink-700"
                    }
                  >
                    <Icon
                      aria-hidden
                      className="h-5 w-5"
                      strokeWidth={active ? 2.25 : 1.75}
                    />
                    <span className="flex-1">{item.label}</span>
                    {active ? (
                      <span
                        aria-hidden
                        className="h-1.5 w-1.5 rounded-pill bg-celo-500"
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <p className="px-6 pb-6 font-mono text-[10px] tracking-wider text-ink-400 uppercase">
          Lagos · Abia
        </p>
      </aside>
    </>
  );
}
