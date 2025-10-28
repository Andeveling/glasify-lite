/**
 * E2E Tests: Add to Cart Flow (User Story 1)
 *
 * Tests the complete add-to-cart flow:
 * - Browse catalog
 * - Configure model (dimensions, glass type, services)
 * - Click "Agregar al carrito"
 * - Verify item appears in cart with auto-generated name
 * - Verify cart badge updates in real-time
 *
 * @module e2e/cart/add-to-cart
 */

import { expect, test } from "@playwright/test";

// ============================================================================
// Constants
// ============================================================================

const CATALOG_URL = "/catalog";
const CART_URL = "/cart";
const MAX_CART_ITEMS = 20;
const NAME_SEQUENCE_PADDING = 3;

// Regex patterns
const MODEL_DETAIL_URL_PATTERN = /\/catalog\/[^/]+/;
const ADD_TO_CART_BUTTON_PATTERN = /Agregar al carrito/i;
const ADDED_TO_CART_MESSAGE_PATTERN = /agregado al carrito/i;
const PRICE_CALCULATED_PATTERN = /Precio calculado|Precio base estimado/;
const AUTO_GENERATED_NAME_PATTERN = /^[A-Z]+-001$/;
const CART_LIMIT_ERROR_PATTERN = /límite.*20.*items/i;

// ============================================================================
// Tests
// ============================================================================

