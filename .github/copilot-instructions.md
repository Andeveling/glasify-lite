# Glasify Lite Development Guidelines

**Project Type**: Full-stack glass quotation management application  
**Last Updated**: 2025-10-14  
**Constitution**: See `.specify/memory/constitution.md`

## Code Generation Priorities

When generating code for this repository:

1. **Version Compatibility**: Always detect and respect exact versions of languages, frameworks and libraries
2. **Context Files**: Prioritize patterns defined in `.github/instructions/` directory
3. **Codebase Patterns**: When context files don't provide guidance, scan codebase for established patterns
4. **Architectural Consistency**: Maintain Next.js 15 App Router + tRPC style and boundaries
5. **Code Quality**: Prioritize maintainability, performance, security, accessibility and testability

---

## Active Technologies
- PostgreSQL via Prisma ORM (existing schema in `prisma/schema.prisma`) (011-admin-catalog-management)

**Language/Runtime**:
- TypeScript 5.8.2 (strict mode), Node.js (ES2022 target)

**Framework**:
- Next.js 15.2.3 (App Router, React Server Components 19.0.0)

**Core Dependencies**:
- tRPC 11.0.0 (type-safe API)
- Prisma 6.16.2 (PostgreSQL ORM)
- NextAuth.js 5.0.0-beta.25 (authentication)
- TanStack Query 5.69.0 (React Query)
- Zod 4.1.1 (schema validation)
- React Hook Form 7.63.0 (forms)

**UI Stack**:
- Shadcn/ui + Radix UI (components)
- TailwindCSS 4.0.15 (styling)

**Development Tools**:
- Ultracite 5.4.4 + Biome 2.2.4 (linting/formatting)
- Vitest 3.2.4 (unit/integration tests with jsdom)
- Playwright 1.55.1 (E2E tests)
- Winston 3.17.0 (server-side logging)
- Lefthook 1.13.4 (git hooks)

---

## Critical Rules

### Winston Logger - Server-Side ONLY

⚠️ **IMPORTANT**: Winston uses Node.js modules (`fs`, `path`) that are **NOT available in browser**.

**✅ ALLOWED** (Server-Side):
- Server Components
- Server Actions (`'use server'`)
- API Route Handlers (`/api/*`)
- tRPC Procedures (`/server/api/routers`)
- Middleware (`middleware.ts`)
- Server-side utilities (`/server/*`)

**❌ PROHIBITED** (Client-Side):
- Client Components (`'use client'`)
- Custom Hooks (`use*.ts`)
- Client-side utilities used by components
- Any browser-executed code

**Client-Side Alternatives**:
- Use `console` (development only)
- Use toast notifications (user feedback)
- Use error boundaries (error handling)

**Client-Side Alternatives**:
- Use `console` (development only)
- Use toast notifications (user feedback)
- Use error boundaries (error handling)

### Naming Conventions

