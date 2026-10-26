import type { Icon } from "@phosphor-icons/react";
import Link from "next/link";

export interface CategoryTileProps {
  label: string;
  hint: string;
  icon: Icon;
  href: string;
}

/** Dashboard tile linking to a service category. */
export function CategoryTile({ label, hint, icon: Icon, href }: CategoryTileProps) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-line-200 bg-surface-raised p-4 shadow-card transition-[transform,box-shadow] duration-150 ease-out active:scale-[0.98] hover:shadow-pop"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-sunken text-ink-700">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <p className="mt-3 text-sm font-semibold text-ink-950">{label}</p>
      <p className="mt-0.5 text-xs text-ink-500">{hint}</p>
    </Link>
  );
}
