# Cyber Incident Response Simulator

The Cyber Incident Response Simulator (CIRS) is a semester-long web application for practicing fictional cybersecurity incident-response workflows. Responders inspect evidence and complete response actions while an incident commander creates scenarios, coordinates the team, controls the incident lifecycle, and generates post-incident reports.

CIRS is an educational simulation. It does not scan systems, execute commands, analyze real malware, or use real organizational data.

## Course fit

| Requirement | CIRS implementation |
|---|---|
| At least three core entities | `User`, `Incident`, `ResponseAction`, and `Evidence` |
| Entity with a two-to-three-value role field | `User.role`: responder or incident commander |
| Multi-step status lifecycle | Incident and response-action status enums |
| List-to-detail routing | Incident list to incident command room |
| Real-time feature | Response-action creation and status updates |
| Generative-text feature | Versioned Gemini post-incident reports |
| Solo-buildable | Fictional data, limited workflows, no payments or external security integrations |

## Semester MVP

The final application must let a user:

1. Register, sign in, and access role-appropriate controls.
2. View incidents and open an incident command room.
3. Create and reveal fictional evidence.
4. Propose, approve, assign, start, reject, and complete response actions.
5. Move an incident through valid lifecycle stages.
6. Receive response-action updates without refreshing.
7. Resolve an incident after every non-rejected action is completed.
8. Generate and revisit versioned AI-assisted post-incident reports.
9. Use the deployed application successfully.

## Documentation

- [Product specification](docs/product-spec.md): users, entities, rules, workflows, and scope
- [Semester roadmap](docs/semester-roadmap.md): module deliverables, deadlines, and decision gates
- [Technical reference](docs/technical-reference.md): architecture, API, real-time, AI, testing, and deployment

Each topic has one canonical home. Update the relevant document when a product rule, milestone, or technical contract changes.

## Current milestone

Module 1 establishes the TypeScript domain model used by later graded tasks. Canonical shared types live in `src/types/index.ts`, reusable lifecycle rules live in `src/domain/rules.ts`, and the original conversion exercise remains isolated under `src/gt1`.

## Current commands

Install dependencies:

```bash
npm install
```

Type-check the project:

```bash
npx tsc --noEmit
```

Run the TypeScript examples:

```bash
npx ts-node src/index.ts
```

The React, API, testing, and deployment commands will be added in the modules that introduce those tools.