- **Files**: kebab-case (`quote-calculator.ts`, `catalog-search.tsx`)
- **Components**: PascalCase (`QuoteForm`, `CatalogSearch`)
- **Variables/Functions**: camelCase (`calculatePrice`, `handleSearchChange`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_GLASS_THICKNESS`, `DEFAULT_PAGE_LIMIT`)
- **Database entities**: PascalCase (`Manufacturer`, `QuoteItem`)
- **tRPC procedures**: kebab-case (`'quote.calculate-item'`, `'catalog.list-models'`)
- **Route Groups**: (lowercase) `(auth)`, `(dashboard)`, `(public)`
- **Private Folders**: _underscore-prefix `_components/`, `_hooks/`, `_utils/`, `_types/`

- **Route Groups**: (lowercase) `(auth)`, `(dashboard)`, `(public)`
- **Private Folders**: _underscore-prefix `_components/`, `_hooks/`, `_utils/`, `_types/`

### Language Rules

**Code/Comments/Commits**: English ONLY
- Conventional commits format
- Examples: `feat: add role-based access`, `fix: correct pricing formula`

**UI Text**: Spanish (es-LA) ONLY
- "Cotización" not "Quote"
- "Vidrio" not "Glass"
- "Modelo" not "Model"
- "Fabricante" not "Manufacturer"

---

## Project Structure

Next.js 15 App Router with strict organizational rules:

```
glasify-lite/
├── src/
│   ├── app/                          # Next.js 15 App Router
│   │   ├── (auth)/                   # Route group: authentication pages
│   │   ├── (dashboard)/              # Route group: protected admin area
│   │   ├── (public)/                 # Route group: public area
│   │   │   └── catalog/
│   │   │       ├── _components/      # Private components (organisms/molecules)
│   │   │       ├── _hooks/           # Feature-specific custom hooks
│   │   │       ├── _types/           # Feature-specific TypeScript types
│   │   │       ├── _utils/           # Feature-specific utilities (pure functions)
│   │   │       └── page.tsx          # Server Component
│   │   ├── _components/              # Shared app components
│   │   ├── _utils/                   # Global app utilities
│   │   ├── api/trpc/[trpc]/         # tRPC API routes
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Home page
│   │
│   ├── components/ui/                # Shadcn/ui atoms (NO business logic)
│   ├── hooks/                        # Global custom hooks
│   ├── lib/                          # Utilities and configurations
│   │   ├── logger.ts                 # Winston singleton (SERVER-SIDE ONLY)
│   │   └── utils.ts                  # Helper functions
│   ├── providers/                    # React Context providers
│   ├── server/                       # Backend logic (tRPC, Prisma)
│   │   ├── api/routers/              # tRPC routers (kebab-case procedures)
│   │   ├── auth/                     # NextAuth config
│   │   ├── services/                 # Business logic services
│   │   └── db.ts                     # Prisma singleton client
│   ├── trpc/                         # tRPC client configuration
│   ├── middleware.ts                 # Next.js middleware
│   └── env.js                        # Environment validation
│
├── prisma/                           # Database schema and migrations
├── tests/                            # Unit, integration, contract tests
├── e2e/                              # Playwright E2E tests
└── docs/                             # Project documentation
```

**Organization Rules**:
- Route Groups: `(name)` for organizing routes without affecting URLs
- Private Files: `_name` for folders/files that are not routes (colocation)
- Nested Layouts: Share UI between related routes
- Loading/Error: Use `loading.tsx` and `error.tsx` for states

**Organization Rules**:
- Route Groups: `(name)` for organizing routes without affecting URLs
- Private Files: `_name` for folders/files that are not routes (colocation)
- Nested Layouts: Share UI between related routes
- Loading/Error: Use `loading.tsx` and `error.tsx` for states

---

## Arquitectura Next.js 15 + SOLID + Atomic Design

### Server-First Architecture

- **Server Components by default**, Client Components only when necessary
- Use `'use client'` directive ONLY for: interactivity, React hooks, browser APIs
- Leverage Server Actions for data mutations
- ISR (Incremental Static Regeneration) with `revalidate` for semi-static content
- Streaming with `<Suspense>` for better Core Web Vitals

### SOLID Principles

- **Single Responsibility**: Each module/component has ONE clear responsibility
- **Open/Closed**: Components open for extension, closed for modification
- **Liskov Substitution**: Components can be replaced by their variants
- **Interface Segregation**: Specific props, not generic interfaces
- **Dependency Inversion**: Depend on abstractions (hooks, contexts) not implementations

### Atomic Design

- **Atoms**: Basic UI components (`Button`, `Input`) in `src/components/ui/`
- **Molecules**: Simple combinations of atoms
- **Organisms**: Complex components with logic in `_components/`
- **Templates**: Page layouts without data as `layout.tsx`
- **Pages**: Server Components that orchestrate everything in `page.tsx`

- **Templates**: Page layouts without data as `layout.tsx`
- **Pages**: Server Components that orchestrate everything in `page.tsx`

---

## SOLID Patterns in Practice

### Single Responsibility Principle (SRP)

```typescript
// ✅ GOOD: Separated responsibilities
// 1. Page: Orchestration (Server Component)
export default async function CatalogPage({ searchParams }: Props) {
  const data = await api.catalog['list-models'](searchParams);
  return <CatalogContent initialData={data} />;
}

// 2. Hook: State management
export function useDebouncedSearch(initialValue = '', debounceMs = 300) {
  // Logic here
  return { query, handleSearchChange, handleClear };
}

// 3. Component: UI presentation
export function CatalogSearch({ initialValue }: Props) {
  const { query, handleSearchChange } = useDebouncedSearch(initialValue);
  return <Input value={query} onChange={handleSearchChange} />;
}

// 4. Utility: Pure function
export function calculateTotalPages(total: number, itemsPerPage: number) {
  return Math.ceil(total / itemsPerPage);
}
```

### Open/Closed Principle (OCP)

```typescript
// ✅ Open for extension, closed for modification
export function CatalogFilters({
  showControls = true,
  showBadges = true,
  showResultCount = true,
  ...props
}: Props) {
  return (
    <>
      {showControls && <ManufacturerFilter {...props} />}
      {showBadges && <ActiveFilterBadges {...props} />}
      {showResultCount && <ResultCount total={totalResults} />}
    </>
  );
}
```

### Dependency Inversion Principle (DIP)

```typescript
// ✅ Depend on abstractions (tRPC procedure), not Prisma directly
async function CatalogContent({ searchQuery, page }: Props) {
  const { items } = await api.catalog['list-models']({ search: searchQuery, page });
  return <CatalogGrid models={items} />;
}
```---

## Patrones de Atomic Design

### Atoms (Componentes UI Básicos)

**Ubicación**: `src/components/ui/`

**Características**:

- Componentes de UI más básicos (Button, Input, Label, Badge)
- Sin lógica de negocio, solo presentación y variantes
- Shadcn/ui components con Radix UI
- Usan `class-variance-authority` (CVA) para variantes
- Props tipadas con `React.ComponentProps<'elemento'>`

### Organisms (Componentes Complejos)

**Ubicación**: `src/app/(route)/_components/`

**Características**:

- Componentes con lógica de negocio y estado complejo
- Componen atoms y molecules
- Pueden ser Server o Client Components según necesidad
- Usan custom hooks para separar lógica

### Pages (Orquestación Final)

**Ubicación**: `src/app/(route)/page.tsx`

**Características**:

- Server Components que orquestan todo
- Fetch de datos en el servidor
- Composición de organisms, molecules y atoms
- Manejo de Suspense boundaries

---

## Best Practices for Pages

### Pages MUST be Server Components by Default

```typescript
// ✅ Server Page + Client Content pattern
export const metadata: Metadata = { title: 'Catálogo' };
export const revalidate = 3600; // ISR

export default async function CatalogPage({ searchParams }: Props) {
  const data = await api.catalog['list-models'](searchParams);
  return <CatalogPageContent initialData={data} />;
}
```

**Configuration Options**:
- Static (default): `export default async function Page() { }`
- ISR: `export const revalidate = 3600;`
- Dynamic: `export const dynamic = 'force-dynamic';`

**Checklist**:
- [ ] Server Component by default
- [ ] Metadata export (if public)
- [ ] Delegates interactivity to Client Components
- [ ] Server-side data fetching
- [ ] Suspense for streaming

---

## Code Quality Standards

### Maintainability
- Self-documenting code with clear names
- Single Responsibility per function/component
- Functions < 50 lines

### Performance
- Server Components by default
- ISR for semi-static content: `export const revalidate = 3600`
- Streaming with Suspense
- Debounce for searches

### Security
- Zod validation in tRPC procedures
- Prisma ORM (prevents SQL injection)
- NextAuth.js for protected routes
- Security headers in `next.config.js`

### Accessibility
- Semantic HTML (`<button>`, `<nav>`)
- ARIA attributes when needed
- Keyboard navigation
- WCAG AA color contrast

### Testability
- Pure functions, logic separated from UI
- Isolated unit tests
- Coverage for critical paths

---

## Next.js Specific Rules

**Prohibited**:
- ❌ `<img>` (use `<Image>` from `next/image`)
- ❌ `<head>` (use `metadata` export)
- ❌ `<a>` for internal navigation (use `<Link>`)
- ❌ `useRouter` for simple navigation (use `<Link>`)

**Preferred**:
- ✅ Server Components by default
- ✅ `<Link>` for navigation
- ✅ `<Image>` for images
- ✅ ISR with `revalidate`

---

## Common Development Tasks

- `pnpm lint:fix` - Format and fix code automatically with Ultracite
- `pnpm lint` - Check for issues without fixing
- `pnpm dev` - Start Next.js development server (with Turbo)
- `pnpm db:generate` - Run Prisma migrations in development
- `pnpm db:studio` - Open Prisma Studio for database management
- `pnpm test` - Run unit and contract tests with Vitest
- `pnpm test:e2e` - Run E2E tests with Playwright
- `pnpm typecheck` - Check TypeScript types

---

## Role-Based Access Control (RBAC) Patterns

### Authorization Layers

Glasify implements **defense-in-depth authorization** with three layers:

1. **Middleware Layer** (`src/middleware.ts`): Route-level protection
2. **tRPC Layer** (`src/server/api/trpc.ts`): API procedure authorization
3. **UI Layer** (`src/app/_components/`): Conditional rendering guards

### User Roles

- **admin**: Full system access (dashboard, models, all quotes, settings, users)
- **seller**: Quote management + catalog (own quotes only, blocked from admin routes)
- **user**: Catalog + own quotes (blocked from admin routes)

### Common RBAC Patterns

#### Pattern 1: Protect Admin Routes (Middleware)

```typescript
// src/middleware.ts
export async function middleware(req: NextRequest) {
  const session = await auth();
  const { pathname } = req.nextUrl;

  // Admin-only routes
  const adminRoutes = ['/dashboard'];
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (session?.user?.role !== 'admin') {
      logger.warn('Unauthorized access attempt', { 
        userId: session?.user?.id,
        role: session?.user?.role,
        path: pathname 
      });
      return NextResponse.redirect(new URL('/my-quotes', req.url));
    }
  }
  
  return NextResponse.next();
}
```

#### Pattern 2: Admin-Only tRPC Procedure

```typescript
// src/server/api/routers/admin/admin.ts
import { adminProcedure } from '../../trpc';

