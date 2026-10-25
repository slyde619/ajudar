import type { LucideIcon } from "lucide-react";

export interface CategoryTileProps {
  label: string;
  hint: string;
  icon: LucideIcon;
}

/** Pure presentational tile — props in, JSX out. */
export function CategoryTile({ label, hint, icon: Icon }: CategoryTileProps) {
  return (
    <div className="rounded-xl border border-line-200 bg-surface-raised p-4 shadow-card">
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-sunken text-ink-700">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <p className="mt-3 text-sm font-semibold text-ink-950">{label}</p>
      <p className="mt-0.5 text-xs text-ink-500">{hint}</p>
    </div>
  );
}
