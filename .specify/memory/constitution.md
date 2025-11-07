# Glasify Lite Constitution
**Version**: 2.2.1  
**Ratified**: 2025-10-09  
**Last Amended**: 2025-01-10

---

## About This Document

This constitution defines the **non-negotiable principles and values** that guide all engineering decisions in Glasify Lite. It is written in plain language to be accessible to all team members, regardless of technical background.

For **technical implementation details**, code patterns, and specific framework usage, see `.github/copilot-instructions.md`.

---

## Core Values

### 1. Clarity Over Complexity

**What it means**: Code should be easy to understand, not clever or complex.

**Why it matters**: Simple code is easier to maintain, debug, and improve. Every team member should be able to understand what the code does without extensive documentation.

**In practice**:
- Use clear, descriptive names for variables and functions
- Break complex logic into smaller, understandable pieces
- Write code that reads like a story, not a puzzle

**Examples**:
- ✅ `calculateTotalPrice(items)` instead of `calc(x)`
- ✅ `isUserAuthenticated()` instead of `chk()`
- ✅ Small functions with one clear purpose

---

### 2. Server-First Performance

**What it means**: Do heavy work on the server, not in the user's browser.

**Why it matters**: Servers are faster and more secure than browsers. Users get faster load times and better experiences when we process data on the server.

**In practice**:
- Fetch and prepare data on the server before sending to browser
- Only use browser code when you need user interaction (clicks, typing)
- Cache frequently-accessed data to avoid repeated work

**Caching Strategy**:
- **Semi-static content**: Use 30-60 second cache (admin pages, catalog data)
- **Rarely-changing data**: Use 5-minute cache (suppliers, product types)
- **User-specific data**: Use short cache or no cache (personal quotes)

**Cache Refresh After Changes**:
- When you create, update, or delete data on the server, the browser needs to know
- Use `router.refresh()` to tell Next.js to get fresh data from the server
- This updates the page without losing the user's place or what they were doing
- Always combine with cache invalidation: clear old data + fetch new data

