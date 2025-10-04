import { describe, expect, it } from 'vitest';
import { testServer } from '../integration-setup';

/**
 * Contract Test: catalog.list-manufacturers
 * Issue: #002-ui-ux-requirements
 *
 * Given that we need to display manufacturer filter options
 * When I request manufacturers list
 * Then the server should return all manufacturers sorted by name
 */

describe('Contract: catalog.list-manufacturers - Issue002', () => {
  it('Should_ReturnManufacturersList_When_Called_Issue002', async () => {
    // Act
    const result = await testServer.catalog['list-manufacturers']();

    // Assert
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);

    // Each manufacturer should have required fields
    for (const manufacturer of result) {
      expect(manufacturer).toHaveProperty('id');
      expect(manufacturer).toHaveProperty('name');
      expect(typeof manufacturer.id).toBe('string');
      expect(typeof manufacturer.name).toBe('string');
      expect(manufacturer.id.length).toBeGreaterThan(0);
      expect(manufacturer.name.length).toBeGreaterThan(0);
    }
  });

  it('Should_ReturnManufacturersSortedByName_When_Called_Issue002', async () => {
    // Act
    const result = await testServer.catalog['list-manufacturers']();

    // Assert
    if (result.length > 1) {
      // Verify ascending order by name
      for (let i = 0; i < result.length - 1; i++) {
        const current = result[i];
        const next = result[i + 1];
        if (current && next) {
          expect(current.name.localeCompare(next.name)).toBeLessThanOrEqual(0);
        }
      }
    }
  });
});
