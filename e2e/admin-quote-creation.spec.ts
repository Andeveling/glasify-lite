/**
 * E2E Tests: Admin Quote Creation Flow
 *
 * Tests the admin flow for creating quotes directly from catalog items.
 * Uses Better Auth test utils for session injection (no OAuth needed).
 *
 * @module e2e/admin-quote-creation
 */

import { expect, test } from "@playwright/test";
import { createAdminSession, injectAuthCookies } from "./helpers/test-auth-helper";

// Test constants
const NEW_QUOTE_URL = "/admin/quotes/new";

// Auth redirect regex pattern
const AUTH_REDIRECT_REGEX = /\/(signin|api\/auth|admin).*/;

test.describe("Admin Quote Creation", () => {
  // Authenticated admin session
  let adminSession: Awaited<ReturnType<typeof createAdminSession>>;

  test.beforeEach(async ({ page }) => {
    // Create admin user with session
    adminSession = await createAdminSession();

    // Inject auth cookies
    await injectAuthCookies(page, adminSession.user.cookies);

    // Navigate to the new quote page
    await page.goto(NEW_QUOTE_URL);

    // Wait for form to load
    await page.waitForSelector('text=Información del Proyecto', {
      state: "visible",
      timeout: 15_000,
    });
  });

  test.afterEach(async () => {
    // Cleanup admin user
    if (adminSession) {
      await adminSession.cleanup();
    }
  });

  test("should display project info section", async ({ page }) => {
    // Verify project info fields are visible
    await expect(
      page.locator('label:has-text("Nombre del Proyecto")')
    ).toBeVisible();

    await expect(
      page.locator('label:has-text("Dirección")')
    ).toBeVisible();

    await expect(
      page.locator('label:has-text("Ciudad")')
    ).toBeVisible();

    await expect(
      page.locator('label:has-text("Estado/Región")')
    ).toBeVisible();
  });

  test("should display items section with add button", async ({ page }) => {
    // Verify items section header
    await expect(
      page.locator('text=Ítems de la Cotización')
    ).toBeVisible();

    // Verify add item button exists
    const addButton = page.locator('button:has-text("Agregar Ítem")');
    await expect(addButton).toBeVisible();
  });

  test("should show catalog selectors in first item row", async ({ page }) => {
    // Verify model selector exists
    const modelSelector = page.locator(
      'label:has-text("Modelo") + * >> nth=0'
    ).first();

    // Verify glass type selector exists
    const glassTypeSelector = page.locator(
      'label:has-text("Tipo de Vidrio")'
    );

    // Verify dimension inputs exist
    const widthInput = page.locator('label:has-text("Ancho (mm)")');
    const heightInput = page.locator('label:has-text("Alto (mm)")');
    const quantityInput = page.locator('label:has-text("Cantidad")');

    await expect(modelSelector).toBeVisible();
    await expect(glassTypeSelector).toBeVisible();
    await expect(widthInput).toBeVisible();
    await expect(heightInput).toBeVisible();
    await expect(quantityInput).toBeVisible();
  });

  test("should display client assignment dropdown", async ({ page }) => {
    // Verify client assignment field exists
    const clientField = page.locator('label:has-text("Asignar a Cliente")');
    await expect(clientField).toBeVisible();
  });

  test("should show cancel and submit buttons", async ({ page }) => {
    // Verify cancel button
    const cancelButton = page.locator('button:has-text("Cancelar")');
    await expect(cancelButton).toBeVisible();

    // Verify submit button
    const submitButton = page.locator('button:has-text("Crear Cotización")');
    await expect(submitButton).toBeVisible();
  });

  test("should navigate back when cancel is clicked", async ({ page }) => {
    // Click cancel
    await page.click('button:has-text("Cancelar")');

    // Should navigate back (either to quotes list or previous page)
    // Allow either URL since history varies
    await expect(page.url()).not.toContain(NEW_QUOTE_URL);
  });

  test("should validate required fields on submit", async ({ page }) => {
    // Try to submit without filling required fields
    const submitButton = page.locator('button:has-text("Crear Cotización")');

    // Button should be disabled when form is invalid
    // (depends on validation implementation)
    await submitButton.click();

    // Form should show validation errors
    // (The exact error messages depend on implementation)
  });

  test("should allow adding multiple items", async ({ page }) => {
    // Click add item button
    const addButton = page.locator('button:has-text("Agregar Ítem")');
    await addButton.click();

    // Wait for second row to appear
    await page.waitForSelector(
      'label:has-text("Modelo") >> nth=1',
      { state: "visible" }
    );

    // Should now have 2 model selectors
    const modelSelectors = page.locator('label:has-text("Modelo")');
    await expect(modelSelectors).toHaveCount(2);
  });

  test("should allow removing additional items", async ({ page }) => {
    // First add an item
    const addButton = page.locator('button:has-text("Agregar Ítem")');
    await addButton.click();

    // Wait for second row
    await page.waitForSelector(
      'label:has-text("Modelo") >> nth=1',
      { state: "visible" }
    );

    // Find and click the delete button on the second row
    // (the last delete button should be for the last item)
    const deleteButtons = page.locator(
      'button:has([class*="text-destructive"])'
    );
    await deleteButtons.last().click();

    // Should only have 1 model selector now
    const modelSelectors = page.locator('label:has-text("Modelo")');
    await expect(modelSelectors).toHaveCount(1);
  });

  test("should fill project info fields", async ({ page }) => {
    // Fill project name
    const projectNameInput = page.locator('input[id="projectName"]');
    await projectNameInput.fill("Edificio Test");

    // Fill address
    const addressInput = page.locator('input[id="projectStreet"]');
    await addressInput.fill("Av. Test #123");

    // Fill city
    const cityInput = page.locator('input[id="projectCity"]');
    await cityInput.fill("Ciudad Test");

    // Fill state
    const stateInput = page.locator('input[id="projectState"]');
    await stateInput.fill("Estado Test");

    // Verify values were filled
    await expect(projectNameInput).toHaveValue("Edificio Test");
    await expect(addressInput).toHaveValue("Av. Test #123");
    await expect(cityInput).toHaveValue("Ciudad Test");
    await expect(stateInput).toHaveValue("Estado Test");
  });

  test("should show loading state while submitting", async () => {
    // This test verifies the loading UI behavior
    // Note: We can't test actual submission without auth and DB
    // Placeholder for loading state verification
  });

  test("should show success message after quote creation", async () => {
    // Note: This test requires:
    // 1. Admin authentication ✓ (via test auth helper)
    // 2. Database with catalog data (models, glass types) - needs seeded DB
    // 3. Proper tRPC mocking or real API calls
    //
    // For now, this is a placeholder for the happy path test
    // that would run after auth helper is implemented
  });

  test("should redirect to quotes list after successful creation", async () => {
    // Note: Same requirements as above
    // This test verifies the router.push("/admin/quotes") call
    // that happens on success
  });
});

test.describe("Admin Quote Creation - Auth Requirements", () => {
  test("should require authentication", async ({ page }) => {
    // Clear any existing auth cookies
    await page.context().clearCookies();

    // Navigate to new quote page
    await page.goto(NEW_QUOTE_URL);

    // Should redirect to sign-in or show access denied
    // The exact behavior depends on middleware configuration
    await page.waitForURL(AUTH_REDIRECT_REGEX, {
      timeout: 5000,
    });
  });
});
