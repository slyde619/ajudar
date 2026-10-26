export type ApiMode = "mock" | "live";

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

export interface Paginated<T> {
  items: T[];
  nextCursor?: string;
  total?: number;
}
