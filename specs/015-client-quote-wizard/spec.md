# Feature Specification: Client Quote Wizard

**Feature Branch**: `015-client-quote-wizard`  
**Created**: 2025-10-28  
**Status**: Draft  
**Input**: User description: "Como Cliente final quiero un proceso simple paso a paso para cotizar para no sentirme abrumado con demasiada información técnica. El wizard tendrá 4 pasos: ubicación, dimensiones+color, vidrio y servicios opcionales."

**Note**: This specification must comply with project constitution (`.specify/memory/constitution.md`). The implementation plan (`plan.md`) will perform detailed constitution checks.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Complete Simple Quotation (Priority: P1)

As an end customer visiting the catalog, I want to configure a window through a simple step-by-step process, so I can get a price quote without feeling overwhelmed by technical details.

**Why this priority**: This is the core value proposition - reducing cognitive load for non-technical users. Without this, the feature doesn't deliver on its main promise.

**Independent Test**: Can be fully tested by navigating through all 4 wizard steps (location → dimensions → glass → services) and successfully adding an item to the budget. Delivers immediate value by enabling end customers to self-serve quotations.

**Acceptance Scenarios**:

1. **Given** I'm viewing a model in the catalog, **When** I start the quote wizard, **Then** I see Step 1 (Location) with clear room options
2. **Given** I'm on Step 1, **When** I select "Alcoba principal" and click Next, **Then** I advance to Step 2 (Dimensions) with my selection saved
3. **Given** I'm on Step 2, **When** I enter width 1200mm and height 1500mm, **Then** I see the updated subtotal immediately
4. **Given** I'm on Step 3, **When** I select a glass solution card (e.g., "Térmico"), **Then** I see the total price updated
5. **Given** I'm on Step 4, **When** I check "Instalación" service, **Then** I see the service cost added to total
6. **Given** I complete all 4 steps, **When** I click "Ver Resumen", **Then** I see a summary page with all my selections and final price
7. **Given** I'm on the summary page, **When** I click "Agregar al Presupuesto", **Then** the item is added to my budget and I see confirmation

---

### User Story 2 - Navigate Back to Edit Selections (Priority: P2)

As an end customer in the quote wizard, I want to go back to previous steps without losing my selections, so I can review and adjust my choices before finalizing.

**Why this priority**: Critical for user confidence and error prevention, but the wizard can function without it (users could restart if needed).

**Independent Test**: Can be tested by completing steps 1-3, clicking Back from step 4, modifying a value on step 2, and verifying all selections persist correctly. Delivers value by enabling users to correct mistakes without starting over.

**Acceptance Scenarios**:

1. **Given** I'm on Step 3 (Glass), **When** I click "Atrás", **Then** I return to Step 2 with my dimensions still filled
2. **Given** I'm on Step 2 after going back, **When** I change the width from 1200 to 1500, **Then** the subtotal updates and I can continue to Step 3
3. **Given** I'm on the Summary page, **When** I click "Volver a editar", **Then** I return to Step 4 with all my previous selections intact

---

### User Story 3 - [Brief Title] (Priority: P3)

---

### User Story 3 - Auto-save Progress (Priority: P3)

As an end customer filling the quote wizard, I want my progress to be automatically saved, so I don't lose my work if I accidentally close the browser or navigate away.

**Why this priority**: Nice-to-have quality-of-life feature that prevents frustration, but not essential for basic functionality.

**Independent Test**: Can be tested by filling steps 1-2, closing the browser, reopening the page, and verifying the wizard restores to step 2 with saved data. Delivers value by reducing user frustration from accidental data loss.

**Acceptance Scenarios**:

1. **Given** I've completed Step 1 and Step 2, **When** I close and reopen the browser, **Then** I see a prompt to "Continue where you left off" or start fresh
2. **Given** I choose to continue, **When** the wizard loads, **Then** I'm on Step 2 with my previous selections (location, dimensions) restored
3. **Given** I've completed the wizard and added to budget, **When** I return to the same model, **Then** the wizard starts fresh (no saved state)

---

### User Story 4 - Mobile-Optimized Experience (Priority: P2)

