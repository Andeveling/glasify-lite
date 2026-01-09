# Prerendering Build Failures - Root Cause & Prevention

**Date**: 2025-01-22  
**Issue**: Vercel builds failing with "Can't reach database server" during static prerendering  
**Status**: ✅ Fixed + Preventive measures implemented

---

## Root Cause Analysis

### Primary Issue
Next.js 16 attempted to prerender pages at build time that contained components making database queries, but `DATABASE_URL` was not available in the build environment.

### Technical Chain of Events

1. **PublicLayout Structure**:
   ```
   PublicLayout
   └── PublicFooter
       └── SocialMediaLinks (Server Component)
           └── await db.tenantConfig.findUnique() ← DATABASE QUERY
   ```

2. **Build Process**:
   - Next.js detects `page.tsx` without `export const dynamic = "force-dynamic"`
   - Attempts static prerendering at build time
   - Executes all Server Components in the page tree
   - `SocialMediaLinks` tries to connect to database
   - `DATABASE_URL` not available → **Build fails**

3. **Error Message**:
   ```
   PrismaClientInitializationError: Can't reach database server at 
   db.fedbbwcyuzyqhnhiawqv.supabase.co:6543
   ```

### Contributing Factors

1. **Missing Environment Variables**:
   - `DATABASE_URL` not configured in Vercel project
   - `NEXT_PUBLIC_TENANT_*` variables missing
   - These are required by `src/env.js` validation

2. **Previous Migration Removed Safeguards**:
   - Cache Components migration removed `export const dynamic = 'force-dynamic'`
   - Comments show: "MIGRATED: Removed export const dynamic (incompatible with Cache Components)"
   - This removed protection against prerendering failures

3. **Insufficient Suspense Boundaries**:
   - Wrapping `PublicFooter` in `<Suspense>` prevents blocking
   - But doesn't prevent prerendering attempts
   - Database queries still execute during build

---

## Solution Implemented

### 1. Force Dynamic Rendering

Added `export const dynamic = "force-dynamic"` to all public pages:

```typescript
/**
 * CRITICAL: Dynamic rendering required to prevent build failures
 *
 * This page uses PublicLayout which contains:
 * - PublicFooter > SocialMediaLinks (queries db.tenantConfig.findUnique())
 *
 * If this page attempts static prerendering, the build fails with:
 * "Can't reach database server" because DATABASE_URL may not be available
 * during build time in CI/CD environments (Vercel, GitHub Actions).
 *
 * DO NOT REMOVE unless:
 * 1. PublicLayout no longer contains database queries
 * 2. All DB queries are moved to client components
 * 3. Build process guarantees DATABASE_URL availability
 */
export const dynamic = "force-dynamic";
```

**Pages Protected**:
- ✅ `/cart`
- ✅ `/catalog`
- ✅ `/catalog/[modelId]`
- ✅ `/glasses/solutions`
- ✅ `/glasses/solutions/[slug]`
- ✅ `/my-quotes`
- ✅ `/my-quotes/[quoteId]`

### 2. Suspense Boundaries

Wrapped `PublicFooter` in `<Suspense>` to prevent blocking:

```typescript
<Suspense fallback={<div className="h-64" />}>
  <PublicFooter />
</Suspense>
```

This prevents layout shift but **does not prevent prerendering** - both safeguards are required.

### 3. Environment Variables Documentation

Created `VERCEL_ENV_SETUP.md` with complete setup guide:
- All required variables listed
- Security warnings for sensitive data
- Instructions for Vercel Dashboard, CLI, and import methods

---

## Prevention Checklist

### Before Merging to Main

- [ ] **All public pages have `dynamic = "force-dynamic"`**
  - Run: `grep -r "export const dynamic" src/app/(public)/**/page.tsx`
  - Verify all pages have explicit declaration

- [ ] **Environment variables configured in Vercel**
  - Check: `VERCEL_ENV_SETUP.md` for complete list
  - Verify: All `NEXT_PUBLIC_TENANT_*` variables set
  - Verify: `DATABASE_URL` configured

