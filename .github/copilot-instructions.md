# GitHub Copilot Instructions — Glasify Lite

## Prioridades de Generación de Código

Cuando generes código para este repositorio:

1. **Compatibilidad de Versiones**: Siempre detecta y respeta las versiones exactas de lenguajes, frameworks y librerías usadas en este proyecto
2. **Archivos de Contexto**: Prioriza patrones y estándares definidos en el directorio `.github/instructions`
3. **Patrones del Codebase**: Cuando los archivos de contexto no provean guía específica, escanea el codebase para patrones establecidos
4. **Consistencia Arquitectónica**: Mantén el estilo arquitectónico Next.js 15 App Router con tRPC y los límites establecidos
5. **Calidad de Código**: Prioriza mantenibilidad, rendimiento, seguridad, accesibilidad y testabilidad en todo el código generado

---

## Detección de Versiones de Tecnología

Antes de generar código, identifica las versiones exactas:

### Versiones de Lenguaje

- **TypeScript**: `5.8.2` (strict mode habilitado)
- **Node.js**: Compatible con `es2022` target
- **ECMAScript**: `ES2022`

### Versiones de Frameworks

- **Next.js**: `15.2.3` (App Router, React Server Components)
- **React**: `19.0.0` (con React Server Components)
- **React DOM**: `19.0.0`

### Librerías Principales

- **tRPC**: `11.0.0` (@trpc/client, @trpc/server, @trpc/react-query)
- **Prisma**: `6.16.2` (ORM con PostgreSQL)
- **NextAuth.js**: `5.0.0-beta.25` (autenticación)
- **TanStack Query**: `5.69.0` (React Query)
- **Zod**: `4.1.1` (validación de schemas)
- **TailwindCSS**: `4.0.15` (con PostCSS)
- **Shadcn/ui**: Componentes basados en Radix UI
- **Winston**: `3.17.0` (logging estructurado)
- **React Hook Form**: `7.63.0` (con ZodResolver)

### Herramientas de Desarrollo

- **Ultracite**: `5.4.4` (linting y formateo con Biome)
- **Biome**: `2.2.4` (formatter y linter)
- **Vitest**: `3.2.4` (unit tests con jsdom)
- **Playwright**: `1.55.1` (E2E tests)
- **Lefthook**: `1.13.4` (git hooks)

---

## Winston Logger - Uso Correcto

### ⚠️ IMPORTANTE: Winston es SOLO para Server-Side

Winston usa módulos de Node.js (`fs`, `path`, etc.) que **NO están disponibles en el navegador**.

**✅ PERMITIDO - Server-Side**:
- ✅ Server Components
- ✅ Server Actions (`'use server'`)
- ✅ API Route Handlers (`/api/*`)
- ✅ tRPC Procedures (routers en `/server/api/routers`)
- ✅ Middleware (`middleware.ts`)
- ✅ Server-side utilities (`/server/*`)

**❌ PROHIBIDO - Client-Side**:
- ❌ Client Components (`'use client'`)
- ❌ Custom Hooks (`use*.ts`)
- ❌ Client-side utilities usados por componentes
- ❌ Cualquier código que se ejecute en el navegador

### Patrón Correcto

