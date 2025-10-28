/**
 * Unit Test: sendToVendorInput Zod Schema Validation
 *
 * Tests input validation for the 'send-to-vendor' tRPC procedure.
 * Validates phone format (Colombian/international), email format, and required fields.
 *
 * Feature: 005-send-quote-to (User Story 1 - T007)
 *
 * @module tests/unit/quote/send-to-vendor-schema
 */

import { describe, expect, it } from "vitest";
import { sendToVendorInput } from "../../../src/server/api/routers/quote/quote.schemas";

describe("sendToVendorInput Schema Validation (T007)", () => {
  describe("Valid inputs", () => {
    it("should accept valid Colombian phone number with plus prefix", () => {
      const validInput = {
        contactPhone: "+573001234567",
        quoteId: "clx1a2b3c4d5e6f7g8h9i0j",
      };

      const result = sendToVendorInput.safeParse(validInput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.contactPhone).toBe("+573001234567");
        expect(result.data.quoteId).toBe("clx1a2b3c4d5e6f7g8h9i0j");
        expect(result.data.contactEmail).toBeUndefined();
      }
    });

    it("should accept valid Colombian phone number without plus prefix", () => {
      const validInput = {
        contactPhone: "573001234567",
        quoteId: "clx1a2b3c4d5e6f7g8h9i0j",
      };

      const result = sendToVendorInput.safeParse(validInput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.contactPhone).toBe("573001234567");
      }
    });

    it("should accept valid US phone number", () => {
      const validInput = {
        contactPhone: "+14155552671",
        quoteId: "clx1a2b3c4d5e6f7g8h9i0j",
      };

      const result = sendToVendorInput.safeParse(validInput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.contactPhone).toBe("+14155552671");
      }
    });

    it("should accept valid input with optional email", () => {
      const validInput = {
        contactEmail: "user@example.com",
        contactPhone: "+573001234567",
        quoteId: "clx1a2b3c4d5e6f7g8h9i0j",
      };

      const result = sendToVendorInput.safeParse(validInput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.contactEmail).toBe("user@example.com");
      }
    });

    it("should accept 10-digit phone number (minimum length)", () => {
      const validInput = {
        contactPhone: "5730012345",
        quoteId: "clx1a2b3c4d5e6f7g8h9i0j",
      };

      const result = sendToVendorInput.safeParse(validInput);

      expect(result.success).toBe(true);
    });

    it("should accept 15-digit phone number (maximum length)", () => {
      const validInput = {
        contactPhone: "+123456789012345",
        quoteId: "clx1a2b3c4d5e6f7g8h9i0j",
      };

      const result = sendToVendorInput.safeParse(validInput);

      expect(result.success).toBe(true);
    });
  });

  describe("Invalid phone formats", () => {
    it("should reject phone number starting with zero", () => {
      const invalidInput = {
        contactPhone: "+0573001234567",
        quoteId: "clx1a2b3c4d5e6f7g8h9i0j",
      };

      const result = sendToVendorInput.safeParse(invalidInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(
          "Formato de teléfono inválido"
        );
      }
    });

    it("should reject phone number with dashes", () => {
      const invalidInput = {
        contactPhone: "300-123-4567",
        quoteId: "clx1a2b3c4d5e6f7g8h9i0j",
      };

      const result = sendToVendorInput.safeParse(invalidInput);

      expect(result.success).toBe(false);
    });

    it("should reject phone number with spaces", () => {
      const invalidInput = {
        contactPhone: "300 123 4567",
        quoteId: "clx1a2b3c4d5e6f7g8h9i0j",
      };

      const result = sendToVendorInput.safeParse(invalidInput);

      expect(result.success).toBe(false);
    });

    it("should reject phone number with parentheses", () => {
      const invalidInput = {
        contactPhone: "(300) 123-4567",
        quoteId: "clx1a2b3c4d5e6f7g8h9i0j",
      };

      const result = sendToVendorInput.safeParse(invalidInput);

      expect(result.success).toBe(false);
    });

    it("should reject phone number shorter than 10 digits", () => {
      const invalidInput = {
        contactPhone: "123456789",
        quoteId: "clx1a2b3c4d5e6f7g8h9i0j",
      };

      const result = sendToVendorInput.safeParse(invalidInput);

      expect(result.success).toBe(false);
    });

    it("should reject phone number longer than 15 digits", () => {
      const invalidInput = {
        contactPhone: "+1234567890123456",
        quoteId: "clx1a2b3c4d5e6f7g8h9i0j",
      };

      const result = sendToVendorInput.safeParse(invalidInput);

      expect(result.success).toBe(false);
    });

    it("should reject phone number with letters", () => {
      const invalidInput = {
        contactPhone: "300ABC4567",
        quoteId: "clx1a2b3c4d5e6f7g8h9i0j",
      };

      const result = sendToVendorInput.safeParse(invalidInput);

      expect(result.success).toBe(false);
    });
  });

  describe("Invalid email formats", () => {
    it("should reject invalid email without domain", () => {
      const invalidInput = {
        contactEmail: "invalidemail",
        contactPhone: "+573001234567",
        quoteId: "clx1a2b3c4d5e6f7g8h9i0j",
      };

      const result = sendToVendorInput.safeParse(invalidInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(
          "Correo electrónico inválido"
        );
      }
    });

    it("should reject email without @ symbol", () => {
      const invalidInput = {
        contactEmail: "user.example.com",
        contactPhone: "+573001234567",
        quoteId: "clx1a2b3c4d5e6f7g8h9i0j",
      };

      const result = sendToVendorInput.safeParse(invalidInput);

      expect(result.success).toBe(false);
    });

    it("should reject email with multiple @ symbols", () => {
      const invalidInput = {
        contactEmail: "user@@example.com",
        contactPhone: "+573001234567",
        quoteId: "clx1a2b3c4d5e6f7g8h9i0j",
      };

      const result = sendToVendorInput.safeParse(invalidInput);

      expect(result.success).toBe(false);
    });
  });

  describe("Missing required fields", () => {
    it("should reject input without quoteId", () => {
      const invalidInput = {
        contactPhone: "+573001234567",
      };

      const result = sendToVendorInput.safeParse(invalidInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) => issue.path.includes("quoteId"))
        ).toBe(true);
      }
    });

    it("should reject input without contactPhone", () => {
      const invalidInput = {
        quoteId: "clx1a2b3c4d5e6f7g8h9i0j",
      };

      const result = sendToVendorInput.safeParse(invalidInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) =>
            issue.path.includes("contactPhone")
          )
        ).toBe(true);
      }
    });

    it("should reject completely empty input", () => {
      const invalidInput = {};

      const result = sendToVendorInput.safeParse(invalidInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(2); // quoteId and contactPhone required
      }
    });
  });

  describe("Invalid quoteId format", () => {
    it("should reject non-CUID quoteId", () => {
      const invalidInput = {
        contactPhone: "+573001234567",
        quoteId: "not-a-valid-cuid",
      };

      const result = sendToVendorInput.safeParse(invalidInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(
          "ID de cotización inválido"
        );
      }
    });

    it("should reject numeric quoteId", () => {
      const invalidInput = {
        contactPhone: "+573001234567",
        quoteId: "12345",
      };

      const result = sendToVendorInput.safeParse(invalidInput);

      expect(result.success).toBe(false);
    });

    it("should reject empty string quoteId", () => {
      const invalidInput = {
        contactPhone: "+573001234567",
        quoteId: "",
      };

      const result = sendToVendorInput.safeParse(invalidInput);

      expect(result.success).toBe(false);
    });
  });

  describe("Edge cases", () => {
    it("should handle undefined contactEmail gracefully", () => {
      const validInput = {
        contactEmail: undefined,
        contactPhone: "+573001234567",
        quoteId: "clx1a2b3c4d5e6f7g8h9i0j",
      };

      const result = sendToVendorInput.safeParse(validInput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.contactEmail).toBeUndefined();
      }
    });

    it("should reject null values for required fields", () => {
      const invalidInput = {
        contactPhone: null,
        quoteId: null,
      };

      const result = sendToVendorInput.safeParse(invalidInput);

      expect(result.success).toBe(false);
    });

    it("should reject wrong types for fields", () => {
      const invalidInput = {
        contactPhone: 123_456_789,
        quoteId: ["array-instead-of-string"],
      };

      const result = sendToVendorInput.safeParse(invalidInput);

      expect(result.success).toBe(false);
    });
  });
});
