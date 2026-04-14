# Concerns — Technical Debt, Issues & Risks

## Critical Issues

### 1. compatibleGlassTypeIds JSON String vs Array
**Severity:** High (Architectural Debt)

**Problem:** The `Model.compatibleGlassTypeIds` field is stored as a JSON string in SQLite due to SQLite limitations, but 30+ files in the codebase assume it's a `String[]` (array).

**Location:** `prisma/schema.prisma:227`

**Current behavior:**
```typescript
// Schema defines as String
model Model {
  compatibleGlassTypeIds String  // JSON string
}

// Code treats as array (WRONG)
const glassIds = model.compatibleGlassTypeIds  // string, not array!
```

**Correct usage:**
```typescript
// Reading
const glassIds = JSON.parse(model.compatibleGlassTypeIds)  // Now it's an array

// Writing
model.compatibleGlassTypeIds = JSON.stringify(arrayOfIds)
```

**Impact:**
- Silent failures when filtering compatible glass types
- Potential runtime errors
- Data inconsistency in filters and queries

**Resolution:** See `openspec/changes/migrate-sqlite-compatible-glass-array/proposal.md`

### 2. better-sqlite3 Won't Compile on Node 25
**Severity:** Medium (Environment Constraint)

**Problem:** The `better-sqlite3` native module fails to compile on Node.js version 25.

**Workaround:** The project uses `@libsql/client` + `@prisma/adapter-libsql` instead, which is already implemented.

**Verification:** Check Node version with `node -v`. If 25+, use libsql adapter.

### 3. Schema-Seeders Drift
**Severity:** Medium (Data Integrity)

**Problem:** The `TenantConfig` schema may not match what seeders expect. Fields added to schema after seed creation may cause seed failures.

**Location:** `prisma/schema.prisma`, `prisma/seeders/`

**Fix:** Before running seeds, verify schema fields match seeder expectations. Check `prisma/seed-cli.ts` for field compatibility.

## Known Architectural Issues

### Prisma Client Import Path Confusion
**Severity:** High (Runtime Error Risk)

**Problem:** Developers frequently import PrismaClient from `@prisma/client` which is wrong.

**Correct import:**
```typescript
// WRONG - will fail at runtime
import { PrismaClient } from "@prisma/client"

// CORRECT - from generated location
import { PrismaClient } from "./generated/client"
```

**AGENTS.md notes:** This is explicitly documented but still a risk.

### @map() Annotations on Account/Session
**Severity:** Low (Legacy)

**Problem:** Account and Session models use `@map()` for legacy NextAuth compatibility. These shouldn't be removed but add complexity.

**Location:** `prisma/schema.prisma:11-27, 29-39`

## Performance Concerns

### N+1 Query Patterns
**Severity:** Medium (Performance)

**Risk:** Some queries may have N+1 patterns when fetching related data.

**Example:**
```typescript
// Potential N+1
const quotes = await ctx.db.quote.findMany()
for (const quote of quotes) {
  quote.items = await ctx.db.quoteItem.findMany({ where: { quoteId: quote.id } })
}
```

**Fix:** Use `include` to eager load:
```typescript
const quotes = await ctx.db.quote.findMany({
  include: { items: true, client: true },
})
```

### Missing Indexes
**Severity:** Low (Performance)

**Check:** Review query patterns against `@@index` declarations in schema.

**Current indexes:** Good coverage on foreign keys and commonly filtered fields.

## Security Considerations

### Authentication
**Severity:** Medium

**Notes:**
- better-auth is used for authentication
- Session stored in database
- Refresh token rotation enabled

**Recommendations:**
- Regularly audit session cleanup
- Monitor failed login attempts
- Keep better-auth updated

### File Upload
**Severity:** Low

**Notes:**
- File uploads processed via service
- No known path traversal vulnerabilities
- Logo uploads stored locally

### SQL Injection
**Severity:** Low

**Notes:**
- Prisma provides parameterized query protection
- No raw SQL concatenation in tRPC routers
- Zod validation on all inputs

## Data Integrity

### Decimal Handling
**Severity:** Medium (Financial Accuracy)

**Problem:** Using floating point for currency calculations can lead to rounding errors.

**Solution:** Project uses `Decimal` type from Prisma and `decimal.js` library for calculations.

**Best practices:**
- Never use `Number` for money
- Always use `Decimal` type
- Round only at display time

### Quote Total Calculations
**Severity:** Medium

**Notes:** Quote totals calculated via services with multiple adjustments.

**Review:** `src/server/api/routers/quote/quote.service.ts`

## Code Quality Issues

### Missing Error Boundaries
**Severity:** Low

**Risk:** Unhandled errors in React components can crash the app.

**Recommendation:** Add error boundaries for critical UI sections.

### Type Coverage
**Severity:** Low

**Note:** The codebase uses TypeScript with reasonable type coverage, but some `any` types may exist in edge cases.

## Testing Gaps

### Coverage
**Severity:** Medium

**Notes:**
- Unit tests for core utilities
- E2E tests for auth flows
- Some areas lack test coverage

**Recommended:**
- Add tests for price calculation services
- Add tests for quote creation flow
- Increase coverage on edge cases

## Dependencies

### Outdated Patterns
**Severity:** Low

**Note:** Some packages use older patterns but are functional.

### Breaking Changes
**Severity:** Medium (Maintenance)

**Notes:**
- Zod 4 has breaking changes from v3
- React 19 has new patterns
- Next.js 16 is recent

**Recommendation:** Keep changelog updated when upgrading.

## Multi-Tenancy

### Incomplete Implementation
**Severity:** Low

**Problem:** `tenantConfigId` field exists in some models but multi-tenancy isolation is not actively implemented. Single-tenant mode with hardcoded `"1"`.

**Current:** All queries use TenantConfig ID `"1"`.

**Future:** If multi-tenancy needed, implement row-level security.

## Migration Risks

### Schema Changes
**Severity:** Medium

**Risk:** Adding fields to schema without updating seeds causes failures.

**Prevention:** Verify seed compatibility before running migrations.

### Data Loss
**Severity:** Low

**Note:** SQLite file-based, easy to backup. No auto-migration for data changes.

## Future Considerations

### Potential Refactors
1. Extract domain layer if business logic grows
2. Add message queue for async operations
3. Implement caching layer (Redis) if needed
4. GraphQL if API complexity increases

### Tech Debt Priority
1. **High:** Fix compatibleGlassTypeIds mismatch
2. **Medium:** Improve test coverage
3. **Medium:** Add error boundaries
4. **Low:** Documentation improvements