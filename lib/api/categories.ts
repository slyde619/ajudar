import type { Result, TradeCategory } from "@/lib/types";
import {
  categories as mockCategories,
  getCategoryById,
} from "@/lib/mock/categories";
import { apiRequest, fail, isMockMode, ok } from "./client";
import { endpoints } from "./endpoints";

export async function listCategories(): Promise<Result<TradeCategory[]>> {
  if (isMockMode()) return ok(mockCategories);
  return apiRequest<TradeCategory[]>(endpoints.categories.list);
}

export async function getCategory(id: string): Promise<Result<TradeCategory>> {
  if (isMockMode()) {
    const category = getCategoryById(id);
    return category
      ? ok(category)
      : fail("CATEGORY_NOT_FOUND", `No category with id ${id}.`);
  }
  return apiRequest<TradeCategory>(endpoints.categories.detail(id));
}
