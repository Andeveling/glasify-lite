# RBAC E2E Tests

End-to-End tests for Role-Based Access Control (RBAC) implementation using Playwright.

## Test Files

### 1. `admin-dashboard.spec.ts`
Tests admin user flow:
- Login and redirect to dashboard
- Access to admin-only routes
- Admin-only UI elements
- Blocked access for non-admin users

**16 test cases** covering admin access, non-admin restrictions, and unauthenticated access.

### 2. `seller-quotes.spec.ts`
Tests seller user flow:
- Login and redirect to my-quotes
- Quote management (create, view, edit)
- Data filtering (only own quotes)
- Blocked access to admin routes

**18 test cases** covering seller access, restrictions, data isolation, and quote management.

### 3. `client-access.spec.ts`
Tests client (regular user) flow:
- Public catalog access (no login)
- Login and redirect to my-quotes
- Quote management (own quotes only)
- Blocked access to admin routes
- Session persistence

**24 test cases** covering public access, authenticated access, restrictions, data isolation, and session management.

## Running Tests

```bash
# Run all RBAC E2E tests
pnpm playwright test e2e/rbac

# Run specific test file
pnpm playwright test e2e/rbac/admin-dashboard.spec.ts

# Run in UI mode
pnpm playwright test e2e/rbac --ui

# Run with headed browser
pnpm playwright test e2e/rbac --headed
```

## Prerequisites

### Test Database
Ensure test database is seeded with users:

```bash
pnpm db:seed:test
```

### Environment Variables
Create `.env.test` with test credentials:

```bash
TEST_ADMIN_EMAIL=admin@glasify.test
TEST_ADMIN_PASSWORD=Admin123!

TEST_SELLER_EMAIL=seller@glasify.test
TEST_SELLER_PASSWORD=Seller123!

TEST_CLIENT_EMAIL=client@glasify.test
TEST_CLIENT_PASSWORD=Client123!
```

### Development Server
Start development server:

```bash
pnpm dev
```

## Test Patterns

### Login Flow
```typescript
await page.goto('/signin');
await page.getByLabel(/email/i).fill(USER.email);
await page.getByLabel(/contraseña/i).fill(USER.password);
await page.getByRole('button', { name: /iniciar sesión/i }).click();
await page.waitForURL(/\/my-quotes/);
```

### Route Access Validation
```typescript
await page.goto('/dashboard');
await page.waitForURL(/\/my-quotes/); // Should redirect
expect(page.url()).not.toContain('/dashboard');
```

### UI Element Visibility
```typescript
await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
await expect(page.getByRole('button', { name: /crear/i })).not.toBeVisible();
```

## Coverage Matrix

| Feature             | Admin | Seller | Client | Guest |
| ------------------- | ----- | ------ | ------ | ----- |
| `/dashboard`        | ✅     | ❌      | ❌      | ❌     |
| `/dashboard/models` | ✅     | ❌      | ❌      | ❌     |
| `/dashboard/quotes` | ✅     | ❌      | ❌      | ❌     |
| `/my-quotes`        | ✅     | ✅      | ✅      | ❌     |
| `/catalog`          | ✅     | ✅      | ✅      | ✅     |
| View all quotes     | ✅     | ❌      | ❌      | ❌     |
| View own quotes     | ✅     | ✅      | ✅      | ❌     |
| Create model        | ✅     | ❌      | ❌      | ❌     |

## Related Documentation

- [E2E Tests Summary](../../docs/rbac-e2e-tests-summary.md)
- [RBAC Implementation Plan](../../plan/feature-role-based-access-control-1.md)
- [Architecture Documentation](../../docs/architecture.md)
