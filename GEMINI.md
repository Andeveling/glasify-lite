# Glasify Lite Development Guidelines

**Last Updated**: 2025-01-10
**Constitution**: See `.specify/memory/constitution.md`

## Code Generation Priorities

When generating code for this repository:

1. **Version Compatibility**: Always detect and respect exact versions of languages, frameworks and libraries
2. **Context Files**: Prioritize patterns defined in `.github/instructions/` directory
3. **Codebase Patterns**: When context files don't provide guidance, scan codebase for established patterns
4. **Architectural Consistency**: Maintain Next.js 16 App Router + tRPC style and boundaries
5. **Code Quality**: Prioritize maintainability, performance, security, accessibility and testability

---

## Active Technologies
- TypeScript 5.9.3 (strict mode), Node.js ES2022 + Next.js 16.0.1 (App Router), React 19.2.0, tRPC 11.6.0, Prisma 6.18.0, Zod 4.1.12, React Hook Form 7.64.0 (001-delivery-address)
- PostgreSQL (existing instance) - add `ProjectAddress` model, modify `Quote` and `TenantConfig` models (001-delivery-address)
- TypeScript 5.9.3 (strict mode), Node.js ES2022 + Next.js 16.0.1 (App Router), React 19.2.0, tRPC 11.6.0, Zod 4.1.12 (001-admin-quotes-dashboard)
- PostgreSQL (existing schema - Quote, User, QuoteStatus enum) (001-admin-quotes-dashboard)
- TypeScript 5.9.3 (strict mode), Node.js ES2022 + Next.js 16.0.1 (App Router), React 19.2.0, tRPC 11.6.0, React Hook Form 7.64.0, Zod 4.1.12, TanStack Query 5.90.2 (019-edit-cart-items)
- PostgreSQL via Prisma 6.18.0 (existing schema - CartItem, Model, GlassType entities) (019-edit-cart-items)

**Language/Runtime**:
- TypeScript 5.9.3 (strict mode), Node.js (ES2022 target)

**Framework**:
- Next.js 16.0.1 (App Router, React Server Components 19.2.0)

**Core Dependencies**:
- tRPC 11.6.0 (type-safe API)
- Prisma 6.18.0 (PostgreSQL ORM)
- Better Auth 1.2.7 (authentication)
- TanStack Query 5.90.2 (React Query)
- Zod 4.1.12 (schema validation)
- React Hook Form 7.64.0 (forms)

**UI Stack**:
- Shadcn/ui + Radix UI (components)
- TailwindCSS 4.1.14 (styling)

**Development Tools**:
- Ultracite 6.0.4 + Biome 2.3.0 (linting/formatting)
- Vitest 4.0.4 (unit/integration tests with jsdom)
- Playwright 1.56.0 (E2E tests)
- Winston 3.18.3 (server-side logging)
- Lefthook 2.0.0 (git hooks)

---

## Critical Rules

### Cache Components - Server-Side Caching

⚠️ **IMPORTANT**: Next.js 16 Cache Components enable build-time prerendering. Certain APIs are **incompatible** with `"use cache"`.

**Core APIs**:
- `"use cache"` - Public cache (build-time prerendering)
- `"use cache: private"` - Private cache (runtime prefetching, allows dynamic APIs)
- `cacheLife(profile)` - Time-based revalidation
- `cacheTag(tag)` - Tag-based invalidation

**❌ FORBIDDEN in `"use cache"` functions**:
- `headers()` and `cookies()` (dynamic data sources)
- Winston logger (uses `headers()` internally)
- `Date.now()` before dynamic data access
- Route Segment Config exports (`dynamic`, `revalidate`, `runtime`)
- Empty arrays from `generateStaticParams()`

**✅ ALTERNATIVES**:
- Use `performance.now()` for timing measurements (not `Date.now()`)
- Use direct Prisma access for static pages (bypass tRPC)
- Use `"use cache: private"` if you need `headers()`/`cookies()`
- Wrap uncached data in `<Suspense>` boundaries
- Return placeholder values in `generateStaticParams()`

**Migration Pattern**:
```typescript
// ❌ BEFORE (incompatible)
export const dynamic = 'force-static';
const start = Date.now();
logger.info('Action'); // uses headers()

// ✅ AFTER (Cache Components compatible)
export default async function Page() {
  "use cache";
  cacheLife("hours");
  const start = performance.now(); // not Date.now()
  // logger removed, use console in dev
}
```

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

### Naming Conventions