export const adminRouter = router({
  'create-model': adminProcedure
    .input(createModelSchema)
    .mutation(async ({ ctx, input }) => {
      // Only admins can reach here
      return await ctx.db.model.create({ data: input });
    }),
});
```

#### Pattern 3: Role-Based Data Filtering

```typescript
// src/server/api/routers/quote.ts
import { getQuoteFilter } from '../../trpc';

export const quoteRouter = router({
  'list-user-quotes': protectedProcedure
    .input(listQuotesSchema)
    .query(async ({ ctx, input }) => {
      const roleFilter = getQuoteFilter(ctx.session);
      // Admin sees all, others see only own
      return await ctx.db.quote.findMany({
        where: { ...roleFilter, ...input.filters },
      });
    }),
});
```

#### Pattern 4: Ownership Validation (Admin or Owner)

```typescript
// src/server/api/routers/quote.ts
export const quoteRouter = router({
  'get-by-id': protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const quote = await ctx.db.quote.findUnique({ where: { id: input.id } });
      
      const isOwner = quote?.userId === ctx.session.user.id;
      const isAdmin = ctx.session.user.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No tienes permiso para ver esta cotización',
        });
      }
      
      return quote;
    }),
});
```

#### Pattern 5: Conditional UI Rendering (Server Component)

```typescript
// src/app/(dashboard)/models/page.tsx
import { AdminOnly } from '@/app/_components/admin-only';

