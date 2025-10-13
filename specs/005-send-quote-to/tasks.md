# Tasks: Send Quote to Vendor

**Feature**: 005-send-quote-to  
**Branch**: `005-send-quote-to`  
**Date**: 2025-10-13  
**Input**: Design documents from `/specs/005-send-quote-to/`

**Prerequisites**: 
- ✅ plan.md (complete)
- ✅ spec.md (complete) 
- ✅ research.md (complete)
- ✅ data-model.md (complete)
- ✅ contracts/send-to-vendor.contract.md (complete)
- ✅ quickstart.md (complete)

---

## Task Organization

Tasks are grouped by **User Story** to enable independent implementation and testing. Each user story can be delivered as an increment.

**Test-First Approach**: Following the constitution's Test-First principle, test tasks are listed before implementation tasks within each story.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- **File paths**: All paths relative to repository root (`/home/andres/Proyectos/glasify-lite/`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new infrastructure needed - feature extends existing Quote system

**Status**: ✅ Already complete (Next.js 15, tRPC 11, Prisma 6, React Hook Form 7)

_No tasks in this phase - all infrastructure exists_

---

## Phase 2: Foundational (Blocking Prerequisites) 🚧

**Purpose**: Core changes that ALL user stories depend on

**⚠️ CRITICAL**: These MUST complete before ANY user story implementation begins

### Database Schema Changes

- [ ] **T001** [Foundational] Update Prisma schema with `sentAt` field  
  **File**: `prisma/schema.prisma`  
  **Action**: Add `sentAt DateTime?` field to Quote model  
  **Validation**: Schema compiles without errors
  
  ```prisma
  model Quote {
    // ... existing fields ...
    createdAt   DateTime     @default(now())
    updatedAt   DateTime     @updatedAt
    sentAt      DateTime?                         // ✨ ADD THIS LINE
    items       QuoteItem[]
    adjustments Adjustment[]
  }
  ```

- [ ] **T002** [Foundational] Create database migration  
  **File**: `prisma/migrations/20251013_add_quote_sent_at/migration.sql`  
  **Action**: Run `pnpm prisma migrate dev --name add_quote_sent_at`  
  **Validation**: Migration file created, applied successfully

- [ ] **T003** [Foundational] Generate Prisma Client  
  **Action**: Run `pnpm prisma generate`  
  **Validation**: TypeScript types include `sentAt: Date | null`

- [ ] **T004** [Foundational] Verify migration in database  
  **Action**: Run `pnpm db:studio` and check Quote table  
  **Validation**: `sentAt` column exists, nullable, type `timestamp`

### Backend Schema Definitions

- [ ] **T005** [P] [Foundational] Add Zod input schema for send-to-vendor  
  **File**: `src/server/api/routers/quote/quote.schemas.ts`  
  **Action**: Add `sendToVendorInput` schema with quoteId, contactPhone, contactEmail  
  **Validation**: Schema compiles, exports `SendToVendorInput` type
  
  ```typescript
  export const sendToVendorInput = z.object({
    quoteId: z.string().cuid('ID de cotización inválido'),
    contactPhone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Formato de teléfono inválido...'),
    contactEmail: z.string().email('Correo electrónico inválido').optional(),
  });
  ```

- [ ] **T006** [P] [Foundational] Add Zod output schema for send-to-vendor  
  **File**: `src/server/api/routers/quote/quote.schemas.ts`  
  **Action**: Add `sendToVendorOutput` schema  
  **Validation**: Schema compiles, exports `SendToVendorOutput` type
  
  ```typescript
  export const sendToVendorOutput = z.object({
    id: z.string(),
    status: z.literal('sent'),
    sentAt: z.date(),
    contactPhone: z.string(),
    contactEmail: z.string().optional(),
    total: z.number(),
    currency: z.string().length(3),
  });
  ```

**Checkpoint**: ✅ Foundation ready - database and schemas defined. User story implementation can now begin.

---

## Phase 3: User Story 1 - Submit Draft Quote for Review (Priority: P1) 🎯 MVP

**Goal**: Enable users to send draft quotes to vendor, completing the core user journey

**Independent Test**: Create draft quote → Click "Send" → Verify status changes to 'sent' with confirmation message

