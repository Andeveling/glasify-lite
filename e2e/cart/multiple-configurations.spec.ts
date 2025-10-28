/**
 * E2E Tests: Multiple Configurations (User Story 1)
 *
 * Tests adding the same model multiple times with different configurations
 * and verifies sequential auto-generated names (MODEL-001, MODEL-002, etc.)
 *
 * @module e2e/cart/multiple-configurations
 */

import { expect, type Page, test } from "@playwright/test";

// ============================================================================
// Constants
// ============================================================================

const CATALOG_URL = "/catalog";
const CART_URL = "/cart";
const DEFAULT_TIMEOUT = 10_000;
const MESSAGE_TIMEOUT = 5000;
const EXPECTED_ITEM_COUNT_THREE = 3;
const EXPECTED_ITEM_COUNT_FOUR = 4;

// Regex patterns
const MODEL_DETAIL_URL_PATTERN = /\/catalog\/[^/]+/;
const ADD_TO_CART_BUTTON_PATTERN = /Agregar al carrito/i;
const ADDED_TO_CART_MESSAGE_PATTERN = /agregado al carrito/i;
const PRICE_CALCULATED_PATTERN = /Precio calculado|Precio base estimado/;

// Sequential name patterns
const FIRST_ITEM_NAME_PATTERN = /^[A-Z]+-001$/;
const SECOND_ITEM_NAME_PATTERN = /^[A-Z]+-002$/;
const THIRD_ITEM_NAME_PATTERN = /^[A-Z]+-003$/;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Configure and add item to cart from model detail page
 */
async function addConfiguredItem(
  page: Page,
  config: {
    width?: number;
    height?: number;
    glassTypeIndex?: number;
  } = {}
) {
  // Wait for form to be ready
  await page.waitForSelector('input[name="glassType"]', {
    timeout: DEFAULT_TIMEOUT,
  });

  // Select glass type if specified
  if (config.glassTypeIndex !== undefined) {
    const glassTypes = page.locator('input[name="glassType"]');
    const count = await glassTypes.count();
    if (config.glassTypeIndex < count) {
      await glassTypes.nth(config.glassTypeIndex).click();
    }
  } else {
    // Ensure at least one glass type is selected
    const firstGlassType = page.locator('input[name="glassType"]').first();
    if (!(await firstGlassType.isChecked())) {
      await firstGlassType.click();
    }
  }

  // Set dimensions if specified
  if (config.width !== undefined) {
    const widthInput = page.locator('input[name="width"]');
    await widthInput.clear();
    await widthInput.fill(String(config.width));
  }

  if (config.height !== undefined) {
    const heightInput = page.locator('input[name="height"]');
    await heightInput.clear();
    await heightInput.fill(String(config.height));
  }

  // Wait for price calculation
  await page.waitForSelector(`text=${PRICE_CALCULATED_PATTERN}`, {
    timeout: DEFAULT_TIMEOUT,
  });

  // Click add to cart
  const addButton = page.getByRole("button", {
    name: ADD_TO_CART_BUTTON_PATTERN,
  });
  await expect(addButton).toBeEnabled();
  await addButton.click();

  // Wait for success message
  await expect(
    page.locator(`text=${ADDED_TO_CART_MESSAGE_PATTERN}`)
  ).toBeVisible({ timeout: MESSAGE_TIMEOUT });
}

// ============================================================================
// Tests
// ============================================================================