```typescript
// ✅ BIEN: Server Component
import logger from '@/lib/logger';

export default async function ProductPage({ params }: Props) {
  logger.info('Product page accessed', { productId: params.id });
  const product = await db.product.findUnique({ where: { id: params.id } });
  return <ProductDetail product={product} />;
}

// ✅ BIEN: Server Action
'use server';
import logger from '@/lib/logger';

export async function createQuote(data: QuoteInput) {
  logger.info('Creating quote', { data });
  const quote = await db.quote.create({ data });
  return { success: true, quoteId: quote.id };
}

// ✅ BIEN: tRPC Procedure
import logger from '@/lib/logger';

export const catalogRouter = createTRPCRouter({
  'list-models': publicProcedure
    .input(catalogInputSchema)
    .query(async ({ input }) => {
      logger.info('Listing models', { filters: input });
      return await db.model.findMany({ where: input });
    }),
});

// ❌ MAL: Client Component
'use client';
import logger from '@/lib/logger'; // ❌ ERROR: Winston no funciona en cliente

export function ProductForm() {
  const handleSubmit = () => {
    logger.info('Form submitted'); // ❌ Causará error en build
  };
  return <form onSubmit={handleSubmit}>...</form>;
}

// ✅ BIEN: Client Component sin logger
'use client';
// En cliente, usa console (solo en desarrollo) o toast/error boundaries

export function ProductForm() {
  const handleSubmit = () => {
    // Usuario ya recibe feedback con toast
    toast.success('Producto agregado');
    // Errores se capturan en DevTools automáticamente
  };
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Por Qué No Usar Logger en Cliente

1. **Build Error**: Winston usa módulos de Node.js que no existen en navegador
2. **No es Necesario**: 
   - Toasts informan al usuario (UX)
   - DevTools capturan errores automáticamente
   - No necesitas logs estructurados en cliente
3. **Mejor Rendimiento**: Menos JavaScript en bundle del cliente

---

## Convenciones del Proyecto

### Commits Messages

- Use conventional commit messages in **English**
- UI text must be in **Spanish (es-LA)**
- Examples:
  - `feat: add quote calculation endpoint`
  - `fix: correct pricing formula for tempered glass`
  - `docs: update API documentation`
  - `refactor: extract search logic to custom hook`
  - `test: add unit tests for catalog utils`

### Important

- **Never use Spanish in code, comments, or commit messages** — only in UI text and user-facing content.

### Naming Conventions

- **Files**: kebab-case (`quote-calculator.ts`, `catalog-search.tsx`)
- **Components**: PascalCase (`QuoteForm`, `CatalogSearch`)
- **Variables/Functions**: camelCase (`calculatePrice`, `handleSearchChange`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_GLASS_THICKNESS`, `DEFAULT_PAGE_LIMIT`)
- **Database entities**: PascalCase (`Manufacturer`, `QuoteItem`)
- **tRPC procedures**: kebab-case (`'quote.calculate-item'`, `'catalog.list-models'`)

### Domain Language (Spanish)

UI text, error messages, and user-facing content must be in Spanish (es-LA):

- "Cotización" not "Quote"
- "Vidrio" not "Glass"
- "Modelo" not "Model"
- "Fabricante" not "Manufacturer"
- "Presupuesto" not "Budget"

### Project Structure

Sigue estrictamente la estructura oficial de Next.js App Router:

```
glasify-lite/
├── src/
│   ├── app/                          # Next.js 15 App Router
│   │   ├── (auth)/                   # Route group: páginas de autenticación
│   │   │   └── signin/
│   │   │       └── page.tsx          # Server Component
│   │   ├── (dashboard)/              # Route group: área privada
│   │   │   ├── layout.tsx            # Layout con protección
│   │   │   └── dashboard/
│   │   ├── (public)/                 # Route group: área pública
│   │   │   └── catalog/
│   │   │       ├── _components/      # Componentes privados (organisms/molecules)
│   │   │       ├── _hooks/           # Custom hooks específicos
│   │   │       ├── _types/           # TypeScript types locales
│   │   │       ├── _utils/           # Utilities específicas (pure functions)
│   │   │       ├── [modelId]/        # Dynamic route
│   │   │       │   └── page.tsx
│   │   │       └── page.tsx          # Server Component (template/page)
│   │   ├── _components/              # Componentes compartidos de app
│   │   ├── _utils/                   # Utilities globales de app
│   │   ├── api/                      # Route handlers API
│   │   │   └── trpc/[trpc]/
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page
│   │   ├── not-found.tsx             # 404 page
│   │   └── global-error.tsx          # Error boundary global
│   │
│   ├── components/                   # Componentes UI compartidos (atoms/molecules)
│   │   ├── ui/                       # Shadcn/ui components (atoms)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── form.tsx
│   │   └── back-button.tsx           # Shared molecules
│   │
│   ├── hooks/                        # Custom hooks globales
│   │   └── use-toast.tsx
│   │
│   ├── lib/                          # Utilities y configuraciones
│   │   ├── logger.ts                 # Winston singleton logger
│   │   └── utils.ts                  # Helper functions (cn, etc.)
│   │
│   ├── providers/                    # React Context providers
│   │   └── theme-provider.tsx
│   │
│   ├── server/                       # Backend lógica (tRPC, Prisma)
│   │   ├── api/
│   │   │   ├── routers/              # tRPC routers
│   │   │   │   ├── catalog.ts
│   │   │   │   ├── quote.ts
│   │   │   │   └── admin.ts
│   │   │   ├── root.ts               # tRPC root router
│   │   │   └── trpc.ts               # tRPC config
│   │   ├── auth/                     # NextAuth config
│   │   │   ├── config.ts
│   │   │   └── index.ts
│   │   ├── services/                 # Business logic services
│   │   │   └── catalog.service.ts
│   │   └── db.ts                     # Prisma singleton client
│   │
│   ├── trpc/                         # tRPC client configuration
│   │   ├── react.tsx                 # React client
│   │   ├── server.ts                 # Server client
│   │   └── query-client.ts
│   │
│   ├── styles/                       # CSS global
│   │   └── globals.css
│   │
│   ├── middleware.ts                 # Next.js middleware
│   └── env.js                        # Environment validation (@t3-oss/env-nextjs)
│
├── prisma/                           # Database schema y migrations
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
│
├── tests/                            # Unit, integration, contract tests
│   ├── unit/
│   ├── integration/
│   ├── contract/
│   └── setup.ts
│
├── e2e/                              # Playwright E2E tests
│   └── auth/
│
├── public/                           # Static assets
│   └── favicon.ico
│
├── docs/                             # Documentación del proyecto
├── .github/                          # GitHub configs y copilot instructions
├── next.config.js                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
├── tailwind.config.ts                # TailwindCSS configuration
├── vitest.config.ts                  # Vitest configuration
├── playwright.config.ts              # Playwright configuration
└── package.json
```