**Examples**:
- ✅ Load product list on server, send ready data to browser
- ✅ Cache product catalog for 5 minutes (it rarely changes)
- ✅ After creating a service, refresh the page to show the new service
- ✅ After deleting an item, refresh so it disappears from the list
- ❌ Load all products in browser and filter there
- ❌ Reload same data every time user clicks back
- ❌ Expect the page to update automatically without refresh (it won't with SSR)

---

### 3. One Job, One Place (SOLID Architecture)

**What it means**: Each piece of code should do one thing and do it well. Components must be modular, testable, and easy to change.

**Why it matters**: When code has multiple responsibilities, changes become risky. You might break one feature while fixing another. SOLID principles ensure code is maintainable long-term.

**SOLID Principles Applied**:

1. **Single Responsibility**: Each module has one reason to change
   - Forms only handle UI and user interaction
   - Hooks manage state and side effects
   - Services handle business logic
   - Utilities provide pure functions

2. **Open/Closed**: Open for extension, closed for modification
   - Add features through new files, not editing existing ones
   - Use composition over inheritance
   - Extract configuration and constants

3. **Liskov Substitution**: Components can be replaced by variants
   - Props interfaces are specific, not generic
   - Variants maintain the same contract

4. **Interface Segregation**: Specific interfaces, not generic ones
   - Break large prop types into smaller, focused ones
   - Don't force components to depend on props they don't use

5. **Dependency Inversion**: Depend on abstractions
   - Use hooks to abstract data fetching
   - Use context for cross-cutting concerns
   - Don't couple components to specific implementations

**Mandatory File Organization**:

Forms must follow this structure:
```
feature/
├── _components/
│   └── feature-form.tsx          # UI only (orchestration)
├── _hooks/
│   ├── use-feature-mutations.ts  # API mutations + cache
│   └── use-feature-data.ts       # Data fetching
├── _schemas/
│   └── feature-form.schema.ts    # Zod validation
├── _utils/
│   └── feature-form.utils.ts     # Pure functions + types
└── _constants/
    └── feature-form.constants.ts # Magic numbers extracted
```

**Violations that MUST be refactored**:
- ❌ Forms with 200+ lines containing mutations, validation, defaults, and UI
- ❌ Magic numbers scattered in code (must extract to constants)
- ❌ Inline Zod schemas in components (must extract to _schemas/)
- ❌ Mutation logic in components (must extract to _hooks/)
- ❌ Default values hardcoded in forms (must extract to _utils/)
- ❌ Business logic mixed with UI rendering

**Examples**:
- ✅ `user-form.tsx` handles UI orchestration (60 lines)
- ✅ `use-user-mutations.ts` handles create/update + cache invalidation
- ✅ `use-user-data.ts` fetches related data (roles, departments)
- ✅ `user-form.schema.ts` contains Zod validation schema
- ✅ `user-form.utils.ts` has getDefaultValues() and transformValues()
- ✅ `user-form.constants.ts` has MIN_AGE, MAX_NAME_LENGTH, etc.
- ❌ One 300-line file with everything mixed together

---

### 4. Flexible Testing

**What it means**: Tests are required, but you choose when to write them.

**Why it matters**: Different features need different approaches. What matters is that critical paths are tested before code goes live.

**In practice**:
- You can write tests before, during, or after coding
- All features must have tests before merging to main branch
- Focus on testing what users actually do (user journeys)
- Test error cases and edge conditions

**Examples**:
- ✅ Write tests first if you know exactly what to build
- ✅ Write tests after if you're exploring solutions
- ✅ Write tests during if that fits your workflow
- ❌ No tests at all (blocking issue for merge)

---

### 5. Extend, Don't Modify

**What it means**: Add new features without changing existing code.

**Why it matters**: Changing working code is risky. Adding new code alongside old code is safer.

**In practice**:
- Add new features through configuration or plugins
- Keep existing interfaces stable
- When you must change something, provide migration path

**Examples**:
- ✅ Add new report type by creating new component
- ✅ Add new payment method through plugin system
- ❌ Change existing calculator to add new feature (might break other features)

---

### 6. Security From the Start

**What it means**: Check permissions and validate data at every entry point.

**Why it matters**: Users can be malicious or make mistakes. The system must protect itself and legitimate users.

**In practice**:
- Validate all user input on the server
- Check user permissions before allowing actions
- Never trust data from browsers
- Log security-related events

**Examples**:
- ✅ Check if user has admin role before showing admin panel
- ✅ Validate email format before saving to database
- ✅ Log all login attempts (success and failure)
- ❌ Assume browser-side validation is enough

---

### 7. Track Everything Important

**What it means**: Log significant events and errors so we can diagnose problems.

**Why it matters**: When something goes wrong in production, logs are our only way to understand what happened.

**In practice**:
- Log errors with enough context to debug
- Track important user actions (login, purchases, quote creation)
- Use structured logs (consistent format)
- Never log passwords or sensitive data

**Logging Rules**:
- **Server-side only**: Use Winston logger in server code only
- **Client-side**: Use browser console for development, toast messages for users
- **Correlation IDs**: Track related events together
- **Spanish messages**: Error messages shown to users must be in Spanish

**Examples**:
- ✅ Log when user creates a quote (with quote ID and user ID)
- ✅ Log errors with full context (what failed, when, why)
- ❌ Log every button click (too much noise)
- ❌ Log passwords or credit card numbers

---

## Language & Communication

### Code and Comments: English Only

**Why**: English is the universal language of software development. All code, comments, and technical documentation must be in English for consistency and accessibility to the global developer community.

**Examples**:
- ✅ `calculatePrice(items)` with comment "// Calculate total including tax"
- ❌ `calcularPrecio(items)` with comment "// Calcular total incluyendo impuesto"

### User Interface: Spanish Only (es-LA)

**Why**: Our users are Spanish speakers in Latin America. All user-facing text must be in Spanish.

**Examples**:
- ✅ Button text: "Crear Cotización"
- ✅ Error message: "El correo electrónico no es válido"
- ❌ Button text: "Create Quote"
- ❌ Error message: "Email is not valid"

### Commit Messages: English Only

**Why**: Git history is part of technical documentation. Follow conventional commits format.

**Examples**:
- ✅ `feat: add user authentication`
- ✅ `fix: correct price calculation for discounts`
- ❌ `feat: agregar autenticación de usuario`

---

## Technology Constraints

### Required Stack

The following technologies are mandatory for consistency and team expertise:

**Core Framework**:
- Next.js 16 (App Router with React Server Components)
- TypeScript (strict mode enabled)

**Backend**:
- tRPC (type-safe API communication)
- Prisma (database access)
- PostgreSQL (database)
- Better Auth (authentication)

**Frontend**:
- React 19 (Server Components first)
- Shadcn/ui + Radix UI (component library)
- TailwindCSS (styling)
- React Hook Form (forms)

**Testing**:
- Vitest (unit/integration tests)
- Playwright (end-to-end tests)

**Code Quality**:
- Biome + Ultracite (formatting and linting)

### What You Cannot Use

- ❌ Other JavaScript frameworks (Vue, Angular, Svelte)
- ❌ Alternative form libraries without approval
- ❌ CSS frameworks other than TailwindCSS
- ❌ Winston logger in browser code (server-side only)

---

## Cache Components Best Practices

Next.js 16 Cache Components enable build-time prerendering and runtime prefetching. Follow these rules to avoid incompatibility errors.

### Core APIs

- **`"use cache"`**: Public cache for build-time prerendering (static pages)
- **`"use cache: private"`**: Private cache for runtime prefetching (allows dynamic APIs)
- **`cacheLife(profile)`**: Time-based revalidation ("hours", "days", "max", custom)
- **`cacheTag(tag)`**: Tag-based cache invalidation

### Forbidden in `"use cache"` Functions

These APIs are **incompatible** with public cache (build-time prerendering):

- ❌ `headers()` and `cookies()` (dynamic data sources)
- ❌ Winston logger (uses `headers()` internally)
- ❌ `Date.now()` before accessing dynamic data (triggers prerendering issues)
- ❌ Route Segment Config exports (`dynamic`, `revalidate`, `runtime`)
- ❌ Empty arrays from `generateStaticParams()`

### What to Use Instead

- ✅ **`performance.now()`** for timing measurements (not system time)
- ✅ **Direct Prisma access** for static cached pages (bypass tRPC)
- ✅ **`"use cache: private"`** if you need `headers()`/`cookies()`
- ✅ **`<Suspense>` boundaries** for uncached data in Server Components
- ✅ **Placeholder values** in `generateStaticParams()` if no data available

### Migration Pattern

When enabling Cache Components:

1. Remove all Route Segment Config exports
2. Add `"use cache"` for static content
3. Remove logger from cached functions
4. Replace `Date.now()` with `performance.now()`
5. Ensure `generateStaticParams()` returns non-empty arrays
6. Wrap uncached data access in `<Suspense>`

**Example**:
```typescript
// ❌ BEFORE (incompatible)
export const dynamic = 'force-static';
export default async function Page() {
  const start = Date.now();
  const data = await api.getData();
  logger.info('Fetched data'); // uses headers()
  return <div>{data}</div>;
}

// ✅ AFTER (Cache Components compatible)
export default async function Page() {
  "use cache";
  cacheLife("hours");
  
  const start = performance.now(); // not Date.now()
  const data = await prisma.findMany(); // not tRPC (avoids headers)
  // logger removed - use console in development only
  return <div>{data}</div>;
}
```

---

---

## Quality Gates

All code changes must pass these checks before merging:

### Automated Checks (Must Pass)
- [ ] TypeScript type checking (no errors)
- [ ] Code formatting (Biome/Ultracite)
- [ ] Unit tests (all passing)
- [ ] Integration tests (if applicable)
- [ ] End-to-end tests (if user flows affected)

### Human Review (Must Pass)
- [ ] At least one code reviewer approval
- [ ] Large or risky changes require two approvals
- [ ] Security-sensitive changes require security review

### Documentation (Must Include)
- [ ] Changelog entry for user-facing changes
- [ ] Migration notes if breaking changes
- [ ] Examples for new public APIs

---

## Governance

### How This Document Works

The constitution is the **ultimate authority** for engineering decisions. When in doubt, refer to these principles.

### How to Propose Changes

1. Create a pull request against `.specify/memory/constitution.md`
2. Explain **why** the change is needed (rationale)
3. Explain **how** it affects existing code (impact analysis)
4. Provide migration plan if it breaks existing patterns
5. Get approval:
   - **MAJOR changes**: 2 maintainer approvals
   - **MINOR/PATCH changes**: 1 maintainer approval

### Change Types

- **MAJOR (3.0.0)**: Remove or significantly change a core principle
- **MINOR (2.1.0)**: Add new principle or materially expand guidance
- **PATCH (2.0.1)**: Clarify wording, fix typos, non-semantic refinements

### Compliance

- All pull requests **must** reference constitution when touching principles
- Violations of **must** rules block merge until resolved
- Team is notified of constitution changes through communication channel

---

## Principle Priority

When principles conflict (rare), use this order:

1. **Security From the Start** (no compromises on security)
2. **One Job, One Place (SOLID Architecture)** (maintainability and testability)
3. **Clarity Over Complexity** (readable code over clever code)
4. **Server-First Performance** (fast for users)
5. **Flexible Testing** (quality assurance)
6. **Extend, Don't Modify** (stability)
7. **Track Everything Important** (observability)

---

## Success Metrics

We measure success by:

- **User Experience**: Page load times <2 seconds
- **Code Quality**: Test coverage >80% for critical paths
- **Development Speed**: Features deployed within sprint goals
- **Stability**: <5% error rate in production
- **Maintainability**: New developers productive within 1 week

---

## Questions?

If something is unclear:
1. Check `.github/copilot-instructions.md` for technical implementation details
2. Ask in team communication channel
3. Propose a constitution amendment to clarify

---

<!--
Sync Impact Report

- Version change: 2.2.0 → 2.2.1 (PATCH)
- Modified sections:
  * Technology Constraints → Added "Cache Components Best Practices" subsection
    - Core APIs: "use cache", cacheLife(), cacheTag()
    - Forbidden APIs in cached functions (headers, cookies, logger, Date.now())
    - Recommended alternatives (performance.now(), Prisma direct, Suspense)
    - Migration pattern with before/after example
- Added sections:
  * Cache Components Best Practices (practical migration guidance)
- Removed sections: none
- Templates requiring updates:
  * .github/copilot-instructions.md ⚠ PENDING (add Cache Components section to Critical Rules)
  * .specify/templates/plan-template.md ✅ no changes needed (architecture-agnostic)
  * .specify/templates/spec-template.md ✅ no changes needed (feature-focused)
  * .specify/templates/tasks-template.md ✅ no changes needed (task-focused)
- Follow-up TODOs:
  * Update copilot-instructions.md with Cache Components critical rules
  * Remove obsolete "Use Date.now()" lint rule from copilot-instructions
  * Add Cache Components validation to code generation checklist
- Changes summary:
  * PATCH version bump for technical clarifications (not new principle)
  * Documented Cache Components migration patterns discovered during Next.js 16 upgrade
  * Provides actionable guidance for avoiding build errors
  * Clarifies incompatible APIs and their alternatives
  * Maintains "clarity over quantity" with concise, practical examples
- Rationale:
  * Recent Cache Components migration revealed systematic incompatibilities
  * Team needs clear guidance on forbidden APIs and alternatives
  * performance.now() vs Date.now() distinction is critical for build success
  * Prevents future Cache Components errors in new features
  * Aligns with constitution principle of "Server-First Performance"
  * Complements existing .github/copilot-instructions.md patterns
  * Real-world migration example clarifies abstract concepts
-->

