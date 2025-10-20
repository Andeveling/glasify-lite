# Glasify Lite Development Guidelines

**Project Type**: Full-stack glass quotation management application  
**Last Updated**: 2025-01-21  
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
- TypeScript 5.8.2 (strict mode), Node.js (ES2022 target) + Next.js 15.2.3 (App Router), React 19.0.0 (Server Components), tRPC 11.0.0, TanStack Query 5.69.0, React Hook Form 7.63.0, Zod 4.1.1 (012-simplify-profile-suppliers)
- PostgreSQL via Prisma 6.16.2 (existing ProfileSupplier schema) (012-simplify-profile-suppliers)

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

## Server-Optimized Data Tables

### Architecture Pattern

Glasify uses a **server-first data table architecture** that leverages URL state management and Next.js Server Components for optimal performance and SEO.

**Core Principles**:
- URL as single source of truth for table state (page, sort, filters, search)
- Server Components for data fetching and rendering
- Client Components only for interactive controls
- Debounced search (300ms) for reduced server load
- Database indexes for query performance
- Type-safe tRPC procedures with Zod validation

### Component Structure

```
src/app/_components/server-table/
├── server-table.tsx          # Main table container (Client Component)
├── table-header.tsx          # Sortable column headers (Client Component)
├── table-search.tsx          # Debounced search input (Client Component)
├── table-pagination.tsx      # Pagination controls (Client Component)
└── table-filters.tsx         # Generic filter component (Client Component)

src/app/(dashboard)/admin/models/
├── _components/
│   └── models-table.tsx      # Feature-specific table (Client Component)
└── page.tsx                  # Server Component with data fetching
```

### Pattern 1: Page with Server-Side Data Fetching

```typescript
// src/app/(dashboard)/admin/models/page.tsx
import { api } from '@/trpc/server';
import { ModelsTable } from './_components/models-table';

type SearchParams = Promise<{
  page?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  status?: string;
}>;

export default async function ModelsPage({ 
  searchParams 
}: { 
  searchParams: SearchParams 
}) {
  const params = await searchParams;
  
  // Server-side data fetching with type-safe tRPC
  const data = await api.model['list-models']({
    page: Number(params.page) || 1,
    sort: params.sort as SortField || 'createdAt',
    order: params.order || 'desc',
    search: params.search,
    status: params.status as ModelStatus,
  });

  return (
    <div className="container py-10">
      <h1>Modelos de Vidrio</h1>
      <ModelsTable initialData={data} />
    </div>
  );
}
```

### Pattern 2: Feature-Specific Table Component

```typescript
// src/app/(dashboard)/admin/models/_components/models-table.tsx
'use client';

import { ServerTable } from '@/app/_components/server-table/server-table';
import { TableSearch } from '@/app/_components/server-table/table-search';
import { TableFilters } from '@/app/_components/server-table/table-filters';
import { TablePagination } from '@/app/_components/server-table/table-pagination';

export function ModelsTable({ initialData }: Props) {
  // Column definitions
  const columns: ColumnDef<Model>[] = [
    { 
      key: 'name', 
      label: 'Nombre', 
      sortable: true,
      render: (model) => model.name 
    },
    { 
      key: 'status', 
      label: 'Estado', 
      sortable: true,
      render: (model) => <StatusBadge status={model.status} />
    },
    // ... more columns
  ];

  // Filter definitions
  const filterDefs: FilterDef[] = [
    {
      key: 'status',
      label: 'Estado',
      type: 'select',
      options: [
        { value: 'active', label: 'Activo' },
        { value: 'inactive', label: 'Inactivo' },
      ],
    },
  ];

  return (
    <div>
      <TableSearch placeholder="Buscar modelos..." />
      <TableFilters filters={filterDefs} />
      
      <ServerTable
        columns={columns}
        data={initialData.items}
        total={initialData.total}
      />
      
      <TablePagination 
        currentPage={initialData.page}
        totalPages={initialData.totalPages}
        itemsPerPage={initialData.itemsPerPage}
      />
    </div>
  );
}
```

