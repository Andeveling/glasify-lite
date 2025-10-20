# Quickstart Guide: Profile Suppliers Refactoring

**Feature**: 012-simplify-profile-suppliers  
**Phase**: 1 (Design & Contracts)  
**Date**: 2025-01-20

## Overview

This guide helps developers set up, develop, test, and deploy the Profile Suppliers SOLID refactoring. Follow these steps in order for a smooth development experience.

---

## Prerequisites

Before starting, ensure you have:

- **Node.js**: v20.x or higher
- **pnpm**: v8.x or higher
- **PostgreSQL**: v14 or higher (running locally or via Docker)
- **Git**: Latest version
- **VS Code**: Recommended (with ESLint, Biome, Prettier extensions)

**Check versions**:
```bash
node --version   # Should be v20.x+
pnpm --version   # Should be v8.x+
psql --version   # Should be v14.x+
```

---

## 1. Initial Setup

### Clone and Switch Branch

```bash
# Navigate to project directory
cd ~/Proyectos/glasify-lite

# Ensure you're on the feature branch
git checkout 012-simplify-profile-suppliers

# Pull latest changes
git pull origin 012-simplify-profile-suppliers

# Verify branch
git branch --show-current  # Should show: 012-simplify-profile-suppliers
```

### Install Dependencies

```bash
# Install all dependencies (including devDependencies)
pnpm install

# Verify installation
pnpm list --depth=0
```

**Expected output**: All dependencies installed without errors.

### Setup Database

```bash
# Start PostgreSQL (if using Docker)
pnpm run start:db  # Or: docker compose up -d postgres

# Generate Prisma Client
pnpm db:generate

# Run migrations (if any)
pnpm db:push

# Seed development data (optional but recommended)
pnpm db:seed
```

**Verify database**:
```bash
# Open Prisma Studio
pnpm db:studio

# Navigate to ProfileSupplier table
# Should see sample data (Rehau, Deceuninck, etc.)
```

### Environment Variables

```bash
# Copy example env file (if not exists)
cp .env.example .env

# Verify database connection
cat .env | grep DATABASE_URL
```

**Expected**: `DATABASE_URL="postgresql://user:pass@localhost:5432/glasify_lite_dev"`

---

## 2. Development Workflow

### Start Development Server

```bash
# Start Next.js dev server with Turbo
pnpm dev

# Expected output:
# ▲ Next.js 15.2.3
# - Local:        http://localhost:3000
# - Environments: .env
```

**Open in browser**: http://localhost:3000

### Navigate to Profile Suppliers

1. Log in as admin user:
   - Email: `admin@glasify.com` (or your admin email)
   - Password: (your admin password)

2. Navigate to: http://localhost:3000/admin/profile-suppliers

3. Expected view:
   - List of profile suppliers
   - "New Supplier" button (will open dialog after refactoring)
   - Edit/Delete actions for each supplier

### Project Structure

```
src/app/(dashboard)/admin/profile-suppliers/
├── page.tsx                                 # Server Component (SSR)
├── _hooks/                                  # NEW: Custom hooks (to be created)
│   ├── use-profile-supplier-form.ts        # Form state management
│   └── use-profile-supplier-mutations.ts   # API mutations
└── _components/
    ├── profile-supplier-dialog.tsx         # NEW: Dialog modal (to be created)
    ├── profile-supplier-list.tsx           # MODIFY: Update to use dialog
    ├── profile-supplier-form.tsx           # REMOVE: Old monolithic form
    └── README.md                           # NEW: Architecture docs
```

### Development Best Practices

**Code Style**:
```bash
# Format and lint (auto-fix)
pnpm lint:fix

# Check types
pnpm typecheck

# Run before committing
pnpm lint && pnpm typecheck
```

**Git Workflow**:
```bash
# Create feature branch from current branch
git checkout -b feature/profile-supplier-dialog

# Make changes, then commit
git add .
git commit -m "feat(admin): create profile-supplier-dialog component"

# Push to remote
git push origin feature/profile-supplier-dialog
```

**Commit Message Format** (Conventional Commits):
- `feat(admin): add dialog modal for profile suppliers`
- `refactor(admin): extract form logic to custom hook`
- `test(admin): add unit tests for use-profile-supplier-form`
- `docs(admin): add architecture README for profile suppliers`

---

## 3. Implementation Steps

### Step 1: Create Form Hook

**File**: `src/app/(dashboard)/admin/profile-suppliers/_hooks/use-profile-supplier-form.ts`

**Reference**: `src/app/(dashboard)/admin/services/_hooks/use-service-form.ts`

**Tasks**:
1. Copy Services form hook as starting point
2. Adapt for ProfileSupplier schema (4 fields: name, materialType, notes, isActive)
3. Remove auto-assignment logic (not needed for profile suppliers)
4. Test hook independently

**Verify**:
```bash
# Check file exists and compiles
pnpm typecheck
```

### Step 2: Create Mutations Hook

**File**: `src/app/(dashboard)/admin/profile-suppliers/_hooks/use-profile-supplier-mutations.ts`

