<!--
Sync Impact Report

- Version change: none → 1.0.0
- Modified principles: (newly defined) Single Responsibility (SRP); Open/Closed (OCP); Test-First (NON-NEGOTIABLE); Integration & Contract Testing; Observability & Versioning
- Added sections: "Technology & Compliance Requirements" and "Development Workflow & Quality Gates"
- Removed sections: none
- Templates requiring review: 
	- /home/andres/Proyectos/glasify-lite/.specify/templates/plan-template.md ⚠ pending review (Constitution Check)
	- /home/andres/Proyectos/glasify-lite/.specify/templates/spec-template.md ⚠ pending review (mandatory sections alignment)
	- /home/andres/Proyectos/glasify-lite/.specify/templates/tasks-template.md ⚠ pending review (task categories alignment)
- Follow-up TODOs:
	- TODO(RATIFICATION_DATE): original ratification date unknown — please confirm historic adoption date if different from initial commit date.
-->

# Glasify Lite Constitution

## Core Principles

### Single Responsibility (SRP)
All modules, components and services MUST have a single, well-defined responsibility. Code that mixes concerns (UI + business logic + data access) MUST be refactored into smaller units. Rationale: SRP improves testability, maintainability and enables safe incremental refactors.

Rules:
- Modules and components MUST not exceed one primary responsibility.
- Tests and docs MUST exist for each public abstraction.

### Open/Closed (OCP)
Public interfaces and modules MUST be open for extension and closed for modification. Design for extension (plugins, strategies, adapters) rather than editing existing behavior when adding features.

Rules:
- New features SHOULD prefer extension patterns (hooks, procedures, adapters) over direct modifications of stable modules.
- Backwards-incompatible API changes MUST follow versioning rules in Governance and include migration guidance.

### Test-First (NON-NEGOTIABLE)
Testing is mandatory. For new features the test-first workflow MUST be followed: write failing tests → implement minimal code to pass → refactor. Tests define acceptable behavior and are treated as first-class artifacts.

Rules:
- All feature PRs MUST include tests covering happy paths and critical edge cases.
- Unit tests MUST run in CI; integration and contract tests MUST be added for cross-service changes.

### Integration & Contract Testing
End-to-end integrations and contract tests are required where components cross service or boundary lines (e.g., server → DB, server → external API, client → server contracts). Contracts MUST be explicit and versioned.

Rules:
- Any change to shared schemas or API contracts MUST include contract tests and migration notes.
- Integration tests MUST run in CI for changes touching integration points.

### Observability & Versioning
All services and libraries MUST emit structured logs and follow the project's semantic versioning policy. Error handling, monitoring hooks and clear audit logs are required to diagnose issues in production.

Rules:
- Use structured logging and a consistent correlation id pattern for traces.
- Versioning MUST follow MAJOR.MINOR.PATCH semantic rules; breaking changes require MAJOR bumps and a migration plan.

## Technology & Compliance Requirements

This project enforces a constrained stack to preserve compatibility and developer expectations. Mandatory technologies and conventions:

- Next.js 15 (App Router) with React Server Components
- TypeScript (strict), Zod 4 for validation, tRPC for typed APIs, Prisma for DB access
- React Hook Form + @hookform/resolvers for form validation
- shadcn/ui + Radix for UI primitives; TailwindCSS for styling
- Formatting and linting: Biome/Ultracite conventions (pnpm scripts provided)
- UI text MUST be Spanish (es‑LA); code, comments and commits MUST be English

Security & compliance:

- All inputs MUST be validated server-side (Zod schemas in tRPC .input())
- Secrets MUST never be committed; use environment variables and @t3-oss/env-nextjs
- Sensitive operations MUST include authorization checks and audit logging

## Development Workflow & Quality Gates

Process requirements for all contributions:

- Pull requests MUST pass the following CI gates before merge:
	- Type check (tsc --noEmit)
	- Formatting / lint fix (pnpm ultra) or ultracite checks
	- Unit tests (vitest) and relevant integration/contract tests
	- E2E tests for changes affecting user flows (Playwright)
- Code review: at least one approver with maintainer or reviewer role; large or risky changes SHOULD request two reviewers.
- Commit messages MUST follow conventional commits; PR descriptions MUST reference affected principles and migration notes when applicable.

Quality expectations:

- Performance budgets and accessibility checks SHOULD be included for UI changes.
- Changes that affect public or internal APIs MUST include examples, changelog entry and migration instructions.

## Conventions
- Brach naming: always in English.
- Commit messages: Use conventional commits format `/commitlint.config.js`.
- Comments and JSDoc: English only.
- UI text and feedback messages: Spanish (es-LA) only.

## Governance

The constitution is the authoritative guide for engineering decisions. Amendments follow this procedure:

1. Propose a change via a documented PR against `.specify/memory/constitution.md` with a clear rationale and impact analysis.
2. Provide a migration plan for any breaking changes and a test plan that demonstrates compliance.
3. Require approval by at least two maintainers (or one maintainer + one architect) for MAJOR changes; MINOR/PATCH changes require one maintainer review.
4. Once merged, update the Sync Impact Report and notify the team in the project communication channel.

Compliance:

- All PRs MUST reference the constitution when changes touch governance principles.
- Failure to comply with MUST-level rules constitutes a blocking issue for merge until resolved.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): original adoption date unknown | **Last Amended**: 2025-10-09