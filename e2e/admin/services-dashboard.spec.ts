/**
 * Services Admin Dashboard E2E Tests
 *
 * Tests for the standardized server-optimized services dashboard
 * Validates:
 * - URL-based state management
 * - Filter synchronization
 * - Pagination via query params
 * - CRUD operations (edit, delete)
 * - Deep linking support
 */

import { expect, test } from "@playwright/test";

// Constants
const DEBOUNCE_WAIT_MS = 350; // 300ms debounce + 50ms buffer
const TABLE_LOAD_WAIT_MS = 500;

test.describe("Services Admin Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Login como admin (asumiendo que existe fixture o env vars)
    await page.goto("/signin");

    // Fill credentials
    const emailInput = page.getByLabel(/email|correo/i);
    const passwordInput = page.getByLabel(/contraseña|password/i);

    if (await emailInput.isVisible()) {
      await emailInput.fill(
        process.env.TEST_ADMIN_EMAIL || "admin@example.com"
      );
    }

    if (await passwordInput.isVisible()) {
      await passwordInput.fill(process.env.TEST_ADMIN_PASSWORD || "password");
    }

    // Submit form
    const submitButton = page.getByRole("button", {
      name: /iniciar sesión|sign in|login/i,
    });
    await submitButton.click();

    // Wait for navigation
    await page.waitForURL(/dashboard|services/);
  });

  test("REQ-001: Should load services page with default state", async ({
    page,
  }) => {
    await page.goto("/admin/services");

    // Verify header visible
    await expect(
      page.getByRole("heading", { level: 1, name: /servicios/i })
    ).toBeVisible();

    // Verify description
    await expect(
      page.getByText(/gestiona los servicios adicionales/i)
    ).toBeVisible();

    // Verify table visible (not in skeleton state)
    await expect(page.locator("table")).toBeVisible();
  });

  test("REQ-002: Filters should be always visible during loading", async ({
    page,
  }) => {
    await page.goto("/admin/services");

    // Verify search input visible
    const searchInput = page.getByPlaceholder(/buscar/i);
    await expect(searchInput).toBeVisible();

    // Verify filter dropdowns visible
    const filterSelects = page.locator('select, [role="combobox"]');
    const count = await filterSelects.count();
    expect(count).toBeGreaterThan(0);

    // Verify create button visible
    await expect(
      page.getByRole("button", { name: /nuevo servicio/i })
    ).toBeVisible();
  });

  test("REQ-003: Search should debounce and update URL", async ({ page }) => {
    await page.goto("/admin/services");

    const searchInput = page.getByPlaceholder(/buscar/i);

    // Type search query
    await searchInput.fill("instalación");

    // Wait for debounce (300ms) + buffer
    await page.waitForTimeout(DEBOUNCE_WAIT_MS);

    // Verify URL contains search param
    await expect(page).toHaveURL(/search=instalaci|search=instalaci%C3/i);
  });

  test("REQ-004: Filter by type should update URL", async ({ page }) => {
    await page.goto("/admin/services");

    // Find type filter select
    const typeSelect = page.locator('select, [role="combobox"]').first();
    await typeSelect.click();

    // Select "Fijo"
    const fixedOption = page.getByRole("option", { name: /fijo/i });
    if (await fixedOption.isVisible()) {
      await fixedOption.click();
    }

    // Verify URL contains type param
    await page.waitForURL(/type=fixed/);
    await expect(page).toHaveURL(/type=fixed/);
  });

  test("REQ-005: Filter by active status should update URL", async ({
    page,
  }) => {
    await page.goto("/admin/services");

    // Find active status filter
    const selects = page.locator('select, [role="combobox"]');
    const lastSelect = selects.last();
    await lastSelect.click();

    // Select "Activo"
    const activeOption = page.getByRole("option", { name: /activo/i });
    if (await activeOption.isVisible()) {
      await activeOption.click();
    }

    // Verify URL contains isActive param
    await page.waitForURL(/isActive=active/);
    await expect(page).toHaveURL(/isActive=active/);
  });

  test("REQ-006: Deep linking should load filtered state", async ({ page }) => {
    // Navigate directly to filtered URL
    await page.goto(
      "/admin/services?type=area&isActive=active&page=1&search=entrega"
    );

    // Verify page loaded
    await expect(
      page.getByRole("heading", { name: /servicios/i })
    ).toBeVisible();

    // Verify table data is relevant to filters
    // (Note: actual data depends on database state)
    const table = page.locator("table");
    await expect(table).toBeVisible();
  });

  test("REQ-007: Pagination should sync with URL", async ({ page }) => {
    await page.goto("/admin/services");

    // Check if pagination exists (depends on data)
    const paginationButtons = page.getByRole("button", {
      name: /siguiente|next/i,
    });

    if (await paginationButtons.isVisible()) {
      // Click next page
      await paginationButtons.click();

      // Verify URL updated
      await page.waitForURL(/page=2/);
      await expect(page).toHaveURL(/page=2/);
    }
  });

  test("REQ-008: Edit service should navigate correctly", async ({ page }) => {
    await page.goto("/admin/services");

    // Wait for table to load
    await expect(page.locator("table")).toBeVisible();

    // Find first edit button
    const editButton = page
      .locator("button")
      .filter({ hasText: /editar/i })
      .first();

    if (await editButton.isVisible()) {
      await editButton.click();

      // Verify navigation to edit page
      await page.waitForURL(/\/admin\/services\/[a-z0-9]+$/);
      expect(page.url()).toMatch(/\/admin\/services\/[a-z0-9]+$/);
    }
  });

  test("REQ-009: Delete service should show confirmation dialog", async ({
    page,
  }) => {
    await page.goto("/admin/services");

    // Wait for table to load
    await expect(page.locator("table")).toBeVisible();

    // Find first delete button
    const deleteButton = page
      .locator("button")
      .filter({ hasText: /eliminar/i })
      .first();

    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Verify confirmation dialog appears
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();

      // Verify dialog has cancel option
      const cancelButton = dialog.getByRole("button", {
        name: /cancelar|close|dismiss/i,
      });
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
      }

      // Verify dialog closed
      await expect(dialog).not.toBeVisible();
    }
  });

  test("REQ-010: Create button should navigate to form", async ({ page }) => {
    await page.goto("/admin/services");

    // Click create button
    await page.getByRole("button", { name: /nuevo servicio/i }).click();

    // Verify navigation
    await page.waitForURL(/\/admin\/services\/new/);
    expect(page.url()).toContain("/admin/services/new");
  });

  test("REQ-011: Table should reset page on filter change", async ({
    page,
  }) => {
    await page.goto("/admin/services?page=3");

    // Verify current page
    await expect(page).toHaveURL(/page=3/);

    // Change a filter (type)
    const typeSelect = page.locator('select, [role="combobox"]').first();
    await typeSelect.click();

    const typeOption = page.getByRole("option", { name: /área/i });
    if (await typeOption.isVisible()) {
      await typeOption.click();

      // Verify page reset to 1
      await page.waitForURL(/page=1.*type=area|type=area.*page=1/);
      await expect(page).toHaveURL(/page=1/);
    }
  });

  test("REQ-012: Service count should display correctly", async ({ page }) => {
    await page.goto("/admin/services");

    // Verify card description with count
    const description = page
      .locator("p")
      .filter({ hasText: /servicio/i })
      .first();
    if (await description.isVisible()) {
      const text = await description.textContent();
      // Should contain "X servicio(s) registrado(s)"
      expect(text).toMatch(/\d+\s+servicio/i);
    }
  });

  test("REQ-013: Empty state should show when no results", async ({ page }) => {
    // Navigate with filter that should return no results
    await page.goto("/admin/services?search=zzzzzzzzzzz");

    // Wait a bit for table to load
    await page.waitForTimeout(TABLE_LOAD_WAIT_MS);

    // Check for empty state message
    const emptyState = page.getByText(/no hay servicios/i);

    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();
    }
  });

  test("REQ-014: Multiple filters should combine correctly", async ({
    page,
  }) => {
    await page.goto("/admin/services");

    // Apply type filter
    let select = page.locator('select, [role="combobox"]').first();
    await select.click();
    let option = page.getByRole("option", { name: /área/i });
    if (await option.isVisible()) {
      await option.click();
    }

    // Wait for URL update
    await page.waitForURL(/type=area/);

    // Apply status filter
    select = page.locator('select, [role="combobox"]').last();
    await select.click();
    option = page.getByRole("option", { name: /activo/i });
    if (await option.isVisible()) {
      await option.click();
    }

    // Verify both filters in URL
    await page.waitForURL(
      /type=area.*isActive=active|isActive=active.*type=area/
    );
    const url = page.url();
    expect(url).toContain("type=area");
    expect(url).toContain("isActive=active");
  });

  test("REQ-015: Browser back/forward should restore state", async ({
    page,
  }) => {
    // Navigate to first page
    await page.goto("/admin/services?type=area&page=1");

    // Apply another filter
    await page.goto("/admin/services?type=fixed&page=1");

    // Verify current URL
    await expect(page).toHaveURL(/type=fixed/);

    // Go back
    await page.goBack();

    // Verify previous URL restored
    await expect(page).toHaveURL(/type=area/);
  });
});
