# Implementation Plan: Send Quote to Vendor

**Branch**: `005-send-quote-to` | **Date**: 2025-10-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-send-quote-to/spec.md`

**Note**: This plan follows the SpecKit workflow and constitution requirements.

## Summary

**Primary Requirement**: Enable homeowners to submit their self-generated draft quotes to the carpentry vendor for professional refinement and negotiation, completing the user journey from catalog exploration to vendor engagement.

**Technical Approach**: 
- Add `sentAt` timestamp field to Quote model (minimal schema change)
- Create tRPC mutation `quote.send-to-vendor` with contact validation
- Implement Server Action pattern for form submission (progressive enhancement)
- Update My Quotes UI with status badges and send button (Server Component + Client interactivity)
- No notification infrastructure needed (vendors check external system manually)
- Quote submission is immutable (no withdrawal feature in MVP)

## Technical Context

**Language/Version**: TypeScript 5.8.2 (strict mode enabled), Node.js (ES2022 target)
**Primary Dependencies**: 
- Next.js 15.2.3 (App Router, React Server Components)
- React 19.0.0, tRPC 11.0.0, Prisma 6.16.2, NextAuth.js 5.0.0-beta.25
- Zod 4.1.1 (validation), TanStack Query 5.69.0
- React Hook Form 7.63.0 (client-side form state)
- Winston 3.17.0 (server-side logging only)

**Storage**: PostgreSQL via Prisma ORM (Quote model with status enum already supports 'draft', 'sent', 'canceled')

**Testing**: 
- Unit/Integration: Vitest 3.2.4 with jsdom + @testing-library/react
- E2E: Playwright 1.55.1
- Contract: tRPC procedure input/output schema validation

**Target Platform**: Web application (responsive design, mobile-first)

**Project Type**: Next.js 15 App Router monorepo with tRPC API layer

**Performance Goals**: 
- Quote submission < 2 seconds (FR-003, SC-003)
- Status update in UI < 1 second after mutation success
- My Quotes page render < 2 seconds with filtering (SC-007)
- End-to-end user journey < 10 minutes (SC-010)

**Constraints**: 
- Server Components by default (Client Components only for interactivity)
- Winston logger STRICTLY server-side only (Server Components, Server Actions, tRPC, API Routes)
- No Winston in Client Components, hooks, or browser code
- Spanish (es-LA) for all UI text and error messages
- No automated notifications (MVP): vendors check external system manually
- Quote submission is immutable: no withdrawal/cancellation in-app

**Scale/Scope**: 
- Single tenant deployment (TenantConfig singleton)
- Expected load: 100-500 quotes/day
- User base: 100-1000 homeowners + 1-5 vendor admins
- Database: PostgreSQL with existing indexes on Quote(userId, status)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Single Responsibility (SRP)
- **Status**: PASS
- **Verification**: Feature has clear separation of concerns:
  - Quote submission logic isolated in tRPC procedure (`quote.send-to-vendor`)
  - Contact validation in dedicated Zod schema
  - UI state management in custom hook (`useSendQuote`)
  - Server Components for data fetching, Client Components for interactivity only

### ✅ Open/Closed (OCP)
- **Status**: PASS
- **Verification**: Design extends existing Quote system without modifying core:
  - New tRPC procedure added to existing `quoteRouter`
  - Quote model extended with `sentAt` field (non-breaking)
  - UI components use composition (SendQuoteButton, ContactInfoModal)
  - Future notification systems can hook into submission event without changing core logic

### ✅ Test-First (NON-NEGOTIABLE)
- **Status**: PASS - Test plan included
- **Coverage**:
  - Unit: tRPC procedure logic, Zod validation, utility functions
  - Integration: Quote status transition (draft → sent), database updates
  - E2E: Complete submission flow from My Quotes → Send → Confirmation (Playwright)
  - Contract: Input/output schema validation with tRPC

### ✅ Server-First Architecture (Next.js 15)
- **Status**: PASS
- **Verification**:
  - My Quotes page remains Server Component with metadata for SEO
  - Data fetching via tRPC server calls in Server Components
  - Client Components (`'use client'`) only for:
    - Send button with onClick handler
    - Contact info modal with form state (React Hook Form)
    - Status badge updates with optimistic UI
  - No Winston logger in Client Components (only server-side logging)

### ✅ Integration & Contract Testing
- **Status**: PASS
- **Verification**:
  - tRPC procedure defines explicit input/output contracts with Zod
  - Contract tests verify schema adherence
  - Integration tests cover Quote → Database interaction
  - E2E tests validate complete user flow

### ✅ Observability & Versioning
- **Status**: PASS
- **Verification**:
  - Winston structured logging for server-side events:
    - `logger.info('Quote sent to vendor', { quoteId, userId, sentAt })`
    - `logger.error('Failed to send quote', { quoteId, error })`
  - Winston ONLY in server contexts (tRPC procedures, Server Actions, Server Components)
  - Client-side: Toast notifications for user feedback, DevTools for errors
  - Audit trail via `sentAt` timestamp in database
  - Feature follows semantic versioning (no breaking changes to Quote API)

### Technology Stack Compliance
- **Status**: PASS
- **Stack Verification**:
  - ✅ Next.js 15 App Router (Server Components + Client Components)
  - ✅ tRPC 11+ with createServerActionProcedure pattern
  - ✅ Prisma 6.16.2 for database operations
  - ✅ Zod 4.1.1 for schema validation
  - ✅ React Hook Form 7.63.0 for client form state
  - ✅ Winston 3.17.0 (server-side only)
  - ✅ Vitest + Playwright for testing

**Gate Result**: ✅ **PASS** - All constitution principles satisfied. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```
specs/005-send-quote-to/
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 output (technical decisions)
├── data-model.md        # Phase 1 output (database schema changes)
├── quickstart.md        # Phase 1 output (developer guide)
├── contracts/           # Phase 1 output (tRPC procedure contracts)
│   └── send-to-vendor.contract.md
├── spec.md              # Feature specification
├── SUMMARY.md           # Executive summary
└── checklists/
    └── requirements.md  # Requirements checklist
