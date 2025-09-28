import { describe, expect, it } from 'vitest';
import { testServer } from '../integration-setup';

// Regex constants for performance optimization
const STATUS_REGEX = /^(draft|published)$/;
const MANUFACTURER_ERROR_REGEX = /ID del fabricante debe ser válido/;

// Type for the model summary output
type ModelSummaryType = {
  id: string;
  name: string;
  status: 'draft' | 'published';
  minWidthMm: number;
  maxWidthMm: number;
  minHeightMm: number;
  maxHeightMm: number;
  basePrice: number;
  costPerMmWidth: number;
  costPerMmHeight: number;
  accessoryPrice: number | null;
  compatibleGlassTypeIds: string[];
  createdAt: Date;
  updatedAt: Date;
};

describe('Contract: catalog.list-models', () => {
  it('should list published models for a valid manufacturer', async () => {
    // Arrange: Input schema validation
    const validInput = {
      manufacturerId: 'cm1abc123def456ghi789jkl0', // Valid CUID
    };

    // Act: Call the procedure
    const result = await testServer.catalog['list-models'](validInput);

    // Assert: Output schema validation
    expect(Array.isArray(result)).toBe(true);

    // Each model should have the expected structure
    for (const model of result) {
      expect(model).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        status: expect.stringMatching(STATUS_REGEX),
        minWidthMm: expect.any(Number),
        maxWidthMm: expect.any(Number),
        minHeightMm: expect.any(Number),
        maxHeightMm: expect.any(Number),
        basePrice: expect.any(Number),
        costPerMmWidth: expect.any(Number),
        costPerMmHeight: expect.any(Number),
        compatibleGlassTypeIds: expect.any(Array),
        createdAt: expect.any(Date),
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
      manufacturerId: 'invalid-id', // Not a valid CUID
    };

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.catalog['list-models'](invalidInput);
    }).rejects.toThrow(MANUFACTURER_ERROR_REGEX);
  });

  it('should return empty array for manufacturer with no published models', async () => {
    // Arrange: Manufacturer with no published models
    const input = {
      manufacturerId: 'cm1nonexistent123456789abc', // Non-existent manufacturer
    };

    // Act: Call the procedure
    const result = await testServer.catalog['list-models'](input);

    // Assert: Should return empty array
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it('should only return published models, not drafts', async () => {
    // Arrange: Input for manufacturer that might have draft models
    const input = {
      manufacturerId: 'cm1abc123def456ghi789jkl0',
    };

    // Act: Call the procedure
    const result = await testServer.catalog['list-models'](input);

    // Assert: All returned models should be published
    for (const model of result) {
      expect(model.status).toBe('published');
    }
  });
});
