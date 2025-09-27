<!--
Sync Impact Report:
- Version change: 1.0.0 → 1.1.0
- Modified sections:
  - Development Workflow → added explicit Testing & Tooling guidance (Vitest + Playwright)
  - Code Quality Gates → clarified CI requirements and coverage threshold rule
- Added sections:
  - Testing & Tooling (unit, contract, integration, E2E)
- Templates requiring updates:
  ✅ .specify/templates/plan-template.md – Constitution Check aligns (no changes required)
  ✅ .specify/templates/spec-template.md – Requirements format compatible
  ✅ .specify/templates/tasks-template.md – Already supports test-first and parallel markers
- Follow-up TODOs: None
-->

# Glasify Constitution

## Core Principles

### I. Business Logic Integrity (NON-NEGOTIABLE)
All pricing calculations MUST be implemented as pure functions with comprehensive unit tests. The `priceItem` function must be deterministic, reproducible, and return identical results for identical inputs. Price calculation logic must match the mathematical specifications in the PRD exactly: `P_item = basePrice + costPerMmWidth × deltaWidth + costPerMmHeight × deltaHeight + accessoryPrice + servicePrice`. No business logic shortcuts or approximations are permitted.

**Rationale**: Pricing accuracy is critical for customer trust and business viability. Mathematical errors in quotations directly impact revenue and customer relationships.

### II. Type Safety First  
All data models, API contracts, and business calculations MUST use TypeScript with strict mode enabled. No `any` types permitted in production code. All database schemas must use Prisma with proper type generation. Input validation using Zod is mandatory for all API endpoints and user inputs.

**Rationale**: Type safety prevents runtime errors in critical business logic and ensures API contract compliance between client and server.

### III. Validation at Boundaries
All user inputs MUST be validated at system boundaries (API endpoints, form submissions, database operations). Dimension ranges, model compatibility, and business rule compliance must be enforced server-side regardless of client-side validation. Validation errors must provide clear, user-friendly messages in Spanish (es-LA).

**Rationale**: Server-side validation ensures data integrity and prevents invalid business states, even with compromised or modified clients.

### IV. Performance Targets (NON-NEGOTIABLE)
Price calculations must complete in <200ms. API responses for catalog data must complete in <500ms. Client-side price updates must render in <200ms. All performance targets must be verified with automated tests and monitoring.

**Rationale**: Real-time price calculation is essential for good user experience in quotation workflows.

### V. Accessibility & Internationalization
All UI components must comply with WCAG 2.1 AA standards. Text content must be in Spanish (es-LA) with proper number formatting (comma as decimal separator). Forms must be keyboard navigable with proper ARIA labels. Mobile-first responsive design is mandatory.

**Rationale**: Latin American market requires Spanish interface and accessibility compliance ensures broad user accessibility.

## Business Requirements

### Multi-Tenant Architecture
The system MUST support multiple manufacturers (starting with VitroRojas) with isolated catalogs, pricing rules, and branding. Each manufacturer's data must be completely isolated. No cross-manufacturer data leakage is permitted.

### Data Integrity
All measurements must be stored in millimeters as integers. Currency amounts must use DECIMAL(12,2) precision. All business entities must include proper audit trails (created_at, updated_at). Database constraints must enforce business rules (min <= max dimensions, positive prices).

### Authentication & Privacy
Google OAuth integration is mandatory for quote submission. User personal data (phone, address) must be collected only when required for quote submission. All sensitive data must be encrypted in transit and properly sanitized on input.

## Development Workflow

### Code Quality Gates
All code MUST pass Biome linting and formatting without warnings. TypeScript compilation MUST succeed without errors. All tests MUST pass before merge (CI required). Code coverage for business logic functions MUST be ≥90% lines and branches. No skipped or focused tests are allowed in CI.

### Testing Strategy
Testing is a first‑class discipline and MUST follow TDD when practical:
- Unit tests (Vitest + jsdom) for pure pricing functions and utilities.
- Contract tests (Vitest) for tRPC/Zod procedures: validate input/output schemas.
- Integration tests (Vitest) for quote flows (create → add items → submit) hitting the server in-memory where possible.
- E2E tests (Playwright) for critical user journeys in App Router.
- Performance tests ensure: pricing <200ms p95; catalog <500ms p95.

### Testing & Tooling
- Unit test runner: Vitest with jsdom environment and @testing-library/react.
- E2E runner: Playwright with Chromium at minimum; dev server auto‑started.
- Test commands MUST exist in package.json: `test`, `test:watch`, `test:ui`, `test:e2e`, `test:e2e:ui`.
- Test directories: `tests/{unit,contract,integration,perf}`, E2E in `e2e/`.
- Linting: Biome; Type checks: tsc strict.

### Deployment Requirements
Database migrations must be reversible and tested in staging. Environment-specific configuration must use proper secret management. All deployed code must match the exact commit in version control.

## Governance

This constitution supersedes all other development practices and coding standards. All pull requests must verify compliance with these principles. Any complexity that violates these principles must be justified in writing and approved by technical leadership.

Amendments to this constitution require:
1. Written proposal with impact analysis
2. Review of affected templates and documentation  
3. Migration plan for existing code
4. Approval from project maintainers

Use `GEMINI.md` for detailed runtime development guidance and coding standards.

**Version**: 1.1.0 | **Ratified**: 2025-09-27 | **Last Amended**: 2025-09-27