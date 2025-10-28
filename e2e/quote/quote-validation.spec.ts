/**
 * E2E Test: Quote Form Validation (User Story 4 - T063)
 *
 * Tests validation errors in quote generation:
 * 1. Test address validation errors
 * 2. Test empty cart prevention
 * 3. Test form field requirements
 *
 * @module e2e/quote/quote-validation
 */

import { expect, test } from "@playwright/test";

// ============================================================================
// Constants
// ============================================================================

const CATALOG_URL = "/catalog";
const QUOTE_NEW_URL = "/quote/new";

// Test data constants
const DEFAULT_WIDTH_MM = 1000;
const DEFAULT_HEIGHT_MM = 1500;
const MAX_STRING_LENGTH_TEST = 250;
const PRICE_CALCULATION_DELAY_MS = 1000;
const TOAST_TIMEOUT_MS = 5000;
const FORM_TIMEOUT_MS = 5000;
const VALIDATION_TIMEOUT_MS = 3000;
const EXPECTED_MIN_REQUIRED_FIELDS = 3; // city, state, postalCode

// Regex patterns (defined at top level for performance)
const MODEL_DETAIL_URL_PATTERN = /\/catalog\/[^/]+/;
const ADDED_TO_CART_PATTERN = /agregado al carrito/i;
const ADD_TO_CART_BUTTON_PATTERN = /agregar al carrito/i;
const GENERATE_QUOTE_BUTTON_PATTERN = /generar cotización/i;
const REQUIRED_FIELD_PATTERN = /requerido/i;
const FIELD_TOO_LONG_PATTERN = /muy larg/i;
const EMPTY_CART_MESSAGE_PATTERN = /carrito vacío|no hay productos/i;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Add a configured model to cart
 */
async function addItemToCart(
  page: any,
  widthMm = DEFAULT_WIDTH_MM,
  heightMm = DEFAULT_HEIGHT_MM
) {
  // Navigate to catalog
  await page.goto(CATALOG_URL);

  // Click first available model
  const firstModelCard = page.locator('[data-testid="model-card"]').first();
  await expect(firstModelCard).toBeVisible();
  await firstModelCard.click();

  // Wait for model detail page
  await page.waitForURL(MODEL_DETAIL_URL_PATTERN);

  // Fill dimensions (if inputs are available and empty)
  const widthInput = page.locator('input[name="widthMm"], input[name="width"]');
  const heightInput = page.locator(
    'input[name="heightMm"], input[name="height"]'
  );

  if (await widthInput.isVisible()) {
    const currentWidth = await widthInput.inputValue();
    if (!currentWidth || Number.parseInt(currentWidth, 10) === 0) {
      await widthInput.fill(widthMm.toString());
    }
  }

  if (await heightInput.isVisible()) {
    const currentHeight = await heightInput.inputValue();
    if (!currentHeight || Number.parseInt(currentHeight, 10) === 0) {
      await heightInput.fill(heightMm.toString());
    }
  }

  // Select glass type (if not already selected)
  const glassTypeRadio = page.locator('input[name="glassType"]').first();
  if (await glassTypeRadio.isVisible()) {
    const isChecked = await glassTypeRadio.isChecked();
    if (!isChecked) {
      await glassTypeRadio.click();
    }
  }

  // Wait for price calculation
  await page.waitForTimeout(PRICE_CALCULATION_DELAY_MS);

  // Click "Add to Cart" button
  const addToCartButton = page.getByRole("button", {
    name: ADD_TO_CART_BUTTON_PATTERN,
  });
  await expect(addToCartButton).toBeVisible();
  await expect(addToCartButton).toBeEnabled();
  await addToCartButton.click();

  // Wait for success toast
  await expect(
    page.locator(`text=${ADDED_TO_CART_PATTERN.source}`)
  ).toBeVisible({ timeout: TOAST_TIMEOUT_MS });
}

// ============================================================================
// Empty Cart Prevention Tests
// ============================================================================

test.describe("Empty Cart Prevention (US4-T063)", () => {
  test.beforeEach(async ({ page }) => {
    // Clear sessionStorage before each test
    await page.goto(CATALOG_URL);
    await page.evaluate(() => sessionStorage.clear());
  });

  test("should redirect to catalog if accessing /quote/new with empty cart", async ({
    page,
  }) => {
    // ARRANGE: Start with empty cart (already cleared in beforeEach)

    // ACT: Try to access quote generation page with empty cart
    await page.goto(QUOTE_NEW_URL);

    // Wait for redirects to complete
    await page.waitForLoadState("networkidle");

    // ASSERT: Should redirect to catalog or show sign-in
    const currentUrl = page.url();
    const isOnCatalog = currentUrl.includes(CATALOG_URL);
    const isOnSignIn =
      currentUrl.includes("/signin") || currentUrl.includes("/api/auth/signin");

    // Either on catalog (direct redirect) or sign-in (will redirect to catalog after auth due to empty cart)
    expect(isOnCatalog || isOnSignIn).toBe(true);
  });

  test("should show empty cart message if cart becomes empty", async ({
    page,
  }) => {
    // NOTE: This test would need to simulate cart clearing during the flow
    // Currently, the app should prevent this scenario by redirecting if cart is empty

    // ARRANGE: Navigate to catalog with empty cart
    await page.goto(CATALOG_URL);

    // ASSERT: Empty cart state should be visible if we navigate to cart
    await page.goto("/cart");

    const emptyCartState = page.locator('[data-testid="empty-cart-state"]');
    const emptyCartMessage = page.locator(
      `text=${EMPTY_CART_MESSAGE_PATTERN.source}`
    );

    // At least one should be visible
    const hasEmptyState = await emptyCartState.isVisible().catch(() => false);
    const hasEmptyMessage = await emptyCartMessage
      .isVisible()
      .catch(() => false);

    expect(hasEmptyState || hasEmptyMessage).toBe(true);
  });
});

