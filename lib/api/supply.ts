import { connection } from "next/server";
import type {
  IdentityCheckSession,
  ArtisanEarnings,
  ArtisanOfferInput,
  Coordinates,
  FeedRequest,
  JobRequest,
  Result,
  WorkStage,
} from "@/lib/types";
import {
  artisanRespondMock,
  getMockEarnings,
  getMockFeedRequest,
  getMockSpokenCode,
  listMockFeed,
  markMockArrived,
  passMockFeed,
  respondMockFeed,
  setMockOnline,
  setMockWorkStage,
} from "@/lib/mock/supply";
import { createMockIdentitySession } from "@/lib/mock/onboarding";
import { apiRequest, fail, isMockMode, ok } from "./client";
import { endpoints } from "./endpoints";

function post<T>(path: string, body?: unknown): Promise<Result<T>> {
  return apiRequest<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) });
}

function forArtisan(result: Result<JobRequest>): Result<JobRequest> {
  if (!result.ok) return result;
  const copy = structuredClone(result.data);
  delete copy.completionCode;
  return ok(copy);
}

export async function listFeed(artisanId: string): Promise<Result<FeedRequest[]>> {
  if (isMockMode()) {
    await connection();
    return ok(structuredClone(listMockFeed(artisanId, Date.now())));
  }
  return apiRequest<FeedRequest[]>(endpoints.artisan.feed);
}

export async function getFeedRequest(artisanId: string, jobId: string): Promise<Result<FeedRequest>> {
  if (isMockMode()) {
    await connection();
    const request = getMockFeedRequest(jobId, artisanId, Date.now());
    return request ? ok(structuredClone(request)) : fail("REQUEST_GONE", "This request is no longer open.");
  }
  const result = await listFeed(artisanId);
  if (!result.ok) return result;
  const request = result.data.find((entry) => entry.jobId === jobId);
  return request ? ok(request) : fail("REQUEST_GONE", "This request is no longer open.");
}

export async function respondToRequest(artisanId: string, jobId: string, input: ArtisanOfferInput): Promise<Result<FeedRequest>> {
  if (isMockMode()) return respondMockFeed(jobId, artisanId, input, Date.now());
  return post<FeedRequest>(endpoints.artisan.respond(jobId), input);
}

export async function passRequest(artisanId: string, jobId: string): Promise<Result<null>> {
  if (isMockMode()) return passMockFeed(jobId, artisanId, Date.now());
  return post<null>(endpoints.artisan.pass(jobId));
}

export async function respondToCounter(artisanId: string, jobId: string, input: ArtisanOfferInput): Promise<Result<JobRequest>> {
  if (isMockMode()) return forArtisan(artisanRespondMock(jobId, artisanId, input, Date.now()));
  return forArtisan(await post<JobRequest>(endpoints.artisan.counter(jobId), input));
}

export async function createArrivalSelfieSession(artisanId: string, jobId: string): Promise<Result<IdentityCheckSession>> {
  if (isMockMode()) return ok(createMockIdentitySession(`${artisanId}_${jobId}`, "smartselfie_authentication"));
  return post<IdentityCheckSession>(endpoints.artisan.arrivalSelfie(jobId));
}

export async function markArrived(artisanId: string, jobId: string, selfieRef: string): Promise<Result<JobRequest>> {
  if (isMockMode()) return forArtisan(markMockArrived(jobId, artisanId, selfieRef, Date.now()));
  return forArtisan(await post<JobRequest>(endpoints.artisan.arrive(jobId), { selfieRef }));
}

export async function setWorkStage(artisanId: string, jobId: string, stage: WorkStage): Promise<Result<JobRequest>> {
  if (isMockMode()) return forArtisan(setMockWorkStage(jobId, artisanId, stage, Date.now()));
  return forArtisan(await post<JobRequest>(endpoints.artisan.workStage(jobId), { stage }));
}

export async function setAvailability(artisanId: string, online: boolean): Promise<Result<boolean>> {
  if (isMockMode()) return setMockOnline(artisanId, online);
  return post<boolean>(endpoints.artisan.availability, { online });
}

export async function reportLocation(coords: Coordinates, accuracyM?: number): Promise<Result<null>> {
  if (isMockMode()) return ok(null);
  return apiRequest<null>(endpoints.artisan.location, {
    method: "PATCH",
    body: JSON.stringify({ coords, accuracyM, at: new Date().toISOString() }),
  });
}

export async function getEarnings(artisanId: string): Promise<Result<ArtisanEarnings>> {
  if (isMockMode()) {
    await connection();
    return ok(getMockEarnings(artisanId, Date.now()));
  }
  return apiRequest<ArtisanEarnings>(endpoints.artisan.earnings);
}

export async function getDemoSpokenCode(jobId: string): Promise<string | null> {
  if (!isMockMode()) return null;
  await connection();
  return getMockSpokenCode(jobId, Date.now()) ?? null;
}