test.describe("Multiple Configurations (US1)", () => {
  test.beforeEach(async ({ page }) => {
    // Clear sessionStorage before each test
    await page.goto(CATALOG_URL);
    await page.evaluate(() => sessionStorage.clear());
  });

  test("should add same model twice with different dimensions - sequential names", async ({
    page,
  }) => {
    await page.goto(CATALOG_URL);

    // Select first model
    const firstModel = page.locator('[data-testid="model-card"]').first();
    await firstModel.click();
    await page.waitForURL(MODEL_DETAIL_URL_PATTERN);

    // Add first configuration (default dimensions)
    await addConfiguredItem(page);

    // Verify badge shows 1
    let cartBadge = page.locator('a[href="/cart"] output');
    await expect(cartBadge).toHaveText("1");

    // Go back to same model
    await page.goto(CATALOG_URL);
    await page.locator('[data-testid="model-card"]').first().click();
    await page.waitForURL(MODEL_DETAIL_URL_PATTERN);

    // Add second configuration (different dimensions)
    await addConfiguredItem(page, { height: 1800, width: 1500 });

    // Verify badge shows 2
    cartBadge = page.locator('a[href="/cart"] output');
    await expect(cartBadge).toHaveText("2");

    // Navigate to cart
    await page.goto(CART_URL);

    // Verify both items exist
    await expect(page.locator('[data-testid^="cart-item-"]')).toHaveCount(2);

    // Verify sequential names
    const itemNames = page.locator('[data-testid="cart-item-name"]');
    const firstName = await itemNames.first().inputValue();
    const secondName = await itemNames.nth(1).inputValue();

    expect(firstName).toMatch(FIRST_ITEM_NAME_PATTERN);
    expect(secondName).toMatch(SECOND_ITEM_NAME_PATTERN);

    // Verify both names have same prefix (same model)
    const firstPrefix = firstName.split("-")[0];
    const secondPrefix = secondName.split("-")[0];
    expect(firstPrefix).toBe(secondPrefix);
  });

  test("should add same model three times with different glass types - sequential names", async ({
    page,
  }) => {
    await page.goto(CATALOG_URL);

    // Select first model
    const firstModel = page.locator('[data-testid="model-card"]').first();
    await firstModel.click();
    await page.waitForURL(MODEL_DETAIL_URL_PATTERN);

    // Check if multiple glass types are available
    const glassTypes = page.locator('input[name="glassType"]');
    const glassTypeCount = await glassTypes.count();

    if (glassTypeCount < 2) {
      // Skip test if not enough glass types
      test.skip();
      return;
    }

    // Add first configuration (glass type 0)
    await addConfiguredItem(page, { glassTypeIndex: 0 });

    // Go back to same model
    await page.goto(CATALOG_URL);
    await page.locator('[data-testid="model-card"]').first().click();
    await page.waitForURL(MODEL_DETAIL_URL_PATTERN);

    // Add second configuration (glass type 1)
    await addConfiguredItem(page, { glassTypeIndex: 1 });

    // Go back to same model
    await page.goto(CATALOG_URL);
    await page.locator('[data-testid="model-card"]').first().click();
    await page.waitForURL(MODEL_DETAIL_URL_PATTERN);

    // Add third configuration (glass type 0 again, but different from previous)
    await addConfiguredItem(page, { glassTypeIndex: 0, width: 1600 });

    // Verify badge shows 3
    const cartBadge = page.locator('a[href="/cart"] output');
    await expect(cartBadge).toHaveText("3");

    // Navigate to cart
    await page.goto(CART_URL);

    // Verify all three items exist
    await expect(page.locator('[data-testid^="cart-item-"]')).toHaveCount(
      EXPECTED_ITEM_COUNT_THREE
    );

    // Verify sequential names
    const itemNames = page.locator('[data-testid="cart-item-name"]');
    const firstName = await itemNames.nth(0).inputValue();
    const secondName = await itemNames.nth(1).inputValue();
    const thirdName = await itemNames.nth(2).inputValue();

    expect(firstName).toMatch(FIRST_ITEM_NAME_PATTERN);
    expect(secondName).toMatch(SECOND_ITEM_NAME_PATTERN);
    expect(thirdName).toMatch(THIRD_ITEM_NAME_PATTERN);

    // Verify all names have same prefix
    const prefixes = [firstName, secondName, thirdName].map(
      (name) => name.split("-")[0]
    );
    expect(prefixes[0]).toBe(prefixes[1]);
    expect(prefixes[1]).toBe(prefixes[2]);
  });

  test("should handle mixed models - different name prefixes and sequences", async ({
    page,
  }) => {
    await page.goto(CATALOG_URL);

    // Get all available models
    const allModels = page.locator('[data-testid="model-card"]');
    const modelCount = await allModels.count();

    if (modelCount < 2) {
      // Skip test if not enough models
      test.skip();
      return;
    }

    // Add item from first model (should get PREFIX1-001)
    await allModels.first().click();
    await page.waitForURL(MODEL_DETAIL_URL_PATTERN);
    await addConfiguredItem(page);

    // Go back and add another item from first model (should get PREFIX1-002)
    await page.goto(CATALOG_URL);
    await allModels.first().click();
    await page.waitForURL(MODEL_DETAIL_URL_PATTERN);
    await addConfiguredItem(page, { width: 1500 });

    // Go back and add item from second model (should get PREFIX2-001)
    await page.goto(CATALOG_URL);
    await allModels.nth(1).click();
    await page.waitForURL(MODEL_DETAIL_URL_PATTERN);
    await addConfiguredItem(page);

    // Go back and add another item from first model (should get PREFIX1-003)
    await page.goto(CATALOG_URL);
    await allModels.first().click();
    await page.waitForURL(MODEL_DETAIL_URL_PATTERN);
    await addConfiguredItem(page, { height: 1800 });

    // Verify badge shows 4
    const cartBadge = page.locator('a[href="/cart"] output');
    await expect(cartBadge).toHaveText("4");

    // Navigate to cart
    await page.goto(CART_URL);

    // Verify all four items exist
    await expect(page.locator('[data-testid^="cart-item-"]')).toHaveCount(
      EXPECTED_ITEM_COUNT_FOUR
    );

    // Get all item names
    const itemNames = page.locator('[data-testid="cart-item-name"]');
    const names: string[] = [];
    for (let i = 0; i < EXPECTED_ITEM_COUNT_FOUR; i++) {
      const name = await itemNames.nth(i).inputValue();
      names.push(name);
    }

    // Extract prefixes and sequences
    const items = names.map((name) => {
      const [prefix, sequence] = name.split("-");
      return { prefix, sequence };
    });

    // Verify first model items have sequential numbers
    const firstModelPrefix = items[0].prefix;
    const firstModelItems = items.filter(
      (item) => item.prefix === firstModelPrefix
    );
    const firstModelSequences = firstModelItems.map((item) => item.sequence);

    expect(firstModelSequences).toContain("001");
    expect(firstModelSequences).toContain("002");
    expect(firstModelSequences).toContain("003");

    // Verify second model item has sequence 001
    const secondModelPrefix = items[2].prefix;
    expect(items[2].sequence).toBe("001");
    expect(secondModelPrefix).not.toBe(firstModelPrefix);
  });

  test("should persist sequential names after page reload", async ({
    page,
  }) => {
    await page.goto(CATALOG_URL);

    // Add two items from same model
    const firstModel = page.locator('[data-testid="model-card"]').first();
    await firstModel.click();
    await page.waitForURL(MODEL_DETAIL_URL_PATTERN);
    await addConfiguredItem(page);

    await page.goto(CATALOG_URL);
    await firstModel.click();
    await page.waitForURL(MODEL_DETAIL_URL_PATTERN);
    await addConfiguredItem(page, { width: 1600 });

    // Reload page
    await page.reload();

    // Verify badge still shows 2
    const cartBadge = page.locator('a[href="/cart"] output');
    await expect(cartBadge).toHaveText("2");

    // Navigate to cart
    await page.goto(CART_URL);

    // Verify names are still sequential
    const itemNames = page.locator('[data-testid="cart-item-name"]');
    const firstName = await itemNames.first().inputValue();
    const secondName = await itemNames.nth(1).inputValue();

    expect(firstName).toMatch(FIRST_ITEM_NAME_PATTERN);
    expect(secondName).toMatch(SECOND_ITEM_NAME_PATTERN);

    const firstPrefix = firstName.split("-")[0];
    const secondPrefix = secondName.split("-")[0];
    expect(firstPrefix).toBe(secondPrefix);
  });
});
