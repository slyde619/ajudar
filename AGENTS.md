## ajudar project rules

Read `project.md` before changing code. It is the source of truth. `§20 Frontend architecture contract`, `§17 Review protocol`, and `§18 Non-negotiables` are binding. If a decision is not specified, ask — never improvise silently.

- Components are pure: props in, JSX out. No fetch, stores, router hooks, timers, or `window` access during render.
- Side effects belong in `components/shell/` or named hooks, with cleanup.
- `"use client"` only for state, effects, refs, or browser APIs. Server components are the default.
- Screens import from `lib/api/`, never `lib/mock/`.
- Domain types change in `lib/types/index.ts` first.
- `components/ui/` holds shadcn primitives we own. Extend with variants; do not fork or hand-roll duplicates.
- No `tailwind.config.ts`. Tokens live in `app/globals.css` via `@theme`.
- Yellow is a fill with `ink-950` on top. Never yellow text or a yellow status colour.
- Map libraries only in `components/map/map-canvas.tsx`.
- Money is integer kobo. No floating point.
- No z-index outside the §9.1 layer stack. No five-tab dock.
- Reuse order: existing component → shadcn primitive → Tailwind composition → new primitive (justify in §17).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
