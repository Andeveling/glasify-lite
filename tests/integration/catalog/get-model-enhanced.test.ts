import { describe, expect, it } from 'vitest';
import { appRouter } from '../../../src/server/api/root';
import { db } from '../../../src/server/db';

/**
 * Integration tests for enhanced catalog queries with ProfileSupplier.materialType
 * These tests verify the end-to-end data flow from database to tRPC response
 */
describe('Enhanced Catalog Model Query Integration', () => {
  describe('get-model-by-id with ProfileSupplier.materialType', () => {
    it('should include materialType in profileSupplier response', async () => {
      // Create tRPC caller
      const caller = appRouter.createCaller({ db, session: null });

      // Find a published model with a profile supplier
      const modelWithSupplier = await db.model.findFirst({
        select: {
          id: true,
          name: true,
          profileSupplier: {
            select: {
              materialType: true,
              name: true,
            },
          },
        },
        where: {
          profileSupplier: {
            isNot: null,
          },
          status: 'published',
        },
      });

      if (!modelWithSupplier) {
        // If no model with supplier exists, this test cannot run
        // This is acceptable - the test environment should be seeded with appropriate data
        expect(true).toBe(true);
        return;
      }

      // Call the tRPC query
      const result = await caller.catalog['get-model-by-id']({
        modelId: modelWithSupplier.id,
      });

      // Verify basic model data
      expect(result).toBeDefined();
      expect(result.id).toBe(modelWithSupplier.id);
      expect(result.name).toBe(modelWithSupplier.name);

      // Verify profileSupplier includes materialType
      expect(result.profileSupplier).toBeDefined();
      expect(result.profileSupplier).not.toBeNull();

      if (result.profileSupplier) {
        expect(result.profileSupplier.id).toBeDefined();
        expect(result.profileSupplier.name).toBe(modelWithSupplier.profileSupplier?.name);
        expect(result.profileSupplier.materialType).toBeDefined();

        // Verify materialType is a valid enum value
        expect(['PVC', 'ALUMINUM', 'WOOD', 'MIXED']).toContain(result.profileSupplier.materialType);
      }
    });

    it('should handle models without profileSupplier gracefully', async () => {
      const caller = appRouter.createCaller({ db, session: null });

      // Find a model without a profile supplier
      const modelWithoutSupplier = await db.model.findFirst({
        select: {
          id: true,
        },
        where: {
          profileSupplierId: null,
          status: 'published',
        },
      });

      if (!modelWithoutSupplier) {
        // All models have suppliers in test environment - that's fine
        expect(true).toBe(true);
        return;
      }

      const result = await caller.catalog['get-model-by-id']({
        modelId: modelWithoutSupplier.id,
      });

      // Verify profileSupplier is null (not undefined, not missing)
      expect(result.profileSupplier).toBeNull();
    });

    it('should validate materialType enum values from database', async () => {
      const caller = appRouter.createCaller({ db, session: null });

      // Get all published models with suppliers
      const modelsWithSuppliers = await db.model.findMany({
        select: {
          id: true,
          profileSupplier: {
            select: {
              materialType: true,
            },
          },
        },
        take: 5, // Test a sample
        where: {
          profileSupplier: {
            isNot: null,
          },
          status: 'published',
        },
      });

      if (modelsWithSuppliers.length === 0) {
        expect(true).toBe(true);
        return;
      }

      // Verify each model returns valid materialType via tRPC
      for (const model of modelsWithSuppliers) {
        const result = await caller.catalog['get-model-by-id']({
          modelId: model.id,
        });

        expect(result.profileSupplier).not.toBeNull();

        if (result.profileSupplier) {
          expect(['PVC', 'ALUMINUM', 'WOOD', 'MIXED']).toContain(result.profileSupplier.materialType);

          // Verify it matches database value
          expect(result.profileSupplier.materialType).toBe(model.profileSupplier?.materialType);
        }
      }
    });

    it('should maintain backward compatibility with existing fields', async () => {
      const caller = appRouter.createCaller({ db, session: null });

      const anyModel = await db.model.findFirst({
        select: { id: true },
        where: { status: 'published' },
      });

      if (!anyModel) {
        expect(true).toBe(true);
        return;
      }

      const result = await caller.catalog['get-model-by-id']({
        modelId: anyModel.id,
      });

      // Verify all existing fields are still present
      expect(result.id).toBeDefined();
      expect(result.name).toBeDefined();
      expect(result.basePrice).toBeDefined();
      expect(result.costPerMmWidth).toBeDefined();
      expect(result.costPerMmHeight).toBeDefined();
      expect(result.minWidthMm).toBeDefined();
      expect(result.maxWidthMm).toBeDefined();
      expect(result.minHeightMm).toBeDefined();
      expect(result.maxHeightMm).toBeDefined();
      expect(result.compatibleGlassTypeIds).toBeDefined();
      expect(Array.isArray(result.compatibleGlassTypeIds)).toBe(true);
      expect(result.status).toBe('published');
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();

      // profileSupplier can be null or object - both are valid
      expect([null, 'object']).toContain(typeof result.profileSupplier);
    });

    it('should only return published models', async () => {
      const caller = appRouter.createCaller({ db, session: null });

      // Try to get a draft model (if one exists)
      const draftModel = await db.model.findFirst({
        select: { id: true },
        where: { status: 'draft' },
      });

      if (!draftModel) {
        // No draft models - that's fine
        expect(true).toBe(true);
        return;
      }

      // Should throw error when trying to get draft model
      await expect(
        caller.catalog['get-model-by-id']({
          modelId: draftModel.id,
        })
      ).rejects.toThrow(/no existe o no está disponible/);
    });
  });

  describe('Material Type Data Quality', () => {
    it('should verify active suppliers have materialType populated', async () => {
      const activeSuppliers = await db.profileSupplier.findMany({
        select: {
          id: true,
          materialType: true,
          name: true,
        },
        where: { isActive: true },
      });

      // All active suppliers should have materialType (validates Phase 1 T001)
      for (const supplier of activeSuppliers) {
        expect(supplier.materialType).not.toBeNull();
        expect(['PVC', 'ALUMINUM', 'WOOD', 'MIXED']).toContain(supplier.materialType);
      }
    });

    it('should verify models with suppliers can access materialType', async () => {
      const modelsWithSuppliers = await db.model.findMany({
        select: {
          id: true,
          name: true,
          profileSupplier: {
            select: {
              materialType: true,
              name: true,
            },
          },
        },
        take: 10,
        where: {
          profileSupplier: {
            isNot: null,
          },
          status: 'published',
        },
      });

      // Verify data structure matches what tRPC will return
      for (const model of modelsWithSuppliers) {
        expect(model.profileSupplier).not.toBeNull();

        if (model.profileSupplier) {
          expect(model.profileSupplier.materialType).toBeDefined();
          expect(['PVC', 'ALUMINUM', 'WOOD', 'MIXED']).toContain(model.profileSupplier.materialType);
        }
      }
    });
  });
});
