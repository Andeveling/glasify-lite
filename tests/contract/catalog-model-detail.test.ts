import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import { modelDetailOutput } from '../../src/server/api/routers/catalog';

/**
 * Contract tests for Enhanced Model Detail tRPC Output
 * Validates the modelDetailOutput schema extension for ProfileSupplier.materialType
 *
 * User Story 5: Compare Material Types (Priority P3)
 * - Ensures materialType enum is enforced
 * - Validates profileSupplier is nullable
 * - Confirms schema backward compatibility
 */
describe('modelDetailOutput Schema Contract', () => {
  describe('Schema Structure', () => {
    it('should have profileSupplier as nullable object', () => {
      const schema = modelDetailOutput.shape.profileSupplier;

      // profileSupplier should be a ZodNullable (allows null)
      expect(schema).toBeDefined();
      expect(schema._def.typeName).toBe('ZodNullable');
    });

    it('should include materialType in profileSupplier object', () => {
      const profileSupplierSchema = modelDetailOutput.shape.profileSupplier;

      // Unwrap nullable to get inner object schema
      const innerSchema = profileSupplierSchema.unwrap() as z.ZodObject<any>;

      expect(innerSchema.shape.id).toBeDefined();
      expect(innerSchema.shape.name).toBeDefined();
      expect(innerSchema.shape.materialType).toBeDefined();
    });

    it('should enforce MaterialType enum values', () => {
      const profileSupplierSchema = modelDetailOutput.shape.profileSupplier;
      const innerSchema = profileSupplierSchema.unwrap() as z.ZodObject<any>;
      const materialTypeSchema = innerSchema.shape.materialType;

      // materialType should be a ZodEnum
      expect(materialTypeSchema._def.typeName).toBe('ZodEnum');

      // Validate enum values match Prisma MaterialType
      const validValues = materialTypeSchema._def.values;
      expect(validValues).toEqual(['PVC', 'ALUMINUM', 'WOOD', 'MIXED']);
    });

    it('should include all required model fields', () => {
      const requiredFields = [
        'id',
        'name',
        'basePrice',
        'accessoryPrice',
        'costPerMmHeight',
        'costPerMmWidth',
        'minWidthMm',
        'maxWidthMm',
        'minHeightMm',
        'maxHeightMm',
        'compatibleGlassTypeIds',
        'status',
        'createdAt',
        'updatedAt',
      ];

      for (const field of requiredFields) {
        expect(modelDetailOutput.shape[field]).toBeDefined();
      }
    });
  });

  describe('Schema Validation - Valid Cases', () => {
    it('should accept valid model with PVC profileSupplier', () => {
      const validModel = {
        accessoryPrice: null,
        basePrice: 150_000,
        compatibleGlassTypeIds: ['glass-1', 'glass-2'],
        costPerMmHeight: 100,
        costPerMmWidth: 80,
        createdAt: new Date('2024-01-15'),
        id: 'model-123',
        maxHeightMm: 2200,
        maxWidthMm: 2400,
        minHeightMm: 800,
        minWidthMm: 600,
        name: 'Ventana Corrediza PVC',
        profileSupplier: {
          id: 'supplier-1',
          materialType: 'PVC' as const,
          name: 'Deceuninck',
        },
        status: 'published' as const,
        updatedAt: new Date('2024-01-20'),
      };

      const result = modelDetailOutput.safeParse(validModel);
      expect(result.success).toBe(true);
    });

    it('should accept valid model with ALUMINUM profileSupplier', () => {
      const validModel = {
        accessoryPrice: 5000,
        basePrice: 180_000,
        compatibleGlassTypeIds: ['glass-3'],
        costPerMmHeight: 120,
        costPerMmWidth: 90,
        createdAt: new Date('2024-02-10'),
        id: 'model-456',
        maxHeightMm: 2500,
        maxWidthMm: 6700,
        minHeightMm: 900,
        minWidthMm: 700,
        name: 'Ventana Corrediza Aluminio',
        profileSupplier: {
          id: 'supplier-2',
          materialType: 'ALUMINUM' as const,
          name: 'Alumina',
        },
        status: 'published' as const,
        updatedAt: new Date('2024-02-15'),
      };

      const result = modelDetailOutput.safeParse(validModel);
      expect(result.success).toBe(true);
    });

    it('should accept valid model with WOOD profileSupplier', () => {
      const validModel = {
        accessoryPrice: 8000,
        basePrice: 220_000,
        compatibleGlassTypeIds: ['glass-4', 'glass-5'],
        costPerMmHeight: 150,
        costPerMmWidth: 110,
        createdAt: new Date('2024-03-01'),
        id: 'model-789',
        maxHeightMm: 2100,
        maxWidthMm: 1800,
        minHeightMm: 700,
        minWidthMm: 500,
        name: 'Ventana Batiente Madera',
        profileSupplier: {
          id: 'supplier-3',
          materialType: 'WOOD' as const,
          name: 'WoodCraft',
        },
        status: 'draft' as const,
        updatedAt: new Date('2024-03-05'),
      };

      const result = modelDetailOutput.safeParse(validModel);
      expect(result.success).toBe(true);
    });

    it('should accept valid model with MIXED profileSupplier', () => {
      const validModel = {
        accessoryPrice: 6000,
        basePrice: 200_000,
        compatibleGlassTypeIds: ['glass-6'],
        costPerMmHeight: 130,
        costPerMmWidth: 95,
        createdAt: new Date('2024-04-01'),
        id: 'model-mixed',
        maxHeightMm: 2300,
        maxWidthMm: 2200,
        minHeightMm: 800,
        minWidthMm: 600,
        name: 'Ventana Híbrida',
        profileSupplier: {
          id: 'supplier-4',
          materialType: 'MIXED' as const,
          name: 'HybridWindows',
        },
        status: 'published' as const,
        updatedAt: new Date('2024-04-10'),
      };

      const result = modelDetailOutput.safeParse(validModel);
      expect(result.success).toBe(true);
    });

    it('should accept valid model with NULL profileSupplier', () => {
      const validModel = {
        accessoryPrice: null,
        basePrice: 100_000,
        compatibleGlassTypeIds: [],
        costPerMmHeight: 80,
        costPerMmWidth: 60,
        createdAt: new Date('2024-05-01'),
        id: 'model-no-supplier',
        maxHeightMm: 2000,
        maxWidthMm: 2000,
        minHeightMm: 700,
        minWidthMm: 500,
        name: 'Ventana Sin Proveedor',
        profileSupplier: null,
        status: 'draft' as const,
        updatedAt: new Date('2024-05-01'),
      };

      const result = modelDetailOutput.safeParse(validModel);
      expect(result.success).toBe(true);
    });
  });

  describe('Schema Validation - Invalid Cases', () => {
    it('should reject model with invalid materialType enum value', () => {
      const invalidModel = {
        accessoryPrice: null,
        basePrice: 150_000,
        compatibleGlassTypeIds: ['glass-1'],
        costPerMmHeight: 100,
        costPerMmWidth: 80,
        createdAt: new Date(),
        id: 'model-invalid',
        maxHeightMm: 2200,
        maxWidthMm: 2400,
        minHeightMm: 800,
        minWidthMm: 600,
        name: 'Invalid Model',
        profileSupplier: {
          id: 'supplier-1',
          materialType: 'STEEL', // ❌ Invalid enum value
          name: 'InvalidSupplier',
        },
        status: 'published' as const,
        updatedAt: new Date(),
      };

      const result = modelDetailOutput.safeParse(invalidModel);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = result.error.errors;
        const materialTypeError = errors.find((e: z.ZodIssue) => e.path.includes('materialType'));
        expect(materialTypeError).toBeDefined();
      }
    });

    it('should reject model with profileSupplier missing materialType', () => {
      const invalidModel = {
        accessoryPrice: null,
        basePrice: 150_000,
        compatibleGlassTypeIds: ['glass-1'],
        costPerMmHeight: 100,
        costPerMmWidth: 80,
        createdAt: new Date(),
        id: 'model-missing-field',
        maxHeightMm: 2200,
        maxWidthMm: 2400,
        minHeightMm: 800,
        minWidthMm: 600,
        name: 'Incomplete Model',
        profileSupplier: {
          id: 'supplier-1',
          name: 'Supplier Without Material',
          // ❌ Missing materialType field
        },
        status: 'published' as const,
        updatedAt: new Date(),
      };

      const result = modelDetailOutput.safeParse(invalidModel);
      expect(result.success).toBe(false);
    });

    it('should reject model with missing required fields', () => {
      const invalidModel = {
        id: 'incomplete-model',
        name: 'Missing Fields Model',
        // ❌ Missing basePrice, dimensions, etc.
        profileSupplier: null,
        status: 'published' as const,
      };

      const result = modelDetailOutput.safeParse(invalidModel);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = result.error.errors;
        expect(errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain compatibility with existing model queries', () => {
      // Simulate a model response from old tRPC query (before materialType addition)
      // New schema should still accept it if profileSupplier is null
      const oldStyleModel = {
        accessoryPrice: null,
        basePrice: 120_000,
        compatibleGlassTypeIds: ['glass-old'],
        costPerMmHeight: 90,
        costPerMmWidth: 70,
        createdAt: new Date('2023-12-01'),
        id: 'legacy-model',
        maxHeightMm: 2150,
        maxWidthMm: 2300,
        minHeightMm: 750,
        minWidthMm: 550,
        name: 'Legacy Ventana',
        profileSupplier: null, // Legacy models may not have supplier assigned
        status: 'published' as const,
        updatedAt: new Date('2023-12-01'),
      };

      const result = modelDetailOutput.safeParse(oldStyleModel);
      expect(result.success).toBe(true);
    });

    it('should accept models with all original fields intact', () => {
      const completeModel = {
        accessoryPrice: 4500,
        basePrice: 175_000,
        compatibleGlassTypeIds: ['glass-a', 'glass-b', 'glass-c'],
        costPerMmHeight: 110,
        costPerMmWidth: 85,
        createdAt: new Date('2024-06-01'),
        id: 'complete-model',
        maxHeightMm: 2400,
        maxWidthMm: 2600,
        minHeightMm: 850,
        minWidthMm: 650,
        name: 'Complete Ventana',
        profileSupplier: {
          id: 'supplier-complete',
          materialType: 'PVC' as const,
          name: 'CompleteSupplier',
        },
        status: 'published' as const,
        updatedAt: new Date('2024-06-15'),
      };

      const result = modelDetailOutput.safeParse(completeModel);
      expect(result.success).toBe(true);

      if (result.success) {
        // Verify all fields are preserved
        expect(result.data.id).toBe(completeModel.id);
        expect(result.data.basePrice).toBe(completeModel.basePrice);
        expect(result.data.profileSupplier?.materialType).toBe('PVC');
      }
    });
  });

  describe('Material Comparison Support', () => {
    it('should allow easy comparison of PVC vs ALUMINUM models', () => {
      const pvcModel = {
        accessoryPrice: null,
        basePrice: 150_000,
        compatibleGlassTypeIds: ['glass-1'],
        costPerMmHeight: 100,
        costPerMmWidth: 80,
        createdAt: new Date(),
        id: 'pvc-comparison',
        maxHeightMm: 2200,
        maxWidthMm: 2400,
        minHeightMm: 800,
        minWidthMm: 600,
        name: 'PVC Modelo',
        profileSupplier: {
          id: 'pvc-supplier',
          materialType: 'PVC' as const,
          name: 'PVC Supplier',
        },
        status: 'published' as const,
        updatedAt: new Date(),
      };

      const aluminumModel = {
        ...pvcModel,
        basePrice: 180_000,
        id: 'aluminum-comparison',
        maxWidthMm: 6700,
        name: 'Aluminum Modelo',
        profileSupplier: {
          id: 'aluminum-supplier',
          materialType: 'ALUMINUM' as const,
          name: 'Aluminum Supplier',
        },
      };

      const pvcResult = modelDetailOutput.safeParse(pvcModel);
      const aluminumResult = modelDetailOutput.safeParse(aluminumModel);

      expect(pvcResult.success).toBe(true);
      expect(aluminumResult.success).toBe(true);

      // Material types should be clearly differentiable
      if (pvcResult.success && aluminumResult.success) {
        expect(pvcResult.data.profileSupplier?.materialType).toBe('PVC');
        expect(aluminumResult.data.profileSupplier?.materialType).toBe('ALUMINUM');
        expect(pvcResult.data.profileSupplier?.materialType).not.toBe(
          aluminumResult.data.profileSupplier?.materialType
        );
      }
    });
  });
});