test.describe("Add to Cart Flow (US1)", () => {
  test.beforeEach(async ({ page }) => {
    // Clear sessionStorage before each test
    await page.goto(CATALOG_URL);
    await page.evaluate(() => sessionStorage.clear());
  });

  test("should show cart badge with 0 items initially", async ({ page }) => {
    await page.goto(CATALOG_URL);

    // Wait for navbar to load
    const cartIndicator = page.locator('a[href="/cart"]');
    await expect(cartIndicator).toBeVisible();

    // Badge should not be visible when cart is empty
    const badge = cartIndicator.locator("output");
    await expect(badge).not.toBeVisible();
  });

  test("should complete full flow: catalog → configure → add to cart → verify badge", async ({
    page,
  }) => {
    // Step 1: Navigate to catalog
    await page.goto(CATALOG_URL);

    // Step 2: Find and click on first model card
    const firstModelCard = page.locator('[data-testid="model-card"]').first();
    await expect(firstModelCard).toBeVisible();
    await firstModelCard.click();

    // Wait for model detail page to load
    await page.waitForURL(MODEL_DETAIL_URL_PATTERN);

    // Step 3: Configure model
    // The form should have default values pre-populated

    // Wait for glass type selector to be visible
    const glassTypeRadio = page.locator('input[name="glassType"]').first();
    await expect(glassTypeRadio).toBeVisible();

    // Ensure glass type is selected (should be pre-selected)
    if (!(await glassTypeRadio.isChecked())) {
      await glassTypeRadio.click();
    }

    // Wait for dimensions to be visible and valid
    const widthInput = page.locator('input[name="width"]');
    const heightInput = page.locator('input[name="height"]');
    await expect(widthInput).toBeVisible();
    await expect(heightInput).toBeVisible();

    // Inputs should have default values, verify they're not empty
    const widthValue = await widthInput.inputValue();
    const heightValue = await heightInput.inputValue();
    expect(Number.parseInt(widthValue, 10)).toBeGreaterThan(0);
    expect(Number.parseInt(heightValue, 10)).toBeGreaterThan(0);

    // Step 4: Wait for price calculation
    await page.waitForSelector(`text=${PRICE_CALCULATED_PATTERN}`, {
      timeout: 10_000,
    });

    // Step 5: Click "Agregar al carrito" button
    const addToCartButton = page.getByRole("button", {
      name: ADD_TO_CART_BUTTON_PATTERN,
    });
    await expect(addToCartButton).toBeVisible();
    await expect(addToCartButton).toBeEnabled();
    await addToCartButton.click();

    // Step 6: Verify success message
    await expect(
      page.locator(`text=${ADDED_TO_CART_MESSAGE_PATTERN}`)
    ).toBeVisible({ timeout: 5000 });

    // Step 7: Verify cart badge updates
    const cartBadge = page.locator('a[href="/cart"] output');
    await expect(cartBadge).toBeVisible();
    await expect(cartBadge).toHaveText("1");

    // Step 8: Navigate to cart and verify item
    await page.goto(CART_URL);

    // Verify cart is not empty
    await expect(page.locator('[data-testid^="cart-item-"]')).toHaveCount(1);

    // Verify auto-generated name matches pattern (MODEL_PREFIX-001)
    const itemName = page.locator('[data-testid="cart-item-name"]').first();
    await expect(itemName).toBeVisible();
    const nameText = await itemName.inputValue();
    expect(nameText).toMatch(AUTO_GENERATED_NAME_PATTERN);
  });

  test("should add multiple items and update badge correctly", async ({
    page,
  }) => {
    // Add first item
    await page.goto(CATALOG_URL);
    const firstModel = page.locator('[data-testid="model-card"]').first();
    await firstModel.click();
    await page.waitForURL(MODEL_DETAIL_URL_PATTERN);

    // Wait for form to be ready
    await page.waitForSelector('input[name="glassType"]:checked', {
      timeout: 5000,
    });
    await page.waitForSelector(`text=${PRICE_CALCULATED_PATTERN}`, {
      timeout: 10_000,
    });

    const addButton = page.getByRole("button", {
      name: ADD_TO_CART_BUTTON_PATTERN,
    });
    await expect(addButton).toBeEnabled();
    await addButton.click();

    // Wait for success message
    await expect(
      page.locator(`text=${ADDED_TO_CART_MESSAGE_PATTERN}`)
    ).toBeVisible({ timeout: 5000 });

    // Verify badge shows 1
    let cartBadge = page.locator('a[href="/cart"] output');
    await expect(cartBadge).toHaveText("1");

    // Go back to catalog
    await page.goto(CATALOG_URL);

    // Add second item (different model if possible)
    const allModels = page.locator('[data-testid="model-card"]');
    const modelCount = await allModels.count();

    if (modelCount > 1) {
      // Click on second model
      await allModels.nth(1).click();
    } else {
      // Click on first model again (will create duplicate with different config)
      await allModels.first().click();
    }

    await page.waitForURL(MODEL_DETAIL_URL_PATTERN);
    await page.waitForSelector('input[name="glassType"]:checked', {
      timeout: 5000,
    });
    await page.waitForSelector(`text=${PRICE_CALCULATED_PATTERN}`, {
      timeout: 10_000,
    });

    await page
      .getByRole("button", { name: ADD_TO_CART_BUTTON_PATTERN })
      .click();
    await expect(
      page.locator(`text=${ADDED_TO_CART_MESSAGE_PATTERN}`)
    ).toBeVisible({ timeout: 5000 });

    // Verify badge shows 2
    cartBadge = page.locator('a[href="/cart"] output');
    await expect(cartBadge).toHaveText("2");

    // Navigate to cart and verify both items
    await page.goto(CART_URL);
    await expect(page.locator('[data-testid^="cart-item-"]')).toHaveCount(2);
  });

  test("should show error when form is invalid", async ({ page }) => {
    await page.goto(CATALOG_URL);

    // Click on first model
    const firstModel = page.locator('[data-testid="model-card"]').first();
    await firstModel.click();
    await page.waitForURL(MODEL_DETAIL_URL_PATTERN);

    // Clear width input to make form invalid
    const widthInput = page.locator('input[name="width"]');
    await widthInput.clear();

    // Try to add to cart
    const addButton = page.getByRole("button", {
      name: ADD_TO_CART_BUTTON_PATTERN,
    });

    // Button should be disabled or show error
    const isDisabled = await addButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test("should persist cart items in sessionStorage", async ({ page }) => {
    // Add item to cart
    await page.goto(CATALOG_URL);
    const firstModel = page.locator('[data-testid="model-card"]').first();
    await firstModel.click();
    await page.waitForURL(MODEL_DETAIL_URL_PATTERN);

    await page.waitForSelector('input[name="glassType"]:checked', {
      timeout: 5000,
    });
    await page.waitForSelector(`text=${PRICE_CALCULATED_PATTERN}`, {
      timeout: 10_000,
    });

    await page
      .getByRole("button", { name: ADD_TO_CART_BUTTON_PATTERN })
      .click();
    await expect(
      page.locator(`text=${ADDED_TO_CART_MESSAGE_PATTERN}`)
    ).toBeVisible({ timeout: 5000 });

    // Verify sessionStorage contains cart data
    const cartData = await page.evaluate(() => {
      const data = sessionStorage.getItem("glasify_cart");
      return data ? JSON.parse(data) : null;
    });

    expect(cartData).toBeTruthy();
    expect(cartData.items).toHaveLength(1);
    expect(cartData.items[0]).toHaveProperty("id");
    expect(cartData.items[0]).toHaveProperty("name");
    expect(cartData.items[0]).toHaveProperty("modelId");
    expect(cartData.items[0]).toHaveProperty("unitPrice");
    expect(cartData.items[0].name).toMatch(AUTO_GENERATED_NAME_PATTERN);

    // Reload page and verify cart persists
    await page.reload();

    const cartBadge = page.locator('a[href="/cart"] output');
    await expect(cartBadge).toHaveText("1");
  });

  test("should handle cart limit (max 20 items)", async ({ page }) => {
    // Inject 20 items directly to test limit
    await page.goto(CATALOG_URL);

    await page.evaluate(
      ({ maxItems, padding }) => {
        const items: Array<{
          id: string;
          modelId: string;
          modelName: string;
          glassTypeId: string;
          glassTypeName: string;
          widthMm: number;
          heightMm: number;
          quantity: number;
          unitPrice: number;
          subtotal: number;
          additionalServiceIds: string[];
          name: string;
          createdAt: string;
          dimensions: { widthMm: number; heightMm: number };
        }> = [];
        for (let i = 1; i <= maxItems; i++) {
          items.push({
            additionalServiceIds: [],
            createdAt: new Date().toISOString(),
            dimensions: {
              heightMm: 1500,
              widthMm: 1200,
            },
            glassTypeId: "glass-test",
            glassTypeName: "Templado",
            heightMm: 1500,
            id: `test-item-${i}`,
            modelId: "model-test",
            modelName: "Test Model",
            name: `TEST-${String(i).padStart(padding, "0")}`,
            quantity: 1,
            subtotal: 10_000,
            unitPrice: 10_000,
            widthMm: 1200,
          });
        }

        const cartData = {
          items,
          lastModified: new Date().toISOString(),
          version: 1,
        };

        sessionStorage.setItem("glasify_cart", JSON.stringify(cartData));
      },
      { maxItems: MAX_CART_ITEMS, padding: NAME_SEQUENCE_PADDING }
    );

    // Reload to trigger cart hydration
    await page.reload();

    // Verify badge shows 20
    const cartBadge = page.locator('a[href="/cart"] output');
    await expect(cartBadge).toHaveText("20");

    // Try to add another item
    const firstModel = page.locator('[data-testid="model-card"]').first();
    await firstModel.click();
    await page.waitForURL(MODEL_DETAIL_URL_PATTERN);

    await page.waitForSelector('input[name="glassType"]:checked', {
      timeout: 5000,
    });
    await page.waitForSelector(`text=${PRICE_CALCULATED_PATTERN}`, {
      timeout: 10_000,
    });

    await page
      .getByRole("button", { name: ADD_TO_CART_BUTTON_PATTERN })
      .click();

    // Should show error message about cart limit
    await expect(page.locator(`text=${CART_LIMIT_ERROR_PATTERN}`)).toBeVisible({
      timeout: 5000,
    });

    // Badge should still show 20
    await expect(cartBadge).toHaveText("20");
  });
});
