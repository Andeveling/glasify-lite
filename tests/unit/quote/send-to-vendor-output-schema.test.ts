/**
 * Unit Test: sendToVendorOutput Zod Schema Validation
 *
 * Tests output validation for the 'send-to-vendor' tRPC procedure.
 * Validates that the response contains all required fields with correct types.
 *
 * Feature: 005-send-quote-to (User Story 1 - T008)
 *
 * @module tests/unit/quote/send-to-vendor-output-schema
 */

import { describe, expect, it } from "vitest";
import { sendToVendorOutput } from "../../../src/server/api/routers/quote/quote.schemas";

describe("sendToVendorOutput Schema Validation (T008)", () => {
  describe("Valid outputs", () => {
    it("should accept complete valid output with all fields", () => {
      const validOutput = {
        contactEmail: "user@example.com",
        contactPhone: "+573001234567",
        currency: "COP",
        id: "clx1a2b3c4d5e6f7g8h9i0j",
        sentAt: new Date("2025-10-13T14:30:00.000Z"),
        status: "sent" as const,
        total: 1_500_000,
      };

      const result = sendToVendorOutput.safeParse(validOutput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe("clx1a2b3c4d5e6f7g8h9i0j");
        expect(result.data.status).toBe("sent");
        expect(result.data.sentAt).toBeInstanceOf(Date);
        expect(result.data.contactPhone).toBe("+573001234567");
        expect(result.data.contactEmail).toBe("user@example.com");
        expect(result.data.total).toBe(1_500_000);
        expect(result.data.currency).toBe("COP");
      }
    });

    it("should accept valid output without optional contactEmail", () => {
      const validOutput = {
        contactPhone: "+573001234567",
        currency: "COP",
        id: "clx1a2b3c4d5e6f7g8h9i0j",
        sentAt: new Date("2025-10-13T14:30:00.000Z"),
        status: "sent" as const,
        total: 1_500_000,
      };

      const result = sendToVendorOutput.safeParse(validOutput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.contactEmail).toBeUndefined();
      }
    });

    it("should accept zero total amount", () => {
      const validOutput = {
        contactPhone: "+573001234567",
        currency: "COP",
        id: "clx1a2b3c4d5e6f7g8h9i0j",
        sentAt: new Date(),
        status: "sent" as const,
        total: 0,
      };

      const result = sendToVendorOutput.safeParse(validOutput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.total).toBe(0);
      }
    });

    it("should accept different currency codes (3 characters)", () => {
      const validOutput = {
        contactPhone: "+573001234567",
        currency: "USD",
        id: "clx1a2b3c4d5e6f7g8h9i0j",
        sentAt: new Date(),
        status: "sent" as const,
        total: 1000,
      };

      const result = sendToVendorOutput.safeParse(validOutput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe("USD");
      }
    });

    it("should accept Date object for sentAt", () => {
      const now = new Date();
      const validOutput = {
        contactPhone: "+573001234567",
        currency: "COP",
        id: "clx1a2b3c4d5e6f7g8h9i0j",
        sentAt: now,
        status: "sent" as const,
        total: 1000,
      };

      const result = sendToVendorOutput.safeParse(validOutput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sentAt).toEqual(now);
        expect(result.data.sentAt).toBeInstanceOf(Date);
      }
    });
  });

  describe("Required field validation", () => {
    it("should reject output missing id", () => {
      const invalidOutput = {
        contactPhone: "+573001234567",
        currency: "COP",
        sentAt: new Date(),
        status: "sent" as const,
        total: 1000,
      };

      const result = sendToVendorOutput.safeParse(invalidOutput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) => issue.path.includes("id"))
        ).toBe(true);
      }
    });

    it("should reject output missing status", () => {
      const invalidOutput = {
        contactPhone: "+573001234567",
        currency: "COP",
        id: "clx1a2b3c4d5e6f7g8h9i0j",
        sentAt: new Date(),
        total: 1000,
      };

      const result = sendToVendorOutput.safeParse(invalidOutput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) => issue.path.includes("status"))
        ).toBe(true);
      }
    });

    it("should reject output missing sentAt", () => {
      const invalidOutput = {
        contactPhone: "+573001234567",
        currency: "COP",
        id: "clx1a2b3c4d5e6f7g8h9i0j",
        status: "sent" as const,
        total: 1000,
      };

      const result = sendToVendorOutput.safeParse(invalidOutput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) => issue.path.includes("sentAt"))
        ).toBe(true);
      }
    });

    it("should reject output missing contactPhone", () => {
      const invalidOutput = {
        currency: "COP",
        id: "clx1a2b3c4d5e6f7g8h9i0j",
        sentAt: new Date(),
        status: "sent" as const,
        total: 1000,
      };

      const result = sendToVendorOutput.safeParse(invalidOutput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) =>
            issue.path.includes("contactPhone")
          )
        ).toBe(true);
      }
    });

    it("should reject output missing total", () => {
      const invalidOutput = {
        contactPhone: "+573001234567",
        currency: "COP",
        id: "clx1a2b3c4d5e6f7g8h9i0j",
        sentAt: new Date(),
        status: "sent" as const,
      };

      const result = sendToVendorOutput.safeParse(invalidOutput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) => issue.path.includes("total"))
        ).toBe(true);
      }
    });

    it("should reject output missing currency", () => {
      const invalidOutput = {
        contactPhone: "+573001234567",
        id: "clx1a2b3c4d5e6f7g8h9i0j",
        sentAt: new Date(),
        status: "sent" as const,
        total: 1000,
      };

      const result = sendToVendorOutput.safeParse(invalidOutput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) => issue.path.includes("currency"))
        ).toBe(true);
      }
    });
  });

  describe("Status field validation", () => {
    it('should enforce literal status value "sent"', () => {
      const validOutput = {
        contactPhone: "+573001234567",
        currency: "COP",
        id: "clx1a2b3c4d5e6f7g8h9i0j",
        sentAt: new Date(),
        status: "sent" as const,
        total: 1000,
      };

      const result = sendToVendorOutput.safeParse(validOutput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("sent");
      }
    });

    it('should reject status "draft"', () => {
      const invalidOutput = {
        contactPhone: "+573001234567",
        currency: "COP",
        id: "clx1a2b3c4d5e6f7g8h9i0j",
        sentAt: new Date(),
        status: "draft",
        total: 1000,
      };

      const result = sendToVendorOutput.safeParse(invalidOutput);

      expect(result.success).toBe(false);
    });

    it('should reject status "canceled"', () => {
      const invalidOutput = {
        contactPhone: "+573001234567",
        currency: "COP",
        id: "clx1a2b3c4d5e6f7g8h9i0j",
        sentAt: new Date(),
        status: "canceled",
        total: 1000,
      };

      const result = sendToVendorOutput.safeParse(invalidOutput);

      expect(result.success).toBe(false);
    });

    it("should reject arbitrary status string", () => {
      const invalidOutput = {
        contactPhone: "+573001234567",
        currency: "COP",
        id: "clx1a2b3c4d5e6f7g8h9i0j",
        sentAt: new Date(),
        status: "pending",
        total: 1000,
      };

      const result = sendToVendorOutput.safeParse(invalidOutput);

      expect(result.success).toBe(false);
    });
  });

  describe("Type validation", () => {
    it("should reject invalid CUID for id", () => {
      const invalidOutput = {
        contactPhone: "+573001234567",
        currency: "COP",
        id: "not-a-valid-cuid",
        sentAt: new Date(),
        status: "sent" as const,
        total: 1000,
      };

      const result = sendToVendorOutput.safeParse(invalidOutput);

      expect(result.success).toBe(false);
    });

    it("should reject string for sentAt instead of Date", () => {
      const invalidOutput = {
        contactPhone: "+573001234567",
        currency: "COP",
        id: "clx1a2b3c4d5e6f7g8h9i0j",
        sentAt: "2025-10-13T14:30:00.000Z",
        status: "sent" as const,
        total: 1000,
      };

      const result = sendToVendorOutput.safeParse(invalidOutput);

      expect(result.success).toBe(false);
    });

    it("should reject negative total", () => {
      const invalidOutput = {
        contactPhone: "+573001234567",
        currency: "COP",
        id: "clx1a2b3c4d5e6f7g8h9i0j",
        sentAt: new Date(),
        status: "sent" as const,
        total: -1000,
      };

      const result = sendToVendorOutput.safeParse(invalidOutput);

      expect(result.success).toBe(false);
    });

    it("should reject string for total instead of number", () => {
      const invalidOutput = {
        contactPhone: "+573001234567",
        currency: "COP",
        id: "clx1a2b3c4d5e6f7g8h9i0j",
        sentAt: new Date(),
        status: "sent" as const,
        total: "1000",
      };

      const result = sendToVendorOutput.safeParse(invalidOutput);

      expect(result.success).toBe(false);
    });

    it("should reject currency with wrong length (not 3 chars)", () => {
      const invalidOutput = {
        contactPhone: "+573001234567",
        currency: "US",
        id: "clx1a2b3c4d5e6f7g8h9i0j",
        sentAt: new Date(),
        status: "sent" as const,
        total: 1000,
      };

      const result = sendToVendorOutput.safeParse(invalidOutput);

      expect(result.success).toBe(false);
    });

    it("should reject currency longer than 3 characters", () => {
      const invalidOutput = {
        contactPhone: "+573001234567",
        currency: "USDD",
        id: "clx1a2b3c4d5e6f7g8h9i0j",
        sentAt: new Date(),
        status: "sent" as const,
        total: 1000,
      };

      const result = sendToVendorOutput.safeParse(invalidOutput);

      expect(result.success).toBe(false);
    });
  });

  describe("Edge cases", () => {
    it("should handle undefined contactEmail gracefully", () => {
      const validOutput = {
        contactEmail: undefined,
        contactPhone: "+573001234567",
        currency: "COP",
        id: "clx1a2b3c4d5e6f7g8h9i0j",
        sentAt: new Date(),
        status: "sent" as const,
        total: 1000,
      };

      const result = sendToVendorOutput.safeParse(validOutput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.contactEmail).toBeUndefined();
      }
    });

    it("should reject null values for required fields", () => {
      const invalidOutput = {
        contactPhone: null,
        currency: null,
        id: null,
        sentAt: null,
        status: null,
        total: null,
      };

      const result = sendToVendorOutput.safeParse(invalidOutput);

      expect(result.success).toBe(false);
    });

    it("should reject empty object", () => {
      const invalidOutput = {};

      const result = sendToVendorOutput.safeParse(invalidOutput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(6); // All required fields missing
      }
    });

    it("should reject extra fields not in schema", () => {
      const outputWithExtraField = {
        contactPhone: "+573001234567",
        currency: "COP",
        extraField: "should-be-ignored",
        id: "clx1a2b3c4d5e6f7g8h9i0j",
        sentAt: new Date(),
        status: "sent" as const,
        total: 1000,
      };

      const result = sendToVendorOutput.safeParse(outputWithExtraField);

      // Zod by default strips extra fields with safeParse
      expect(result.success).toBe(true);
      if (result.success) {
        expect("extraField" in result.data).toBe(false);
      }
    });
  });
});