### Pattern 3: URL-Based State Management

```typescript
// src/hooks/use-server-params.ts
'use client';

export function useServerParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParams = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Reset to page 1 when filters/search changes
    if ('search' in updates || Object.keys(updates).some(k => k !== 'page')) {
      params.set('page', '1');
    }

    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  return { searchParams, updateParams };
}
```

### Pattern 4: Debounced Search

```typescript
// src/app/_components/server-table/table-search.tsx
'use client';

export function TableSearch({ placeholder }: Props) {
  const { searchParams, updateParams } = useServerParams();
  const [localValue, setLocalValue] = useState(searchParams.get('search') || '');

  const debouncedUpdate = useDebouncedCallback((value: string) => {
    updateParams({ search: value || null });
  }, 300); // 300ms debounce

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalValue(value); // Immediate UI update
    debouncedUpdate(value); // Debounced URL update
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2" />
      <Input
        type="search"
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
      />
    </div>
  );
}
```

### Pattern 5: Sortable Headers

```typescript
// src/app/_components/server-table/table-header.tsx
'use client';

export function TableHeader({ column }: Props) {
  const { searchParams, updateParams } = useServerParams();
  
  const currentSort = searchParams.get('sort');
  const currentOrder = searchParams.get('order') as 'asc' | 'desc';
  
  const isSorted = currentSort === column.key;
  const nextOrder = !isSorted ? 'asc' : currentOrder === 'asc' ? 'desc' : null;

  const handleSort = () => {
    if (!column.sortable) return;
    
    updateParams({
      sort: nextOrder ? column.key : null,
      order: nextOrder,
    });
  };

  return (
    <th onClick={handleSort} className={cn(column.sortable && 'cursor-pointer')}>
      {column.label}
      {column.sortable && (
        <span className="ml-2">
          {!isSorted && '↕'}
          {isSorted && currentOrder === 'asc' && '↑'}
          {isSorted && currentOrder === 'desc' && '↓'}
        </span>
      )}
    </th>
  );
}
```

### Pattern 6: Type-Safe tRPC Procedure

```typescript
// src/server/api/routers/model.ts
export const modelRouter = router({
  'list-models': adminProcedure
    .input(listModelsSchema)
    .query(async ({ ctx, input }) => {
      const { page = 1, sort = 'createdAt', order = 'desc', search, status } = input;
      const itemsPerPage = 10;
      const skip = (page - 1) * itemsPerPage;

      // Build WHERE clause
      const where: Prisma.ModelWhereInput = {
        ...(search && {
          name: { contains: search, mode: 'insensitive' },
        }),
        ...(status && { status }),
      };

      // Parallel queries for better performance
      const [items, total] = await Promise.all([
        ctx.db.model.findMany({
          where,
          orderBy: { [sort]: order },
          take: itemsPerPage,
          skip,
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true,
            _count: { select: { glassTypes: true } },
          },
        }),
        ctx.db.model.count({ where }),
      ]);

      return {
        items,
        total,
        page,
        totalPages: Math.ceil(total / itemsPerPage),
        itemsPerPage,
      };
    }),
});
```

### Pattern 7: Database Indexes for Performance

```prisma
// prisma/schema.prisma
model Model {
  id        String   @id @default(cuid())
  name      String
  status    String   @default("active")
  createdAt DateTime @default(now())

  // Performance indexes
  @@index([name])           // For search queries
  @@index([status])         // For filter queries
  @@index([createdAt(sort: Desc)])  // For default sorting
}
```

### Server Table Best Practices

✅ **DO**:
- Use Server Components for page-level data fetching
- Store table state in URL searchParams (SEO, shareable, back/forward)
- Debounce search inputs (300ms) to reduce server load
- Add database indexes for sortable/filterable columns
- Use parallel queries (`Promise.all`) for counts + data
- Reset to page 1 when filters/search changes
- Use tRPC for type-safe API procedures
- Add E2E tests for critical user flows