- [ ] **Local build succeeds**
  - Run: `pnpm build`
  - Check: No prerendering errors

- [ ] **Database queries wrapped in error boundaries**
  - Server Components with DB queries in `<Suspense>`
  - Fallback UI for loading states

### Code Review Guidelines

❌ **NEVER REMOVE** `export const dynamic = "force-dynamic"` from public pages unless:
1. PublicLayout no longer queries database
2. All DB queries moved to client components
3. Build environment guarantees DATABASE_URL availability

✅ **ALWAYS ADD** when creating new public pages:
1. Add `export const dynamic = "force-dynamic"`
2. Document why (reference this file)
3. Test local build before pushing

---

## Testing Strategy

### Local Testing
```bash
# 1. Build without DATABASE_URL to simulate CI/CD
unset DATABASE_URL
pnpm build

# 2. Should succeed with force-dynamic
# 3. Should show warnings for missing env vars but not fail build
```

### Vercel Deployment Testing
```bash
# 1. Check environment variables
vercel env pull

# 2. Verify all required vars present
grep "NEXT_PUBLIC_TENANT" .env.local
grep "DATABASE_URL" .env.local

# 3. Deploy to preview
vercel deploy

# 4. Monitor build logs
vercel logs <deployment-url>
```

---

## Lessons Learned

### What Went Wrong

1. **Migration blindly removed safeguards**
   - Cache Components migration removed `dynamic = "force-dynamic"`
   - No verification that pages could handle prerendering
   - No documentation of consequences

2. **Environment variables not verified**
   - Pushed to main without checking Vercel configuration
   - Assumed local `.env` would translate to production
   - No checklist for deployment requirements

3. **Insufficient testing before merge**
   - Did not test build without DATABASE_URL
   - Did not verify Vercel environment matches local
   - No preview deployment review

### What We'll Do Differently

1. **Never Remove Safeguards Without Testing**
   - Test builds in isolated environment (no DATABASE_URL)
   - Verify all affected pages render correctly
   - Document why safeguard was needed originally

2. **Environment Variable Checklist**
   - Review `VERCEL_ENV_SETUP.md` before every deployment
   - Verify Vercel Dashboard shows all required vars
   - Test preview deployment before merging to main

3. **Automated Checks**
   - Consider GitHub Action to verify `dynamic = "force-dynamic"` on public pages
   - Pre-commit hook to check environment variable requirements
   - Build test without DATABASE_URL in CI pipeline

---

## Future Improvements

### Short Term
- [ ] Add pre-commit hook checking for `dynamic` export in public pages
- [ ] Create GitHub Action validating environment variables
- [ ] Document deployment checklist in `CONTRIBUTING.md`

### Long Term
- [ ] Refactor `SocialMediaLinks` to client component with tRPC
- [ ] Move all DB queries out of layout components
- [ ] Implement proper error boundaries for all DB queries
- [ ] Consider build-time data fetching with fallback values

---

## References

- **Environment Setup**: `VERCEL_ENV_SETUP.md`
- **Vercel Deployment**: Latest deployment `dpl_CocmT1Dv5FhTEQranxy3LdyeGm2K`
- **Supabase Connection**: `db.fedbbwcyuzyqhnhiawqv.supabase.co` (port 6543 pooled, 5432 direct)
- **Next.js Docs**: [Route Segment Config - dynamic](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic)
- **Copilot Instructions**: `.github/copilot-instructions.md` - SSR patterns

---

## Quick Fix Command

If you encounter this error again:

```bash
# 1. Add to affected page.tsx
cat << 'EOF' >> src/app/(public)/[route]/page.tsx
/**
 * CRITICAL: Dynamic rendering required to prevent build failures
 * See: docs/fixes/prerendering-build-failures.md
 */
export const dynamic = "force-dynamic";
EOF

# 2. Verify environment variables in Vercel
vercel env ls

# 3. Test build locally without DATABASE_URL
unset DATABASE_URL && pnpm build

# 4. If succeeds, push and deploy
git add . && git commit -m "fix: prevent prerendering on [route] page"
git push origin main
```