export default async function ModelsPage() {
  return (
    <div>
      <h1>Modelos</h1>
      
      {/* Only admins see this button */}
      <AdminOnly>
        <Button>Crear Modelo</Button>
      </AdminOnly>
      
      <ModelsList />
    </div>
  );
}
```

#### Pattern 6: Role-Based Navigation

```typescript
// src/app/_components/role-based-nav.tsx
export function getNavLinksForRole(role?: UserRole): NavLink[] {
  switch (role) {
    case 'admin':
      return [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/dashboard/models', label: 'Modelos' },
        { href: '/dashboard/quotes', label: 'Cotizaciones' },
        { href: '/dashboard/users', label: 'Usuarios' },
      ];
    case 'seller':
    case 'user':
      return [
        { href: '/my-quotes', label: 'Mis Cotizaciones' },
        { href: '/catalog', label: 'Catálogo' },
      ];
    default:
      return [
        { href: '/catalog', label: 'Catálogo' },
      ];
  }
}
```

### RBAC Helper Functions

#### getQuoteFilter (Data Filtering)

```typescript
// src/server/api/trpc.ts
export function getQuoteFilter(session: Session | null): Prisma.QuoteWhereInput {
  if (!session?.user?.id) return { userId: 'impossible' };
  if (session.user.role === 'admin') return {}; // Admin sees all
  return { userId: session.user.id }; // Others see only own
}
```

#### adminProcedure (tRPC Helper)

```typescript
// src/server/api/trpc.ts
export const adminProcedure = protectedProcedure.use(async (opts) => {
  const { ctx } = opts;
  if (ctx.session.user.role !== 'admin') {
    logger.warn('Non-admin attempted admin procedure', {
      userId: ctx.session.user.id,
      role: ctx.session.user.role,
    });
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'No tienes permisos de administrador',
    });
  }
  return opts.next({ ctx });
});
```

#### sellerProcedure (tRPC Helper - Future)

```typescript
// src/server/api/trpc.ts
export const sellerProcedure = protectedProcedure.use(async (opts) => {
  const { ctx } = opts;
  const allowedRoles: UserRole[] = ['admin', 'seller'];
  if (!allowedRoles.includes(ctx.session.user.role)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'No tienes permisos de vendedor',
    });
  }
  return opts.next({ ctx });
});
```

### RBAC Best Practices

✅ **DO**:
- Check authorization server-side (middleware, tRPC, Server Components)
- Use `adminProcedure` for admin-only tRPC procedures
- Use `getQuoteFilter` for role-based data filtering
- Log authorization failures with Winston (server-side only)
- Throw Spanish error messages for user feedback
- Use Server Component guards for UI (not security)

❌ **DON'T**:
- Trust client-side authorization (UI guards are UX, not security)
- Use Winston in Client Components (server-side only)
- Forget to validate ownership in adminOrOwner procedures
- Hard-code role checks (use helper functions)
- Mix authorization with business logic (separate concerns)

### RBAC Testing Patterns

```typescript
// Unit test: auth helpers
describe('getQuoteFilter', () => {
  it('returns empty filter for admin role', () => {
    const session: MockSession = { user: { id: '1', role: 'admin' } };
    expect(getQuoteFilter(session)).toEqual({});
  });

  it('returns userId filter for user role', () => {
    const session: MockSession = { user: { id: '1', role: 'user' } };
    expect(getQuoteFilter(session)).toEqual({ userId: '1' });
  });
});

