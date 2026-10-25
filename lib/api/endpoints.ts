/**
 * Provisional REST paths, centralized so backend confirmation (§19.4) is a
 * one-file change. Do not inline URLs anywhere else.
 *
 * Live responses are expected to use the Result<T> envelope from §7.
 */
export const endpoints = {
  artisans: {
    list: "/artisans",
    detail: (id: string) => `/artisans/${encodeURIComponent(id)}`,
  },
  jobs: {
    list: "/jobs",
    detail: (id: string) => `/jobs/${encodeURIComponent(id)}`,
    create: "/jobs",
    tracking: (id: string) => `/jobs/${encodeURIComponent(id)}/tracking`,
  },
  categories: {
    list: "/categories",
    detail: (id: string) => `/categories/${encodeURIComponent(id)}`,
  },
  geo: {
    lgas: "/lgas",
    lga: (code: string) => `/lgas/${encodeURIComponent(code)}`,
    /** Static asset served by the frontend in both modes. */
    boundaries: "/geo/lga-boundaries.json",
  },
} as const;
