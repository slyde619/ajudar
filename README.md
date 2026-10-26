<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/header/graph.svg?title=ajudar&subtitle=Verified+artisans%2C+fair+prices%2C+escrow-backed+jobs+across+Nigeria&align=left&theme=zinc&mode=dark" />
    <img alt="ajudar: verified artisans, fair prices, escrow-backed jobs across Nigeria" src="https://shieldcn.dev/header/graph.svg?title=ajudar&subtitle=Verified+artisans%2C+fair+prices%2C+escrow-backed+jobs+across+Nigeria&align=left&theme=zinc&mode=light" />
  </picture>
</p>

<p align="center">
  <a href="https://nextjs.org">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/Next.js-16.svg?logo=nextdotjs&variant=secondary&mode=dark" />
      <img alt="Next.js 16" src="https://shieldcn.dev/badge/Next.js-16.svg?logo=nextdotjs&variant=secondary&mode=light" />
    </picture>
  </a>
  <a href="https://react.dev">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/React-19.svg?logo=react&variant=secondary&mode=dark" />
      <img alt="React 19" src="https://shieldcn.dev/badge/React-19.svg?logo=react&variant=secondary&mode=light" />
    </picture>
  </a>
  <a href="https://www.typescriptlang.org">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/TypeScript-strict.svg?logo=typescript&variant=secondary&mode=dark" />
      <img alt="TypeScript strict" src="https://shieldcn.dev/badge/TypeScript-strict.svg?logo=typescript&variant=secondary&mode=light" />
    </picture>
  </a>
  <a href="https://tailwindcss.com">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/Tailwind_CSS-4.svg?logo=tailwindcss&variant=secondary&mode=dark" />
      <img alt="Tailwind CSS 4" src="https://shieldcn.dev/badge/Tailwind_CSS-4.svg?logo=tailwindcss&variant=secondary&mode=light" />
    </picture>
  </a>
  <a href="https://maplibre.org">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/MapLibre_GL-6.svg?logo=maplibre&variant=secondary&mode=dark" />
      <img alt="MapLibre GL 6" src="https://shieldcn.dev/badge/MapLibre_GL-6.svg?logo=maplibre&variant=secondary&mode=light" />
    </picture>
  </a>
</p>

A two-sided artisan marketplace for Nigeria: verified artisans, structured price negotiation, escrow-backed payment and live job tracking. Rivers and Akwa Ibom are the launch states.

This repo is the customer and artisan web app. It runs entirely on mock data by default, so every flow can be tried end to end without a backend.

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui on Base UI · Framer Motion · Zustand · Lucide · MapLibre GL with OpenFreeMap tiles.

Node `>=24.22.1`, pnpm `10.34.9`.

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

Other scripts:

```bash
pnpm typecheck  # tsc --noEmit
pnpm lint
pnpm build
pnpm start
```

Copy `.env.example` to `.env.local` to change the data source:

```bash
NEXT_PUBLIC_API_MODE=mock   # mock | live
NEXT_PUBLIC_API_BASE_URL=   # empty = same origin
```

Geolocation on a phone needs HTTPS. Use `pnpm dev --experimental-https` or a tunnel when testing "Use my location" from another device.

## Demo identities

There is no sign-in yet. In mock mode you act as:

- **Adaeze**, the customer, on the customer routes
- **Chinedu**, the artisan, on `/artisan`
- a fresh applicant on `/artisan/onboarding`

Open the customer and artisan sides in two tabs to play both halves of a job. Other customers and artisans are simulated on timers.

## Routes

**Marketing and entry**

| Route         | What it does                                                            |
| ------------- | ----------------------------------------------------------------------- |
| `/`           | Landing page                                                            |
| `/signup`     | Choose the customer or artisan side                                     |
| `/onboarding` | Location gate: GPS, pin confirmation and landmark, or manual LGA picker |

**Customer**

| Route              | What it does                                                             |
| ------------------ | ------------------------------------------------------------------------ |
| `/dashboard`       | Home with service categories                                             |
| `/booking/new`     | Describe a job: text, photos, location, urgency                          |
| `/booking/[jobId]` | Estimate, artisan offers, negotiation and escrow payment                 |
| `/artisans/[id]`   | Artisan profile and verification signals                                 |
| `/jobs`            | Active and past jobs                                                     |
| `/jobs/[id]`       | Live tracking, on-arrival check, work status, completion code and rating |
| `/messages`        | Message threads                                                          |
| `/profile`         | Customer profile                                                         |

**Artisan**

| Route                        | What it does                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------- |
| `/artisan`                   | Request feed over a coverage map, with an availability toggle                                     |
| `/artisan/requests/[jobId]`  | Accept, counter or pass on a request                                                              |
| `/artisan/jobs`              | Active and past jobs                                                                              |
| `/artisan/jobs/[id]`         | Negotiation, navigation, arrival selfie, work stages and code entry                               |
| `/artisan/earnings`          | Held, released and paid-out earnings                                                              |
| `/artisan/onboarding`        | Step-by-step verification: profile, identity, guarantor, portfolio, skill video, address, consent |
| `/artisan/onboarding/status` | Application review status                                                                         |
| `/artisan/profile`           | Artisan profile                                                                                   |

## Project structure

```
app/                     routes (marketing, auth, customer, artisan) and Server Actions
components/ui/           shadcn primitives with token-level variants
components/shell/        app shell, dock, header, transitions, realtime refresh
components/<domain>/     presentational components (booking, negotiation, supply, …)
components/map/          map canvas, overlays and shells; the only place map libraries are imported
hooks/                   client hooks (location, tracking, realtime, uploads, …)
stores/                  client state shared across screens
lib/types/               domain types
lib/api/                 data access, switching between mock and live
lib/mock/                in-memory mock backend, used only by lib/api
lib/utils/               pure helpers (money, time, geo, verification)
```

Conventions:

- Components are pure: props in, JSX out. Side effects live in shell components or hooks.
- Screens import from `lib/api/`, never `lib/mock/`.
- Money is integer kobo. Format it with `lib/utils/money.ts`.
- Theme tokens live in `app/globals.css` under `@theme`; there is no `tailwind.config.ts`.

## Attribution

- DM Sans is vendored in `app/fonts/dm-sans` under the SIL Open Font License. Geist Mono ships through the `geist` package.
- LGA boundaries in `public/geo/lga-boundaries.json` come from geoBoundaries (gbOpen NGA ADM2, GRID3), CC BY 4.0.
- Map tiles are served by OpenFreeMap. Map data is © OpenStreetMap contributors.
