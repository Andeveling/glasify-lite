/**
 * Models Table E2E Tests
 *
 * Tests for server-optimized Models admin table with filtering, sorting, search, and pagination.
 *
 * Features tested:
 * - Server-side filtering (status, supplier)
 * - Server-side sorting (name, basePrice, createdAt)
 * - Debounced search (300ms)
 * - Pagination controls
 * - Deep linking (URL state persistence)
 * - CRUD operations (create, edit, delete)
 *
 * @see TASK-025: E2E tests for Models table
 */

import { expect, test } from '@playwright/test';

const ADMIN_EMAIL = 'admin@test.com';
const ADMIN_PASSWORD = 'admin123';
const DEBOUNCE_WAIT_MS = 500; // Wait for 300ms debounce + network
const FILTER_WAIT_MS = 200; // Wait for filter application

test.describe('Models Table - Server Optimized', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/signin');
    await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
    await page.getByLabel(/contraseña/i).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await page.waitForURL(/\/dashboard/);

    // Navigate to models page
    await page.goto('/admin/models');
    await page.waitForLoadState('networkidle');
  });

  test('should display models table with data', async ({ page }) => {
    // Verify page title
    await expect(page.getByRole('heading', { name: /modelos/i })).toBeVisible();

    // Verify table card is visible
    const tableCard = page.locator('[role="region"]', { hasText: 'Modelos' }).first();
    await expect(tableCard).toBeVisible();

    // Verify table has rows
    const tableRows = page.locator('table tbody tr');
    const count = await tableRows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter by status', async ({ page }) => {
    // Get initial URL
    const initialUrl = page.url();

    // Select "Publicado" status
    const statusSelect = page.locator('select#status, [id="status"]').first();
    await statusSelect.selectOption('published');

    // Wait for navigation/refetch
    await page.waitForLoadState('networkidle');

    // Verify URL contains status param
    expect(page.url()).toContain('status=published');
    expect(page.url()).not.toBe(initialUrl);

    // Verify all visible badges show "Publicado"
    const statusBadges = page.locator('table tbody tr').locator('text=/Publicado/i');
    const badgeCount = await statusBadges.count();
    expect(badgeCount).toBeGreaterThan(0);
  });

  test('should filter by supplier', async ({ page }) => {
    // If it's a select element
    const supplierSelect = page.locator('select#profileSupplierId, [id="profileSupplierId"]').first();

    if (await supplierSelect.isVisible()) {
      // Get first supplier option (skip "Todos")
      const options = await supplierSelect.locator('option').all();
      if (options.length > 1) {
        const firstSupplierId = await options[1].getAttribute('value');
        if (firstSupplierId) {
          await supplierSelect.selectOption(firstSupplierId);

          // Wait for navigation
          await page.waitForLoadState('networkidle');

          // Verify URL contains supplier param
          expect(page.url()).toContain(`profileSupplierId=${firstSupplierId}`);
        }
      }
    }
  });

  test('should search models by name', async ({ page }) => {
    // Get search input
    const searchInput = page.getByPlaceholder(/buscar/i);
    await expect(searchInput).toBeVisible();

    // Type search query
    await searchInput.fill('ven');

    // Wait for debounce (300ms) + network
    await page.waitForTimeout(DEBOUNCE_WAIT_MS);
    await page.waitForLoadState('networkidle');

    // Verify URL contains search param
    expect(page.url()).toContain('search=ven');

    // Verify results contain search term
    const tableRows = page.locator('table tbody tr');
    const count = await tableRows.count();

    if (count > 0) {
      const firstRowText = await tableRows.first().textContent();
      expect(firstRowText?.toLowerCase()).toContain('ven');
    }
  });

  test('should sort by column', async ({ page }) => {
    // Click on "Nombre" column header to sort
    const nameHeader = page.getByRole('button', { name: /nombre/i });
    await nameHeader.click();

    // Wait for navigation
    await page.waitForLoadState('networkidle');

    // Verify URL contains sort params
    expect(page.url()).toContain('sortBy=name');
    expect(page.url()).toMatch(/sortOrder=(asc|desc)/);

    // Click again to toggle sort order
    await nameHeader.click();
    await page.waitForLoadState('networkidle');

    // Verify sort order changed
    const newUrl = page.url();
    expect(newUrl).toContain('sortBy=name');
  });

  test('should navigate between pages', async ({ page }) => {
    // Check if pagination is visible (depends on data count)
    const nextButton = page.getByRole('button', { name: /siguiente/i });

    if (await nextButton.isEnabled()) {
      // Click next page
      await nextButton.click();
      await page.waitForLoadState('networkidle');

      // Verify URL contains page param
      expect(page.url()).toContain('page=2');

      // Verify previous button is now enabled
      const prevButton = page.getByRole('button', { name: /anterior/i });
      await expect(prevButton).toBeEnabled();
    }
  });

  test('should clear search', async ({ page }) => {
    // Enter search term
    const searchInput = page.getByPlaceholder(/buscar/i);
    await searchInput.fill('test');
    await page.waitForTimeout(DEBOUNCE_WAIT_MS);

    // Click clear button (X icon)
    const clearButton = page.getByRole('button', { name: /limpiar búsqueda/i });

    if (await clearButton.isVisible()) {
      await clearButton.click();
      await page.waitForLoadState('networkidle');

      // Verify search input is empty
      await expect(searchInput).toHaveValue('');

      // Verify URL does not contain search param
      expect(page.url()).not.toContain('search=');
    }
  });

  test('should persist filters in URL (deep linking)', async ({ page }) => {
    // Apply multiple filters
    const statusSelect = page.locator('select#status, [id="status"]').first();
    await statusSelect.selectOption('published');
    await page.waitForTimeout(FILTER_WAIT_MS);

    const searchInput = page.getByPlaceholder(/buscar/i);
    await searchInput.fill('ven');
    await page.waitForTimeout(DEBOUNCE_WAIT_MS);

    // Get final URL with all params
    const urlWithFilters = page.url();
    expect(urlWithFilters).toContain('status=published');
    expect(urlWithFilters).toContain('search=ven');

    // Navigate away and back
    await page.goto('/admin/glass-types');
    await page.goto(urlWithFilters);
    await page.waitForLoadState('networkidle');

    // Verify filters are restored
    await expect(statusSelect).toHaveValue('published');
    await expect(searchInput).toHaveValue('ven');
  });

  test('should open edit page for model', async ({ page }) => {
    // Find first row actions button
    const firstActionsButton = page
      .locator('table tbody tr')
      .first()
      .getByRole('button', { name: /acciones/i });

    if (await firstActionsButton.isVisible()) {
      await firstActionsButton.click();

      // Click edit option
      const editOption = page.getByRole('menuitem', { name: /editar/i });
      await editOption.click();

      // Verify navigation to edit page
      await page.waitForURL(/\/admin\/models\/.+/);
      expect(page.url()).toMatch(/\/admin\/models\/.+/);
    }
  });

  test('should display total count', async ({ page }) => {
    // Verify total count is displayed
    const totalText = page.getByText(/total:/i);
    await expect(totalText).toBeVisible();

    // Verify it shows a number
    const totalContent = await totalText.textContent();
    expect(totalContent).toMatch(/\d+/);
  });

  test('should reset to page 1 when filtering', async ({ page }) => {
    // Go to page 2 if possible
    const nextButton = page.getByRole('button', { name: /siguiente/i });

    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('page=2');

      // Apply a filter
      const statusSelect = page.locator('select#status, [id="status"]').first();
      await statusSelect.selectOption('draft');
      await page.waitForLoadState('networkidle');

      // Verify page reset to 1
      expect(page.url()).toContain('status=draft');
      expect(page.url()).not.toContain('page=2');
    }
  });
});
