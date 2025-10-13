/**
 * E2E Tests: Contact Info Pre-fill (User Story 2)
 *
 * Tests contact information modal behavior with pre-filled data,
 * validation errors, and user editing scenarios.
 *
 * @module e2e/quotes/send-quote-contact-info.spec
 */

import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test.describe('Send Quote - Contact Info Pre-fill (US2)', () => {
  let testUserId: string;
  let quoteWithPhoneId: string;
  let quoteWithoutPhoneId: string;

  /**
   * Setup: Create test user and two quotes (one with phone, one without)
   */
  test.beforeEach(async ({ page }) => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: `test-contact-${Date.now()}@example.com`,
        emailVerified: new Date(),
        name: 'Test User',
      },
    });
    testUserId = user.id;

    const model = (await prisma.model.findFirst())!;
    const glassType = (await prisma.glassType.findFirst())!;

    // Quote WITH existing contactPhone
    const quoteWithPhone = await prisma.quote.create({
      data: {
        contactPhone: '+573001234567', // Pre-existing phone
        currency: 'COP',
        items: {
          create: [
            {
              glassTypeId: glassType.id,
              heightMm: 1500,
              modelId: model.id,
              name: 'Item 1',
              quantity: 1,
              subtotal: 100_000,
              widthMm: 1000,
            },
          ],
        },
        projectName: 'Quote With Phone',
        status: 'draft',
        total: 100_000,
        userId: testUserId,
      },
    });
    quoteWithPhoneId = quoteWithPhone.id;

    // Quote WITHOUT contactPhone
    const quoteWithoutPhone = await prisma.quote.create({
      data: {
        contactPhone: null, // No phone
        currency: 'COP',
        items: {
          create: [
            {
              glassTypeId: glassType.id,
              heightMm: 1500,
              modelId: model.id,
              name: 'Item 2',
              quantity: 1,
              subtotal: 100_000,
              widthMm: 1000,
            },
          ],
        },
        projectName: 'Quote Without Phone',
        status: 'draft',
        total: 100_000,
        userId: testUserId,
      },
    });
    quoteWithoutPhoneId = quoteWithoutPhone.id;

    // Mock auth session
    await page.goto(`/api/auth/signin?callbackUrl=/quotes/${quoteWithPhoneId}`);
    // TODO: Complete authentication based on your setup
  });

  /**
   * Cleanup: Remove test data
   */
  test.afterEach(async () => {
    if (quoteWithPhoneId) {
      await prisma.quoteItem.deleteMany({ where: { quoteId: quoteWithPhoneId } });
      await prisma.quote.delete({ where: { id: quoteWithPhoneId } });
    }
    if (quoteWithoutPhoneId) {
      await prisma.quoteItem.deleteMany({ where: { quoteId: quoteWithoutPhoneId } });
      await prisma.quote.delete({ where: { id: quoteWithoutPhoneId } });
    }
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } });
    }
  });

  test('should pre-fill modal with existing contactPhone', async ({ page }) => {
    await page.goto(`/quotes/${quoteWithPhoneId}`);

    // Click Send button
    await page.getByRole('button', { name: /enviar cotización/i }).click();

    // Verify modal opens
    await expect(page.getByRole('dialog')).toBeVisible();

    // Verify phone field is pre-filled
    const phoneInput = page.getByLabel(/teléfono/i);
    await expect(phoneInput).toHaveValue('+573001234567');
  });

  test('should show empty modal if contactPhone is missing', async ({ page }) => {
    await page.goto(`/quotes/${quoteWithoutPhoneId}`);

    // Click Send button
    await page.getByRole('button', { name: /enviar cotización/i }).click();

    // Verify modal opens
    await expect(page.getByRole('dialog')).toBeVisible();

    // Verify phone field is empty
    const phoneInput = page.getByLabel(/teléfono/i);
    await expect(phoneInput).toHaveValue('');
  });

  test('should allow user to edit pre-filled contactPhone', async ({ page }) => {
    await page.goto(`/quotes/${quoteWithPhoneId}`);

    // Open modal
    await page.getByRole('button', { name: /enviar cotización/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Verify pre-filled value
    const phoneInput = page.getByLabel(/teléfono/i);
    await expect(phoneInput).toHaveValue('+573001234567');

    // User edits phone
    await phoneInput.clear();
    await phoneInput.fill('+573009999999');

    // Submit with edited phone
    await page
      .getByRole('button', { name: /enviar cotización/i })
      .last()
      .click();

    // Verify success
    await expect(page.getByText('Enviada')).toBeVisible({ timeout: 10_000 });

    // Verify updated phone in database
    const updatedQuote = await prisma.quote.findUnique({
      where: { id: quoteWithPhoneId },
    });
    expect(updatedQuote?.contactPhone).toBe('+573009999999');
  });

  test('should show validation error for invalid phone edit', async ({ page }) => {
    await page.goto(`/quotes/${quoteWithPhoneId}`);

    // Open modal
    await page.getByRole('button', { name: /enviar cotización/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // User edits to invalid format
    const phoneInput = page.getByLabel(/teléfono/i);
    await phoneInput.clear();
    await phoneInput.fill('invalid');

    // Try to submit
    await page
      .getByRole('button', { name: /enviar cotización/i })
      .last()
      .click();

    // Verify validation error
    await expect(page.getByText(/formato de teléfono inválido/i)).toBeVisible();

    // Verify quote status did NOT change
    await expect(page.getByText('Borrador')).toBeVisible();
  });

  test('should accept valid email when editing contact', async ({ page }) => {
    await page.goto(`/quotes/${quoteWithPhoneId}`);

    // Open modal
    await page.getByRole('button', { name: /enviar cotización/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Add email
    await page.getByLabel(/correo electrónico/i).fill('updated@example.com');

    // Submit
    await page
      .getByRole('button', { name: /enviar cotización/i })
      .last()
      .click();

    // Verify success
    await expect(page.getByText('Enviada')).toBeVisible({ timeout: 10_000 });
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.goto(`/quotes/${quoteWithoutPhoneId}`);

    // Open modal
    await page.getByRole('button', { name: /enviar cotización/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Fill phone (required)
    await page.getByLabel(/teléfono/i).fill('+573001111111');

    // Fill invalid email
    await page.getByLabel(/correo electrónico/i).fill('invalid-email');

    // Try to submit
    await page
      .getByRole('button', { name: /enviar cotización/i })
      .last()
      .click();

    // Verify validation error
    await expect(page.getByText(/correo electrónico inválido/i)).toBeVisible();
  });

  test('should handle empty email (optional field)', async ({ page }) => {
    await page.goto(`/quotes/${quoteWithoutPhoneId}`);

    // Open modal
    await page.getByRole('button', { name: /enviar cotización/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Fill only phone (required)
    await page.getByLabel(/teléfono/i).fill('+573002222222');

    // Leave email empty
    const emailInput = page.getByLabel(/correo electrónico/i);
    await expect(emailInput).toBeEmpty();

    // Submit (should succeed)
    await page
      .getByRole('button', { name: /enviar cotización/i })
      .last()
      .click();

    // Verify success
    await expect(page.getByText('Enviada')).toBeVisible({ timeout: 10_000 });
  });

  test('should preserve phone format when submitting', async ({ page }) => {
    await page.goto(`/quotes/${quoteWithoutPhoneId}`);

    // Open modal
    await page.getByRole('button', { name: /enviar cotización/i }).click();

    // Enter phone with + prefix
    await page.getByLabel(/teléfono/i).fill('+12125551234');

    // Submit
    await page
      .getByRole('button', { name: /enviar cotización/i })
      .last()
      .click();

    // Verify success
    await expect(page.getByText('Enviada')).toBeVisible({ timeout: 10_000 });

    // Verify exact format preserved in DB
    const updatedQuote = await prisma.quote.findUnique({
      where: { id: quoteWithoutPhoneId },
    });
    expect(updatedQuote?.contactPhone).toBe('+12125551234');
  });

  test('should allow user to cancel modal and keep quote as draft', async ({ page }) => {
    await page.goto(`/quotes/${quoteWithPhoneId}`);

    // Open modal
    await page.getByRole('button', { name: /enviar cotización/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Click Cancel button
    await page.getByRole('button', { name: /cancelar/i }).click();

    // Verify modal closes
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Verify quote remains draft
    await expect(page.getByText('Borrador')).toBeVisible();

    // Verify database unchanged
    const quote = await prisma.quote.findUnique({
      where: { id: quoteWithPhoneId },
    });
    expect(quote?.status).toBe('draft');
    expect(quote?.sentAt).toBeNull();
  });
});
