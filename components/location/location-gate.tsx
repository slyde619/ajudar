"use client";

import { ArrowRight, LoaderCircle, LocateFixed, Map as MapIcon, Navigation, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLgaBoundaries } from "@/hooks/use-lga-boundaries";
import { useLocation } from "@/hooks/use-location";
import type { Coordinates, JobSite, Lga, LgaCode } from "@/lib/types";
import { useLocationStore } from "@/stores/location";
import { LANDMARK_MIN, LandmarkField } from "./landmark-field";
import { LgaPicker } from "./lga-picker";
import { LocationChip } from "./location-chip";
import { PinAdjustSheet, type PinConfirmation } from "./pin-adjust-sheet";

type Step = "start" | "manual" | "landmark" | "done";
type Notice = "denied" | "unavailable" | null;

interface Draft {
  lgaCode: LgaCode;
  coords: Coordinates;
  pinConfirmed: boolean;
  accuracyM?: number;
}

interface LocationGateProps {
  lgas: Lga[];
  continueHref: string;
}

/**
 * §10.5 location gate. Permission is asked only when the user taps "Use my
 * location" — never on load. Denied and unavailable fall through to manual
 * entry, which is first-class, not a consolation prize.
 */
export function LocationGate({ lgas, continueHref }: LocationGateProps) {
  const { location, hydrated } = useLocation();
  const boundariesState = useLgaBoundaries();
  const boundaries = boundariesState.status === "ready" ? boundariesState.boundaries : null;
  const store = useLocationStore.getState;

  const [step, setStep] = useState<Step | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [landmark, setLandmark] = useState("");
  const [pin, setPin] = useState<{ open: boolean; center: Coordinates } | null>(null);

  const settledSite =
    location.status === "confirmed" || location.status === "manual" || location.status === "stale"
      ? location.site
      : null;
  const currentStep: Step = step ?? (settledSite ? "done" : "start");
  const busy = location.status === "requesting" || (location.status === "resolving" && !pin?.open);

  const lgaName = (code: LgaCode) => {
    const lga = lgas.find((entry) => entry.code === code);
    return lga ? `${lga.name}, ${lga.stateName}` : code;
  };

  function locate() {
    setNotice(null);
    if (!("geolocation" in navigator)) {
      store().markUnavailable();
      setNotice("unavailable");
      setStep("manual");
      return;
    }
    store().request();
    navigator.geolocation.getCurrentPosition(
      (position) => {
        store().resolve();
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setDraft((previous) => ({
          lgaCode: previous?.lgaCode ?? "",
          coords,
          pinConfirmed: false,
          accuracyM: Math.round(position.coords.accuracy),
        }));
        setPin({ open: true, center: coords });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          store().deny();
          setNotice("denied");
        } else {
          store().markUnavailable();
          setNotice("unavailable");
        }
        setStep("manual");
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    );
  }

  function onPinConfirm({ coords, lga }: PinConfirmation) {
    setDraft((previous) => ({
      lgaCode: lga.lgaCode,
      coords,
      pinConfirmed: true,
      accuracyM: previous?.accuracyM,
    }));
    setPin(null);
    setStep(currentStep === "manual" ? "manual" : "landmark");
  }

  function onPinClose(open: boolean) {
    if (open) return;
    setPin(null);
    if (location.status === "resolving") store().reset();
  }

  function chooseLga(code: LgaCode) {
    const lga = lgas.find((entry) => entry.code === code);
    if (!lga) return;
    setDraft({ lgaCode: code, coords: lga.centroid, pinConfirmed: false });
  }

  function save(mode: "confirmed" | "manual") {
    if (!draft?.lgaCode) return;
    const site: JobSite = {
      lat: draft.coords.lat,
      lng: draft.coords.lng,
      lgaCode: draft.lgaCode,
      landmark: landmark.trim(),
      pinConfirmedByUser: draft.pinConfirmed,
      accuracyM: draft.accuracyM,
    };
    if (mode === "confirmed") store().confirm(site);
    else store().setManual(site);
    setStep("done");
  }

  const landmarkOk = landmark.trim().length >= LANDMARK_MIN;

  return (
    <div className="flex flex-1 flex-col">
      {!hydrated ? (
        <div className="space-y-3" aria-busy="true">
          <div className="h-8 w-3/4 animate-pulse rounded-md bg-surface-sunken" />
          <div className="h-24 animate-pulse rounded-xl bg-surface-sunken" />
        </div>
      ) : currentStep === "start" ? (
        <section className="flex flex-1 flex-col">
          <h1 className="text-[28px] leading-tight font-semibold tracking-tight text-ink-950">
            Where do you need help?
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-500">
            We only show artisans who can actually reach you.
          </p>

          <ul className="mt-8 space-y-4">
            <li className="flex gap-3.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-ink-700">
                <ShieldCheck className="size-4" aria-hidden />
              </span>
              <p className="text-sm leading-relaxed text-ink-700">
                <span className="font-semibold text-ink-950">Your LGA decides who can come.</span>{" "}
                Artisans outside it never see your job.
              </p>
            </li>
            <li className="flex gap-3.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-ink-700">
                <Navigation className="size-4" aria-hidden />
              </span>
              <p className="text-sm leading-relaxed text-ink-700">
                <span className="font-semibold text-ink-950">Your landmark tells them where to stop.</span>{" "}
                The blue gate, not the street number.
              </p>
            </li>
          </ul>

          <div className="mt-auto flex flex-col gap-2 pt-10">
            <Button size="lg" onClick={locate} disabled={busy} className="h-13 rounded-xl text-base font-semibold">
              {busy ? (
                <>
                  <LoaderCircle className="size-5 animate-spin" aria-hidden />
                  Locating you…
                </>
              ) : (
                <>
                  <LocateFixed className="size-5" aria-hidden />
                  Use my location
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setStep("manual")}
              className="h-12 rounded-xl text-[15px] text-ink-700"
            >
              {busy ? "Enter it manually instead" : "Choose my area"}
            </Button>
          </div>
        </section>
      ) : currentStep === "manual" ? (
        <section className="flex flex-1 flex-col">
          <h1 className="text-[26px] leading-tight font-semibold tracking-tight text-ink-950">
            Pick your area
          </h1>
          {notice ? (
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              {notice === "denied"
                ? "Location is off — that's fine. Choose your LGA and tell us the landmark."
                : "We couldn't get a location fix. Check your connection, or choose your LGA below."}
            </p>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              Lagos and Abia are live. More states are coming.
            </p>
          )}

          <div className="mt-6">
            <LgaPicker lgas={lgas} value={draft?.lgaCode || null} onChange={chooseLga} />
          </div>

          {draft?.lgaCode ? (
            <>
              <button
                type="button"
                onClick={() => setPin({ open: true, center: draft.coords })}
                className="mt-3 flex min-h-11 items-center gap-2 self-start rounded-lg px-1 text-sm font-medium text-ink-700 underline decoration-line-300 underline-offset-4 hover:text-ink-950"
              >
                <MapIcon className="size-4" aria-hidden />
                {draft.pinConfirmed ? "Pin placed · adjust" : "Drop an exact pin (optional)"}
              </button>
              <LandmarkField id="landmark-manual" value={landmark} onChange={setLandmark} className="mt-5" />
            </>
          ) : null}

          <div className="mt-auto flex flex-col gap-2 pt-8">
            <Button
              size="lg"
              disabled={!draft?.lgaCode || !landmarkOk}
              onClick={() => save("manual")}
              className="h-13 rounded-xl text-base font-semibold"
            >
              Save location
            </Button>
            <Button variant="ghost" onClick={() => setStep("start")} className="h-11 rounded-xl text-ink-500">
              Back
            </Button>
          </div>
        </section>
      ) : currentStep === "landmark" && draft ? (
        <section className="flex flex-1 flex-col">
          <h1 className="text-[26px] leading-tight font-semibold tracking-tight text-ink-950">
            How will they find you?
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-500">
            Pins get artisans close. Landmarks get them to the gate.
          </p>
          <LocationChip area={lgaName(draft.lgaCode)} precision="pin" className="mt-6" />
          <LandmarkField id="landmark-gps" value={landmark} onChange={setLandmark} className="mt-5" />
          <div className="mt-auto flex flex-col gap-2 pt-8">
            <Button
              size="lg"
              disabled={!landmarkOk}
              onClick={() => save("confirmed")}
              className="h-13 rounded-xl text-base font-semibold"
            >
              Save location
            </Button>
          </div>
        </section>
      ) : settledSite ? (
        <section className="flex flex-1 flex-col">
          <h1 className="text-[26px] leading-tight font-semibold tracking-tight text-ink-950">
            You&apos;re set.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-500">
            We&apos;ll match you with verified artisans who serve this area.
          </p>
          <LocationChip
            area={lgaName(settledSite.lgaCode)}
            landmark={settledSite.landmark}
            precision={
              location.status === "stale"
                ? "stale"
                : settledSite.pinConfirmedByUser
                  ? "pin"
                  : "approximate"
            }
            className="mt-6"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDraft(null);
                  setLandmark("");
                  setStep("start");
                }}
                className="h-9 rounded-lg text-ink-700"
              >
                Change
              </Button>
            }
          />
          <div className="mt-auto pt-8">
            <Button asChild size="lg" className="h-13 w-full rounded-xl text-base font-semibold">
              <Link href={continueHref}>
                Continue
                <ArrowRight className="size-5" aria-hidden />
              </Link>
            </Button>
          </div>
        </section>
      ) : null}

      {pin ? (
        <PinAdjustSheet
          open={pin.open}
          onOpenChange={onPinClose}
          initialCenter={pin.center}
          boundaries={boundaries}
          lgas={lgas}
          onConfirm={onPinConfirm}
          onChooseManually={() => {
            setPin(null);
            if (location.status === "resolving") store().reset();
            setStep("manual");
          }}
        />
      ) : null}
    </div>
  );
}
