"use client";

import { Check, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import type { Lga, LgaCode, StateCode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LgaPickerProps {
  lgas: Lga[];
  value: LgaCode | null;
  onChange: (code: LgaCode) => void;
}

/** Owns only its own filter state; the chosen LGA is controlled. */
export function LgaPicker({ lgas, value, onChange }: LgaPickerProps) {
  const states = useMemo(() => {
    const seen = new Map<StateCode, string>();
    for (const lga of lgas) seen.set(lga.stateCode, lga.stateName);
    return [...seen.entries()];
  }, [lgas]);

  const initialState =
    lgas.find((lga) => lga.code === value)?.stateCode ?? states[0]?.[0] ?? null;
  const [stateCode, setStateCode] = useState<StateCode | null>(initialState);
  const [query, setQuery] = useState("");

  const visible = lgas.filter(
    (lga) =>
      lga.stateCode === stateCode &&
      lga.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 rounded-xl bg-surface-sunken p-1" role="tablist" aria-label="State">
        {states.map(([code, name]) => (
          <button
            key={code}
            type="button"
            role="tab"
            aria-selected={stateCode === code}
            onClick={() => setStateCode(code)}
            className={cn(
              "h-10 rounded-lg text-sm font-medium transition-[background-color,color,box-shadow] duration-200",
              stateCode === code
                ? "bg-surface-raised text-ink-950 shadow-card"
                : "text-ink-500 hover:text-ink-700",
            )}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search LGAs"
          aria-label="Search LGAs"
          className="h-12 rounded-xl bg-surface-raised pl-10"
        />
      </div>

      <ul
        role="radiogroup"
        aria-label="Local government area"
        className="no-scrollbar max-h-72 overflow-y-auto rounded-xl bg-surface-raised ring-1 ring-line-200"
      >
        {visible.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-ink-500">
            No LGA matches “{query}”.
          </li>
        ) : (
          visible.map((lga) => {
            const selected = lga.code === value;
            return (
              <li key={lga.code} className="border-b border-line-200 last:border-0">
                <button
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onChange(lga.code)}
                  className={cn(
                    "flex min-h-12 w-full items-center justify-between gap-3 px-4 text-left text-sm transition-colors",
                    selected ? "bg-celo-100 font-semibold text-ink-950" : "text-ink-700 hover:bg-surface-warm",
                  )}
                >
                  {lga.name}
                  {selected ? (
                    <span className="flex size-5 items-center justify-center rounded-full bg-ink-950">
                      <Check className="size-3 text-celo-500" strokeWidth={3} aria-hidden />
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
