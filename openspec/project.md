# Project Context

## Purpose

Glasify Lite is a full-stack glass quotation management application designed for the glass industry. The system enables businesses to:
- Manage a catalog of glass models and manufacturers
- Create and manage price quotations for glass products
- Handle user authentication with role-based access control (RBAC)
- Provide a public-facing catalog for browsing glass products
- Support administrative dashboard for business operations

**Goals**:
- Streamline the glass quotation workflow for sellers and administrators
- Provide an intuitive, accessible interface for catalog browsing
- Maintain data integrity through strong typing and validation
- Enable scalable, performant operations with server-first architecture

## Tech Stack

**Language & Runtime**:
- TypeScript 5.8.2 (strict mode, ES2022 target)
- Node.js (LTS)

**Framework**:
- Next.js 15.2.3 (App Router with React Server Components 19.0.0)

**Backend**:
- tRPC 11.0.0 (type-safe API layer)
- Prisma 6.16.2 (PostgreSQL ORM)
- NextAuth.js 5.0.0-beta.25 (authentication)
- PostgreSQL (database)

**Frontend**:
- React 19.0.0 (Server Components by default)
- TanStack Query 5.69.0 (client-side state)
- React Hook Form 7.63.0 + Zod 4.1.1 (forms and validation)

**UI/Styling**:
- Shadcn/ui + Radix UI (component primitives)
- TailwindCSS 4.0.15 (utility-first styling)

**Development Tools**:
- Ultracite 5.4.4 + Biome 2.2.4 (linting/formatting)
- Vitest 3.2.4 (unit/integration tests with jsdom)
- Playwright 1.55.1 (E2E tests)
- Winston 3.17.0 (server-side logging only)
- Lefthook 1.13.4 (git hooks)

## Project Conventions

### Code Style