As an end customer on mobile, I want the wizard to adapt to my screen size with touch-friendly controls, so I can complete the quotation easily on my phone.

**Why this priority**: Essential for accessibility since many customers browse on mobile, but desktop users can still function without mobile optimization.

**Independent Test**: Can be tested by completing the entire wizard flow on a mobile device (viewport <768px) with touch interactions. Delivers value by making the feature accessible to mobile users (estimated 40%+ of traffic).

**Acceptance Scenarios**:

1. **Given** I'm on mobile (viewport <768px), **When** I view the wizard, **Then** steps are displayed vertically with progress dots at the top
2. **Given** I'm on Step 2 (Dimensions), **When** I tap on width/height inputs, **Then** I see a numeric keyboard optimized for number entry
3. **Given** I'm on Step 3 (Glass), **When** I view glass solution cards, **Then** cards are stacked vertically and have large touch targets (min 44x44px)
4. **Given** I'm on any step, **When** I tap Next/Back buttons, **Then** buttons are large (min 48px height) and easily tappable

---

### Edge Cases

- What happens when a user enters dimensions outside the valid range (min 500mm, max 3000mm)?
  - System shows inline validation error: "El ancho debe estar entre 500mm y 3000mm"
  - Next button is disabled until valid values are entered
  
- How does the system handle when a selected glass solution becomes unavailable mid-session?
  - Wizard detects unavailable selection on step transition
  - Shows warning: "La solución seleccionada ya no está disponible. Por favor elige otra opción."
  - Returns user to Step 3 to make new selection

- What happens if a user has items in their budget and starts a new wizard session?
  - Wizard starts fresh (no conflict)
  - New item is added to existing budget upon completion
  
- How does the system handle network failures during price calculation?
  - Shows loading state with spinner
  - After 5 seconds timeout: "No pudimos calcular el precio. Por favor intenta de nuevo."
  - User can retry or continue (price shows last known value with warning icon)

- What happens when localStorage is full or disabled?
  - Wizard functions normally but without auto-save (User Story 3)
  - User sees no error, but progress isn't persisted between sessions

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a multi-step wizard with exactly 4 sequential steps: Location, Dimensions, Glass Solution, and Services
- **FR-002**: System MUST validate each step's data before allowing progression to the next step (Next button disabled if validation fails)
- **FR-003**: System MUST display real-time price updates as users make selections in each step
- **FR-004**: System MUST allow users to navigate backward to previous steps without losing data from subsequent steps
- **FR-005**: System MUST provide a summary/review page after Step 4 showing all selections before final confirmation
- **FR-006**: System MUST add the configured item to the user's budget (Budget Cart) upon final confirmation
- **FR-007**: System MUST persist wizard progress in browser storage (localStorage) to allow session recovery
- **FR-008**: System MUST clear saved progress after successful addition to budget
- **FR-009**: System MUST provide a location selector with predefined room options and a free-text "Otro" option
- **FR-010**: System MUST validate dimension inputs with minimum 500mm and maximum 3000mm constraints
- **FR-011**: System MUST display glass solutions as visual cards with icons and descriptions
- **FR-012**: System MUST show services as optional checkboxes with pricing
- **FR-013**: System MUST provide responsive layouts for mobile (<768px), tablet (768-1024px), and desktop (>1024px)
- **FR-014**: System MUST display progress indicators showing current step and total steps
- **FR-015**: System MUST maintain the existing catalog model detail page (`/catalog/[modelId]`) unchanged for commercial user access
- **FR-016**: System MUST calculate price using existing pricing engine with debounced updates (300ms) on dimension changes

### Key Entities

- **WizardFormData**: Represents the complete state of a quotation in progress
  - roomLocation: string (selected or custom room location)
  - width: number (in millimeters)
  - height: number (in millimeters)
  - colorId: string (optional, selected color variant)
  - glassSolutionId: string (selected glass solution)
  - selectedServices: string[] (array of service IDs)
  - modelId: string (reference to catalog model)
  - currentStep: number (1-4, tracks wizard progress)