### Reglas de Organización

**App Router (`src/app/`)**

- **Route Groups**: Usa `(nombre)` para organizar rutas sin afectar URLs
- **Archivos Privados**: Usa `_nombre` para carpetas/archivos que no son rutas
- **Colocation**: Coloca componentes, hooks, types y utils cerca de donde se usan
- **Layouts**: Crea layouts anidados para compartir UI entre rutas relacionadas
- **Loading/Error**: Usa `loading.tsx` y `error.tsx` para estados de carga y errores

**Componentes (`src/components/`)**

- **ui/**: Solo componentes Shadcn/ui (atoms) - sin lógica de negocio
- **Shared Molecules**: Componentes reutilizables que combinan atoms
- **NO organisms aquí**: Los organisms van en `_components/` de cada feature

**Server (`src/server/`)**

- **api/routers/**: tRPC routers con kebab-case naming (`'list-models'`)
- **services/**: Business logic separada de routers (SOLID - SRP)
- **db.ts**: Prisma client singleton con prevención de hot reload issues

### Database Design

- **Manufacturers**: Glass manufacturers (VEKA, Guardian, etc.)
- **Models**: Specific glass models with pricing data
- **GlassTypes**: Categories (tempered, laminated, etc.)
- **Services**: Additional services (cutting, polishing, etc.)
- **Quotes**: Customer quotation requests
- **QuoteItems**: Individual items within a quote
- **Adjustments**: Price modifications (discounts, surcharges)

---

## Arquitectura Next.js 15 + SOLID + Atomic Design

### Principios de Arquitectura

**Next.js 15 App Router**

- Server Components por defecto, Client Components solo cuando sea necesario
- Usa directiva `'use client'` únicamente para interactividad, hooks de React o context
- Aprovecha Server Actions para mutaciones de datos
- ISR (Incremental Static Regeneration) con `revalidate` para contenido semi-estático
- Streaming con `<Suspense>` para mejores Core Web Vitals

**SOLID Principles**

- **Single Responsibility**: Cada módulo/componente tiene una responsabilidad clara
- **Open/Closed**: Componentes abiertos a extensión, cerrados a modificación
- **Liskov Substitution**: Los componentes pueden ser reemplazados por sus variantes
- **Interface Segregation**: Props específicas, no interfaces genéricas
- **Dependency Inversion**: Depende de abstracciones (hooks, contexts) no de implementaciones

**Atomic Design**

- **Atoms**: Componentes UI básicos (`Button`, `Input`, `Label`) en `src/components/ui/`
- **Molecules**: Combinaciones simples de atoms (`InputGroup`, `FormField`)
- **Organisms**: Componentes complejos con lógica (`CatalogFilters`, `ModelCard`) en `_components/`
- **Templates**: Layouts de página sin datos (`DashboardLayout`) como `layout.tsx`
- **Pages**: Server Components que orquestan todo en `page.tsx`

---

## Patrones SOLID en el Codebase

### Single Responsibility Principle (SRP)

**✅ Patrón Correcto** (del codebase):

```typescript
// ❌ MAL: Componente con múltiples responsabilidades
function CatalogPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data } = api.catalog['list-models'].useQuery({...});

  return (
    <div>
      <input onChange={e => setSearch(e.target.value)} />
      {/* renderizado de cards, paginación, etc. */}
    </div>
  );
}

