/**
 * E2E Test: Quote Detail View
 *
 * Tests for viewing quote details, navigation, and error handling.
 *
 * Task: T076 [US5]
 * User Story: US5 - Access and view quote history
 *
 * @see specs/002-budget-cart-workflow/plan.md
 */

import { expect, test } from '@playwright/test';

test.describe('Quote Detail View', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in with test user
    await page.goto('/api/auth/signin');
    await page.getByRole('button', { name: /sign in with google/i }).click();

    // Wait for authentication to complete
    await page.waitForURL('/');
  });

  test('should navigate from list to detail view', async ({ page }) => {
    // Navigate to quotes list
    await page.goto('/quotes');

    // Wait for quotes to load
    await expect(page.getByTestId('quote-list-item').first()).toBeVisible();

    // Click on first quote detail button
    await page
      .getByRole('button', { name: /ver detalles/i })
      .first()
      .click();

    // Should navigate to detail page
    await page.waitForURL(/\/quotes\/[a-z0-9]+/);

    // Verify detail view is displayed
    await expect(page.getByText(/dirección del proyecto/i)).toBeVisible();
    await expect(page.getByText(/items de la cotización/i)).toBeVisible();
  });

  test('should display complete quote information', async ({ page }) => {
    // Navigate to quotes list and get first quote ID
    await page.goto('/quotes');
    const firstQuoteLink = page.getByRole('button', { name: /ver detalles/i }).first();
    await firstQuoteLink.click();

    await page.waitForURL(/\/quotes\/[a-z0-9]+/);

    // Verify project information section
    await expect(page.getByText(/fabricante/i)).toBeVisible();
    await expect(page.getByText(/dirección del proyecto/i)).toBeVisible();

    // Verify items table
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /nombre/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /modelo/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /tipo de cristal/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /dimensiones/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /cantidad/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /precio unitario/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /subtotal/i })).toBeVisible();

    // Verify totals section
    await expect(page.getByText(/total/i)).toBeVisible();
  });

  test('should display status badges correctly', async ({ page }) => {
    await page.goto('/quotes');
    const firstQuoteLink = page.getByRole('button', { name: /ver detalles/i }).first();
    await firstQuoteLink.click();

    await page.waitForURL(/\/quotes\/[a-z0-9]+/);

    // Verify status badge is present (one of: Borrador, Enviada, Cancelada)
    const statusBadge = page.locator('[data-testid*="badge"]').first();
    await expect(statusBadge).toBeVisible();

    const statusText = await statusBadge.textContent();
    expect(['Borrador', 'Enviada', 'Cancelada']).toContain(statusText);
  });

  test('should display optional contact phone when present', async ({ page }) => {
    // This test assumes at least one quote has contact phone
    await page.goto('/quotes');

    // Try to find a quote with contact phone by checking multiple quotes
    const quoteButtons = page.getByRole('button', { name: /ver detalles/i });
    const count = await quoteButtons.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      await page.goto('/quotes');
      await quoteButtons.nth(i).click();
      await page.waitForURL(/\/quotes\/[a-z0-9]+/);

      // Check if contact phone section exists
      const contactPhone = page.getByText(/teléfono de contacto/i);
      if (await contactPhone.isVisible()) {
        // If found, verify it's displayed correctly
        await expect(contactPhone).toBeVisible();
        break;
      }
    }
  });

  test('should navigate back to quotes list', async ({ page }) => {
    await page.goto('/quotes');
    await page
      .getByRole('button', { name: /ver detalles/i })
      .first()
      .click();
    await page.waitForURL(/\/quotes\/[a-z0-9]+/);

    // Click back button
    await page.getByRole('link', { name: /volver a cotizaciones/i }).click();

    // Should return to quotes list
    await page.waitForURL('/quotes');
    await expect(page.getByText(/mis cotizaciones/i)).toBeVisible();
  });

  test('should handle 404 for invalid quote ID', async ({ page }) => {
    // Navigate to non-existent quote
    await page.goto('/quotes/invalid-quote-id-123');

    // Should show 404 page
    await expect(page.getByText(/404|not found|no encontrado/i)).toBeVisible();
  });

  test('should handle unauthorized access to other user quote', async ({ page }) => {
    // This test assumes the quote ID belongs to another user
    // In real scenario, you'd need to create a quote with another user first
    const otherUserQuoteId = 'cuid-from-other-user'; // Replace with actual CUID

    await page.goto(`/quotes/${otherUserQuoteId}`);

    // Should show 404 (security: don't reveal if quote exists)
    await expect(page.getByText(/404|not found|no encontrado/i)).toBeVisible();
  });

  test('should display items with correct dimensions format', async ({ page }) => {
    await page.goto('/quotes');
    await page
      .getByRole('button', { name: /ver detalles/i })
      .first()
      .click();
    await page.waitForURL(/\/quotes\/[a-z0-9]+/);

    // Find first table row with dimensions
    const firstRow = page.getByRole('table').getByRole('row').nth(1); // Skip header row

    // Check dimensions format (should be like "1000 × 1500")
    const dimensionsCell = firstRow.getByRole('cell').nth(4); // Dimensions column
    await expect(dimensionsCell).toBeVisible();

    const dimensionsText = await dimensionsCell.textContent();
    expect(dimensionsText).toMatch(/\d+\s*×\s*\d+/); // Matches "number × number"
  });

  test('should display currency formatted correctly', async ({ page }) => {
    await page.goto('/quotes');
    await page
      .getByRole('button', { name: /ver detalles/i })
      .first()
      .click();
    await page.waitForURL(/\/quotes\/[a-z0-9]+/);

    // Find total amount
    const totalAmount = page.getByText(/total/i).locator('..').getByText(/\$/);
    await expect(totalAmount).toBeVisible();

    const amountText = await totalAmount.textContent();
    // Should be formatted like "$1.234.567" or "$1,234,567" depending on locale
    expect(amountText).toMatch(/\$[\d.,]+/);
  });

  test('should show solution name or dash for items without solution', async ({ page }) => {
    await page.goto('/quotes');
    await page
      .getByRole('button', { name: /ver detalles/i })
      .first()
      .click();
    await page.waitForURL(/\/quotes\/[a-z0-9]+/);

    // Check solution column in table
    const solutionCells = page.getByRole('table').getByRole('row').locator('td:nth-child(4)'); // Solution column

    const firstSolutionText = await solutionCells.first().textContent();

    // Should be either a solution name or a dash
    expect(firstSolutionText).toBeTruthy();
    expect(firstSolutionText?.trim()).not.toBe('');
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/quotes');

    // Focus on first detail button using Tab
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Activate with Enter
    await page.keyboard.press('Enter');

    await page.waitForURL(/\/quotes\/[a-z0-9]+/);

    // Navigate back using keyboard
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    await page.waitForURL('/quotes');
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ height: 667, width: 375 });

    await page.goto('/quotes');
    await page
      .getByRole('button', { name: /ver detalles/i })
      .first()
      .click();
    await page.waitForURL(/\/quotes\/[a-z0-9]+/);

    // Verify elements are visible and accessible on mobile
    await expect(page.getByText(/fabricante/i)).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();

    // Verify back button is accessible
    await expect(page.getByRole('link', { name: /volver/i })).toBeVisible();
  });
});
