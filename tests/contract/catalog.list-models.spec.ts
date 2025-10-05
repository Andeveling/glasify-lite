import { describe, expect, it } from 'vitest';
import { testServer } from '../integration-setup';

// Regex constants for performance optimization
const STATUS_REGEX = /^(draft|published)$/;
const MANUFACTURER_ERROR_REGEX = /ID del fabricante debe ser válido/;

describe('Contract: catalog.list-models', () => {
  it('should list all published models when no manufacturer filter is provided', async () => {
    // Arrange: Input without manufacturerId
    const validInput = {
      limit: 20,
    };

    // Act: Call the procedure
    const result = await testServer.catalog['list-models'](validInput);

    // Assert: Output schema validation
    expect(result).toMatchObject({
      items: expect.any(Array),
      total: expect.any(Number),
    });

    // Each model should have the expected structure
    for (const model of result.items) {
      expect(model).toMatchObject({
        basePrice: expect.any(Number),
        compatibleGlassTypeIds: expect.any(Array),
        costPerMmHeight: expect.any(Number),
        costPerMmWidth: expect.any(Number),
        createdAt: expect.any(Date),
        id: expect.any(String),
        maxHeightMm: expect.any(Number),
        maxWidthMm: expect.any(Number),
        minHeightMm: expect.any(Number),
        minWidthMm: expect.any(Number),
        name: expect.any(String),
        status: expect.stringMatching(STATUS_REGEX),
        updatedAt: expect.any(Date),
      });

      // Validate dimension constraints
      expect(model.minWidthMm).toBeLessThan(model.maxWidthMm);
      expect(model.minHeightMm).toBeLessThan(model.maxHeightMm);
      expect(model.basePrice).toBeGreaterThanOrEqual(0);
      expect(model.costPerMmWidth).toBeGreaterThanOrEqual(0);
      expect(model.costPerMmHeight).toBeGreaterThanOrEqual(0);
    }
  });

  it('should list published models for a valid manufacturer', async () => {
    // Arrange: Input schema validation with optional manufacturerId
    const validInput = {
      limit: 20,
      manufacturerId: 'cm1abc123def456ghi789jkl0', // Valid CUID
    };

    // Act: Call the procedure
    const result = await testServer.catalog['list-models'](validInput);

    // Assert: Output schema validation
    expect(result).toMatchObject({
      items: expect.any(Array),
      total: expect.any(Number),
    });

    // Each model should have the expected structure
    for (const model of result.items) {
      expect(model).toMatchObject({
        basePrice: expect.any(Number),
        compatibleGlassTypeIds: expect.any(Array),
        costPerMmHeight: expect.any(Number),
        costPerMmWidth: expect.any(Number),
        createdAt: expect.any(Date),
        id: expect.any(String),
        maxHeightMm: expect.any(Number),
        maxWidthMm: expect.any(Number),
        minHeightMm: expect.any(Number),
        minWidthMm: expect.any(Number),
        name: expect.any(String),
        status: expect.stringMatching(STATUS_REGEX),
        updatedAt: expect.any(Date),
      });

      // Validate dimension constraints
      expect(model.minWidthMm).toBeLessThan(model.maxWidthMm);
      expect(model.minHeightMm).toBeLessThan(model.maxHeightMm);
      expect(model.basePrice).toBeGreaterThanOrEqual(0);
      expect(model.costPerMmWidth).toBeGreaterThanOrEqual(0);
      expect(model.costPerMmHeight).toBeGreaterThanOrEqual(0);
    }
  });

  it('should validate input schema - invalid manufacturerId', async () => {
    // Arrange: Invalid manufacturer ID
    const invalidInput = {
      limit: 20,
      manufacturerId: 'invalid-id', // Not a valid CUID
    };

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.catalog['list-models'](invalidInput);
    }).rejects.toThrow(MANUFACTURER_ERROR_REGEX);
  });

  it('should return empty items array for manufacturer with no published models', async () => {
    // Arrange: Manufacturer with no published models
    const input = {
      limit: 20,
      manufacturerId: 'cm1nonexistent123456789abc', // Non-existent manufacturer
    };

    // Act: Call the procedure
    const result = await testServer.catalog['list-models'](input);

    // Assert: Should return empty items array
    expect(result).toMatchObject({
      items: expect.any(Array),
      total: 0,
    });
    expect(result.items).toHaveLength(0);
  });

  it('should only return published models, not drafts', async () => {
    // Arrange: Input for manufacturer that might have draft models
    const input = {
      limit: 20,
      manufacturerId: 'cm1abc123def456ghi789jkl0',
    };

    // Act: Call the procedure
    const result = await testServer.catalog['list-models'](input);

    // Assert: All returned models should be published
    for (const model of result.items) {
      expect(model.status).toBe('published');
    }
  });
});
