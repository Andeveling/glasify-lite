/**
 * Search Parameters Utilities Tests
 *
 * Unit tests for pure utility functions that build active search parameter badges.
 * These tests verify business logic in isolation from UI components.
 */

import { ArrowDownAZ, ArrowDownZA, Building2, Search, SortAsc, SortDesc } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import {
  buildActiveParameters,
  buildProfileSupplierParameter,
  buildSearchParameter,
  buildSortParameter,
  getSortConfiguration,
  isDefaultSort,
  SORT_CONFIGURATIONS,
} from '../../../app/(public)/catalog/_utils/search-parameters.utils';

describe('search-parameters.utils', () => {
  describe('getSortConfiguration', () => {
    it('should return configuration for valid sort type', () => {
      const config = getSortConfiguration('price-asc');

      expect(config).toEqual({
        icon: SortAsc,
        label: 'Precio ↑',
      });
    });

    it('should return configuration for all valid sort types', () => {
      expect(getSortConfiguration('name-asc')).toEqual({
        icon: ArrowDownAZ,
        label: 'A-Z',
      });

      expect(getSortConfiguration('name-desc')).toEqual({
        icon: ArrowDownZA,
        label: 'Z-A',
      });

      expect(getSortConfiguration('price-desc')).toEqual({
        icon: SortDesc,
        label: 'Precio ↓',
      });
    });

    it('should return undefined for null', () => {
      expect(getSortConfiguration(null)).toBeUndefined();
    });

    it('should return undefined for undefined', () => {
      expect(getSortConfiguration(undefined)).toBeUndefined();
    });

    it('should return undefined for invalid sort type', () => {
      expect(getSortConfiguration('invalid-sort')).toBeUndefined();
    });
  });

  describe('isDefaultSort', () => {
    it('should return true for name-asc (default)', () => {
      expect(isDefaultSort('name-asc')).toBe(true);
    });

    it('should return true for null', () => {
      expect(isDefaultSort(null)).toBe(true);
    });

    it('should return true for undefined', () => {
      expect(isDefaultSort(undefined)).toBe(true);
    });

    it('should return false for non-default sorts', () => {
      expect(isDefaultSort('name-desc')).toBe(false);
      expect(isDefaultSort('price-asc')).toBe(false);
      expect(isDefaultSort('price-desc')).toBe(false);
    });
  });

  describe('buildSearchParameter', () => {
    it('should build search parameter with correct properties', () => {
      const param = buildSearchParameter('vidrio templado');

      expect(param).toEqual({
        ariaLabel: 'Quitar búsqueda: vidrio templado',
        icon: Search,
        key: 'search',
        label: 'vidrio templado',
      });
    });

    it('should return undefined for empty string', () => {
      expect(buildSearchParameter('')).toBeUndefined();
    });

    it('should return undefined for null', () => {
      expect(buildSearchParameter(null)).toBeUndefined();
    });

    it('should return undefined for undefined', () => {
      expect(buildSearchParameter(undefined)).toBeUndefined();
    });

    it('should handle special characters in search query', () => {
      const param = buildSearchParameter('vidrio & cristal (6mm)');

      expect(param?.label).toBe('vidrio & cristal (6mm)');
      expect(param?.ariaLabel).toBe('Quitar búsqueda: vidrio & cristal (6mm)');
    });
  });

  describe('buildProfileSupplierParameter', () => {
    it('should build profile supplier parameter with correct properties', () => {
      const param = buildProfileSupplierParameter('Guardian');

      expect(param).toEqual({
        ariaLabel: 'Quitar filtro de Guardian',
        icon: Building2,
        key: 'profileSupplier',
        label: 'Guardian',
      });
    });

    it('should return undefined for empty string', () => {
      expect(buildProfileSupplierParameter('')).toBeUndefined();
    });

    it('should return undefined for null', () => {
      expect(buildProfileSupplierParameter(null)).toBeUndefined();
    });

    it('should return undefined for undefined', () => {
      expect(buildProfileSupplierParameter(undefined)).toBeUndefined();
    });

    it('should handle profile supplier names with accents', () => {
      const param = buildProfileSupplierParameter('Fabricación Española');

      expect(param?.label).toBe('Fabricación Española');
    });
  });

  describe('buildSortParameter', () => {
    it('should build sort parameter for non-default sort', () => {
      const param = buildSortParameter('price-desc');

      expect(param).toEqual({
        ariaLabel: 'Quitar ordenamiento: Precio ↓',
        icon: SortDesc,
        key: 'sort',
        label: 'Precio ↓',
      });
    });

    it('should return undefined for default sort (name-asc)', () => {
      expect(buildSortParameter('name-asc')).toBeUndefined();
    });

    it('should return undefined for null', () => {
      expect(buildSortParameter(null)).toBeUndefined();
    });

    it('should return undefined for undefined', () => {
      expect(buildSortParameter(undefined)).toBeUndefined();
    });

    it('should return undefined for invalid sort type', () => {
      expect(buildSortParameter('invalid-sort')).toBeUndefined();
    });

    it('should build parameter for all valid non-default sorts', () => {
      const nameDesc = buildSortParameter('name-desc');
      expect(nameDesc?.label).toBe('Z-A');
      expect(nameDesc?.icon).toBe(ArrowDownZA);

      const priceAsc = buildSortParameter('price-asc');
      expect(priceAsc?.label).toBe('Precio ↑');
      expect(priceAsc?.icon).toBe(SortAsc);
    });
  });

  describe('buildActiveParameters', () => {
    it('should return empty array when no parameters are active', () => {
      const params = buildActiveParameters({});

      expect(params).toEqual([]);
    });

    it('should build parameters for all active filters', () => {
      const params = buildActiveParameters({
        profileSupplierName: 'Guardian',
        searchQuery: 'vidrio',
        sortType: 'price-desc',
      });

      const expectedParameterCount = 3;
      expect(params).toHaveLength(expectedParameterCount);
      expect(params[ 0 ]?.key).toBe('search');
      expect(params[ 1 ]?.key).toBe('profileSupplier');
      expect(params[ 2 ]?.key).toBe('sort');
    });

    it('should build parameters for search query only', () => {
      const params = buildActiveParameters({
        searchQuery: 'vidrio templado',
      });

      expect(params).toHaveLength(1);
      expect(params[ 0 ]).toEqual({
        ariaLabel: 'Quitar búsqueda: vidrio templado',
        icon: Search,
        key: 'search',
        label: 'vidrio templado',
      });
    });

    it('should build parameters for profile supplier only', () => {
      const params = buildActiveParameters({
        profileSupplierName: 'VEKA',
      });

      expect(params).toHaveLength(1);
      expect(params[ 0 ]).toEqual({
        ariaLabel: 'Quitar filtro de VEKA',
        icon: Building2,
        key: 'profileSupplier',
        label: 'VEKA',
      });
    });

    it('should build parameters for sort only (non-default)', () => {
      const params = buildActiveParameters({
        sortType: 'name-desc',
      });

      expect(params).toHaveLength(1);
      expect(params[ 0 ]).toEqual({
        ariaLabel: 'Quitar ordenamiento: Z-A',
        icon: ArrowDownZA,
        key: 'sort',
        label: 'Z-A',
      });
    });

    it('should not include default sort in parameters', () => {
      const params = buildActiveParameters({
        searchQuery: 'vidrio',
        sortType: 'name-asc', // default sort
      });

      expect(params).toHaveLength(1);
      expect(params[ 0 ]?.key).toBe('search');
    });

    it('should handle null values correctly', () => {
      const params = buildActiveParameters({
        profileSupplierName: null,
        searchQuery: null,
        sortType: null,
      });

      expect(params).toEqual([]);
    });

    it('should handle undefined values correctly', () => {
      const params = buildActiveParameters({
        profileSupplierName: undefined,
        searchQuery: undefined,
        sortType: undefined,
      });

      expect(params).toEqual([]);
    });

    it('should handle mixed null, undefined, and valid values', () => {
      const params = buildActiveParameters({
        profileSupplierName: 'Guardian',
        searchQuery: null,
        sortType: undefined,
      });

      expect(params).toHaveLength(1);
      expect(params[ 0 ]?.key).toBe('profileSupplier');
    });

    it('should preserve order: search, profileSupplier, sort', () => {
      const params = buildActiveParameters({
        profileSupplierName: 'Guardian',
        searchQuery: 'vidrio',
        sortType: 'price-asc',
      });

      expect(params[ 0 ]?.key).toBe('search');
      expect(params[ 1 ]?.key).toBe('profileSupplier');
      expect(params[ 2 ]?.key).toBe('sort');
    });
  });

  describe('SORT_CONFIGURATIONS constant', () => {
    it('should have configuration for all 4 sort types', () => {
      const expectedSortTypes = 4;
      expect(Object.keys(SORT_CONFIGURATIONS)).toHaveLength(expectedSortTypes);
    });

    it('should have correct structure for each configuration', () => {
      for (const config of Object.values(SORT_CONFIGURATIONS)) {
        expect(config).toHaveProperty('icon');
        expect(config).toHaveProperty('label');
        expect(typeof config.label).toBe('string');
      }
    });

    it('should have unique labels', () => {
      const labels = Object.values(SORT_CONFIGURATIONS).map((c) => c.label);
      const uniqueLabels = new Set(labels);

      expect(uniqueLabels.size).toBe(labels.length);
    });
  });
});
