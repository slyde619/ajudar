"use client";

import { ScanFace } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { identitySessionAction } from "@/app/_actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IdentityCaptureSheet } from "@/components/verification/identity-capture-sheet";
import { VerificationChecklist } from "@/components/verification/verification-checklist";
import type { ArtisanApplication } from "@/lib/types";
import { StepFooter } from "./step-footer";
import { StepHeading } from "./step-heading";
import { useStepSave } from "./use-step-save";

/** Onboarding step for NIN, ID photo and live selfie through Smile ID. */
export function IdentityStep({ application }: { application: ArtisanApplication }) {
  const [nin, setNin] = useState("");
  const [open, setOpen] = useState(false);
  const { save, error, pending } = useStepSave();
  const check = application.checks.identity;
  const done = check.status !== "not_started" && check.status !== "rejected";

  if (done) {
    return (
      <>
        <StepHeading title="Identity sent" detail="Smile ID is matching your selfie to your NIN record. You can carry on while it does." />
        <VerificationChecklist
          items={[{ key: "identity", label: `NIN ending ${application.identity.ninLast4 ?? "····"}`, status: check.status, note: check.note }]}
        />
        <div className="sticky bottom-0 -mx-5 mt-auto px-5 pt-6 pb-safe">
          <Button size="cta" className="w-full" nativeButton={false} render={<Link href="/artisan/onboarding?step=guarantor" />}>
            Continue
          </Button>
          <div className="pb-4" />
        </div>
      </>
    );
  }

  return (
    <>
      <StepHeading
        title="Prove it's you"
        detail="Your NIN, a photo of your ID, and a selfie. It takes about a minute, and customers see a NIN-verified badge."
      />
      <label htmlFor="nin" className="text-sm font-semibold text-ink-950">
        NIN
      </label>
      <Input
        id="nin"
        value={nin}
        inputMode="numeric"
        autoComplete="off"
        onChange={(event) => setNin(event.target.value.replace(/\D/g, "").slice(0, 11))}
        placeholder="11 digits"
        className="mt-2 h-12 rounded-xl bg-surface-raised px-4 font-mono tracking-widest"
      />
      <p className="mt-1.5 text-xs text-ink-500">Dial *346# from the phone number linked to it if you don&apos;t have it to hand.</p>

      {check.status === "rejected" ? (
        <p role="alert" className="mt-4 rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger-600">
          {check.note ?? "That didn't match. Try again in better light."}
        </p>
      ) : null}

      <div className="mt-6 flex gap-3 rounded-xl bg-surface-sunken p-4">
        <ScanFace className="mt-0.5 size-5 shrink-0 text-ink-700" aria-hidden />
        <p className="text-sm leading-relaxed text-ink-700">
          Smile ID checks the selfie is a live person and matches the photo on your NIN record. ajudar never sees your full NIN after this.
        </p>
      </div>

      <StepFooter
        label="Take ID photo and selfie"
        pending={pending}
        disabled={nin.length !== 11}
        error={error}
        onSubmit={() => setOpen(true)}
      />
      <IdentityCaptureSheet
        open={open}
        onOpenChange={setOpen}
        title="ID and selfie"
        description="Two photos. Smile ID compares them with your NIN record."
        requestSession={identitySessionAction}
        onComplete={async (providerRef) => {
          setOpen(false);
          save({ step: "identity", nin, providerRef });
          return null;
        }}
      />
    </>
  );
}
