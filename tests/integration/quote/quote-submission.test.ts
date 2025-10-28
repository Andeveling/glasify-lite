/**
 * Integration Test: Quote Status Transition (draft → sent)
 *
 * Tests the complete quote submission flow including:
 * 1. Successful submission of draft quote
 * 2. Error handling for already-sent quotes
 * 3. Error handling for empty quotes
 * 4. Authorization checks
 * 5. Timestamp population (sentAt)
 *
 * Feature: 005-send-quote-to (User Story 1 - T009)
 *
 * @module tests/integration/quote/quote-submission
 */

import type { QuoteStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { sendQuoteToVendor } from "../../../src/server/api/routers/quote/quote.service";
import { db } from "../../../src/server/db";

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Create a test quote with items
 */
async function createTestQuote(
  userId: string,
  status: QuoteStatus = "draft",
  includeItems = true
) {
  const quote = await db.quote.create({
    data: {
      contactPhone: "+573001234567",
      currency: "COP",
      status,
      total: 1_500_000,
      userId,
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
      ...(includeItems && {
        items: {
          create: [
            {
              glassType: {
                connect: { id: "glass-type-1" }, // Use existing glass type from seed
              },
              heightMm: 1000,
              model: {
                connect: { id: "model-1" }, // Use existing model from seed
              },
              name: "TEST-001",
              quantity: 1,
              subtotal: 750_000,
              widthMm: 1000,
            },
            {
              glassType: {
                connect: { id: "glass-type-2" },
              },
              heightMm: 800,
              model: {
                connect: { id: "model-2" },
              },
              name: "TEST-002",
              quantity: 1,
              subtotal: 750_000,
              widthMm: 1200,
            },
          ],
        },
      }),
    },
    include: {
      items: true,
    },
  });

  return quote;
}

/**
 * Clean up test quotes
 */
async function cleanupTestQuotes() {
  await db.quoteItem.deleteMany({
    where: {
      quote: {
        userId: {
          in: ["user-test-quote-submission-1", "user-test-quote-submission-2"],
        },
      },
    },
  });

  await db.quote.deleteMany({
    where: {
      userId: {
        in: ["user-test-quote-submission-1", "user-test-quote-submission-2"],
      },
    },
  });
}

// ============================================================================
// Integration Tests
// ============================================================================

describe("Quote Submission Integration (T009)", () => {
  describe("Successful quote submission", () => {
    it("should successfully send a draft quote to vendor", async () => {
      // ARRANGE
      const userId = "user-test-quote-submission-1";
      const quote = await createTestQuote(userId, "draft", true);

      // ACT
      const result = await sendQuoteToVendor(db, {
        contactEmail: "test@example.com",
        contactPhone: "+573001234567",
        quoteId: quote.id,
        userId,
      });

      // ASSERT
      expect(result).toBeDefined();
      expect(result.status).toBe("sent");
      expect(result.sentAt).toBeInstanceOf(Date);
      expect(result.contactPhone).toBe("+573001234567");
      expect(result.total).toBeGreaterThan(0);
      expect(result.currency).toBe("COP");

      // VERIFY DATABASE UPDATE
      const updatedQuote = await db.quote.findUnique({
        where: { id: quote.id },
      });

      expect(updatedQuote).toBeDefined();
      expect(updatedQuote?.status).toBe("sent");
      expect(updatedQuote?.sentAt).toBeInstanceOf(Date);
      expect(updatedQuote?.sentAt).not.toBeNull();

      // CLEANUP
      await cleanupTestQuotes();
    });

    it("should populate sentAt timestamp correctly", async () => {
      // ARRANGE
      const userId = "user-test-quote-submission-1";
      const quote = await createTestQuote(userId, "draft", true);
      const beforeSubmission = new Date();

      // ACT
      const result = await sendQuoteToVendor(db, {
        contactPhone: "+573001234567",
        quoteId: quote.id,
        userId,
      });

      const afterSubmission = new Date();

      // ASSERT
      expect(result.sentAt).toBeInstanceOf(Date);
      expect(result.sentAt.getTime()).toBeGreaterThanOrEqual(
        beforeSubmission.getTime()
      );
      expect(result.sentAt.getTime()).toBeLessThanOrEqual(
        afterSubmission.getTime()
      );

      // CLEANUP
      await cleanupTestQuotes();
    });

    it("should update contactPhone if provided", async () => {
      // ARRANGE
      const userId = "user-test-quote-submission-1";
      const quote = await createTestQuote(userId, "draft", true);
      const newPhone = "+14155552671";

      // ACT
      const result = await sendQuoteToVendor(db, {
        contactPhone: newPhone,
        quoteId: quote.id,
        userId,
      });

      // ASSERT
      expect(result.contactPhone).toBe(newPhone);

      // VERIFY DATABASE UPDATE
      const updatedQuote = await db.quote.findUnique({
        where: { id: quote.id },
      });

      expect(updatedQuote?.contactPhone).toBe(newPhone);

      // CLEANUP
      await cleanupTestQuotes();
    });
  });

  describe("Error: Already sent quote", () => {
    it("should throw error when trying to send an already-sent quote", async () => {
      // ARRANGE
      const userId = "user-test-quote-submission-1";
      const quote = await createTestQuote(userId, "sent", true);

      // ACT & ASSERT
      await expect(
        sendQuoteToVendor(db, {
          contactPhone: "+573001234567",
          quoteId: quote.id,
          userId,
        })
      ).rejects.toThrow(/ya fue enviada/i);

      // CLEANUP
      await cleanupTestQuotes();
    });

    it("should not modify sentAt for already-sent quote", async () => {
      // ARRANGE
      const userId = "user-test-quote-submission-1";
      const quote = await createTestQuote(userId, "sent", true);
      const originalSentAt = new Date("2025-10-01T00:00:00Z");

      await db.quote.update({
        data: { sentAt: originalSentAt },
        where: { id: quote.id },
      });

      // ACT & ASSERT
      await expect(
        sendQuoteToVendor(db, {
          contactPhone: "+573001234567",
          quoteId: quote.id,
          userId,
        })
      ).rejects.toThrow();

      // VERIFY sentAt was NOT changed
      const unchangedQuote = await db.quote.findUnique({
        where: { id: quote.id },
      });

      expect(unchangedQuote?.sentAt?.getTime()).toBe(originalSentAt.getTime());

      // CLEANUP
      await cleanupTestQuotes();
    });
  });

  describe("Error: Quote with no items", () => {
    it("should throw error when trying to send quote without items", async () => {
      // ARRANGE
      const userId = "user-test-quote-submission-1";
      const emptyQuote = await createTestQuote(userId, "draft", false);

      // ACT & ASSERT
      await expect(
        sendQuoteToVendor(db, {
          contactPhone: "+573001234567",
          quoteId: emptyQuote.id,
          userId,
        })
      ).rejects.toThrow(/vacía/i);

      // VERIFY quote remains in draft status
      const unchangedQuote = await db.quote.findUnique({
        where: { id: emptyQuote.id },
      });

      expect(unchangedQuote?.status).toBe("draft");
      expect(unchangedQuote?.sentAt).toBeNull();

      // CLEANUP
      await cleanupTestQuotes();
    });
  });

  describe("Error: Unauthorized user", () => {
    it("should throw error when user tries to send quote that does not belong to them", async () => {
      // ARRANGE
      const ownerUserId = "user-test-quote-submission-1";
      const unauthorizedUserId = "user-test-quote-submission-2";
      const quote = await createTestQuote(ownerUserId, "draft", true);

      // ACT & ASSERT
      await expect(
        sendQuoteToVendor(db, {
          contactPhone: "+573001234567",
          quoteId: quote.id,
          userId: unauthorizedUserId, // Different user
        })
      ).rejects.toThrow(/permiso/i);

      // VERIFY quote remains unchanged
      const unchangedQuote = await db.quote.findUnique({
        where: { id: quote.id },
      });

      expect(unchangedQuote?.status).toBe("draft");
      expect(unchangedQuote?.sentAt).toBeNull();

      // CLEANUP
      await cleanupTestQuotes();
    });

    it("should not allow sending quote with null userId", async () => {
      // ARRANGE: Create quote without userId (anonymous quote)
      const anonymousQuote = await db.quote.create({
        data: {
          contactPhone: "+573001234567",
          currency: "COP",
          items: {
            create: [
              {
                glassType: {
                  connect: { id: "glass-type-1" },
                },
                heightMm: 1000,
                model: {
                  connect: { id: "model-1" },
                },
                name: "TEST-003",
                quantity: 1,
                subtotal: 1_000_000,
                widthMm: 1000,
              },
            ],
          },
          status: "draft",
          total: 1_000_000,
          userId: null, // Anonymous quote
        },
      });

      // ACT & ASSERT
      await expect(
        sendQuoteToVendor(db, {
          contactPhone: "+573001234567",
          quoteId: anonymousQuote.id,
          userId: "some-user-id",
        })
      ).rejects.toThrow();

      // CLEANUP
      await db.quoteItem.deleteMany({ where: { quoteId: anonymousQuote.id } });
      await db.quote.delete({ where: { id: anonymousQuote.id } });
    });
  });

  describe("Error: Quote not found", () => {
    it("should throw error when quote does not exist", async () => {
      // ARRANGE
      const nonExistentQuoteId = "clx9999999999999999999";
      const userId = "user-test-quote-submission-1";

      // ACT & ASSERT
      await expect(
        sendQuoteToVendor(db, {
          contactPhone: "+573001234567",
          quoteId: nonExistentQuoteId,
          userId,
        })
      ).rejects.toThrow(/no encontrada/i);
    });
  });

  describe("Transaction integrity", () => {
    it("should maintain referential integrity after submission", async () => {
      // ARRANGE
      const userId = "user-test-quote-submission-1";
      const quote = await createTestQuote(userId, "draft", true);
      const originalItemCount = quote.items?.length ?? 0;

      // ACT
      await sendQuoteToVendor(db, {
        contactPhone: "+573001234567",
        quoteId: quote.id,
        userId,
      });

      // ASSERT: Verify items were not affected
      const updatedQuote = await db.quote.findUnique({
        include: {
          items: true,
        },
        where: { id: quote.id },
      });

      expect(updatedQuote?.items).toHaveLength(originalItemCount);
      expect(
        updatedQuote?.items.every((item) => item.quoteId === quote.id)
      ).toBe(true);

      // CLEANUP
      await cleanupTestQuotes();
    });
  });
});
