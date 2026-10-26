"use client";

import { MedalIcon, ImageSquareIcon, XIcon } from "@phosphor-icons/react/ssr";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { usePhotoPreviews } from "@/hooks/use-photo-previews";
import { useUpload } from "@/hooks/use-upload";
import { MAX_PORTFOLIO_PHOTOS, MIN_PORTFOLIO_PHOTOS } from "@/lib/schemas/onboarding";
import type { ArtisanApplication } from "@/lib/types";
import { StepFooter } from "./step-footer";
import { StepHeading } from "./step-heading";
import { useStepSave } from "./use-step-save";


/** Onboarding step for past-work photos and a certificate or apprenticeship years. */
export function PortfolioStep({ application }: { application: ArtisanApplication }) {
  const saved = application.portfolio;
  const photos = usePhotoPreviews(MAX_PORTFOLIO_PHOTOS);
  const certificate = usePhotoPreviews(1);
  const [apprenticeship, setApprenticeship] = useState(saved.apprenticeshipYears?.toString() ?? "");
  const photoInput = useRef<HTMLInputElement>(null);
  const certificateInput = useRef<HTMLInputElement>(null);
  const upload = useUpload();
  const { save, error, pending } = useStepSave();

  const keepSaved = photos.photos.length === 0 && saved.photoUrls.length >= MIN_PORTFOLIO_PHOTOS;
  const photoCount = keepSaved ? saved.photoUrls.length : photos.photos.length;
  const hasProof = certificate.photos.length > 0 || Boolean(saved.certificateUrl) || Number(apprenticeship) > 0;

  function submit() {
    save(async () => {
      let photoUrls = saved.photoUrls;
      if (!keepSaved) {
        const uploaded = await Promise.all(photos.photos.map((photo) => upload(photo.file)));
        const failed = uploaded.find((result) => !result.ok);
        if (failed && !failed.ok) return failed.error.message;
        photoUrls = uploaded.flatMap((result) => (result.ok ? [result.data] : []));
      }
      let certificateUrl = saved.certificateUrl;
      const certificateFile = certificate.photos[0]?.file;
      if (certificateFile) {
        const result = await upload(certificateFile);
        if (!result.ok) return result.error.message;
        certificateUrl = result.data;
      }
      return {
        step: "portfolio",
        photoUrls,
        certificateUrl,
        apprenticeshipYears: apprenticeship ? Number(apprenticeship) : undefined,
      };
    });
  }

  return (
    <>
      <StepHeading
        title="Show your work"
        detail={`At least ${MIN_PORTFOLIO_PHOTOS} photos of jobs you've finished. Before-and-after shots get picked most.`}
      />

      <ul className="grid grid-cols-3 gap-2">
        {photos.photos.map((photo) => (
          <li key={photo.id} className="relative aspect-square overflow-hidden rounded-xl bg-surface-sunken">
            {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
            <img src={photo.url} alt="" className="size-full object-cover" />
            <button
              type="button"
              onClick={() => photos.remove(photo.id)}
              aria-label={`Remove ${photo.name}`}
              className="absolute top-1 right-1 flex size-7 items-center justify-center rounded-full bg-ink-950/70 text-surface-raised"
            >
              <XIcon className="size-3.5" aria-hidden />
            </button>
          </li>
        ))}
        {photos.photos.length < MAX_PORTFOLIO_PHOTOS ? (
          <li>
            <button
              type="button"
              onClick={() => photoInput.current?.click()}
              className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line-300 text-ink-500 transition-colors hover:bg-surface-sunken"
            >
              <ImageSquareIcon className="size-5" aria-hidden />
              <span className="text-xs font-medium">Add photos</span>
            </button>
          </li>
        ) : null}
      </ul>
      <input
        ref={photoInput}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          photos.add(event.target.files);
          event.target.value = "";
        }}
      />
      <p className="mt-2 text-xs text-ink-500" data-tabular>
        {keepSaved
          ? `${saved.photoUrls.length} photos already sent. Add new ones to replace them.`
          : photoCount >= MIN_PORTFOLIO_PHOTOS
            ? `${photoCount} photos added`
            : `${photoCount} of ${MIN_PORTFOLIO_PHOTOS} needed`}
      </p>

      <p className="mt-6 text-sm font-semibold text-ink-950">How did you learn the trade?</p>
      <p className="mt-1 text-xs text-ink-500">A trade certificate, or the years you apprenticed. One is enough.</p>
      <button
        type="button"
        onClick={() => certificateInput.current?.click()}
        className="mt-3 flex w-full items-center gap-3 rounded-xl bg-surface-sunken p-3 text-left"
      >
        <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-ink-950 text-celo-500">
          {certificate.photos[0] ? (
            // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
            <img src={certificate.photos[0].url} alt="" className="size-full object-cover" />
          ) : (
            <MedalIcon className="size-5" aria-hidden />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-ink-950">
            {certificate.photos[0] ? "Certificate added" : saved.certificateUrl ? "Certificate sent" : "Photo of your certificate"}
          </span>
          <span className="block text-xs text-ink-500">NABTEB, ITF, or a trade association</span>
        </span>
      </button>
      <input
        ref={certificateInput}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          certificate.replace(event.target.files);
          event.target.value = "";
        }}
      />
      <label htmlFor="apprenticeship" className="mt-4 text-sm font-medium text-ink-950">
        Years as an apprentice
      </label>
      <Input
        id="apprenticeship"
        value={apprenticeship}
        inputMode="numeric"
        onChange={(event) => setApprenticeship(event.target.value.replace(/\D/g, "").slice(0, 2))}
        placeholder="3"
        className="mt-2 h-12 w-28 rounded-xl bg-surface-raised px-4"
      />

      <StepFooter
        label="Continue"
        pendingLabel="Uploading…"
        pending={pending}
        disabled={photoCount < MIN_PORTFOLIO_PHOTOS || !hasProof}
        error={error}
        onSubmit={submit}
      />
    </>
  );
}
