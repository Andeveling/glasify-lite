# Stack — Technology & Dependencies

## Runtime & Framework

| Component | Version | Notes |
|-----------|---------|-------|
| Node.js | 25.x | Current environment |
| Next.js | 16.2.2 | App Router, Turbopack |
| React | 19.2.0 | Server Components |
| TypeScript | 5.9.3 | Strict mode |

## Database

| Component | Version | Notes |
|-----------|---------|-------|
| Prisma | 7.2.0 | ORM with code generation |
| SQLite | via libsql | File: `./prisma/dev.db` |
| `@prisma/adapter-libsql` | 7.6.0 | SQLite adapter for Prisma |
| `@libsql/client` | 0.17.2 | Database client |

**Prisma Client Location:** Generated to `prisma/generated/client`, NOT `node_modules/@prisma/client`. Import from:
```ts
import { PrismaClient } from "./generated/client"
```

## API & Backend

| Component | Version | Notes |
|-----------|---------|-------|
| tRPC | 11.6.0 | Type-safe API layer |
| superjson | 2.2.2 | JSON transformer for tRPC |
| better-auth | 1.5.6 | Authentication provider |
| `@tanstack/react-query` | 5.90.2 | Data fetching |

## Validation & Schema

| Component | Version | Notes |
|-----------|---------|-------|
| Zod | 4.1.12 | Validation (v4, breaking changes from v3) |
| `@hookform/resolvers` | 5.2.2 | React Hook Form integration |
| react-hook-form | 7.64.0 | Form handling |

## UI & Styling

| Component | Version | Notes |
|-----------|---------|-------|
| Tailwind CSS | 4.1.14 | CSS-first config (no .config.js) |
| shadcn | 3.5.0 | Component registry |
| Radix UI | 1.4.3 | Headless components |
| class-variance-authority | 0.7.1 | Component variants |
| clsx + tailwind-merge | 2.1.1 + 3.3.1 | ClassName utility |
| motion | 12.38.0 | Animations |
| lucide-react | 0.562.0 | Icons |
| sonner | 2.0.7 | Toast notifications |
| vaul | 1.1.2 | Drawer component |
| cmdk | 1.1.1 | Command palette |

## AI & Streaming

| Component | Version | Notes |
|-----------|---------|-------|
| ai | 6.0.159 | AI SDK for streaming |
| `@ai-sdk/react` | 3.0.161 | React hooks for AI |
| `vercel-minimax-ai-provider` | 0.0.2 | MiniMax AI provider |
| streamdown | 2.5.0 | Streaming utilities |
| `@streamdown/cjk` | 1.0.3 | CJK support |
| `@streamdown/code` | 1.1.1 | Code rendering |
| `@streamdown/math` | 1.0.2 | Math rendering |
| `@streamdown/mermaid` | 1.0.2 | Mermaid diagrams |

## Data & Calculation

| Component | Version | Notes |
|-----------|---------|-------|
| decimal.js | 10.6.0 | Precise decimal arithmetic |
| recharts | 2.15.4 | Charts |
| exceljs | 4.4.0 | Excel file generation |
| `@react-pdf/renderer` | 4.3.3 | PDF generation |

## State Management

| Component | Version | Notes |
|-----------|---------|-------|
| zustand | 5.0.12 | State management |
| immer | 11.1.4 | Immutable state |
| @tanstack/react-table | 8.21.3 | Table component |
| @dnd-kit/* | 10.0.0 | Drag and drop |

## Utilities

| Component | Version | Notes |
|-----------|---------|-------|
| nanoid | 5.1.7 | ID generation |
| @paralleldrive/cuid2 | 3.3.0 | CUID generation |
| date-fns | via @formkit/tempo | Date formatting |
| react-day-picker | 9.11.1 | Date picker |
| use-debounce | 10.0.6 | Debounce hooks |
| use-stick-to-bottom | 1.1.3 | Scroll behavior |
| haversine-distance | 1.2.4 | Distance calculation |
| fp-ts | 2.16.11 | Functional programming |
| server-only | 0.0.1 | Server-only imports |

## Testing

| Component | Version | Notes |
|-----------|---------|-------|
| vitest | 4.0.4 | Unit testing |
| @playwright/test | 1.56.0 | E2E testing |
| @testing-library/react | 16.3.0 | React testing |
| @testing-library/jest-dom | 6.9.1 | Jest DOM matchers |
| jsdom | 27.0.0 | DOM for testing |

## Linting & Formatting

| Component | Version | Notes |
|-----------|---------|-------|
| Biome | 2.3.0 | Lint + format (fast, Rust-based) |
| @commitlint/cli | 20.1.0 | Commit linting |
| lint-staged | 16.2.3 | Pre-commit lint |

## Build & Dev

| Component | Version | Notes |
|-----------|---------|-------|
| pnpm | 10.33.0 | Package manager |
| @vitejs/plugin-react | 5.0.4 | Vite React plugin |
| babel-plugin-react-compiler | 1.0.0 | React Compiler |
| react-scan | 0.4.3 | Performance scanning |
| lefthook | 2.0.0 | Git hooks |

## Key Environment Variables

```
DATABASE_URL=file:./prisma/dev.db    # SQLite path (required for prisma commands)
```

## Commands

```bash
# Development
pnpm dev                              # Next dev with turbo
pnpm build                            # prisma generate && next build

# Database
DATABASE_URL="file:./prisma/dev.db" pnpm db:push    # Sync schema to DB
pnpm prisma generate                              # Regenerate client

# Quality
pnpm lint:errors                             # Biome errors only
pnpm typecheck                               # tsc --noEmit
pnpm test                                    # Vitest

# Seeding
pnpm seed:minimal                            # Seed with minimal preset
pnpm seed --preset=vitro-rojas-panama        # Seed with real client data
```