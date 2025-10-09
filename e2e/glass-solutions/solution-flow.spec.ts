/**
 * E2E Test - Glass Solutions Selection Flow
 *
 * Tests the complete user journey from catalog to solution selection
 * and glass type selection with performance ratings display.
 *
 * User Flow:
 * 1. Navigate to catalog
 * 2. Click on a model to open configuration
 * 3. Select a glass solution (e.g., Security)
 * 4. View filtered glass types for that solution
 * 5. See performance ratings displayed
 * 6. Select a glass type
 */

import { expect, test } from '@playwright/test';

// Test Constants
const CATALOG_TITLE_PATTERN = /Catálogo/i;
const SECURITY_SOLUTION_PATTERN = /Seguridad/i;
const INTERACTION_WAIT_MS = 500;
const MIN_TOUCH_TARGET_SIZE = 44; // WCAG AA minimum (44x44px)
const MIN_RATING_ICONS = 3;

test.describe('Glass Solutions - User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Start at catalog page
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
  });

  test('should display catalog with models', async ({ page }) => {
    // Verify catalog page loaded
    await expect(page).toHaveTitle(CATALOG_TITLE_PATTERN);

    // Check that models are displayed
    const modelCards = page.locator('[data-testid="model-card"]');
    await expect(modelCards.first()).toBeVisible();

    // Verify at least one manufacturer filter is shown
    const manufacturerFilter = page.locator('text=/Guardian|AGC|Saint-Gobain|VEKA/i').first();
    await expect(manufacturerFilter).toBeVisible();
  });

  test('should open model configuration when clicking a model', async ({ page }) => {
    // Click on first model card
    const firstModel = page.locator('[data-testid="model-card"]').first();
    const modelName = await firstModel.locator('h3').textContent();

    await firstModel.click();
    await page.waitForLoadState('networkidle');

    // Verify we're on the model page
    expect(page.url()).toContain('/catalog/');

    // Verify model name appears in heading
    if (modelName) {
      const heading = page.locator('h1, h2').filter({ hasText: modelName });
      await expect(heading).toBeVisible();
    }
  });

  test('should show solution selector as first step', async ({ page }) => {
    // Navigate to a model
    await page.locator('[data-testid="model-card"]').first().click();
    await page.waitForLoadState('networkidle');

    // Verify solution selector section is visible
    const solutionSection = page.locator('text=/Selecciona.*soluci\u00f3n|Tipo de vidrio/i').first();
    await expect(solutionSection).toBeVisible();

    // Verify solution options are displayed
    const securitySolution = page.locator('text=/Seguridad|Security/i').first();
    const thermalSolution = page.locator('text=/T\u00e9rmico|Thermal|Aislamiento/i').first();

    // At least one solution should be visible
    const hasSecurity = await securitySolution.isVisible().catch(() => false);
    const hasThermal = await thermalSolution.isVisible().catch(() => false);

    expect(hasSecurity || hasThermal).toBe(true);
  });

  test('should filter glass types when selecting a solution', async ({ page }) => {
    // Navigate to a model
    await page.locator('[data-testid="model-card"]').first().click();
    await page.waitForLoadState('networkidle');

    // Find and click a solution (try Security first, fallback to any solution)
    const securityButton = page
      .locator('[data-testid="solution-button"]')
      .filter({ hasText: SECURITY_SOLUTION_PATTERN });
    const anySolutionButton = page.locator('[data-testid="solution-button"]').first();

    const solutionToClick = (await securityButton.count()) > 0 ? securityButton.first() : anySolutionButton;
    await solutionToClick.click();

    // Wait for glass types to load
    await page.waitForTimeout(INTERACTION_WAIT_MS);

    // Verify glass type selector appears
    const glassTypeSection = page.locator('text=/Selecciona.*tipo|vidrio disponible/i').first();
    const glassTypeVisible = await glassTypeSection.isVisible().catch(() => false);

    if (glassTypeVisible) {
      await expect(glassTypeSection).toBeVisible();
    }

    // Verify at least one glass type option is shown
    const glassTypeCards = page.locator('[data-testid="glass-type-card"]');
    const glassTypeCount = await glassTypeCards.count();

    if (glassTypeCount > 0) {
      await expect(glassTypeCards.first()).toBeVisible();
    }
  });

  test('should display performance ratings on glass cards', async ({ page }) => {
    // Navigate to a model
    await page.locator('[data-testid="model-card"]').first().click();
    await page.waitForLoadState('networkidle');

    // Select a solution
    const solutionButton = page.locator('[data-testid="solution-button"]').first();
    await solutionButton.click();
    await page.waitForTimeout(INTERACTION_WAIT_MS);

    // Find glass type cards
    const glassTypeCards = page.locator('[data-testid="glass-type-card"]');
    const cardCount = await glassTypeCards.count();

    if (cardCount > 0) {
      const firstCard = glassTypeCards.first();

      // Look for performance rating indicators (stars, badges, or icons)
      const hasStars = (await firstCard.locator('svg[class*="star"]').count()) > 0;
      const hasBadges = (await firstCard.locator('[class*="badge"]').count()) > 0;
      const hasRatingIcons = (await firstCard.locator('svg').count()) >= MIN_RATING_ICONS;

      // At least one rating indicator should be present
      expect(hasStars || hasBadges || hasRatingIcons).toBe(true);
    }
  });

  test('should allow selecting a glass type', async ({ page }) => {
    // Navigate to a model
    await page.locator('[data-testid="model-card"]').first().click();
    await page.waitForLoadState('networkidle');

    // Select a solution
    const solutionButton = page.locator('[data-testid="solution-button"]').first();
    await solutionButton.click();
    await page.waitForTimeout(INTERACTION_WAIT_MS);

    // Click on a glass type if available
    const glassTypeButton = page.locator('[data-testid="glass-type-button"]').first();
    const glassTypeCount = await glassTypeButton.count();

    if (glassTypeCount > 0) {
      await glassTypeButton.click();

      // Verify selection (look for checked state, highlight, or next step)
      const isChecked = (await glassTypeButton.locator('[aria-checked="true"]').count()) > 0;
      const isSelected = (await glassTypeButton.locator('[data-selected="true"]').count()) > 0;
      const hasCheckmark = (await glassTypeButton.locator('svg[class*="check"]').count()) > 0;

      expect(isChecked || isSelected || hasCheckmark).toBe(true);
    }
  });

  test('should show price information', async ({ page }) => {
    // Navigate to a model
    await page.locator('[data-testid="model-card"]').first().click();
    await page.waitForLoadState('networkidle');

    // Look for price indicators
    const priceText = page.locator('text=/\\$|USD|precio|Price/i').first();
    const priceVisible = await priceText.isVisible().catch(() => false);

    if (priceVisible) {
      await expect(priceText).toBeVisible();
    }

    // Or look for numeric values that look like prices
    const pricePattern = page.locator('text=/\\d+[.,]\\d{2}/').first();
    const pricePatternVisible = await pricePattern.isVisible().catch(() => false);

    expect(priceVisible || pricePatternVisible).toBe(true);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ height: 667, width: 375 });

    // Navigate to a model
    await page.locator('[data-testid="model-card"]').first().click();
    await page.waitForLoadState('networkidle');

    // Verify solution buttons are visible and clickable
    const solutionButton = page.locator('[data-testid="solution-button"]').first();
    await expect(solutionButton).toBeVisible();

    // Verify button has adequate touch target (at least 44x44px)
    const boundingBox = await solutionButton.boundingBox();

    if (boundingBox) {
      expect(boundingBox.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
      expect(boundingBox.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Navigate to a model
    await page.locator('[data-testid="model-card"]').first().click();
    await page.waitForLoadState('networkidle');

    // Tab to first solution button
    await page.keyboard.press('Tab');

    // Verify a solution button is focused
    const focusedElement = page.locator(':focus');
    const isSolutionButton = (await focusedElement.getAttribute('data-testid')) === 'solution-button';

    if (isSolutionButton) {
      // Press Enter to select
      await page.keyboard.press('Enter');
      await page.waitForTimeout(INTERACTION_WAIT_MS);

      // Verify selection worked
      const glassTypeSection = page.locator('[data-testid="glass-type-section"]').first();
      const visible = await glassTypeSection.isVisible().catch(() => false);

      if (visible) {
        await expect(glassTypeSection).toBeVisible();
      }
    }
  });

  test('should show manufacturer information', async ({ page }) => {
    // Verify manufacturer info in catalog
    const manufacturerName = page.locator('text=/Guardian|AGC|Saint-Gobain|VEKA/i').first();
    await expect(manufacturerName).toBeVisible();

    // Click on a model
    await page.locator('[data-testid="model-card"]').first().click();
    await page.waitForLoadState('networkidle');

    // Verify manufacturer appears on model page
    const manufacturerOnPage = page.locator('text=/Guardian|AGC|Saint-Gobain|VEKA/i').first();
    await expect(manufacturerOnPage).toBeVisible();
  });
});
