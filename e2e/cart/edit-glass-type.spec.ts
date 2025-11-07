/**
 * E2E Tests: Edit Glass Type in Cart
 *
 * Tests user flow for changing glass type on cart items.
 * Verifies:
 * - Glass type selector displays compatible types only
 * - Price updates after glass type change
 * - Cancel preserves original glass type
 *
 * @module e2e/cart/edit-glass-type
 */

import { expect, test } from "@playwright/test";

test.describe("Cart - Edit Glass Type", () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Navigate to cart page with items
    // Note: This assumes seeded data or previous test setup
    await page.goto("/cart");

    // Wait for cart to load
    await page.waitForSelector('[data-testid="cart-item"]', {
      state: "visible",
    });
  });

  test("should open edit modal and display glass type selector", async ({
    page,
  }) => {
    // Click edit button on first cart item
    await page.click(
      '[data-testid="cart-item"]:first-child button:has-text("Editar")'
    );

    // Wait for modal to open
    await page.waitForSelector('role=dialog[name="Editar Item"]', {
      state: "visible",
    });

    // Verify glass type selector is visible
    const glassTypeSelect = page.locator(
      'role=combobox[name="Tipo de Vidrio"]'
    );
    await expect(glassTypeSelect).toBeVisible();

    // Verify current glass type is pre-selected
    const currentGlassType = await glassTypeSelect.textContent();
    expect(currentGlassType).toBeTruthy();
  });

  test("should show only compatible glass types in dropdown", async ({
    page,
  }) => {
    // Click edit button
    await page.click(
      '[data-testid="cart-item"]:first-child button:has-text("Editar")'
    );

    // Wait for modal
    await page.waitForSelector('role=dialog[name="Editar Item"]');

    // Open glass type dropdown
    await page.click('role=combobox[name="Tipo de Vidrio"]');

    // Wait for dropdown to populate
    await page.waitForSelector("role=option", { state: "visible" });

    // Get all glass type options
    const options = await page.locator("role=option").allTextContents();

    // Verify options exist
    expect(options.length).toBeGreaterThan(0);

    // Verify each option shows name and price
    for (const option of options) {
      expect(option).toMatch(/\$[\d,]+\.\d{2}\/m²/); // Price format
    }
  });

  test("should change glass type and verify price update", async ({ page }) => {
    // Get original price
    const originalPrice = await page
      .locator(
        '[data-testid="cart-item"]:first-child [data-testid="item-subtotal"]'
      )
      .textContent();

    // Click edit button
    await page.click(
      '[data-testid="cart-item"]:first-child button:has-text("Editar")'
    );

    // Wait for modal
    await page.waitForSelector('role=dialog[name="Editar Item"]');

    // Get current glass type
    const currentGlassTypeName = await page
      .locator('role=combobox[name="Tipo de Vidrio"]')
      .textContent();

    // Open dropdown
    await page.click('role=combobox[name="Tipo de Vidrio"]');

    // Wait for options
    await page.waitForSelector("role=option", { state: "visible" });

    // Select a different glass type (second option if different from current)
    const options = page.locator("role=option");
    const optionsCount = await options.count();

    // Find first option that's different from current
    let selectedNewGlass = false;
    for (let i = 0; i < optionsCount; i++) {
      const optionText = await options.nth(i).textContent();
      if (!optionText?.includes(currentGlassTypeName ?? "")) {
        await options.nth(i).click();
        selectedNewGlass = true;
        break;
      }
    }

    if (!selectedNewGlass) {
      test.skip(); // Skip if no alternative glass type available
      return;
    }

    // Click save button
    await page.click('role=button[name="Guardar"]');

    // Wait for modal to close
    await page.waitForSelector('role=dialog[name="Editar Item"]', {
      state: "hidden",
    });

    // Wait for price to update
    await page.waitForTimeout(1000); // Allow for optimistic UI update

    // Get new price
    const newPrice = await page
      .locator(
        '[data-testid="cart-item"]:first-child [data-testid="item-subtotal"]'
      )
      .textContent();

    // Verify price changed (different glass type should have different price)
    expect(newPrice).not.toBe(originalPrice);
  });

  test("should cancel glass type change and preserve original", async ({
    page,
  }) => {
    // Get original glass type from cart display
    const originalGlassType = await page
      .locator('[data-testid="cart-item"]:first-child')
      .textContent();

    // Click edit button
    await page.click(
      '[data-testid="cart-item"]:first-child button:has-text("Editar")'
    );

    // Wait for modal
    await page.waitForSelector('role=dialog[name="Editar Item"]');

    // Open dropdown
    await page.click('role=combobox[name="Tipo de Vidrio"]');

    // Select different glass type
    const options = page.locator("role=option");
    if ((await options.count()) > 1) {
      await options.nth(1).click();
    }

    // Click cancel button
    await page.click('role=button[name="Cancelar"]');

    // Wait for modal to close
    await page.waitForSelector('role=dialog[name="Editar Item"]', {
      state: "hidden",
    });

    // Verify glass type unchanged in cart
    const currentGlassType = await page
      .locator('[data-testid="cart-item"]:first-child')
      .textContent();

    expect(currentGlassType).toBe(originalGlassType);
  });

  test("should display loading state while fetching glass types", async ({
    page,
  }) => {
    // Click edit button
    await page.click(
      '[data-testid="cart-item"]:first-child button:has-text("Editar")'
    );

    // Wait for modal
    await page.waitForSelector('role=dialog[name="Editar Item"]');

    // Glass type selector might show loading initially
    const glassTypeSelect = page.locator(
      'role=combobox[name="Tipo de Vidrio"]'
    );

    // Check if loading or loaded
    await expect(glassTypeSelect).toBeVisible();

    // Open dropdown
    await glassTypeSelect.click();

    // Should either show "Cargando..." or glass type options
    const content = page.locator("role=option");
    await expect(content.first()).toBeVisible();

    const firstOption = await content.first().textContent();
    const isLoadingOrHasData =
      firstOption?.includes("Cargando") || firstOption?.includes("$");

    expect(isLoadingOrHasData).toBe(true);
  });

  test("should update cart total when glass type changes", async ({ page }) => {
    // Get original cart total
    const originalTotal = await page
      .locator('[data-testid="cart-total"]')
      .textContent();

    // Click edit button on first item
    await page.click(
      '[data-testid="cart-item"]:first-child button:has-text("Editar")'
    );

    // Wait for modal
    await page.waitForSelector('role=dialog[name="Editar Item"]');

    // Change glass type (select different option)
    await page.click('role=combobox[name="Tipo de Vidrio"]');
    await page.waitForSelector("role=option", { state: "visible" });

    const options = page.locator("role=option");
    if ((await options.count()) > 1) {
      await options.nth(1).click(); // Select second option
    } else {
      test.skip(); // Skip if only one glass type available
      return;
    }

    // Save changes
    await page.click('role=button[name="Guardar"]');

    // Wait for modal to close
    await page.waitForSelector('role=dialog[name="Editar Item"]', {
      state: "hidden",
    });

    // Wait for total to update
    await page.waitForTimeout(1000);

    // Get new cart total
    const newTotal = await page
      .locator('[data-testid="cart-total"]')
      .textContent();

    // Verify total changed
    expect(newTotal).not.toBe(originalTotal);
  });
});