```

### Source Code (Next.js 15 App Router structure)

```
src/
├── app/
│   ├── (dashboard)/
│   │   └── quotes/                      # My Quotes pages
│   │       ├── [quoteId]/
│   │       │   ├── _components/
│   │       │   │   ├── send-quote-button.tsx      # NEW: Client Component
│   │       │   │   ├── contact-info-modal.tsx     # NEW: Client Component
│   │       │   │   └── quote-detail-content.tsx   # UPDATED: Add send button
│   │       │   └── page.tsx                       # Server Component (existing)
│   │       ├── _components/
│   │       │   ├── quote-list.tsx                 # UPDATED: Status badges
│   │       │   ├── quote-status-badge.tsx         # NEW: Atom component
│   │       │   └── quote-filters.tsx              # UPDATED: Filter by status
│   │       └── page.tsx                           # Server Component (existing)
│   └── _actions/
│       └── quote-actions.ts                       # NEW: Server Actions wrapper
│
├── components/
│   └── ui/                                        # Shadcn/ui atoms
│       ├── badge.tsx                              # Existing
│       ├── button.tsx                             # Existing
│       ├── dialog.tsx                             # Existing
│       └── form.tsx                               # Existing (React Hook Form)
│
├── server/
│   ├── api/
│   │   └── routers/
│   │       └── quote/
│   │           ├── quote.ts                       # UPDATED: Add send-to-vendor procedure
│   │           ├── quote.schemas.ts               # UPDATED: Add sendToVendorInput/Output
│   │           └── quote.service.ts               # UPDATED: Add sendToVendor logic
│   └── utils/
│       └── tenant.ts                              # Existing (TenantConfig utilities)
│
├── hooks/
│   └── use-send-quote.ts                          # NEW: Custom hook for send logic
│
└── lib/
    ├── logger.ts                                  # Existing (Winston - server only)
    └── utils.ts                                   # Existing (cn, etc.)

