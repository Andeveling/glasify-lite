/**
 * E2E Tests: Cart Management
 *
 * Tests the complete cart management flow:
 * - Editing item names
 * - Adjusting quantities
 * - Removing items
 * - Real-time total updates
 *
 * @module e2e/cart/cart-management
 */

import { expect, type Page, test } from "@playwright/test";

// ============================================================================
// Test Setup
// ============================================================================

/**
 * Add mock items to cart (simulates User Story 1 functionality)
 */
async function addMockItemsToCart(page: Page) {
  // Navigate to catalog (assuming catalog exists)
  // For now, we'll inject items directly into sessionStorage
  await page.evaluate(() => {
    const mockItems = [
      {
        additionalServiceIds: [],
        createdAt: new Date().toISOString(),
        glassTypeId: "glass-templado-456",
        glassTypeName: "Templado",
        heightMm: 1500,
        id: "test-item-1",
        modelId: "model-veka-123",
        modelName: "VEKA Slide 82",
        name: "VEKA-001",
        quantity: 2,
        solutionId: "solution-dvh-789",
        solutionName: "DVH",
        subtotal: 30_000.0,
        unitPrice: 15_000.0,
        widthMm: 1200,
      },
      {
        additionalServiceIds: [],
        createdAt: new Date().toISOString(),
        glassTypeId: "glass-laminado-789",
        glassTypeName: "Laminado",
        heightMm: 1200,
        id: "test-item-2",
        modelId: "model-guardian-456",
        modelName: "Guardian Plus",
        name: "GUARDIAN-001",
        quantity: 1,
        subtotal: 12_000.0,
        unitPrice: 12_000.0,
        widthMm: 1000,
      },
      {
        additionalServiceIds: [],
        createdAt: new Date().toISOString(),
        glassTypeId: "glass-templado-456",
        glassTypeName: "Templado",
        heightMm: 1800,
        id: "test-item-3",
        modelId: "model-rehau-789",
        modelName: "Rehau Euro Design",
        name: "REHAU-001",
        quantity: 3,
        subtotal: 54_000.0,
        unitPrice: 18_000.0,
        widthMm: 1500,
      },
    ];

    const cartData = {
      items: mockItems,
      lastModified: new Date().toISOString(),
      version: 1,
    };

    sessionStorage.setItem("glasify_cart", JSON.stringify(cartData));
  });
}

// ============================================================================
// E2E Tests
// ============================================================================

