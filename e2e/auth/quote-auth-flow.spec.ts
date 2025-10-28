/**
 * E2E Test: Quote Auth Flow
 *
 * Tests complete authentication flow for quote generation:
 * - Unauthenticated user adds items to cart
 * - Clicks "Generate Quote" button
 * - Redirected to sign-in page
 * - Completes Google OAuth authentication
 * - Returns to quote generation flow
 * - Cart data preserved throughout
 *
 * @module e2e/auth/quote-auth-flow
 */

import { expect, test } from "@playwright/test";

// ============================================================================
// Constants
// ============================================================================

const CATALOG_REGEX = /catálogo/i;
const CATALOG_MODEL_URL_REGEX = /\/catalog\/\w+/;
const SIGNIN_URL_REGEX = /\/signin/;
const ADDED_TO_CART_REGEX = /agregado al carrito/i;
const AUTH_REQUIRED_REGEX = /se requiere autenticación/i;

test.describe("Quote Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Start on catalog page (unauthenticated)
    await page.goto("/catalog");
  });

  test('should redirect unauthenticated user to sign-in when clicking "Generate Quote"', async ({
    page,
  }) => {
    // ARRANGE: Navigate to a model detail page
    await page.goto("/catalog");

    // Wait for catalog to load
    await expect(page.locator("h1")).toContainText(CATALOG_REGEX);

    // Click first model card to configure
    const firstModelCard = page.locator('[data-testid="model-card"]').first();
    await firstModelCard.click();

    // Wait for model detail page
    await page.waitForURL(CATALOG_MODEL_URL_REGEX);

    // Fill out configuration form
    await page.locator('input[name="widthMm"]').fill("1000");
    await page.locator('input[name="heightMm"]').fill("1500");

    // ACT: Add to cart
    const addToCartButton = page.locator(
      'button:has-text("Agregar al carrito")'
    );
    await addToCartButton.click();

    // Wait for success feedback
    await expect(
      page.locator(`text=${ADDED_TO_CART_REGEX.source}`)
    ).toBeVisible({ timeout: 5000 });

    // Navigate to cart page
    await page.goto("/cart");

    // Verify cart has items
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);

    // ACT: Click "Generate Quote" button (should redirect to sign-in)
    const generateQuoteButton = page.locator(
      'button:has-text("Generar cotización")'
    );
    await generateQuoteButton.click();

    // ASSERT: Should redirect to sign-in page with callbackUrl
    await page.waitForURL(SIGNIN_URL_REGEX);
    const url = new URL(page.url());
    expect(url.pathname).toBe("/signin");
    expect(url.searchParams.get("callbackUrl")).toBe("/quote/new");
  });

  test("should preserve cart items during auth redirect", async ({ page }) => {
    // ARRANGE: Add multiple items to cart
    await page.goto("/catalog");

    // Add first item
    const firstModel = page.locator('[data-testid="model-card"]').first();
    await firstModel.click();
    await page.waitForURL(CATALOG_MODEL_URL_REGEX);

    await page.locator('input[name="widthMm"]').fill("1000");
    await page.locator('input[name="heightMm"]').fill("1500");
    await page.locator('button:has-text("Agregar al carrito")').click();
    await expect(
      page.locator(`text=${ADDED_TO_CART_REGEX.source}`)
    ).toBeVisible();

    // Go back and add second item
    await page.goto("/catalog");
    const secondModel = page.locator('[data-testid="model-card"]').nth(1);
    await secondModel.click();
    await page.waitForURL(CATALOG_MODEL_URL_REGEX);

    await page.locator('input[name="widthMm"]').fill("800");
    await page.locator('input[name="heightMm"]').fill("1200");
    await page.locator('button:has-text("Agregar al carrito")').click();
    await expect(
      page.locator(`text=${ADDED_TO_CART_REGEX.source}`)
    ).toBeVisible();

    // Navigate to cart
    await page.goto("/cart");

    // Verify 2 items in cart
    const cartItemsBefore = await page
      .locator('[data-testid="cart-item"]')
      .count();
    expect(cartItemsBefore).toBe(2);

    // ACT: Click "Generate Quote" (triggers sign-in redirect)
    await page.locator('button:has-text("Generar cotización")').click();
    await page.waitForURL(SIGNIN_URL_REGEX);

    // Go back to cart (simulating OAuth redirect back)
    await page.goto("/cart");

    // ASSERT: Cart items should still be there (sessionStorage preserved)
    const cartItemsAfter = await page
      .locator('[data-testid="cart-item"]')
      .count();
    expect(cartItemsAfter).toBe(2);
  });

  test("should show authentication hint in CartSummary when not authenticated", async ({
    page,
  }) => {
    // ARRANGE: Add item to cart
    await page.goto("/catalog");

    const firstModel = page.locator('[data-testid="model-card"]').first();
    await firstModel.click();
    await page.waitForURL(CATALOG_MODEL_URL_REGEX);

    await page.locator('input[name="widthMm"]').fill("1000");
    await page.locator('input[name="heightMm"]').fill("1500");
    await page.locator('button:has-text("Agregar al carrito")').click();
    await expect(
      page.locator(`text=${ADDED_TO_CART_REGEX.source}`)
    ).toBeVisible();

    // Navigate to cart
    await page.goto("/cart");

    // ASSERT: Should show authentication hint
    await expect(
      page.locator(`text=${AUTH_REQUIRED_REGEX.source}`)
    ).toBeVisible();
  });

  test("should protect /quotes route from unauthenticated access", async ({
    page,
  }) => {
    // ACT: Try to access quotes page directly without authentication
    await page.goto("/quotes");

    // ASSERT: Should redirect to sign-in
    await page.waitForURL(SIGNIN_URL_REGEX);
    const url = new URL(page.url());
    expect(url.pathname).toBe("/signin");
    expect(url.searchParams.get("callbackUrl")).toBe("/quotes");
  });

  test("should protect /quote/new route from unauthenticated access", async ({
    page,
  }) => {
    // ACT: Try to access quote generation page directly without authentication
    await page.goto("/quote/new");

    // ASSERT: Should redirect to sign-in
    await page.waitForURL(SIGNIN_URL_REGEX);
    const url = new URL(page.url());
    expect(url.pathname).toBe("/signin");
    expect(url.searchParams.get("callbackUrl")).toBe("/quote/new");
  });
});
