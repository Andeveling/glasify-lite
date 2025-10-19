# Glasify Lite Constitution
**Version**: 2.1.0  
**Ratified**: 2025-10-09  
**Last Amended**: 2025-01-19

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

**Examples**:
- ✅ Load product list on server, send ready data to browser
- ✅ Cache product catalog for 5 minutes (it rarely changes)
- ❌ Load all products in browser and filter there
- ❌ Reload same data every time user clicks back

---

### 3. One Job, One Place

**What it means**: Each piece of code should do one thing and do it well.

**Why it matters**: When code has multiple responsibilities, changes become risky. You might break one feature while fixing another.

**In practice**:
- Separate user interface from business logic
- Keep data fetching separate from data display
- One file, one purpose

**Examples**:
- ✅ `user-form.tsx` handles the form UI
- ✅ `user-service.ts` handles saving user data
- ✅ `user-validator.ts` checks if data is valid
- ❌ One giant file that does everything

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
- Next.js 15 (App Router with React Server Components)
- TypeScript (strict mode enabled)

**Backend**:
- tRPC (type-safe API communication)
- Prisma (database access)
- PostgreSQL (database)
- NextAuth.js (authentication)

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
2. **Clarity Over Complexity** (readable code over clever code)
3. **Server-First Performance** (fast for users)
4. **One Job, One Place** (maintainability)
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

- Version change: 2.0.1 → 2.1.0 (MINOR)
- Modified principles:
  * Server-First Architecture: Enhanced clarity on ISR vs force-dynamic usage
  * Observability & Versioning: Clarified Winston logger restrictions
  * Development Workflow: Added performance optimization guidelines
- Added sections:
  * Performance & Caching Strategy (new principle under Server-First Architecture)
  * Performance budgets and success metrics
- Removed sections: none
- Templates updated:
  * .specify/templates/plan-template.md ✅ verified (Constitution Check aligned)
  * .specify/templates/spec-template.md ✅ verified (requirements structure compatible)
  * .specify/templates/tasks-template.md ✅ verified (testing flexibility maintained)
  * .github/copilot-instructions.md ✅ updated (technical patterns documented separately)
- Follow-up TODOs: none
- Changes summary:
  * Separated technical implementation details from constitution principles
  * Rewrote in plain language for accessibility to non-technical stakeholders
  * Added performance optimization guidance (ISR with revalidate, staleTime configuration)
  * Clarified Server-First Architecture with concrete examples in simple terms
  * Enhanced observability section with explicit Winston usage rules
  * Maintained flexibility in testing workflow
  * Technical patterns moved to copilot-instructions.md for implementation reference
  * Added principle priority order for conflict resolution
  * Added success metrics for measuring adherence to principles
-->