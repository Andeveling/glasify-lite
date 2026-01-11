/**
 * Tests unitarios para SendQuoteToVendorUseCase
 *
 * Estos tests NO requieren base de datos.
 * Solo validan lógica de negocio pura con mocks.
 */
/** biome-ignore-all lint/style/noMagicNumbers: This a test file with fixed dates and numbers */

import { describe, expect, it, vi } from "vitest";
import {
  QuoteAlreadySentError,
  QuoteEmptyError,
  QuoteNotFoundError,
  QuoteUnauthorizedError,
  type SendQuoteToVendorDeps,
  type SendQuoteToVendorInput,
  sendQuoteToVendorUseCase,
} from "@/domain/quotes/use-cases/send-quote-to-vendor";

// Constants for test data
const TEST_QUOTE_ID = "quote-123";
const TEST_USER_ID = "user-456";
const TEST_OTHER_USER_ID = "user-789";
const TEST_PHONE = "+573001234567";
const TEST_EMAIL = "test@example.com";
const TEST_TOTAL = 1_500_000;
const TEST_CURRENCY = "COP";

// Time-related constants for test fixtures
const DAYS_VALID_UNTIL_QUOTE = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const TEST_VALID_UNTIL = new Date(
  Date.now() + DAYS_VALID_UNTIL_QUOTE * MS_PER_DAY
);

// Mock de quote válida
function createMockQuote(overrides = {}) {
  return {
    id: TEST_QUOTE_ID,
    userId: TEST_USER_ID,
    status: "draft" as const,
    sentAt: null,
    total: TEST_TOTAL,
    currency: TEST_CURRENCY,
    contactPhone: null,
    createdAt: new Date(),
    validUntil: new Date(TEST_VALID_UNTIL.getTime()),
    itemCount: 3,
    ...overrides,
  };
}

// Input válido base
function createValidInput(
  overrides: Partial<SendQuoteToVendorInput> = {}
): SendQuoteToVendorInput {
  return {
    quoteId: TEST_QUOTE_ID,
    userId: TEST_USER_ID,
    contactPhone: TEST_PHONE,
    contactEmail: TEST_EMAIL,
    ...overrides,
  };
}

// Dependencies mock factory
function createMockDeps(
  overrides: Partial<SendQuoteToVendorDeps> = {}
): SendQuoteToVendorDeps {
  return {
    findQuoteWithItemCount: vi.fn().mockResolvedValue(createMockQuote()),
    updateQuoteToSent: vi.fn().mockResolvedValue({
      id: TEST_QUOTE_ID,
      status: "sent" as const,
      sentAt: new Date(),
      contactPhone: TEST_PHONE,
      total: TEST_TOTAL,
      currency: TEST_CURRENCY,
    }),
    ...overrides,
  };
}

describe("SendQuoteToVendorUseCase", () => {
  describe("Quote Existence Validation", () => {
    it("should throw QuoteNotFoundError when quote does not exist", async () => {
      const input = createValidInput();
      const deps = createMockDeps({
        findQuoteWithItemCount: vi.fn().mockResolvedValue(null),
      });

      await expect(sendQuoteToVendorUseCase(input, deps)).rejects.toThrow(
        QuoteNotFoundError
      );
      await expect(sendQuoteToVendorUseCase(input, deps)).rejects.toThrow(
        "Cotización no encontrada"
      );
    });
  });

  describe("Ownership Validation", () => {
    it("should throw QuoteUnauthorizedError when user does not own the quote", async () => {
      const input = createValidInput({ userId: TEST_OTHER_USER_ID });
      const deps = createMockDeps();

      await expect(sendQuoteToVendorUseCase(input, deps)).rejects.toThrow(
        QuoteUnauthorizedError
      );
      await expect(sendQuoteToVendorUseCase(input, deps)).rejects.toThrow(
        "No tienes permiso"
      );
    });

    it("should succeed when user owns the quote", async () => {
      const input = createValidInput();
      const deps = createMockDeps();

      const result = await sendQuoteToVendorUseCase(input, deps);

      expect(result.id).toBe(TEST_QUOTE_ID);
    });
  });

  describe("Status Validation", () => {
    it("should throw QuoteAlreadySentError when quote is already sent", async () => {
      const sentDate = new Date("2025-01-05");
      const input = createValidInput();
      const deps = createMockDeps({
        findQuoteWithItemCount: vi
          .fn()
          .mockResolvedValue(
            createMockQuote({ status: "sent", sentAt: sentDate })
          ),
      });

      await expect(sendQuoteToVendorUseCase(input, deps)).rejects.toThrow(
        QuoteAlreadySentError
      );
    });

    it("should throw QuoteAlreadySentError when quote is canceled", async () => {
      const input = createValidInput();
      const deps = createMockDeps({
        findQuoteWithItemCount: vi
          .fn()
          .mockResolvedValue(createMockQuote({ status: "canceled" })),
      });

      await expect(sendQuoteToVendorUseCase(input, deps)).rejects.toThrow(
        QuoteAlreadySentError
      );
    });
  });

  describe("Items Validation", () => {
    it("should throw QuoteEmptyError when quote has no items", async () => {
      const input = createValidInput();
      const deps = createMockDeps({
        findQuoteWithItemCount: vi
          .fn()
          .mockResolvedValue(createMockQuote({ itemCount: 0 })),
      });

      await expect(sendQuoteToVendorUseCase(input, deps)).rejects.toThrow(
        QuoteEmptyError
      );
      await expect(sendQuoteToVendorUseCase(input, deps)).rejects.toThrow(
        "cotización vacía"
      );
    });

    it("should succeed when quote has at least one item", async () => {
      const input = createValidInput();
      const deps = createMockDeps({
        findQuoteWithItemCount: vi
          .fn()
          .mockResolvedValue(createMockQuote({ itemCount: 1 })),
      });

      const result = await sendQuoteToVendorUseCase(input, deps);

      expect(result.status).toBe("sent");
    });
  });

  describe("Successful Submission", () => {
    it("should update quote to sent status", async () => {
      const input = createValidInput();
      const updateMock = vi.fn().mockResolvedValue({
        id: TEST_QUOTE_ID,
        status: "sent",
        sentAt: new Date(),
        contactPhone: TEST_PHONE,
        total: TEST_TOTAL,
        currency: TEST_CURRENCY,
      });
      const deps = createMockDeps({ updateQuoteToSent: updateMock });

      await sendQuoteToVendorUseCase(input, deps);

      expect(updateMock).toHaveBeenCalledWith(
        TEST_QUOTE_ID,
        TEST_PHONE,
        expect.any(Date)
      );
    });

    it("should return complete response", async () => {
      const input = createValidInput();
      const deps = createMockDeps();

      const result = await sendQuoteToVendorUseCase(input, deps);

      expect(result).toMatchObject({
        id: TEST_QUOTE_ID,
        status: "sent",
        contactPhone: TEST_PHONE,
        contactEmail: TEST_EMAIL,
        total: TEST_TOTAL,
        currency: TEST_CURRENCY,
      });
      expect(result.sentAt).toBeInstanceOf(Date);
    });

    it("should include optional email in response", async () => {
      const input = createValidInput({ contactEmail: "optional@email.com" });
      const deps = createMockDeps();

      const result = await sendQuoteToVendorUseCase(input, deps);

      expect(result.contactEmail).toBe("optional@email.com");
    });

    it("should work without optional email", async () => {
      const input = createValidInput({ contactEmail: undefined });
      const deps = createMockDeps();

      const result = await sendQuoteToVendorUseCase(input, deps);

      expect(result.contactEmail).toBeUndefined();
    });
  });
});