**Reference**: `src/app/(dashboard)/admin/services/_hooks/use-service-mutations.ts`

**Tasks**:
1. Copy Services mutations hook as starting point
2. Update tRPC procedure calls to `api.admin['profile-supplier'].*`
3. Add SSR cache invalidation: `invalidate()` + `router.refresh()`
4. Spanish error messages

**Verify**:
```bash
pnpm typecheck
pnpm lint:fix
```

### Step 3: Create Dialog Component

**File**: `src/app/(dashboard)/admin/profile-suppliers/_components/profile-supplier-dialog.tsx`

**Reference**: `src/app/(dashboard)/admin/services/_components/service-dialog.tsx`

**Tasks**:
1. Copy Services dialog as starting point
2. Update form fields (4 fields: name, materialType, notes, isActive)
3. Integrate form hook and mutations hook
4. Spanish labels and descriptions
5. Test in browser

**Test in browser**:
```bash
# Dev server should auto-reload
# Navigate to http://localhost:3000/admin/profile-suppliers
# Click "New Supplier" (after updating list component)
```

### Step 4: Update List Component

**File**: `src/app/(dashboard)/admin/profile-suppliers/_components/profile-supplier-list.tsx`

**Tasks**:
1. Add dialog state management (open, mode, selectedSupplier)
2. Replace "Edit" link with button that opens dialog
3. Update "New Supplier" to open dialog instead of navigating
4. Add delete confirmation dialog integration

**Verify**:
```bash
# Test all CRUD operations in browser:
# 1. Create new supplier via dialog
# 2. Edit existing supplier via dialog
# 3. Delete supplier with confirmation
```

### Step 5: Create Architecture Documentation

**File**: `src/app/(dashboard)/admin/profile-suppliers/_components/README.md`

**Reference**: `src/app/(dashboard)/admin/services/_components/README.md`

**Tasks**:
1. Document SOLID principles application
2. Explain hook responsibilities
3. Show component composition pattern
4. Migration notes from old pattern

### Step 6: Remove Old Implementation

**After dialog is working correctly**:

```bash
# Remove separate page directories
rm -rf src/app/(dashboard)/admin/profile-suppliers/new
rm -rf src/app/(dashboard)/admin/profile-suppliers/[id]

# Remove old monolithic form component
rm src/app/(dashboard)/admin/profile-suppliers/_components/profile-supplier-form.tsx

# Commit removal
git add .
git commit -m "refactor(admin): remove separate pages for profile suppliers"
```

---

## 4. Testing

### Unit Tests

**Create test files**:
```bash
mkdir -p tests/unit/hooks

# Form hook tests
touch tests/unit/hooks/use-profile-supplier-form.test.ts

# Mutations hook tests
touch tests/unit/hooks/use-profile-supplier-mutations.test.ts
```

**Run unit tests**:
```bash
# Run all unit tests
pnpm test

# Run specific test file
pnpm test use-profile-supplier-form

# Run with coverage
pnpm test:coverage
```

**Expected coverage**:
- Form hook: >80% coverage (form initialization, reset logic)
- Mutations hook: >80% coverage (mutation calls, error handling)

### E2E Tests

**Update E2E tests**:
```bash
# Edit E2E test file
code e2e/admin/profile-suppliers.spec.ts
```

**Test scenarios**:
1. Admin can create supplier via dialog modal
2. Admin can edit supplier via dialog modal
3. Admin can delete supplier with confirmation
4. Form validation errors display correctly
5. Success/error toasts appear

**Run E2E tests**:
```bash
# Run all E2E tests
pnpm test:e2e

# Run specific test file
pnpm test:e2e e2e/admin/profile-suppliers.spec.ts

# Run with UI (for debugging)
pnpm test:e2e:ui
```

**Expected result**: All tests pass ✅

### Manual QA Checklist

- [ ] Create new supplier via dialog modal (name, materialType, notes, isActive)
- [ ] Edit existing supplier via dialog modal
- [ ] Delete supplier with confirmation dialog
- [ ] Cancel operations (close dialog without saving)
- [ ] Form validation errors display correctly
- [ ] Success toasts appear after create/update/delete
- [ ] Error toasts appear on failure
- [ ] List updates immediately after mutations (no page reload)
- [ ] Dialog closes after successful operation
- [ ] Form resets when opening in create mode
- [ ] Form pre-populates when opening in edit mode

---

## 5. Code Quality

### Linting and Formatting

```bash
# Auto-fix all issues
pnpm lint:fix

# Check for remaining issues
pnpm lint

# Type checking
pnpm typecheck
```

**Expected**: Zero errors, zero warnings.

### Pre-commit Checks

Lefthook runs automatically on `git commit`:

1. **Lint-staged**: Formats changed files
2. **Type check**: Validates TypeScript
3. **Unit tests**: Runs affected tests
4. **ESLint**: Checks for code issues

**Manual pre-commit run**:
```bash
lefthook run pre-commit
```

### Code Review Checklist

