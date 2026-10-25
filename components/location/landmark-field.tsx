import { cn } from "@/lib/utils";

interface LandmarkFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const LANDMARK_MIN = 8;
const LANDMARK_MAX = 140;

/**
 * Pure controlled field. The landmark is what the artisan actually navigates
 * by (§10.4), so the prompt asks for directions, not an address.
 */
export function LandmarkField({ id, value, onChange, className }: LandmarkFieldProps) {
  const hintId = `${id}-hint`;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-ink-950">
        Landmark
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value.slice(0, LANDMARK_MAX))}
        rows={3}
        aria-describedby={hintId}
        placeholder="Blue gate opposite First Bank, Oka junction"
        className="w-full resize-none rounded-xl border border-input bg-surface-raised px-4 py-3 text-base leading-relaxed text-ink-950 transition-[border-color,box-shadow] outline-none placeholder:text-ink-400 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      <div id={hintId} className="flex items-start justify-between gap-3 text-xs text-ink-500">
        <span>What would you tell a driver at the junction?</span>
        <span className="shrink-0 font-mono text-[11px] text-ink-400" data-tabular>
          {value.length}/{LANDMARK_MAX}
        </span>
      </div>
    </div>
  );
}
