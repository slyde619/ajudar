import type { Id, Result } from "@/lib/types";
import { MOCK_ARTISAN_ID, MOCK_CUSTOMER_ID } from "@/lib/mock/booking";
import { MOCK_APPLICANT_ID } from "@/lib/mock/onboarding";
import { apiRequest, isMockMode, ok } from "./client";
import { endpoints } from "./endpoints";

export interface Session {
  customerId: Id | null;
  artisanId: Id | null;
  applicantId: Id | null;
}

export async function getSession(): Promise<Result<Session>> {
  if (isMockMode()) {
    return ok({ customerId: MOCK_CUSTOMER_ID, artisanId: MOCK_ARTISAN_ID, applicantId: MOCK_APPLICANT_ID });
  }
  return apiRequest<Session>(endpoints.me);
}
