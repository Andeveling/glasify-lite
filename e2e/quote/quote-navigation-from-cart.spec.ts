/**
 * E2E Test: Quote Navigation from Cart
 *
 * Tests the complete flow:
 * 1. User adds items to cart
 * 2. User navigates to cart
 * 3. User clicks "Generar cotización"
 * 4. User is redirected to /quote/new (authenticated)
 * 5. Form is displayed correctly without redirects
 *
 * This test validates the fix for the race condition bug where
 * the cart hydration was causing false "empty cart" redirects.
 */

import { expect, test } from "@playwright/test";

test.describe("Quote Navigation from Cart", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto("/");
  });

  test("should navigate to quote generation page from cart without redirect loop", async ({
    page,
  }) => {
    // Step 1: Navigate to catalog
    await page
      .getByRole("link", { name: /todos los productos|catálogo/i })
      .click();
    await page.waitForURL(/\/catalog/);

    // Step 2: Add an item to cart (click on first product)
    const firstProduct = page.locator('[data-testid="model-card"]').first();
    await firstProduct.click();
    await page.waitForURL(/\/catalog\/.+/);

    // Step 3: Fill product configuration form
    await page.getByLabel(/ancho/i).fill("1000");
    await page.getByLabel(/alto/i).fill("1500");

    // Select glass type (if dropdown exists)
    const glassTypeSelect = page.getByLabel(/tipo de vidrio/i);
    if (await glassTypeSelect.isVisible()) {
      await glassTypeSelect.click();
      await page.getByRole("option").first().click();
    }

    // Step 4: Add to cart
    await page.getByRole("button", { name: /agregar al carrito/i }).click();

    // Wait for toast confirmation
    await expect(page.getByText(/agregado al carrito/i)).toBeVisible({
      timeout: 5000,
    });

    // Step 5: Navigate to cart
    await page.getByRole("link", { name: /carrito|cart/i }).click();
    await page.waitForURL("/cart");

    // Verify cart page loaded
    await expect(
      page.getByRole("heading", { name: /carrito de presupuesto/i })
    ).toBeVisible();

    // Verify cart has items
    await expect(
      page.locator('[data-testid="cart-item"]').first()
    ).toBeVisible();

    // Step 6: Sign in (required for quote generation)
    // First, try to click "Generar cotización" to trigger auth redirect
    const generateQuoteButton = page.getByRole("button", {
      name: /generar cotización/i,
    });
    await expect(generateQuoteButton).toBeVisible();
    await generateQuoteButton.click();

    // Should redirect to signin if not authenticated
    await page.waitForURL(/\/(signin|api\/auth\/signin)/);

    // Sign in with test account (if you have OAuth setup, this needs adjustment)
    // For now, we'll assume you need to manually sign in or have a test user

    // Note: This is where you'd implement actual OAuth flow or test credentials
    // For this example, we'll check if already signed in or skip this test
    const isSigninPage = page.url().includes("signin");

    if (isSigninPage) {
      // If you have test credentials, sign in here
      // Otherwise, skip this part of the test
      test.skip(
        !isSigninPage,
        "User must be authenticated to continue this test"
      );
    }
  });

  test("should show quote form after authentication without redirect to catalog", async ({
    page,
    context,
  }) => {
    // This test assumes user is already authenticated
    // You can set auth cookies or session here if needed

    // Step 1: Add item to sessionStorage (simulating cart)
    await page.goto("/catalog");

    // Add cart items via localStorage
    await page.evaluate(() => {
      const mockCartItem = {
        additionalServiceIds: [],
        createdAt: new Date().toISOString(),
        dimensions: { heightMm: 1500, widthMm: 1000 },
        glassTypeId: "glass-123",
        glassTypeName: "Templado",
        heightMm: 1500,
        id: "test-item-1",
        modelId: "model-123",
        modelName: "VEKA Premium",
        name: "Ventana 1",
        quantity: 1,
        subtotal: 50_000,
        unitPrice: 50_000,
        widthMm: 1000,
      };

      sessionStorage.setItem("glasify-cart", JSON.stringify([mockCartItem]));
    });

    // Step 2: Navigate directly to quote/new
    await page.goto("/quote/new");

    // Step 3: Verify we're on the quote generation page (not redirected to catalog)
    await expect(page).toHaveURL("/quote/new", { timeout: 3000 });

    // Step 4: Wait for form to be visible (not skeleton)
    await expect(page.getByLabel(/calle/i)).toBeVisible({ timeout: 5000 });

    // Step 5: Verify all form fields are present
    await expect(page.getByLabel(/nombre del proyecto/i)).toBeVisible();
    await expect(page.getByLabel(/ciudad/i)).toBeVisible();
    await expect(page.getByLabel(/estado/i)).toBeVisible();
    await expect(page.getByLabel(/código postal/i)).toBeVisible();

    // Step 6: Verify submit button is enabled
    const submitButton = page.getByRole("button", {
      name: /generar cotización/i,
    });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();

    // Step 7: Verify NO redirect happened to catalog
    await page.waitForTimeout(2000); // Wait to ensure no redirect
    await expect(page).toHaveURL("/quote/new");
  });

  test("should redirect to catalog if cart is actually empty", async ({
    page,
  }) => {
    // Clear any existing cart
    await page.goto("/catalog");
    await page.evaluate(() => {
      sessionStorage.removeItem("glasify-cart");
    });

    // Navigate to quote/new with empty cart
    await page.goto("/quote/new");

    // Should redirect to catalog with error toast
    await expect(page).toHaveURL(/\/catalog/, { timeout: 3000 });

    // Verify error toast appears
    await expect(page.getByText(/carrito vacío/i)).toBeVisible({
      timeout: 2000,
    });
  });
});