// ✅ BIEN: Responsabilidades separadas (patrón del proyecto)
// 1. Page: Orquestación (Server Component)
export default async function CatalogPage({ searchParams }: Props) {
  const { searchQuery, page, manufacturerId, sort } = validateCatalogParams(params);
  const manufacturers = await api.catalog['list-manufacturers']();

  return (
    <div>
      <CatalogHeader />
      <CatalogFilterBar {...props} />
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogContent {...props} />
      </Suspense>
    </div>
  );
}

// 2. Hook: Gestión de estado de búsqueda
export function useDebouncedSearch(initialValue = '', debounceMs = 300) {
  const [query, setQuery] = useState(initialValue);
  const { updateQueryParams } = useQueryParams();

  const debouncedUpdate = useDebouncedCallback((value: string) => {
    startTransition(() => {
      updateQueryParams({ q: value || null, page: null });
    });
  }, debounceMs);

  return { query, handleSearchChange, handleClear, isPending };
}

// 3. Componente: UI y presentación
export function CatalogSearch({ initialValue }: Props) {
  const { query, handleSearchChange } = useDebouncedSearch(initialValue);

  return (
    <Input
      value={query}
      onChange={e => handleSearchChange(e.target.value)}
    />
  );
}

// 4. Utility: Lógica pura, sin side effects
export function calculateTotalPages(total: number, itemsPerPage: number): number {
  return Math.ceil(total / itemsPerPage);
}
```

### Open/Closed Principle (OCP)

**✅ Patrón Correcto** (del codebase):

```typescript
// Componente abierto a extensión, cerrado a modificación
export function CatalogFilters({
  showControls = true,
  showBadges = true,
  showResultCount = true,
  ...props
}: Props) {
  return (
    <>
      {showControls && <ManufacturerFilter {...props} />}
      {showControls && <SortSelect {...props} />}
      {showBadges && <ActiveFilterBadges {...props} />}
      {showResultCount && <ResultCount total={totalResults} />}
    </>
  );
}
```

### Liskov Substitution Principle (LSP)

**✅ Patrón Correcto** (del codebase):

```typescript
// Los componentes UI pueden ser reemplazados por sus variantes
function Button({ variant = 'default', size = 'default', ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }))} {...props} />
  );
}

// Uso: Todas las variantes son intercambiables
<Button>Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
```

### Interface Segregation Principle (ISP)

**✅ Patrón Correcto** (del codebase):

```typescript
// ❌ MAL: Interface genérica con props innecesarias
type CatalogComponentProps = {
  searchQuery?: string;
  page?: number;
  manufacturers?: Manufacturer[];
  models?: Model[];
  // ... muchos props más
};

// ✅ BIEN: Props específicas para cada componente
type CatalogSearchProps = {
  initialValue?: string;
};

type CatalogFiltersProps = {
  manufacturers?: Array<{ id: string; name: string }>;
  currentManufacturer?: string;
  currentSort?: string;
  showControls?: boolean;
  showBadges?: boolean;
};
```

### Dependency Inversion Principle (DIP)

**✅ Patrón Correcto** (del codebase):

```typescript
// ❌ MAL: Componente depende directamente de Prisma
function CatalogContent() {
  const models = await prisma.model.findMany({...}); // ❌ Dependencia concreta
  return <CatalogGrid models={models} />;
}

// ✅ BIEN: Componente depende de abstracción (tRPC procedure)
async function CatalogContent({ searchQuery, page }: Props) {
  // Abstracción: tRPC procedure (no sabe si usa Prisma, fetch, cache, etc.)
  const { items: models } = await api.catalog['list-models']({
    search: searchQuery,
    page,
    limit: 20,
  });

  return <CatalogGrid models={models} />;
}

