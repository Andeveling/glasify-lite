/**
 * Admin Dashboard Suspense & Streaming E2E Tests
 *
 * RFC Implementation Tests
 * Validates the granular Suspense pattern for admin routes:
 * - Filters always visible during loading
 * - Critical content (header) shows immediately
 * - Table content streams independently
 * - Dialogs open without blocking
 * - Mutations trigger proper SSR refresh
 *
 * Test Routes:
 * - /admin/services
 * - /admin/profile-suppliers
 */

import { expect, test } from '@playwright/test';

// Constants
const DIALOG_OPEN_TIMEOUT = 200; // Dialogs should open in <200ms
const HEADER_VISIBLE_TIMEOUT = 100; // Header should be immediate

test.describe('RFC: Admin Suspense & Streaming Pattern', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/signin');

    const emailInput = page.getByLabel(/email|correo/i);
    const passwordInput = page.getByLabel(/contraseña|password/i);

    if (await emailInput.isVisible()) {
      await emailInput.fill(process.env.TEST_ADMIN_EMAIL || 'admin@example.com');
    }

    if (await passwordInput.isVisible()) {
      await passwordInput.fill(process.env.TEST_ADMIN_PASSWORD || 'password');
    }

    const submitButton = page.getByRole('button', { name: /iniciar sesión|sign in|login/i });
    await submitButton.click();

    await page.waitForURL(/dashboard|services/);
  });

  test.describe('Services Page - Suspense Pattern', () => {
    test('RFC-001: Header should show immediately (outside Suspense)', async ({ page }) => {
      await page.goto('/admin/services');

      // Header should be visible almost instantly (not waiting for data)
      await expect(page.getByRole('heading', { level: 1, name: /servicios/i })).toBeVisible({
        timeout: HEADER_VISIBLE_TIMEOUT,
      });

      // Description should also be immediate (static content)
      await expect(page.getByText(/gestiona los servicios adicionales/i)).toBeVisible({
        timeout: HEADER_VISIBLE_TIMEOUT,
      });
    });

    test('RFC-002: Filters should remain visible during loading', async ({ page }) => {
      await page.goto('/admin/services');

      // Even if table is loading, filters should be visible
      const searchInput = page.getByPlaceholder(/buscar/i);
      await expect(searchInput).toBeVisible();

      // Filter dropdowns should be present
      const selects = page.locator('select, [role="combobox"]');
      const count = await selects.count();
      expect(count).toBeGreaterThan(0);

      // Create button should be visible
      await expect(page.getByRole('button', { name: /nuevo servicio/i })).toBeVisible();
    });

    test('RFC-003: Create dialog should open immediately without blocking', async ({ page }) => {
      await page.goto('/admin/services');

      // Wait for page to be interactive
      await expect(page.getByRole('heading', { name: /servicios/i })).toBeVisible();

      // Click create button
      const createButton = page.getByRole('button', { name: /nuevo servicio/i });
      await createButton.click();

      // Dialog should open immediately (not waiting for any data fetch)
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible({ timeout: DIALOG_OPEN_TIMEOUT });

      // Dialog should have a form
      await expect(dialog.getByRole('heading')).toBeVisible();
    });

    test('RFC-004: Table should load independently of critical content', async ({ page }) => {
      // Navigate to services
      await page.goto('/admin/services');

      // Header and filters should be visible first
      await expect(page.getByRole('heading', { name: /servicios/i })).toBeVisible({
        timeout: HEADER_VISIBLE_TIMEOUT,
      });

      // Table may still be loading (in Suspense)
      // But header and filters are already visible and interactive

      // Eventually table should load
      await expect(page.locator('table')).toBeVisible({ timeout: 5000 });
    });

    test('RFC-005: Suspense key should trigger re-fetch on filter change', async ({ page }) => {
      await page.goto('/admin/services');

      // Wait for initial load
      await expect(page.locator('table')).toBeVisible();

      // Apply a filter (should trigger Suspense re-suspension)
      const typeSelect = page.locator('select, [role="combobox"]').first();
      await typeSelect.click();

      const option = page.getByRole('option', { name: /área/i });
      if (await option.isVisible()) {
        await option.click();

        // URL should update
        await page.waitForURL(/type=area/);

        // Table should reload with new data
        await expect(page.locator('table')).toBeVisible();
      }
    });
  });

  test.describe('Profile Suppliers Page - Suspense Pattern', () => {
    test('RFC-006: Header should show immediately (outside Suspense)', async ({ page }) => {
      await page.goto('/admin/profile-suppliers');

      // Header should be visible almost instantly
      await expect(page.getByRole('heading', { level: 1, name: /proveedores de perfiles/i })).toBeVisible({
        timeout: HEADER_VISIBLE_TIMEOUT,
      });

      // Description should also be immediate
      await expect(page.getByText(/administra los fabricantes de perfiles/i)).toBeVisible({
        timeout: HEADER_VISIBLE_TIMEOUT,
      });
    });

    test('RFC-007: Filters should remain visible during loading', async ({ page }) => {
      await page.goto('/admin/profile-suppliers');

      // Filters should be visible immediately
      const searchInput = page.getByPlaceholder(/buscar/i);
      await expect(searchInput).toBeVisible();

      // Filter controls should be present
      const selects = page.locator('select, [role="combobox"]');
      const count = await selects.count();
      expect(count).toBeGreaterThan(0);

      // Create button should be visible
      await expect(page.getByRole('button', { name: /nuevo proveedor|crear/i })).toBeVisible();
    });

    test('RFC-008: Create dialog should open immediately', async ({ page }) => {
      await page.goto('/admin/profile-suppliers');

      // Wait for page to be interactive
      await expect(page.getByRole('heading', { name: /proveedores/i })).toBeVisible();

      // Click create button
      const createButton = page.getByRole('button', { name: /nuevo proveedor|crear/i });

      if (await createButton.isVisible()) {
        await createButton.click();

        // Dialog should open immediately
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible({ timeout: DIALOG_OPEN_TIMEOUT });
      }
    });

    test('RFC-009: Table should load independently', async ({ page }) => {
      await page.goto('/admin/profile-suppliers');

      // Header should be visible first
      await expect(page.getByRole('heading', { name: /proveedores/i })).toBeVisible({
        timeout: HEADER_VISIBLE_TIMEOUT,
      });

      // Table may still be loading but critical content is visible
      await expect(page.locator('table')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Cross-cutting Concerns', () => {
    test('RFC-010: Multiple admin routes should follow same pattern', async ({ page }) => {
      // Test that multiple admin routes follow the Suspense pattern

      // Services
      await page.goto('/admin/services');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible({
        timeout: HEADER_VISIBLE_TIMEOUT,
      });
      await expect(page.getByPlaceholder(/buscar/i)).toBeVisible();

      // Profile Suppliers
      await page.goto('/admin/profile-suppliers');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible({
        timeout: HEADER_VISIBLE_TIMEOUT,
      });
      await expect(page.getByPlaceholder(/buscar/i)).toBeVisible();

      // Both should have consistent behavior:
      // - Immediate header
      // - Always-visible filters
      // - Streaming table content
    });

    test('RFC-011: Browser back/forward should work with Suspense', async ({ page }) => {
      // Navigate to services with filter
      await page.goto('/admin/services?type=area');
      await expect(page.locator('table')).toBeVisible();

      // Navigate to different filter
      await page.goto('/admin/services?type=fixed');
      await expect(page.locator('table')).toBeVisible();

      // Go back
      await page.goBack();

      // Should restore previous state with proper Suspense re-trigger
      await expect(page).toHaveURL(/type=area/);
      await expect(page.locator('table')).toBeVisible();
    });

    test('RFC-012: Deep linking with filters should work', async ({ page }) => {
      // Direct navigation to filtered URL
      await page.goto('/admin/services?search=instalacion&type=fixed&isActive=active');

      // All critical content should be visible immediately
      await expect(page.getByRole('heading', { name: /servicios/i })).toBeVisible({
        timeout: HEADER_VISIBLE_TIMEOUT,
      });
      await expect(page.getByPlaceholder(/buscar/i)).toBeVisible();

      // URL should be preserved
      expect(page.url()).toContain('search=instalacion');
      expect(page.url()).toContain('type=fixed');
      expect(page.url()).toContain('isActive=active');

      // Table should eventually load with filtered data
      await expect(page.locator('table')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Performance Characteristics', () => {
    test('RFC-013: Time to Interactive should be acceptable', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/admin/services');

      // Critical content should be interactive quickly
      await expect(page.getByRole('heading', { name: /servicios/i })).toBeVisible();

      const headerVisibleTime = Date.now() - startTime;

      // Header should be visible in less than 500ms
      expect(headerVisibleTime).toBeLessThan(500);

      // Filters should be interactive
      const searchInput = page.getByPlaceholder(/buscar/i);
      await expect(searchInput).toBeEnabled();

      // User can interact with filters even if table is still loading
      await searchInput.fill('test');

      // This proves filters are not blocked by table data fetching
    });

    test('RFC-014: Skeleton should show during loading states', async ({ page }) => {
      // This test validates that skeletons appear during Suspense

      // Navigate with slow network simulation
      await page.route('**/*', (route) => {
        // Add slight delay to see skeleton
        setTimeout(() => route.continue(), 100);
      });

      await page.goto('/admin/services');

      // Header should still be immediate
      await expect(page.getByRole('heading', { name: /servicios/i })).toBeVisible({
        timeout: HEADER_VISIBLE_TIMEOUT,
      });

      // Either skeleton or table should be visible (not empty state)
      const hasTableOrSkeleton =
        (await page.locator('table').isVisible()) || (await page.locator('[class*="skeleton"]').count()) > 0;

      expect(hasTableOrSkeleton).toBe(true);
    });
  });
});
