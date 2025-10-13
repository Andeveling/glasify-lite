/**
 * E2E Test: PDF Export
 *
 * Tests the complete user flow for exporting a quote as PDF.
 * Validates button click, loading states, file download, and filename format.
 *
 * Test-First: These tests should FAIL until T046 is implemented
 */

import { expect, test } from '@playwright/test';

test.describe('Quote PDF Export', () => {
  test('should display PDF export button on quote detail page', async ({ page }) => {
    // Navigate to a quote detail page (test will fail - page not set up yet)
    await page.goto('/my-quotes/test-quote-id');

    // Look for PDF export button
    const pdfButton = page.getByRole('button', { name: /exportar pdf/i });
    await expect(pdfButton).toBeVisible();
  });

  test('should show loading state when generating PDF', async ({ page }) => {
    await page.goto('/my-quotes/test-quote-id');

    const pdfButton = page.getByRole('button', { name: /exportar pdf/i });
    await pdfButton.click();

    // Should show loading indicator
    await expect(pdfButton).toBeDisabled();
    await expect(pdfButton).toContainText(/generando/i);
  });

  test('should download PDF with correct filename', async ({ page }) => {
    await page.goto('/my-quotes/test-quote-id');

    // Listen for download
    const downloadPromise = page.waitForEvent('download');
    const pdfButton = page.getByRole('button', { name: /exportar pdf/i });
    await pdfButton.click();

    const download = await downloadPromise;

    // Verify filename format: Cotizacion_ProjectName_YYYY-MM-DD.pdf
    expect(download.suggestedFilename()).toMatch(/^Cotizacion_.*_\d{4}-\d{2}-\d{2}\.pdf$/);
  });

  test('should handle export errors gracefully', async ({ page }) => {
    // Test with invalid quote ID
    await page.goto('/my-quotes/invalid-id');

    const pdfButton = page.getByRole('button', { name: /exportar pdf/i });
    await pdfButton.click();

    // Should show error toast
    const errorToast = page.getByText(/error al generar pdf/i);
    await expect(errorToast).toBeVisible();
  });
});
