"use client";

import { Star } from "lucide-react";
import { useState, useTransition } from "react";
import { reviewJobAction } from "@/app/_actions/booking";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Review } from "@/lib/types";
import { cn } from "@/lib/utils";

const TAGS = ["On time", "Clean work", "Fair price", "Explained the fix", "Polite", "Left it tidy"];
const WORDS: Record<Review["rating"], string> = { 1: "Poor", 2: "Not great", 3: "Okay", 4: "Good", 5: "Excellent" };

/** Quick post-job rating that feeds the artisan's trust signals. */
export function RatingForm({ jobId, artisanFirstName }: { jobId: string; artisanFirstName: string }) {
  const [rating, setRating] = useState<Review["rating"] | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(tag: string) {
    setTags((current) => (current.includes(tag) ? current.filter((entry) => entry !== tag) : [...current, tag]));
  }

  function submit() {
    if (!rating) return;
    setError(null);
    startTransition(async () => {
      const result = await reviewJobAction(jobId, { rating, tags, comment: comment || undefined });
      if (result) setError(result.error);
    });
  }

  return (
    <section className="rounded-2xl bg-surface-raised p-5 shadow-card ring-1 ring-line-200" aria-labelledby="rate-heading">
      <h2 id="rate-heading" className="text-[17px] font-semibold tracking-tight text-ink-950">
        How did {artisanFirstName} do?
      </h2>
      <div className="mt-4 flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {([1, 2, 3, 4, 5] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            aria-label={`${value} star${value > 1 ? "s" : ""}, ${WORDS[value]}`}
            onClick={() => setRating(value)}
            className="flex size-11 items-center justify-center rounded-full transition-transform duration-150 ease-out active:scale-90"
          >
            <Star
              className={cn("size-7", rating !== null && value <= rating ? "fill-ink-950 text-ink-950" : "text-line-300")}
              strokeWidth={1.5}
              aria-hidden
            />
          </button>
        ))}
        <span className="ml-2 text-sm font-medium text-ink-700">{rating ? WORDS[rating] : null}</span>
      </div>

      {rating ? (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="mt-4 flex flex-wrap gap-1.5">
            {TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggle(tag)}
                aria-pressed={tags.includes(tag)}
                className={cn(
                  "h-8 rounded-pill px-3 text-xs font-medium ring-1 transition-colors",
                  tags.includes(tag) ? "bg-ink-950 text-surface-raised ring-ink-950" : "bg-surface-raised text-ink-700 ring-line-300",
                )}
              >
                {tag}
              </button>
            ))}
          </div>
          <Textarea
            value={comment}
            maxLength={500}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Anything others should know? (optional)"
            aria-label="Comment"
            className="mt-3 min-h-20 rounded-xl bg-surface-raised px-4 py-3"
          />
          {error ? (
            <p role="alert" className="mt-2 text-sm text-danger-600">
              {error}
            </p>
          ) : null}
          <Button variant="secondary" size="cta" className="mt-4 w-full" disabled={pending} onClick={submit}>
            {pending ? "Sending…" : "Submit rating"}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
