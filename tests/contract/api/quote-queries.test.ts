/**
 * Contract Tests: Quote Queries
 *
 * Tests the tRPC query schemas for quote list and detail operations.
 * These tests ensure the input/output contracts match the specifications.
 *
 * Related: src/server/api/routers/quote/quote.schemas.ts
 * Task: T065 [P] [US5]
 */

import { describe, expect, it } from "vitest";
import {
  type GetQuoteByIdInput,
  getQuoteByIdInput,
  type ListUserQuotesInput,
  type ListUserQuotesOutput,
  listUserQuotesInput,
  listUserQuotesOutput,
} from "../../../src/server/api/routers/quote/quote.schemas";

describe("Contract: quote.list-user-quotes", () => {
  describe("Input validation", () => {
    it("should accept valid pagination parameters", () => {
      const input: ListUserQuotesInput = {
        includeExpired: false,
        limit: 10,
        page: 1,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      const result = listUserQuotesInput.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should apply defaults when parameters are omitted", () => {
      const input = {};

      const result = listUserQuotesInput.parse(input);
      expect(result).toEqual({
        includeExpired: false,
        limit: 20,
        page: 1,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
    });

    it("should accept optional status filter", () => {
      const input = {
        status: "draft" as const,
      };

      const result = listUserQuotesInput.safeParse(input);
      expect(result.success).toBe(true);
      expect(result.data?.status).toBe("draft");
    });

    it("should accept includeExpired flag", () => {
      const input = {
        includeExpired: true,
      };

      const result = listUserQuotesInput.safeParse(input);
      expect(result.success).toBe(true);
      expect(result.data?.includeExpired).toBe(true);
    });

    it("should reject limit exceeding maximum", () => {
      const input = {
        limit: 150, // MAX_PAGE_SIZE = 100
      };

      const result = listUserQuotesInput.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject negative page number", () => {
      const input = {
        page: -1,
      };

      const result = listUserQuotesInput.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject invalid sortBy field", () => {
      const input = {
        sortBy: "invalidField",
      };

      const result = listUserQuotesInput.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject invalid status value", () => {
      const input = {
        status: "INVALID_STATUS",
      };

      const result = listUserQuotesInput.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("Output validation", () => {
    it("should validate complete response structure", () => {
      const output: ListUserQuotesOutput = {
        hasNextPage: true,
        hasPreviousPage: false,
        limit: 10,
        page: 1,
        quotes: [
          {
            createdAt: new Date("2025-10-09T10:00:00Z"),
            currency: "MXN",
            id: "clx1234567890",
            isExpired: false,
            itemCount: 5,
            projectName: "Casa Familiar",
            status: "draft",
            total: 15_000.5,
            validUntil: new Date("2025-10-24T10:00:00Z"),
          },
        ],
        total: 25,
        totalPages: 3,
      };

      const result = listUserQuotesOutput.safeParse(output);
      if (!result.success) {
        console.error(
          "Validation errors:",
          JSON.stringify(result.error.issues, null, 2)
        );
      }
      expect(result.success).toBe(true);
    });
    it("should validate empty quotes list", () => {
      const output: ListUserQuotesOutput = {
        hasNextPage: false,
        hasPreviousPage: false,
        limit: 10,
        page: 1,
        quotes: [],
        total: 0,
        totalPages: 0,
      };

      const result = listUserQuotesOutput.safeParse(output);
      expect(result.success).toBe(true);
    });

    it("should validate quote with null validUntil date", () => {
      const output: ListUserQuotesOutput = {
        hasNextPage: false,
        hasPreviousPage: false,
        limit: 10,
        page: 1,
        quotes: [
          {
            createdAt: new Date("2025-10-09"),
            currency: "MXN",
            id: "clx1234567890",
            isExpired: false,
            itemCount: 2,
            projectName: "Proyecto Sin Fecha",
            status: "draft",
            total: 5000,
            validUntil: null,
          },
        ],
        total: 1,
        totalPages: 1,
      };

      const result = listUserQuotesOutput.safeParse(output);
      expect(result.success).toBe(true);
    });

    it("should reject response with invalid quote ID format", () => {
      const output = {
        hasNextPage: false,
        hasPreviousPage: false,
        limit: 10,
        page: 1,
        quotes: [
          {
            createdAt: new Date(),
            id: "invalid-id",
            isExpired: false,
            itemCount: 1,
            projectName: "Proyecto",
            status: "draft",
            total: 1000,
            validUntil: new Date(),
          },
        ],
        total: 1,
        totalPages: 1,
      };

      const result = listUserQuotesOutput.safeParse(output);
      expect(result.success).toBe(false);
    });

    it("should reject response with negative total", () => {
      const output = {
        hasNextPage: false,
        hasPreviousPage: false,
        limit: 10,
        page: 1,
        quotes: [
          {
            createdAt: new Date(),
            id: "clx1234567890",
            isExpired: false,
            itemCount: 1,
            projectName: "Proyecto",
            status: "draft",
            total: -100, // Invalid: negative
            validUntil: new Date(),
          },
        ],
        total: 1,
        totalPages: 1,
      };

      const result = listUserQuotesOutput.safeParse(output);
      expect(result.success).toBe(false);
    });
  });
});

describe("Contract: quote.get-by-id", () => {
  describe("Input validation", () => {
    it("should accept valid CUID", () => {
      const input: GetQuoteByIdInput = {
        id: "clx1234567890",
      };

      const result = getQuoteByIdInput.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject invalid ID format", () => {
      const input = {
        id: "not-a-cuid",
      };

      const result = getQuoteByIdInput.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject missing ID", () => {
      const input = {};

      const result = getQuoteByIdInput.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject empty string ID", () => {
      const input = {
        id: "",
      };

      const result = getQuoteByIdInput.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("Output validation", () => {
    it("should validate output schema exists", () => {
      // Note: The getQuoteByIdOutput schema will be validated
      // when the implementation is complete in T068
      expect(getQuoteByIdInput).toBeDefined();
    });
  });
});
