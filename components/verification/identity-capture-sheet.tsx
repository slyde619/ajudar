"use client";

import { Camera, IdCard, LoaderCircle, RotateCcw, ScanFace } from "lucide-react";
import { useEffect, useEffectEvent, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { usePhotoPreviews } from "@/hooks/use-photo-previews";
import type { IdentityCheckSession, Result } from "@/lib/types";
import { cn } from "@/lib/utils";

type Shot = "document" | "selfie";

interface IdentityCaptureSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  requestSession: () => Promise<Result<IdentityCheckSession>>;
  onComplete: (providerRef: string) => Promise<string | null>;
}

const SHOT_COPY: Record<Shot, { label: string; hint: string; icon: typeof Camera; facing: "user" | "environment" }> = {
  document: {
    label: "Your NIN slip or ID card",
    hint: "Flat on a table, all four corners in frame, no glare.",
    icon: IdCard,
    facing: "environment",
  },
  selfie: {
    label: "A selfie",
    hint: "Good light, no cap or sunglasses, look straight at the camera.",
    icon: ScanFace,
    facing: "user",
  },
};

/** Sheet that captures identity photos through Smile ID, or the device camera in mock mode. */
export function IdentityCaptureSheet({ open, onOpenChange, title, description, requestSession, onComplete }: IdentityCaptureSheetProps) {
  const [session, setSession] = useState<IdentityCheckSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const documentShot = usePhotoPreviews(1);
  const selfieShot = usePhotoPreviews(1);
  const inputs = useRef<Record<Shot, HTMLInputElement | null>>({ document: null, selfie: null });

  const startSession = useEffectEvent(() => requestSession());

  useEffect(() => {
    if (!open || session) return;
    let cancelled = false;
    void startSession().then((result) => {
      if (cancelled) return;
      if (result.ok) setSession(result.data);
      else setError(result.error.message);
    });
    return () => {
      cancelled = true;
    };
  }, [open, session]);

  const shots: Shot[] = session?.product === "biometric_kyc" ? ["document", "selfie"] : ["selfie"];
  const previews: Record<Shot, typeof selfieShot> = { document: documentShot, selfie: selfieShot };
  const ready = session !== null && shots.every((shot) => previews[shot].photos.length > 0);
  const standIn = session?.token.startsWith("mock_") ?? false;

  function submit() {
    if (!session) return;
    setError(null);
    if (!standIn) {
      setError("Smile ID isn't connected yet. Add the partner keys to turn on live capture.");
      return;
    }
    startTransition(async () => {
      const failure = await onComplete(session.jobId);
      if (failure) setError(failure);
    });
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92dvh] rounded-t-2xl border-0 bg-surface-raised">
        <div className="no-scrollbar overflow-y-auto px-5 pt-2 pb-safe">
          <DrawerTitle className="text-lg font-semibold tracking-tight text-ink-950">{title}</DrawerTitle>
          <DrawerDescription className="mt-1 text-sm leading-relaxed text-ink-500">{description}</DrawerDescription>
          {standIn ? (
            <p className="mt-3 rounded-lg border border-dashed border-line-300 px-3 py-2 font-mono text-[10px] tracking-widest text-ink-500 uppercase">
              Demo stand-in for Smile ID · nothing leaves this phone
            </p>
          ) : null}

          {session === null && error === null ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-ink-500" role="status">
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
              Starting a secure session…
            </div>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {shots.map((shot) => {
                const copy = SHOT_COPY[shot];
                const photo = previews[shot].photos[0];
                const Icon = copy.icon;
                return (
                  <li key={shot}>
                    <button
                      type="button"
                      onClick={() => inputs.current[shot]?.click()}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl p-3 text-left ring-1 transition-colors",
                        photo ? "bg-surface-raised ring-line-200" : "bg-surface-sunken ring-transparent hover:ring-line-300",
                      )}
                    >
                      <span className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ink-950 text-celo-500">
                        {photo ? (
                          // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
                          <img src={photo.url} alt="" className="size-full object-cover" />
                        ) : (
                          <Icon className="size-6" aria-hidden />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-semibold text-ink-950">{copy.label}</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-ink-500">{copy.hint}</span>
                      </span>
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-raised text-ink-700 ring-1 ring-line-200">
                        {photo ? <RotateCcw className="size-4" aria-label="Retake" /> : <Camera className="size-4" aria-label="Take photo" />}
                      </span>
                    </button>
                    <input
                      ref={(node) => {
                        inputs.current[shot] = node;
                      }}
                      type="file"
                      accept="image/*"
                      capture={copy.facing}
                      className="sr-only"
                      tabIndex={-1}
                      aria-hidden
                      onChange={(event) => {
                        previews[shot].replace(event.target.files);
                        event.target.value = "";
                      }}
                    />
                  </li>
                );
              })}
            </ul>
          )}

          {error ? (
            <p role="alert" className="mt-3 rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger-600">
              {error}
            </p>
          ) : null}

          <div className="mt-5 pb-4">
            <Button size="cta" className="w-full" disabled={!ready || pending} onClick={submit}>
              {pending ? (
                <>
                  <LoaderCircle className="animate-spin" aria-hidden />
                  Sending to Smile ID…
                </>
              ) : (
                "Send for checking"
              )}
            </Button>
            <p className="mt-2 text-center text-xs text-ink-400">Checked by Smile ID against your NIN record.</p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
