# Research: Admin Quotes Dashboard

**Feature**: 001-admin-quotes-dashboard  
**Phase**: 0 (Research & Technical Discovery)  
**Date**: 2025-11-02

## Overview

This document consolidates research findings for refactoring the quotes dashboard to the admin module. Since this feature primarily involves UI/UX improvements and route migration using existing infrastructure, research focuses on ensuring consistency with established patterns rather than exploring new technologies.

---

## Research Topics

### 1. Admin Module Layout Pattern Consistency

**Question**: What is the established layout pattern for `/admin/*` routes that we must follow?

**Research Approach**: Analyzed existing admin routes (`/admin/models`, `/admin/settings`, `/admin/tenant`)

**Findings**:

From `/admin/models/page.tsx` (lines 1-50):
- **Pattern**: Server Component with `force-dynamic` export
- **Structure**:
  1. Header section with title + description
  2. Filters/Search component (Client Component)
  3. Suspense boundary wrapping data table
  4. Table/List component (Client Component)
  5. Pagination controls

**Code Example**:
```tsx
export const dynamic = 'force-dynamic'; // Admin routes are always fresh

export default async function AdminPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters = extractFilters(params);
  
  return (
    <div className="container mx-auto max-w-7xl py-8">
      {/* Header */}
      <div className="mb-8">
        <h1>Title</h1>
        <p className="text-muted-foreground">Description</p>
      </div>
      
      {/* Filters (Client Component) */}
      <FiltersComponent />
      
      {/* Data List (Suspense for loading states) */}
      <Suspense fallback={<Skeleton />}>
        <DataList filters={filters} />
      </Suspense>
      
      {/* Pagination */}
      <PaginationComponent />
    </div>
  );
}
```

**Decision**: Follow this exact pattern for `/admin/quotes` to maintain uniformity.

**Rationale**: 
- Consistency across admin module improves DX and UX
- Users familiar with one admin page will intuitively understand others
- Existing pattern is proven and well-documented

**Alternatives Considered**:
- Custom layout specific to quotes → Rejected (breaks uniformity)
- Table-based view vs Card-based → Card-based chosen (better mobile UX, consistent with current implementation)

---

### 2. Badge Component Patterns for Status Differentiation

**Question**: How should we implement status and role badges to ensure accessibility and visual consistency?

**Research Approach**: Examined existing Badge usage in codebase and Shadcn/ui documentation

**Findings**:

From existing codebase patterns:
- Shadcn Badge component supports variants: `default`, `secondary`, `destructive`, `outline`
- Custom variants can be added via Tailwind classes
- Color contrast must meet WCAG AA standards

**Quote Status Badge Mapping**:
| Status   | Spanish Label | Variant   | Color        | Icon  |
| -------- | ------------- | --------- | ------------ | ----- |
| draft    | Borrador      | secondary | Yellow/Amber | Clock |
| sent     | Enviada       | default   | Blue         | Send  |
| canceled | Cancelada     | outline   | Gray/Neutral | X     |

**Role Badge Mapping**:
| Role   | Spanish Label | Variant     | Color |
| ------ | ------------- | ----------- | ----- |
| admin  | Admin         | destructive | Red   |
| seller | Seller        | default     | Blue  |
| user   | (no badge)    | N/A         | N/A   |

**Code Pattern**:
```tsx
// quote-status-badge.tsx
const STATUS_CONFIG = {
  draft: { label: "Borrador", variant: "secondary", icon: Clock },
  sent: { label: "Enviada", variant: "default", icon: Send },
  canceled: { label: "Cancelada", variant: "outline", icon: X }
} as const;

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant={config.variant}>
      <config.icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
}
```

**Decision**: Use configuration object pattern with Shadcn Badge + Lucide icons

**Rationale**:
- Type-safe with TypeScript const assertions
- Easy to test (configuration is data)
- Accessible (semantic HTML + ARIA labels)
- Consistent with project's icon library (Lucide)

**Alternatives Considered**:
- Custom CSS badges → Rejected (reinventing wheel, accessibility concerns)
- Emoji indicators → Rejected (not professional, accessibility issues)
- Color-only differentiation → Rejected (fails accessibility for colorblind users)

