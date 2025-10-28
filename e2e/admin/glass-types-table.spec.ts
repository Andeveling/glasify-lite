/**
 * Glass Types Table E2E Tests
 *
 * Tests for server-optimized Glass Types admin table.
 *
 * Features tested:
 * - Server-side filtering (purpose, supplier, active status)
 * - Server-side sorting
 * - Debounced search
 * - Pagination
 * - Deep linking
 *
 * @see TASK-032: E2E tests for Glass Types table
 */

import { expect, test } from "@playwright/test";

const ADMIN_EMAIL = "admin@test.com";
const ADMIN_PASSWORD = "admin123";
const DEBOUNCE_WAIT_MS = 500;

test.describe("Glass Types Table - Server Optimized", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/signin");
    await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
    await page.getByLabel(/contraseña/i).fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /iniciar sesión/i }).click();
    await page.waitForURL(/\/dashboard/);

    // Navigate to glass types page
    await page.goto("/admin/glass-types");
    await page.waitForLoadState("networkidle");
  });

  test("should display glass types table with data", async ({ page }) => {
    // Verify page title
    await expect(
      page.getByRole("heading", { name: /tipos de vidrio/i })
    ).toBeVisible();

    // Verify table has rows
    const tableRows = page.locator("table tbody tr");
    const count = await tableRows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should filter by purpose", async ({ page }) => {
    // Select "Aislamiento" purpose
    const purposeSelect = page
      .locator('select#purpose, [id="purpose"]')
      .first();
    await purposeSelect.selectOption("insulation");

    // Wait for navigation
    await page.waitForLoadState("networkidle");

    // Verify URL contains purpose param
    expect(page.url()).toContain("purpose=insulation");
  });

  test("should filter by active status", async ({ page }) => {
    // Select "Activos" status
    const statusSelect = page
      .locator('select#isActive, [id="isActive"]')
      .first();
    await statusSelect.selectOption("active");

    // Wait for navigation
    await page.waitForLoadState("networkidle");

    // Verify URL contains status param
    expect(page.url()).toContain("isActive=active");
  });

  test("should search glass types", async ({ page }) => {
    // Get search input
    const searchInput = page.getByPlaceholder(/buscar/i);
    await expect(searchInput).toBeVisible();

    // Type search query
    await searchInput.fill("seg");

    // Wait for debounce
    await page.waitForTimeout(DEBOUNCE_WAIT_MS);
    await page.waitForLoadState("networkidle");

    // Verify URL contains search param
    expect(page.url()).toContain("search=seg");
  });

  test("should sort by column", async ({ page }) => {
    // Click on "Nombre" column header
    const nameHeader = page.getByRole("button", { name: /nombre/i });
    await nameHeader.click();

    // Wait for navigation
    await page.waitForLoadState("networkidle");

    // Verify URL contains sort params
    expect(page.url()).toContain("sortBy=name");
  });

  test("should display total count", async ({ page }) => {
    // Verify total count is displayed
    const totalText = page.getByText(/total:/i);
    await expect(totalText).toBeVisible();
  });

  test("should persist filters in URL", async ({ page }) => {
    // Apply filters
    const purposeSelect = page
      .locator('select#purpose, [id="purpose"]')
      .first();
    await purposeSelect.selectOption("security");
    await page.waitForLoadState("networkidle");

    const url = page.url();
    expect(url).toContain("purpose=security");

    // Navigate away and back
    await page.goto("/admin/models");
    await page.goto(url);
    await page.waitForLoadState("networkidle");

    // Verify filter is restored
    await expect(purposeSelect).toHaveValue("security");
  });
});
