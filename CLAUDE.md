# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

CIRS (Cyber Incident Response Simulator) is a semester-long class project (course itelect4). It is a fictional, educational incident-response training app — not a real security tool. It never scans systems, executes commands, analyzes real malware, or touches real organizational data. All incidents, evidence, and users in the app must be fictional.

The project is built module-by-module across a semester, each module graded (GT1, GT2, ...). The current state is intentionally incomplete: only Module 1 (TypeScript domain model) and part of Module 2 (React components) exist. Do not "complete" future modules' work unprompted — see `docs/semester-roadmap.md` for what belongs in which module, and only pull forward a deferred feature if explicitly asked.

## Documentation map

Each doc has one canonical purpose; update the matching doc when its kind of decision changes:

- `docs/product-spec.md` — roles, permission matrix, entities, lifecycle rules, workflows, MVP/deferred scope. Source of truth for *what the product does*.
- `docs/semester-roadmap.md` — per-module deliverables, completion checks, decision gates, and deadlines. Source of truth for *what's in scope right now*.
- `docs/technical-reference.md` — target architecture, REST/socket contracts, validation rules, testing strategy, deployment gate. Source of truth for *how it should be built*, including things not yet implemented.

Read `docs/product-spec.md` and `docs/technical-reference.md` before implementing any domain rule or API contract — they are more authoritative than inferring behavior from the current (partial) code.

## Commands

```bash
npm install         # install dependencies
npm run dev          # start Vite dev server
npx tsc --noEmit     # type-check only
npm run lint          # eslint
npm run build        # tsc -b && vite build (type-check + production build)
npm run preview       # preview the production build
```

There is no test runner configured yet (Vitest arrives in Module 6). There is no backend yet (Express/API arrives in Module 3) — everything today is a static frontend with in-memory mock data.

## Architecture

### Current state (Modules 1–2, in progress)

- `src/types/index.ts` is the canonical domain model: enums (`UserRole`, `IncidentSeverity`, `IncidentStatus`, `ResponseActionStatus`, `EvidenceType`), core entities (`User`, `Incident`, `ResponseAction`, `Evidence`), API envelope types (`ApiResponse<T>`, `PaginatedResponse<T>`, `ApiError`), and derived utility types built with `Pick`/`Omit`/`Partial`/`Record` (e.g. `CreateIncidentInput`, `IncidentSummary`, `PublicUser`, `EntityById<T>`). Any change to roles, entities, or lifecycle values must stay in sync with `docs/product-spec.md`.
- `src/domain/rules.ts` holds the only source of truth for lifecycle transitions: `validIncidentTransitions`, `validResponseActionTransitions`, and the guard functions `canTransitionIncident`, `canTransitionResponseAction`, `canResolveIncident`. When a server exists, it must call this same logic rather than reimplementing transitions in route handlers.
- `src/App.tsx` currently renders local mock data (no routing, no API, no store yet) through three presentational card components: `IncidentCard`, `EvidenceCard`, `ResponseActionCard` (`src/components/`). Data flows down via props; child→parent communication is via callback props (`onOpen`, `onReveal`, `onAdvance`), not shared mutable state — see `docs/component-guide.md` for the full walkthrough if modifying these.
- `src/gt1/` (`types.ts`, `sample.ts`) is a deliberately isolated JavaScript-to-TypeScript conversion exercise from the GT1 checklist. It is unrelated to the CIRS domain model and must stay separate — don't merge its types (`GTUser`, etc.) into `src/types/index.ts`.
- `src/index.ts` is a scratch/demo script exercising the domain types and rules functions (`getById`, transition checks) via `console.log`; it is not part of the app runtime.

### Target architecture (later modules — not yet implemented)

Described in full in `docs/technical-reference.md`. Key shape to keep in mind when scaffolding new work:

- React client talks to an Express REST API (authoritative reads/mutations) and a Socket.io server (broadcasts results of successful mutations only — sockets are never the source of truth; reconnection must trigger a REST refetch).
- Server owns authentication, authorization, and lifecycle enforcement (reusing `src/domain/rules.ts`); the frontend hides/disables unauthorized controls but the API is what actually enforces them.
- Planned frontend state split: TanStack Query for all server state (incidents, actions, evidence, reports, current user), Zustand only for genuinely client-only state (layout, temporary role switching), component state/React Hook Form for local/unsaved input. Do not copy query data into Zustand, and don't let Zustand become a shadow server-state store.
- Gemini is used server-side only (never exposed to the browser) to generate versioned, immutable `IncidentReport` records for resolved incidents — generation is all-or-nothing (a failed call must leave existing reports untouched), and reports are never edited in place.
- Real-time scope is deliberately narrow: only `action:created` and `action:status-changed` events in an `incident:{incidentId}` room. Presence, notifications, live evidence reveal, and chat are explicitly deferred — don't add them speculatively.
- Deployment/hosting topology (Vercel WebSocket support vs. split hosting) is an open decision gate recorded in `docs/technical-reference.md`; don't assume a specific host without checking there first.

## Project-specific conventions

- TypeScript enums are used intentionally for the domain model. Because TS 6's `erasableSyntaxOnly` rejects enums, that option was removed from `tsconfig.app.json` — don't re-add it without converting enums to another pattern first.
- Strict unused-code checks are on (`noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`); keep code compiling cleanly under these rather than suppressing them.
- Prefer type-only imports (`import type { ... }`) for types/interfaces, consistent with `verbatimModuleSyntax`.
- Status/severity must always be shown with a text label, never color alone (accessibility requirement from the product spec).
