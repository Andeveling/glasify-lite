/**
 * Contract Tests: Quote Server Actions
 *
 * Tests the input/output schemas for quote-related Server Actions.
 * These tests ensure the contract between client and server remains valid.
 *
 * @see specs/002-budget-cart-workflow/contracts/quote-queries.schema.ts
 * @vitest-environment node
 */

import { describe, expect, it } from "vitest";
import {
  type GenerateQuoteFromCartInput,
  generateQuoteFromCartInput,
  generateQuoteFromCartOutput,
} from "../../../specs/002-budget-cart-workflow/contracts/quote-queries.schema";

describe("Quote Actions - Contract Tests", () => {
  describe("generateQuoteFromCartInput schema", () => {
    it("should validate correct input with all required fields", () => {
      const validInput: GenerateQuoteFromCartInput = {
        cartItems: [
          {
            additionalServiceIds: [],
            glassTypeId: "cm1glass123456789",
            heightMm: 1500,
            id: "cm1abc123def456ghi789jkl",
            modelId: "cm1model123456789",
            name: "VEKA-001",
            quantity: 2,
            widthMm: 1200,
          },
        ],
        projectName: "Casa Rodriguez",
      };

      const result = generateQuoteFromCartInput.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should validate input with optional project address fields", () => {
      const validInput: GenerateQuoteFromCartInput = {
        cartItems: [
          {
            additionalServiceIds: ["cm1service123456789"],
            glassTypeId: "cm1glass123456789",
            heightMm: 1200,
            id: "cm1abc123def456ghi789jkl",
            modelId: "cm1model123456789",
            name: "Guardian-001",
            quantity: 1,
            widthMm: 1000,
          },
        ],
        contactAddress: "Av. Principal 123, CABA",
        contactPhone: "+54 11 1234-5678",
        projectCity: "Buenos Aires",
        projectName: "Edificio Central",
        projectPostalCode: "1001",
        projectState: "CABA",
        projectStreet: "Av. Principal 123",
      };

      const result = generateQuoteFromCartInput.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should validate input with optional solution in cart items", () => {
      const validInput: GenerateQuoteFromCartInput = {
        cartItems: [
          {
            additionalServiceIds: [],
            glassTypeId: "cm1glass123456789",
            heightMm: 1800,
            id: "cm1abc123def456ghi789jkl",
            modelId: "cm1model123456789",
            name: "VEKA-001",
            quantity: 3,
            solutionId: "cm1solution123456789",
            widthMm: 1500,
          },
        ],
        projectName: "Casa Modern",
      };

      const result = generateQuoteFromCartInput.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should validate input with multiple cart items", () => {
      const validInput: GenerateQuoteFromCartInput = {
        cartItems: [
          {
            additionalServiceIds: [],
            glassTypeId: "cm1glass123456789",
            heightMm: 1500,
            id: "cm1abc123def456ghi789jk1",
            modelId: "cm1model123456789",
            name: "VEKA-001",
            quantity: 2,
            widthMm: 1200,
          },
          {
            additionalServiceIds: ["cm1service123"],
            glassTypeId: "cm1glass987654321",
            heightMm: 1400,
            id: "cm1abc123def456ghi789jk2",
            modelId: "cm1model987654321",
            name: "Guardian-001",
            quantity: 1,
            solutionId: "cm1solution123",
            widthMm: 1000,
          },
        ],
        projectName: "Proyecto Ventanas 2025",
      };

      const result = generateQuoteFromCartInput.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should reject empty project name", () => {
      const invalidInput = {
        cartItems: [
          {
            additionalServiceIds: [],
            glassTypeId: "cm1glass123456789",
            heightMm: 1500,
            id: "cm1abc123def456ghi789jkl",
            modelId: "cm1model123456789",
            name: "VEKA-001",
            quantity: 1,
            widthMm: 1200,
          },
        ],
        projectName: "",
      };

      const result = generateQuoteFromCartInput.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain("projectName");
      }
    });

    it("should reject project name longer than 100 characters", () => {
      const maxLength = 100;
      const invalidInput = {
        cartItems: [
          {
            additionalServiceIds: [],
            glassTypeId: "cm1glass123456789",
            heightMm: 1500,
            id: "cm1abc123def456ghi789jkl",
            modelId: "cm1model123456789",
            name: "VEKA-001",
            quantity: 1,
            widthMm: 1200,
          },
        ],
        projectName: "a".repeat(maxLength + 1),
      };

      const result = generateQuoteFromCartInput.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain("projectName");
        expect(result.error.issues[0]?.message).toContain("muy largo");
      }
    });

    it("should reject empty cart items array", () => {
      const invalidInput = {
        cartItems: [],
        projectName: "Casa Test",
      };

      const result = generateQuoteFromCartInput.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain("cartItems");
        expect(result.error.issues[0]?.message).toContain("al menos un item");
      }
    });

    it("should reject cart item with invalid CUID format", () => {
      const invalidInput = {
        cartItems: [
          {
            additionalServiceIds: [],
            glassTypeId: "cm1glass123456789",
            heightMm: 1500,
            id: "invalid-id-format",
            modelId: "cm1model123456789",
            name: "VEKA-001",
            quantity: 1,
            widthMm: 1200,
          },
        ],
        projectName: "Casa Test",
      };

      const result = generateQuoteFromCartInput.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain("id");
      }
    });

    it("should reject cart item with zero quantity", () => {
      const invalidInput = {
        cartItems: [
          {
            additionalServiceIds: [],
            glassTypeId: "cm1glass123456789",
            heightMm: 1500,
            id: "cm1abc123def456ghi789jkl",
            modelId: "cm1model123456789",
            name: "VEKA-001",
            quantity: 0,
            widthMm: 1200,
          },
        ],
        projectName: "Casa Test",
      };

      const result = generateQuoteFromCartInput.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain("quantity");
      }
    });

    it("should reject cart item with negative dimensions", () => {
      const invalidInput = {
        cartItems: [
          {
            additionalServiceIds: [],
            glassTypeId: "cm1glass123456789",
            heightMm: 1500,
            id: "cm1abc123def456ghi789jkl",
            modelId: "cm1model123456789",
            name: "VEKA-001",
            quantity: 1,
            widthMm: -1200,
          },
        ],
        projectName: "Casa Test",
      };

      const result = generateQuoteFromCartInput.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain("widthMm");
      }
    });

    it("should reject cart item name longer than 50 characters", () => {
      const maxLength = 50;
      const invalidInput = {
        cartItems: [
          {
            additionalServiceIds: [],
            glassTypeId: "cm1glass123456789",
            heightMm: 1500,
            id: "cm1abc123def456ghi789jkl",
            modelId: "cm1model123456789",
            name: "a".repeat(maxLength + 1),
            quantity: 1,
            widthMm: 1200,
          },
        ],
        projectName: "Casa Test",
      };

      const result = generateQuoteFromCartInput.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain("name");
      }
    });
  });

  describe("generateQuoteFromCartOutput schema", () => {
    it("should validate successful quote generation response", () => {
      const validOutput = {
        data: {
          itemCount: 3,
          quoteId: "cm1quote123456789abc",
          total: 45_000.5,
          validUntil: new Date("2025-10-24T00:00:00Z"),
        },
        success: true,
      };

      const result = generateQuoteFromCartOutput.safeParse(validOutput);
      expect(result.success).toBe(true);
    });

    it("should validate error response with VALIDATION_ERROR code", () => {
      const validOutput = {
        error: {
          code: "VALIDATION_ERROR",
          details: {
            field: "projectName",
            value: "",
          },
          message: "Nombre del proyecto es requerido",
        },
        success: false,
      };

      const result = generateQuoteFromCartOutput.safeParse(validOutput);
      expect(result.success).toBe(true);
    });

    it("should validate error response with UNAUTHORIZED code", () => {
      const validOutput = {
        error: {
          code: "UNAUTHORIZED",
          message: "Debe autenticarse para generar una cotización",
        },
        success: false,
      };

      const result = generateQuoteFromCartOutput.safeParse(validOutput);
      expect(result.success).toBe(true);
    });

    it("should validate error response with CART_EMPTY code", () => {
      const validOutput = {
        error: {
          code: "CART_EMPTY",
          message: "El carrito está vacío",
        },
        success: false,
      };

      const result = generateQuoteFromCartOutput.safeParse(validOutput);
      expect(result.success).toBe(true);
    });

    it("should validate error response with PRICE_CHANGED code", () => {
      const validOutput = {
        error: {
          code: "PRICE_CHANGED",
          details: {
            newTotal: 42_000,
            oldTotal: 40_000,
          },
          message:
            "Los precios han cambiado desde que agregó los items al carrito",
        },
        success: false,
      };

      const result = generateQuoteFromCartOutput.safeParse(validOutput);
      expect(result.success).toBe(true);
    });

    it("should validate error response with UNKNOWN code", () => {
      const validOutput = {
        error: {
          code: "UNKNOWN",
          message: "Error inesperado al generar la cotización",
        },
        success: false,
      };

      const result = generateQuoteFromCartOutput.safeParse(validOutput);
      expect(result.success).toBe(true);
    });

    it("should reject success response with missing quoteId", () => {
      const invalidOutput = {
        data: {
          itemCount: 3,
          total: 45_000.5,
          validUntil: new Date("2025-10-24T00:00:00Z"),
        },
        success: true,
      };

      const result = generateQuoteFromCartOutput.safeParse(invalidOutput);
      expect(result.success).toBe(false);
    });

    it("should reject success response with negative total", () => {
      const invalidOutput = {
        data: {
          itemCount: 3,
          quoteId: "cm1quote123456789abc",
          total: -100,
          validUntil: new Date("2025-10-24T00:00:00Z"),
        },
        success: true,
      };

      const result = generateQuoteFromCartOutput.safeParse(invalidOutput);
      expect(result.success).toBe(false);
    });

    it("should reject error response with invalid error code", () => {
      const invalidOutput = {
        error: {
          code: "INVALID_CODE",
          message: "Error message",
        },
        success: false,
      };

      const result = generateQuoteFromCartOutput.safeParse(invalidOutput);
      expect(result.success).toBe(false);
    });

    it("should reject mixed success/error response", () => {
      const invalidOutput = {
        error: {
          code: "VALIDATION_ERROR",
          message: "Error message",
        },
        success: true,
      };

      const result = generateQuoteFromCartOutput.safeParse(invalidOutput);
      expect(result.success).toBe(false);
    });
  });
});
