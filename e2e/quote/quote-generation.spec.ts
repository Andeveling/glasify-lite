/**
 * E2E Test: Quote Generation Flow (User Story 4)
 *
 * Tests the complete quote generation flow:
 * 1. Authenticate (or use authenticated session)
 * 2. Add items to cart
 * 3. Navigate to /quote/new
 * 4. Fill project address form
 * 5. Generate quote
 * 6. Verify redirect to quote detail
 * 7. Verify cart is cleared
 *
 * @module e2e/quote/quote-generation
 */

import { expect, test } from '@playwright/test';

// ============================================================================
// Constants
// ============================================================================

const CATALOG_URL = '/catalog';
const CART_URL = '/cart';
const QUOTE_NEW_URL = '/quote/new';

// Test data constants
const DEFAULT_WIDTH_MM = 1000;
const DEFAULT_HEIGHT_MM = 1500;
const SECONDARY_WIDTH_MM = 800;
const SECONDARY_HEIGHT_MM = 1200;
const PRICE_CALCULATION_DELAY_MS = 1000;
const NAVIGATION_DELAY_MS = 2000;
const MAX_STRING_LENGTH_TEST = 250;
const TOAST_TIMEOUT_MS = 5000;
const FORM_TIMEOUT_MS = 5000;
const SUCCESS_TIMEOUT_MS = 10_000;
const VALIDATION_TIMEOUT_MS = 3000;

// Regex patterns (defined at top level for performance)
const MODEL_DETAIL_URL_PATTERN = /\/catalog\/[^/]+/;
const QUOTE_DETAIL_URL_PATTERN = /\/quotes\/[^/]+/;
const SIGNIN_URL_PATTERN = /\/signin|\/api\/auth\/signin/;
const SIGNIN_OR_QUOTE_URL_PATTERN = /\/signin|\/quote\/new/;
const SIGNIN_OR_QUOTE_OR_API_URL_PATTERN = /\/signin|\/quote\/new|\/api\/auth\/signin/;
const ADDED_TO_CART_PATTERN = /agregado al carrito/i;
const ADD_TO_CART_BUTTON_PATTERN = /agregar al carrito/i;
const QUOTE_CREATED_PATTERN = /cotización creada/i;
const GENERATE_QUOTE_BUTTON_PATTERN = /generar cotización/i;

// Form validation patterns
const REQUIRED_FIELD_PATTERN = /requerido/i;
const FIELD_TOO_LONG_PATTERN = /muy larg/i;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Add a configured model to cart
 */
async function addItemToCart(page: any, widthMm = 1000, heightMm = 1500) {
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
  const heightInput = page.locator('input[name="heightMm"], input[name="height"]');

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
  const addToCartButton = page.getByRole('button', { name: ADD_TO_CART_BUTTON_PATTERN });
  await expect(addToCartButton).toBeVisible();
  await expect(addToCartButton).toBeEnabled();
  await addToCartButton.click();

  // Wait for success toast
  await expect(page.locator(`text=${ADDED_TO_CART_PATTERN.source}`)).toBeVisible({ timeout: TOAST_TIMEOUT_MS });
}

/**
 * Fill quote generation form with project details
 */
async function fillQuoteForm(
  page: any,
  data = {
    city: 'Bogotá',
    phone: '+57 300 123 4567',
    postalCode: '110111',
    projectName: 'Proyecto Test E2E',
    state: 'Cundinamarca',
    street: 'Calle 123 #45-67',
  }
) {
  // Fill project name (optional)
  if (data.projectName) {
    await page.locator('input[name="projectName"]').fill(data.projectName);
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
    await page.locator('input[name="contactPhone"]').fill(data.phone);
  }
}

// ============================================================================
// Tests
// ============================================================================

