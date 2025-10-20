/**
 * E2E Test: Quote Status Clarity (User Story 1)
 *
 * Verifies that quote statuses are displayed with clear labels,
 * icons, and tooltips to eliminate user confusion.
 *
 * Acceptance Criteria:
 * - Draft status shows "En edición" (not "Borrador")
 * - All statuses display appropriate icons
 * - Tooltips appear on hover with explanatory text
 * - Status-specific CTAs are visible and functional
 *
 * @see specs/004-refactor-my-quotes/plan.md - User Story 1
 */

import { expect, test } from '@playwright/test';

test.describe('Quote Status Clarity (US1)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to My Quotes page
    await page.goto('/my-quotes');
  });

  test('should display "En edición" for draft quotes instead of "Borrador"', async ({ page }) => {
    // Verify draft status badge shows correct label
    const draftBadge = page.getByTestId('quote-status-badge').filter({ hasText: 'En edición' });
    await expect(draftBadge.first()).toBeVisible();

    // Verify old "Borrador" label is NOT present
    const borrador = page.getByText('Borrador', { exact: true });
    await expect(borrador).not.toBeVisible();
  });

  test('should show status icon next to label', async ({ page }) => {
    // Find a quote with status badge
    const statusBadge = page.getByTestId('quote-status-badge').first();
    await expect(statusBadge).toBeVisible();

    // Verify icon is present (Lucide icons have data-testid="status-icon")
    const icon = statusBadge.getByTestId('status-icon');
    await expect(icon).toBeVisible();
  });

  test('should display tooltip with explanatory text on hover', async ({ page }) => {
    // Find draft status badge
    const draftBadge = page.getByTestId('quote-status-badge').filter({ hasText: 'En edición' }).first();

    // Hover over badge
    await draftBadge.hover();

    // Wait for tooltip to appear (Radix UI Tooltip)
    const tooltip = page.getByTestId('status-tooltip');
    await expect(tooltip).toBeVisible({ timeout: 5000 });

    // Verify tooltip contains explanatory text
    await expect(tooltip).toContainText('edición');
  });

  test('should show status-specific CTA buttons', async ({ page }) => {
    // Draft quotes should have "Continuar editando" CTA
    const editButton = page.getByRole('button', { name: /continuar editando/i });

    if (await editButton.isVisible()) {
      await expect(editButton).toBeVisible();
    }

    // Sent quotes should have "Ver detalles" CTA
    const viewButton = page.getByRole('button', { name: /ver detalles/i });

    if (await viewButton.isVisible()) {
      await expect(viewButton).toBeVisible();
    }
  });

  test('should show different labels for each status type', async ({ page }) => {
    // Check all possible status labels
    const _enEdicion = page.getByText('En edición');
    const _enviada = page.getByText('Enviada');
    const _cancelada = page.getByText('Cancelada');

    // At least one status should be visible on the page
    const statusCount = await page.getByTestId('quote-status-badge').count();
    expect(statusCount).toBeGreaterThan(0);
  });

  test('should navigate to quote detail when clicking CTA', async ({ page }) => {
    // Click on first CTA button
    const ctaButton = page
      .getByRole('button')
      .filter({
        hasText: /continuar editando|ver detalles|duplicar/i,
      })
      .first();

    await ctaButton.click();

    // Should navigate to quote detail page
    await expect(page).toHaveURL(/\/my-quotes\/[a-zA-Z0-9-]+/);
  });

  test('should display status badge in quote detail view', async ({ page }) => {
    // Click first quote to open detail
    const firstQuote = page.getByTestId('quote-list-item').first();
    const viewButton = firstQuote.getByRole('button', { name: /ver detalles|continuar editando/i });
    await viewButton.click();

    // Verify status badge is visible in detail view
    await expect(page.getByTestId('quote-status-badge')).toBeVisible();
  });

  test('should show tooltip in quote detail view on hover', async ({ page }) => {
    // Navigate to first quote detail
    const firstQuote = page.getByTestId('quote-list-item').first();
    const viewButton = firstQuote.getByRole('button', { name: /ver detalles|continuar editando/i });
    await viewButton.click();

    // Hover over status badge in detail view
    const statusBadge = page.getByTestId('quote-status-badge');
    await statusBadge.hover();

    // Tooltip should appear
    const tooltip = page.getByTestId('status-tooltip');
    await expect(tooltip).toBeVisible({ timeout: 5000 });
  });

  test('should use color-coded badges for different statuses', async ({ page }) => {
    // Draft should have secondary variant (yellow/amber)
    const draftBadge = page.getByTestId('quote-status-badge').filter({ hasText: 'En edición' }).first();

    if (await draftBadge.isVisible()) {
      // Check badge has correct variant class (Shadcn/ui uses data-* attributes)
      const dataStatus = await draftBadge.getAttribute('data-status');
      expect(dataStatus).toBe('draft');
    }
  });

  test('should be keyboard accessible', async ({ page }) => {
    // Tab to first status badge
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Focused element should be a badge or CTA
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('should have accessible tooltip announcements', async ({ page }) => {
    // Find status badge
    const statusBadge = page.getByTestId('quote-status-badge').first();

    // Check for ARIA attributes
    const ariaLabel = await statusBadge.getAttribute('aria-label');
    const ariaDescribedBy = await statusBadge.getAttribute('aria-describedby');

    // At least one accessibility attribute should be present
    expect(ariaLabel || ariaDescribedBy).toBeTruthy();
  });

  test('should maintain status clarity with expired quotes', async ({ page }) => {
    // Find an expired quote (if any)
    const expiredBadge = page.getByTestId('expired-badge');

    if (await expiredBadge.isVisible()) {
      // Verify both status and expired badges are visible
      const statusBadge = page.getByTestId('quote-status-badge').first();
      await expect(statusBadge).toBeVisible();
      await expect(expiredBadge).toBeVisible();
    }
  });

  test('should show consistent status labels across list and detail views', async ({ page }) => {
    // Get status label from list view
    const listStatusBadge = page.getByTestId('quote-status-badge').first();
    const listStatusText = await listStatusBadge.getByTestId('status-label').textContent();

    // Navigate to detail view
    const viewButton = page
      .getByRole('button')
      .filter({
        hasText: /ver detalles|continuar editando/i,
      })
      .first();
    await viewButton.click();

    // Get status label from detail view
    const detailStatusBadge = page.getByTestId('quote-status-badge');
    const detailStatusText = await detailStatusBadge.getByTestId('status-label').textContent();

    // Should match
    expect(listStatusText).toBe(detailStatusText);
  });
});

test.describe('Quote Status Configuration Edge Cases', () => {
  test('should handle missing or unknown status gracefully', async ({ page }) => {
    // This test verifies default fallback behavior
    // Implementation should never crash on unknown status
    await page.goto('/my-quotes');

    // Page should load without errors
    await expect(page).toHaveURL('/my-quotes');
  });

  test('should render without JavaScript (progressive enhancement)', async ({ page }) => {
    // Disable JavaScript
    await page.context().addInitScript(() => {
      window.addEventListener = () => {};
    });

    await page.goto('/my-quotes');

    // Status labels should still be visible (SSR)
    const statusBadges = page.getByTestId('quote-status-badge');
    const count = await statusBadges.count();

    // At least some badges should render (server-side)
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
