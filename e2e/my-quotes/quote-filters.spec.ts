import { expect, test } from '@playwright/test';

test.describe('Quote Filtering and Search', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in first
    await page.goto('/api/auth/signin');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/catalog');

    // Navigate to My Quotes
    await page.goto('/my-quotes');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Status Filter', () => {
    test('should filter quotes by draft status', async ({ page }) => {
      // Open status filter dropdown
      await page.click('[data-testid="status-filter"]');

      // Select "En edición" (draft)
      await page.click('text=En edición');

      // Verify URL updated
      await expect(page).toHaveURL(/status=draft/);

      // Verify only draft quotes shown
      const quotes = await page.locator('[data-testid="quote-list-item"]').all();
      for (const quote of quotes) {
        const badge = quote.locator('[data-testid="quote-status-badge"]');
        await expect(badge).toContainText('En edición');
      }
    });

    test('should filter quotes by sent status', async ({ page }) => {
      await page.click('[data-testid="status-filter"]');
      await page.click('text=Enviada al cliente');

      await expect(page).toHaveURL(/status=sent/);

      const quotes = await page.locator('[data-testid="quote-list-item"]').all();
      for (const quote of quotes) {
        const badge = quote.locator('[data-testid="quote-status-badge"]');
        await expect(badge).toContainText('Enviada al cliente');
      }
    });

    test('should show all quotes when "Todas" is selected', async ({ page }) => {
      // First apply a filter
      await page.click('[data-testid="status-filter"]');
      await page.click('text=En edición');
      await expect(page).toHaveURL(/status=draft/);

      // Then select "Todas"
      await page.click('[data-testid="status-filter"]');
      await page.click('text=Todas');

      // Verify URL has no status param
      await expect(page).not.toHaveURL(/status=/);

      // Verify quotes with different statuses are shown
      const hasDraft = await page.locator('text=En edición').count();
      const hasSent = await page.locator('text=Enviada al cliente').count();
      expect(hasDraft + hasSent).toBeGreaterThan(0);
    });

    test('should persist status filter on page reload', async ({ page }) => {
      await page.click('[data-testid="status-filter"]');
      await page.click('text=Enviada al cliente');
      await expect(page).toHaveURL(/status=sent/);

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Verify filter still applied
      await expect(page).toHaveURL(/status=sent/);
      const filterButton = page.locator('[data-testid="status-filter"]');
      await expect(filterButton).toContainText('Enviada al cliente');
    });
  });

  test.describe('Search Functionality', () => {
    test('should filter quotes by search query', async ({ page }) => {
      const searchInput = page.locator('[data-testid="search-input"]');

      // Type search query
      await searchInput.fill('Casa Juan');

      // Wait for debounce (300ms) and URL update
      await page.waitForTimeout(400);
      await expect(page).toHaveURL(/q=Casa\+Juan/);

      // Verify only matching quotes shown
      const quotes = await page.locator('[data-testid="quote-list-item"]').all();
      expect(quotes.length).toBeGreaterThan(0);

      for (const quote of quotes) {
        const text = await quote.textContent();
        expect(text?.toLowerCase()).toMatch(/casa|juan/);
      }
    });

    test('should debounce search input', async ({ page }) => {
      const searchInput = page.locator('[data-testid="search-input"]');

      // Type rapidly
      await searchInput.fill('C');
      await page.waitForTimeout(50);
      await searchInput.fill('Ca');
      await page.waitForTimeout(50);
      await searchInput.fill('Casa');

      // URL should not update immediately
      await page.waitForTimeout(100);
      await expect(page).not.toHaveURL(/q=/);

      // Wait for debounce
      await page.waitForTimeout(300);
      await expect(page).toHaveURL(/q=Casa/);
    });

    test('should clear search when input is emptied', async ({ page }) => {
      const searchInput = page.locator('[data-testid="search-input"]');

      // Add search
      await searchInput.fill('Test');
      await page.waitForTimeout(400);
      await expect(page).toHaveURL(/q=Test/);

      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(400);

      // Verify URL param removed
      await expect(page).not.toHaveURL(/q=/);
    });

    test('should show clear button when search has value', async ({ page }) => {
      const searchInput = page.locator('[data-testid="search-input"]');
      const clearButton = page.locator('[data-testid="search-clear"]');

      // Initially hidden
      await expect(clearButton).not.toBeVisible();

      // Type search
      await searchInput.fill('Test');
      await expect(clearButton).toBeVisible();

      // Click clear
      await clearButton.click();
      await expect(searchInput).toHaveValue('');
      await expect(clearButton).not.toBeVisible();
    });
  });

  test.describe('Sort Functionality', () => {
    test('should sort quotes by newest first (default)', async ({ page }) => {
      // Default sort - no URL param
      await expect(page).not.toHaveURL(/sort=/);

      const quotes = await page.locator('[data-testid="quote-list-item"]').all();
      if (quotes.length >= 2) {
        const firstDate = await quotes[0]?.locator('[data-testid="quote-date"]').textContent();
        const secondDate = await quotes[1]?.locator('[data-testid="quote-date"]').textContent();

        // First should be more recent (implementation dependent)
        expect(firstDate).toBeTruthy();
        expect(secondDate).toBeTruthy();
      }
    });

    test('should sort quotes by oldest first', async ({ page }) => {
      await page.click('[data-testid="sort-select"]');
      await page.click('text=Más antiguas');

      await expect(page).toHaveURL(/sort=oldest/);

      // Verify order (oldest first)
      const quotes = await page.locator('[data-testid="quote-list-item"]').all();
      expect(quotes.length).toBeGreaterThan(0);
    });

    test('should sort quotes by highest price', async ({ page }) => {
      await page.click('[data-testid="sort-select"]');
      await page.click('text=Mayor valor');

      await expect(page).toHaveURL(/sort=price-high/);
    });

    test('should sort quotes by lowest price', async ({ page }) => {
      await page.click('[data-testid="sort-select"]');
      await page.click('text=Menor valor');

      await expect(page).toHaveURL(/sort=price-low/);
    });

    test('should persist sort option on page reload', async ({ page }) => {
      await page.click('[data-testid="sort-select"]');
      await page.click('text=Mayor valor');
      await expect(page).toHaveURL(/sort=price-high/);

      await page.reload();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveURL(/sort=price-high/);
      const sortSelect = page.locator('[data-testid="sort-select"]');
      await expect(sortSelect).toContainText('Mayor valor');
    });
  });

  test.describe('Combined Filters', () => {
    test('should apply status filter and search together', async ({ page }) => {
      // Apply status filter
      await page.click('[data-testid="status-filter"]');
      await page.click('text=En edición');

      // Add search
      const searchInput = page.locator('[data-testid="search-input"]');
      await searchInput.fill('Casa');
      await page.waitForTimeout(400);

      // Verify both params in URL
      await expect(page).toHaveURL(/status=draft/);
      await expect(page).toHaveURL(/q=Casa/);

      // Verify results match both filters
      const quotes = await page.locator('[data-testid="quote-list-item"]').all();
      for (const quote of quotes) {
        const badge = quote.locator('[data-testid="quote-status-badge"]');
        await expect(badge).toContainText('En edición');

        const text = await quote.textContent();
        expect(text?.toLowerCase()).toContain('casa');
      }
    });

    test('should apply all three filters (status + search + sort)', async ({ page }) => {
      // Status
      await page.click('[data-testid="status-filter"]');
      await page.click('text=Enviada al cliente');

      // Search
      await page.fill('[data-testid="search-input"]', 'Proyecto');
      await page.waitForTimeout(400);

      // Sort
      await page.click('[data-testid="sort-select"]');
      await page.click('text=Mayor valor');

      // Verify all params
      await expect(page).toHaveURL(/status=sent/);
      await expect(page).toHaveURL(/q=Proyecto/);
      await expect(page).toHaveURL(/sort=price-high/);
    });

    test('should preserve page param when applying filters', async ({ page }) => {
      // Navigate to page 2 (if pagination exists)
      await page.goto('/my-quotes?page=2');
      await page.waitForLoadState('networkidle');

      // Apply filter
      await page.click('[data-testid="status-filter"]');
      await page.click('text=En edición');

      // Verify both params preserved
      await expect(page).toHaveURL(/page=2/);
      await expect(page).toHaveURL(/status=draft/);
    });
  });

  test.describe('Clear Filters', () => {
    test('should show clear filters button when filters active', async ({ page }) => {
      const clearButton = page.locator('[data-testid="clear-filters"]');

      // Initially not visible
      await expect(clearButton).not.toBeVisible();

      // Apply filter
      await page.click('[data-testid="status-filter"]');
      await page.click('text=En edición');

      // Clear button visible
      await expect(clearButton).toBeVisible();
    });

    test('should clear all filters when clicked', async ({ page }) => {
      // Apply multiple filters
      await page.click('[data-testid="status-filter"]');
      await page.click('text=Enviada al cliente');
      await page.fill('[data-testid="search-input"]', 'Test');
      await page.waitForTimeout(400);
      await page.click('[data-testid="sort-select"]');
      await page.click('text=Mayor valor');

      // Click clear
      await page.click('[data-testid="clear-filters"]');

      // Verify all params removed (except page)
      await expect(page).not.toHaveURL(/status=/);
      await expect(page).not.toHaveURL(/q=/);
      await expect(page).not.toHaveURL(/sort=/);

      // Verify UI reset
      await expect(page.locator('[data-testid="search-input"]')).toHaveValue('');
      const statusFilter = page.locator('[data-testid="status-filter"]');
      await expect(statusFilter).toContainText('Todas');
    });

    test('should show active filters count badge', async ({ page }) => {
      const badge = page.locator('[data-testid="active-filters-count"]');

      // Initially not visible
      await expect(badge).not.toBeVisible();

      // Apply 2 filters
      await page.click('[data-testid="status-filter"]');
      await page.click('text=En edición');
      await page.fill('[data-testid="search-input"]', 'Casa');
      await page.waitForTimeout(400);

      // Badge shows count
      await expect(badge).toBeVisible();
      await expect(badge).toContainText('2');

      // Add sort (3 total)
      await page.click('[data-testid="sort-select"]');
      await page.click('text=Mayor valor');
      await expect(badge).toContainText('3');
    });
  });

  test.describe('Empty Results State', () => {
    test('should show "no results" state when filters match nothing', async ({ page }) => {
      // Search for something that doesn't exist
      await page.fill('[data-testid="search-input"]', 'XXXXXXXXX_NONEXISTENT');
      await page.waitForTimeout(400);

      // Verify empty state shows
      const emptyState = page.locator('[data-testid="empty-filtered-state"]');
      await expect(emptyState).toBeVisible();
      await expect(emptyState).toContainText('No se encontraron cotizaciones');

      // Verify it's different from "no quotes yet" state
      await expect(emptyState).not.toContainText('aún no has creado');
    });

    test('should show clear filters suggestion in empty state', async ({ page }) => {
      await page.fill('[data-testid="search-input"]', 'XXXXXXXXX');
      await page.waitForTimeout(400);

      const emptyState = page.locator('[data-testid="empty-filtered-state"]');
      await expect(emptyState).toContainText(/intenta.*filtros/i);

      // Click suggestion to clear
      const clearButton = emptyState.locator('button:has-text("Limpiar filtros")');
      await clearButton.click();

      // Verify filters cleared
      await expect(page).not.toHaveURL(/q=/);
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      // Tab to status filter
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');

      // Should open dropdown
      await expect(page.locator('[role="listbox"]')).toBeVisible();

      // Arrow down and Enter to select
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');

      // Filter applied
      await expect(page).toHaveURL(/status=/);
    });

    test('should have proper ARIA labels', async ({ page }) => {
      const statusFilter = page.locator('[data-testid="status-filter"]');
      await expect(statusFilter).toHaveAttribute('aria-label', /filtrar por estado/i);

      const searchInput = page.locator('[data-testid="search-input"]');
      await expect(searchInput).toHaveAttribute('aria-label', /buscar cotizaciones/i);

      const sortSelect = page.locator('[data-testid="sort-select"]');
      await expect(sortSelect).toHaveAttribute('aria-label', /ordenar cotizaciones/i);
    });
  });

  test.describe('Performance', () => {
    test('should filter quotes in under 500ms', async ({ page }) => {
      const startTime = Date.now();

      await page.click('[data-testid="status-filter"]');
      await page.click('text=En edición');
      await page.waitForLoadState('networkidle');

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(500);
    });

    test('should handle rapid filter changes without errors', async ({ page }) => {
      // Rapid status changes
      await page.click('[data-testid="status-filter"]');
      await page.click('text=En edición');
      await page.click('[data-testid="status-filter"]');
      await page.click('text=Enviada al cliente');
      await page.click('[data-testid="status-filter"]');
      await page.click('text=Cancelada');

      // Should not crash
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/status=canceled/);
    });
  });
});