- **RoomLocation**: Predefined location options
  - id: string
  - label: string (e.g., "Alcoba principal", "Cocina")
  - category: string (e.g., "bedroom", "common-area", "bathroom")

- **WizardStep**: Configuration for each step
  - stepNumber: number (1-4)
  - title: string (step title displayed to user)
  - component: React component to render
  - validationSchema: Zod schema for step validation

### File Organization

For the quote wizard feature, structure must follow:

```
src/app/(public)/catalog/[modelId]/
├── _components/
│   └── quote-wizard/
│       ├── quote-wizard.tsx              # Main wizard orchestrator (<150 lines)
│       ├── wizard-progress.tsx           # Progress indicator component
│       ├── wizard-step-container.tsx     # Generic step wrapper
│       └── steps/
│           ├── location-step.tsx         # Step 1: Room location selector
│           ├── dimensions-step.tsx       # Step 2: Width/height + color
│           ├── glass-step.tsx            # Step 3: Glass solution cards
│           ├── services-step.tsx         # Step 4: Optional services
│           └── summary-step.tsx          # Step 5: Review and confirm
├── _hooks/
│   ├── use-wizard-form.ts                # Multi-step form state management
│   ├── use-wizard-navigation.ts          # Step navigation logic (next/back/jump)
│   ├── use-wizard-persistence.ts         # localStorage save/restore
│   └── use-add-to-budget.ts              # Mutation to add item to budget
├── _schemas/
│   ├── wizard-form.schema.ts             # Main wizard Zod schema
│   └── wizard-steps.schema.ts            # Individual step schemas
├── _utils/
│   ├── wizard-form.utils.ts              # getDefaults(), transform(), types
│   └── wizard-validation.utils.ts        # Dimension range checks, custom validators
└── _constants/
    ├── room-locations.constants.ts       # ROOM_LOCATIONS array
    └── wizard-config.constants.ts        # Step configuration, limits (MIN/MAX_DIMENSION)
```

**SOLID Requirements**:
- Single Responsibility: Each step component handles only its UI, validation in schemas
- No magic numbers: MIN_DIMENSION (500), MAX_DIMENSION (3000) in constants
- No inline schemas: All Zod validation extracted to _schemas/
- No mutation logic in UI: use-add-to-budget.ts handles API calls and cache invalidation
- No hardcoded defaults: getWizardDefaults() in wizard-form.utils.ts
- Navigation logic separated: use-wizard-navigation.ts handles all step transitions

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: End customers can complete a full quotation in under 3 minutes (compared to current 10+ minutes with technical form)
- **SC-002**: Wizard abandonment rate is below 15% (compared to current 35% with existing form)
- **SC-003**: Budget-to-Quote conversion rate increases to 55% or higher (from current 42%)
- **SC-004**: Price calculation updates appear within 200ms of user input (debounced dimension changes)
- **SC-005**: 90% of mobile users (viewport <768px) successfully complete the wizard on first attempt
- **SC-006**: System maintains WCAG 2.1 AA accessibility compliance (keyboard navigation, screen reader support, color contrast)
- **SC-007**: User satisfaction score (SUS - System Usability Scale) reaches 8/10 or higher
- **SC-008**: Zero data loss incidents reported due to browser navigation or refresh (localStorage persistence working)
- **SC-009**: 100% of quotation items created through wizard include room location data
- **SC-010**: Average time to recover from input error (e.g., invalid dimension) is under 10 seconds

---

## Assumptions

- Glass solutions (GlassSolution model) are already available in the database with proper categorization (thermal, acoustic, solar, security)
- Pricing engine (existing tRPC procedure) can handle rapid recalculations with debouncing on the client side
- Budget Cart functionality exists and can accept new items via existing API
- Users are browsing catalog models that have valid dimensions, colors, and glass compatibility
- localStorage is available in 95%+ of user browsers (progressive enhancement for the 5% without it)
- Mobile users represent 40-60% of catalog traffic based on industry standards for e-commerce
- The existing commercial form in `/catalog/[modelId]` will be moved to a separate route (e.g., `/admin/catalog/[modelId]`) in a future phase
- Services (e.g., Installation, Templado especial) are stored in the database and available via API
- Color selection affects pricing via existing percentage-based markup (e.g., "Nogal +15%")

