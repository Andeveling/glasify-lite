/**
 * Integration Tests: Quote Filtering by Status
 *
 * Tests the quote list filtering functionality to ensure users can
 * organize and view quotes by status (draft, sent, canceled).
 *
 * @module tests/integration/quote/quote-filtering.test
 */

import type { GlassType, Model, Quote, User } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const prisma = new PrismaClient();

describe('Quote Filtering - Integration Tests', () => {
  let testUser: User;
  let testModel: Model;
  let testGlassType: GlassType;
  let draftQuote: Quote;
  let sentQuote: Quote;
  let canceledQuote: Quote;

  beforeEach(async () => {
    // Create test user
    testUser = await prisma.user.create({
      data: {
        email: `test-filtering-${Date.now()}@example.com`,
        emailVerified: new Date(),
        name: 'Test User Filtering',
      },
    });

    // Get first model and glass type
    const modelResult = await prisma.model.findFirst();
    const glassTypeResult = await prisma.glassType.findFirst();

    if (!(modelResult && glassTypeResult)) {
      throw new Error('Database not seeded. Run: pnpm db:seed');
    }

    testModel = modelResult;
    testGlassType = glassTypeResult;

    // Create quotes with different statuses
    draftQuote = await prisma.quote.create({
      data: {
        contactPhone: '+573001111111',
        currency: 'COP',
        items: {
          create: [
            {
              glassTypeId: testGlassType.id,
              heightMm: 1000,
              modelId: testModel.id,
              name: 'Item 1',
              quantity: 1,
              subtotal: 100_000,
              widthMm: 1000,
            },
          ],
        },
        projectName: 'Draft Quote',
        status: 'draft',
        total: 100_000,
        userId: testUser.id,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    sentQuote = await prisma.quote.create({
      data: {
        contactPhone: '+573002222222',
        currency: 'COP',
        items: {
          create: [
            {
              glassTypeId: testGlassType.id,
              heightMm: 1200,
              modelId: testModel.id,
              name: 'Item 2',
              quantity: 1,
              subtotal: 200_000,
              widthMm: 1200,
            },
          ],
        },
        projectName: 'Sent Quote',
        sentAt: new Date(),
        status: 'sent',
        total: 200_000,
        userId: testUser.id,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    canceledQuote = await prisma.quote.create({
      data: {
        contactPhone: '+573003333333',
        currency: 'COP',
        items: {
          create: [
            {
              glassTypeId: testGlassType.id,
              heightMm: 1100,
              modelId: testModel.id,
              name: 'Item 3',
              quantity: 1,
              subtotal: 150_000,
              widthMm: 1100,
            },
          ],
        },
        projectName: 'Canceled Quote',
        status: 'canceled',
        total: 150_000,
        userId: testUser.id,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  });

  afterEach(async () => {
    // Cleanup: Delete test data
    await prisma.quoteItem.deleteMany({
      where: {
        quoteId: {
          in: [ draftQuote.id, sentQuote.id, canceledQuote.id ],
        },
      },
    });

    await prisma.quote.deleteMany({
      where: {
        id: {
          in: [ draftQuote.id, sentQuote.id, canceledQuote.id ],
        },
      },
    });

    await prisma.user.delete({
      where: { id: testUser.id },
    });
  });

  it('should filter quotes by draft status', async () => {
    const quotes = await prisma.quote.findMany({
      orderBy: { createdAt: 'desc' },
      where: {
        status: 'draft',
        userId: testUser.id,
      },
    });

    expect(quotes).toHaveLength(1);
    expect(quotes[ 0 ]?.id).toBe(draftQuote.id);
    expect(quotes[ 0 ]?.status).toBe('draft');
    expect(quotes[ 0 ]?.projectName).toBe('Draft Quote');
  });

  it('should filter quotes by sent status', async () => {
    const quotes = await prisma.quote.findMany({
      orderBy: { createdAt: 'desc' },
      where: {
        status: 'sent',
        userId: testUser.id,
      },
    });

    expect(quotes).toHaveLength(1);
    expect(quotes[ 0 ]?.id).toBe(sentQuote.id);
    expect(quotes[ 0 ]?.status).toBe('sent');
    expect(quotes[ 0 ]?.sentAt).toBeInstanceOf(Date);
    expect(quotes[ 0 ]?.projectName).toBe('Sent Quote');
  });

  it('should filter quotes by canceled status', async () => {
    const quotes = await prisma.quote.findMany({
      orderBy: { createdAt: 'desc' },
      where: {
        status: 'canceled',
        userId: testUser.id,
      },
    });

    expect(quotes).toHaveLength(1);
    expect(quotes[ 0 ]?.id).toBe(canceledQuote.id);
    expect(quotes[ 0 ]?.status).toBe('canceled');
    expect(quotes[ 0 ]?.projectName).toBe('Canceled Quote');
  });

  it('should return all quotes when no status filter applied', async () => {
    const quotes = await prisma.quote.findMany({
      orderBy: { createdAt: 'desc' },
      where: {
        userId: testUser.id,
      },
    });

    expect(quotes).toHaveLength(3);
    expect(quotes.map((q) => q.status).sort()).toEqual([ 'canceled', 'draft', 'sent' ].sort());
  });

  it('should handle mixed status filter (multiple statuses)', async () => {
    const quotes = await prisma.quote.findMany({
      orderBy: { createdAt: 'desc' },
      where: {
        status: {
          in: [ 'draft', 'sent' ],
        },
        userId: testUser.id,
      },
    });

    expect(quotes).toHaveLength(2);
    expect(quotes.map((q) => q.status).sort()).toEqual([ 'draft', 'sent' ]);
  });

  it('should sort sent quotes by sentAt descending', async () => {
    // Create additional sent quote with older sentAt
    const olderSentQuote = await prisma.quote.create({
      data: {
        contactPhone: '+573004444444',
        currency: 'COP',
        items: {
          create: [
            {
              glassTypeId: testGlassType.id,
              heightMm: 1300,
              modelId: testModel.id,
              name: 'Item 4',
              quantity: 1,
              subtotal: 300_000,
              widthMm: 1300,
            },
          ],
        },
        projectName: 'Older Sent Quote',
        sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        status: 'sent',
        total: 300_000,
        userId: testUser.id,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    const quotes = await prisma.quote.findMany({
      orderBy: { sentAt: 'desc' },
      where: {
        status: 'sent',
        userId: testUser.id,
      },
    });

    expect(quotes).toHaveLength(2);
    expect(quotes[ 0 ]?.id).toBe(sentQuote.id); // Most recent first
    expect(quotes[ 1 ]?.id).toBe(olderSentQuote.id);

    // Cleanup
    await prisma.quoteItem.deleteMany({ where: { quoteId: olderSentQuote.id } });
    await prisma.quote.delete({ where: { id: olderSentQuote.id } });
  });

  it('should handle empty result when filtering by non-existent status', async () => {
    // Delete all sent quotes first
    await prisma.quoteItem.deleteMany({ where: { quoteId: sentQuote.id } });
    await prisma.quote.delete({ where: { id: sentQuote.id } });

    const quotes = await prisma.quote.findMany({
      orderBy: { createdAt: 'desc' },
      where: {
        status: 'sent',
        userId: testUser.id,
      },
    });

    expect(quotes).toHaveLength(0);
  });

  it('should include items count in filtered results', async () => {
    const quotes = await prisma.quote.findMany({
      include: {
        _count: {
          select: { items: true },
        },
      },
      where: {
        status: 'draft',
        userId: testUser.id,
      },
    });

    expect(quotes).toHaveLength(1);
    expect(quotes[ 0 ]?._count.items).toBe(1);
  });

  it('should combine status filter with date range filter', async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const quotes = await prisma.quote.findMany({
      where: {
        sentAt: {
          gte: yesterday,
          lte: tomorrow,
        },
        status: 'sent',
        userId: testUser.id,
      },
    });

    expect(quotes).toHaveLength(1);
    expect(quotes[ 0 ]?.id).toBe(sentQuote.id);
  });
});
