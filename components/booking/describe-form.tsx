"use client";

import { ArrowRight, Camera, LoaderCircle, MapPin, Siren, X } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { createJobAction } from "@/app/_actions/booking";
import { LocationChip } from "@/components/location/location-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "@/hooks/use-location";
import { usePhotoPreviews } from "@/hooks/use-photo-previews";
import type { JobTiming, Lga, TradeCategory } from "@/lib/types";
import { cn } from "@/lib/utils";
import { matchableSite } from "@/stores/location";
import { BookingFrame } from "./booking-frame";

const MAX_PHOTOS = 4;
const TITLE_MIN = 4;
const DESCRIPTION_MIN = 10;
const SCHEDULE_WINDOW_MINUTES = 120;

interface DescribeFormProps {
  category: TradeCategory;
  lgas: Lga[];
  returnHref: string;
}

function earliestSlot(): string {
  const date = new Date(Date.now() + 60 * 60 * 1000);
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:00`;
}

/** First booking step, where the customer describes the job with text, photos, location and urgency. */
export function DescribeForm({ category, lgas, returnHref }: DescribeFormProps) {
  const { location, hydrated } = useLocation();
  const site = matchableSite(location);
  const { photos, add, remove } = usePhotoPreviews(MAX_PHOTOS);
  const fileInput = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [when, setWhen] = useState<"now" | "scheduled">("now");
  const [slot, setSlot] = useState("");
  const [minSlot, setMinSlot] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const lga = site ? lgas.find((entry) => entry.code === site.lgaCode) : undefined;
  const gateHref = `/onboarding?next=${encodeURIComponent(returnHref)}`;
  const ready =
    site !== null &&
    title.trim().length >= TITLE_MIN &&
    description.trim().length >= DESCRIPTION_MIN &&
    (when === "now" || slot !== "");

  function submit() {
    if (!site || !ready) return;
    const timing: JobTiming =
      when === "now"
        ? { mode: "now" }
        : { mode: "scheduled", scheduledFor: new Date(slot).toISOString(), windowMinutes: SCHEDULE_WINDOW_MINUTES };
    setError(null);
    startTransition(async () => {
      const result = await createJobAction({
        categoryId: category.id,
        title,
        description,
        site,
        timing,
        urgency: emergency && when === "now" ? "emergency" : "standard",
      });
      if (result) setError(result.error);
    });
  }

  return (
    <BookingFrame
      step="Describe"
      closeHref="/dashboard"
      footer={
        <>
          {error ? (
            <p role="alert" className="mb-3 rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger-600">
              {error}
            </p>
          ) : null}
          <Button size="cta" className="w-full" disabled={!ready || pending} onClick={submit}>
            {pending ? (
              <>
                <LoaderCircle className="animate-spin" aria-hidden />
                Pricing your job…
              </>
            ) : (
              <>
                See your estimate
                <ArrowRight aria-hidden />
              </>
            )}
          </Button>
        </>
      }
    >
      <p className="font-mono text-[11px] tracking-widest text-ink-500 uppercase">{category.label}</p>
      <h1 className="mt-1 text-[26px] leading-tight font-semibold tracking-tight text-ink-950">
        What needs fixing?
      </h1>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
        The clearer the picture, the closer the estimate.
      </p>

      <div className="mt-6 flex flex-col gap-2">
        <label htmlFor="job-title" className="text-sm font-semibold text-ink-950">
          In a few words
        </label>
        <Input
          id="job-title"
          value={title}
          maxLength={80}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Burst pipe under the kitchen sink"
          className="h-12 rounded-xl bg-surface-raised px-4"
        />
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <label htmlFor="job-description" className="text-sm font-semibold text-ink-950">
          What&apos;s happening
        </label>
        <Textarea
          id="job-description"
          value={description}
          maxLength={600}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Water is pooling under the sink. I've closed the main valve."
          className="min-h-28 rounded-xl bg-surface-raised px-4 py-3 leading-relaxed"
        />
      </div>

      <div className="mt-5">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-semibold text-ink-950">Photos</p>
          <p className="font-mono text-[11px] text-ink-400" data-tabular>
            {photos.length}/{MAX_PHOTOS}
          </p>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="relative aspect-square overflow-hidden rounded-lg bg-surface-sunken">
              {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
              <img src={photo.url} alt="" className="size-full object-cover" />
              <button
                type="button"
                onClick={() => remove(photo.id)}
                aria-label={`Remove ${photo.name}`}
                className="absolute top-1 right-1 flex size-7 items-center justify-center rounded-full bg-ink-950/70 text-surface-raised"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS ? (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line-300 text-ink-500 transition-colors hover:border-ink-400 hover:text-ink-700"
            >
              <Camera className="size-5" aria-hidden />
              <span className="text-[11px] font-medium">Add</span>
            </button>
          ) : null}
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(event) => {
            add(event.target.files);
            event.target.value = "";
          }}
        />
        <p className="mt-2 text-xs text-ink-500">Artisans price from photos. Show the damage and the area around it.</p>
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold text-ink-950">Where</p>
        {!hydrated ? (
          <div className="mt-2 h-20 animate-pulse rounded-xl bg-surface-sunken" />
        ) : site ? (
          <LocationChip
            area={lga ? `${lga.name}, ${lga.stateName}` : site.lgaCode}
            landmark={site.landmark}
            precision={site.pinConfirmedByUser ? "pin" : "approximate"}
            className="mt-2"
            action={
              <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={gateHref} />} className="h-9 rounded-lg text-ink-700">
                Change
              </Button>
            }
          />
        ) : (
          <Link
            href={gateHref}
            className="mt-2 flex items-center gap-3 rounded-xl bg-surface-raised p-4 ring-1 ring-line-200 transition-shadow hover:ring-line-300"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-ink-700">
              <MapPin className="size-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink-950">
                {location.status === "stale" ? "Confirm you're still here" : "Set where you need help"}
              </span>
              <span className="block text-xs text-ink-500">Your LGA decides who can come.</span>
            </span>
            <ArrowRight className="size-4 text-ink-400" aria-hidden />
          </Link>
        )}
      </div>

      <div className="mt-6">
        <p id="when-label" className="text-sm font-semibold text-ink-950">
          When
        </p>
        <div role="radiogroup" aria-labelledby="when-label" className="mt-2 grid grid-cols-2 gap-1 rounded-xl bg-surface-sunken p-1">
          {(["now", "scheduled"] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={when === option}
              onClick={() => {
                setWhen(option);
                if (option === "scheduled") setMinSlot(earliestSlot());
              }}
              className={cn(
                "h-10 rounded-lg text-sm font-medium transition-[background-color,color,box-shadow] duration-200",
                when === option ? "bg-surface-raised text-ink-950 shadow-card" : "text-ink-500 hover:text-ink-700",
              )}
            >
              {option === "now" ? "As soon as possible" : "Schedule"}
            </button>
          ))}
        </div>
        {when === "scheduled" ? (
          <div className="mt-3 flex flex-col gap-2">
            <label htmlFor="job-slot" className="text-xs font-medium text-ink-700">
              Arrival window starts
            </label>
            <Input
              id="job-slot"
              type="datetime-local"
              value={slot}
              min={minSlot}
              step={1800}
              onChange={(event) => setSlot(event.target.value)}
              className="h-12 rounded-xl bg-surface-raised px-4"
            />
            <p className="text-xs text-ink-500">They arrive within two hours of this time.</p>
          </div>
        ) : null}
      </div>

      {category.supportsEmergency && when === "now" ? (
        <label className="mt-6 flex items-start gap-3 rounded-xl bg-surface-raised p-4 ring-1 ring-line-200">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-danger-100 text-danger-600">
            <Siren className="size-4" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-ink-950">This is an emergency</span>
            <span className="mt-0.5 block text-xs leading-relaxed text-ink-500">
              Fixed price, no haggling. Labour goes up ×{category.emergencySurgeMultiplier ?? 1} and they leave now.
            </span>
          </span>
          <Switch checked={emergency} onCheckedChange={setEmergency} aria-label="This is an emergency" className="mt-1" />
        </label>
      ) : null}
    </BookingFrame>
  );
}
