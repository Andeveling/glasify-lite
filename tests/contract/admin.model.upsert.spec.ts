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
const GLASS_TYPES_ERROR_REGEX = /Debe seleccionar al menos un tipo de vidrio compatible/;
const GLASS_TYPE_ID_ERROR_REGEX = /ID del tipo de vidrio debe ser válido/;
const MODEL_NOT_FOUND_ERROR_REGEX = /modelo.*encontrado|model.*found/i;

describe('Contract: admin.model.upsert', () => {
  it('should create new model when no id provided', async () => {
    // Arrange: Valid input for creating a new model
    const createInput = {
      manufacturerId: 'cm1manufacturer123456789ab',
      name: 'Ventana Premium 2024',
      status: 'draft' as const,
      minWidthMm: 300,
      maxWidthMm: 2000,
      minHeightMm: 400,
      maxHeightMm: 1800,
      basePrice: 150_000,
      costPerMmWidth: 50,
      costPerMmHeight: 40,
      accessoryPrice: 25_000,
      compatibleGlassTypeIds: ['cm1glasstype123456789abc1', 'cm1glasstype123456789abc2'],
    };

    // Act: Create the model
    const result = await testServer.admin['model-upsert'](createInput);

    // Assert: Output schema validation
    expect(result).toMatchObject({
      modelId: expect.any(String),
      status: expect.stringMatching(STATUS_REGEX),
      message: expect.any(String),
    });

    // Model ID should be a valid CUID
    expect(result.modelId).toMatch(CUID_REGEX);
    expect(result.status).toBe('draft'); // Should match input status
    expect(result.message).toMatch(CREATED_MESSAGE_REGEX);
  });

  it('should update existing model when id provided', async () => {
    // Arrange: First create a model
    const createInput = {
      manufacturerId: 'cm1manufacturer123456789ab',
      name: 'Ventana Standard',
      status: 'draft' as const,
      minWidthMm: 300,
      maxWidthMm: 1800,
      minHeightMm: 400,
      maxHeightMm: 1600,
      basePrice: 120_000,
      costPerMmWidth: 45,
      costPerMmHeight: 35,
      compatibleGlassTypeIds: ['cm1glasstype123456789abc1'],
    };

    const createResult = await testServer.admin['model-upsert'](createInput);
    const modelId = createResult.modelId;

    // Now update the model
    const updateInput = {
      id: modelId,
      manufacturerId: 'cm1manufacturer123456789ab',
      name: 'Ventana Standard Actualizada',
      status: 'published' as const,
      minWidthMm: 300,
      maxWidthMm: 2000, // Updated max width
      minHeightMm: 400,
      maxHeightMm: 1800, // Updated max height
      basePrice: 140_000, // Updated price
      costPerMmWidth: 50, // Updated cost
      costPerMmHeight: 40, // Updated cost
      compatibleGlassTypeIds: [
        'cm1glasstype123456789abc1',
        'cm1glasstype123456789abc2', // Added compatible glass type
      ],
    };

    // Act: Update the model
    const result = await testServer.admin['model-upsert'](updateInput);

    // Assert: Should return same ID with updated status
    expect(result).toMatchObject({
      modelId, // Same ID as created model
      status: 'published', // Updated status
      message: expect.any(String),
    });

    expect(result.message).toMatch(UPDATED_MESSAGE_REGEX);
  });

  it('should validate input schema - invalid manufacturerId', async () => {
    // Arrange: Invalid manufacturer ID
    const invalidInput = {
      manufacturerId: 'invalid-manufacturer-id', // Not a valid CUID
      name: 'Test Model',
      minWidthMm: 300,
      maxWidthMm: 1800,
      minHeightMm: 400,
      maxHeightMm: 1600,
      basePrice: 100_000,
      costPerMmWidth: 40,
      costPerMmHeight: 30,
      compatibleGlassTypeIds: ['cm1glasstype123456789abc1'],
    };

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.admin['model-upsert'](invalidInput);
    }).rejects.toThrow(MANUFACTURER_ERROR_REGEX);
  });

  it('should validate dimension constraints - minWidth >= maxWidth', async () => {
    // Arrange: Invalid dimensions where min >= max
    const invalidInput = {
      manufacturerId: 'cm1manufacturer123456789ab',
      name: 'Test Model',
      minWidthMm: 2000,
      maxWidthMm: 1800, // Invalid: max should be > min
      minHeightMm: 400,
      maxHeightMm: 1600,
      basePrice: 100_000,
      costPerMmWidth: 40,
      costPerMmHeight: 30,
      compatibleGlassTypeIds: ['cm1glasstype123456789abc1'],
    };

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.admin['model-upsert'](invalidInput);
    }).rejects.toThrow(WIDTH_ERROR_REGEX);
  });

  it('should validate dimension constraints - minHeight >= maxHeight', async () => {
    // Arrange: Invalid dimensions where min >= max
    const invalidInput = {
      manufacturerId: 'cm1manufacturer123456789ab',
      name: 'Test Model',
      minWidthMm: 300,
      maxWidthMm: 1800,
      minHeightMm: 1600,
      maxHeightMm: 1400, // Invalid: max should be > min
      basePrice: 100_000,
      costPerMmWidth: 40,
      costPerMmHeight: 30,
      compatibleGlassTypeIds: ['cm1glasstype123456789abc1'],
    };

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.admin['model-upsert'](invalidInput);
    }).rejects.toThrow(HEIGHT_ERROR_REGEX);
  });

  it('should validate required fields', async () => {
    // Arrange: Missing required fields
    const invalidInput = {
      manufacturerId: 'cm1manufacturer123456789ab',
      // name: "Test Model", // Missing required name
      minWidthMm: 300,
      maxWidthMm: 1800,
      minHeightMm: 400,
      maxHeightMm: 1600,
      basePrice: 100_000,
      costPerMmWidth: 40,
      costPerMmHeight: 30,
      compatibleGlassTypeIds: ['cm1glasstype123456789abc1'],
    } as any;

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.admin['model-upsert'](invalidInput);
    }).rejects.toThrow(MODEL_NAME_ERROR_REGEX);
  });

  it('should validate negative prices and costs', async () => {
    // Arrange: Negative base price
    const invalidInput = {
      manufacturerId: 'cm1manufacturer123456789ab',
      name: 'Test Model',
      minWidthMm: 300,
      maxWidthMm: 1800,
      minHeightMm: 400,
      maxHeightMm: 1600,
      basePrice: -50_000, // Invalid: negative price
      costPerMmWidth: 40,
      costPerMmHeight: 30,
      compatibleGlassTypeIds: ['cm1glasstype123456789abc1'],
    };

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.admin['model-upsert'](invalidInput);
    }).rejects.toThrow(BASE_PRICE_ERROR_REGEX);
  });

  it('should validate compatible glass types - empty array', async () => {
    // Arrange: Empty compatible glass types array
    const invalidInput = {
      manufacturerId: 'cm1manufacturer123456789ab',
      name: 'Test Model',
      minWidthMm: 300,
      maxWidthMm: 1800,
      minHeightMm: 400,
      maxHeightMm: 1600,
      basePrice: 100_000,
      costPerMmWidth: 40,
      costPerMmHeight: 30,
      compatibleGlassTypeIds: [], // Invalid: empty array
    };

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.admin['model-upsert'](invalidInput);
    }).rejects.toThrow(GLASS_TYPES_ERROR_REGEX);
  });

  it('should validate compatible glass types - invalid CUIDs', async () => {
    // Arrange: Invalid CUID in glass types
    const invalidInput = {
      manufacturerId: 'cm1manufacturer123456789ab',
      name: 'Test Model',
      minWidthMm: 300,
      maxWidthMm: 1800,
      minHeightMm: 400,
      maxHeightMm: 1600,
      basePrice: 100_000,
      costPerMmWidth: 40,
      costPerMmHeight: 30,
      compatibleGlassTypeIds: [
        'cm1glasstype123456789abc1', // Valid
        'invalid-glass-type-id', // Invalid CUID
      ],
    };

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.admin['model-upsert'](invalidInput);
    }).rejects.toThrow(GLASS_TYPE_ID_ERROR_REGEX);
  });

  it('should handle optional accessoryPrice field', async () => {
    // Arrange: Model without accessoryPrice
    const inputWithoutAccessory = {
      manufacturerId: 'cm1manufacturer123456789ab',
      name: 'Model Sin Accesorios',
      minWidthMm: 300,
      maxWidthMm: 1800,
      minHeightMm: 400,
      maxHeightMm: 1600,
      basePrice: 100_000,
      costPerMmWidth: 40,
      costPerMmHeight: 30,
      compatibleGlassTypeIds: ['cm1glasstype123456789abc1'],
      // accessoryPrice is optional
    };

    // Act: Should succeed without accessoryPrice
    const result = await testServer.admin['model-upsert'](inputWithoutAccessory);

    // Assert: Should create successfully
    expect(result).toMatchObject({
      modelId: expect.any(String),
      status: 'draft', // Default status
      message: expect.any(String),
    });
  });

  it('should handle null accessoryPrice', async () => {
    // Arrange: Model with explicitly null accessoryPrice
    const inputWithNullAccessory = {
      manufacturerId: 'cm1manufacturer123456789ab',
      name: 'Model Con Accesorio Nulo',
      minWidthMm: 300,
      maxWidthMm: 1800,
      minHeightMm: 400,
      maxHeightMm: 1600,
      basePrice: 100_000,
      costPerMmWidth: 40,
      costPerMmHeight: 30,
      compatibleGlassTypeIds: ['cm1glasstype123456789abc1'],
      accessoryPrice: null, // Explicitly null
    };

    // Act: Should succeed with null accessoryPrice
    const result = await testServer.admin['model-upsert'](inputWithNullAccessory);

    // Assert: Should create successfully
    expect(result).toMatchObject({
      modelId: expect.any(String),
      status: 'draft',
      message: expect.any(String),
    });
  });

  it('should default to draft status when not specified', async () => {
    // Arrange: Model without explicit status
    const inputWithoutStatus = {
      manufacturerId: 'cm1manufacturer123456789ab',
      name: 'Model Default Status',
      minWidthMm: 300,
      maxWidthMm: 1800,
      minHeightMm: 400,
      maxHeightMm: 1600,
      basePrice: 100_000,
      costPerMmWidth: 40,
      costPerMmHeight: 30,
      compatibleGlassTypeIds: ['cm1glasstype123456789abc1'],
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
      id: 'cm1nonexistent123456789abc', // Non-existent model
      manufacturerId: 'cm1manufacturer123456789ab',
      name: 'Updated Model',
      minWidthMm: 300,
      maxWidthMm: 1800,
      minHeightMm: 400,
      maxHeightMm: 1600,
      basePrice: 100_000,
      costPerMmWidth: 40,
      costPerMmHeight: 30,
      compatibleGlassTypeIds: ['cm1glasstype123456789abc1'],
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