// Hook personalizado: Abstracción sobre useSearchParams
export function useQueryParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateQueryParams = useCallback((updates: Record<string, string | null>) => {
    // ... lógica de actualización
    router.replace(`${pathname}?${params.toString()}`);
  }, [searchParams, router]);

  return { updateQueryParams, getParam };
}
```

---

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

## Mejores Prácticas para Crear Pages

### Regla de Oro: Pages SIEMPRE como Server Components

Las páginas (`page.tsx`) deben ser **Server Components** por defecto. Solo crea Client Components cuando absolutamente necesites interactividad en el nivel de página.

### ✅ Patrón Recomendado: Server Page + Client Content

```typescript
// ✅ EXCELENTE: page.tsx como Server Component
// src/app/(public)/catalog/page.tsx

import type { Metadata } from 'next';
import { CatalogPageContent } from './_components/catalog-page-content';

// SEO: Metadata estática o dinámica
export const metadata: Metadata = {
  title: 'Catálogo de Productos',
  description: 'Explora nuestro catálogo completo',
};

// Opcional: Configuración del segmento de ruta
export const revalidate = 3600; // ISR: revalidar cada hora

export default async function CatalogPage({ searchParams }: Props) {
  // Fetch de datos en el servidor (sin waterfalls)
  const data = await api.catalog['list-models']({ ...searchParams });
  
  return <CatalogPageContent initialData={data} />;
}
```

```typescript
// ✅ BIEN: Client Component solo para interactividad
// src/app/(public)/catalog/_components/catalog-page-content.tsx

'use client';

export function CatalogPageContent({ initialData }: Props) {
  const [filters, setFilters] = useState({});
  // Toda la lógica interactiva aquí
  
  return (
    <div>
      <CatalogFilters onChange={setFilters} />
      <CatalogGrid items={initialData} />
    </div>
  );
}
```

### ❌ Anti-patrón: Page como Client Component

```typescript
// ❌ MAL: Página completa como Client Component
'use client';

export default function CatalogPage() {
  // ❌ Problemas:
  // - Sin SEO (metadata no funciona en Client Components)
  // - Bundle JavaScript más grande
  // - Sin SSR/ISR benefits
  // - Peor Core Web Vitals
  
  const [data, setData] = useState([]);
  
  return <div>...</div>;
}
```

### Casos de Uso por Tipo de Página

#### Páginas Públicas (SEO crítico)

```typescript
// ✅ SIEMPRE Server Component con metadata
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tu Título',
  description: 'Tu descripción para SEO',
  openGraph: {
    title: 'Título OG',
    description: 'Descripción OG',
  },
};

// Opcional: Dynamic metadata
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await fetchProduct(params.id);
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function PublicPage() {
  return <PageContent />;
}
```

#### Páginas con sessionStorage/localStorage

```typescript
// ✅ Server Component + force-dynamic
export const dynamic = 'force-dynamic'; // No static generation

export default function CartPage() {
  // Page sigue siendo Server Component
  // Client logic delegado a componente hijo
  return <CartPageContent />;
}
```

#### Páginas Privadas (Dashboard)

```typescript
// ✅ Server Component + data fetching
export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect('/signin');
  
  const data = await fetchUserData(session.user.id);
  
  return <DashboardContent data={data} />;
}
```

### Configuración de Route Segments

```typescript
// Static generation (default)
export default async function Page() { ... }

// ISR - Revalidar cada X segundos
export const revalidate = 3600; // 1 hora

// Dynamic - Siempre server-side render
export const dynamic = 'force-dynamic';