---

### 3. Search Implementation: Multi-field vs Full-text

**Question**: How to implement search across project name AND user name efficiently?

**Research Approach**: Analyzed existing tRPC `quote.list-all` procedure and Prisma query capabilities

**Findings**:

From `/src/server/api/routers/quote/quote.ts` (line ~708):
```typescript
'list-all': sellerOrAdminProcedure
  .input(z.object({
    search: z.string().optional(), // Already supports search
    // ... other filters
  }))
  .query(async ({ ctx, input }) => {
    const where: Prisma.QuoteWhereInput = {
      ...(input.search && {
        OR: [
          { projectName: { contains: input.search, mode: 'insensitive' } },
          { contactPhone: { contains: input.search } },
        ]
      })
    };
    // ...
  })
```

**Current State**: Procedure searches `projectName` and `contactPhone`

**Required Enhancement**: Add `user.name` to OR array

**Proposed Change**:
```typescript
OR: [
  { projectName: { contains: input.search, mode: 'insensitive' } },
  { contactPhone: { contains: input.search } },
  { user: { name: { contains: input.search, mode: 'insensitive' } } } // NEW
]
```

**Database Considerations**:
- Existing indexes: `projectName` indexed (confirmed in schema)
- User relation: Already joined in `list-all` query
- Performance: No N+1 issues, single JOIN

**Decision**: Extend existing OR condition to include user.name

**Rationale**:
- Minimal code change (backward compatible)
- No database schema changes required
- Reuses existing index on projectName
- Case-insensitive search via Prisma `mode: 'insensitive'`

**Alternatives Considered**:
- Full-text search with PostgreSQL → Rejected (overkill for current scale)
- Separate user filter dropdown → Rejected (US8 requires unified search)
- Client-side filtering → Rejected (violates Server-First Performance principle)

---

### 4. Route Migration Strategy: /dashboard/quotes → /admin/quotes

**Question**: How to migrate existing route without breaking bookmarks or links?

**Research Approach**: Examined Next.js redirect patterns and project's middleware configuration

**Findings**:

Next.js supports multiple redirect approaches:
1. **Middleware redirect**: Global, runs on every request
2. **Page-level redirect**: In page component
3. **next.config.ts redirects**: Static, build-time

**Recommended Approach**: Page-level redirect for deprecated route

**Implementation**:
```tsx
// src/app/(dashboard)/quotes/page.tsx (DEPRECATED)
import { redirect } from 'next/navigation';

export default function DeprecatedQuotesPage() {
  redirect('/admin/quotes');
}
```

**Advantages**:
- ✅ Simplest implementation
- ✅ Preserves search params automatically
- ✅ Works with dynamic routes (`/quotes/[id]` → `/admin/quotes/[quoteId]`)
- ✅ No middleware changes (keeps middleware simple)
- ✅ Easy to remove later (just delete file)

**Migration Checklist**:
- [x] Create `/admin/quotes` with full functionality
- [ ] Add redirect in `/quotes/page.tsx`
- [ ] Add redirect in `/quotes/[id]/page.tsx` → `/admin/quotes/[quoteId]`
- [ ] Update navigation links to use new route
- [ ] Update documentation
- [ ] Add deprecation notice in CHANGELOG

**Decision**: Use page-level redirects for deprecated routes

**Rationale**: Cleanest separation, easy to maintain, preserves URL params

**Alternatives Considered**:
- Middleware redirect → Rejected (adds complexity to middleware)
- next.config.ts → Rejected (less flexible, harder to maintain)
- Duplicate code in both routes → Rejected (violates DRY principle)

---

### 5. Contact Information Display in Quote Detail

**Question**: Where and how should user email/phone be displayed in quote detail view?

**Research Approach**: Analyzed existing quote detail layout and similar features in admin panel

**Findings**:

Current quote detail structure (from spec assumptions):
- Quote header (project name, status, dates)
- Items table
- Services breakdown
- Totals
- Project information

**Recommended Placement**: Between quote header and items table

