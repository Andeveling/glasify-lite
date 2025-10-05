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

**✅ Ejemplo del Proyecto**:

```typescript
// src/components/ui/button.tsx
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border bg-background hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3',
        lg: 'h-10 px-6',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type ButtonProps = React.ComponentProps<'button'> & 
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
```

### Molecules (Combinaciones de Atoms)

**Ubicación**: `src/components/` o `src/app/(route)/_components/`

**Características**:
- Combinan 2-3 atoms en un componente cohesivo
- Lógica simple de presentación
- Props específicas y bien definidas
- Pueden tener estado local simple

**✅ Ejemplo**:

```typescript
// Molecule: InputGroup con búsqueda y clear
import { Input } from './input';
import { Button } from './button';
import { Search, X } from 'lucide-react';

type InputGroupProps = {
  value: string;
  onValueChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
};

function InputGroup({ value, onValueChange, onClear, placeholder }: InputGroupProps) {
  return (
    <div className="relative flex items-center">
      <Search className="absolute left-3 size-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={e => onValueChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {value && onClear && (
        <Button variant="ghost" size="icon" onClick={onClear} className="absolute right-1">
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}
```

### Organisms (Componentes Complejos)

**Ubicación**: `src/app/(route)/_components/`

**Características**:
- Componentes con lógica de negocio y estado complejo
- Componen atoms y molecules
- Pueden ser Server o Client Components según necesidad
- Usan custom hooks para separar lógica

**✅ Ejemplo del Proyecto**:

```typescript
// src/app/(public)/catalog/_components/catalog-search.tsx
'use client';

import { Search, X } from 'lucide-react';
import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { useDebouncedSearch } from '../_hooks/use-catalog';

type CatalogSearchProps = {
  initialValue?: string;
};

export function CatalogSearch({ initialValue }: CatalogSearchProps) {
  const { query, handleSearchChange, handleClear, isPending } = 
    useDebouncedSearch(initialValue);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Buscar modelos..."
        value={query}
        onChange={e => handleSearchChange(e.target.value)}
        className="pl-9 pr-9"
        disabled={isPending}
      />
      {query && (
        <Button variant="ghost" size="icon" onClick={handleClear}>
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}
```

### Templates (Layouts sin Datos)

**Ubicación**: `src/app/(route)/layout.tsx`

**Características**:
- Definen estructura de página sin datos específicos
- Next.js layouts que envuelven páginas
- Pueden tener metadata y configuración

**✅ Ejemplo**:

```typescript
// src/app/(dashboard)/layout.tsx
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';

export const metadata: Metadata = {
  title: 'Dashboard - Glasify',
  description: 'Panel de administración',
};

export default async function DashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const session = await auth();
  
  if (!session) {
    redirect('/signin');
  }
  
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar user={session.user} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
```

### Pages (Orquestación Final)

**Ubicación**: `src/app/(route)/page.tsx`

**Características**:
- Server Components que orquestan todo
- Fetch de datos en el servidor
- Composición de organisms, molecules y atoms
- Manejo de Suspense boundaries

**✅ Ejemplo del Proyecto**:

```typescript
// src/app/(public)/catalog/page.tsx
export const revalidate = 3600; // ISR

export default async function CatalogPage({ searchParams }: Props) {
  const params = await searchParams;
  const { searchQuery, page, manufacturerId, sort } = validateCatalogParams(params);
  
  const manufacturers = await api.catalog['list-manufacturers']();
  const totalData = await api.catalog['list-models']({ limit: 1, ... });
  
  return (
    <div className="min-h-screen">
      <div className="container">
        <CatalogHeader /> {/* Organism */}
        <CatalogFilterBar {...props} /> {/* Organism */}
        <Suspense fallback={<CatalogSkeleton />}>
          <CatalogContent {...props} /> {/* Organism */}
        </Suspense>
      </div>
    </div>
  );
}
```

---

## Guías Específicas de Next.js 15

### Server vs Client Components

**Server Components (por defecto)**:
- Sin directiva `'use client'`
- Pueden ser `async` para data fetching
- No usan hooks de React (`useState`, `useEffect`)
- No usan event listeners (`onClick`, `onChange`)
- Acceso directo a backend (Prisma, file system)

**Client Components**:
- Requieren directiva `'use client'` al inicio del archivo
- Usan hooks de React o event handlers
- Props deben ser serializables

**✅ Patrón del Proyecto**:

```typescript
// ✅ Server Component (sin 'use client')
export default async function CatalogPage({ searchParams }: Props) {
  const models = await api.catalog['list-models'](); // ✅ Fetch directo
  
  return (
    <div>
      <CatalogHeader /> {/* Server Component */}
      <CatalogSearch /> {/* Client Component */}
    </div>
  );
}

// ✅ Client Component (con 'use client')
'use client';

export function CatalogSearch() {
  const [query, setQuery] = useState(''); // ✅ Hook de React
  
  return (
    <Input
      value={query}
      onChange={e => setQuery(e.target.value)} // ✅ Event handler
    />
  );
}
```

### Data Fetching Patterns

**Server-side Fetching** (preferido):

