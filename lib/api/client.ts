import type { ApiError, ApiMode, Result } from "@/lib/types";

/**
 * The one switch that flips the whole app between mock and live data.
 * Screens only ever import from lib/api/ — never from lib/mock/.
 */
export function getApiMode(): ApiMode {
  return process.env.NEXT_PUBLIC_API_MODE === "live" ? "live" : "mock";
}

export function isMockMode(): boolean {
  return getApiMode() === "mock";
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(
  /\/+$/,
  "",
);

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function fail(
  code: string,
  message: string,
  details?: Record<string, unknown>,
): { ok: false; error: ApiError } {
  return { ok: false, error: { code, message, details } };
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as Partial<ApiError>;
    if (typeof body.message === "string" && body.message.length > 0) {
      return body.message;
    }
  } catch {
    // The body was not the expected ApiError JSON; fall through.
  }
  return response.statusText || `Request failed with status ${response.status}.`;
}

/**
 * Live-mode transport. The backend contract is Result<T> (§7), so a live
 * response is returned as-is rather than unwrapped here.
 */
export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<Result<T>> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      return fail(
        `HTTP_${response.status}`,
        await readErrorMessage(response),
        { status: response.status, path },
      );
    }

    const text = await response.text();
    if (text.length === 0) {
      return ok(undefined as T);
    }

    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      return fail(
        "INVALID_RESPONSE",
        "Expected JSON from the API but received unparseable content.",
        { path },
      );
    }

    if (
      typeof payload !== "object" ||
      payload === null ||
      typeof (payload as { ok?: unknown }).ok !== "boolean"
    ) {
      return fail(
        "INVALID_RESPONSE",
        "Expected the API to return a Result<T> envelope ({ ok, data | error }).",
        { path },
      );
    }

    return payload as Result<T>;
  } catch (error) {
    return fail(
      "NETWORK_ERROR",
      error instanceof Error ? error.message : "Network request failed.",
      { path },
    );
  }
}