- [ ] All TypeScript strict mode rules pass
- [ ] No `any` types (use specific types)
- [ ] Spanish UI text, English code/comments
- [ ] Conventional commit messages
- [ ] No console.log (use Winston server-side or remove)
- [ ] Components <200 lines, hooks <100 lines
- [ ] SOLID principles followed (SRP, OCP)
- [ ] SSR cache invalidation pattern used (invalidate + router.refresh)
- [ ] All tests passing (unit + E2E)
- [ ] No accessibility warnings

---

## 6. Common Issues & Solutions

### Issue: "Procedure not found"

**Symptom**: tRPC error "Procedure not found: admin.profile-supplier.create"

**Solution**:
```bash
# Restart dev server
pnpm dev

# Clear Next.js cache
rm -rf .next
pnpm dev
```

### Issue: "Winston is not defined" in browser

**Symptom**: Browser error referencing Winston logger

**Solution**: Remove Winston from client components. Use `toast` for user feedback.

```typescript
// ❌ WRONG (Client Component)
import { logger } from '@/lib/logger';
logger.info('Something happened');

// ✅ CORRECT (Client Component)
import { toast } from 'sonner';
toast.success('Something happened');
```

### Issue: UI doesn't update after mutation

**Symptom**: Create/update/delete succeeds but list doesn't refresh

**Solution**: Add `router.refresh()` after cache invalidation:

```typescript
onSettled: () => {
  void utils.admin['profile-supplier'].list.invalidate();  // Step 1
  router.refresh();                                          // Step 2 (REQUIRED)
}
```

### Issue: Form validation not working

**Symptom**: Form submits without validating required fields

**Solution**: Ensure Zod resolver is configured:

```typescript
const form = useForm({
  resolver: zodResolver(createProfileSupplierSchema),  // Required
  defaultValues: { ... },
});
```

### Issue: Database connection error

**Symptom**: "Can't reach database server"

**Solution**:
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Or restart database
pnpm run start:db

# Verify DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

---

## 7. Deployment

### Pre-deployment Checklist

- [ ] All tests passing (unit + E2E)
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Code reviewed and approved
- [ ] Changelog updated
- [ ] Documentation complete

### Build for Production

```bash
# Clean build
rm -rf .next

# Production build
pnpm build

# Expected output: "Compiled successfully"
```

### Run Production Build Locally

```bash
# Start production server
pnpm start

# Test at http://localhost:3000
```

### Deploy to Vercel

```bash
# Push to GitHub
git push origin 012-simplify-profile-suppliers

# Create pull request
# Vercel will auto-deploy preview

# After PR merge, main branch auto-deploys to production
```

---

## 8. Useful Commands Reference

### Development
```bash
pnpm dev              # Start dev server
pnpm dev:turbo        # Start dev server with Turbo (faster)
pnpm db:studio        # Open Prisma Studio
pnpm db:seed          # Seed development data
```

### Testing
```bash
pnpm test             # Run unit tests
pnpm test:coverage    # Run with coverage report
pnpm test:e2e         # Run E2E tests
pnpm test:e2e:ui      # Run E2E with Playwright UI
```

### Code Quality
```bash
pnpm lint             # Check for issues
pnpm lint:fix         # Auto-fix issues
pnpm typecheck        # Check TypeScript types
pnpm format           # Format code with Biome
```

### Database
```bash
pnpm db:generate      # Generate Prisma Client
pnpm db:push          # Push schema changes
pnpm db:migrate       # Run migrations
pnpm db:reset         # Reset database
```

### Git
```bash
git status            # Check changed files
git add .             # Stage all changes
git commit -m "msg"   # Commit with message
git push              # Push to remote
```

---

## 9. Resources

### Documentation
- **Next.js 15**: https://nextjs.org/docs
- **tRPC**: https://trpc.io/docs
- **Prisma**: https://www.prisma.io/docs
- **React Hook Form**: https://react-hook-form.com/
- **Zod**: https://zod.dev/
- **shadcn/ui**: https://ui.shadcn.com/

### Internal Documentation
- **Constitution**: `.specify/memory/constitution.md`
- **Copilot Instructions**: `.github/copilot-instructions.md`
- **SSR Cache Pattern**: `.github/copilot-instructions.md` (search "SSR Cache Invalidation")
- **Services Reference**: `src/app/(dashboard)/admin/services/_components/README.md`

### Getting Help
- **Team Chat**: Ask in #development channel
- **Code Review**: Tag maintainers in PR
- **Bug Reports**: Create GitHub issue with `bug` label

---

## Summary

**Setup Time**: ~15 minutes  
**Development Time**: ~3-4 hours  
**Testing Time**: ~1-2 hours  
**Total Time**: ~5-7 hours

**Key Success Factors**:
1. Follow Services module pattern exactly
2. Use SSR cache invalidation pattern (invalidate + router.refresh)
3. Test thoroughly before removing old code
4. Keep commits small and focused
5. Ask for help when stuck

**Ready to start?** Begin with Step 1: Create Form Hook! 🚀
