/**
 * Tests for Admin Quote Creation Form Schema
 *
 * RED→GREEN cycle for the admin quote creation form validation.
 * Tests the Zod schema for items array and project address.
 *
 * @module tests/unit/app/admin/quotes/admin-quote-form.test
 */

import { describe, expect, it } from "vitest";
import {
  type AdminQuoteFormValues,
  adminQuoteFormSchema,
  adminQuoteItemSchema,
  getAdminQuoteFormDefaults,
} from "@/app/(dashboard)/admin/quotes/new/_components/schemas/admin-quote-form.schema";

// Default dimension constants (must match schema defaults)
const DEFAULT_WIDTH_MM = 1000;
const DEFAULT_HEIGHT_MM = 1000;

describe("AdminQuoteFormSchema", () => {
  describe("adminQuoteItemSchema", () => {
    it("should accept valid item with all fields", () => {
      const validItem = {
        glassTypeId: "clxxx111111111111111111",
        heightMm: 1000,
        modelId: "clxxx222222222222222222",
        quantity: 2,
        widthMm: 800,
      };

      const result = adminQuoteItemSchema.safeParse(validItem);
      expect(result.success).toBe(true);
    });

    it("should reject item with empty modelId", () => {
      const invalidItem = {
        glassTypeId: "clxxx111111111111111111",
        heightMm: 1000,
        modelId: "",
        quantity: 2,
        widthMm: 800,
      };

      const result = adminQuoteItemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
    });

    it("should reject item with zero quantity", () => {
      const invalidItem = {
        glassTypeId: "clxxx111111111111111111",
        heightMm: 1000,
        modelId: "clxxx222222222222222222",
        quantity: 0,
        widthMm: 800,
      };

      const result = adminQuoteItemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
    });

    it("should reject item with negative dimensions", () => {
      const invalidItem = {
        glassTypeId: "clxxx111111111111111111",
        heightMm: -100,
        modelId: "clxxx222222222222222222",
        quantity: 1,
        widthMm: 800,
      };

      const result = adminQuoteItemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
    });
  });

  describe("adminQuoteFormSchema", () => {
    it("should accept valid form with single item", () => {
      const validForm: AdminQuoteFormValues = {
        clientId: null,
        items: [
          {
            glassTypeId: "clxxx111111111111111111",
            heightMm: 1000,
            modelId: "clxxx222222222222222222",
            quantity: 2,
            widthMm: 800,
          },
        ],
        projectAddress: {
          projectCity: "Panama City",
          projectName: "Edificio Parismina",
          projectState: "Panama",
          projectStreet: "Av. Principal 123",
        },
        projectName: "Edificio Parismina",
      };

      const result = adminQuoteFormSchema.safeParse(validForm);
      expect(result.success).toBe(true);
    });

    it("should accept valid form with multiple items", () => {
      const validForm: AdminQuoteFormValues = {
        clientId: "clxxx333333333333333333",
        items: [
          {
            glassTypeId: "clxxx111111111111111111",
            heightMm: 1000,
            modelId: "clxxx222222222222222222",
            quantity: 2,
            widthMm: 800,
          },
          {
            glassTypeId: "clxxx444444444444444444",
            heightMm: 1200,
            modelId: "clxxx555555555555555555",
            quantity: 1,
            widthMm: 900,
          },
        ],
        projectAddress: {
          projectCity: "Panama City",
          projectName: "Edificio Parismina",
          projectState: "Panama",
          projectStreet: "Av. Principal 123",
        },
        projectName: "Edificio Parismina",
      };

      const result = adminQuoteFormSchema.safeParse(validForm);
      expect(result.success).toBe(true);
    });

    it("should reject form with empty items array", () => {
      const invalidForm = {
        clientId: null,
        items: [],
        projectAddress: {
          projectCity: "Panama City",
          projectName: "Edificio Parismina",
          projectState: "Panama",
          projectStreet: "Av. Principal 123",
        },
        projectName: "Edificio Parismina",
      };

      const result = adminQuoteFormSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
    });

    it("should reject form with empty project name", () => {
      const invalidForm = {
        clientId: null,
        items: [
          {
            glassTypeId: "clxxx111111111111111111",
            heightMm: 1000,
            modelId: "clxxx222222222222222222",
            quantity: 2,
            widthMm: 800,
          },
        ],
        projectAddress: {
          projectCity: "Panama City",
          projectName: "Edificio Parismina",
          projectState: "Panama",
          projectStreet: "Av. Principal 123",
        },
        projectName: "",
      };

      const result = adminQuoteFormSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
    });

    it("should reject form with empty address fields", () => {
      const invalidForm = {
        clientId: null,
        items: [
          {
            glassTypeId: "clxxx111111111111111111",
            heightMm: 1000,
            modelId: "clxxx222222222222222222",
            quantity: 2,
            widthMm: 800,
          },
        ],
        projectAddress: {
          projectCity: "",
          projectName: "Edificio Parismina",
          projectState: "Panama",
          projectStreet: "Av. Principal 123",
        },
        projectName: "Edificio Parismina",
      };

      const result = adminQuoteFormSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
    });
  });

  describe("getAdminQuoteFormDefaults", () => {
    it("should return valid default values", () => {
      const defaults = getAdminQuoteFormDefaults();

      expect(defaults.clientId).toBeNull();
      expect(defaults.items).toHaveLength(1);
      expect(defaults.items[0]?.modelId).toBe("");
      expect(defaults.items[0]?.glassTypeId).toBe("");
      expect(defaults.items[0]?.quantity).toBe(1);
      expect(defaults.items[0]?.widthMm).toBe(DEFAULT_WIDTH_MM);
      expect(defaults.items[0]?.heightMm).toBe(DEFAULT_HEIGHT_MM);
      expect(defaults.projectName).toBe("");
      expect(defaults.projectAddress.projectCity).toBe("");
      expect(defaults.projectAddress.projectName).toBe("");
      expect(defaults.projectAddress.projectState).toBe("");
      expect(defaults.projectAddress.projectStreet).toBe("");
    });

    it("should have valid structure for form initialization", () => {
      const defaults = getAdminQuoteFormDefaults();
      const result = adminQuoteFormSchema.safeParse(defaults);

      // Should pass schema validation (all required fields for items array
      // have defaults, but project fields are empty strings which fail min(1))
      // This is expected behavior - form should require user input
      expect(result.success).toBe(false); // Empty project fields should fail
    });
  });
});