**Component Design**:
```tsx
// user-contact-info.tsx
type Props = {
  user: {
    name: string | null;
    email: string;
    phone: string | null;
    role: 'admin' | 'seller' | 'user';
  } | null;
};

export function UserContactInfo({ user }: Props) {
  if (!user) return null; // Handle deleted users
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Creador</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div>
            <span className="text-sm text-muted-foreground">Nombre:</span>
            <span className="ml-2">{user.name || 'Usuario desconocido'}</span>
            {(user.role === 'admin' || user.role === 'seller') && (
              <QuoteRoleBadge role={user.role} className="ml-2" />
            )}
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Email:</span>
            <a href={`mailto:${user.email}`} className="ml-2 underline">
              {user.email}
            </a>
          </div>
          {user.phone && (
            <div>
              <span className="text-sm text-muted-foreground">Teléfono:</span>
              <span className="ml-2">{user.phone}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

**Decision**: Card component below header, above items table, with conditional phone display

**Rationale**:
- Prominent position (admin sees contact immediately)
- Semantic HTML (mailto: link for email)
- Handles edge cases (deleted user, missing phone)
- Consistent with other card-based layouts

**Alternatives Considered**:
- Sidebar placement → Rejected (mobile UX poor, layout inconsistent)
- Footer placement → Rejected (low visibility, user scrolls to find)
- Inline in header → Rejected (clutters header, poor visual hierarchy)

---

## Technology Stack Summary

**No new technologies required**. Feature uses existing stack:

| Layer         | Technology   | Version | Usage                         |
| ------------- | ------------ | ------- | ----------------------------- |
| Framework     | Next.js      | 16.0.1  | App Router, Server Components |
| Language      | TypeScript   | 5.9.3   | Strict mode                   |
| UI            | React        | 19.2.0  | Client Components             |
| Data Fetching | tRPC         | 11.6.0  | Type-safe API calls           |
| Validation    | Zod          | 4.1.12  | Schema validation             |
| UI Components | Shadcn/ui    | Latest  | Badge, Card, Table            |
| Icons         | Lucide React | Latest  | Status icons                  |
| Styling       | TailwindCSS  | 4.1.14  | Utility-first CSS             |

---

## Performance Considerations

### Server-Side Rendering
- All admin routes use `dynamic = 'force-dynamic'`
- No ISR/caching (admins need fresh data)
- Mutations use `invalidate()` + `router.refresh()` pattern

### Database Queries
- Existing indexes sufficient:
  - `quotes.projectName` (indexed)
  - `quotes.status` (indexed)
  - `quotes.userId` (indexed)
- No N+1 queries (user joined in single query)

### Pagination
- Server-side pagination (10-20 items per page)
- Total count query optimized (COUNT without JOIN)

### Search Performance
- Case-insensitive search via Prisma (no regex overhead)
- Limited to 3 fields (projectName, user.name, contactPhone)
- No full-text search needed at current scale

---

## Security Considerations

### Authorization
- Middleware: `/admin/*` routes require `role: 'admin'`
- tRPC: `sellerOrAdminProcedure` for data access
- Server Components: Session check before rendering

### Data Validation
- All search params validated with Zod
- Existing tRPC input schemas used
- No user-provided SQL (Prisma prevents injection)

### Sensitive Data
- Email/phone only shown to admins (authorized users)
- No password or payment info displayed
- Winston logs exclude PII

---

## Accessibility Requirements

### WCAG AA Compliance
- Badge color contrast ratios verified
- Icon + text labels (not color-only)
- Keyboard navigation supported
- Screen reader friendly (semantic HTML)

### Specific Considerations
- Status badges: Icon + text (not color-only)
- Role badges: Clear labels in Spanish
- Links: Underlined + color (email mailto:)
- Focus indicators: Default browser styles preserved

---

## Conclusion

All research questions resolved with concrete decisions. No new technologies required. Implementation can proceed to Phase 1 (Design & Contracts).

**Key Decisions Summary**:
1. ✅ Follow `/admin/models` layout pattern exactly
2. ✅ Configuration-based badge components with icons
3. ✅ Extend existing tRPC search to include user.name
4. ✅ Page-level redirects for route migration
5. ✅ Card component for user contact info below header

**Next Phase**: Phase 1 - Data Model & API Contracts
