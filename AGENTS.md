# AGENTS.md

This file is the canonical repository guidance for Codex and other coding agents. `CLAUDE.md` points here so the project has one complete instruction source.

## What this is

CIRS (Cyber Incident Response Simulator) is a fictional, educational incident-response training app for IT Elective 4. It never scans systems, executes commands, analyzes real malware, or touches real organizational data. Incidents, evidence, users, credentials, and organizations must remain fictional.

The project is built module by module across a semester. Implement only the current graded task or explicitly requested work. Do not pull future modules forward speculatively.

## Canonical project documents

- `docs/product-spec.md` — product behavior, roles, entities, lifecycle rules, workflows, and scope.
- `docs/semester-roadmap.md` — module deliverables, gates, and current scope.
- `docs/technical-reference.md` — target architecture, contracts, validation, testing, and deployment guidance.
- `docs/project-journal/` — ignored personal course material, reviewers, and GT explanations. It is not a product source of truth.

Read the product spec and technical reference before changing a domain rule or API contract. Read the roadmap before deciding whether a feature belongs in the current module. If code, history, and documentation disagree, report the conflict and explain the chosen source of truth.

## Current state

The repository has completed GT1, GT2, and GT3 Parts 1 and 2. The current application is a React frontend with routing, protected routes, persisted Zustand client state, TanStack Query, and a json-server-backed local API. Session 8 / GT3 Part 3 adds validated forms and owned UI components.

- `src/types/index.ts` is the canonical CIRS domain model. It contains the enums, `User`, `Incident`, `ResponseAction`, `Evidence`, API envelope types, and utility-derived inputs and views.
- `src/domain/rules.ts` is the source of truth for incident and response-action transitions and resolution eligibility. Future server code must reuse these rules.
- `src/App.tsx` contains the route table. `src/components/Layout.tsx` owns shared navigation and `<Outlet />`; `src/components/ProtectedRoute.tsx` guards authenticated routes.
- `src/pages/` contains the dashboard, incident detail, evidence, actions, login, and not-found pages. `ActionsPage.tsx` owns the Session 8 response-action form and its Zod-backed local validation.
- `src/store/authStore.ts` contains the current client-only fake authentication token. There is no real backend or session yet.
- `db.json` and `src/api/client.ts` provide the fictional local API data and transport boundary. The old `src/data/mockData.ts` and `src/hooks/useMockResource.ts` were removed in GT3 Part 2.
- `src/gt1/` is the isolated JavaScript-to-TypeScript exercise and must remain separate from the CIRS domain model.

The target architecture later adds an Express REST API, persistent storage, TanStack Query for server state, Zustand only for client-only state, Socket.io for the narrow response-action events, and server-side Gemini report generation. Do not implement those future pieces unless the assigned session requires them.

## Course and CIRS workflow

Session material under `docs/project-journal/modules/` is the assignment source. Follow its required concepts, commands, and checklist, but translate its teaching example into CIRS entities and workflows. Keep the implementation small and coherent with the product spec.

Before implementation, report the intended changes, exact dependency commands, unresolved choices with a recommended option and alternatives, verification plan, documentation outputs, and deferred Git actions. Wait for explicit approval before editing files, installing packages, or creating a branch.

After implementation, verify the work and report the GT checklist. Do not commit, push, or open a pull request until the user explicitly approves the verified result. Ask for separate approval immediately before merging or tagging.

If mock people or user records are needed, use fictional Avengers names such as Tony Stark, Steve Rogers, or Bruce Banner. Never use real credentials or secrets.

## Target architecture guardrails

- REST is the authoritative source for server reads and mutations.
- Socket.io broadcasts only successful response-action creation and status mutations in an `incident:{incidentId}` room. Reconnection refetches REST state.
- The server owns authentication, authorization, and lifecycle enforcement. Frontend controls are convenience behavior only.
- TanStack Query owns server state. Zustand owns only client-only state such as layout, temporary role switching, and UI preferences. Do not copy query data into Zustand.
- Gemini keys stay server-side. Reports are fictional, immutable versions and never automated decisions.
- Evidence reveal, presence, notifications, chat, timers, drag-and-drop boards, analytics, and other deferred features must not be added early.

## Project conventions

- TypeScript enums are intentional. Do not restore `erasableSyntaxOnly` while enums remain in the domain model.
- Keep strict unused-code checks clean. Do not suppress errors to make a build pass.
- Use `import type` for type-only imports because `verbatimModuleSyntax` is enabled.
- Status and severity must always have text labels; color is supplementary.
- Preserve unrelated working-tree changes and never rewrite past commits.
- Use `apply_patch` for local text edits. Avoid destructive commands unless the user explicitly requests them.

## Commands

```bash
npm install
npm run dev
npx tsc --noEmit
npm run lint
npm run build
```

There is no committed test runner or backend at the current starting point. When a session adds a service or test runner, follow that session's exact setup commands and update this file only when the repository's current state changes.
