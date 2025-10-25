import { expect, test } from '@playwright/test';

// Constants
const PRICE_CALCULATION_WAIT = 500;

test.describe('Catalog Model Form - Glass Area Display', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a model detail page
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');

    // Click on first model card
    const firstModelCard = page.locator('[data-testid="model-card"]').first();
    await firstModelCard.click();
    await page.waitForLoadState('networkidle');
  });

  test('should display calculated glass price instead of price per m² when dimensions are set', async ({ page }) => {
    // Verify initial state shows price per m² (no dimensions yet)
    const glassIndicator = page.locator('text=/\\/m²/').first();
    await expect(glassIndicator).toBeVisible();

    // Fill dimensions
    const widthInput = page.locator('input[name="width"]');
    const heightInput = page.locator('input[name="height"]');

    await widthInput.fill('1000'); // 1m
    await heightInput.fill('1500'); // 1.5m

    // Wait for price calculation
    await page.waitForTimeout(PRICE_CALCULATION_WAIT);

    // Verify glass area and total price are displayed
    const glassAreaText = page.locator('text=/1\\.50 m²/').first();
    await expect(glassAreaText).toBeVisible();

    // Verify "total vidrio" label is shown
    const totalGlassLabel = page.locator('text=/total vidrio/i').first();
    await expect(totalGlassLabel).toBeVisible();

    // Verify calculated total price is shown (not price per m²)
    const totalPrice = page.locator('text=/^\\$[0-9,]+$/').first();
    await expect(totalPrice).toBeVisible();
  });

  test('should update glass area when dimensions change', async ({ page }) => {
    // Fill initial dimensions (1m x 1m = 1 m²)
    const widthInput = page.locator('input[name="width"]');
    const heightInput = page.locator('input[name="height"]');

    await widthInput.fill('1000');
    await heightInput.fill('1000');
    await page.waitForTimeout(PRICE_CALCULATION_WAIT);

    // Verify initial area
    let glassAreaText = page.locator('text=/1\\.00 m²/').first();
    await expect(glassAreaText).toBeVisible();

    // Change to 2m x 2m = 4 m²
    await widthInput.fill('2000');
    await heightInput.fill('2000');
    await page.waitForTimeout(PRICE_CALCULATION_WAIT);

    // Verify updated area
    glassAreaText = page.locator('text=/4\\.00 m²/').first();
    await expect(glassAreaText).toBeVisible();
  });

  test('should show area in price breakdown popover', async ({ page }) => {
    // Fill dimensions
    const widthInput = page.locator('input[name="width"]');
    const heightInput = page.locator('input[name="height"]');

    await widthInput.fill('1000');
    await heightInput.fill('1500');
    await page.waitForTimeout(PRICE_CALCULATION_WAIT);

    // Open price breakdown popover
    const breakdownButton = page.getByRole('button', { name: /ver desglose/i });
    await breakdownButton.click();

    // Verify glass area is shown in breakdown (e.g., "Vidrio Float Claro (1.50 m²)")
    const glassBreakdownItem = page.locator('text=/Vidrio.*\\(1\\.50 m²\\)/i').first();
    await expect(glassBreakdownItem).toBeVisible();
  });
});