- **Files**: kebab-case (`quote-calculator.ts`, `catalog-search.tsx`)
- **Components**: PascalCase (`QuoteForm`, `CatalogSearch`)
- **Variables/Functions**: camelCase (`calculatePrice`, `handleSearchChange`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_GLASS_THICKNESS`, `DEFAULT_PAGE_LIMIT`)
- **Database entities**: PascalCase (`Manufacturer`, `QuoteItem`)
- **tRPC procedures**: kebab-case (`'quote.calculate-item'`, `'catalog.list-models'`)
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

Next.js 16 App Router with strict organizational rules:

```
glasify-lite/
├── src/
│   ├── app/                          # Next.js 16 App Router
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

---

## Arquitectura Next.js 16 + SOLID + Atomic Design

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

---

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
**When generating code, ALWAYS**:

1. Detect exact project versions
2. Follow established codebase patterns
3. **For dashboard routes: Use SSR with `dynamic = 'force-dynamic'`** (no ISR)
4. **Create pages as Server Components** (delegate interactivity to Client Components)
5. **For SSR mutations: Use `router.refresh()` after `invalidate()`** (two-step pattern)
6. **Never use Winston logger in Client Components** (server-side only)
7. **Apply Cache Components patterns** (performance.now(), no headers in "use cache", Suspense boundaries)
8. **Apply RBAC patterns** (middleware, tRPC procedures, UI guards)
9. **Use adminProcedure for admin-only APIs** (not manual role checks)
10. **Use getQuoteFilter for data filtering** (role-based WHERE clauses)
11. **Use server-optimized table pattern** (URL state, debounced search, database indexes)
12. **Use centralized formatters from `@lib/format`** (with tenant context)
13. **Implement optimistic UI for mutations** (with rollback on error)
14. Apply SOLID principles and Atomic Design
15. Use Next.js App Router folder structure
16. Prioritize Server Components over Client Components
17. Add metadata for SEO on public pages
17. Write testable and well-documented code
18. Use Spanish only in UI text, everything else in English
19. Never create Barrels (index.ts) or barrel files anywhere
20. Follow project naming and organization conventions


Avoid `accessKey` attr and distracting els
No `aria-hidden="true"` on focusable els
No ARIA roles, states, props on unsupported els
Use `scope` prop only on `<th>` els
No non-interactive ARIA roles on interactive els
Label els need text and associated input
No event handlers on non-interactive els
No interactive ARIA roles on non-interactive els
No `tabIndex` on non-interactive els
No positive integers on `tabIndex` prop
No `image`, `picture`, or `photo` in img alt props
No explicit role matching implicit role
Valid role attrs on static, visible els w/ click handlers
Use `title` el for `svg` els
Provide meaningful alt text for all els requiring it
Anchors need accessible content
Assign `tabIndex` to non-interactive els w/ `aria-activedescendant`
Include all required ARIA attrs for els w/ ARIA roles
Use valid ARIA props for the el's role
Use `type` attr on `button` els
Make els w/ interactive roles and handlers focusable
Heading els need accessible content
Add `lang` attr to `html` el
Use `title` attr on `iframe` els
Pair `onClick` w/ `onKeyUp`, `onKeyDown`, or `onKeyPress`
Pair `onMouseOver`/`onMouseOut` w/ `onFocus`/`onBlur`
Add caption tracks to audio and video els
Use semantic els vs role attrs
All anchors must be valid and navigable
Use valid, non-abstract ARIA props, roles, states, and values
Use valid values for `autocomplete` attr
Use correct ISO language codes in `lang` attr
Include generic font family in font families
No consecutive spaces in regex literals
Avoid `arguments`, comma op, and primitive type aliases
No empty type params in type aliases and interfaces
Keep fns under Cognitive Complexity limit
Limit nesting depth of `describe()` in tests
No unnecessary boolean casts or callbacks on `flatMap`
Use `for...of` vs `Array.forEach`
No classes w/ only static members
No `this` and `super` in static contexts
No unnecessary catch clauses, ctors, `continue`, escape sequences in regex literals, fragments, labels, or nested blocks
No empty exports
No renaming imports, exports, or destructured assignments to same name
No unnecessary string/template literal concatenation or useless cases in switch stmts, `this` aliasing, or `String.raw` without escape sequences
Use simpler alternatives to ternary ops if possible
No `any` or `unknown` as type constraints or initializing vars to `undefined`
Avoid `void` op
Use arrow fns vs function exprs
Use `performance.now()` for high-resolution timing (avoid `Date.now()` in cached functions)
Use `.flatMap()` vs `map().flat()`
Use `indexOf`/`lastIndexOf` vs `findIndex`/`findLastIndex` for simple lookups
Use literal property access vs computed property access
Use binary, octal, or hex literals vs `parseInt()`
Use concise optional chains vs chained logical exprs
Use regex literals vs `RegExp` ctor
Use base 10 or underscore separators for number literal object member names
Remove redundant terms from logical exprs
Use `while` loops vs `for` loops if initializer and update aren't needed
No reassigning `const` vars or constant exprs in conditions
No `Math.min`/`Math.max` to clamp values where result is constant
No return values from ctors or setters
No empty character classes in regex literals or destructuring patterns
No `__dirname` and `__filename` in global scope
No calling global object props as fns or declaring fns and `var` accessible outside their block
Instantiate builtins correctly
Use `super()` correctly in classes
Use standard direction values for linear gradient fns
Use valid named grid areas in CSS Grid Layouts
Use `@import` at-rules in valid positions
No vars and params before their decl
Include `var` fn for CSS vars
No `\8` and `\9` escape sequences in strings
No literal numbers that lose precision, configured els, or assigning where both sides are same
Compare string case modifications w/ compliant values
No lexical decls in switch clauses or undeclared vars
No unknown CSS value fns, media feature names, props, pseudo-class/pseudo-element selectors, type selectors, or units
No unmatchable An+B selectors or unreachable code
Call `super()` exactly once before accessing `this` in ctors
No control flow stmts in `finally` blocks
No optional chaining where `undefined` is not allowed
No unused fn params, imports, labels, private class members, or vars
No return values from fns w/ return type `void`
Specify all dependencies correctly in React hooks and names for GraphQL operations
Call React hooks from top level of component fns
Use `isNaN()` when checking for NaN
Use `{ type: "json" }` for JSON module imports
Use radix arg w/ `parseInt()`
Start JSDoc comment lines w/ single asterisk
Move `for` loop counters in right direction
Compare `typeof` exprs to valid values
Include `yield` in generator fns
No importing deprecated exports, duplicate dependencies, or Promises where they're likely a mistake
No non-null assertions after optional chaining or shadowing vars from outer scope
No expr stmts that aren't fn calls or assignments or useless `undefined`
Add `href` attr to `<a>` els and `width`/`height` attrs to `<img>` els
Use consistent arrow fn bodies and either `interface` or `type` consistently
Specify deletion date w/ `@deprecated` directive
Make switch-case stmts exhaustive and limit number of fn params
Sort CSS utility classes
No spread syntax on accumulators, barrel files, `delete` op, dynamic namespace import access, namespace imports, or duplicate polyfills from Polyfill.io
Use `preconnect` attr w/ Google Fonts
Declare regex literals at top level
Add `rel="noopener"` when using `target="_blank"`
No dangerous JSX props
No both `children` and `dangerouslySetInnerHTML` props
No global `eval()`
No callbacks in async tests and hooks, TS enums, exporting imported vars, type annotations for vars initialized w/ literals, magic numbers without named constants, or TS namespaces
No negating `if` conditions when there's an `else` clause, nested ternary exprs, non-null assertions (`!`), reassigning fn params, parameter props in class ctors, specified global var names, importing specified modules, or specified user-defined types
No constants where value is upper-case version of name, template literals without interpolation or special chars, `else` blocks when `if` block breaks early, yoda exprs, or `Array` ctors
Use `String.slice()` vs `String.substr()` and `String.substring()`
Use `as const` vs literal type annotations and `at()` vs integer index access
Follow curly brace conventions
Use `else if` vs nested `if` in `else` clauses and single `if` vs nested `if` clauses
Use `T[]` vs `Array<T>`
Use `new` for all builtins except `String`, `Number`, and `Boolean`
Use consistent accessibility modifiers on class props and methods
Declare object literals consistently
Use `const` for vars only assigned once
Put default and optional fn params last
Include `default` clause in switch stmts
Specify reason arg w/ `@deprecated` directive
Explicitly initialize each enum member value
Use `**` op vs `Math.pow`
Use `export type` and `import type` for types
Use kebab-case, ASCII filenames
Use `for...of` vs `for` loops w/ array index access
Use `<>...</>` vs `<Fragment>...</Fragment>`
Capitalize all enum values
Place getters and setters for same prop adjacent
Use literal values for all enum members
Use `node:assert/strict` vs `node:assert`
Use `node:` protocol for Node.js builtin modules
Use `Number` props vs global ones
Use numeric separators in numeric literals
Use object spread vs `Object.assign()` for new objects
Mark members `readonly` if never modified outside ctor
No extra closing tags for comps without children
Use assignment op shorthand
Use fn types vs object types w/ call signatures
Add description param to `Symbol()`
Use template literals vs string concatenation
Use `new` when throwing an error
No throwing non-`Error` values
Use `String.trimStart()`/`String.trimEnd()` vs `String.trimLeft()`/`String.trimRight()`
No overload signatures that can be unified
No lower specificity selectors after higher specificity selectors
No `@value` rule in CSS modules
No `alert`, `confirm`, and `prompt`
Use standard constants vs approximated literals
No assigning in exprs
No async fns as Promise executors
No `!` pattern in first position of `files.includes`
No bitwise ops
No reassigning exceptions in catch clauses
No reassigning class members
No inserting comments as text nodes
No comparing against `-0`
No labeled stmts that aren't loops
No `void` type outside generic or return types
No `console`
No TS const enums
No exprs where op doesn't affect value
No control chars in regex literals
No `debugger`
No assigning directly to `document.cookie`
Use `===` and `!==`
No duplicate `@import` rules, case labels, class members, custom props, conditions in if-else-if chains, GraphQL fields, font family names, object keys, fn param names, decl block props, keyframe selectors, or describe hooks
No empty CSS blocks, block stmts, static blocks, or interfaces
No letting vars evolve into `any` type through reassignments
No `any` type
No `export` or `module.exports` in test files
No misusing non-null assertion op (`!`)
No fallthrough in switch clauses
No focused or disabled tests
No reassigning fn decls
No assigning to native objects and read-only global vars
Use `Number.isFinite` and `Number.isNaN` vs global `isFinite` and `isNaN`
No implicit `any` type on var decls
No assigning to imported bindings
No `!important` within keyframe decls
No irregular whitespace chars
No labels that share name w/ var
No chars made w/ multiple code points in char classes
Use `new` and `constructor` properly
Place assertion fns inside `it()` fn calls
No shorthand assign when var appears on both sides
No octal escape sequences in strings
No `Object.prototype` builtins directly
No `quickfix.biome` in editor settings
No redeclaring vars, fns, classes, and types in same scope
No redundant `use strict`
No comparing where both sides are same
No shadowing restricted names
No shorthand props that override related longhand props
No sparse arrays
No template literal placeholder syntax in regular strings
No `then` prop
No `@ts-ignore` directive
No `let` or `var` vars that are read but never assigned
No unknown at-rules
No merging interface and class decls unsafely
No unsafe negation (`!`)
No unnecessary escapes in strings or useless backreferences in regex literals
No `var`
No `with` stmts
No separating overload signatures
Use `await` in async fns
Use correct syntax for ignoring folders in config
Put default clauses in switch stmts last
Pass message value when creating built-in errors
Return value from get methods
Use recommended display strategy w/ Google Fonts
Include `if` stmt in for-in loops
Use `Array.isArray()` vs `instanceof Array`
Return consistent values in iterable callbacks
Use `namespace` keyword vs `module` keyword
Use digits arg w/ `Number#toFixed()`
Use static `Response` methods vs `new Response()`
Use `use strict` directive in script files
No async client comps. Use server comps for async operations
Use Next.js `<Image>` comp vs `<img>` el
Use Next.js `next/head` or App Router metadata API vs `<head>` el
No importing `next/document` in page files
No importing `next/head` in `_document.tsx`. Use `<Head>` from `next/document` instead

## Recent Changes
- 019-edit-cart-items: Added TypeScript 5.9.3 (strict mode), Node.js ES2022 + Next.js 16.0.1 (App Router), React 19.2.0, tRPC 11.6.0, React Hook Form 7.64.0, Zod 4.1.12, TanStack Query 5.90.2
- 001-admin-quotes-dashboard: Added TypeScript 5.9.3 (strict mode), Node.js ES2022 + Next.js 16.0.1 (App Router), React 19.2.0, tRPC 11.6.0, Zod 4.1.12
- 001-admin-quotes-dashboard: Added TypeScript 5.9.3 (strict mode), Node.js ES2022 + Next.js 16.0.1 (App Router), React 19.2.0, tRPC 11.6.0, Zod 4.1.12