prisma/
├── schema.prisma                                  # UPDATED: Add sentAt to Quote
└── migrations/
    └── 20251013_add_quote_sent_at/
        └── migration.sql                          # NEW: ALTER TABLE Quote

tests/
├── unit/
│   └── quote/
│       ├── send-to-vendor.test.ts                 # NEW: tRPC procedure tests
│       └── contact-validation.test.ts             # NEW: Zod schema tests
├── integration/
│   └── quote/
│       └── quote-submission.test.ts               # NEW: Status transition tests
└── contract/
    └── quote/
        └── send-to-vendor.contract.test.ts        # NEW: Contract tests

e2e/
└── quotes/
    └── send-quote-to-vendor.spec.ts               # NEW: E2E flow test
```

**Structure Decision**: 
This feature follows the Next.js 15 App Router + tRPC pattern established in the codebase. All quote-related logic is colocated under `/app/(dashboard)/quotes/` with clear separation:
- **Server Components**: Pages for SEO, data fetching (page.tsx)
- **Client Components**: Interactivity only (_components/ with 'use client')
- **tRPC Procedures**: Business logic in /server/api/routers/quote/
- **Database**: Prisma migration for schema changes

**Key Convention**: Use `_components/` prefix for private feature components (not routes)

## Complexity Tracking

*No violations detected - all constitution principles satisfied.*

**Feature Complexity**: Medium

**Justification**:
- Single new field in existing model (low risk)
- Single new tRPC procedure (standard pattern)
- Client Components use existing patterns (React Hook Form + shadcn/ui)
- No new external dependencies
- No architectural changes

---

## Phase 0: Research & Discovery ✅

**Status**: COMPLETE  
**Output**: [research.md](./research.md)

### Key Decisions Made

1. **Contact Validation**: Zod + React Hook Form for end-to-end type safety
2. **Status Transition**: Immutable (draft → sent only, no rollback)
3. **Component Architecture**: Server Components for pages, Client for interactions
4. **Winston Logger**: Server-side only (constitution compliance)
5. **Admin Portal**: Out of scope (vendors use external system)
6. **Error Handling**: Three-layer (client/server/db)
7. **Performance**: Optimistic UI updates + query invalidation
8. **Testing**: Pyramid approach (70% unit, 20% int, 10% E2E)

**All technical unknowns resolved. Proceed to Phase 1.**

---

## Phase 1: Design & Contracts ✅

**Status**: COMPLETE  
**Outputs**:
- [data-model.md](./data-model.md) - Database schema changes
- [contracts/send-to-vendor.contract.md](./contracts/send-to-vendor.contract.md) - tRPC API contract
- [quickstart.md](./quickstart.md) - Developer implementation guide

### Data Model Changes

**Schema Update**:
```prisma
model Quote {
  // ... existing fields ...
  sentAt DateTime? // ✨ NEW: Timestamp when quote was sent to vendor
}
```

**Migration**: `20251013_add_quote_sent_at`
- Add nullable `sentAt` field (non-breaking change)
- No data backfill needed
- No new indexes (existing indexes sufficient)

### API Contract

**Procedure**: `quote.send-to-vendor` (protected mutation)

**Input**:
```typescript
{
  quoteId: string;          // CUID
  contactPhone: string;     // /^\+?[1-9]\d{9,14}$/
  contactEmail?: string;    // Optional email
}
```

**Output**:
```typescript
{
  id: string;
  status: 'sent';
  sentAt: Date;
  contactPhone: string;
  contactEmail?: string;
  total: number;
  currency: string;
}
```

**Validations**:
- User authenticated (protectedProcedure)
- Quote exists and belongs to user
- Quote status === 'draft'
- Quote has at least 1 item
- Phone matches international format

### Developer Guide

**quickstart.md** provides step-by-step implementation guide:
- Phase 1: Database migration (Day 1)
- Phase 2: tRPC backend (Day 1-2)
- Phase 3: Custom hook (Day 2)
- Phase 4: UI components (Day 2-3)
- Phase 5: Testing (Day 4)
- Phase 6: Documentation & cleanup (Day 5)

**Estimated Implementation Time**: 3-5 days

---

## Phase 2: Implementation Tasks

**Note**: Detailed task breakdown will be generated with `/speckit.tasks` command (not included in `/speckit.plan` output).

### High-Level Task Categories

1. **Database Layer** (Priority: P0 - Blocker)
   - Update Prisma schema
   - Create and apply migration
   - Verify schema changes

2. **Backend Layer** (Priority: P0 - Blocker)
   - Add Zod input/output schemas
   - Implement tRPC procedure
   - Add service layer logic
   - Implement validation rules

3. **Frontend Layer** (Priority: P1 - Critical)
   - Create custom hook (useSendQuote)
   - Build UI components (button, modal, badge)
   - Update quote detail page
   - Update quote list page
   - Implement optimistic updates

4. **Testing Layer** (Priority: P1 - Critical)
   - Write unit tests (Zod validation)
   - Write integration tests (tRPC procedure)
   - Write contract tests (input/output)
   - Write E2E tests (Playwright)

5. **Documentation Layer** (Priority: P2 - Important)
   - Add JSDoc comments
   - Update CHANGELOG.md
   - Create PR description
   - Code review checklist

### Dependency Graph

```
Database Migration (P0)
  ↓