test.describe("Cart Management", () => {
  test.beforeEach(async ({ page }) => {
    // Add mock items to cart
    await addMockItemsToCart(page);

    // Navigate to cart page
    await page.goto("/cart");

    // Wait for cart to hydrate
    await page.waitForSelector('[data-testid^="cart-item-"]');
  });

  test("should display all cart items", async ({ page }) => {
    // Verify all 3 items are displayed
    await expect(page.locator('[data-testid^="cart-item-"]')).toHaveCount(3);

    // Verify item names
    await expect(page.getByText("VEKA-001")).toBeVisible();
    await expect(page.getByText("GUARDIAN-001")).toBeVisible();
    await expect(page.getByText("REHAU-001")).toBeVisible();

    // Verify quantities
    await expect(
      page.locator('[data-testid="quantity-display"]').nth(0)
    ).toHaveText("2");
    await expect(
      page.locator('[data-testid="quantity-display"]').nth(1)
    ).toHaveText("1");
    await expect(
      page.locator('[data-testid="quantity-display"]').nth(2)
    ).toHaveText("3");
  });

  test("should edit item name inline", async ({ page }) => {
    // Click on first item name to enter edit mode
    await page
      .getByRole("button", { name: "Nombre del artículo" })
      .first()
      .click();

    // Input field should be visible
    const nameInput = page.getByLabel("Editar nombre del artículo");
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveValue("VEKA-001");

    // Edit the name
    await nameInput.clear();
    await nameInput.fill("Ventana Principal");

    // Press Enter to save
    await nameInput.press("Enter");

    // Verify new name is displayed
    await expect(page.getByText("Ventana Principal")).toBeVisible();
    await expect(page.getByText("VEKA-001")).not.toBeVisible();
  });

  test("should cancel name editing on Escape key", async ({ page }) => {
    // Enter edit mode
    await page
      .getByRole("button", { name: "Nombre del artículo" })
      .first()
      .click();

    // Start editing
    const nameInput = page.getByLabel("Editar nombre del artículo");
    await nameInput.clear();
    await nameInput.fill("Temporary Name");

    // Press Escape to cancel
    await nameInput.press("Escape");

    // Original name should still be visible
    await expect(page.getByText("VEKA-001")).toBeVisible();
    await expect(page.getByText("Temporary Name")).not.toBeVisible();
  });

  test("should increase item quantity", async ({ page }) => {
    // Get initial quantity
    const quantityDisplay = page
      .locator('[data-testid="quantity-display"]')
      .first();
    await expect(quantityDisplay).toHaveText("2");

    // Click increase button
    await page.getByLabel("Aumentar cantidad").first().click();

    // Verify quantity increased
    await expect(quantityDisplay).toHaveText("3");

    // Verify subtotal updated (15000 * 3 = 45000)
    const subtotal = page.locator('[data-testid="subtotal"]').first();
    await expect(subtotal).toContainText("45000.00");
  });

  test("should decrease item quantity", async ({ page }) => {
    // Get initial quantity (first item has quantity 2)
    const quantityDisplay = page
      .locator('[data-testid="quantity-display"]')
      .first();
    await expect(quantityDisplay).toHaveText("2");

    // Click decrease button
    await page.getByLabel("Disminuir cantidad").first().click();

    // Verify quantity decreased
    await expect(quantityDisplay).toHaveText("1");

    // Verify subtotal updated (15000 * 1 = 15000)
    const subtotal = page.locator('[data-testid="subtotal"]').first();
    await expect(subtotal).toContainText("15000.00");
  });

  test("should disable decrease button at minimum quantity", async ({
    page,
  }) => {
    // Second item has quantity 1 (minimum)
    const decreaseButton = page.getByLabel("Disminuir cantidad").nth(1);

    // Button should be disabled
    await expect(decreaseButton).toBeDisabled();
  });

  test("should remove item from cart", async ({ page }) => {
    // Verify initial count
    await expect(page.locator('[data-testid^="cart-item-"]')).toHaveCount(3);

    // Click remove button on first item
    await page.getByLabel("Eliminar VEKA-001").click();

    // Verify item removed
    await expect(page.locator('[data-testid^="cart-item-"]')).toHaveCount(2);
    await expect(page.getByText("VEKA-001")).not.toBeVisible();

    // Verify other items still present
    await expect(page.getByText("GUARDIAN-001")).toBeVisible();
    await expect(page.getByText("REHAU-001")).toBeVisible();
  });

  test("should update cart summary totals in real-time", async ({ page }) => {
    // Initial total: 30000 + 12000 + 54000 = 96000
    await expect(page.getByText("MXN $96000.00")).toBeVisible();

    // Increase quantity of first item (2 → 3)
    await page.getByLabel("Aumentar cantidad").first().click();

    // New total: 45000 + 12000 + 54000 = 111000
    await expect(page.getByText("MXN $111000.00")).toBeVisible();

    // Remove second item
    await page.getByLabel("Eliminar GUARDIAN-001").click();

    // New total: 45000 + 54000 = 99000
    await expect(page.getByText("MXN $99000.00")).toBeVisible();
  });

  test("should update item count in cart summary", async ({ page }) => {
    // Initial count: 3 items
    await expect(page.getByText("3")).toBeVisible(); // Item count in summary

    // Remove one item
    await page.getByLabel("Eliminar VEKA-001").click();

    // Updated count: 2 items
    await expect(page.getByText("2")).toBeVisible();

    // Remove another item
    await page.getByLabel("Eliminar GUARDIAN-001").click();

    // Updated count: 1 item
    await expect(page.getByText("1")).toBeVisible();
  });

  test("should persist changes to sessionStorage", async ({ page }) => {
    // Edit item name
    await page
      .getByRole("button", { name: "Nombre del artículo" })
      .first()
      .click();
    const nameInput = page.getByLabel("Editar nombre del artículo");
    await nameInput.clear();
    await nameInput.fill("Updated Name");
    await nameInput.press("Enter");

    // Increase quantity
    await page.getByLabel("Aumentar cantidad").first().click();

    // Check sessionStorage
    const cartData = await page.evaluate(() => {
      const raw = sessionStorage.getItem("glasify_cart");
      return raw ? JSON.parse(raw) : null;
    });

    expect(cartData).toBeTruthy();
    expect(cartData.items).toHaveLength(3);
    expect(cartData.items[0].name).toBe("Updated Name");
    expect(cartData.items[0].quantity).toBe(3);
  });

  test("should handle rapid quantity changes gracefully", async ({ page }) => {
    const quantityDisplay = page
      .locator('[data-testid="quantity-display"]')
      .first();
    const increaseButton = page.getByLabel("Aumentar cantidad").first();

    // Rapidly click increase button
    for (let i = 0; i < 5; i++) {
      await increaseButton.click();
    }

    // Final quantity should be 2 + 5 = 7
    await expect(quantityDisplay).toHaveText("7");

    // Subtotal should be 15000 * 7 = 105000
    const subtotal = page.locator('[data-testid="subtotal"]').first();
    await expect(subtotal).toContainText("105000.00");
  });

  test("should show updated configuration details", async ({ page }) => {
    // Verify first item configuration
    await expect(page.getByText("1200 × 1500 mm")).toBeVisible();
    await expect(page.getByText("VEKA Slide 82 - Templado")).toBeVisible();
    await expect(page.getByText("Solución: DVH")).toBeVisible();
  });

  test("should enable generate quote button when cart has items", async ({
    page,
  }) => {
    const generateQuoteButton = page.getByRole("button", {
      name: "Generar cotización",
    });

    // Button should be enabled with items in cart
    await expect(generateQuoteButton).toBeEnabled();
  });
});
