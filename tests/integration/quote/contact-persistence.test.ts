/**
 * Integration Tests: Contact Info Persistence (User Story 2)
 *
 * Tests that contact information is correctly saved to the database
 * and accessible in subsequent queries.
 *
 * @module tests/integration/quote/contact-persistence.test
 */

import type { User } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const prisma = new PrismaClient();

describe('Contact Info Persistence - US2', () => {
  let testUser: User;
  let testQuoteId: string;

  /**
   * Setup: Create test user and quote before each test
   */
  beforeEach(async () => {
    testUser = await prisma.user.create({
      data: {
        email: `test-contact-${Date.now()}@example.com`,
        emailVerified: new Date(),
        name: 'Test User Contact',
      },
    });

    const model = await prisma.model.findFirst();
    const glassType = await prisma.glassType.findFirst();

    if (!(model && glassType)) {
      throw new Error('Test prerequisites missing: model or glassType not found');
    }

    const quote = await prisma.quote.create({
      data: {
        contactPhone: null, // Intentionally null to test persistence
        currency: 'COP',
        items: {
          create: [
            {
              glassTypeId: glassType.id,
              heightMm: 1500,
              modelId: model.id,
              name: 'Test Item',
              quantity: 1,
              subtotal: 100_000,
              widthMm: 1000,
            },
          ],
        },
        status: 'draft',
        total: 100_000,
        userId: testUser.id,
      },
    });

    testQuoteId = quote.id;
  });

  /**
   * Cleanup: Remove test data after each test
   */
  afterEach(async () => {
    if (testQuoteId) {
      await prisma.quoteItem.deleteMany({ where: { quoteId: testQuoteId } });
      await prisma.quote.delete({ where: { id: testQuoteId } });
    }
    if (testUser) {
      await prisma.user.delete({ where: { id: testUser.id } });
    }
  });

  it('should persist contactPhone when sending quote', async () => {
    // Update quote with contactPhone (simulates send-to-vendor mutation)
    const updatedQuote = await prisma.quote.update({
      data: {
        contactPhone: '+573001234567',
        sentAt: new Date(),
        status: 'sent',
      },
      where: { id: testQuoteId },
    });

    expect(updatedQuote.contactPhone).toBe('+573001234567');
    expect(updatedQuote.status).toBe('sent');
    expect(updatedQuote.sentAt).toBeTruthy();
  });

  it('should retrieve contactPhone in subsequent queries', async () => {
    // Persist contact info
    await prisma.quote.update({
      data: {
        contactPhone: '+12125551234',
        sentAt: new Date(),
        status: 'sent',
      },
      where: { id: testQuoteId },
    });

    // Query quote again
    const retrievedQuote = await prisma.quote.findUnique({
      where: { id: testQuoteId },
    });

    expect(retrievedQuote).toBeTruthy();
    expect(retrievedQuote?.contactPhone).toBe('+12125551234');
  });

  it('should allow updating contactPhone for draft quotes', async () => {
    // Update phone for draft quote (user edits before sending)
    const updatedQuote = await prisma.quote.update({
      data: {
        contactPhone: '+573009876543',
      },
      where: { id: testQuoteId },
    });

    expect(updatedQuote.status).toBe('draft');
    expect(updatedQuote.contactPhone).toBe('+573009876543');
    expect(updatedQuote.sentAt).toBeNull();
  });

  it('should handle null contactPhone gracefully', async () => {
    // Query quote with null contactPhone
    const quote = await prisma.quote.findUnique({
      where: { id: testQuoteId },
    });

    expect(quote).toBeTruthy();
    expect(quote?.contactPhone).toBeNull();
  });

  it('should persist contactPhone independently of other quote updates', async () => {
    // Update contactPhone
    await prisma.quote.update({
      data: {
        contactPhone: '+573001111111',
      },
      where: { id: testQuoteId },
    });

    // Update other fields (e.g., total)
    const updatedQuote = await prisma.quote.update({
      data: {
        total: 200_000,
      },
      where: { id: testQuoteId },
    });

    // Contact phone should remain unchanged
    expect(updatedQuote.contactPhone).toBe('+573001111111');
    expect(updatedQuote.total.toString()).toBe('200000.00');
  });

  it('should allow pre-filling modal with existing contactPhone', async () => {
    // Simulate user creating draft with phone
    await prisma.quote.update({
      data: {
        contactPhone: '+573002222222',
      },
      where: { id: testQuoteId },
    });

    // Retrieve for modal pre-fill
    const quote = await prisma.quote.findUnique({
      select: {
        contactPhone: true,
        id: true,
        status: true,
      },
      where: { id: testQuoteId },
    });

    expect(quote).toBeTruthy();
    expect(quote?.contactPhone).toBe('+573002222222');
    expect(quote?.status).toBe('draft');
  });

  it('should preserve contactPhone when quote is resent', async () => {
    // Initial send
    await prisma.quote.update({
      data: {
        contactPhone: '+573003333333',
        sentAt: new Date(),
        status: 'sent',
      },
      where: { id: testQuoteId },
    });

    // Update sentAt (resend scenario)
    const resentQuote = await prisma.quote.update({
      data: {
        sentAt: new Date(),
      },
      where: { id: testQuoteId },
    });

    expect(resentQuote.contactPhone).toBe('+573003333333');
    expect(resentQuote.status).toBe('sent');
  });

  it('should handle international phone numbers', async () => {
    const internationalPhones = [
      '+442071234567', // UK
      '+861234567890', // China
      '+81901234567', // Japan
      '+33012345678', // France
    ];

    for (const phone of internationalPhones) {
      const updatedQuote = await prisma.quote.update({
        data: {
          contactPhone: phone,
        },
        where: { id: testQuoteId },
      });

      expect(updatedQuote.contactPhone).toBe(phone);

      // Verify retrieval
      const retrievedQuote = await prisma.quote.findUnique({
        where: { id: testQuoteId },
      });
      expect(retrievedQuote?.contactPhone).toBe(phone);
    }
  });
});