Backend (tRPC Procedure) (P0)
  ↓
Frontend (Custom Hook) (P1)
  ↓
Frontend (UI Components) (P1)
  ↓
Testing (Unit + Integration) (P1)
  ↓
Testing (E2E) (P1)
  ↓
Documentation (P2)
```

### Estimated Effort

| Task Category | Estimated Time | Risk Level |
|---------------|----------------|------------|
| Database Migration | 2-4 hours | Low |
| Backend (tRPC) | 8-12 hours | Low |
| Frontend (Hook + UI) | 12-16 hours | Medium |
| Testing | 8-12 hours | Low |
| Documentation | 4-6 hours | Low |
| **Total** | **3-5 days** | **Low-Medium** |

---

## Risk Assessment

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Migration breaks existing quotes | Low | High | Test migration in staging first, nullable field is non-breaking |
| Winston logger in Client Component | Low | High | Constitution check enforces this, TypeScript will catch |
| Phone validation rejects valid numbers | Medium | Medium | Comprehensive unit tests, support multiple formats |
| Optimistic update doesn't revert | Low | Medium | Proper onError handler with rollback logic |
| E2E tests flaky | Medium | Low | Use Playwright best practices, proper waits |

### Scope Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Feature creep (add notifications) | Medium | High | Explicit out-of-scope section in spec |
| Admin portal requests | High | Medium | Clear handoff to external system documented |
| Quote withdrawal feature | Medium | Medium | Immutability decision documented, users contact vendor |

### Timeline Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| UI design iterations | Medium | Low | Use existing shadcn/ui patterns |
| Testing takes longer than expected | Low | Medium | Start testing early (test-first approach) |
| Code review delays | Low | Low | Clear documentation, self-review checklist |

**Overall Risk Level**: LOW ✅

---

## Success Criteria (from Spec)

### Functional Requirements (FR)

All 17 functional requirements documented in [spec.md](./spec.md):
- ✅ FR-001 to FR-017 covered by implementation plan
- ✅ Status transition logic (draft → sent)
- ✅ Contact validation and persistence
- ✅ Visual distinction (status badges)
- ✅ Audit logging (Winston + sentAt timestamp)
- ✅ Error handling and user feedback

### Success Metrics (SC)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| SC-001: Submission time | < 30 seconds | User testing + analytics |
| SC-002: Success rate | 95% | Error logs + mutation success rate |
| SC-003: Status transition | < 2 seconds | Database query latency |
| SC-004: Confirmation display | < 3 seconds | Frontend render time |
| SC-005: Visual clarity | 100% | User testing + A/B testing |
| SC-006: Invalid contacts | 0% | Zod validation prevents |
| SC-007: Filter performance | < 2 seconds | Database query + index usage |
| SC-008: Support reduction | 70% fewer | Support ticket tracking |
| SC-009: Timestamp accuracy | ±1 second | Database timestamp precision |
| SC-010: End-to-end journey | < 10 minutes | User flow analytics |

---

## Post-Implementation Checklist

### Before Merge

- [ ] All unit tests pass (`pnpm test:unit`)
- [ ] All integration tests pass (`pnpm test:integration`)
- [ ] All E2E tests pass (`pnpm test:e2e`)
- [ ] No TypeScript errors (`pnpm typecheck`)
- [ ] No linting errors (`pnpm lint`)
- [ ] Migration tested in staging database
- [ ] Code reviewed by at least 1 team member
- [ ] CHANGELOG.md updated
- [ ] Documentation complete (JSDoc, quickstart.md)

### After Merge

- [ ] Deploy to staging environment
- [ ] Smoke test in staging
- [ ] Monitor Winston logs for errors
- [ ] Check database query performance
- [ ] User acceptance testing
- [ ] Deploy to production
- [ ] Monitor production metrics (latency, errors)
- [ ] Gather user feedback

### Future Enhancements (Post-MVP)

Documented in [spec.md](./spec.md) - Out of Scope section:

1. **Email notifications** (SendGrid/AWS SES)
2. **WhatsApp Business API** (instant vendor notification)
3. **CRM integrations** (Salesforce, HubSpot, Zoho)
4. **Quote withdrawal** (within 1-hour window)
5. **Read receipts** (vendor viewed quote)
6. **Vendor dashboard** (in-app quote management)

---

## References

### Feature Documentation
- [spec.md](./spec.md) - Full feature specification
- [SUMMARY.md](./SUMMARY.md) - Executive summary
- [research.md](./research.md) - Technical decisions (Phase 0)
- [data-model.md](./data-model.md) - Database schema (Phase 1)
- [quickstart.md](./quickstart.md) - Developer guide (Phase 1)
- [contracts/send-to-vendor.contract.md](./contracts/send-to-vendor.contract.md) - API contract (Phase 1)

### Project Documentation
- [.github/copilot-instructions.md](/.github/copilot-instructions.md) - Coding standards
- [.specify/memory/constitution.md](/.specify/memory/constitution.md) - Architecture principles
- [prisma/schema.prisma](/prisma/schema.prisma) - Database schema

### External Resources
- [tRPC Documentation](https://trpc.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)

---

## Plan Status Summary

| Phase | Status | Output |
|-------|--------|--------|
| Phase 0: Research | ✅ COMPLETE | research.md |
| Phase 1: Design & Contracts | ✅ COMPLETE | data-model.md, contracts/, quickstart.md |
| Phase 2: Implementation | ⏳ PENDING | Generated with /speckit.tasks |

**Constitution Check**: ✅ PASS (re-verified post-design)

### Key Architectural Decisions

1. ✅ **Server-First**: Pages are Server Components, Client Components only for interactivity
2. ✅ **Winston Server-Only**: No logger usage in Client Components
3. ✅ **Immutable Status**: No quote withdrawal feature (user contacts vendor)
4. ✅ **No Notifications**: Vendors check external system manually (MVP)
5. ✅ **Type-Safe**: Zod schemas shared between client and server

### Implementation Ready

- ✅ All technical unknowns resolved
- ✅ Database schema designed (backward compatible)
- ✅ API contract defined (input/output validated)
- ✅ Component architecture planned (Server + Client boundaries)
- ✅ Testing strategy defined (pyramid approach)
- ✅ Developer guide complete (quickstart.md)
- ✅ Risk assessment complete (low overall risk)

**Next Command**: `/speckit.tasks` - Generate detailed implementation tasks

---

**Plan complete. Feature 005 is ready for implementation. 🚀**
