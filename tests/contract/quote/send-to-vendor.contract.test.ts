/**
 * Contract Test: send-to-vendor tRPC Procedure
 *
 * Tests that verify the send-to-vendor procedure complies with its
 * input/output contracts defined in quote.schemas.ts
 *
 * Feature: 005-send-quote-to (User Story 1 - T010)
 *
 * @module tests/contract/quote/send-to-vendor.contract
 */

import { describe, expect, it } from "vitest";
import {
  sendToVendorInput,
  sendToVendorOutput,
} from "../../../src/server/api/routers/quote/quote.schemas";

describe("Contract Test: send-to-vendor (T010)", () => {
  describe("Input Contract Enforcement", () => {
    it("should enforce quoteId as required CUID", () => {
      const invalidInputs = [
        {}, // missing quoteId
        { contactPhone: "+573001234567" }, // missing quoteId
        { contactPhone: "+573001234567", quoteId: "not-a-cuid" }, // invalid CUID
        { contactPhone: "+573001234567", quoteId: 123 }, // wrong type
        { contactPhone: "+573001234567", quoteId: null }, // null
      ];

      for (const input of invalidInputs) {
        const result = sendToVendorInput.safeParse(input);
        expect(result.success).toBe(false);
      }
    });

    it("should enforce contactPhone as required with specific format", () => {
      const invalidInputs = [
        { quoteId: "clx1a2b3c4d5e6f7g8h9i0j" }, // missing contactPhone
        { contactPhone: "", quoteId: "clx1a2b3c4d5e6f7g8h9i0j" }, // empty string
        { contactPhone: "123", quoteId: "clx1a2b3c4d5e6f7g8h9i0j" }, // too short
        { contactPhone: "300-123-4567", quoteId: "clx1a2b3c4d5e6f7g8h9i0j" }, // dashes
        { contactPhone: 123_456_789, quoteId: "clx1a2b3c4d5e6f7g8h9i0j" }, // number type
      ];

      for (const input of invalidInputs) {
        const result = sendToVendorInput.safeParse(input);
        expect(result.success).toBe(false);
      }
    });

    it("should allow valid phone formats (international)", () => {
      const validInputs = [
        { contactPhone: "+573001234567", quoteId: "clx1a2b3c4d5e6f7g8h9i0j" },
        { contactPhone: "573001234567", quoteId: "clx1a2b3c4d5e6f7g8h9i0j" },
        { contactPhone: "+14155552671", quoteId: "clx1a2b3c4d5e6f7g8h9i0j" },
        { contactPhone: "5712345678", quoteId: "clx1a2b3c4d5e6f7g8h9i0j" },
      ];

      for (const input of validInputs) {
        const result = sendToVendorInput.safeParse(input);
        expect(result.success).toBe(true);
      }
    });

    it("should make contactEmail optional but validate format when provided", () => {
      // Valid: Email omitted
      const validWithoutEmail = {
        contactPhone: "+573001234567",
        quoteId: "clx1a2b3c4d5e6f7g8h9i0j",
      };

      expect(sendToVendorInput.safeParse(validWithoutEmail).success).toBe(true);

      // Valid: Email provided with correct format
      const validWithEmail = {
        contactEmail: "user@example.com",
        contactPhone: "+573001234567",
        quoteId: "clx1a2b3c4d5e6f7g8h9i0j",
      };

      expect(sendToVendorInput.safeParse(validWithEmail).success).toBe(true);

      // Invalid: Bad email format
      const invalidEmail = {
        contactEmail: "not-an-email",
        contactPhone: "+573001234567",
        quoteId: "clx1a2b3c4d5e6f7g8h9i0j",
      };

      expect(sendToVendorInput.safeParse(invalidEmail).success).toBe(false);
    });

    it("should not allow extra undeclared fields", () => {
      const inputWithExtraField = {
        contactPhone: "+573001234567",
        extraField: "should-be-stripped",
        quoteId: "clx1a2b3c4d5e6f7g8h9i0j",
      };

      const result = sendToVendorInput.safeParse(inputWithExtraField);

      expect(result.success).toBe(true);
      if (result.success) {
        // Zod strips extra fields by default
        expect("extraField" in result.data).toBe(false);
      }
    });
  });

  describe("Output Contract Validation", () => {
    it("should require all mandatory fields", () => {
      const incompleteOutputs = [
        {}, // empty object
        { id: "clx1a2b3c4d5e6f7g8h9i0j" }, // only id
        { id: "clx1a2b3c4d5e6f7g8h9i0j", status: "sent" }, // missing others
        {
          // missing sentAt
          contactPhone: "+573001234567",
          currency: "COP",
          id: "clx1a2b3c4d5e6f7g8h9i0j",
          status: "sent",
          total: 1000,
        },
      ];

      for (const output of incompleteOutputs) {
        const result = sendToVendorOutput.safeParse(output);
        expect(result.success).toBe(false);
      }
    });

    it('should enforce status literal as "sent" only', () => {
      const validOutput = {
        contactPhone: "+573001234567",
        currency: "COP",
        id: "clx1a2b3c4d5e6f7g8h9i0j",
        sentAt: new Date(),
        status: "sent" as const,
        total: 1000,
      };

      expect(sendToVendorOutput.safeParse(validOutput).success).toBe(true);

      // Invalid status values
      const invalidStatuses = ["draft", "canceled", "pending", "completed"];

      for (const invalidStatus of invalidStatuses) {
        const invalidOutput = {
          ...validOutput,
          status: invalidStatus,
        };

        expect(sendToVendorOutput.safeParse(invalidOutput).success).toBe(false);
      }
    });

    it("should require sentAt to be a Date object", () => {
      const baseOutput = {
        contactPhone: "+573001234567",
        currency: "COP",
        id: "clx1a2b3c4d5e6f7g8h9i0j",
        status: "sent" as const,
        total: 1000,
      };

      // Valid: Date object
      const validOutput = { ...baseOutput, sentAt: new Date() };
      expect(sendToVendorOutput.safeParse(validOutput).success).toBe(true);

      // Invalid: Date string
      const invalidStringDate = {
        ...baseOutput,
        sentAt: "2025-10-13T14:30:00Z",
      };
      expect(sendToVendorOutput.safeParse(invalidStringDate).success).toBe(
        false
      );

      // Invalid: Number (timestamp)
      const invalidTimestamp = { ...baseOutput, sentAt: Date.now() };
      expect(sendToVendorOutput.safeParse(invalidTimestamp).success).toBe(
        false
      );

      // Invalid: null
      const invalidNull = { ...baseOutput, sentAt: null };
      expect(sendToVendorOutput.safeParse(invalidNull).success).toBe(false);
    });

    it("should validate currency as exactly 3 characters", () => {
      const baseOutput = {
        contactPhone: "+573001234567",
        id: "clx1a2b3c4d5e6f7g8h9i0j",
        sentAt: new Date(),
        status: "sent" as const,
        total: 1000,
      };

      // Valid currencies
      const validCurrencies = ["COP", "USD", "EUR", "MXN"];

      for (const currency of validCurrencies) {
        const output = { ...baseOutput, currency };
        expect(sendToVendorOutput.safeParse(output).success).toBe(true);
      }

      // Invalid: Wrong length
      const invalidCurrencies = ["CO", "US", "USDD", "COPESO"];

      for (const currency of invalidCurrencies) {
        const output = { ...baseOutput, currency };
        expect(sendToVendorOutput.safeParse(output).success).toBe(false);
      }
    });

    it("should require total to be non-negative number", () => {
      const baseOutput = {
        contactPhone: "+573001234567",
        currency: "COP",
        id: "clx1a2b3c4d5e6f7g8h9i0j",
        sentAt: new Date(),
        status: "sent" as const,
      };

      // Valid: Zero and positive numbers
      const validTotals = [0, 100, 1000, 1_500_000, 999_999_999.99];

      for (const total of validTotals) {
        const output = { ...baseOutput, total };
        expect(sendToVendorOutput.safeParse(output).success).toBe(true);
      }

      // Invalid: Negative
      const invalidOutput = { ...baseOutput, total: -1000 };
      expect(sendToVendorOutput.safeParse(invalidOutput).success).toBe(false);

      // Invalid: String
      const invalidString = { ...baseOutput, total: "1000" };
      expect(sendToVendorOutput.safeParse(invalidString).success).toBe(false);
    });

    it("should validate id as CUID format", () => {
      const baseOutput = {
        contactPhone: "+573001234567",
        currency: "COP",
        sentAt: new Date(),
        status: "sent" as const,
        total: 1000,
      };

      // Valid CUID
      const validOutput = { ...baseOutput, id: "clx1a2b3c4d5e6f7g8h9i0j" };
      expect(sendToVendorOutput.safeParse(validOutput).success).toBe(true);

      // Invalid IDs
      const invalidIds = ["not-a-cuid", "12345", "abc-def-ghi", ""];

      for (const id of invalidIds) {
        const output = { ...baseOutput, id };
        expect(sendToVendorOutput.safeParse(output).success).toBe(false);
      }
    });

    it("should make contactEmail optional in output", () => {
      const baseOutput = {
        contactPhone: "+573001234567",
        currency: "COP",
        id: "clx1a2b3c4d5e6f7g8h9i0j",
        sentAt: new Date(),
        status: "sent" as const,
        total: 1000,
      };

      // Valid without contactEmail
      expect(sendToVendorOutput.safeParse(baseOutput).success).toBe(true);

      // Valid with contactEmail
      const withEmail = { ...baseOutput, contactEmail: "user@example.com" };
      expect(sendToVendorOutput.safeParse(withEmail).success).toBe(true);

      // Valid with undefined contactEmail
      const withUndefined = { ...baseOutput, contactEmail: undefined };
      expect(sendToVendorOutput.safeParse(withUndefined).success).toBe(true);
    });
  });

  describe("Input/Output Type Consistency", () => {
    it("should ensure quoteId format consistency between input and output", () => {
      const quoteId = "clx1a2b3c4d5e6f7g8h9i0j";

      const inputResult = sendToVendorInput.safeParse({
        contactPhone: "+573001234567",
        quoteId,
      });

      const outputResult = sendToVendorOutput.safeParse({
        contactPhone: "+573001234567",
        currency: "COP",
        id: quoteId,
        sentAt: new Date(),
        status: "sent",
        total: 1000,
      });

      expect(inputResult.success).toBe(true);
      expect(outputResult.success).toBe(true);

      if (inputResult.success && outputResult.success) {
        expect(inputResult.data.quoteId).toBe(outputResult.data.id);
      }
    });

    it("should ensure contactPhone consistency between input and output", () => {
      const contactPhone = "+573001234567";

      const inputResult = sendToVendorInput.safeParse({
        contactPhone,
        quoteId: "clx1a2b3c4d5e6f7g8h9i0j",
      });

      const outputResult = sendToVendorOutput.safeParse({
        contactPhone,
        currency: "COP",
        id: "clx1a2b3c4d5e6f7g8h9i0j",
        sentAt: new Date(),
        status: "sent",
        total: 1000,
      });

      expect(inputResult.success).toBe(true);
      expect(outputResult.success).toBe(true);

      if (inputResult.success && outputResult.success) {
        expect(inputResult.data.contactPhone).toBe(
          outputResult.data.contactPhone
        );
      }
    });

    it("should ensure contactEmail optionality is consistent", () => {
      const contactEmail = "user@example.com";

      // Input with email
      const inputWithEmail = sendToVendorInput.safeParse({
        contactEmail,
        contactPhone: "+573001234567",
        quoteId: "clx1a2b3c4d5e6f7g8h9i0j",
      });

      // Output with email
      const outputWithEmail = sendToVendorOutput.safeParse({
        contactEmail,
        contactPhone: "+573001234567",
        currency: "COP",
        id: "clx1a2b3c4d5e6f7g8h9i0j",
        sentAt: new Date(),
        status: "sent",
        total: 1000,
      });

      expect(inputWithEmail.success).toBe(true);
      expect(outputWithEmail.success).toBe(true);

      // Input without email
      const inputWithoutEmail = sendToVendorInput.safeParse({
        contactPhone: "+573001234567",
        quoteId: "clx1a2b3c4d5e6f7g8h9i0j",
      });

      // Output without email
      const outputWithoutEmail = sendToVendorOutput.safeParse({
        contactPhone: "+573001234567",
        currency: "COP",
        id: "clx1a2b3c4d5e6f7g8h9i0j",
        sentAt: new Date(),
        status: "sent",
        total: 1000,
      });

      expect(inputWithoutEmail.success).toBe(true);
      expect(outputWithoutEmail.success).toBe(true);
    });
  });

  describe("Contract Completeness", () => {
    it("should have all required input fields defined in schema", () => {
      const requiredInputFields = ["quoteId", "contactPhone"];

      const emptyInput = {};
      const result = sendToVendorInput.safeParse(emptyInput);

      expect(result.success).toBe(false);

      if (!result.success) {
        const missingFields = result.error.issues.map((issue) => issue.path[0]);
        for (const field of requiredInputFields) {
          expect(missingFields).toContain(field);
        }
      }
    });

    it("should have all required output fields defined in schema", () => {
      const requiredOutputFields = [
        "id",
        "status",
        "sentAt",
        "contactPhone",
        "total",
        "currency",
      ];

      const emptyOutput = {};
      const result = sendToVendorOutput.safeParse(emptyOutput);

      expect(result.success).toBe(false);

      if (!result.success) {
        const missingFields = result.error.issues.map((issue) => issue.path[0]);
        for (const field of requiredOutputFields) {
          expect(missingFields).toContain(field);
        }
      }
    });

    it("should provide meaningful error messages in Spanish", () => {
      // Invalid phone format
      const invalidPhone = {
        contactPhone: "invalid",
        quoteId: "clx1a2b3c4d5e6f7g8h9i0j",
      };

      const phoneResult = sendToVendorInput.safeParse(invalidPhone);

      expect(phoneResult.success).toBe(false);
      if (!phoneResult.success) {
        const errorMessage = phoneResult.error.issues[0]?.message;
        expect(errorMessage).toBeDefined();
        expect(errorMessage).toMatch(/teléfono|formato/i);
      }

      // Invalid quote ID
      const invalidQuoteId = {
        contactPhone: "+573001234567",
        quoteId: "not-a-cuid",
      };

      const quoteIdResult = sendToVendorInput.safeParse(invalidQuoteId);

      expect(quoteIdResult.success).toBe(false);
      if (!quoteIdResult.success) {
        const errorMessage = quoteIdResult.error.issues[0]?.message;
        expect(errorMessage).toBeDefined();
        expect(errorMessage).toMatch(/cotización|inválido/i);
      }

      // Invalid email
      const invalidEmail = {
        contactEmail: "not-an-email",
        contactPhone: "+573001234567",
        quoteId: "clx1a2b3c4d5e6f7g8h9i0j",
      };

      const emailResult = sendToVendorInput.safeParse(invalidEmail);

      expect(emailResult.success).toBe(false);
      if (!emailResult.success) {
        const errorMessage = emailResult.error.issues[0]?.message;
        expect(errorMessage).toBeDefined();
        expect(errorMessage).toMatch(/correo|electrónico|inválido/i);
      }
    });
  });
});
