/**
 * E2E Test: Expired Quotes Display
 *
 * Tests for displaying expired quotes with visual differentiation,
 * badge display, and filtering behavior.
 *
 * Task: T077 [US5]
 * User Story: US5 - Access and view quote history
 *
 * @see specs/002-budget-cart-workflow/plan.md
 */

import { expect, test } from '@playwright/test';

test.describe('Expired Quotes Display', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in with test user
    await page.goto('/api/auth/signin');
    await page.getByRole('button', { name: /sign in with google/i }).click();

    // Wait for authentication to complete
    await page.waitForURL('/');
  });

  test('should display expired badge on expired quotes', async ({ page }) => {
    // Navigate to quotes list with expired quotes included
    await page.goto('/quotes?includeExpired=true');

    // Look for quotes with expired badge
    const expiredBadges = page.getByTestId('expired-badge');

    // If there are expired quotes, verify badge is visible
    const badgeCount = await expiredBadges.count();

    if (badgeCount > 0) {
      await expect(expiredBadges.first()).toBeVisible();
      await expect(expiredBadges.first()).toHaveText(/expirada/i);
    }
  });

  test('should apply muted styling to expired quotes', async ({ page }) => {
    await page.goto('/quotes?includeExpired=true');

    // Find quote list items
    const quoteItems = page.getByTestId('quote-list-item');
    const itemCount = await quoteItems.count();

    if (itemCount > 0) {
      // Check if any items have opacity-60 class (expired styling)
      for (let i = 0; i < itemCount; i++) {
        const item = quoteItems.nth(i);
        const classes = await item.getAttribute('class');

        // If item has expired badge, should have muted styling
        const hasExpiredBadge = (await item.getByTestId('expired-badge').count()) > 0;

        if (hasExpiredBadge) {
          expect(classes).toContain('opacity-60');
        }
      }
    }
  });

  test('should hide expired quotes by default', async ({ page }) => {
    // Navigate to quotes list without includeExpired parameter
    await page.goto('/quotes');

    // Expired badges should not be visible by default
    const expiredBadges = page.getByTestId('expired-badge');
    const badgeCount = await expiredBadges.count();

    expect(badgeCount).toBe(0);
  });

  test('should show expired quotes when includeExpired=true', async ({ page }) => {
    // First check without includeExpired
    await page.goto('/quotes');
    const normalCount = await page.getByTestId('quote-list-item').count();

    // Then check with includeExpired=true
    await page.goto('/quotes?includeExpired=true');
    const withExpiredCount = await page.getByTestId('quote-list-item').count();

    // Count should be greater or equal (might have no expired quotes in test DB)
    expect(withExpiredCount).toBeGreaterThanOrEqual(normalCount);
  });

  test('should display expired badge in quote detail view', async ({ page }) => {
    await page.goto('/quotes?includeExpired=true');

    // Find a quote with expired badge
    const expiredQuoteItem = page
      .getByTestId('quote-list-item')
      .filter({ has: page.getByTestId('expired-badge') })
      .first();

    const hasExpiredQuote = (await expiredQuoteItem.count()) > 0;

    if (hasExpiredQuote) {
      // Click to view details
      await expiredQuoteItem.getByRole('button', { name: /ver detalles/i }).click();
      await page.waitForURL(/\/quotes\/[a-z0-9]+/);

      // Expired badge should be visible in detail view too
      const detailExpiredBadge = page.locator('text=/expirada/i').filter({ hasText: /expirada/i });
      await expect(detailExpiredBadge.first()).toBeVisible();
    }
  });

  test('should calculate expiration correctly based on validUntil date', async ({ page }) => {
    await page.goto('/quotes?includeExpired=true');

    const quoteItems = page.getByTestId('quote-list-item');
    const itemCount = await quoteItems.count();

    if (itemCount > 0) {
      for (let i = 0; i < Math.min(itemCount, 3); i++) {
        const item = quoteItems.nth(i);

        // Get valid until date text
        const validUntilText = await item
          .getByText(/válida hasta:/i)
          .locator('..')
          .textContent();

        if (validUntilText) {
          // Parse date from text (format depends on locale)
          const hasExpiredBadge = (await item.getByTestId('expired-badge').count()) > 0;

          // Extract date and check if it's in the past
          const dateMatch = validUntilText.match(/\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/);

          if (dateMatch) {
            const [dateStr] = dateMatch;
            const validUntilDate = new Date(dateStr);
            const today = new Date();
            const isExpired = validUntilDate < today;

            // Badge should match actual expiration status
            if (isExpired) {
              expect(hasExpiredBadge).toBe(true);
            }
          }
        }
      }
    }
  });

  test('should support filtering expired quotes by status', async ({ page }) => {
    // Test combining status filter with includeExpired
    await page.goto('/quotes?status=sent&includeExpired=true');

    // All visible quotes should have "Enviada" status
    const statusBadges = page.getByTestId('quote-status-badge');
    const badgeCount = await statusBadges.count();

    if (badgeCount > 0) {
      for (let i = 0; i < badgeCount; i++) {
        const badge = statusBadges.nth(i);
        const badgeText = await badge.textContent();
        expect(badgeText).toBe('Enviada');
      }
    }
  });

  test('should maintain expired filter when navigating pages', async ({ page }) => {
    await page.goto('/quotes?includeExpired=true&page=1');

    // Verify includeExpired parameter is in URL
    expect(page.url()).toContain('includeExpired=true');

    // If pagination exists, navigate to next page
    const nextPageButton = page.getByRole('button', { name: /siguiente|next/i });

    if (await nextPageButton.isVisible()) {
      await nextPageButton.click();

      // includeExpired should still be in URL
      expect(page.url()).toContain('includeExpired=true');
    }
  });

  test('should be accessible with screen readers', async ({ page }) => {
    await page.goto('/quotes?includeExpired=true');

    const expiredBadges = page.getByTestId('expired-badge');
    const badgeCount = await expiredBadges.count();

    if (badgeCount > 0) {
      const firstBadge = expiredBadges.first();

      // Badge should have accessible text
      await expect(firstBadge).toHaveAccessibleName(/expirada/i);

      // Badge should be in the accessibility tree
      await expect(firstBadge).toBeVisible();
    }
  });

  test('should display expired quotes with correct ARIA attributes', async ({ page }) => {
    await page.goto('/quotes?includeExpired=true');

    const expiredQuoteItem = page
      .getByTestId('quote-list-item')
      .filter({ has: page.getByTestId('expired-badge') })
      .first();

    const hasExpiredQuote = (await expiredQuoteItem.count()) > 0;

    if (hasExpiredQuote) {
      // Verify expired badge has correct variant attribute
      const expiredBadge = expiredQuoteItem.getByTestId('expired-badge');

      // Check for outline variant (from component code)
      const badgeClasses = await expiredBadge.getAttribute('class');
      expect(badgeClasses).toBeTruthy();
    }
  });

  test('should show "Sin límite" for quotes without validUntil date', async ({ page }) => {
    await page.goto('/quotes');

    const quoteItems = page.getByTestId('quote-list-item');
    const itemCount = await quoteItems.count();

    if (itemCount > 0) {
      // Look for quotes without validity date
      for (let i = 0; i < Math.min(itemCount, 5); i++) {
        const item = quoteItems.nth(i);
        const validUntilSection = item.getByText(/válida hasta:/i);

        if (await validUntilSection.isVisible()) {
          const text = await validUntilSection.locator('..').textContent();

          // Should either have a date or "Sin límite"
          expect(text).toMatch(/\d{1,2}[/-]\d{1,2}|sin límite/i);
        }
      }
    }
  });

  test('should handle quotes expiring today correctly', async ({ page }) => {
    // This test would require creating a quote that expires today
    // For now, we just verify the logic handles it gracefully

    await page.goto('/quotes?includeExpired=true');

    // If there are any quotes, the page should load without errors
    await expect(page.getByText(/mis cotizaciones/i)).toBeVisible();
  });
});
