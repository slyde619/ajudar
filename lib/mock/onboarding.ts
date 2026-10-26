import type {
  ApplicationStepInput,
  ArtisanApplication,
  CheckStatus,
  IdentityCheckSession,
  OnboardingCheck,
  Result,
  UploadTicket,
} from "@/lib/types";
import { getLgaByCode } from "./lgas";
import { applicantTopic, emit, mockStore, nextId } from "./store";

export const MOCK_APPLICANT_ID = "app_demo";

const IDENTITY_VERDICT_MS = 10_000;
export const CONSENT_VERSION = "2026-10-ndpa-1";

const REQUIRED: OnboardingCheck[] = ["profile", "identity", "guarantor", "portfolio", "address", "consent"];
export const MIN_PORTFOLIO_PHOTOS = 3;

const ok = <T>(data: T): Result<T> => ({ ok: true, data });
const fail = (code: string, message: string): Result<never> => ({ ok: false, error: { code, message } });
const iso = (ms: number) => new Date(ms).toISOString();

function blank(id: string, nowMs: number): ArtisanApplication {
  const check = { status: "not_started" as CheckStatus };
  return {
    id,
    profile: { displayName: "", phone: "+2348030000000", specialties: [] },
    identity: {},
    guarantor: {},
    portfolio: { photoUrls: [] },
    address: { servedLgaCodes: [] },
    consent: {},
    checks: {
      profile: { ...check },
      identity: { ...check },
      guarantor: { ...check },
      portfolio: { ...check },
      skill_video: { ...check },
      address: { ...check },
      consent: { ...check },
    },
    updatedAt: iso(nowMs),
  };
}

function setCheck(app: ArtisanApplication, check: OnboardingCheck, status: CheckStatus, nowMs: number, note?: string): void {
  app.checks[check] = { status, note, updatedAt: iso(nowMs) };
  emit({ type: "verification.updated", topic: applicantTopic(app.id), applicantId: app.id, check, status }, nowMs);
}

export function advanceMockApplication(id: string, nowMs: number): ArtisanApplication | undefined {
  const store = mockStore();
  const app = store.applications.get(id);
  if (!app) return undefined;
  const due = store.verdictAtMs.get(id);
  if (due !== undefined && nowMs >= due) {
    store.verdictAtMs.delete(id);
    setCheck(app, "identity", "verified", due, "NIN matched to a live selfie");
    app.updatedAt = iso(due);
  }
  return app;
}

export function getMockApplication(id: string, nowMs: number): ArtisanApplication {
  const store = mockStore();
  if (!store.applications.has(id)) store.applications.set(id, blank(id, nowMs));
  return advanceMockApplication(id, nowMs) as ArtisanApplication;
}

function isPhone(value: string): boolean {
  return /^\+?234\d{10}$|^0\d{10}$/.test(value.replace(/\s+/g, ""));
}

