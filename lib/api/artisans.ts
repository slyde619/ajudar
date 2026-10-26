import { connection } from "next/server";
import type {
  ArtisanProfile,
  Paginated,
  Result,
  Review,
  Trade,
} from "@/lib/types";
import { listMockReviews } from "@/lib/mock/booking";
import {
  getMockArtisanById,
  listMockArtisans,
} from "@/lib/mock/artisans";
import { apiRequest, fail, isMockMode, ok } from "./client";
import { endpoints } from "./endpoints";

export interface ArtisanFilters {
  lgaCode?: string;
  trade?: Trade;
  onlineOnly?: boolean;
  includeSuspended?: boolean;
}

function toQuery(filters: ArtisanFilters): string {
  const params = new URLSearchParams();
  if (filters.lgaCode) params.set("lgaCode", filters.lgaCode);
  if (filters.trade) params.set("trade", filters.trade);
  if (filters.onlineOnly) params.set("onlineOnly", "true");
  if (filters.includeSuspended) params.set("includeSuspended", "true");
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function listArtisans(
  filters: ArtisanFilters = {},
): Promise<Result<Paginated<ArtisanProfile>>> {
  if (isMockMode()) {
    const items = listMockArtisans(filters);
    return ok({ items, total: items.length });
  }

  return apiRequest<Paginated<ArtisanProfile>>(
    `${endpoints.artisans.list}${toQuery(filters)}`,
  );
}

export async function getArtisan(
  id: string,
): Promise<Result<ArtisanProfile>> {
  if (isMockMode()) {
    const artisan = getMockArtisanById(id);
    return artisan
      ? ok(artisan)
      : fail("ARTISAN_NOT_FOUND", `No artisan found with id ${id}.`);
  }

  return apiRequest<ArtisanProfile>(endpoints.artisans.detail(id));
}

export async function listArtisanReviews(id: string): Promise<Result<Review[]>> {
  if (isMockMode()) {
    await connection();
    return ok(structuredClone(listMockReviews(id)));
  }
  return apiRequest<Review[]>(endpoints.artisans.reviews(id));
}
