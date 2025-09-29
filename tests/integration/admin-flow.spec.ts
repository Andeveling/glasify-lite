import { describe, expect, it } from 'vitest';
import { testServer } from '../integration-setup';

// Constants for testing
const VALID_CUID_REGEX = /^c[a-z0-9]{24}$/;
const TEST_BASE_PRICE = 45_000;
const UPDATED_BASE_PRICE = 48_000;
const MIN_DIMENSION_MM = 300;
const MAX_DIMENSION_MM = 3000;
const ACCESSORY_PRICE = 5000;
const CONSTRAINT_MIN_WIDTH_MM = 400;
const CONSTRAINT_MAX_WIDTH_MM = 2500;
const CONSTRAINT_MIN_HEIGHT_MM = 300;
const CONSTRAINT_MAX_HEIGHT_MM = 2000;
const BULK_PRICE_INCREMENT = 10_000;
const BASE_COST_WIDTH = 10.0;
const BASE_COST_HEIGHT = 8.0;
const DIMENSION_DECREMENT_WIDTH = 100;
const DIMENSION_DECREMENT_HEIGHT = 50;
const ACCESSORY_BASE_PRICE = 3000;
const ACCESSORY_INCREMENT = 1000;
const UPDATE_PRICE_INCREMENT = 5000;
const UPDATE_ACCESSORY_PRICE = 4000;

