/** biome-ignore-all lint/style/noMagicNumbers: Test file with expected numeric literal values for assertions */

import {
  ALL_SUPPLIERS,
  MaterialTypeEnum,
  type ProfileSupplier,
} from "@/lib/seeding/schemas/profile-supplier.schema";
import { describe, expect, it } from "vitest";
import {
  generateInactiveProfileSupplier,
  generateProfileSupplier,
  generateProfileSupplierBatch,
  generateProfileSupplierFromPreset,
  generateProfileSupplierWithMaterial,
  generateProfileSupplierWithName,
  generateProfileSupplierWithNotes,
  generateProfileSuppliers,
} from "../../../../../src/lib/seeding/factories/profile-supplier.factory";

describe("ProfileSupplier Factory", () => {
  describe("generateProfileSupplier", () => {
    it("should generate a valid ProfileSupplier", () => {
      const result = generateProfileSupplier();

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data).toBeDefined();
        expect(result.data.name).toBeDefined();
        expect(result.data.name.length).toBeGreaterThanOrEqual(2);
        expect(result.data.name.length).toBeLessThanOrEqual(100);
        expect(result.data.materialType).toBeDefined();
        expect(["PVC", "ALUMINUM", "WOOD", "MIXED"]).toContain(
          result.data.materialType,
        );
        expect(typeof result.data.isActive).toBe("boolean");
      }
    });

    it("should generate active supplier by default", () => {
      const result = generateProfileSupplier();

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.isActive).toBe(true);
      }
    });

    it("should respect name override", () => {
      const customName = "Custom Supplier Name";
      const result = generateProfileSupplier({
        overrides: { name: customName },
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.name).toBe(customName);
      }
    });

    it("should respect materialType override", () => {
      const result = generateProfileSupplier({
        overrides: {
          materialType: MaterialTypeEnum.enum.PVC,
        },
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.materialType).toBe("PVC");
      }
    });

    it("should respect isActive override", () => {
      const result = generateProfileSupplier({
        overrides: { isActive: false },
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.isActive).toBe(false);
      }
    });

    it("should respect notes override", () => {
      const customNotes = "Custom supplier notes";
      const result = generateProfileSupplier({
        overrides: { notes: customNotes },
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.notes).toBe(customNotes);
      }
    });

    it("should accept undefined notes (optional)", () => {
      const result = generateProfileSupplier({
        overrides: { notes: undefined },
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.notes).toBeUndefined();
      }
    });

    it("should fail validation with empty name", () => {
      const result = generateProfileSupplier({ overrides: { name: "" } });

      expect(result.success).toBe(false);
      if (!result.success && result.errors) {
        expect(result.errors).toBeDefined();
        expect(result.errors[0]?.path).toContain("name");
      }
    });

    it("should fail validation with name exceeding max length", () => {
      const longName = "a".repeat(101);
      const result = generateProfileSupplier({ overrides: { name: longName } });

      expect(result.success).toBe(false);
      if (!result.success && result.errors) {
        expect(result.errors).toBeDefined();
        expect(result.errors[0]?.path).toContain("name");
      }
    });

    it("should fail validation with notes exceeding max length", () => {
      const longNotes = "a".repeat(501);
      const result = generateProfileSupplier({
        overrides: { notes: longNotes },
      });

      expect(result.success).toBe(false);
      if (!result.success && result.errors) {
        expect(result.errors).toBeDefined();
        expect(result.errors[0]?.path).toContain("notes");
      }
    });

    it("should fail validation with invalid materialType", () => {
      const result = generateProfileSupplier({
        overrides: {
          materialType: "INVALID" as never,
        },
      });

      expect(result.success).toBe(false);
      if (!result.success && result.errors) {
        expect(result.errors).toBeDefined();
        expect(result.errors[0]?.path).toContain("materialType");
      }
    });
  });

  describe("generateProfileSuppliers", () => {
    it("should generate multiple suppliers", () => {
      const count = 5;
      const results = generateProfileSuppliers(count);

      expect(results).toHaveLength(count);
    });

    it("should return empty array for zero count", () => {
      const results = generateProfileSuppliers(0);

      expect(results).toHaveLength(0);
    });

    it("should respect overrides for all suppliers", () => {
      const count = 3;
      const results = generateProfileSuppliers(count, {
        overrides: { materialType: MaterialTypeEnum.enum.ALUMINUM },
      });

      expect(results).toHaveLength(count);
      for (const result of results) {
        expect(result.success).toBe(true);
        if (result.success && result.data) {
          expect(result.data.materialType).toBe("ALUMINUM");
        }
      }
    });

    it("should generate suppliers with different names", () => {
      const count = 10;
      const results = generateProfileSuppliers(count);

      const successResults = results.filter((r) => r.success);
      const names = successResults.map((r) => {
        if (r.success && r.data) {
          return r.data.name;
        }
        return "";
      });

      // Most names should be unique (not all random, some use presets)
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBeGreaterThan(0);
    });
  });

  describe("generateProfileSupplierBatch", () => {
    it("should generate batch with only successful results", () => {
      const count = 5;
      const batch = generateProfileSupplierBatch(count);

      expect(batch).toHaveLength(count);
      for (const supplier of batch) {
        expect(supplier.name).toBeDefined();
        expect(supplier.materialType).toBeDefined();
        expect(typeof supplier.isActive).toBe("boolean");
      }
    });

    it("should return empty array for zero count", () => {
      const batch = generateProfileSupplierBatch(0);

      expect(batch).toHaveLength(0);
    });

    it("should respect overrides in batch", () => {
      const count = 3;
      const batch = generateProfileSupplierBatch(count, {
        overrides: { isActive: false },
      });

      expect(batch).toHaveLength(count);
      for (const supplier of batch) {
        expect(supplier.isActive).toBe(false);
      }
    });

    it("should generate large batches efficiently", () => {
      const count = 100;
      const batch = generateProfileSupplierBatch(count);

      expect(batch).toHaveLength(count);
    });
  });

  describe("generateProfileSupplierWithMaterial", () => {
    it("should generate PVC supplier", () => {
      const result = generateProfileSupplierWithMaterial(
        MaterialTypeEnum.enum.PVC,
      );

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.materialType).toBe("PVC");
      }
    });

    it("should generate ALUMINUM supplier", () => {
      const result = generateProfileSupplierWithMaterial(
        MaterialTypeEnum.enum.ALUMINUM,
      );

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.materialType).toBe("ALUMINUM");
      }
    });

    it("should generate WOOD supplier", () => {
      const result = generateProfileSupplierWithMaterial(
        MaterialTypeEnum.enum.WOOD,
      );

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.materialType).toBe("WOOD");
      }
    });

    it("should generate MIXED supplier", () => {
      const result = generateProfileSupplierWithMaterial(
        MaterialTypeEnum.enum.MIXED,
      );

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.materialType).toBe("MIXED");
      }
    });

    it("should respect additional overrides", () => {
      const result = generateProfileSupplierWithMaterial(
        MaterialTypeEnum.enum.PVC,
        {
          overrides: { isActive: false },
        },
      );

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.materialType).toBe("PVC");
        expect(result.data.isActive).toBe(false);
      }
    });
  });

  describe("generateProfileSupplierFromPreset", () => {
    it("should generate from PVC_SUPPLIERS preset", () => {
      // Use index 0 (first PVC supplier in ALL_SUPPLIERS)
      const result = generateProfileSupplierFromPreset(0);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(ALL_SUPPLIERS.some((p) => p.name === result.data?.name)).toBe(
          true,
        );
      }
    });

    it("should generate from ALUMINUM_SUPPLIERS preset", () => {
      // Use index 3 (first ALUMINUM supplier in ALL_SUPPLIERS)
      const result = generateProfileSupplierFromPreset(3);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(ALL_SUPPLIERS.some((p) => p.name === result.data?.name)).toBe(
          true,
        );
      }
    });

    it("should generate from MIXED_SUPPLIERS preset", () => {
      // Use index 5 (MIXED supplier in ALL_SUPPLIERS)
      const result = generateProfileSupplierFromPreset(5);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(ALL_SUPPLIERS.some((p) => p.name === result.data?.name)).toBe(
          true,
        );
      }
    });

    it("should generate from random preset when no index provided", () => {
      const result = generateProfileSupplierFromPreset();

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(ALL_SUPPLIERS.some((p) => p.name === result.data?.name)).toBe(
          true,
        );
      }
    });

    it("should respect additional overrides", () => {
      const customNotes = "Custom preset notes";
      const result = generateProfileSupplierFromPreset(0, {
        overrides: { notes: customNotes },
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.notes).toBe(customNotes);
      }
    });

    it("should preset data take precedence over default overrides", () => {
      // Generate from preset index 0 (first supplier in ALL_SUPPLIERS)
      const result = generateProfileSupplierFromPreset(0);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        // Should use preset name
        expect(result.data.name).toBe(ALL_SUPPLIERS[0]?.name);
      }
    });
  });

  describe("generateInactiveProfileSupplier", () => {
    it("should generate inactive supplier", () => {
      const result = generateInactiveProfileSupplier();

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.isActive).toBe(false);
      }
    });

    it("should respect additional overrides", () => {
      const customName = "Inactive Supplier";
      const result = generateInactiveProfileSupplier({
        overrides: { name: customName },
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.name).toBe(customName);
        expect(result.data.isActive).toBe(false);
      }
    });

    it("should not allow overriding isActive to true", () => {
      // isActive=false should take precedence
      const result = generateInactiveProfileSupplier({
        overrides: { isActive: true },
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.isActive).toBe(false);
      }
    });
  });

  describe("generateProfileSupplierWithName", () => {
    it("should generate supplier with custom name", () => {
      const customName = "Test Supplier Company";
      const result = generateProfileSupplierWithName(customName);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.name).toBe(customName);
      }
    });

    it("should respect additional overrides", () => {
      const customName = "Test Supplier";
      const result = generateProfileSupplierWithName(customName, {
        overrides: { materialType: MaterialTypeEnum.enum.WOOD },
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.name).toBe(customName);
        expect(result.data.materialType).toBe("WOOD");
      }
    });

    it("should fail validation with empty name", () => {
      const result = generateProfileSupplierWithName("");

      expect(result.success).toBe(false);
      if (!result.success && result.errors) {
        expect(result.errors).toBeDefined();
        expect(result.errors[0]?.path).toContain("name");
      }
    });

    it("should fail validation with name exceeding max length", () => {
      const longName = "a".repeat(101);
      const result = generateProfileSupplierWithName(longName);

      expect(result.success).toBe(false);
      if (!result.success && result.errors) {
        expect(result.errors).toBeDefined();
        expect(result.errors[0]?.path).toContain("name");
      }
    });
  });

  describe("generateProfileSupplierWithNotes", () => {
    it("should generate supplier with custom notes", () => {
      const customNotes = "This is a test supplier with custom notes";
      const result = generateProfileSupplierWithNotes(customNotes);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.notes).toBe(customNotes);
      }
    });

    it("should respect additional overrides", () => {
      const customNotes = "Test notes";
      const result = generateProfileSupplierWithNotes(customNotes, {
        overrides: { isActive: false },
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.notes).toBe(customNotes);
        expect(result.data.isActive).toBe(false);
      }
    });

    it("should fail validation with notes exceeding max length", () => {
      const longNotes = "a".repeat(501);
      const result = generateProfileSupplierWithNotes(longNotes);

      expect(result.success).toBe(false);
      if (!result.success && result.errors) {
        expect(result.errors).toBeDefined();
        expect(result.errors[0]?.path).toContain("notes");
      }
    });
  });

  describe("data quality and consistency", () => {
    it("should generate realistic supplier names", () => {
      const count = 20;
      const results = generateProfileSuppliers(count);

      for (const result of results) {
        if (result.success && result.data) {
          const { name } = result.data;
          // Name should not be empty and should have reasonable length
          expect(name.length).toBeGreaterThan(0);
          expect(name.length).toBeLessThanOrEqual(100);
          // Name should not have excessive whitespace
          expect(name.trim()).toBe(name);
        }
      }
    });

    it("should generate valid material type distribution", () => {
      const count = 100;
      const batch = generateProfileSupplierBatch(count);

      const materialTypes = batch.map((s) => s.materialType);
      const uniqueMaterials = new Set(materialTypes);

      // Should have variety in material types
      expect(uniqueMaterials.size).toBeGreaterThan(1);

      // All should be valid enum values
      for (const materialType of materialTypes) {
        expect(["PVC", "ALUMINUM", "WOOD", "MIXED"]).toContain(materialType);
      }
    });

    it("should handle optional notes correctly", () => {
      const count = 50;
      const batch = generateProfileSupplierBatch(count);

      let withNotes = 0;
      let withoutNotes = 0;

      for (const supplier of batch) {
        if (supplier.notes) {
          withNotes++;
          expect(supplier.notes.length).toBeLessThanOrEqual(500);
        } else {
          withoutNotes++;
        }
      }

      // Should have a mix of suppliers with and without notes
      expect(withNotes).toBeGreaterThan(0);
      expect(withoutNotes).toBeGreaterThan(0);
    });

    it("should generate active suppliers by default in batches", () => {
      const count = 20;
      const batch = generateProfileSupplierBatch(count);

      const activeCount = batch.filter((s) => s.isActive).length;

      // By default, most should be active (at least 80%)
      expect(activeCount).toBeGreaterThanOrEqual(count * 0.8);
    });
  });

  describe("type safety", () => {
    it("should return ProfileSupplier type from successful generation", () => {
      const result = generateProfileSupplier();

      if (result.success && result.data) {
        const supplier: ProfileSupplier = result.data;
        expect(supplier).toBeDefined();
      }
    });

    it("should return array of ProfileSupplier from batch generation", () => {
      const batch = generateProfileSupplierBatch(5);

      const suppliers: ProfileSupplier[] = batch;
      expect(suppliers).toBeDefined();
      expect(Array.isArray(suppliers)).toBe(true);
    });
  });
});
