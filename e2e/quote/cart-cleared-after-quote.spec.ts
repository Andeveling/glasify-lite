/**
 * E2E Test: Cart Cleared After Quote Generation (User Story 4 - T064)
 *
 * Tests that cart is properly emptied after successful quote generation:
 * 1. Add items to cart
 * 2. Generate quote successfully
 * 3. Verify cart is cleared in sessionStorage
 * 4. Verify empty cart UI state
 *
 * @module e2e/quote/cart-cleared-after-quote
 */

import { expect, test } from "@playwright/test";

// ============================================================================
// Constants
// ============================================================================

const CATALOG_URL = "/catalog";
const CART_URL = "/cart";
const QUOTE_NEW_URL = "/quote/new";

// Test data constants
const DEFAULT_WIDTH_MM = 1000;
const DEFAULT_HEIGHT_MM = 1500;
const SECONDARY_WIDTH_MM = 800;
const SECONDARY_HEIGHT_MM = 1200;
const PRICE_CALCULATION_DELAY_MS = 1000;
const TOAST_TIMEOUT_MS = 5000;
const FORM_TIMEOUT_MS = 5000;
const SUCCESS_TIMEOUT_MS = 10_000;
const EXPECTED_CART_ITEMS_COUNT = 2;

// Regex patterns (defined at top level for performance)
const MODEL_DETAIL_URL_PATTERN = /\/catalog\/[^/]+/;
const QUOTE_DETAIL_URL_PATTERN = /\/quotes\/[^/]+/;
const ADDED_TO_CART_PATTERN = /agregado al carrito/i;
const ADD_TO_CART_BUTTON_PATTERN = /agregar al carrito/i;
const GENERATE_QUOTE_BUTTON_PATTERN = /generar cotización/i;
const QUOTE_CREATED_PATTERN = /cotización creada/i;
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

/**
 * Fill quote generation form with project details
 */
async function fillQuoteForm(
  page: any,
  data = {
    city: "Bogotá",
    phone: "+57 300 123 4567",
    postalCode: "110111",
    projectName: "Proyecto Test Cart Clearing",
    state: "Cundinamarca",
    street: "Calle 123 #45-67",
  }
) {
  // Fill project name (optional)
  if (data.projectName) {
    const projectNameInput = page.locator('input[name="projectName"]');
    if (await projectNameInput.isVisible()) {
      await projectNameInput.fill(data.projectName);
    }
  }

  // Fill street (required)
  await page.locator('input[name="projectStreet"]').fill(data.street);

  // Fill city (required)
  await page.locator('input[name="projectCity"]').fill(data.city);

  // Fill state (required)
  await page.locator('input[name="projectState"]').fill(data.state);

  // Fill postal code (required)
  await page.locator('input[name="projectPostalCode"]').fill(data.postalCode);

  // Fill phone (optional)
  if (data.phone) {
    const phoneInput = page.locator('input[name="contactPhone"]');
    if (await phoneInput.isVisible()) {
      await phoneInput.fill(data.phone);
    }
  }
}

// ============================================================================
// Cart Clearing Tests
// ============================================================================

