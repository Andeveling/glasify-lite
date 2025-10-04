# Glasify Lite — Cotizador Inteligente de Vidrios

Glasify Lite es una aplicación web para cotización inteligente de productos de vidrio, construida con Next.js 15, tRPC, Prisma, y PostgreSQL.

## Convenciones del Proyecto

### Commits Messages
- Use conventional commit messages in English
- UI text must be in Spanish (es-LA)
- Examples:
  - `feat: add quote calculation endpoint`
  - `fix: correct pricing formula for tempered glass`
  - `docs: update API documentation`

### Important
- Never use Spanish in code, comments, or commit messages only in UI text and user-facing content.

### Naming Conventions
- **Files**: kebab-case (`quote-calculator.ts`, `glass-type-selector.tsx`)
- **Components**: PascalCase (`QuoteForm`, `GlassTypeSelector`)  
- **Variables/Functions**: camelCase (`calculatePrice`, `glassType`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_GLASS_THICKNESS`, `DEFAULT_MARGIN`)
- **Database entities**: PascalCase (`Manufacturer`, `QuoteItem`)
- **tRPC procedures**: kebab-case (`quote.calculate-item`, `catalog.list-models`)

### Domain Language (Spanish)
UI text, error messages, and user-facing content must be in Spanish (es-LA):
- "Cotización" not "Quote"
- "Vidrio" not "Glass"  
- "Modelo" not "Model"
- "Fabricante" not "Manufacturer"
- "Presupuesto" not "Budget"



## Tech Stack & Architecture

### Core Technologies
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.8+ with strict mode
- **Database**: PostgreSQL with Prisma ORM
- **API**: tRPC for type-safe APIs
- **Authentication**: NextAuth.js v5
- **Styling**: TailwindCSS v4 with Shadcn/ui components
- **State**: TanStack Query (React Query) v5
- **Forms**: React Hook Form use `/src/components/ui/form.tsx` Shadcn integration with ZodResolver validation

### Project Structure
```
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable UI components  
├── lib/             # Utilities and configurations
├── server/          # Backend logic (tRPC, Prisma)
│   ├── api/         # tRPC routers
│   ├── auth/        # Authentication config
│   └── services/    # Business logic services
└── trpc/            # tRPC client configuration

tests/
├── contract/        # API contract tests
├── integration/     # Integration tests  
├── unit/           # Unit tests
└── perf/           # Performance benchmarks

e2e/                # Playwright E2E tests
```

### Database Design
- **Manufacturers**: Glass manufacturers (VEKA, Guardian, etc.)
- **Models**: Specific glass models with pricing data
- **GlassTypes**: Categories (tempered, laminated, etc.)
- **Services**: Additional services (cutting, polishing, etc.)
- **Quotes**: Customer quotation requests
- **QuoteItems**: Individual items within a quote
- **Adjustments**: Price modifications (discounts, surcharges)

## Development Principles

### Code Quality with Ultracite
- Zero configuration required
- Subsecond performance  
- Maximum type safety
- AI-friendly code generation
- Uses Biome for formatting and linting

### TDD Approach
1. Write contract tests first (`tests/contract/`)
2. Implement tRPC procedures 
3. Add integration tests (`tests/integration/`)
4. Create unit tests for complex logic (`tests/unit/`)
5. Add E2E tests for user workflows (`e2e/`)

### API Design
- Use kebab-case for tRPC procedure names
- Input/output schemas in Spanish (es-LA)
- Comprehensive Zod validation
- Error messages in Spanish
- Type-safe end-to-end with TypeScript

### Next.js Specific Rules
- Don't use `<img>` elements in Next.js projects.
- Don't use `<head>` elements in Next.js projects.
- Don't import next/document outside of pages/_document.jsx in Next.js projects.
- Don't use the next/head module in pages/_document.js on Next.js projects.
- Prefer the `Link` component from `next/link` over `<a>` or `useRouter` tags for internal navigation.
- SSR first, then CSR. Use `use client` directive only when strictly necessary.

### Testing Best Practices
- Don't use export or module.exports in test files.
- Don't use focused tests.
- Make sure the assertion function, like expect, is placed inside an it() function call.
- Don't use disabled tests.
- Use ultracite in package json commands for consistency.

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

## Logging
- Use Winston for structured logging.
- Use singleton pattern for logger instance `/src/lib/logger.ts`.
- Log at appropriate levels: info, warn, error, debug.
- Log messages in English for developers, Spanish for user-facing errors.
