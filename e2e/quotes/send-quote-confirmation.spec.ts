/**
 * E2E Tests: Post-Submission Messaging (User Story 3)
 *
 * Tests that users see clear, informative confirmation messages after
 * sending quotes, including timeline, vendor contact, and next steps.
 *
 * **Prerequisites**:
 * - Database must be seeded with: Model, GlassType, TenantConfig (with contactPhone)
 * - Authentication must be properly configured
 * - Run: `pnpm db:seed` before running these tests
 *
 * @module e2e/quotes/send-quote-confirmation.spec
 */

import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test.describe('Send Quote - Post-Submission Messaging (US3)', () => {
  let testUserId: string;
  let testQuoteId: string;

  /**
   * Setup: Create test user and draft quote
   * Note: Assumes tenant config already seeded with valid contactPhone
   */
  test.beforeEach(async ({ page }) => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: `test-us3-${Date.now()}@example.com`,
        emailVerified: new Date(),
        name: 'Test User US3',
      },
    });
    testUserId = user.id;

    // Get first available model and glass type (should exist from seed)
    const model = await prisma.model.findFirst();
    const glassType = await prisma.glassType.findFirst();

    if (!(model && glassType)) {
      throw new Error('Database not seeded. Run: pnpm db:seed');
    }

    // Create draft quote
    const quote = await prisma.quote.create({
      data: {
        contactPhone: '+573009999999',
        currency: 'COP',
        items: {
          create: [
            {
              glassTypeId: glassType.id,
              heightMm: 1500,
              modelId: model.id,
              name: 'Test Item',
              quantity: 1,
              subtotal: 150_000,
              widthMm: 1000,
            },
          ],
        },
        projectName: 'Proyecto US3',
        status: 'draft',
        total: 150_000,
        userId: testUserId,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    testQuoteId = quote.id;

    // Mock auth session
    await page.goto(`/api/auth/signin?callbackUrl=/quotes/${testQuoteId}`);
    // TODO: Complete authentication based on your setup
  });

  /**
   * Cleanup: Remove test data
   */
  test.afterEach(async () => {
    if (testQuoteId) {
      await prisma.quoteItem.deleteMany({ where: { quoteId: testQuoteId } });
      await prisma.quote.delete({ where: { id: testQuoteId } });
    }
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } });
    }
  });

  test('should show confirmation message after sending quote', async ({ page }) => {
    await page.goto(`/quotes/${testQuoteId}`);

    // Send quote
    await page.getByRole('button', { name: /enviar cotización/i }).click();
    await page.getByRole('dialog').waitFor({ state: 'visible' });
    await page
      .getByRole('button', { name: /enviar cotización/i })
      .last()
      .click();

    // Wait for status change
    await expect(page.getByText('Enviada')).toBeVisible({ timeout: 10_000 });

    // Verify confirmation message is visible
    const confirmationBox = page.locator('.bg-blue-50, .dark\\:bg-blue-950');
    await expect(confirmationBox).toBeVisible();
  });

  test('should display sentAt date in confirmation message', async ({ page }) => {
    await page.goto(`/quotes/${testQuoteId}`);

    // Send quote
    await page.getByRole('button', { name: /enviar cotización/i }).click();
    await page.getByRole('dialog').waitFor({ state: 'visible' });
    await page
      .getByRole('button', { name: /enviar cotización/i })
      .last()
      .click();

    // Wait for confirmation
    await expect(page.getByText('Enviada')).toBeVisible({ timeout: 10_000 });

    // Verify date message
    await expect(page.getByText(/cotización enviada el/i)).toBeVisible();
  });

  test('should show timeline expectation (24-48 hours)', async ({ page }) => {
    await page.goto(`/quotes/${testQuoteId}`);

    // Send quote
    await page.getByRole('button', { name: /enviar cotización/i }).click();
    await page.getByRole('dialog').waitFor({ state: 'visible' });
    await page
      .getByRole('button', { name: /enviar cotización/i })
      .last()
      .click();

    // Wait for confirmation
    await expect(page.getByText('Enviada')).toBeVisible({ timeout: 10_000 });

    // Verify timeline message
    await expect(page.getByText(/24-48 horas/i)).toBeVisible();
    await expect(page.getByText(/tiempo de respuesta/i)).toBeVisible();
  });

  test('should display vendor contact phone', async ({ page }) => {
    await page.goto(`/quotes/${testQuoteId}`);

    // Send quote
    await page.getByRole('button', { name: /enviar cotización/i }).click();
    await page.getByRole('dialog').waitFor({ state: 'visible' });
    await page
      .getByRole('button', { name: /enviar cotización/i })
      .last()
      .click();

    // Wait for confirmation
    await expect(page.getByText('Enviada')).toBeVisible({ timeout: 10_000 });

    // Verify vendor contact
    await expect(page.getByText(/contacto del fabricante/i)).toBeVisible();
    await expect(page.getByText('+573001112222')).toBeVisible();
  });

  test('should show next steps guidance', async ({ page }) => {
    await page.goto(`/quotes/${testQuoteId}`);

    // Send quote
    await page.getByRole('button', { name: /enviar cotización/i }).click();
    await page.getByRole('dialog').waitFor({ state: 'visible' });
    await page
      .getByRole('button', { name: /enviar cotización/i })
      .last()
      .click();

    // Wait for confirmation
    await expect(page.getByText('Enviada')).toBeVisible({ timeout: 10_000 });

    // Verify next steps
    await expect(page.getByText(/mientras tanto/i)).toBeVisible();
    await expect(page.getByText(/revisar otras cotizaciones/i)).toBeVisible();
  });

  test('should update status badge to "Enviada" in quote list', async ({ page }) => {
    await page.goto(`/quotes/${testQuoteId}`);

    // Send quote
    await page.getByRole('button', { name: /enviar cotización/i }).click();
    await page.getByRole('dialog').waitFor({ state: 'visible' });
    await page
      .getByRole('button', { name: /enviar cotización/i })
      .last()
      .click();

    // Wait for confirmation
    await expect(page.getByText('Enviada')).toBeVisible({ timeout: 10_000 });

    // Navigate back to list
    await page.getByRole('link', { name: /volver a cotizaciones/i }).click();

    // Verify badge in list shows "Enviada"
    await expect(page.getByText('Proyecto US3')).toBeVisible();
    const listItem = page.locator('[data-testid="quote-list-item"]').first();
    await expect(listItem.getByText('Enviada')).toBeVisible();
  });

  test('should show all confirmation elements together', async ({ page }) => {
    await page.goto(`/quotes/${testQuoteId}`);

    // Send quote
    await page.getByRole('button', { name: /enviar cotización/i }).click();
    await page.getByRole('dialog').waitFor({ state: 'visible' });
    await page
      .getByRole('button', { name: /enviar cotización/i })
      .last()
      .click();

    // Wait for confirmation
    await expect(page.getByText('Enviada')).toBeVisible({ timeout: 10_000 });

    // Verify all elements are present
    const confirmationBox = page.locator('.bg-blue-50, .dark\\:bg-blue-950');
    await expect(confirmationBox).toBeVisible();

    // Check icons are present
    const clockIcon = confirmationBox.locator('[data-lucide="clock"]');
    const phoneIcon = confirmationBox.locator('[data-lucide="phone"]');
    await expect(clockIcon).toBeVisible();
    await expect(phoneIcon).toBeVisible();
  });

  test('should persist confirmation message after page reload', async ({ page }) => {
    // First, send the quote
    await page.goto(`/quotes/${testQuoteId}`);
    await page.getByRole('button', { name: /enviar cotización/i }).click();
    await page.getByRole('dialog').waitFor({ state: 'visible' });
    await page
      .getByRole('button', { name: /enviar cotización/i })
      .last()
      .click();
    await expect(page.getByText('Enviada')).toBeVisible({ timeout: 10_000 });

    // Reload page
    await page.reload();

    // Confirmation message should still be visible
    await expect(page.getByText(/cotización enviada el/i)).toBeVisible();
    await expect(page.getByText(/24-48 horas/i)).toBeVisible();
  });

  test('should not show confirmation message for draft quotes', async ({ page }) => {
    await page.goto(`/quotes/${testQuoteId}`);

    // Verify no confirmation message for draft
    const confirmationBox = page.locator('.bg-blue-50, .dark\\:bg-blue-950');
    await expect(confirmationBox).not.toBeVisible();

    // Only draft badge should be visible
    await expect(page.getByText('Borrador')).toBeVisible();
  });

  test('should handle missing vendor contact gracefully', async ({ page }) => {
    // Note: This test assumes tenant config may not have contactPhone
    // If your seed always provides it, this test may not be relevant

    await page.goto(`/quotes/${testQuoteId}`);

    // Send quote
    await page.getByRole('button', { name: /enviar cotización/i }).click();
    await page.getByRole('dialog').waitFor({ state: 'visible' });
    await page
      .getByRole('button', { name: /enviar cotización/i })
      .last()
      .click();
    await expect(page.getByText('Enviada')).toBeVisible({ timeout: 10_000 });

    // Confirmation should show, vendor contact section depends on data
    await expect(page.getByText(/cotización enviada el/i)).toBeVisible();
    await expect(page.getByText(/24-48 horas/i)).toBeVisible();

    // If no contact phone in tenant config, section won't display
    // This is expected behavior, not an error
  });
});
