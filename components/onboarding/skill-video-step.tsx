"use client";

import { VideoCameraIcon } from "@phosphor-icons/react/ssr";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useUpload } from "@/hooks/use-upload";
import type { ArtisanApplication } from "@/lib/types";
import { StepFooter } from "./step-footer";
import { StepHeading } from "./step-heading";
import { useStepSave } from "./use-step-save";

/** Optional onboarding step for a one-minute clip of the artisan working. */
export function SkillVideoStep({ application }: { application: ArtisanApplication }) {
  const [picked, setPicked] = useState<{ file: File; url: string } | null>(null);
  const owned = useRef<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const upload = useUpload();
  const { save, error, pending } = useStepSave();
  const file = picked?.file ?? null;
  const preview = picked?.url ?? null;

  useEffect(() => () => {
    if (owned.current) URL.revokeObjectURL(owned.current);
  }, []);

  function pick(next: File | undefined) {
    if (!next) return;
    if (owned.current) URL.revokeObjectURL(owned.current);
    const url = URL.createObjectURL(next);
    owned.current = url;
    setPicked({ file: next, url });
  }

  return (
    <>
      <StepHeading
        title="A minute of you at work"
        detail="Optional, but artisans with a video get picked more. Film yourself fixing something — no need to talk."
      />

      {preview ? (
        <video src={preview} controls playsInline className="aspect-video w-full rounded-2xl bg-ink-950" />
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line-300 text-ink-500 transition-colors hover:bg-surface-sunken"
        >
          <VideoCameraIcon className="size-6" aria-hidden />
          <span className="text-sm font-medium">{application.skillVideoUrl ? "Video sent · record a new one" : "Record or choose a video"}</span>
          <span className="text-xs">Up to a minute, under 60 MB</span>
        </button>
      )}
      {preview ? (
        <Button variant="ghost" size="sm" className="mt-2 self-start" onClick={() => input.current?.click()}>
          Choose a different video
        </Button>
      ) : null}
      <input
        ref={input}
        type="file"
        accept="video/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          pick(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      <StepFooter
        label={file ? "Send video" : application.skillVideoUrl ? "Continue" : "Choose a video first"}
        pendingLabel="Uploading…"
        pending={pending}
        disabled={!file && !application.skillVideoUrl}
        error={error}
        onSubmit={() =>
          save(async () => {
            if (!file) return { step: "skill_video", videoUrl: application.skillVideoUrl };
            const result = await upload(file);
            return result.ok ? { step: "skill_video", videoUrl: result.data } : result.error.message;
          })
        }
        secondary={
          <Button variant="ghost" size="lg" className="w-full" disabled={pending} onClick={() => save({ step: "skill_video" })}>
            Skip for now
          </Button>
        }
      />
    </>
  );
}
