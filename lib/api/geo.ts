import type { Lga, LgaBoundary, Result } from "@/lib/types";
import { getLgaByCode, lgas as mockLgas } from "@/lib/mock/lgas";
import { apiRequest, fail, isMockMode, ok } from "./client";
import { endpoints } from "./endpoints";

export async function listLgas(): Promise<Result<Lga[]>> {
  if (isMockMode()) return ok(mockLgas);
  return apiRequest<Lga[]>(endpoints.geo.lgas);
}

export async function getLga(code: string): Promise<Result<Lga>> {
  if (isMockMode()) {
    const lga = getLgaByCode(code);
    return lga ? ok(lga) : fail("LGA_NOT_FOUND", `No LGA with code ${code}.`);
  }
  return apiRequest<Lga>(endpoints.geo.lga(code));
}

export async function fetchLgaBoundaries(): Promise<Result<LgaBoundary[]>> {
  try {
    const response = await fetch(endpoints.geo.boundaries);
    if (!response.ok) {
      return fail(`HTTP_${response.status}`, "Could not load LGA boundaries.");
    }
    const body = (await response.json()) as { boundaries: LgaBoundary[] };
    return ok(body.boundaries);
  } catch (error) {
    return fail(
      "NETWORK_ERROR",
      error instanceof Error ? error.message : "Could not load LGA boundaries.",
    );
  }
}