**Naming Conventions**:
- **Files**: kebab-case (`quote-calculator.ts`, `catalog-search.tsx`)
- **Components**: PascalCase (`QuoteForm`, `CatalogSearch`)
- **Variables/Functions**: camelCase (`calculatePrice`, `handleSearchChange`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_GLASS_THICKNESS`, `DEFAULT_PAGE_LIMIT`)
- **Database entities**: PascalCase (`Manufacturer`, `QuoteItem`)
- **tRPC procedures**: kebab-case (`'quote.calculate-item'`, `'catalog.list-models'`)
- **Route Groups**: (lowercase) `(auth)`, `(dashboard)`, `(public)`
- **Private Folders**: _underscore-prefix `_components/`, `_hooks/`, `_utils/`, `_types/`

**Language Rules**:
- **Code, comments, commits**: English ONLY
- **UI text**: Spanish (es-LA) ONLY
  - "Cotización" not "Quote"
  - "Vidrio" not "Glass"
  - "Modelo" not "Model"

**Formatting**:
- Ultracite + Biome configuration enforced via git hooks
- Run `pnpm lint:fix` for automatic formatting
- CI blocks PRs that fail linting checks

### Architecture Patterns

**Server-First Architecture (Next.js 15)**:
- Server Components by default for all pages
- Client Components (`'use client'`) ONLY for: interactivity, React hooks, browser APIs
- Pattern: Server Page + Client Content
  ```typescript
  // page.tsx - Server Component
  export const metadata: Metadata = { title: '...' };
  export default async function Page() {
    const data = await api.endpoint(params);
    return <PageContent initialData={data} />;
  }
  
  // page-content.tsx - Client Component
  'use client';
  export function PageContent({ initialData }: Props) {
    // Interactivity here
  }
  ```

**SOLID Principles**:
- **Single Responsibility**: Each module has ONE clear responsibility
- **Open/Closed**: Extend via composition, not modification
- **Liskov Substitution**: Variants are substitutable
- **Interface Segregation**: Specific props, not generic interfaces
- **Dependency Inversion**: Depend on abstractions (hooks, tRPC), not implementations

**Atomic Design**:
- **Atoms**: UI primitives in `src/components/ui/` (shadcn/ui)
- **Molecules**: Simple combinations of atoms
- **Organisms**: Complex components with logic in `_components/`
- **Templates**: Page layouts (`layout.tsx`)
- **Pages**: Server Components orchestrating everything (`page.tsx`)

**Project Structure**:
```
src/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Route group: authentication
│   ├── (dashboard)/       # Route group: admin area
│   ├── (public)/          # Route group: public pages
│   ├── _components/       # Shared app components
│   └── _utils/            # Global utilities
├── components/ui/         # Shadcn/ui atoms (NO business logic)
├── hooks/                 # Global custom hooks
├── lib/                   # Utilities and configs
├── providers/             # React Context providers
├── server/                # Backend logic
│   ├── api/routers/       # tRPC routers
│   ├── auth/              # NextAuth config
│   ├── services/          # Business logic
│   └── db.ts              # Prisma singleton
└── trpc/                  # tRPC client config
```

**Critical Rules**:
- ✅ Winston Logger: Server-side ONLY (Server Components, Server Actions, tRPC, middleware)
- ❌ NEVER use Winston in Client Components or custom hooks
- ❌ NO barrel files (`index.ts`) anywhere
- ✅ Server Components by default
- ✅ ISR for semi-static content: `export const revalidate = 3600`

### Testing Strategy

**Pragmatic Testing Discipline**:
- Tests MAY be written before, during, or after implementation
- Tests MUST exist before merge
- Coverage required for: happy paths, critical edge cases

**Test Layers**:
- **Unit Tests** (Vitest): Pure functions, utilities, hooks
- **Integration Tests** (Vitest): tRPC procedures, service layer
- **Contract Tests** (Vitest): API contracts, schema validation
- **E2E Tests** (Playwright): User flows, RBAC scenarios

**Commands**:
- `pnpm test` - Run unit/integration tests
- `pnpm test:e2e` - Run E2E tests with Playwright
- `pnpm test:coverage` - Generate coverage report

**CI Requirements**:
- All tests MUST pass before merge
- Type checking MUST pass (`pnpm typecheck`)
- Linting MUST pass (`pnpm lint`)

### Git Workflow

**Branching Strategy**:
- `main` - Production-ready code
- Feature branches: `<issue-number>-<short-description>` (e.g., `009-role-based-access`)
- Branch names in English ONLY

**Commit Conventions**:
- **Format**: Conventional Commits (enforced via commitlint)
- **Examples**:
  - `feat: add role-based access control`
  - `fix: correct pricing formula in quote calculator`
  - `docs: update RBAC patterns in copilot instructions`
  - `refactor: extract quote filter logic to helper`
  - `test: add E2E tests for admin dashboard`

**PR Requirements**:
- At least one approving review
- All CI checks passing (tests, linting, type checking)
- Reference constitution principles when applicable
- Include migration notes for breaking changes

**Git Hooks** (Lefthook):
- Pre-commit: Lint staged files, type check
- Commit-msg: Validate conventional commit format

## Domain Context

**Glass Industry Domain**:
- **Models**: Glass product models with specifications (thickness, dimensions, performance ratings)
- **Manufacturers**: Companies producing glass products (stored as tenant configuration)
- **Quotes**: Price quotations for glass projects with line items
- **Quote Items**: Individual glass pieces within a quotation
- **Glass Solutions**: Use cases for glass (windows, doors, facades, etc.)

**Business Rules**:
- Pricing is calculated based on model, dimensions, and quantity
- Admin users manage catalog (models, manufacturers)
- Sellers create quotes for customers
- Regular users browse catalog and view own quotes
- Role-based access: admin > seller > user

**User Roles**:
- **admin**: Full system access (dashboard, catalog management, all quotes, user management)
- **seller**: Quote management + catalog (own quotes only)
- **user**: Catalog browsing + own quotes viewing

## Important Constraints

**Server-Side Only**:
- Winston logger MUST NOT be used in Client Components (Node.js modules unavailable in browser)
- Use `console`, toast notifications, or error boundaries for client-side logging

**Performance**:
- ISR (Incremental Static Regeneration) for catalog pages: `export const revalidate = 3600`
- Streaming with `<Suspense>` for better Core Web Vitals
- Debounce for search inputs (300ms default)

**Security**:
- All inputs MUST be validated server-side (Zod in tRPC `.input()`)
- Authorization checks in middleware, tRPC procedures, and UI guards (defense-in-depth)
- No secrets in code (use `@t3-oss/env-nextjs` for environment validation)
- NextAuth.js for session management

**Accessibility**:
- Semantic HTML required
- WCAG AA color contrast
- Keyboard navigation support
- ARIA attributes when needed

**Data Integrity**:
- Prisma ORM prevents SQL injection
- Zod schema validation on all boundaries
- Type safety enforced end-to-end (TypeScript strict mode)

## External Dependencies

**Authentication**:
- NextAuth.js 5.0.0-beta.25 (session-based auth)
- Session storage via Prisma adapter
- Role-based access control (RBAC) middleware

**Database**:
- PostgreSQL (managed or local)
- Prisma migrations for schema versioning
- Connection pooling via Prisma

**Third-Party Services**:
- None currently (self-hosted solution)

**Development Services**:
- Prisma Studio for database management (`pnpm db:studio`)
- Playwright UI for E2E test debugging (`pnpm test:e2e --ui`)

**Environment Variables**:
Required vars managed via `@t3-oss/env-nextjs`:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Auth session encryption key
- `NEXTAUTH_URL` - Base URL for auth callbacks
- `NODE_ENV` - Environment identifier
