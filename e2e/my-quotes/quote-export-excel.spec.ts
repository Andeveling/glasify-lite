/**
 * E2E Test: Excel Export
 *
 * Tests the complete user flow for exporting a quote as Excel.
 * Validates button click, file download, and filename format.
 *
 * Test-First: These tests should FAIL until T046 is implemented
 */

import { expect, test } from "@playwright/test";

// Regex constants for performance
const EXPORT_EXCEL_REGEX = /exportar excel/i;
const GENERATING_REGEX = /generando/i;
const EXCEL_FILENAME_REGEX = /^Cotizacion_.*_\d{4}-\d{2}-\d{2}\.xlsx$/;
const EXCEL_ERROR_REGEX = /error al generar excel/i;
const EXPORT_PDF_REGEX = /exportar pdf/i;

test.describe("Quote Excel Export", () => {
  test("should display Excel export button on quote detail page", async ({
    page,
  }) => {
    // Navigate to a quote detail page (test will fail - page not set up yet)
    await page.goto("/my-quotes/test-quote-id");

    // Look for Excel export button
    const excelButton = page.getByRole("button", { name: EXPORT_EXCEL_REGEX });
    await expect(excelButton).toBeVisible();
  });

  test("should show loading state when generating Excel", async ({ page }) => {
    await page.goto("/my-quotes/test-quote-id");

    const excelButton = page.getByRole("button", { name: EXPORT_EXCEL_REGEX });
    await excelButton.click();

    // Should show loading indicator
    await expect(excelButton).toBeDisabled();
    await expect(excelButton).toContainText(GENERATING_REGEX);
  });

  test("should download Excel with correct filename", async ({ page }) => {
    await page.goto("/my-quotes/test-quote-id");

    // Listen for download
    const downloadPromise = page.waitForEvent("download");
    const excelButton = page.getByRole("button", { name: EXPORT_EXCEL_REGEX });
    await excelButton.click();

    const download = await downloadPromise;

    // Verify filename format: Cotizacion_ProjectName_YYYY-MM-DD.xlsx
    expect(download.suggestedFilename()).toMatch(EXCEL_FILENAME_REGEX);
  });

  test("should handle export errors gracefully", async ({ page }) => {
    // Test with invalid quote ID
    await page.goto("/my-quotes/invalid-id");

    const excelButton = page.getByRole("button", { name: EXPORT_EXCEL_REGEX });
    await excelButton.click();

    // Should show error toast
    const errorToast = page.getByText(EXCEL_ERROR_REGEX);
    await expect(errorToast).toBeVisible();
  });

  test("should export both PDF and Excel from same quote", async ({ page }) => {
    await page.goto("/my-quotes/test-quote-id");

    // Both buttons should be available
    const pdfButton = page.getByRole("button", { name: EXPORT_PDF_REGEX });
    const excelButton = page.getByRole("button", { name: EXPORT_EXCEL_REGEX });

    await expect(pdfButton).toBeVisible();
    await expect(excelButton).toBeVisible();
  });
});