test.describe('Quote Generation Flow (US4)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear sessionStorage before each test
    await page.goto(CATALOG_URL);
    await page.evaluate(() => sessionStorage.clear());
  });

  // biome-ignore lint/suspicious/noSkippedTests: requires real Google OAuth setup, pending auth mock implementation
  test.skip('should complete full flow: add items → authenticate → fill form → generate quote → verify redirect', async ({
    page,
  }) => {
    // NOTE: This test is skipped because it requires actual Google OAuth authentication
    // To run this test, you need to:
    // 1. Set up a test Google account
    // 2. Configure authentication in the test setup
    // 3. Use Playwright's authentication state persistence
    //
    // For now, we test individual parts of the flow in separate tests

    // STEP 1: Add items to cart (unauthenticated)
    await addItemToCart(page, DEFAULT_WIDTH_MM, DEFAULT_HEIGHT_MM);

    // STEP 2: Navigate to cart and click "Generate Quote"
    await page.goto(CART_URL);
    const generateQuoteButton = page.getByRole('button', { name: GENERATE_QUOTE_BUTTON_PATTERN });
    await generateQuoteButton.click();

    // STEP 3: Should redirect to sign-in (if not authenticated)
    await page.waitForURL(SIGNIN_OR_QUOTE_URL_PATTERN);

    // If redirected to sign-in, complete OAuth flow
    if (page.url().includes('/signin')) {
      // TODO: Implement OAuth flow with test credentials
      // For now, we skip this part
      return;
    }

    // STEP 4: Fill quote form
    await fillQuoteForm(page);

    // STEP 5: Submit form
    const submitButton = page.getByRole('button', { name: GENERATE_QUOTE_BUTTON_PATTERN });
    await submitButton.click();

    // STEP 6: Wait for success toast
    await expect(page.locator(`text=${QUOTE_CREATED_PATTERN.source}`)).toBeVisible({ timeout: SUCCESS_TIMEOUT_MS });

    // STEP 7: Verify redirect to quote detail page
    await page.waitForURL(QUOTE_DETAIL_URL_PATTERN, { timeout: SUCCESS_TIMEOUT_MS });

    // STEP 8: Verify cart is cleared
    await page.goto(CART_URL);
    await expect(page.locator('[data-testid="empty-cart-state"]')).toBeVisible();
  });

  test('should redirect unauthenticated user to sign-in when accessing /quote/new', async ({ page }) => {
    // ACT: Try to access quote generation page without authentication
    await page.goto(QUOTE_NEW_URL);

    // ASSERT: Should redirect to sign-in with callbackUrl
    await page.waitForURL(SIGNIN_URL_PATTERN);
    const url = new URL(page.url());

    // Verify callbackUrl is set
    const callbackUrl = url.searchParams.get('callbackUrl');
    expect(callbackUrl).toBe(QUOTE_NEW_URL);
  });

  test('should redirect to catalog if cart is empty when accessing /quote/new', async ({ page }) => {
    // NOTE: This test assumes we can access /quote/new directly (authenticated)
    // If authentication is required, this will fail

    // ARRANGE: Start with empty cart
    await page.goto(CATALOG_URL);
    await page.evaluate(() => sessionStorage.clear());

    // ACT: Try to access quote generation page with empty cart
    // (This will first redirect to sign-in if not authenticated)
    await page.goto(QUOTE_NEW_URL);

    // WAIT: Allow redirects to complete
    await page.waitForTimeout(NAVIGATION_DELAY_MS);

    // ASSERT: Should eventually redirect to catalog
    // Either directly (if authenticated) or after sign-in
    const currentUrl = page.url();
    const isOnCatalog = currentUrl.includes(CATALOG_URL);

    expect(isOnCatalog).toBe(true);
  });

  test('should preserve cart items during quote generation navigation', async ({ page }) => {
    // ARRANGE: Add items to cart
    await addItemToCart(page, DEFAULT_WIDTH_MM, DEFAULT_HEIGHT_MM);
    await addItemToCart(page, SECONDARY_WIDTH_MM, SECONDARY_HEIGHT_MM);

    // Navigate to cart
    await page.goto(CART_URL);

    // Verify 2 items in cart
    const cartItemsCount = await page.locator('[data-testid="cart-item"]').count();
    expect(cartItemsCount).toBe(2);

    // ACT: Click "Generate Quote" button
    const generateQuoteButton = page.getByRole('button', { name: GENERATE_QUOTE_BUTTON_PATTERN });
    await generateQuoteButton.click();

    // Wait for navigation (either sign-in or quote form)
    await page.waitForURL(SIGNIN_OR_QUOTE_OR_API_URL_PATTERN);

    // If on sign-in, navigate back to cart to verify persistence
    if (page.url().includes('/signin') || page.url().includes('/api/auth/signin')) {
      await page.goto(CART_URL);
    }

    // ASSERT: Cart items should still be there (sessionStorage preserved)
    const cartItemsAfterNav = await page.locator('[data-testid="cart-item"]').count();
    expect(cartItemsAfterNav).toBe(2);
  });
});

// ============================================================================
// Form Validation Tests
// ============================================================================

test.describe('Quote Form Validation (US4)', () => {
  test.beforeEach(async ({ page }) => {
    // Add item to cart first
    await page.goto(CATALOG_URL);
    await page.evaluate(() => sessionStorage.clear());
  });

  // biome-ignore lint/suspicious/noSkippedTests: requires authentication to test validation, pending auth mock setup
  test.skip('should show validation errors for empty required fields', async ({ page }) => {
    // NOTE: Skipped because requires authentication
    // To test this, authenticate first, then:

    // ARRANGE: Add item to cart
    await addItemToCart(page);

    // Navigate to quote generation
    await page.goto(QUOTE_NEW_URL);

    // Wait for form to load
    await expect(page.locator('input[name="projectStreet"]')).toBeVisible({ timeout: FORM_TIMEOUT_MS });

    // ACT: Submit form without filling required fields
    const submitButton = page.getByRole('button', { name: GENERATE_QUOTE_BUTTON_PATTERN });
    await submitButton.click();

    // ASSERT: Should show validation errors
    await expect(page.locator(`text=${REQUIRED_FIELD_PATTERN.source}`)).toBeVisible();
  });

  // biome-ignore lint/suspicious/noSkippedTests: requires authentication to test validation, pending auth mock setup
  test.skip('should show validation errors for fields exceeding max length', async ({ page }) => {
    // NOTE: Skipped because requires authentication

    // ARRANGE: Add item to cart
    await addItemToCart(page);

    // Navigate to quote generation
    await page.goto(QUOTE_NEW_URL);

    // Wait for form to load
    await expect(page.locator('input[name="projectStreet"]')).toBeVisible({ timeout: FORM_TIMEOUT_MS });

    // ACT: Fill street with very long string
    const longString = 'A'.repeat(MAX_STRING_LENGTH_TEST); // Exceeds MAX_PROJECT_ADDRESS_LENGTH (200)
    await page.locator('input[name="projectStreet"]').fill(longString);

    // Blur to trigger validation
    await page.locator('input[name="projectCity"]').focus();

    // ASSERT: Should show "muy largo" error
    await expect(page.locator(`text=${FIELD_TOO_LONG_PATTERN.source}`)).toBeVisible({ timeout: VALIDATION_TIMEOUT_MS });
  });
});
