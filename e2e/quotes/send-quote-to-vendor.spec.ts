/**
 * E2E Tests: Send Quote to Vendor (User Story 1)
 *
 * Tests the complete quote submission flow from draft to sent status.
 * Validates contact information modal, form validation, and status updates.
 *
 * @module e2e/quotes/send-quote-to-vendor.spec
 */

import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test.describe('Send Quote to Vendor - US1', () => {
  let testUserId: string;
  let testQuoteId: string;

  /**
   * Setup: Create a test user and draft quote before each test
   */
  test.beforeEach(async ({ page }) => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        emailVerified: new Date(),
        name: 'Test User',
      },
    });
    testUserId = user.id;

    // Create draft quote with items
    const quote = await prisma.quote.create({
      data: {
        contactPhone: '+573001234567', // Pre-filled phone
        currency: 'COP',
        items: {
          create: [
            {
              glassTypeId: (await prisma.glassType.findFirstOrThrow()).id,
              heightMm: 1500,
              modelId: (await prisma.model.findFirstOrThrow()).id,
              name: 'Ventana 1',
              quantity: 2,
              subtotal: 250_000,
              widthMm: 1000,
            },
          ],
        },
        projectCity: 'Bogotá',
        projectName: 'Proyecto E2E Test',
        projectPostalCode: '110111',
        projectState: 'Cundinamarca',
        projectStreet: 'Calle 123',
        status: 'draft',
        total: 500_000,
        userId: testUserId,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });
    testQuoteId = quote.id;

    // Mock auth session (replace with your actual auth setup)
    await page.goto(`/api/auth/signin?callbackUrl=/quotes/${testQuoteId}`);
    // TODO: Complete authentication flow based on your NextAuth setup
  });

  /**
   * Cleanup: Remove test data after each test
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

  test('should successfully send a draft quote with pre-filled contact', async ({ page }) => {
    // Navigate to quote detail page
    await page.goto(`/quotes/${testQuoteId}`);

    // Verify quote is in draft status
    await expect(page.getByText('Borrador')).toBeVisible();

    // Verify Send button is visible
    const sendButton = page.getByRole('button', { name: /enviar cotización/i });
    await expect(sendButton).toBeVisible();

    // Click Send button
    await sendButton.click();

    // Verify contact modal opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Información de Contacto')).toBeVisible();

    // Verify phone field is pre-filled
    const phoneInput = page.getByLabel(/teléfono/i);
    await expect(phoneInput).toHaveValue('+573001234567');

    // Optional: Add email
    await page.getByLabel(/correo electrónico/i).fill('test@example.com');

    // Submit form
    await page
      .getByRole('button', { name: /enviar cotización/i })
      .last()
      .click();

    // Verify success: Status changes to 'sent'
    await expect(page.getByText('Enviada')).toBeVisible({ timeout: 10_000 });

    // Verify sentAt message appears
    await expect(page.getByText(/cotización enviada el/i)).toBeVisible();

    // Verify Send button is no longer visible (quote is now sent)
    await expect(sendButton).not.toBeVisible();

    // Verify database updated
    const updatedQuote = await prisma.quote.findUnique({
      where: { id: testQuoteId },
    });
    expect(updatedQuote?.status).toBe('sent');
    expect(updatedQuote?.sentAt).toBeTruthy();
  });

  test('should show validation error for invalid phone format', async ({ page }) => {
    await page.goto(`/quotes/${testQuoteId}`);

    // Open modal
    await page.getByRole('button', { name: /enviar cotización/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Clear phone and enter invalid format
    const phoneInput = page.getByLabel(/teléfono/i);
    await phoneInput.clear();
    await phoneInput.fill('123'); // Invalid: too short

    // Try to submit
    await page
      .getByRole('button', { name: /enviar cotización/i })
      .last()
      .click();

    // Verify error message appears
    await expect(page.getByText(/formato de teléfono inválido/i)).toBeVisible();

    // Verify quote status did NOT change
    await expect(page.getByText('Borrador')).toBeVisible();
  });

  test('should not show Send button for already-sent quotes', async ({ page }) => {
    // Update quote to 'sent' status
    await prisma.quote.update({
      data: {
        sentAt: new Date(),
        status: 'sent',
      },
      where: { id: testQuoteId },
    });

    await page.goto(`/quotes/${testQuoteId}`);

    // Verify status badge shows 'Enviada'
    await expect(page.getByText('Enviada')).toBeVisible();

    // Verify Send button is NOT visible
    const sendButton = page.getByRole('button', { name: /enviar cotización/i });
    await expect(sendButton).not.toBeVisible();

    // Verify sentAt message is visible
    await expect(page.getByText(/cotización enviada el/i)).toBeVisible();
  });

  test('should show confirmation message after successful send', async ({ page }) => {
    await page.goto(`/quotes/${testQuoteId}`);

    // Send quote
    await page.getByRole('button', { name: /enviar cotización/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page
      .getByRole('button', { name: /enviar cotización/i })
      .last()
      .click();

    // Verify toast notification (adjust based on your toast implementation)
    await expect(page.getByText(/cotización enviada exitosamente/i)).toBeVisible({ timeout: 5000 });

    // Verify confirmation alert on page
    await expect(page.getByText(/el fabricante ha recibido tu solicitud/i)).toBeVisible();
  });

  test('should require phone field (cannot be empty)', async ({ page }) => {
    await page.goto(`/quotes/${testQuoteId}`);

    // Open modal
    await page.getByRole('button', { name: /enviar cotización/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Clear pre-filled phone
    const phoneInput = page.getByLabel(/teléfono/i);
    await phoneInput.clear();

    // Try to submit without phone
    await page
      .getByRole('button', { name: /enviar cotización/i })
      .last()
      .click();

    // Verify error message
    await expect(page.getByText(/el teléfono es requerido/i)).toBeVisible();

    // Verify modal stays open
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should allow email to be optional', async ({ page }) => {
    await page.goto(`/quotes/${testQuoteId}`);

    // Open modal
    await page.getByRole('button', { name: /enviar cotización/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Phone is pre-filled, leave email empty
    const emailInput = page.getByLabel(/correo electrónico/i);
    await expect(emailInput).toBeEmpty();

    // Submit form (should succeed without email)
    await page
      .getByRole('button', { name: /enviar cotización/i })
      .last()
      .click();

    // Verify success
    await expect(page.getByText('Enviada')).toBeVisible({ timeout: 10_000 });
  });
});