❌ **DON'T**:
- Use TanStack Table (replaced by server-first pattern)
- Store table state in React state or Context
- Make immediate API calls on every keystroke
- Forget to add database indexes for performance
- Mix data fetching logic in Client Components
- Hard-code pagination/filter values
- Use client-side sorting/filtering for large datasets

### Performance Optimizations

1. **Database Level**:
   - Indexed columns for WHERE/ORDER BY clauses
   - `select` only needed fields (no full models)
   - Parallel queries with `Promise.all`

2. **Network Level**:
   - Debounced search (300ms)
   - URL-based state (no redundant fetches)
   - Server Components (zero JS for static content)

3. **UX Level**:
   - Optimistic UI updates (local state + debounced sync)
   - Loading states during data fetches
   - Proper error boundaries

### Testing Pattern

```typescript
// e2e/admin/models-table.spec.ts
import { test, expect } from '@playwright/test';

const DEBOUNCE_WAIT_MS = 300;

test('should filter models by search query', async ({ page }) => {
  await page.goto('/dashboard/admin/models');
  
  const searchInput = page.getByPlaceholder(/buscar modelos/i);
  await searchInput.fill('Templado');
  
  // Wait for debounce
  await page.waitForTimeout(DEBOUNCE_WAIT_MS + 100);
  
  // Verify URL updated
  await expect(page).toHaveURL(/search=Templado/);
  
  // Verify results filtered
  await expect(page.getByRole('row')).toContainText('Templado');
});

test('should persist state in URL for deep linking', async ({ page }) => {
  // Navigate directly to filtered URL
  await page.goto('/dashboard/admin/models?status=active&sort=name&order=asc&page=2');
  
  // Verify filters applied
  await expect(page.getByRole('combobox', { name: /estado/i })).toHaveValue('active');
  
  // Verify sort applied
  const nameHeader = page.getByRole('columnheader', { name: /nombre/i });
  await expect(nameHeader).toContainText('↑');
  
  // Verify pagination
  await expect(page.getByText(/página 2/i)).toBeVisible();
});
```

### Migration Checklist

When migrating existing tables to server-optimized pattern:

- [ ] Create feature-specific table component in `_components/`
- [ ] Update page to async Server Component with searchParams
- [ ] Create tRPC procedure with Zod input schema
- [ ] Add database indexes for sortable/filterable columns
- [ ] Implement debounced search with `useDebouncedCallback`
- [ ] Use `useServerParams` for URL state management
- [ ] Add column definitions with sortable flags
- [ ] Add filter definitions for `<TableFilters>`
- [ ] Write E2E tests for critical flows
- [ ] Remove old TanStack Table dependencies (if any)
- [ ] Update documentation and copilot instructions

---

## SSR Cache Invalidation Pattern

### Problem Statement

When using **SSR with `force-dynamic`**, data is fetched on the server and passed as props to Client Components. TanStack Query's `invalidate()` only clears the **client-side cache**, but doesn't trigger a **server-side re-fetch**.

**Result**: After mutations (create/update/delete), the UI doesn't update because:
1. Server data remains stale (not re-fetched)
2. Client components display old `initialData` from props
3. Cache invalidation alone doesn't reload server data

### Solution: Two-Step Invalidation

Use **both** cache invalidation AND `router.refresh()` in mutation callbacks:

```typescript
import { useRouter } from 'next/navigation';

const router = useRouter();
const utils = api.useUtils();

const createMutation = api.admin.service.create.useMutation({
  onSuccess: () => {
    toast.success('Servicio creado correctamente');
  },
  onSettled: () => {
    // Step 1: Invalidate client-side cache
    void utils.admin.service.list.invalidate();
    
    // Step 2: Refresh server data (re-runs page.tsx data fetching)
    router.refresh();
  },
});
```

### How It Works

**`router.refresh()`**:
- Triggers Next.js to re-execute the Server Component
- Re-runs all data fetching in `page.tsx`
- Updates `initialData` passed to Client Components
- **Preserves client state** (no full page reload)
- Maintains scroll position, open dialogs, form state

**Why Both Steps?**:
1. `invalidate()`: Clears stale cache entries (prevents serving old data)
2. `router.refresh()`: Forces server to fetch fresh data