// Static con params dinámicos
export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }];
}
```

### Checklist para Crear una Page

- [ ] ¿Es Server Component? (debe serlo por defecto)
- [ ] ¿Tiene metadata para SEO? (si es pública)
- [ ] ¿Usa `dynamic` o `revalidate` correctamente?
- [ ] ¿Delega interactividad a Client Components?
- [ ] ¿Hace fetch de datos en el servidor?
- [ ] ¿Usa Suspense para streaming?

### Beneficios de Server Components en Pages

1. **SEO**: Metadata y contenido pre-renderizado
2. **Performance**: Menor JavaScript, mejor FCP/LCP
3. **Security**: Código sensible no llega al cliente
4. **DX**: TypeScript end-to-end sin serialización
5. **Cost**: Menos procesamiento en cliente

---

## Estándares de Calidad de Código

### Mantenibilidad

- **Código Autodocumentado**: Nombres claros y descriptivos
- **Responsabilidad Única**: Funciones y componentes con un propósito claro
- **Complejidad Limitada**: Funciones simples, máximo 50 líneas

### Rendimiento

- **Server Components por defecto**: Client Components solo para interactividad
- **ISR para contenido semi-estático**: `export const revalidate = 3600`
- **Streaming con Suspense**: Carga progresiva de contenido
- **Debounce en búsquedas**: Reduce requests innecesarios

### Seguridad

- **Validación de inputs**: Zod schemas en tRPC procedures
- **Queries parametrizadas**: Prisma ORM previene SQL injection
- **Autenticación**: NextAuth.js para rutas protegidas
- **Headers de seguridad**: Configurados en `next.config.js`

### Accesibilidad

- **Semantic HTML**: Elementos apropiados (`<button>`, `<nav>`)
- **ARIA attributes**: Cuando sea necesario
- **Keyboard navigation**: Todos los controles accesibles
- **Color contrast**: Cumple WCAG AA

### Testabilidad

- **Código testeable**: Funciones puras, lógica separada de UI
- **Tests aislados**: Unit tests independientes
- **Coverage apropiado**: Prioriza lógica crítica

---

## Testing Strategy

### Unit Tests (Vitest)

## **Ubicación**: `tests/unit/`

## Reglas Específicas de Next.js

**Prohibido**:

- ❌ `<img>` (usa `<Image>` de `next/image`)
- ❌ `<head>` (usa `metadata` export)
- ❌ `<a>` para navegación interna (usa `<Link>`)
- ❌ `useRouter` para navegación simple (usa `<Link>`)

**Preferido**:

- ✅ Server Components por defecto
- ✅ `<Link>` para navegación
- ✅ `<Image>` para imágenes
- ✅ ISR con `revalidate`

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

## Testing & Tooling

- Use Vitest for unit/contract/integration tests with jsdom and @testing-library/react.
- Use Playwright for E2E tests. Start the Next.js dev server automatically in Playwright config.
- Provide package.json scripts: `test`, `test:watch`, `test:ui`, `test:e2e`, `test:e2e:ui`.
- Organize tests under `tests/{unit,contract,integration,perf}` and E2E under `e2e/`.
- Ensure CI runs lint (Ultracite), typecheck (tsc), unit tests (Vitest) and E2E (Playwright) on PRs.

---

## Resumen de Patrones Clave

1. **Next.js 15**: Server Components por defecto, ISR, Streaming
2. **Pages**: SIEMPRE Server Components, delegar interactividad a componentes hijos
3. **Winston Logger**: Solo server-side (Server Components, Server Actions, API Routes, tRPC)
4. **SEO**: Metadata en Server Components, `generateMetadata` para contenido dinámico
5. **SOLID**: Responsabilidad única, composición, dependencias invertidas
6. **Atomic Design**: atoms (ui/), molecules (components/), organisms (\_components/), templates (layout.tsx), pages (page.tsx)
7. **tRPC**: Type-safe APIs con kebab-case naming
8. **Prisma**: ORM con PostgreSQL, singleton client
9. **Zod**: Validación de schemas end-to-end
10. **Custom Hooks**: Lógica reutilizable separada de UI
11. **Testing**: Vitest (unit/integration), Playwright (E2E)
12. **Ultracite**: Linting y formateo con Biome

---

**Cuando generes código, SIEMPRE**:

1. Detecta las versiones exactas del proyecto
2. Sigue los patrones establecidos en el codebase
3. **Crea pages como Server Components** (delega interactividad a Client Components)
4. **No uses Winston logger en Client Components** (solo server-side)
5. Aplica principios SOLID y Atomic Design
6. Usa la estructura de carpetas de Next.js App Router
7. Prioriza Server Components sobre Client Components
8. Agrega metadata para SEO en páginas públicas
9. Usa `dynamic` o `revalidate` según el caso de uso
10. Escribe código testeable y bien documentado
11. Usa español solo en UI text, todo lo demás en inglés
12. No crees Barrels (index.ts) o archivos barriles en ningún lugar, de NINGÚN tipo
13. Sigue las convenciones de naming y organización del proyecto
