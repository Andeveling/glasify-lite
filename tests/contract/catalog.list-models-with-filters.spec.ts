import { describe, expect, it } from 'vitest';
import { testServer } from '../integration-setup';

/**
 * Contract Test: catalog.list-models with server-side filters
 * Issue: #002-ui-ux-requirements
 *
 * Given that we need to filter models server-side for scalability
 * When I request models with filters (search, pagination)
 * Then the server should process filters and return paginated results
 *
 * Acceptance Criteria from Issue002:
 * - AC-002: "When filtro por fabricante o tipo de modelo, Then los resultados se actualizan"
 * - Should support up to 100 models in catalog (as per clarifications)
 * - Filters must be processed server-side, not client-side
 */

// Constants for test configuration
const DEFAULT_PAGE_SIZE = 2;
const TEST_PAGE_LIMIT = 5;

describe('Contract: catalog.list-models with server-side filters - Issue002', () => {
  it('Should_ReturnFilteredModels_When_SearchQueryProvided_Issue002', async () => {
    // Arrange
    const manufacturer = await testServer.catalog['get-default-manufacturer']();

    // Act
    const result = await testServer.catalog['list-models']({
      manufacturerId: manufacturer.id,
      search: 'Ventana',
    });

    // Assert
    expect(result).toBeDefined();
    expect(Array.isArray(result.items)).toBe(true);
    // All items should match search query
    for (const item of result.items as Array<{
      accessoryPrice: number | null;
      basePrice: number;
      compatibleGlassTypeIds: string[];
      costPerMmHeight: number;
      costPerMmWidth: number;
      createdAt: Date;
      id: string;
      maxHeightMm: number;
      maxWidthMm: number;
      minHeightMm: number;
      minWidthMm: number;
      name: string;
      status: string;
      updatedAt: Date;
    }>) {
      expect(item.name.toLowerCase()).toContain('ventana'.toLowerCase());
    }
  });

  it('Should_ReturnPaginatedResults_When_LimitAndPageProvided_Issue002', async () => {
    // Arrange
    const manufacturer = await testServer.catalog['get-default-manufacturer']();

    // Act - First page
    const firstPage = await testServer.catalog['list-models']({
      limit: DEFAULT_PAGE_SIZE,
      manufacturerId: manufacturer.id,
      page: 1,
    });

    // Assert - First page
    expect(firstPage.items).toBeDefined();
    expect(firstPage.items.length).toBeLessThanOrEqual(DEFAULT_PAGE_SIZE);

    // Only test pagination if there are more items than one page
    const totalPages = Math.ceil(firstPage.total / DEFAULT_PAGE_SIZE);
    if (totalPages > 1) {
      // Act - Second page
      const secondPage = await testServer.catalog['list-models']({
        limit: DEFAULT_PAGE_SIZE,
        manufacturerId: manufacturer.id,
        page: 2,
      });

      // Assert - Second page
      expect(secondPage.items).toBeDefined();
      // Should not repeat items from first page
      const firstPageIds = new Set(firstPage.items.map((item) => item.id));
      for (const item of secondPage.items) {
        expect(firstPageIds.has(item.id)).toBe(false);
      }
    } else {
      // If only one page, items should be less than page size or total should equal items
      expect(firstPage.items.length).toBe(firstPage.total);
    }
  });

  it('Should_ReturnOnlyPublishedModels_When_NoStatusFilterProvided_Issue002', async () => {
    // Arrange
    const manufacturer = await testServer.catalog['get-default-manufacturer']();

    // Act
    const result = await testServer.catalog['list-models']({
      manufacturerId: manufacturer.id,
    });

    // Assert - Only published models should be returned
    expect(result.items).toBeDefined();
    for (const item of result.items) {
      expect(item.status).toBe('published');
    }
  });

  it('Should_ReturnEmptyArray_When_NoModelsMatchFilter_Issue002', async () => {
    // Arrange
    const manufacturer = await testServer.catalog['get-default-manufacturer']();

    // Act
    const result = await testServer.catalog['list-models']({
      manufacturerId: manufacturer.id,
      search: 'NonExistentModelName12345XYZ',
    });

    // Assert
    expect(result.items).toBeDefined();
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('Should_ReturnTotalCount_When_RequestingModels_Issue002', async () => {
    // Arrange
    const manufacturer = await testServer.catalog['get-default-manufacturer']();

    // Act
    const result = await testServer.catalog['list-models']({
      limit: 1,
      manufacturerId: manufacturer.id,
    });

    // Assert
    expect(result.total).toBeDefined();
    expect(typeof result.total).toBe('number');
    expect(result.total).toBeGreaterThanOrEqual(0);
  });

  it('Should_HandleMultipleFilters_When_ProvidedTogether_Issue002', async () => {
    // Arrange
    const manufacturer = await testServer.catalog['get-default-manufacturer']();

    // Act
    const result = await testServer.catalog['list-models']({
      limit: TEST_PAGE_LIMIT,
      manufacturerId: manufacturer.id,
      search: 'Ventana',
    });

    // Assert
    expect(result.items).toBeDefined();
    expect(result.items.length).toBeLessThanOrEqual(TEST_PAGE_LIMIT);
    for (const item of result.items) {
      expect(item.name.toLowerCase()).toContain('ventana'.toLowerCase());
      expect(item.status).toBe('published');
    }
  });
});