---

## Dependencies

- **react-hook-form** (v7.64+): Multi-step form state management
- **zod** (v4.1.1): Schema validation for each wizard step
- **framer-motion** (optional): Smooth step transitions (fade + slide animations)
- **shadcn/ui** components: Button, Card, Input, Select, Checkbox, Progress indicators
- Existing tRPC procedures:
  - `catalog.get-model-by-id`: Fetch model details
  - `quote.calculate-item-price`: Real-time price calculation
  - `budget.add-item`: Add configured item to budget
- Existing Prisma models: Model, GlassSolution, Service, Color, QuoteItem
- Browser APIs: localStorage (with fallback if unavailable)

---

## Out of Scope

- Migration or modification of the existing commercial form (it will remain at `/catalog/[modelId]` for now)
- Advanced wizard features like conditional steps based on selections
- Multi-language support (wizard will be Spanish-only, consistent with current UI)
- Wizard analytics/tracking (e.g., step-by-step conversion funnels) - can be added later
- Integration with external CRM or ERP systems
- Offline mode or PWA capabilities
- Wizard customization per tenant (all tenants get same 4-step flow)
- AI-powered recommendations based on room type (future enhancement)
- 3D visualization or augmented reality preview

---

## Risks & Mitigations

| Risk                                                             | Impact | Probability | Mitigation                                                                       |
| ---------------------------------------------------------------- | ------ | ----------- | -------------------------------------------------------------------------------- |
| Wizard complexity leads to longer development time               | High   | Medium      | Create interactive Figma prototype first to validate UX before coding            |
| Price calculation performance degrades with rapid inputs         | Medium | Medium      | Implement 300ms debouncing on dimension inputs; cache previous calculations      |
| Users find wizard too restrictive compared to current form       | High   | Low         | Conduct user testing with 5-10 end customers before full rollout                 |
| Mobile UX doesn't meet usability standards                       | Medium | Medium      | Mobile-first design approach; test on real devices (iOS Safari, Android Chrome)  |
| localStorage quota exceeded in browsers                          | Low    | Low         | Implement fallback: wizard works without persistence; user sees no error         |
| Glass solution data quality issues (missing icons, descriptions) | Medium | Medium      | Audit existing GlassSolution records; create data migration script if needed     |
| Integration with existing Budget Cart breaks                     | High   | Low         | Write integration tests for add-to-budget flow before development                |
| Browser compatibility issues (older browsers)                    | Low    | Low         | Define minimum browser support: last 2 versions of Chrome, Firefox, Safari, Edge |

---

## Related User Stories

- **US-007**: Wizard minimalista para configurar ventana (this specification implements this story)
- **US-008**: Campo "Ubicación de la ventana" en ítem de cotización (implemented in Step 1 of this wizard)

---

## Notes

- The current catalog model detail page (`src/app/(public)/catalog/[modelId]/page.tsx`) serves the technical form for commercial users. This wizard will be implemented as a **separate component** that can be conditionally rendered based on user role or a feature flag.

- Future consideration: Once the wizard is validated with end customers, the technical form can be moved to an admin-only route (e.g., `/admin/catalog/[modelId]`) and the public catalog can exclusively show the wizard.

- The wizard's Step 3 (Glass Solution) will leverage existing `GlassSolution` data with visual categorization (icons for thermal, acoustic, solar, security). If current data lacks proper categorization, a data migration will be needed before implementation.

- Step 2 (Dimensions) combines dimension inputs AND color selection to keep steps minimal (4 total). This is intentional to reduce perceived complexity.

- The summary page (Step 5) is not counted in the "4 steps" communication to users - it's presented as a review/confirmation screen, not a configuration step.

- Room location options in Step 1 should match the constants defined in US-008 for consistency across the application.

- Persistence (User Story 3) uses a key format like `wizard-progress-${modelId}` to allow multiple models' wizards to coexist in localStorage.

- The wizard should detect if it's being rendered for a mobile viewport and adapt layouts accordingly (vertical step indicator, stacked cards, larger touch targets).