### When to Use This Pattern

✅ **REQUIRED** when:
- Page uses `export const dynamic = 'force-dynamic'`
- Data is fetched in Server Component (`page.tsx`)
- Data is passed as `initialData` prop to Client Components
- Mutations change data that needs to reflect in UI

❌ **NOT NEEDED** when:
- Using client-side data fetching only (no SSR)
- Using ISR with automatic revalidation
- Data doesn't change (read-only views)

### Complete Example

**Page (Server Component)**:
```typescript
// src/app/(dashboard)/admin/services/page.tsx
export const dynamic = 'force-dynamic';

export default async function ServicesPage({ searchParams }: Props) {
  const params = await searchParams;
  
  // Server-side data fetch
  const data = await api.admin.service.list({
    page: Number(params.page) || 1,
    search: params.search,
    // ... other filters
  });

  return <ServicesContent initialData={data} />;
}
```

**Client Component with Mutations**:
```typescript
// src/app/(dashboard)/admin/services/_components/service-dialog.tsx
'use client';

import { useRouter } from 'next/navigation';

export function ServiceDialog({ mode, open, onOpenChange, defaultValues }: Props) {
  const utils = api.useUtils();
  const router = useRouter();

  const createMutation = api.admin.service.create.useMutation({
    onMutate: () => {
      toast.loading('Creando servicio...', { id: 'create-service' });
    },
    onError: (err) => {
      toast.error('Error al crear servicio', {
        description: err.message,
        id: 'create-service',
      });
    },
    onSuccess: () => {
      toast.success('Servicio creado correctamente', { id: 'create-service' });
      onOpenChange(false);
    },
    onSettled: () => {
      // Two-step invalidation for SSR
      void utils.admin.service.list.invalidate();
      router.refresh();
    },
  });

  const updateMutation = api.admin.service.update.useMutation({
    // ... same pattern
    onSettled: () => {
      void utils.admin.service.list.invalidate();
      router.refresh();
    },
  });

  const deleteMutation = api.admin.service.delete.useMutation({
    // ... same pattern with optimistic updates
    onSettled: () => {
      void utils.admin.service.list.invalidate();
      router.refresh();
    },
  });

  // ... rest of component
}
```

### Best Practices

✅ **DO**:
- Always call `router.refresh()` in `onSettled` (runs on both success and error)
- Combine with optimistic updates for instant feedback
- Use in all CRUD mutations (create, update, delete)
- Keep `router.refresh()` after `invalidate()` (order matters)