```typescript
// En Server Components
async function CatalogContent({ searchQuery }: Props) {
  // ✅ tRPC server client
  const { items } = await api.catalog['list-models']({ search: searchQuery });
  
  return <CatalogGrid models={items} />;
}
```

**Client-side Fetching** (cuando sea necesario):

```typescript
'use client';

import { api } from '@/trpc/react';

function LiveResults() {
  // ✅ tRPC React Query client
  const { data, isLoading } = api.catalog['list-models'].useQuery({
    search: 'vidrio',
  });
  
  if (isLoading) return <Spinner />;
  return <CatalogGrid models={data.items} />;
}
```

### Metadata y SEO

```typescript
import type { Metadata } from 'next';

// Metadata estática
export const metadata: Metadata = {
  title: 'Catálogo - Glasify',
  description: 'Explore nuestra selección de productos de vidrio',
};

// Metadata dinámica
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { modelId } = await params;
  const model = await api.catalog['get-model-by-id']({ modelId });
  
  return {
    title: `${model.name} - Glasify`,
    description: `Modelo ${model.name} del fabricante ${model.manufacturer?.name}`,
  };
}
```

### ISR (Incremental Static Regeneration)

```typescript
// Revalidar cada hora
export const revalidate = 3600;

// Revalidar según demanda (on-demand)
import { revalidatePath } from 'next/cache';

export async function createModel(data: ModelInput) {
  await prisma.model.create({ data });
  revalidatePath('/catalog');
}
```

### Error Handling

```typescript
// error.tsx (Error Boundary)
'use client';

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    logger.error('Catalog page error', { error });
  }, [error]);
  
  return (
    <div>
      <h2>Algo salió mal</h2>
      <button onClick={reset}>Intentar de nuevo</button>
    </div>
  );
}

// not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>404 - Página no encontrada</h2>
      <Link href="/catalog">Volver al catálogo</Link>
    </div>
  );
}
```

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

**Ubicación**: `tests/unit/`

```typescript
// tests/unit/catalog/catalog.utils.test.ts
import { describe, it, expect } from 'vitest';
import { calculateTotalPages } from '@/app/(public)/catalog/_utils/catalog.utils';

describe('calculateTotalPages', () => {
  it('should calculate correct total pages', () => {
    expect(calculateTotalPages(100, 20)).toBe(5);
    expect(calculateTotalPages(101, 20)).toBe(6);
  });
});
```

### Integration Tests (Vitest)

**Ubicación**: `tests/integration/`

```typescript
// tests/integration/catalog/catalog.router.test.ts
import { describe, it, expect } from 'vitest';
import { appRouter } from '@/server/api/root';

describe('catalog.router', () => {
  it('should list models with filters', async () => {
    const ctx = await createInnerTRPCContext({ session: null });
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.catalog['list-models']({
      search: 'Guardian',
      page: 1,
      limit: 20,
    });
    
    expect(result.items).toBeInstanceOf(Array);
  });
});
```

### E2E Tests (Playwright)

**Ubicación**: `e2e/`

```typescript
// e2e/catalog/catalog.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Catalog', () => {
  test('should filter models by search', async ({ page }) => {
    await page.goto('/catalog');
    await page.getByPlaceholder('Buscar modelos...').fill('Guardian');
    await page.waitForSelector('[data-testid="model-card"]');
    
    const cards = await page.getByTestId('model-card').all();
    expect(cards.length).toBeGreaterThan(0);
  });
});
```

---

## Logging con Winston

**Singleton Logger**: `src/lib/logger.ts`

```typescript
import logger from '@/lib/logger';

// Niveles: info, warn, error, debug
logger.info('Listing models', { count: models.length });
logger.warn('Invalid manufacturer ID', { manufacturerId });
logger.error('Error listing manufacturers', {
  error: error instanceof Error ? error.message : 'Unknown error',
});

// Logs en inglés para developers
// Mensajes de error para usuarios en español
```

---

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
- `pnpm ultra:fix` - Format and fix code automatically with Ultracite
- `pnpm ultra` - Check for issues without fixing  
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
2. **SOLID**: Responsabilidad única, composición, dependencias invertidas
3. **Atomic Design**: atoms (ui/), molecules (components/), organisms (_components/), templates (layout.tsx), pages (page.tsx)
4. **tRPC**: Type-safe APIs con kebab-case naming
5. **Prisma**: ORM con PostgreSQL, singleton client
6. **Zod**: Validación de schemas end-to-end
7. **Custom Hooks**: Lógica reutilizable separada de UI
8. **Winston**: Logging estructurado con singleton
9. **Testing**: Vitest (unit/integration), Playwright (E2E)
10. **Ultracite**: Linting y formateo con Biome

---

**Cuando generes código, SIEMPRE**:
1. Detecta las versiones exactas del proyecto
2. Sigue los patrones establecidos en el codebase
3. Aplica principios SOLID y Atomic Design
4. Usa la estructura de carpetas de Next.js App Router
5. Prioriza Server Components sobre Client Components
6. Escribe código testeable y bien documentado
7. Usa español solo en UI text, todo lo demás en inglés

