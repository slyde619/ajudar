## ajudar project rules

These rules are binding. If a decision isn't covered here or in the code, ask before inventing one.

### Architecture

- Components are pure: props in, JSX out. No fetch, stores, router hooks, timers, or `window` access during render.
- Side effects belong in `components/shell/` or named hooks, with cleanup.
- `"use client"` only for state, effects, refs, or browser APIs. Server components are the default.
- Screens import from `lib/api/`, never `lib/mock/`.
- Domain types change in `lib/types/index.ts` first.
- `components/ui/` holds shadcn primitives we own. Extend with variants; do not fork or hand-roll duplicates.
- Map libraries only in `components/map/map-canvas.tsx`.
- Money is integer kobo. No floating point.
- Reuse order: existing component → shadcn primitive → Tailwind composition → new primitive. A new primitive needs a one-line justification.

### Styling

- No `tailwind.config.ts`. Tokens live in `app/globals.css` via `@theme`.
- Yellow is a fill with `ink-950` on top. Never yellow text or a yellow status colour. Success is green, danger red, warning amber.
- Prefer a built-in utility, then a token plus utilities, then `@utility` (when variants are needed). Raw CSS only with a reason.
- No arbitrary values that duplicate a token (`bg-[#FCFF52]` instead of `bg-celo-500`).
- No dark mode yet; keep token names so it can be added later.
- Check styling changes across states (hover, focus, disabled), breakpoints, reduced motion, long content, and empty, loading and error states.

### Layer stack

Never assign a z-index outside these layers:

```
z-0    map canvas (fixed, full viewport)
z-10   screen content (scrollable)
z-20   bottom sheet
z-30   docked tab bar
z-40   full-screen flow (booking, onboarding; dock hidden)
z-50   toasts and dialogs
```

The dock has four tabs at most.

### Product rules

Stop and ask before breaking any of these:

- Verification is a strip of individual signals, never a single `verified` boolean.
- Negotiation is bounded: a price band, at most three rounds, a reason for every counter.
- The system sets the opening price; the customer never does.
- No live map during the working phase, only the status card.
- Geolocation is foreground-only, and the UI says so honestly.
- Discovery on mobile is list-first, not a map.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
