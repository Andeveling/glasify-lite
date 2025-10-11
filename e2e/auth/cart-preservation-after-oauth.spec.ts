/**
 * E2E Test: Cart Preservation After OAuth
 *
 * Tests cart data integrity after OAuth redirect flow.
 * Verifies sessionStorage persistence across authentication.
 *
 * @module e2e/auth/cart-preservation-after-oauth
 */

import { expect, test } from '@playwright/test';

// ============================================================================
// Constants
// ============================================================================

const CATALOG_MODEL_URL_REGEX = /\/catalog\/\w+/;
const SIGNIN_URL_REGEX = /\/signin/;
const ADDED_TO_CART_REGEX = /agregado al carrito/i;
const PRICE_RECALC_DELAY_MS = 500;

test.describe('Cart Preservation After OAuth', () => {
  test('should preserve all cart item properties after auth redirect', async ({ page }) => {
    // ARRANGE: Add item with specific configuration
    await page.goto('/catalog');

    const firstModel = page.locator('[data-testid="model-card"]').first();
    await firstModel.click();
    await page.waitForURL(CATALOG_MODEL_URL_REGEX);

    // Configure with specific dimensions
    const widthInput = page.locator('input[name="widthMm"]');
    const heightInput = page.locator('input[name="heightMm"]');

    await widthInput.fill('1200');
    await heightInput.fill('1800');

    // Add to cart
    await page.locator('button:has-text("Agregar al carrito")').click();
    await expect(page.locator(`text=${ADDED_TO_CART_REGEX.source}`)).toBeVisible();

    // Navigate to cart and verify initial state
    await page.goto('/cart');

    const initialItemName = await page.locator('[data-testid="cart-item-name"]').first().textContent();
    const initialWidth = await page.locator('[data-testid="cart-item-width"]').first().textContent();
    const initialHeight = await page.locator('[data-testid="cart-item-height"]').first().textContent();

    // ACT: Trigger auth redirect
    await page.locator('button:has-text("Generar cotización")').click();
    await page.waitForURL(SIGNIN_URL_REGEX);

    // Simulate OAuth callback by going back to cart
    await page.goto('/cart');

    // ASSERT: All properties should be preserved
    const finalItemName = await page.locator('[data-testid="cart-item-name"]').first().textContent();
    const finalWidth = await page.locator('[data-testid="cart-item-width"]').first().textContent();
    const finalHeight = await page.locator('[data-testid="cart-item-height"]').first().textContent();

    expect(finalItemName).toBe(initialItemName);
    expect(finalWidth).toBe(initialWidth);
    expect(finalHeight).toBe(initialHeight);
  });

  test('should preserve cart totals after auth redirect', async ({ page }) => {
    // ARRANGE: Add multiple items to build up total
    await page.goto('/catalog');

    // Add first item
    const firstModel = page.locator('[data-testid="model-card"]').first();
    await firstModel.click();
    await page.waitForURL(CATALOG_MODEL_URL_REGEX);

    await page.locator('input[name="widthMm"]').fill('1000');
    await page.locator('input[name="heightMm"]').fill('1500');
    await page.locator('button:has-text("Agregar al carrito")').click();
    await expect(page.locator(`text=${ADDED_TO_CART_REGEX.source}`)).toBeVisible();

    // Add second item
    await page.goto('/catalog');
    const secondModel = page.locator('[data-testid="model-card"]').nth(1);
    await secondModel.click();
    await page.waitForURL(CATALOG_MODEL_URL_REGEX);

    await page.locator('input[name="widthMm"]').fill('800');
    await page.locator('input[name="heightMm"]').fill('1200');
    await page.locator('button:has-text("Agregar al carrito")').click();
    await expect(page.locator(`text=${ADDED_TO_CART_REGEX.source}`)).toBeVisible();

    // Navigate to cart and capture total
    await page.goto('/cart');

    const initialTotal = await page.locator('[data-testid="cart-total"]').textContent();
    const initialItemCount = await page.locator('[data-testid="cart-item"]').count();

    // ACT: Trigger auth redirect
    await page.locator('button:has-text("Generar cotización")').click();
    await page.waitForURL(SIGNIN_URL_REGEX);

    // Return to cart
    await page.goto('/cart');

    // ASSERT: Totals should match
    const finalTotal = await page.locator('[data-testid="cart-total"]').textContent();
    const finalItemCount = await page.locator('[data-testid="cart-item"]').count();

    expect(finalTotal).toBe(initialTotal);
    expect(finalItemCount).toBe(initialItemCount);
  });

  test('should preserve custom item names after auth redirect', async ({ page }) => {
    // ARRANGE: Add item and edit name
    await page.goto('/catalog');

    const firstModel = page.locator('[data-testid="model-card"]').first();
    await firstModel.click();
    await page.waitForURL(CATALOG_MODEL_URL_REGEX);

    await page.locator('input[name="widthMm"]').fill('1000');
    await page.locator('input[name="heightMm"]').fill('1500');
    await page.locator('button:has-text("Agregar al carrito")').click();
    await expect(page.locator(`text=${ADDED_TO_CART_REGEX.source}`)).toBeVisible();

    // Navigate to cart and edit item name
    await page.goto('/cart');

    const nameInput = page.locator('[data-testid="cart-item-name-input"]').first();
    await nameInput.click();
    await nameInput.fill('Ventana Principal - Sala');
    await nameInput.blur();

    // Verify name was updated
    const customName = await nameInput.inputValue();
    expect(customName).toBe('Ventana Principal - Sala');

    // ACT: Trigger auth redirect
    await page.locator('button:has-text("Generar cotización")').click();
    await page.waitForURL(SIGNIN_URL_REGEX);

    // Return to cart
    await page.goto('/cart');

    // ASSERT: Custom name should be preserved
    const preservedName = await page.locator('[data-testid="cart-item-name-input"]').first().inputValue();
    expect(preservedName).toBe('Ventana Principal - Sala');
  });

  test('should preserve edited quantities after auth redirect', async ({ page }) => {
    // ARRANGE: Add item and adjust quantity
    await page.goto('/catalog');

    const firstModel = page.locator('[data-testid="model-card"]').first();
    await firstModel.click();
    await page.waitForURL(CATALOG_MODEL_URL_REGEX);

    await page.locator('input[name="widthMm"]').fill('1000');
    await page.locator('input[name="heightMm"]').fill('1500');
    await page.locator('button:has-text("Agregar al carrito")').click();
    await expect(page.locator(`text=${ADDED_TO_CART_REGEX.source}`)).toBeVisible();

    // Navigate to cart and increase quantity
    await page.goto('/cart');

    const quantityInput = page.locator('[data-testid="cart-item-quantity"]').first();
    await quantityInput.fill('5');
    await quantityInput.blur();

    // Wait for price recalculation
    await page.waitForTimeout(PRICE_RECALC_DELAY_MS);

    const updatedQuantity = await quantityInput.inputValue();
    expect(updatedQuantity).toBe('5');

    // ACT: Trigger auth redirect
    await page.locator('button:has-text("Generar cotización")').click();
    await page.waitForURL(SIGNIN_URL_REGEX);

    // Return to cart
    await page.goto('/cart');

    // ASSERT: Quantity should be preserved
    const preservedQuantity = await page.locator('[data-testid="cart-item-quantity"]').first().inputValue();
    expect(preservedQuantity).toBe('5');
  });

  test('should preserve empty cart state after auth redirect', async ({ page }) => {
    // ARRANGE: Start with empty cart
    await page.goto('/cart');

    // Verify cart is empty
    await expect(page.locator('[data-testid="empty-cart-message"]')).toBeVisible();

    // Try to access protected route (should redirect to sign-in)
    await page.goto('/quotes');
    await page.waitForURL(SIGNIN_URL_REGEX);

    // Return to cart
    await page.goto('/cart');

    // ASSERT: Cart should still be empty
    await expect(page.locator('[data-testid="empty-cart-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(0);
  });

  test('should handle sessionStorage across multiple auth redirects', async ({ page }) => {
    // ARRANGE: Add item to cart
    await page.goto('/catalog');

    const firstModel = page.locator('[data-testid="model-card"]').first();
    await firstModel.click();
    await page.waitForURL(CATALOG_MODEL_URL_REGEX);

    await page.locator('input[name="widthMm"]').fill('1000');
    await page.locator('input[name="heightMm"]').fill('1500');
    await page.locator('button:has-text("Agregar al carrito")').click();
    await expect(page.locator(`text=${ADDED_TO_CART_REGEX.source}`)).toBeVisible();

    await page.goto('/cart');
    const initialItemCount = await page.locator('[data-testid="cart-item"]').count();

    // ACT: Multiple redirects
    // First redirect
    await page.goto('/quotes');
    await page.waitForURL(SIGNIN_URL_REGEX);
    await page.goto('/cart');

    // Second redirect
    await page.goto('/quote/new');
    await page.waitForURL(SIGNIN_URL_REGEX);
    await page.goto('/cart');

    // ASSERT: Cart should survive multiple redirects
    const finalItemCount = await page.locator('[data-testid="cart-item"]').count();
    expect(finalItemCount).toBe(initialItemCount);
  });
});
