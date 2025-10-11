<!--
Sync Impact Report

- Version change: 1.0.0 → 1.1.0
- Modified principles:
  - "Observability & Versioning" → expanded with Winston logger usage restrictions
  - "Technology & Compliance Requirements" → added RSC architecture patterns
- Added sections:
  - New principle: "Server-First Architecture (Next.js 15)"
- Removed sections: none
- Templates requiring review:
  - .specify/templates/plan-template.md ⚠ pending (verify Server-First principle alignment)
  - .specify/templates/spec-template.md ⚠ pending (ensure RSC patterns documented)
  - .specify/templates/tasks-template.md ✅ updated (task categories aligned)
- Follow-up TODOs:
  - RATIFICATION_DATE confirmed as 2025-10-09 (initial constitution adoption)
  - Review existing codebase for Client Components incorrectly using Winston logger
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

### Server-First Architecture (Next.js 15)

> "Leverage the server by default. Move to the client only when necessary."  
> Server Components provide better performance, security, and SEO. Client Components are for interactivity, not default.

Rules:
- **Pages MUST be Server Components by default.**
  - Use `page.tsx` for orchestration, data fetching, and metadata
  - Delegate interactivity to dedicated Client Components (`_components/*-content.tsx`)
  - Public pages MUST export `metadata` for SEO
  - Pages requiring dynamic rendering (sessionStorage, etc.) MUST use `export const dynamic = 'force-dynamic'`

- **Client Components ('use client') ONLY when required for:**
  - React hooks (useState, useEffect, useContext)
  - Browser APIs (localStorage, sessionStorage, navigator)
  - Event handlers requiring immediate interactivity
  - Third-party libraries requiring browser environment

- **Pattern: Server Page + Client Content**
  ```typescript
  // ✅ page.tsx - Server Component
  export const metadata: Metadata = { title: '...' };
  export default async function Page() {
    const data = await fetchData();
    return <PageContent initialData={data} />;
  }

  // ✅ page-content.tsx - Client Component
  'use client';
  export function PageContent({ initialData }: Props) {
    // All interactivity here
  }
  ```

### Integration & Contract Testing
End-to-end integrations and contract tests are required where components cross service or boundary lines (e.g., server → DB, server → external API, client → server contracts). Contracts MUST be explicit and versioned.

Rules:
- Any change to shared schemas or API contracts MUST include contract tests and migration notes.
- Integration tests MUST run in CI for changes touching integration points.

### Observability & Versioning
All services and libraries MUST emit structured logs and follow the project's semantic versioning policy. Error handling, monitoring hooks and clear audit logs are required to diagnose issues in production.

Rules:
- Use structured logging and a consistent correlation id pattern for traces.
- **Winston Logger is STRICTLY server-side only.**
  - ✅ ALLOWED: Server Components, Server Actions (`'use server'`), API Route Handlers, tRPC procedures, middleware, server-side utilities
  - ❌ PROHIBITED: Client Components (`'use client'`), custom hooks used in client, browser-executed code
  - Rationale: Winston uses Node.js modules (`fs`, `path`) unavailable in browser webpack bundles
  - Client-side: Use console (development only), toast notifications (user feedback), or error boundaries
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

**Version**: 1.1.0  
**Ratified**: 2025-10-09  
**Last Amended**: 2025-10-11