// E2E test: admin access
test('should redirect admin to /dashboard after login', async ({ page }) => {
  await page.goto('/signin');
  await page.getByLabel(/email/i).fill(ADMIN_USER.email);
  await page.getByLabel(/contraseña/i).fill(ADMIN_USER.password);
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await page.waitForURL(/\/dashboard/);
  expect(page.url()).toContain('/dashboard');
});
```

---

## Key Patterns Summary

1. **Next.js 15**: Server Components by default, ISR, Streaming
2. **Pages**: ALWAYS Server Components, delegate interactivity to children
3. **Winston Logger**: Server-side ONLY (Server Components, Server Actions, API Routes, tRPC)
4. **SEO**: Metadata in Server Components, `generateMetadata` for dynamic content
5. **SOLID**: Single Responsibility, composition, inverted dependencies
6. **Atomic Design**: atoms (ui/), molecules (components/), organisms (\_components/), templates (layout.tsx), pages (page.tsx)
7. **tRPC**: Type-safe APIs with kebab-case naming
8. **Prisma**: ORM with PostgreSQL, singleton client
9. **Zod**: End-to-end schema validation
10. **Custom Hooks**: Reusable logic separated from UI
11. **Testing**: Vitest (unit/integration), Playwright (E2E)
12. **Ultracite**: Linting and formatting with Biome
13. **RBAC**: Three-layer authorization (middleware, tRPC, UI guards)

---

**When generating code, ALWAYS**:

1. Detect exact project versions
2. Follow established codebase patterns
3. **Create pages as Server Components** (delegate interactivity to Client Components)
4. **Never use Winston logger in Client Components** (server-side only)
5. **Apply RBAC patterns** (middleware, tRPC procedures, UI guards)
6. **Use adminProcedure for admin-only APIs** (not manual role checks)
7. **Use getQuoteFilter for data filtering** (role-based WHERE clauses)
8. Apply SOLID principles and Atomic Design
9. Use Next.js App Router folder structure
10. Prioritize Server Components over Client Components
11. Add metadata for SEO on public pages
12. Use `dynamic` or `revalidate` according to use case
13. Write testable and well-documented code
14. Use Spanish only in UI text, everything else in English
15. Never create Barrels (index.ts) or barrel files anywhere
16. Follow project naming and organization conventions

