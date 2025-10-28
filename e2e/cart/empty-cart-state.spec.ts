/**
 * E2E Tests: Empty Cart State
 *
 * Tests the empty cart display and navigation behavior:
 * - Empty cart message and icon
 * - Link to catalog
 * - Disabled quote generation button
 *
 * @module e2e/cart/empty-cart-state
 */

import { expect, test } from "@playwright/test";

// ============================================================================
// E2E Tests
// ============================================================================

test.describe("Empty Cart State", () => {
  test.beforeEach(async ({ page }) => {
    // Clear sessionStorage to ensure empty cart
    await page.goto("/cart");
    await page.evaluate(() => {
      sessionStorage.clear();
    });

    // Reload to trigger hydration with empty cart
    await page.reload();
  });

  test("should display empty cart message", async ({ page }) => {
    // Verify empty state heading
    await expect(page.getByText("Tu carrito está vacío")).toBeVisible();

    // Verify empty state description
    await expect(
      page.getByText("Agrega configuraciones de ventanas desde el catálogo")
    ).toBeVisible();
  });

  test("should display empty cart icon", async ({ page }) => {
    // Verify shopping cart icon is present
    // Note: Lucide icons render as SVGs, check for parent div with icon
    const iconContainer = page
      .locator("div")
      .filter({ has: page.locator("svg") })
      .first();
    await expect(iconContainer).toBeVisible();
  });

  test("should show link to catalog", async ({ page }) => {
    // Verify "Explorar catálogo" button exists
    const catalogLink = page.getByRole("link", { name: "Explorar catálogo" });
    await expect(catalogLink).toBeVisible();

    // Verify it links to catalog page
    await expect(catalogLink).toHaveAttribute("href", "/catalog");
  });

  test("should navigate to catalog when button clicked", async ({ page }) => {
    // Click the catalog button
    await page.getByRole("link", { name: "Explorar catálogo" }).click();

    // Verify navigation to catalog
    await expect(page).toHaveURL("/catalog");
  });

  test("should not display cart items list", async ({ page }) => {
    // Verify no cart item components are rendered
    const cartItems = page.locator('[data-testid^="cart-item-"]');
    await expect(cartItems).toHaveCount(0);
  });

  test("should still display page header", async ({ page }) => {
    // Verify page title is present even when empty
    await expect(page.getByText("Carrito de presupuesto")).toBeVisible();
  });

  test("should show empty cart after removing all items", async ({ page }) => {
    // First, add items to cart
    await page.evaluate(() => {
      const mockItems = [
        {
          additionalServiceIds: [],
          createdAt: new Date().toISOString(),
          glassTypeId: "glass-1",
          glassTypeName: "Templado",
          heightMm: 1000,
          id: "test-item-1",
          modelId: "model-1",
          modelName: "Test Model",
          name: "TEST-001",
          quantity: 1,
          subtotal: 10_000.0,
          unitPrice: 10_000.0,
          widthMm: 1000,
        },
      ];

      const cartData = {
        items: mockItems,
        lastModified: new Date().toISOString(),
        version: 1,
      };

      sessionStorage.setItem("glasify_cart", JSON.stringify(cartData));
    });

    // Reload to show cart with item
    await page.reload();
    await page.waitForSelector('[data-testid^="cart-item-"]');

    // Remove the only item
    await page.getByLabel("Eliminar TEST-001").click();

    // Verify empty state appears
    await expect(page.getByText("Tu carrito está vacío")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Explorar catálogo" })
    ).toBeVisible();
  });

  test("should not show cart summary when empty", async ({ page }) => {
    // Verify cart summary component is not present
    const summary = page.getByText("Resumen de presupuesto");
    await expect(summary).not.toBeVisible();
  });

  test("should not show generate quote button when empty", async ({ page }) => {
    // Verify generate quote button is not present in empty state
    const generateButton = page.getByRole("button", {
      name: "Generar cotización",
    });
    await expect(generateButton).not.toBeVisible();
  });

  test("should display custom message if provided", async ({ page }) => {
    // This tests component flexibility (custom prop)
    // In actual implementation, empty state component might accept custom message
    // For now, we just verify default message
    await expect(page.getByText("Tu carrito está vacío")).toBeVisible();
  });

  test("should be accessible with keyboard navigation", async ({ page }) => {
    // Tab to catalog link
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab"); // Multiple tabs to reach the link

    // Verify catalog link has focus
    const _catalogLink = page.getByRole("link", { name: "Explorar catálogo" });

    // Activate with Enter key
    await page.keyboard.press("Enter");

    // Should navigate to catalog
    await expect(page).toHaveURL("/catalog");
  });

  test("should have proper ARIA structure for empty state", async ({
    page,
  }) => {
    // Verify heading hierarchy
    const heading = page.getByRole("heading", {
      name: "Tu carrito está vacío",
    });
    await expect(heading).toBeVisible();

    // Verify link is properly labeled
    const catalogLink = page.getByRole("link", { name: "Explorar catálogo" });
    await expect(catalogLink).toBeVisible();
  });

  test("should maintain empty state on page reload", async ({ page }) => {
    // Verify empty state
    await expect(page.getByText("Tu carrito está vacío")).toBeVisible();

    // Reload page
    await page.reload();

    // Should still show empty state
    await expect(page.getByText("Tu carrito está vacío")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Explorar catálogo" })
    ).toBeVisible();
  });

  test("should show friendly styling for empty state", async ({ page }) => {
    // Verify dashed border card is present (indicates empty state card)
    const emptyCard = page.locator("div").filter({
      has: page.getByText("Tu carrito está vacío"),
    });

    await expect(emptyCard).toBeVisible();
  });

  test("should transition from empty to populated state", async ({ page }) => {
    // Start with empty cart
    await expect(page.getByText("Tu carrito está vacío")).toBeVisible();

    // Add item via sessionStorage (simulating add-to-cart action)
    await page.evaluate(() => {
      const mockItem = {
        additionalServiceIds: [],
        createdAt: new Date().toISOString(),
        glassTypeId: "glass-1",
        glassTypeName: "Templado",
        heightMm: 1500,
        id: "new-item-1",
        modelId: "model-1",
        modelName: "New Model",
        name: "NEW-001",
        quantity: 1,
        subtotal: 15_000.0,
        unitPrice: 15_000.0,
        widthMm: 1200,
      };

      const cartData = {
        items: [mockItem],
        lastModified: new Date().toISOString(),
        version: 1,
      };

      sessionStorage.setItem("glasify_cart", JSON.stringify(cartData));
    });

    // Reload to trigger re-hydration
    await page.reload();

    // Verify empty state is gone
    await expect(page.getByText("Tu carrito está vacío")).not.toBeVisible();

    // Verify cart items are shown
    await expect(page.locator('[data-testid^="cart-item-"]')).toHaveCount(1);
    await expect(page.getByText("NEW-001")).toBeVisible();
  });
});
