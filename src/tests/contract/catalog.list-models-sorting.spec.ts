import { describe, expect, it } from "vitest";
import { testServer } from "../integration-setup";

/**
 * Contract Test: catalog.list-models with sorting
 * Issue: #002-ui-ux-requirements
 *
 * Given that we need to sort models by name or price
 * When I request models with sort parameter
 * Then the server should return models in the specified order
 *
 * Acceptance Criteria from Issue002:
 * - AC-002: "When filtro por fabricante o tipo de modelo, Then los resultados se actualizan"
 * - Sort options: name-asc, name-desc, price-asc, price-desc
 * - Sorting must be processed server-side for consistency
 */

describe("Contract: catalog.list-models with sorting - Issue002", () => {
  it("Should_ReturnModelsSortedByName_When_SortNameAsc_Issue002", async () => {
    // Act
    const result = await testServer.catalog["list-models"]({
      sort: "name-asc",
    });

    // Assert
    expect(result.items).toBeDefined();
    expect(result.total).toBeGreaterThanOrEqual(0);

    if (result.items.length > 1) {
      // Verify ascending order by name
      for (let i = 0; i < result.items.length - 1; i++) {
        const current = result.items[i];
        const next = result.items[i + 1];
        if (current && next) {
          expect(current.name.localeCompare(next.name)).toBeLessThanOrEqual(0);
        }
      }
    }
  });

  it("Should_ReturnModelsSortedByName_When_SortNameDesc_Issue002", async () => {
    // Act
    const result = await testServer.catalog["list-models"]({
      sort: "name-desc",
    });

    // Assert
    expect(result.items).toBeDefined();
    expect(result.total).toBeGreaterThanOrEqual(0);

    if (result.items.length > 1) {
      // Verify descending order by name
      for (let i = 0; i < result.items.length - 1; i++) {
        const current = result.items[i];
        const next = result.items[i + 1];
        if (current && next) {
          expect(current.name.localeCompare(next.name)).toBeGreaterThanOrEqual(
            0
          );
        }
      }
    }
  });

  it("Should_ReturnModelsSortedByPrice_When_SortPriceAsc_Issue002", async () => {
    // Act
    const result = await testServer.catalog["list-models"]({
      sort: "price-asc",
    });

    // Assert
    expect(result.items).toBeDefined();
    expect(result.total).toBeGreaterThanOrEqual(0);

    if (result.items.length > 1) {
      // Verify ascending order by price
      for (let i = 0; i < result.items.length - 1; i++) {
        const current = result.items[i];
        const next = result.items[i + 1];
        if (current && next) {
          expect(current.basePrice).toBeLessThanOrEqual(next.basePrice);
        }
      }
    }
  });

  it("Should_ReturnModelsSortedByPrice_When_SortPriceDesc_Issue002", async () => {
    // Act
    const result = await testServer.catalog["list-models"]({
      sort: "price-desc",
    });

    // Assert
    expect(result.items).toBeDefined();
    expect(result.total).toBeGreaterThanOrEqual(0);

    if (result.items.length > 1) {
      // Verify descending order by price
      for (let i = 0; i < result.items.length - 1; i++) {
        const current = result.items[i];
        const next = result.items[i + 1];
        if (current && next) {
          expect(current.basePrice).toBeGreaterThanOrEqual(next.basePrice);
        }
      }
    }
  });

  it("Should_UseDefaultSort_When_NoSortProvided_Issue002", async () => {
    // Act
    const result = await testServer.catalog["list-models"]({});

    // Assert - default should be name-asc
    expect(result.items).toBeDefined();
    expect(result.total).toBeGreaterThanOrEqual(0);

    if (result.items.length > 1) {
      // Verify default ascending order by name
      for (let i = 0; i < result.items.length - 1; i++) {
        const current = result.items[i];
        const next = result.items[i + 1];
        if (current && next) {
          expect(current.name.localeCompare(next.name)).toBeLessThanOrEqual(0);
        }
      }
    }
  });

  it("Should_CombineSortWithFilters_When_BothProvided_Issue002", async () => {
    // Arrange - get a manufacturer to filter by
    const allModels = await testServer.catalog["list-models"]({});
    if (allModels.items.length === 0 || !allModels.items[0]?.manufacturer) {
      // Skip test if no models or no manufacturer
      return;
    }

    const manufacturerId = allModels.items[0].manufacturer.id;

    // Act
    const result = await testServer.catalog["list-models"]({
      manufacturerId,
      sort: "price-desc",
    });

    // Assert
    expect(result.items).toBeDefined();

    // All items should belong to the specified manufacturer
    for (const item of result.items) {
      expect(item.manufacturer?.id).toBe(manufacturerId);
    }

    // Items should be sorted by price descending
    if (result.items.length > 1) {
      for (let i = 0; i < result.items.length - 1; i++) {
        const current = result.items[i];
        const next = result.items[i + 1];
        if (current && next) {
          expect(current.basePrice).toBeGreaterThanOrEqual(next.basePrice);
        }
      }
    }
  });
});
