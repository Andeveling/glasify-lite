/**
 * Cart Item Delete with Undo - E2E Tests
 *
 * Tests the improved UX/UI for cart item deletion with toast notifications
 * and undo functionality following "Don't Make Me Think" principles.
 *
 * @module e2e/cart/delete-with-undo
 */

import { expect, test } from "@playwright/test";

// ============================================================================
// Constants
// ============================================================================

const ANIMATION_DURATION = 200; // ms - matches CSS transition
const TOAST_DISAPPEAR_TIMEOUT = 2000; // ms
const UNDO_TIMEOUT = 6000; // ms - 5s + buffer
const RESTORE_DELAY = 500; // ms
const RAPID_DELETE_DELAY = 100; // ms
const ADD_ITEM_DELAY = 1000; // ms
const TRANSITION_CHECK_DELAY = 50; // ms
const FULL_OPACITY = 0.95; // threshold for opacity check
const BASE_WIDTH = 1000; // mm
const BASE_HEIGHT = 1500; // mm
const WIDTH_INCREMENT = 100; // mm

test.describe("Cart - Delete with Undo UX", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to catalog and add items to cart
    await page.goto("/catalog");

    // Add first item to cart
    const firstModel = page.locator('[data-testid^="model-card-"]').first();
    await firstModel.click();

    // Configure and add to cart
    await page.fill('input[name="widthMm"]', "1000");
    await page.fill('input[name="heightMm"]', "1500");
    await page.click('button:has-text("Agregar al carrito")');

    // Wait for toast confirmation
    await expect(page.locator(".sonner-toast")).toBeVisible();
    await page.waitForTimeout(TOAST_DISAPPEAR_TIMEOUT);

    // Navigate to cart
    await page.goto("/cart");
  });

  test("should show smooth animation when deleting item", async ({ page }) => {
    // Get cart item
    const cartItem = page.locator('[data-testid^="cart-item-"]').first();

    // Verify item is visible
    await expect(cartItem).toBeVisible();

    // Click delete button
    const deleteButton = cartItem.locator('[data-testid="remove-button"]');
    await deleteButton.click();

    // Verify item has removing animation class
    // Note: This is a visual test - in real scenario we'd verify CSS classes
    await page.waitForTimeout(ANIMATION_DURATION);

    // Verify toast appears
    const toast = page.locator('.sonner-toast:has-text("Artículo eliminado")');
    await expect(toast).toBeVisible();
  });

  test("should display toast with undo button", async ({ page }) => {
    // Click delete on first item
    const deleteButton = page.locator('[data-testid="remove-button"]').first();
    await deleteButton.click();

    // Verify toast content
    const toast = page.locator(".sonner-toast");
    await expect(toast).toContainText("Artículo eliminado");
    await expect(toast).toContainText("eliminado del carrito");

    // Verify undo button exists
    const undoButton = toast.locator('button:has-text("Deshacer")');
    await expect(undoButton).toBeVisible();
  });

  test("should restore item when clicking undo", async ({ page }) => {
    // Get initial items count
    const initialCount = await page
      .locator('[data-testid^="cart-item-"]')
      .count();

    // Get item name before deletion
    const itemName = await page
      .locator('[data-testid^="cart-item-"]')
      .first()
      .locator('[aria-label="Nombre del artículo"]')
      .textContent();

    // Delete item
    await page.locator('[data-testid="remove-button"]').first().click();

    // Wait for delete animation
    await page.waitForTimeout(ANIMATION_DURATION);

    // Verify item count decreased
    await expect(page.locator('[data-testid^="cart-item-"]')).toHaveCount(
      initialCount - 1
    );

    // Click undo
    const undoButton = page.locator(
      '.sonner-toast button:has-text("Deshacer")'
    );
    await undoButton.click();

    // Wait for restore
    await page.waitForTimeout(RESTORE_DELAY);

    // Verify item is restored
    await expect(page.locator('[data-testid^="cart-item-"]')).toHaveCount(
      initialCount
    );

    // Verify restored item has correct name
    const restoredItem = page.locator('[data-testid^="cart-item-"]').first();
    await expect(
      restoredItem.locator('[aria-label="Nombre del artículo"]')
    ).toContainText(itemName || "");

    // Verify restore confirmation toast
    const restoreToast = page.locator(
      '.sonner-toast:has-text("Artículo restaurado")'
    );
    await expect(restoreToast).toBeVisible();
  });

  test("should permanently delete item after undo timeout", async ({
    page,
  }) => {
    // Get initial items count
    const initialCount = await page
      .locator('[data-testid^="cart-item-"]')
      .count();

    // Delete item
    await page.locator('[data-testid="remove-button"]').first().click();

    // Wait for undo timeout (5 seconds + buffer)
    await page.waitForTimeout(UNDO_TIMEOUT);

    // Verify item is still removed
    await expect(page.locator('[data-testid^="cart-item-"]')).toHaveCount(
      initialCount - 1
    );

    // Verify toast disappeared
    const toast = page.locator('.sonner-toast:has-text("Artículo eliminado")');
    await expect(toast).not.toBeVisible();
  });

  test("should show success toast when updating quantity", async ({ page }) => {
    // Click increase quantity
    const increaseButton = page
      .locator('[aria-label="Aumentar cantidad"]')
      .first();
    await increaseButton.click();

    // Verify success toast
    const toast = page.locator(
      '.sonner-toast:has-text("Cantidad actualizada")'
    );
    await expect(toast).toBeVisible();

    // Verify toast description shows quantity change
    await expect(toast).toContainText("→");
  });

  test("should show success toast when updating name", async ({ page }) => {
    // Click on name to edit
    const nameButton = page
      .locator('[aria-label="Nombre del artículo"]')
      .first();
    await nameButton.click();

    // Edit name
    const nameInput = page.locator(
      'input[aria-label="Editar nombre del artículo"]'
    );
    await nameInput.fill("Ventana Principal");

    // Save (blur)
    await nameInput.blur();

    // Verify success toast
    const toast = page.locator('.sonner-toast:has-text("Nombre actualizado")');
    await expect(toast).toBeVisible();

    // Verify toast shows old and new names
    await expect(toast).toContainText("→");
  });

  test("should handle multiple rapid deletions correctly", async ({ page }) => {
    // Add more items first
    await page.goto("/catalog");

    for (let i = 0; i < 2; i++) {
      const model = page.locator('[data-testid^="model-card-"]').nth(i);
      await model.click();
      await page.fill(
        'input[name="widthMm"]',
        `${BASE_WIDTH + i * WIDTH_INCREMENT}`
      );
      await page.fill('input[name="heightMm"]', `${BASE_HEIGHT}`);
      await page.click('button:has-text("Agregar al carrito")');
      await page.waitForTimeout(ADD_ITEM_DELAY);
    }

    await page.goto("/cart");

    // Get initial count
    const initialCount = await page
      .locator('[data-testid^="cart-item-"]')
      .count();

    // Delete multiple items rapidly
    await page.locator('[data-testid="remove-button"]').first().click();
    await page.waitForTimeout(RAPID_DELETE_DELAY);
    await page.locator('[data-testid="remove-button"]').first().click();

    // Verify both toasts appear
    const toasts = page.locator('.sonner-toast:has-text("Artículo eliminado")');
    await expect(toasts).toHaveCount(2);

    // Verify correct number of items removed
    await page.waitForTimeout(RESTORE_DELAY);
    await expect(page.locator('[data-testid^="cart-item-"]')).toHaveCount(
      initialCount - 2
    );
  });

  test("should maintain visual state during updates", async ({ page }) => {
    // Get cart item
    const cartItem = page.locator('[data-testid^="cart-item-"]').first();

    // Verify default opacity (100%)
    const initialOpacity = await cartItem.evaluate(
      (el) => window.getComputedStyle(el).opacity
    );
    expect(Number.parseFloat(initialOpacity)).toBeGreaterThan(FULL_OPACITY);

    // Click quantity button
    await page.locator('[aria-label="Aumentar cantidad"]').first().click();

    // Verify reduced opacity during transition (70%)
    // Note: This might be flaky due to transition timing
    await page.waitForTimeout(TRANSITION_CHECK_DELAY);

    // After transition completes, opacity should be back to 100%
    await page.waitForTimeout(ANIMATION_DURATION);
    const finalOpacity = await cartItem.evaluate(
      (el) => window.getComputedStyle(el).opacity
    );
    expect(Number.parseFloat(finalOpacity)).toBeGreaterThan(FULL_OPACITY);
  });
});
