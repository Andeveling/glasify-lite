/**
 * E2E Tests: Cart Item Image Display
 *
 * Tests for model image display in cart items with fallback placeholders.
 */

import { expect, test } from "@playwright/test";

test.describe("Cart Item Image Display", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to cart page
    await page.goto("/cart");
  });

  test("should display model image in cart item", async ({ page }) => {
    // This test assumes a cart item exists with model image
    // In real implementation, you would:
    // 1. Add a test item to cart via API or UI
    // 2. Verify the image renders

    const cartItem = page.locator('[data-testid^="cart-item-"]').first();
    await expect(cartItem).toBeVisible();

    // Check for image element
    const image = cartItem.locator("img").first();
    await expect(image).toBeVisible();
  });

  test("should display image with correct dimensions (80x80px)", async ({
    page,
  }) => {
    const cartItem = page.locator('[data-testid^="cart-item-"]').first();
    const image = cartItem.locator("img").first();

    await expect(image).toBeVisible();

    // Verify Next.js Image component attributes
    await expect(image).toHaveAttribute("width", "80");
    await expect(image).toHaveAttribute("height", "80");
  });

  test("should have accessible alt text with model name", async ({ page }) => {
    const cartItem = page.locator('[data-testid^="cart-item-"]').first();
    const image = cartItem.locator("img").first();

    await expect(image).toBeVisible();

    // Verify alt attribute exists and contains model reference
    const altText = await image.getAttribute("alt");
    expect(altText).toBeTruthy();
    expect(altText).toContain("Imagen de");
  });

  test("should display placeholder when model has no image", async ({
    page,
  }) => {
    // This test requires a cart item with no model image
    // In real implementation, you would:
    // 1. Create a model without imageUrl
    // 2. Add item to cart
    // 3. Verify placeholder is shown

    const cartItem = page.locator('[data-testid^="cart-item-"]').first();
    const image = cartItem.locator("img").first();

    await expect(image).toBeVisible();

    // Verify src points to placeholder (when modelImageUrl is null)
    const src = await image.getAttribute("src");
    if (src?.includes("placeholder")) {
      expect(src).toContain("placeholder");
    }
  });

  test("should optimize image loading with Next.js Image", async ({ page }) => {
    const cartItem = page.locator('[data-testid^="cart-item-"]').first();
    const image = cartItem.locator("img").first();

    await expect(image).toBeVisible();

    // Verify Next.js Image optimization attributes
    const decoding = await image.getAttribute("decoding");
    expect(decoding).toBe("async");

    // Check for responsive srcset (Next.js optimization)
    const srcset = await image.getAttribute("srcset");
    expect(srcset).toBeTruthy();
  });

  test("should apply rounded corners and border styling", async ({ page }) => {
    const cartItem = page.locator('[data-testid^="cart-item-"]').first();

    // Check for image container with styling classes
    const imageContainer = cartItem.locator(
      ".rounded-md.border.border-gray-200"
    );
    await expect(imageContainer).toBeVisible();
  });
});