❌ **DON'T**:
- Call `router.refresh()` in `onSuccess` only (won't run on error)
- Use without cache invalidation (stale cache may persist)
- Call multiple times in parallel (one refresh is enough)
- Forget to import from `next/navigation` (not `next/router`)

### Testing Considerations

E2E tests should verify the complete flow:

```typescript
// e2e/admin/services.spec.ts
test('should show new service after creation', async ({ page }) => {
  await page.goto('/admin/services');
  
  // Open create dialog
  await page.getByRole('button', { name: /nuevo servicio/i }).click();
  
  // Fill form
  await page.getByLabel(/nombre/i).fill('Test Service');
  await page.getByLabel(/tipo/i).selectOption('fixed');
  await page.getByLabel(/tarifa/i).fill('50000');
  
  // Submit
  await page.getByRole('button', { name: /crear servicio/i }).click();
  
  // Verify success toast
  await expect(page.getByText(/servicio creado correctamente/i)).toBeVisible();
  
  // Verify service appears in table (after router.refresh())
  await expect(page.getByRole('row', { name: /test service/i })).toBeVisible();
});
```

### Troubleshooting

**Problem**: UI doesn't update after mutation  
**Solution**: Check that both `invalidate()` and `router.refresh()` are called

**Problem**: Page reloads completely (loses state)  
**Solution**: Use `router.refresh()` not `router.push()` or `window.location.reload()`

**Problem**: Old data shows briefly before update  
**Solution**: Implement optimistic updates in `onMutate` for instant feedback

**Problem**: Error "router is not defined"  
**Solution**: Import from `next/navigation` and ensure component is Client Component

---

## Services Admin Dashboard Pattern

The `/admin/services` view implements the **server-optimized dashboard pattern** with full standardization:

### URL Schema

Services uses these query parameters for state management:
- `page` - Current page (default: 1)
- `search` - Search query (debounced 300ms)
- `type` - Service type filter (all/area/perimeter/fixed, default: all)
- `isActive` - Status filter (all/active/inactive, default: all)
- `sortBy` - Sort field (name/createdAt/updatedAt/rate, default: name)
- `sortOrder` - Sort direction (asc/desc, default: asc)

### Example URLs

```
/admin/services                                    # Default state
/admin/services?type=area&page=1&search=inst      # Filtered search
/admin/services?isActive=active&type=fixed        # Status + type filter
/admin/services?page=2&search=entrega&type=area   # Complex filter
```

### File Structure

```
src/app/(dashboard)/admin/services/
├── page.tsx                              # Server Component (SSR)
├── _components/
│   ├── services-filters.tsx              # Filter controls (Client)
│   └── services-list.tsx                 # Table display (Client)
└── _components/service-form.tsx          # Form component
```

### Implementation Details

**Page Component** (`page.tsx`):
- `export const dynamic = 'force-dynamic'` - SSR, no ISR
- Accepts `searchParams` as `Promise` (Next.js 15)
- Parses all query params outside Suspense
- Passes filters to `<ServicesFilters />`
- Content inside Suspense with skeleton fallback

**Filters Component** (`services-filters.tsx`):
- Always visible (outside Suspense)
- Uses `<TableSearch />` with debounce (300ms)
- Uses `<TableFilters />` for dropdowns
- Syncs with URL via server-filters pattern
- "Don't Make Me Think" UX: clear labels, logical grouping

**List Component** (`services-list.tsx`):
- Receives `initialData` from server
- Handles CRUD operations (edit, delete)
- Uses `<TablePagination />` for page navigation
- Uses `formatCurrency()` for display
- Optimistic UI for mutations

### Key Features

✅ **Deep Linking**: Share filtered URLs with team  
✅ **Browser History**: Back/forward buttons work correctly  
✅ **Streaming**: Skeleton shows while loading  
✅ **SEO**: Server-rendered initial state  
✅ **Performance**: Debounced search reduces server load  
✅ **Scalability**: Handles 100+ items with pagination  

### Common Patterns

**Reset to page 1 on filter change**:
```typescript
// Automatically handled by useServerParams in TableSearch/TableFilters
// When user changes filter, page param is reset to 1
```

**Format service rate**:
```typescript
import { formatCurrency } from '@/lib/format';
{formatCurrency(service.rate)}  // Uses default tenant context (COP)
```

**Delete with confirmation**:
```typescript
<DeleteConfirmationDialog
  open={deleteDialogOpen}
  onOpenChange={setDeleteDialogOpen}
  entityName="servicio"
  entityLabel={serviceToDelete?.name}
  onConfirm={handleDeleteConfirm}
  loading={deleteMutation.isPending}
/>
```

---

## Key Patterns Summary

1. **Next.js 15**: Server Components by default, SSR/ISR based on route type, Streaming
2. **Dashboard Routes**: SSR with `dynamic = 'force-dynamic'` (no ISR for private routes)
3. **SSR Cache Invalidation**: Use `invalidate()` + `router.refresh()` for mutations in SSR pages
4. **Pages**: ALWAYS Server Components, delegate interactivity to children
5. **Winston Logger**: Server-side ONLY (Server Components, Server Actions, API Routes, tRPC)
6. **SEO**: Metadata in Server Components, `generateMetadata` for dynamic content
7. **SOLID**: Single Responsibility, composition, inverted dependencies
8. **Atomic Design**: atoms (ui/), molecules (components/), organisms (\_components/), templates (layout.tsx), pages (page.tsx)
9. **tRPC**: Type-safe APIs with kebab-case naming
10. **Prisma**: ORM with PostgreSQL, singleton client, performance indexes
11. **Zod**: End-to-end schema validation
12. **Custom Hooks**: Reusable logic separated from UI
13. **Testing**: Vitest (unit/integration), Playwright (E2E)
14. **Ultracite**: Linting and formatting with Biome
15. **RBAC**: Three-layer authorization (middleware, tRPC, UI guards)
16. **Server Tables**: URL-based state, debounced search, database indexes
17. **Services Dashboard**: Full server-optimized pattern with filters, pagination, CRUD
18. **Formatters**: Centralized in `@lib/format` with tenant context
19. **Optimistic UI**: Implement for mutations with rollback on error

---

## Dashboard Route Standards

**Critical for all admin routes (`/admin/*`)**: Follow the [Dashboard Route Standard](../docs/dashboard-route-standard.md)

### Quick Reference

**SSR Configuration**:
```typescript
// ALWAYS for dashboard routes
export const dynamic = 'force-dynamic';
```

**Filter Placement**:
- Filters OUTSIDE Suspense (always visible during loading)
- Single source of truth for filter definitions
- Debounced search (300ms)

**Component Structure**:
```
admin/[feature]/
├── _components/
│   ├── [feature]-table.tsx     # Pure presentation (Client)
│   └── [feature]-filters.tsx   # Filter controls (Client)
└── page.tsx                    # SSR page (Server)
```

**Formatters**:
```typescript
import { formatCurrency, formatThickness } from '@/lib/format';
import { useTenantConfig } from '@/app/_hooks/use-tenant-config';

const { formatContext } = useTenantConfig();
formatCurrency(amount, { context: formatContext });
```

**Optimistic UI**:
```typescript
const mutation = api.feature.delete.useMutation({
  onMutate: async (variables) => {
    // Cancel, snapshot, update cache
    const previousData = utils.feature.list.getData();
    // ... optimistic update
    return { previousData };
  },
  onError: (error, _vars, context) => {
    // Rollback to snapshot
    if (context?.previousData) {
      utils.feature.list.setData(params, context.previousData);
    }
  },
  onSettled: () => {
    void utils.feature.list.invalidate();
    router.refresh(); // Required for SSR pages with force-dynamic
  },
});
```

**Dashboard Checklist**:
- [ ] Use `dynamic = 'force-dynamic'` (no ISR)
- [ ] Filters outside Suspense
- [ ] Single filter block (no duplicates)
- [ ] Centralized formatters with tenant context
- [ ] Optimistic UI for mutations
- [ ] **Two-step cache invalidation: `invalidate()` + `router.refresh()`**
- [ ] Proper Suspense key with all query params
- [ ] Type-safe tRPC procedures
- [ ] Database indexes for performance

See full documentation: [docs/dashboard-route-standard.md](../docs/dashboard-route-standard.md)

---

**When generating code, ALWAYS**:

1. Detect exact project versions
2. Follow established codebase patterns
3. **For dashboard routes: Use SSR with `dynamic = 'force-dynamic'`** (no ISR)
4. **Create pages as Server Components** (delegate interactivity to Client Components)
5. **For SSR mutations: Use `router.refresh()` after `invalidate()`** (two-step pattern)
6. **Never use Winston logger in Client Components** (server-side only)
7. **Apply RBAC patterns** (middleware, tRPC procedures, UI guards)
8. **Use adminProcedure for admin-only APIs** (not manual role checks)
9. **Use getQuoteFilter for data filtering** (role-based WHERE clauses)
10. **Use server-optimized table pattern** (URL state, debounced search, database indexes)
11. **Use centralized formatters from `@lib/format`** (with tenant context)
12. **Implement optimistic UI for mutations** (with rollback on error)
13. Apply SOLID principles and Atomic Design
14. Use Next.js App Router folder structure
15. Prioritize Server Components over Client Components
16. Add metadata for SEO on public pages
17. Write testable and well-documented code
18. Use Spanish only in UI text, everything else in English
19. Never create Barrels (index.ts) or barrel files anywhere
20. Follow project naming and organization conventions