export function saveMockApplicationStep(id: string, input: ApplicationStepInput, nowMs: number): Result<ArtisanApplication> {
  const app = getMockApplication(id, nowMs);
  if (app.submittedAt) return fail("ALREADY_SUBMITTED", "Your application is already with us.");

  switch (input.step) {
    case "profile": {
      if (input.displayName.trim().split(/\s+/).length < 2) return fail("NAME_REQUIRED", "Use your first and last name, as on your NIN.");
      if (!Number.isInteger(input.yearsExperience) || input.yearsExperience < 0 || input.yearsExperience > 60) {
        return fail("INVALID_YEARS", "Years of experience should be a whole number.");
      }
      app.profile = {
        ...app.profile,
        displayName: input.displayName.trim(),
        trade: input.trade,
        yearsExperience: input.yearsExperience,
        specialties: input.specialties.map((entry) => entry.trim()).filter(Boolean).slice(0, 5),
      };
      setCheck(app, "profile", "verified", nowMs);
      break;
    }
    case "identity": {
      const nin = input.nin.replace(/\s+/g, "");
      if (!/^\d{11}$/.test(nin)) return fail("INVALID_NIN", "Your NIN is 11 digits.");
      if (!input.providerRef) return fail("CAPTURE_REQUIRED", "Finish the ID and selfie capture first.");
      app.identity = { ninLast4: nin.slice(-4), providerRef: input.providerRef };
      setCheck(app, "identity", "in_progress", nowMs, "Smile ID is matching your selfie to your NIN");
      mockStore().verdictAtMs.set(id, nowMs + IDENTITY_VERDICT_MS);
      break;
    }
    case "guarantor": {
      if (input.name.trim().split(/\s+/).length < 2) return fail("NAME_REQUIRED", "Give your guarantor's full name.");
      if (!isPhone(input.phone)) return fail("INVALID_PHONE", "Use a Nigerian number, like 0803 123 4567.");
      if (input.phone.replace(/\D/g, "").endsWith(app.profile.phone.replace(/\D/g, "").slice(-10))) {
        return fail("SELF_GUARANTOR", "Your guarantor can't be you.");
      }
      if (input.relationship.trim().length < 3) return fail("RELATIONSHIP_REQUIRED", "Say how you know them.");
      app.guarantor = { name: input.name.trim(), phone: input.phone.trim(), relationship: input.relationship.trim() };
      setCheck(app, "guarantor", "pending_review", nowMs, "We'll call them to confirm — usually within 2 days");
      break;
    }
    case "portfolio": {
      if (input.photoUrls.length < MIN_PORTFOLIO_PHOTOS) {
        return fail("TOO_FEW_PHOTOS", `Add at least ${MIN_PORTFOLIO_PHOTOS} photos of jobs you've done.`);
      }
      if (!input.certificateUrl && !(input.apprenticeshipYears && input.apprenticeshipYears > 0)) {
        return fail("PROOF_REQUIRED", "Add a trade certificate, or tell us how long you apprenticed.");
      }
      app.portfolio = {
        photoUrls: input.photoUrls.slice(0, 12),
        certificateUrl: input.certificateUrl,
        apprenticeshipYears: input.apprenticeshipYears,
      };
      setCheck(app, "portfolio", "pending_review", nowMs, "We check each photo is a real job site");
      break;
    }
    case "skill_video": {
      app.skillVideoUrl = input.videoUrl;
      if (input.videoUrl) setCheck(app, "skill_video", "pending_review", nowMs, "Optional — it helps you get picked");
      else setCheck(app, "skill_video", "not_started", nowMs, "Skipped. You can add one later");
      break;
    }
    case "address": {
      if (input.baseAddress.trim().length < 8) return fail("ADDRESS_REQUIRED", "Describe where you're based so we can confirm it.");
      if (!getLgaByCode(input.homeLgaCode)) return fail("OUTSIDE_PILOT", "We're not in that LGA yet.");
      const served = [...new Set([input.homeLgaCode, ...input.servedLgaCodes])].filter((code) => getLgaByCode(code));
      if (served.length > 6) return fail("TOO_MANY_LGAS", "Pick up to 6 LGAs you can reach quickly.");
      app.address = { baseAddress: input.baseAddress.trim(), homeLgaCode: input.homeLgaCode, servedLgaCodes: served };
      setCheck(app, "address", "pending_review", nowMs, "We confirm your base on a short call");
      break;
    }
    case "consent": {
      if (input.version !== CONSENT_VERSION) return fail("STALE_CONSENT", "The terms changed. Read them again.");
      app.consent = { acceptedAt: iso(nowMs), version: input.version };
      setCheck(app, "consent", "verified", nowMs);
      break;
    }
  }
  app.updatedAt = iso(nowMs);
  return ok(app);
}

export function submitMockApplication(id: string, nowMs: number): Result<ArtisanApplication> {
  const app = getMockApplication(id, nowMs);
  if (app.submittedAt) return ok(app);
  const missing = REQUIRED.filter((check) => app.checks[check].status === "not_started");
  if (missing.length > 0) return fail("INCOMPLETE", "Finish every required step first.");
  app.submittedAt = iso(nowMs);
  app.updatedAt = iso(nowMs);
  return ok(app);
}

export function resetMockApplication(id: string, nowMs: number): ArtisanApplication {
  const store = mockStore();
  store.verdictAtMs.delete(id);
  const app = blank(id, nowMs);
  store.applications.set(id, app);
  return app;
}

export function createMockIdentitySession(
  id: string,
  product: IdentityCheckSession["product"] = "biometric_kyc",
): IdentityCheckSession {
  return {
    provider: "smile_id",
    partnerId: "mock-partner",
    token: `mock_${nextId("tok")}`,
    jobId: `${id}_${nextId(product === "biometric_kyc" ? "kyc" : "auth")}`,
    environment: "sandbox",
    product,
  };
}

export function createMockUploadTicket(id: string, fileName: string): UploadTicket {
  const safe = fileName.replace(/[^\w.-]+/g, "_").slice(-60);
  return { uploadUrl: null, fileUrl: `mock://uploads/${id}/${nextId("up")}-${safe}` };
}