describe('Integration: Admin Panel Access Flow', () => {
  it('should handle glass model creation and management through admin endpoint', async () => {
    // Test data for glass model creation (using actual admin endpoint schema)
    const glassModelData = {
      accessoryPrice: ACCESSORY_PRICE,
      basePrice: TEST_BASE_PRICE,
      compatibleGlassTypeIds: ['cm1glasstype1234567890abc'],
      costPerMmHeight: 10.0,
      costPerMmWidth: 12.5,
      manufacturerId: 'cm1manufacturer1234567890abc', // Using existing test manufacturer
      maxHeightMm: MAX_DIMENSION_MM,
      maxWidthMm: MAX_DIMENSION_MM,
      minHeightMm: MIN_DIMENSION_MM,
      minWidthMm: MIN_DIMENSION_MM,
      name: 'Elite 6mm Transparente Test',
      status: 'published' as const,
    };

    // Act 1: Create glass model through admin endpoint
    const createResult = await testServer.admin['model-upsert'](glassModelData);

    // Assert 1: Model created successfully
    expect(createResult).toBeDefined();
    expect(createResult).toHaveProperty('message');
    expect(createResult).toHaveProperty('modelId');
    expect(createResult).toHaveProperty('status', 'published');
    expect(createResult.modelId).toMatch(VALID_CUID_REGEX);
    expect(createResult.message).toContain('creado exitosamente');

    // Act 2: Update the created model
    const updateData = {
      ...glassModelData,
      basePrice: UPDATED_BASE_PRICE,
      id: createResult.modelId,
      name: 'Elite 6mm Transparente ACTUALIZADO',
    };

    const updateResult = await testServer.admin['model-upsert'](updateData);

    // Assert 2: Model updated successfully
    expect(updateResult).toBeDefined();
    expect(updateResult.modelId).toBe(createResult.modelId);
    expect(updateResult.message).toContain('actualizado exitosamente');
    expect(updateResult.status).toBe('published');

    // Act 3: Verify model appears in catalog
    const catalogModels = await testServer.catalog['list-models']({
      manufacturerId: glassModelData.manufacturerId,
    });

    // Assert 3: Model available in public catalog with updated data
    expect(catalogModels).toBeDefined();
    expect(Array.isArray(catalogModels)).toBe(true);

    const createdModel = catalogModels.find((model) => model.id === createResult.modelId);
    expect(createdModel).toBeDefined();

    if (createdModel) {
      expect(createdModel.name).toBe('Elite 6mm Transparente ACTUALIZADO');
      expect(createdModel.basePrice).toBe(UPDATED_BASE_PRICE);
      expect(createdModel.status).toBe('published');
    }
  });

  it('should validate admin model operations with dimension constraints', async () => {
    // Test model creation with specific dimension constraints
    const modelData = {
      accessoryPrice: null,
      basePrice: TEST_BASE_PRICE,
      compatibleGlassTypeIds: ['cm1glasstype1234567890abc'],
      costPerMmHeight: 12.0,
      costPerMmWidth: 15.0,
      manufacturerId: 'cm1manufacturer1234567890abc',
      maxHeightMm: CONSTRAINT_MAX_HEIGHT_MM,
      maxWidthMm: CONSTRAINT_MAX_WIDTH_MM,
      minHeightMm: CONSTRAINT_MIN_HEIGHT_MM,
      minWidthMm: CONSTRAINT_MIN_WIDTH_MM,
      name: 'Constraint Test Model',
      status: 'draft' as const,
    };

    // Act: Create model with constraints
    const result = await testServer.admin['model-upsert'](modelData);

    // Assert: Model created with proper constraints
    expect(result).toBeDefined();
    expect(result.modelId).toMatch(VALID_CUID_REGEX);
    expect(result.status).toBe('draft');
    expect(result.message).toContain('creado exitosamente');

    // Verify model appears in catalog (even draft models should be testable)
    const catalogModels = await testServer.catalog['list-models']({
      manufacturerId: modelData.manufacturerId,
    });

    const constraintModel = catalogModels.find((model) => model.id === result.modelId);
    expect(constraintModel).toBeDefined();

    if (constraintModel) {
      expect(constraintModel.minWidthMm).toBe(CONSTRAINT_MIN_WIDTH_MM);
      expect(constraintModel.maxWidthMm).toBe(CONSTRAINT_MAX_WIDTH_MM);
      expect(constraintModel.minHeightMm).toBe(CONSTRAINT_MIN_HEIGHT_MM);
      expect(constraintModel.maxHeightMm).toBe(CONSTRAINT_MAX_HEIGHT_MM);
      expect(constraintModel.accessoryPrice).toBeNull();
    }
  });

  it('should handle admin bulk model operations and data consistency', async () => {
    // This test validates admin panel operations that affect
    // multiple models and maintain data consistency

    const manufacturerId = 'cm1manufacturer1234567890abc';
    const modelCount = 3;
    const modelIds: string[] = [];

    // Create multiple models
    for (let i = 0; i < modelCount; i++) {
      const modelData = {
        accessoryPrice: i === 0 ? null : ACCESSORY_BASE_PRICE + i * ACCESSORY_INCREMENT,
        basePrice: TEST_BASE_PRICE + i * BULK_PRICE_INCREMENT,
        compatibleGlassTypeIds: ['cm1glasstype1234567890abc'],
        costPerMmHeight: BASE_COST_HEIGHT + i,
        costPerMmWidth: BASE_COST_WIDTH + i,
        manufacturerId,
        maxHeightMm: MAX_DIMENSION_MM - i * DIMENSION_DECREMENT_HEIGHT,
        maxWidthMm: MAX_DIMENSION_MM - i * DIMENSION_DECREMENT_WIDTH,
        minHeightMm: MIN_DIMENSION_MM,
        minWidthMm: MIN_DIMENSION_MM,
        name: `Bulk Admin Model ${i + 1}`,
        status: i % 2 === 0 ? ('published' as const) : ('draft' as const),
      };

      const result = await testServer.admin['model-upsert'](modelData);
      modelIds.push(result.modelId);

      // Assert each model created successfully
      expect(result.modelId).toMatch(VALID_CUID_REGEX);
      expect(result.message).toContain('creado exitosamente');
    }

    // Verify all models exist in catalog
    const catalogModels = await testServer.catalog['list-models']({
      manufacturerId,
    });

    // Assert all created models are in catalog
    for (const modelId of modelIds) {
      const catalogModel = catalogModels.find((model) => model.id === modelId);
      expect(catalogModel).toBeDefined();

      if (catalogModel) {
        expect(catalogModel.basePrice).toBeGreaterThan(0);
        expect(['published', 'draft']).toContain(catalogModel.status);
      }
    }

    // Test bulk update operation (update all created models)
    for (let i = 0; i < modelIds.length; i++) {
      const updatedData = {
        accessoryPrice: UPDATE_ACCESSORY_PRICE,
        basePrice: UPDATED_BASE_PRICE + i * UPDATE_PRICE_INCREMENT,
        compatibleGlassTypeIds: ['cm1glasstype1234567890abc'],
        costPerMmHeight: 10.0,
        costPerMmWidth: 12.0,
        id: modelIds[i],
        manufacturerId,
        maxHeightMm: MAX_DIMENSION_MM,
        maxWidthMm: MAX_DIMENSION_MM,
        minHeightMm: MIN_DIMENSION_MM,
        minWidthMm: MIN_DIMENSION_MM,
        name: `Updated Bulk Model ${i + 1}`,
        status: 'published' as const,
      };

      const updateResult = await testServer.admin['model-upsert'](updatedData);

      // Assert update successful
      expect(updateResult.modelId).toBe(modelIds[i]);
      expect(updateResult.message).toContain('actualizado exitosamente');
      expect(updateResult.status).toBe('published');
    }
  });

  it('should validate admin authorization and error handling', async () => {
    // This test validates that admin operations handle errors properly
    // and maintain data integrity during edge cases

    const testCases = [
      {
        data: {
          basePrice: TEST_BASE_PRICE,
          compatibleGlassTypeIds: ['cm1glasstype1234567890abc'],
          costPerMmHeight: 8.0,
          costPerMmWidth: 10.0,
          manufacturerId: 'invalid-manufacturer-id',
          maxHeightMm: MAX_DIMENSION_MM,
          maxWidthMm: MAX_DIMENSION_MM,
          minHeightMm: MIN_DIMENSION_MM,
          minWidthMm: MIN_DIMENSION_MM,
          name: 'Invalid Manufacturer Model',
          status: 'published' as const,
        },
        name: 'invalid manufacturer ID',
        shouldFail: true,
      },
      {
        data: {
          basePrice: TEST_BASE_PRICE,
          compatibleGlassTypeIds: ['invalid-glass-type-id'],
          costPerMmHeight: 8.0,
          costPerMmWidth: 10.0,
          manufacturerId: 'cm1manufacturer1234567890abc',
          maxHeightMm: MAX_DIMENSION_MM,
          maxWidthMm: MAX_DIMENSION_MM,
          minHeightMm: MIN_DIMENSION_MM,
          minWidthMm: MIN_DIMENSION_MM,
          name: 'Invalid Glass Type Model',
          status: 'published' as const,
        },
        name: 'invalid glass type ID',
        shouldFail: true,
      },
      {
        data: {
          basePrice: TEST_BASE_PRICE,
          compatibleGlassTypeIds: ['cm1glasstype1234567890abc'],
          costPerMmHeight: 8.0,
          costPerMmWidth: 10.0,
          manufacturerId: 'cm1manufacturer1234567890abc',
          maxHeightMm: MAX_DIMENSION_MM,
          maxWidthMm: 1000,
          minHeightMm: MIN_DIMENSION_MM,
          minWidthMm: 2000, // Min greater than max
          name: 'Invalid Dimensions Model',
          status: 'published' as const,
        },
        name: 'invalid dimensions (min >= max)',
        shouldFail: true,
      },
    ];

    for (const testCase of testCases) {
      let operationResult: unknown;
      let operationError: unknown;

      try {
        operationResult = await testServer.admin['model-upsert'](testCase.data);
      } catch (error) {
        operationError = error;
      }

      if (testCase.shouldFail) {
        // Should have failed with proper error
        expect(operationError).toBeDefined();
        expect(operationResult).toBeUndefined();
      } else {
        // Should have succeeded
        expect(operationResult).toBeDefined();
        expect(operationError).toBeUndefined();
        if (operationResult && typeof operationResult === 'object' && 'modelId' in operationResult) {
          expect((operationResult as { modelId: string }).modelId).toMatch(VALID_CUID_REGEX);
        }
      }
    }
  });
});
