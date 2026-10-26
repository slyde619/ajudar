import { connection } from "next/server";
import type {
  ApplicationStepInput,
  ArtisanApplication,
  IdentityCheckSession,
  Result,
  UploadTicket,
} from "@/lib/types";
import {
  createMockIdentitySession,
  createMockUploadTicket,
  getMockApplication,
  resetMockApplication,
  saveMockApplicationStep,
  submitMockApplication,
} from "@/lib/mock/onboarding";
import { apiRequest, fail, isMockMode, ok } from "./client";
import { endpoints } from "./endpoints";

function post<T>(path: string, body?: unknown): Promise<Result<T>> {
  return apiRequest<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) });
}

export async function getApplication(applicantId: string): Promise<Result<ArtisanApplication>> {
  if (isMockMode()) {
    await connection();
    return ok(structuredClone(getMockApplication(applicantId, Date.now())));
  }
  return apiRequest<ArtisanApplication>(endpoints.onboarding.application);
}

export async function saveApplicationStep(applicantId: string, input: ApplicationStepInput): Promise<Result<ArtisanApplication>> {
  if (isMockMode()) {
    const result = saveMockApplicationStep(applicantId, input, Date.now());
    return result.ok ? ok(structuredClone(result.data)) : result;
  }
  return post<ArtisanApplication>(endpoints.onboarding.step, input);
}

export async function submitApplication(applicantId: string): Promise<Result<ArtisanApplication>> {
  if (isMockMode()) {
    const result = submitMockApplication(applicantId, Date.now());
    return result.ok ? ok(structuredClone(result.data)) : result;
  }
  return post<ArtisanApplication>(endpoints.onboarding.submit);
}

export async function createIdentitySession(applicantId: string): Promise<Result<IdentityCheckSession>> {
  if (isMockMode()) return ok(createMockIdentitySession(applicantId));
  return post<IdentityCheckSession>(endpoints.onboarding.identitySession);
}

const MAX_UPLOAD_BYTES: Record<"image" | "video" | "document", number> = {
  image: 10 * 1024 * 1024,
  video: 60 * 1024 * 1024,
  document: 10 * 1024 * 1024,
};

export async function createUploadTicket(
  applicantId: string,
  file: { name: string; type: string; size: number },
): Promise<Result<UploadTicket>> {
  const kind = file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "image" : "document";
  if (file.size > MAX_UPLOAD_BYTES[kind]) {
    return fail("FILE_TOO_LARGE", kind === "video" ? "Keep the video under 60 MB — about a minute." : "That file is over 10 MB.");
  }
  if (isMockMode()) return ok(createMockUploadTicket(applicantId, file.name));
  return post<UploadTicket>(endpoints.onboarding.upload, { name: file.name, type: file.type, size: file.size });
}

export async function resetApplication(applicantId: string): Promise<Result<ArtisanApplication>> {
  if (!isMockMode()) return fail("NOT_AVAILABLE", "Not available.");
  return ok(structuredClone(resetMockApplication(applicantId, Date.now())));
}

export { CONSENT_VERSION } from "@/lib/mock/onboarding";