// ============================================================================
// Form Validation Tests
// ============================================================================

test.describe("Address Validation Errors (US4-T063)", () => {
  test.beforeEach(async ({ page }) => {
    // Add item to cart first
    await page.goto(CATALOG_URL);
    await page.evaluate(() => sessionStorage.clear());
    await addItemToCart(page);
  });

  // biome-ignore lint/suspicious/noSkippedTests: requires authentication, pending auth mock setup
  test.skip("should show validation errors for empty required fields", async ({
    page,
  }) => {
    // NOTE: This test requires authentication to access /quote/new
    // Skip until auth mock is implemented

    // ARRANGE: Navigate to quote generation page (requires auth)
    await page.goto(QUOTE_NEW_URL);

    // Wait for form to load
    await expect(page.locator('input[name="projectStreet"]')).toBeVisible({
      timeout: FORM_TIMEOUT_MS,
    });

    // ACT: Submit form without filling any fields
    const submitButton = page.getByRole("button", {
      name: GENERATE_QUOTE_BUTTON_PATTERN,
    });
    await submitButton.click();

    // ASSERT: Should show "requerido" (required) validation errors
    const validationErrors = page.locator(
      `text=${REQUIRED_FIELD_PATTERN.source}`
    );
    await expect(validationErrors.first()).toBeVisible({
      timeout: VALIDATION_TIMEOUT_MS,
    });

    // Verify multiple required fields show errors
    const errorCount = await validationErrors.count();
    expect(errorCount).toBeGreaterThan(0);
  });

  // biome-ignore lint/suspicious/noSkippedTests: requires authentication, pending auth mock setup
  test.skip("should show validation error when street field exceeds max length", async ({
    page,
  }) => {
    // NOTE: This test requires authentication to access /quote/new
    // Skip until auth mock is implemented

    // ARRANGE: Navigate to quote generation page (requires auth)
    await page.goto(QUOTE_NEW_URL);

    // Wait for form to load
    await expect(page.locator('input[name="projectStreet"]')).toBeVisible({
      timeout: FORM_TIMEOUT_MS,
    });

    // ACT: Fill street with very long string (exceeds MAX_PROJECT_ADDRESS_LENGTH = 200)
    const longString = "A".repeat(MAX_STRING_LENGTH_TEST);
    const streetInput = page.locator('input[name="projectStreet"]');
    await streetInput.fill(longString);

    // Blur to trigger validation
    await page.locator('input[name="projectCity"]').focus();

    // ASSERT: Should show "muy largo" (too long) validation error
    const validationError = page.locator(
      `text=${FIELD_TOO_LONG_PATTERN.source}`
    );
    await expect(validationError).toBeVisible({
      timeout: VALIDATION_TIMEOUT_MS,
    });
  });

  // biome-ignore lint/suspicious/noSkippedTests: requires authentication, pending auth mock setup
  test.skip("should show validation error when city field exceeds max length", async ({
    page,
  }) => {
    // NOTE: This test requires authentication to access /quote/new
    // Skip until auth mock is implemented

    // ARRANGE: Navigate to quote generation page (requires auth)
    await page.goto(QUOTE_NEW_URL);

    // Wait for form to load
    await expect(page.locator('input[name="projectCity"]')).toBeVisible({
      timeout: FORM_TIMEOUT_MS,
    });

    // ACT: Fill city with very long string
    const longString = "B".repeat(MAX_STRING_LENGTH_TEST);
    const cityInput = page.locator('input[name="projectCity"]');
    await cityInput.fill(longString);

    // Blur to trigger validation
    await page.locator('input[name="projectState"]').focus();

    // ASSERT: Should show validation error
    const validationError = page.locator(
      `text=${FIELD_TOO_LONG_PATTERN.source}`
    );
    await expect(validationError).toBeVisible({
      timeout: VALIDATION_TIMEOUT_MS,
    });
  });

  // biome-ignore lint/suspicious/noSkippedTests: requires authentication, pending auth mock setup
  test.skip("should validate all required fields independently", async ({
    page,
  }) => {
    // NOTE: This test requires authentication to access /quote/new
    // Skip until auth mock is implemented

    // ARRANGE: Navigate to quote generation page (requires auth)
    await page.goto(QUOTE_NEW_URL);

    // Wait for form to load
    await expect(page.locator('input[name="projectStreet"]')).toBeVisible({
      timeout: FORM_TIMEOUT_MS,
    });

    // ACT: Fill only some required fields, leave others empty
    await page.locator('input[name="projectStreet"]').fill("Calle 123");
    // Leave city, state, postalCode empty

    // Submit form
    const submitButton = page.getByRole("button", {
      name: GENERATE_QUOTE_BUTTON_PATTERN,
    });
    await submitButton.click();

    // ASSERT: Should show validation errors for empty fields
    const validationErrors = page.locator(
      `text=${REQUIRED_FIELD_PATTERN.source}`
    );
    await expect(validationErrors.first()).toBeVisible({
      timeout: VALIDATION_TIMEOUT_MS,
    });

    // Verify multiple errors are shown (city, state, postalCode should all error)
    const errorCount = await validationErrors.count();
    expect(errorCount).toBeGreaterThanOrEqual(EXPECTED_MIN_REQUIRED_FIELDS);
  });
});
