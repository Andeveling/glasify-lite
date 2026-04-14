# Architecture — System Design & Patterns

## Overall Architecture

**Pattern:** Next.js App Router with tRPC API layer, better-auth for authentication, and Prisma ORM.

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js App Router                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Pages/UI    │  │  Server      │  │   Actions    │     │
│  │  (React 19)   │  │  Components   │  │ (Server Act) │     │
│  └───────┬──────┘  └───────┬──────┘  └──────────────┘     │
│          │                 │                               │
│  ┌───────▼─────────────────▼───────────────────────────┐   │
│  │              tRPC API Layer                          │   │
│  │  (superjson transformer, type-safe)                  │   │
│  └───────┬─────────────────┬───────────────────────────┘   │
│          │                 │                                │
│  ┌───────▼────────┐  ┌─────▼────────────────────────┐     │
│  │  tRPC Routers  │  │  Services Layer              │     │
│  │  /routers/*    │  │  /server/services/*           │     │
│  └───────┬────────┘  └─────┬────────────────────────┘     │
│          │                 │                                │
│  ┌───────▼─────────────────▼───────────────────────────┐  │
│  │              Prisma ORM + libsql/SQLite              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              better-auth (Authentication)           │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Layer Structure

### 1. Presentation Layer (`src/app/`)
- Next.js App Router pages and layouts
- Server Components by default
- Client components where needed ( interactivity, forms)

### 2. API Layer (`src/server/api/routers/`)
- tRPC routers organized by domain
- Input validation via Zod schemas
- Type-safe procedure calls

### 3. Service Layer (`src/server/services/`)
- Business logic
- Data access orchestration
- External integrations

### 4. Data Layer (`src/server/db.ts`)
- Prisma client singleton
- Database operations

### 5. Domain Layer (`src/domain/`)
- Business logic (if used)
- Value objects

### 6. Lib/Utils (`src/lib/`)
- Shared utilities
- Export utilities (Excel, PDF)
- Validation schemas

## Key Modules

### Authentication (`src/server/auth/`)
- `config.ts` — better-auth configuration
- `index.ts` — Auth exports

### tRPC Setup (`src/server/api/`)
- `root.ts` — Root router aggregation
- `trpc.ts` — tRPC initialization
- Routers in `routers/` subdirectory

### Admin Routers (`src/server/api/routers/admin/`)
- `admin.ts` — Admin router
- `clients.ts`, `colors.ts`, `glass-type.ts`, `glass-solution.ts`, `glass-supplier.ts`
- `model.ts`, `model-colors.ts`, `profile-supplier.ts`, `service.ts`, `tenant-config.ts`, `design-template.ts`, `gallery.ts`

### Domain Routers
- `catalog/` — Catalog queries and mutations
- `quote/` — Quote creation and management
- `dashboard.ts` — Dashboard metrics
- `address.ts` — Address management
- `user.ts` — User management
- `geocoding.ts` — Geocoding service
- `transportation.ts` — Transportation rates

### AI System (`src/server/ai/`)
- `agents/` — AI agent definitions
- `providers/` — AI provider implementations
- `tools/` — AI tools for catalog and model operations

### Services (`src/server/services/`)
- `dashboard-metrics.ts`
- `email.ts`
- `file-upload.service.ts`
- `geocoding.service.ts`
- `glass-price-history.service.ts`
- `model-price-history.service.ts`
- `price-adapter.ts`
- `referential-integrity.service.ts`
- `transportation.service.ts`
- `model-assistant.service.ts`
- `model-assistant-message.service.ts`
- `model-assistant-session.service.ts`

## Data Flow

### Quote Creation Flow
1. Client selects models, glass types, colors
2. Cart calculation (client-side)
3. tRPC mutation creates Quote + QuoteItems
4. Services calculate totals with pricing
5. PDF/Excel export available

### Authentication Flow
1. User submits credentials
2. better-auth validates
3. Session created in database
4. tRPC context includes session user

## Entry Points

### Main Entry
- `src/app/` — Next.js App Router pages

### API Entry
- `src/server/api/root.ts` — tRPC router entry
- `src/server/trpc.ts` — tRPC server initialization

### Auth Entry
- `src/server/auth/config.ts` — better-auth configuration

## State Management

### Server State
- tRPC + React Query for server data
- Automatic caching and invalidation

### Client State
- Zustand for client-side state
- React Hook Form for form state

## Known Architectural Debt

### compatibleGlassTypeIds Issue
- Schema defines it as `String` (JSON serialized)
- Codebase treats it as `String[]` in 30+ locations
- Migration planned but not executed

### Prisma Client Import
- Must import from `./generated/client`
- NOT from `@prisma/client`
- This is frequently misunderstood

## Multi-Tenancy

Currently single-tenant with `TenantConfig` ID hardcoded to `"1"`. Some models have `tenantConfigId` field but it's not actively used for multi-tenancy isolation.