**Why MVP**: This is the minimum viable feature - users can submit quotes. Stories 2-4 enhance the experience but US1 alone is functional.

### Tests for User Story 1 (Test-First)

**⚠️ Write these tests FIRST, ensure they FAIL before implementation**

- [ ] **T007** [P] [US1] Unit test: Zod schema validation for sendToVendorInput  
  **File**: `tests/unit/quote/send-to-vendor-schema.test.ts`  
  **Tests**: Valid phone formats (Colombian, US), invalid formats, missing fields, optional email  
  **Validation**: Tests fail initially (schema doesn't exist yet)

- [ ] **T008** [P] [US1] Unit test: Zod schema validation for sendToVendorOutput  
  **File**: `tests/unit/quote/contact-validation.test.ts`  
  **Tests**: Status is 'sent', sentAt is Date, required fields present  
  **Validation**: Tests fail initially

- [ ] **T009** [P] [US1] Integration test: Quote status transition (draft → sent)  
  **File**: `tests/integration/quote/quote-submission.test.ts`  
  **Tests**:
    - Successfully sends draft quote
    - Throws error for already-sent quote
    - Throws error for quote with no items
    - Throws error for unauthorized user
    - Populates sentAt timestamp correctly
  **Validation**: Tests fail initially (procedure doesn't exist yet)

- [ ] **T010** [P] [US1] Contract test: send-to-vendor input/output adherence  
  **File**: `tests/contract/quote/send-to-vendor.contract.test.ts`  
  **Tests**: Input schema enforces required fields, output schema validates 'sent' status  
  **Validation**: Tests fail initially

### Implementation for User Story 1

#### Backend Service Layer

- [ ] **T011** [US1] Implement sendQuoteToVendor service function  
  **File**: `src/server/api/routers/quote/quote.service.ts`  
  **Action**: Create function with validations (status === 'draft', has items, ownership)  
  **Dependencies**: T001-T006 (schema and types)  
  **Validation**: Function compiles, includes Winston logging

  ```typescript
  export async function sendQuoteToVendor(
    db: PrismaClient,
    params: SendToVendorParams
  ): Promise<Quote> {
    // 1. Fetch quote with items
    // 2. Validate existence, ownership, status, items
    // 3. Execute mutation (status → 'sent', populate sentAt)
    // 4. Log success with Winston
    // 5. Return updated quote
  }
  ```

#### Backend tRPC Procedure

- [ ] **T012** [US1] Add 'send-to-vendor' tRPC procedure to quoteRouter  
  **File**: `src/server/api/routers/quote/quote.ts`  
  **Action**: Add protectedProcedure with input/output schemas, call service function  
  **Dependencies**: T005, T006, T011  
  **Validation**: Procedure registered, TypeScript compiles

  ```typescript
  'send-to-vendor': protectedProcedure
    .input(sendToVendorInput)
    .output(sendToVendorOutput)
    .mutation(async ({ ctx, input }) => {
      const updated = await sendQuoteToVendor(ctx.db, {
        quoteId: input.quoteId,
        userId: ctx.session.user.id,
        contactPhone: input.contactPhone,
        contactEmail: input.contactEmail,
      });
      return { /* map to output schema */ };
    })
  ```

- [ ] **T013** [US1] Run backend tests to verify implementation  
  **Action**: Run `pnpm test:unit tests/unit/quote/` and `pnpm test:integration tests/integration/quote/`  
  **Validation**: All US1 tests pass (T007-T010)

#### Frontend Custom Hook

- [ ] **T014** [P] [US1] Create useSendQuote custom hook  
  **File**: `src/hooks/use-send-quote.ts`  
  **Action**: Implement hook with optimistic updates, error handling, toast notifications  
  **Dependencies**: T012 (procedure exists)  
  **Validation**: Hook compiles, includes onMutate/onError/onSuccess handlers

  ```typescript
  'use client';
  export function useSendQuote() {
    const mutation = api.quote['send-to-vendor'].useMutation({
      onMutate: async (input) => { /* optimistic update */ },
      onError: (error, input, context) => { /* rollback + toast */ },
      onSuccess: (data) => { /* toast + invalidate */ },
    });
    return mutation;
  }
  ```

#### Frontend UI Components

- [ ] **T015** [P] [US1] Create SendQuoteButton component  
  **File**: `src/app/(dashboard)/quotes/[quoteId]/_components/send-quote-button.tsx`  
  **Action**: Client Component with onClick handler, modal trigger, loading state  
  **Dependencies**: T014 (hook)  
  **Validation**: Component renders, shows only for draft quotes

  ```typescript
  'use client';
  export function SendQuoteButton({ quote }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const sendQuote = useSendQuote();
    
    if (quote.status !== 'draft') return null;
    
    return <>
      <Button onClick={() => setIsModalOpen(true)}>
        Enviar Cotización
      </Button>
      <ContactInfoModal /* ... */ />
    </>;
  }
  ```

- [ ] **T016** [P] [US1] Create ContactInfoModal component  
  **File**: `src/app/(dashboard)/quotes/[quoteId]/_components/contact-info-modal.tsx`  
  **Action**: Client Component with React Hook Form, Zod validation, submit handler  
  **Dependencies**: T014 (hook)  
  **Validation**: Modal renders, form validates phone/email

  ```typescript
  'use client';
  export function ContactInfoModal({ open, onClose, onSubmit }: Props) {
    const form = useForm({
      resolver: zodResolver(contactSchema),
    });
    // Form fields: contactPhone (required), contactEmail (optional)
  }
  ```

#### Frontend Page Integration

- [ ] **T017** [US1] Update quote detail page with SendQuoteButton  
  **File**: `src/app/(dashboard)/quotes/[quoteId]/page.tsx`  
  **Action**: Add <SendQuoteButton quote={quote} /> to page (Server Component)  
  **Dependencies**: T015 (component)  
  **Validation**: Page renders, button shows for draft quotes only

- [ ] **T018** [US1] Add sentAt display to quote detail page  
  **File**: `src/app/(dashboard)/quotes/[quoteId]/page.tsx`  
  **Action**: Show "Enviada el {date}" message when quote.status === 'sent'  
  **Dependencies**: T001 (sentAt field)  
  **Validation**: Sent quotes show submission timestamp

### E2E Tests for User Story 1

- [ ] **T019** [US1] E2E test: Complete quote submission flow  
  **File**: `e2e/quotes/send-quote-to-vendor.spec.ts`  
  **Tests**:
    - User can send draft quote successfully
    - Shows error for invalid phone format
    - Button hidden for already-sent quotes
    - Confirmation message appears after send
  **Validation**: All E2E tests pass

**Checkpoint US1**: ✅ User Story 1 complete - users can submit draft quotes with contact validation

**MVP Delivery**: At this point, you have a **working MVP**. User Story 1 alone is sufficient for production deployment.

---

## Phase 4: User Story 2 - Include Contact Information with Submission (Priority: P1)

**Goal**: Ensure contact info is captured before submission, improving vendor follow-up success

**Independent Test**: Attempt to send quote without contact → Modal prompts for info → Submit with contact → Verify saved

**Why separate from US1**: US1 focuses on submission flow, US2 focuses on contact data quality. Can be tested independently by checking modal behavior and data persistence.

### Tests for User Story 2 (Test-First)

- [ ] **T020** [P] [US2] Unit test: Contact info modal validation  
  **File**: `tests/unit/quote/contact-modal-validation.test.ts`  
  **Tests**: Required fields, phone regex, email format, form submission  
  **Validation**: Tests fail initially

- [ ] **T021** [P] [US2] Integration test: Contact info persistence  
  **File**: `tests/integration/quote/contact-persistence.test.ts`  
  **Tests**: Contact info saved to quote, accessible in subsequent queries  
  **Validation**: Tests pass (reuses T009 infrastructure)

### Implementation for User Story 2

- [ ] **T022** [US2] Update ContactInfoModal with pre-fill logic  
  **File**: `src/app/(dashboard)/quotes/[quoteId]/_components/contact-info-modal.tsx`  
  **Action**: Pre-fill form if quote.contactPhone exists, show modal only if missing  
  **Dependencies**: T016 (modal component)  
  **Validation**: Modal skips if contact info present

- [ ] **T023** [US2] Update SendQuoteButton with contact check  
  **File**: `src/app/(dashboard)/quotes/[quoteId]/_components/send-quote-button.tsx`  
  **Action**: Check quote.contactPhone before showing modal  
  **Dependencies**: T015, T022  
  **Validation**: Button behavior adapts to contact info presence

### E2E Tests for User Story 2

- [ ] **T024** [US2] E2E test: Contact info pre-fill and skip modal  
  **File**: `e2e/quotes/send-quote-contact-info.spec.ts`  
  **Tests**:
    - Modal shows if contactPhone missing
    - Modal pre-fills if contactPhone exists
    - User can edit pre-filled contact info
    - Validation errors show for invalid formats
  **Validation**: All E2E tests pass

**Checkpoint US2**: ✅ User Story 2 complete - contact information capture optimized

---

## Phase 5: User Story 3 - Understand Next Steps After Submission (Priority: P2)

**Goal**: Manage user expectations with clear post-submission messaging

**Independent Test**: Send quote → Verify confirmation message shows timeline, vendor contact, next steps

**Why separate from US1/US2**: US3 focuses on UX and communication, not core functionality. Can be implemented after submission works.

### Tests for User Story 3 (Test-First)

- [ ] **T025** [P] [US3] Unit test: Confirmation message content  
  **File**: `tests/unit/quote/confirmation-message.test.ts`  
  **Tests**: Message includes timeline, vendor contact (from TenantConfig), next steps  
  **Validation**: Tests fail initially

### Implementation for User Story 3

- [ ] **T026** [P] [US3] Create QuoteStatusBadge component  
  **File**: `src/app/(dashboard)/quotes/_components/quote-status-badge.tsx`  
  **Action**: Atom component with variants for draft/sent/canceled, icons, colors  
  **Validation**: Component renders all variants correctly

  ```typescript
  export function QuoteStatusBadge({ status }: Props) {
    const config = {
      draft: { variant: 'secondary', label: 'Borrador', icon: FileText },
      sent: { variant: 'default', label: 'Enviada', icon: Send },
      canceled: { variant: 'destructive', label: 'Cancelada', icon: XCircle },
    }[status];
    return <Badge variant={config.variant}>...</Badge>;
  }
  ```

- [ ] **T027** [US3] Add confirmation message to quote detail page  
  **File**: `src/app/(dashboard)/quotes/[quoteId]/page.tsx`  
  **Action**: Show blue alert box with:
    - "Enviada el {sentAt}"
    - "Recibirás respuesta en 24-48 horas"
    - "Vendor contact: {TenantConfig.contactPhone}"
  **Dependencies**: T026 (badge), T018 (sentAt display)  
  **Validation**: Message shows for sent quotes only

- [ ] **T028** [US3] Update quote list with status badges  
  **File**: `src/app/(dashboard)/quotes/_components/quote-list.tsx`  
  **Action**: Replace text status with QuoteStatusBadge component  
  **Dependencies**: T026  
  **Validation**: Badges render in quote list

### E2E Tests for User Story 3

- [ ] **T029** [US3] E2E test: Post-submission messaging  
  **File**: `e2e/quotes/send-quote-confirmation.spec.ts`  
  **Tests**:
    - Confirmation message visible after send
    - Message includes expected timeline
    - Vendor contact info displayed
    - Status badge updated in list
  **Validation**: All E2E tests pass

**Checkpoint US3**: ✅ User Story 3 complete - users understand post-submission process

---

## Phase 6: User Story 4 - View Quote Submission History (Priority: P3)

**Goal**: Help users organize and track submitted quotes

**Independent Test**: Send multiple quotes → Filter by 'sent' status → Verify list shows only sent quotes with timestamps

**Why lowest priority**: Nice-to-have for organization, not critical for core flow. Can be implemented last or deferred.

### Tests for User Story 4 (Test-First)

- [ ] **T030** [P] [US4] Integration test: Filter quotes by status  
  **File**: `tests/integration/quote/quote-filtering.test.ts`  
  **Tests**: Filter by draft, sent, canceled, mixed states  
  **Validation**: Tests pass (reuses existing filter infrastructure)

### Implementation for User Story 4

- [ ] **T031** [US4] Update quote filters component with status filter  
  **File**: `src/app/(dashboard)/quotes/_components/quote-filters.tsx`  
  **Action**: Add dropdown/tabs for filtering by status (draft/sent/canceled)  
  **Validation**: Filter updates URL search params

- [ ] **T032** [US4] Update quote list to show sentAt when applicable  
  **File**: `src/app/(dashboard)/quotes/_components/quote-list.tsx`  
  **Action**: Display "Enviada el {sentAt}" instead of "Creada el {createdAt}" for sent quotes  
  **Dependencies**: T028 (badge component)  
  **Validation**: List shows correct timestamp based on status

- [ ] **T033** [US4] Update quote list query to support sorting by sentAt  
  **File**: `src/server/api/routers/quote/quote.ts` (list-user-quotes procedure)  
  **Action**: Add orderBy option for sentAt (nulls last)  
  **Validation**: Sent quotes can be sorted by submission date

### E2E Tests for User Story 4

- [ ] **T034** [US4] E2E test: Quote filtering and history  
  **File**: `e2e/quotes/quote-history.spec.ts`  
  **Tests**:
    - Filter shows only sent quotes
    - Sent quotes display submission timestamp
    - Sorting by sentAt works correctly
  **Validation**: All E2E tests pass

**Checkpoint US4**: ✅ User Story 4 complete - quote history and organization functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final touches, documentation, performance optimization

- [ ] **T035** [P] Add JSDoc comments to all new functions  
  **Files**: quote.service.ts, quote.ts, use-send-quote.ts, all components  
  **Validation**: All public functions documented

- [ ] **T036** [P] Update CHANGELOG.md with feature description  
  **File**: `CHANGELOG.md`  
  **Action**: Add "Feature 005: Send Quote to Vendor" section under Unreleased  
  **Validation**: CHANGELOG follows conventional format

- [ ] **T037** Run full test suite (unit + integration + contract + E2E)  
  **Action**: `pnpm test && pnpm test:e2e`  
  **Validation**: All tests pass, coverage > 80%

- [ ] **T038** Run TypeScript type checking  
  **Action**: `pnpm typecheck`  
  **Validation**: No TypeScript errors

- [ ] **T039** Run linting and formatting  
  **Action**: `pnpm lint:fix`  
  **Validation**: No Biome/Ultracite errors

- [ ] **T040** Manual testing: Complete user flow in dev  
  **Action**: Catalog → Cart → Quote → Send (test all user stories)  
  **Validation**: All scenarios work, responsive design verified

- [ ] **T041** Create pull request with comprehensive description  
  **Action**: Use quickstart.md checklist, reference spec.md and plan.md  
  **Validation**: PR includes:
    - Feature description
    - User stories completed
    - Test coverage summary
    - Screenshots (before/after)
    - Migration instructions

**Checkpoint Final**: ✅ Feature complete, tested, documented, ready for review

---

## Task Dependencies

### Critical Path (Sequential)

```
T001 (Prisma schema) 
  → T002 (Migration) 
  → T003 (Generate client)
  → T005, T006 (Zod schemas)
  → T011 (Service function)
  → T012 (tRPC procedure)
  → T014 (Custom hook)
  → T015, T016 (UI components)
  → T017, T018 (Page integration)
  → T019 (E2E tests)
```

### Parallelizable Tasks

**Phase 2** (after T004 checkpoint):
- T005, T006 can run in parallel (different schemas)
- T007, T008, T009, T010 can run in parallel (different test files)

**Phase 3** (after T013 checkpoint):
- T014 (hook) can run while T015, T016 (components) are being built
- T026 (badge) is independent of T015, T016

**Phase 7**:
- T035, T036 can run in parallel (different files)

### User Story Dependencies

```
Foundational (T001-T006)
  ↓
US1 (T007-T019) ← MVP DELIVERY POINT
  ↓
US2 (T020-T024) [builds on US1]
  ↓
US3 (T025-T029) [builds on US1, uses US2 components]
  ↓
US4 (T030-T034) [independent, can run parallel to US3 if needed]
  ↓
Polish (T035-T041)
```

**Note**: US2, US3, US4 can technically start in parallel after US1 is complete, but sequential order is recommended for incremental testing.

---

## Parallel Execution Examples

### Example 1: Maximum Parallelization (3 developers)

**Dev 1 (Backend)**:
- T001 → T002 → T003 → T004 (Foundation)
- T005, T006 (Schemas)
- T011 → T012 (Service + Procedure)

**Dev 2 (Tests - can start early with TDD)**:
- T007, T008, T009, T010 (US1 tests)
- T020, T021 (US2 tests)
- T025 (US3 tests)
- T030 (US4 tests)

**Dev 3 (Frontend - starts after T012)**:
- T014 (Hook)
- T015, T016 (Components)
- T026 (Badge)
- T017, T018 (Page integration)

### Example 2: MVP-First (1 developer)

**Week 1**: MVP (US1 only)
- Day 1: T001-T006 (Foundation)
- Day 2: T007-T012 (Tests + Backend)
- Day 3: T014-T018 (Frontend)
- Day 4: T019 (E2E), T037-T039 (Quality checks)
- Day 5: T040-T041 (Manual test + PR)

**Week 2**: Enhancements (US2-US4)
- US2: 1 day
- US3: 1 day
- US4: 1 day
- Polish: 2 days

---

## Implementation Strategy

### Recommended Approach: Incremental Delivery

1. **Sprint 1 (MVP)**: Complete US1 (T001-T019)
   - Deliverable: Users can submit quotes
   - Deploy to staging for feedback
   
2. **Sprint 2 (Enhancement)**: Complete US2 (T020-T024)
   - Deliverable: Contact info capture optimized
   - Deploy to staging
   
3. **Sprint 3 (UX Polish)**: Complete US3, US4 (T025-T034)
   - Deliverable: Full feature with history
   - Deploy to production

### Alternative: Big Bang Delivery

Complete all tasks T001-T041 before deploying to production.

**Pros**: Feature fully complete  
**Cons**: Longer feedback loop, higher risk

**Recommendation**: Use incremental delivery for faster validation.

---

## Task Summary

| Phase                 | Task Count   | Parallelizable        | Story Dependencies           |
| --------------------- | ------------ | --------------------- | ---------------------------- |
| Phase 1: Setup        | 0            | N/A                   | None (infrastructure exists) |
| Phase 2: Foundational | 6            | 2 (T005, T006)        | Blocks all stories           |
| Phase 3: US1 (MVP)    | 13           | 5 (tests + badge)     | None                         |
| Phase 4: US2          | 5            | 1 (test)              | Depends on US1               |
| Phase 5: US3          | 5            | 2 (test + badge)      | Depends on US1               |
| Phase 6: US4          | 5            | 1 (test)              | Independent                  |
| Phase 7: Polish       | 7            | 2 (docs)              | Depends on all stories       |
| **Total**             | **41 tasks** | **13 parallelizable** | **4 user stories**           |

### Task Distribution by Type

| Type          | Count | Percentage |
| ------------- | ----- | ---------- |
| Tests         | 10    | 24%        |
| Backend       | 8     | 20%        |
| Frontend      | 13    | 32%        |
| Database      | 4     | 10%        |
| Documentation | 6     | 14%        |

### Estimated Effort

| Phase               | Estimated Time             | Risk           |
| ------------------- | -------------------------- | -------------- |
| Phase 2: Foundation | 4 hours                    | Low            |
| Phase 3: US1 (MVP)  | 16-20 hours                | Medium         |
| Phase 4: US2        | 6-8 hours                  | Low            |
| Phase 5: US3        | 6-8 hours                  | Low            |
| Phase 6: US4        | 4-6 hours                  | Low            |
| Phase 7: Polish     | 6-8 hours                  | Low            |
| **Total**           | **42-54 hours (3-5 days)** | **Low-Medium** |

---

## MVP Scope Recommendation

**Minimum Viable Product**: User Story 1 (T001-T019)

**Rationale**:
- Completes core user journey (submit quote to vendor)
- All validation and error handling included
- Fully testable and deployable
- Provides immediate business value
- Can gather user feedback before building US2-US4

**Post-MVP Enhancements**:
- US2: Contact optimization (improves UX but not critical)
- US3: Post-submission messaging (reduces support but US1 works without it)
- US4: Quote history (organizational, nice-to-have)

---

## Next Steps

1. **Review this task list** with the team
2. **Prioritize MVP** (US1) for first sprint
3. **Assign tasks** based on team composition
4. **Start with tests** (Test-First approach)
5. **Follow quickstart.md** for implementation details
6. **Track progress** using this checklist
7. **Deploy incrementally** after each user story completes

---

**Tasks file complete. Ready to begin implementation. 🚀**
