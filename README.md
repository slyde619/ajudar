# ajudar

A two-sided artisan marketplace for Nigeria. Verified supply, structured bargaining, escrow-backed payment, and live job tracking. Lagos and Abia are the pilot states.

**`project.md` is the source of truth.** Every decision lives there. If a change isn't specified, ask before inventing it.

## Stack

Next.js 16 App Router · TypeScript strict · Tailwind CSS 4.3 · shadcn/ui (Radix, owned components) · Framer Motion · Zustand · Lucide · vaul · MapLibre GL (OpenFreeMap tiles, no key).

Node `>=24.22.1` (patched v24 LTS), pnpm `10.32.1`.

## Commands

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm typecheck  # tsc --noEmit
pnpm lint
pnpm build
pnpm start
```

Copy `.env.example` to `.env.local` when you need live APIs:

```bash
NEXT_PUBLIC_API_MODE=mock   # mock | live
NEXT_PUBLIC_API_BASE_URL=   # empty = same origin
```

## Architecture

The binding contract is `project.md` §20. In short:

```
app/                     route composition only
components/ui/           shadcn primitives + token-level variants
components/shell/        dock, sidebar, header, transitions, scroll restore
components/<domain>/     pure presentational components (props in, JSX out)
components/map/          the ONLY place map libraries may be imported
stores/                  client cross-screen state (nav, job, location)
lib/types/               the data contract
lib/api/                 the data boundary (mock | live)
lib/mock/                mock adapters — imported only by lib/api
lib/utils/               pure helpers
```

Rules that matter day to day:

- Components are pure functions of props/state. Side effects live in shell components or hooks.
- Screens import `lib/api/`, never `lib/mock/`.
- All domain types change in `lib/types/index.ts` first.
- Money is integer kobo. Format in `lib/utils/money.ts` when that phase lands.
- No `tailwind.config.ts`; theme tokens live in `app/globals.css` `@theme`.
- Yellow is a fill, never text or a status colour.
- No z-index outside the layer stack (§9.1).

## Routes

| Route | Status |
| --- | --- |
| `/` | Landing placeholder (Phase 6 builds the narrative) |
| `/signup` | Structural placeholder (auth spec pending) |
| `/onboarding` | Location gate — GPS → pin confirm → landmark, or manual LGA picker |
| `/dashboard` | Customer home, lorem content |
| `/jobs` | Customer jobs list (mock API) |
| `/jobs/[id]` | Live tracking — map + route + ETA sheet (try `job_001`) |
| `/messages` | Customer messages, lorem content |
| `/profile` | Customer profile, lorem content |

Entry flow: landing → signup → onboarding → dashboard.

## Current phase

Phases 1–3 are built: foundation, shell, and core interaction (map canvas, live tracking shell, location gate). Phase 4 (booking loop) is next.

Phone check for Phase 3: open `/onboarding` and `/jobs/job_001` from the Network URL. Geolocation on a phone needs HTTPS — use `pnpm dev --experimental-https` or a tunnel when testing "Use my location".

## Fonts

DM Sans is vendored in `app/fonts/dm-sans` (SIL OFL) and Geist Mono ships through the `geist` package. Nothing fetches from Google Fonts at build time.

## References

Design references, reuse order, and the pure-component checklist are in `project.md` §21 and §20.
