# Conventions — Code Style, Patterns & Practices

## General Principles

1. **Self-documenting code** — No comments needed. If code needs comments to be understood, it should be refactored for better clarity.
2. **Consistency over cleverness** — Follow established patterns even if there's a "better" way.
3. **Explicit over implicit** — Clear variable names, clear types, clear intent.

## TypeScript Conventions

### Imports
```typescript
// Generated Prisma client - MUST use this path
import { PrismaClient } from "./generated/client"

// tRPC
import { trpc } from "@/server/api/trpc"

// Zod validation
import { z } from "zod"
```

### Types
- Use interfaces for object shapes
- Use type for unions/intersections
- Avoid `any` — use `unknown` when type is unclear

### Null Handling
- Prefer `undefined` over `null` where possible
- Use optional chaining (`?.`) and nullish coalescing (`??`)

## React/Next.js Conventions

### Server vs Client Components
- Default to Server Components
- Add `"use client"` only when interactivity needed
- Use React 19 patterns (no useMemo/useCallback needed with React Compiler)

### Component Structure
```tsx
// Example structure (self-documenting)
export async function ComponentName({ prop1, prop2 }: Props) {
  const data = await fetchData()
  
  return (
    <div>
      <Content data={data} />
    </div>
  )
}
```

### Hooks
- Use hooks for client-side logic
- React Hook Form for form handling
- Don't use useEffect for data fetching — use server components or tRPC

## tRPC Conventions

### Router Structure
```typescript
// src/server/api/routers/example.ts
import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"

export const exampleRouter = createTRPCRouter({
  procedureName: protectedProcedure
    .input(z.object({ ... }))
    .query(async ({ input, ctx }) => {
      return ctx.db.model.findMany()
    }),
})
```

### Input Validation
- Always validate input with Zod schemas
- Use `protectedProcedure` for auth-required endpoints
- Use `publicProcedure` for public endpoints

## Prisma Conventions

### Client Import
**CRITICAL:** Import from `./generated/client`, NOT `@prisma/client`:
```typescript
import { PrismaClient } from "./generated/client"
```

### Query Patterns
```typescript
// Always use select to limit fields when possible
const result = await ctx.db.model.findMany({
  select: { id: true, name: true, basePrice: true },
  where: { status: "published" },
})
```

### Field Naming
- Use camelCase for field names in code
- Schema uses snake_case with `@map()` for DB

## State Management

### Zustand
```typescript
// Store pattern
import { create } from "zustand"

interface Store {
  count: number
  increment: () => void
}

export const useStore = create<Store>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}))
```

### React Query (tRPC)
- Use `useQuery` and `useMutation` from tRPC
- Automatic caching and invalidation

## Form Handling

### React Hook Form
```typescript
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { ... },
})
```

## File Organization

### Feature-based
- Group related files together
- Co-locate tests with implementation when appropriate

### Naming
- kebab-case for files: `glass-type.service.ts`
- camelCase for utilities: `db.ts`, `trpc.ts`

## Error Handling

### API Errors
- Use tRPC's error handling
- Throw TRPCError with appropriate code
- Never expose internal error details to client

### Service Errors
- Return meaningful error types
- Use Result/Either pattern where appropriate

## Validation Patterns

### Zod Schemas
```typescript
const schema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  items: z.array(z.object({
    id: z.string(),
    quantity: z.number().positive(),
  })),
})
```

## Testing Patterns

### Unit Tests (Vitest)
```typescript
import { describe, it, expect } from "vitest"

describe("calculator", () => {
  it("adds numbers", () => {
    expect(1 + 1).toBe(2)
  })
})
```

### React Testing
```typescript
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
```

## Code Style Tools

### Biome
- Primary linter/formatter (Rust-based, fast)
- Config in `biome.json`

### ESLint (if used)
- Extended configurations
- React hooks rules

## Git Conventions

### Commits
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
- No "Co-Authored-By" or AI attribution
- Commit message should explain WHY, not WHAT

### Pre-commit
- lint-staged with Biome fix
- Don’t commit secrets

## Known Patterns in Codebase

### compatibleGlassTypeIds
- Stored as JSON string in SQLite
- Must parse: `JSON.parse(model.compatibleGlassTypeIds)`
- 30+ files still incorrectly assume it's an array

### Decimal Handling
- Use `Decimal` type from Prisma
- For calculations, use `decimal.js` library
- Never use floating point for money

### React Components
- Use `cn()` utility from `src/lib/utils.ts` for className merging
- Follow shadcn patterns for component structure

## Environment Variables

- Use `@t3-oss/env-nextjs` for env validation
- Never expose secrets to client
- Use `server-only` for server-only imports

## Performance

- React 19 Compiler handles memoization
- Use Server Components by default
- Client components only when needed
- Consider streaming for large data