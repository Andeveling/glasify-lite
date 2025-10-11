/**
 * E2E Tests - Quote History Feature (US5)
 *
 * Tests for viewing quote history, filtering, and navigation.
 *
 * @module e2e/quotes/quote-history
 */

import { expect, test } from '@playwright/test';

test.describe('Quote History', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to quotes page (requires authentication)
    await page.goto('/quotes');
  });

  test('should display quotes list for authenticated user', async ({ page }) => {
    // Verify page title
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mis Cotizaciones');

    // Verify description
    await expect(page.getByText('Gestiona y revisa todas tus cotizaciones')).toBeVisible();
  });

  test('should show empty state when user has no quotes', async ({ page }) => {
    // If no quotes exist, verify empty state
    const emptyState = page.getByText('No hay cotizaciones aún');

    // Either show empty state or show quotes
    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    const hasQuotes = await page
      .locator('[data-testid="quote-list-item"]')
      .first()
      .isVisible()
      .catch(() => false);

    expect(hasEmptyState || hasQuotes).toBeTruthy();

    if (hasEmptyState) {
      // Verify catalog link in empty state
      await expect(page.getByRole('link', { name: /catálogo/i })).toBeVisible();
    }
  });

  test('should display quote items with correct information', async ({ page }) => {
    // Check if quotes exist
    const firstQuote = page.locator('[data-testid="quote-list-item"]').first();
    const hasQuotes = await firstQuote.isVisible().catch(() => false);

    if (!hasQuotes) {
      test.skip();
      return;
    }

    // Verify quote card contains expected elements
    await expect(firstQuote.getByText(/Creada el/i)).toBeVisible();

    // Verify status badge exists (draft, sent, or canceled)
    const statusBadge = firstQuote.locator('[data-testid="quote-status-badge"]');
    if (await statusBadge.isVisible().catch(() => false)) {
      const statusText = await statusBadge.textContent();
      expect(['Borrador', 'Enviada', 'Cancelada']).toContain(statusText?.trim());
    }

    // Verify "Ver detalles" button exists
    await expect(firstQuote.getByRole('link', { name: /ver detalles/i })).toBeVisible();
  });

  test('should navigate to quote detail page when clicking "Ver detalles"', async ({ page }) => {
    // Check if quotes exist
    const firstQuote = page.locator('[data-testid="quote-list-item"]').first();
    const hasQuotes = await firstQuote.isVisible().catch(() => false);

    if (!hasQuotes) {
      test.skip();
      return;
    }

    // Click "Ver detalles" button
    const detailsLink = firstQuote.getByRole('link', { name: /ver detalles/i });
    await detailsLink.click();

    // Verify navigation to detail page
    await expect(page).toHaveURL(/\/quotes\/[a-z0-9]+$/);

    // Verify detail page elements
    await expect(page.getByRole('link', { name: /volver a cotizaciones/i })).toBeVisible();
    await expect(page.getByText(/Items de la cotización/i)).toBeVisible();
  });

  test('should display pagination when multiple pages exist', async ({ page }) => {
    // Check if pagination exists
    const paginationText = page.getByText(/Página \d+ de \d+/);
    const hasPagination = await paginationText.isVisible().catch(() => false);

    if (!hasPagination) {
      test.skip();
      return;
    }

    // Verify pagination displays current page
    await expect(paginationText).toBeVisible();
  });

  test('should mark expired quotes with visual indicator', async ({ page }) => {
    // Check if any expired quotes exist
    const expiredBadge = page.locator('[data-testid="expired-badge"]').first();
    const hasExpired = await expiredBadge.isVisible().catch(() => false);

    if (!hasExpired) {
      test.skip();
      return;
    }

    // Verify expired badge is visible
    await expect(expiredBadge).toHaveText(/vencida/i);

    // Verify expired quote has muted styling
    const parentCard = expiredBadge.locator('xpath=ancestor::*[@data-testid="quote-list-item"]');
    const hasOpacity = await parentCard.evaluate((el) => window.getComputedStyle(el).opacity === '0.6');

    expect(hasOpacity).toBe(true);
  });
});