test.describe("Cart Cleared After Quote (US4-T064)", () => {
  test.beforeEach(async ({ page }) => {
    // Clear sessionStorage before each test
    await page.goto(CATALOG_URL);
    await page.evaluate(() => sessionStorage.clear());
  });

  test("should verify cart items persist before quote generation", async ({
    page,
  }) => {
    // ARRANGE: Add items to cart
    await addItemToCart(page, DEFAULT_WIDTH_MM, DEFAULT_HEIGHT_MM);
    await addItemToCart(page, SECONDARY_WIDTH_MM, SECONDARY_HEIGHT_MM);

    // Navigate to cart
    await page.goto(CART_URL);

    // ASSERT: Verify items are in cart
    const cartItems = await page.locator('[data-testid="cart-item"]').count();
    expect(cartItems).toBe(EXPECTED_CART_ITEMS_COUNT);

    // ASSERT: Verify sessionStorage contains cart data
    const sessionCartData = await page.evaluate(() =>
      sessionStorage.getItem("glasify-cart")
    );
    expect(sessionCartData).toBeTruthy();

    const cartData = JSON.parse(sessionCartData || "{}");
    expect(cartData.items).toBeDefined();
    expect(Array.isArray(cartData.items)).toBe(true);
    expect(cartData.items.length).toBe(EXPECTED_CART_ITEMS_COUNT);
  });

  // biome-ignore lint/suspicious/noSkippedTests: requires authentication to complete quote flow, pending auth mock setup
  test.skip("should clear cart after successful quote generation", async ({
    page,
  }) => {
    // NOTE: This test requires authentication to complete the full quote flow
    // Skip until auth mock is implemented

    // ARRANGE: Add items to cart
    await addItemToCart(page, DEFAULT_WIDTH_MM, DEFAULT_HEIGHT_MM);
    await addItemToCart(page, SECONDARY_WIDTH_MM, SECONDARY_HEIGHT_MM);

    // Verify cart has items
    await page.goto(CART_URL);
    const initialCartItems = await page
      .locator('[data-testid="cart-item"]')
      .count();
    expect(initialCartItems).toBe(EXPECTED_CART_ITEMS_COUNT);

    // Navigate to quote generation
    await page.goto(QUOTE_NEW_URL);

    // Wait for form to load
    await expect(page.locator('input[name="projectStreet"]')).toBeVisible({
      timeout: FORM_TIMEOUT_MS,
    });

    // ACT: Fill and submit quote form
    await fillQuoteForm(page);

    const submitButton = page.getByRole("button", {
      name: GENERATE_QUOTE_BUTTON_PATTERN,
    });
    await submitButton.click();

    // Wait for success toast
    await expect(
      page.locator(`text=${QUOTE_CREATED_PATTERN.source}`)
    ).toBeVisible({ timeout: SUCCESS_TIMEOUT_MS });

    // Wait for redirect to quote detail page
    await page.waitForURL(QUOTE_DETAIL_URL_PATTERN, {
      timeout: SUCCESS_TIMEOUT_MS,
    });

    // ASSERT: Navigate to cart and verify it's empty
    await page.goto(CART_URL);

    // Check empty cart UI state
    const emptyCartState = page.locator('[data-testid="empty-cart-state"]');
    const emptyCartMessage = page.locator(
      `text=${EMPTY_CART_MESSAGE_PATTERN.source}`
    );

    const hasEmptyState = await emptyCartState.isVisible().catch(() => false);
    const hasEmptyMessage = await emptyCartMessage
      .isVisible()
      .catch(() => false);

    expect(hasEmptyState || hasEmptyMessage).toBe(true);

    // ASSERT: Verify sessionStorage is cleared
    const sessionCartData = await page.evaluate(() =>
      sessionStorage.getItem("glasify-cart")
    );

    if (sessionCartData) {
      const cartData = JSON.parse(sessionCartData);
      // Cart should either be null or have empty items array
      expect(!cartData.items || cartData.items.length === 0).toBe(true);
    } else {
      // sessionStorage key is removed entirely (also valid)
      expect(sessionCartData).toBeNull();
    }
  });

  test("should show empty cart state when navigating to /cart after clearing", async ({
    page,
  }) => {
    // ARRANGE: Start with empty cart
    await page.goto(CATALOG_URL);

    // Manually clear any cart data
    await page.evaluate(() => {
      sessionStorage.removeItem("glasify-cart");
    });

    // ACT: Navigate to cart
    await page.goto(CART_URL);

    // ASSERT: Empty cart state should be visible
    const emptyCartState = page.locator('[data-testid="empty-cart-state"]');
    const emptyCartMessage = page.locator(
      `text=${EMPTY_CART_MESSAGE_PATTERN.source}`
    );

    const hasEmptyState = await emptyCartState.isVisible().catch(() => false);
    const hasEmptyMessage = await emptyCartMessage
      .isVisible()
      .catch(() => false);

    expect(hasEmptyState || hasEmptyMessage).toBe(true);

    // ASSERT: "Generate Quote" button should not be visible (no items)
    const generateQuoteButton = page.getByRole("button", {
      name: GENERATE_QUOTE_BUTTON_PATTERN,
    });
    const isGenerateButtonVisible = await generateQuoteButton
      .isVisible()
      .catch(() => false);

    expect(isGenerateButtonVisible).toBe(false);
  });

  // biome-ignore lint/suspicious/noSkippedTests: requires authentication to complete quote flow, pending auth mock setup
  test.skip("should prevent accessing /quote/new after cart is cleared", async ({
    page,
  }) => {
    // NOTE: This test requires authentication
    // Skip until auth mock is implemented

    // ARRANGE: Manually clear cart
    await page.goto(CATALOG_URL);
    await page.evaluate(() => {
      sessionStorage.removeItem("glasify-cart");
    });

    // ACT: Try to access quote generation page with cleared cart
    await page.goto(QUOTE_NEW_URL);

    // Wait for redirects
    await page.waitForLoadState("networkidle");

    // ASSERT: Should redirect to catalog (empty cart not allowed)
    const currentUrl = page.url();
    const isOnCatalog = currentUrl.includes(CATALOG_URL);
    const isOnSignIn =
      currentUrl.includes("/signin") || currentUrl.includes("/api/auth/signin");

    // Either on catalog (direct redirect) or sign-in (will redirect after auth)
    expect(isOnCatalog || isOnSignIn).toBe(true);
  });
});
