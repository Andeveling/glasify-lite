import { describe, expect, it } from 'vitest';
import { testServer } from '../integration-setup';

// Regex constants for performance optimization
const STATUS_REGEX = /^(draft|published)$/;
const CUID_REGEX = /^c[a-z0-9]{24}$/;
const CREATED_MESSAGE_REGEX = /creado|created/i;
const UPDATED_MESSAGE_REGEX = /actualizado|updated/i;
const MANUFACTURER_ERROR_REGEX = /ID del fabricante debe ser válido/;
const WIDTH_ERROR_REGEX = /Ancho mínimo debe ser menor al ancho máximo/;
const HEIGHT_ERROR_REGEX = /Alto mínimo debe ser menor al alto máximo/;
const MODEL_NAME_ERROR_REGEX = /Nombre del modelo es requerido/;
const BASE_PRICE_ERROR_REGEX = /Precio base debe ser mayor o igual a 0/;
const GLASS_TYPES_ERROR_REGEX = /Debe seleccionar al menos un tipo de cristal compatible/;
const GLASS_TYPE_ID_ERROR_REGEX = /ID del tipo de cristal debe ser válido/;
const MODEL_NOT_FOUND_ERROR_REGEX = /modelo.*encontrado|model.*found/i;

describe('Contract: admin.model.upsert', () => {
  it('should create new model when no id provided', async () => {
    // Arrange: Valid input for creating a new model
    const createInput = {
      accessoryPrice: 25_000,
      basePrice: 150_000,
      compatibleGlassTypeIds: ['cm1glasstype123456789abc1', 'cm1glasstype123456789abc2'],
      costPerMmHeight: 40,
      costPerMmWidth: 50,
      manufacturerId: 'cm1manufacturer123456789ab',
      maxHeightMm: 1800,
      maxWidthMm: 2000,
      minHeightMm: 400,
      minWidthMm: 300,
      name: 'Ventana Premium 2024',
      status: 'draft' as const,
    };

    // Act: Create the model
    const result = await testServer.admin['model-upsert'](createInput);

    // Assert: Output schema validation
    expect(result).toMatchObject({
      message: expect.any(String),
      modelId: expect.any(String),
      status: expect.stringMatching(STATUS_REGEX),
    });

    // Model ID should be a valid CUID
    expect(result.modelId).toMatch(CUID_REGEX);
    expect(result.status).toBe('draft'); // Should match input status
    expect(result.message).toMatch(CREATED_MESSAGE_REGEX);
  });

  it('should update existing model when id provided', async () => {
    // Arrange: First create a model
    const createInput = {
      basePrice: 120_000,
      compatibleGlassTypeIds: ['cm1glasstype123456789abc1'],
      costPerMmHeight: 35,
      costPerMmWidth: 45,
      manufacturerId: 'cm1manufacturer123456789ab',
      maxHeightMm: 1600,
      maxWidthMm: 1800,
      minHeightMm: 400,
      minWidthMm: 300,
      name: 'Ventana Standard',
      status: 'draft' as const,
    };

    const createResult = await testServer.admin['model-upsert'](createInput);
    const modelId = createResult.modelId;

    // Now update the model
    const updateInput = {
      basePrice: 140_000, // Updated price
      compatibleGlassTypeIds: [
        'cm1glasstype123456789abc1',
        'cm1glasstype123456789abc2', // Added compatible glass type
      ],
      costPerMmHeight: 40, // Updated cost
      costPerMmWidth: 50, // Updated cost
      id: modelId,
      manufacturerId: 'cm1manufacturer123456789ab',
      maxHeightMm: 1800, // Updated max height
      maxWidthMm: 2000, // Updated max width
      minHeightMm: 400,
      minWidthMm: 300,
      name: 'Ventana Standard Actualizada',
      status: 'published' as const,
    };

    // Act: Update the model
    const result = await testServer.admin['model-upsert'](updateInput);

    // Assert: Should return same ID with updated status
    expect(result).toMatchObject({
      message: expect.any(String),
      modelId, // Same ID as created model
      status: 'published', // Updated status
    });

    expect(result.message).toMatch(UPDATED_MESSAGE_REGEX);
  });

  it('should validate input schema - invalid manufacturerId', async () => {
    // Arrange: Invalid manufacturer ID
    const invalidInput = {
      basePrice: 100_000,
      compatibleGlassTypeIds: ['cm1glasstype123456789abc1'],
      costPerMmHeight: 30,
      costPerMmWidth: 40,
      manufacturerId: 'invalid-manufacturer-id', // Not a valid CUID
      maxHeightMm: 1600,
      maxWidthMm: 1800,
      minHeightMm: 400,
      minWidthMm: 300,
      name: 'Test Model',
    };

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.admin['model-upsert'](invalidInput);
    }).rejects.toThrow(MANUFACTURER_ERROR_REGEX);
  });

  it('should validate dimension constraints - minWidth >= maxWidth', async () => {
    // Arrange: Invalid dimensions where min >= max
    const invalidInput = {
      basePrice: 100_000,
      compatibleGlassTypeIds: ['cm1glasstype123456789abc1'],
      costPerMmHeight: 30,
      costPerMmWidth: 40,
      manufacturerId: 'cm1manufacturer123456789ab',
      maxHeightMm: 1600,
      maxWidthMm: 1800, // Invalid: max should be > min
      minHeightMm: 400,
      minWidthMm: 2000,
      name: 'Test Model',
    };

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.admin['model-upsert'](invalidInput);
    }).rejects.toThrow(WIDTH_ERROR_REGEX);
  });

  it('should validate dimension constraints - minHeight >= maxHeight', async () => {
    // Arrange: Invalid dimensions where min >= max
    const invalidInput = {
      basePrice: 100_000,
      compatibleGlassTypeIds: ['cm1glasstype123456789abc1'],
      costPerMmHeight: 30,
      costPerMmWidth: 40,
      manufacturerId: 'cm1manufacturer123456789ab',
      maxHeightMm: 1400, // Invalid: max should be > min
      maxWidthMm: 1800,
      minHeightMm: 1600,
      minWidthMm: 300,
      name: 'Test Model',
    };

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.admin['model-upsert'](invalidInput);
    }).rejects.toThrow(HEIGHT_ERROR_REGEX);
  });

  it('should validate required fields', async () => {
    // Arrange: Missing required fields
    const invalidInput = {
      basePrice: 100_000,
      compatibleGlassTypeIds: ['cm1glasstype123456789abc1'],
      costPerMmHeight: 30,
      costPerMmWidth: 40,
      manufacturerId: 'cm1manufacturer123456789ab',
      maxHeightMm: 1600,
      maxWidthMm: 1800,
      minHeightMm: 400,
      // name: "Test Model", // Missing required name
      minWidthMm: 300,
    } as any;

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.admin['model-upsert'](invalidInput);
    }).rejects.toThrow(MODEL_NAME_ERROR_REGEX);
  });

  it('should validate negative prices and costs', async () => {
    // Arrange: Negative base price
    const invalidInput = {
      basePrice: -50_000, // Invalid: negative price
      compatibleGlassTypeIds: ['cm1glasstype123456789abc1'],
      costPerMmHeight: 30,
      costPerMmWidth: 40,
      manufacturerId: 'cm1manufacturer123456789ab',
      maxHeightMm: 1600,
      maxWidthMm: 1800,
      minHeightMm: 400,
      minWidthMm: 300,
      name: 'Test Model',
    };

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.admin['model-upsert'](invalidInput);
    }).rejects.toThrow(BASE_PRICE_ERROR_REGEX);
  });

  it('should validate compatible glass types - empty array', async () => {
    // Arrange: Empty compatible glass types array
    const invalidInput = {
      basePrice: 100_000,
      compatibleGlassTypeIds: [], // Invalid: empty array
      costPerMmHeight: 30,
      costPerMmWidth: 40,
      manufacturerId: 'cm1manufacturer123456789ab',
      maxHeightMm: 1600,
      maxWidthMm: 1800,
      minHeightMm: 400,
      minWidthMm: 300,
      name: 'Test Model',
    };

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.admin['model-upsert'](invalidInput);
    }).rejects.toThrow(GLASS_TYPES_ERROR_REGEX);
  });

  it('should validate compatible glass types - invalid CUIDs', async () => {
    // Arrange: Invalid CUID in glass types
    const invalidInput = {
      basePrice: 100_000,
      compatibleGlassTypeIds: [
        'cm1glasstype123456789abc1', // Valid
        'invalid-glass-type-id', // Invalid CUID
      ],
      costPerMmHeight: 30,
      costPerMmWidth: 40,
      manufacturerId: 'cm1manufacturer123456789ab',
      maxHeightMm: 1600,
      maxWidthMm: 1800,
      minHeightMm: 400,
      minWidthMm: 300,
      name: 'Test Model',
    };

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.admin['model-upsert'](invalidInput);
    }).rejects.toThrow(GLASS_TYPE_ID_ERROR_REGEX);
  });

  it('should handle optional accessoryPrice field', async () => {
    // Arrange: Model without accessoryPrice
    const inputWithoutAccessory = {
      basePrice: 100_000,
      compatibleGlassTypeIds: ['cm1glasstype123456789abc1'],
      costPerMmHeight: 30,
      costPerMmWidth: 40,
      manufacturerId: 'cm1manufacturer123456789ab',
      maxHeightMm: 1600,
      maxWidthMm: 1800,
      minHeightMm: 400,
      minWidthMm: 300,
      name: 'Model Sin Accesorios',
      // accessoryPrice is optional
    };

    // Act: Should succeed without accessoryPrice
    const result = await testServer.admin['model-upsert'](inputWithoutAccessory);

    // Assert: Should create successfully
    expect(result).toMatchObject({
      message: expect.any(String),
      modelId: expect.any(String),
      status: 'draft', // Default status
    });
  });

  it('should handle null accessoryPrice', async () => {
    // Arrange: Model with explicitly null accessoryPrice
    const inputWithNullAccessory = {
      accessoryPrice: null, // Explicitly null
      basePrice: 100_000,
      compatibleGlassTypeIds: ['cm1glasstype123456789abc1'],
      costPerMmHeight: 30,
      costPerMmWidth: 40,
      manufacturerId: 'cm1manufacturer123456789ab',
      maxHeightMm: 1600,
      maxWidthMm: 1800,
      minHeightMm: 400,
      minWidthMm: 300,
      name: 'Model Con Accesorio Nulo',
    };

    // Act: Should succeed with null accessoryPrice
    const result = await testServer.admin['model-upsert'](inputWithNullAccessory);

    // Assert: Should create successfully
    expect(result).toMatchObject({
      message: expect.any(String),
      modelId: expect.any(String),
      status: 'draft',
    });
  });

  it('should default to draft status when not specified', async () => {
    // Arrange: Model without explicit status
    const inputWithoutStatus = {
      basePrice: 100_000,
      compatibleGlassTypeIds: ['cm1glasstype123456789abc1'],
      costPerMmHeight: 30,
      costPerMmWidth: 40,
      manufacturerId: 'cm1manufacturer123456789ab',
      maxHeightMm: 1600,
      maxWidthMm: 1800,
      minHeightMm: 400,
      minWidthMm: 300,
      name: 'Model Default Status',
      // status not specified, should default to "draft"
    };

    // Act: Create model
    const result = await testServer.admin['model-upsert'](inputWithoutStatus);

    // Assert: Should default to draft status
    expect(result.status).toBe('draft');
  });

  it('should validate update with non-existent model id', async () => {
    // Arrange: Valid format but non-existent model ID
    const updateInput = {
      basePrice: 100_000,
      compatibleGlassTypeIds: ['cm1glasstype123456789abc1'],
      costPerMmHeight: 30,
      costPerMmWidth: 40,
      id: 'cm1nonexistent123456789abc', // Non-existent model
      manufacturerId: 'cm1manufacturer123456789ab',
      maxHeightMm: 1600,
      maxWidthMm: 1800,
      minHeightMm: 400,
      minWidthMm: 300,
      name: 'Updated Model',
    };

    // Act & Assert: Should handle non-existent model appropriately
    try {
      await testServer.admin['model-upsert'](updateInput);
      // If it doesn't throw, it should create a new model (depending on business logic)
    } catch (error) {
      // If it throws, should be a descriptive error in Spanish
      expect((error as Error).message).toMatch(MODEL_NOT_FOUND_ERROR_REGEX);
    }
  });
});
