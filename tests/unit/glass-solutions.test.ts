/**
 * Unit Tests - Glass Solutions Utilities
 *
 * Tests for pure functions related to glass solutions and ratings.
 * These functions have no external dependencies and can be tested in isolation.
 */

import type { GlassPurpose } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { describe, expect, it } from 'vitest';
import {
  ensureGlassHasSolutions,
  isUsingFallbackSolutions,
  mapPurposeToSolutionKey,
} from '@/server/api/routers/catalog/catalog.migration-utils';
import { serializeDecimalFields } from '@/server/api/routers/catalog/catalog.utils';

describe('Glass Solutions - Migration Utilities', () => {
  describe('mapPurposeToSolutionKey', () => {
    it('should map general purpose to general solution', () => {
      const result = mapPurposeToSolutionKey('general' as GlassPurpose);
      expect(result).toBe('general');
    });

    it('should map insulation purpose to thermal_insulation solution', () => {
      const result = mapPurposeToSolutionKey('insulation' as GlassPurpose);
      expect(result).toBe('thermal_insulation');
    });

    it('should map security purpose to security solution', () => {
      const result = mapPurposeToSolutionKey('security' as GlassPurpose);
      expect(result).toBe('security');
    });

    it('should map decorative purpose to decorative solution', () => {
      const result = mapPurposeToSolutionKey('decorative' as GlassPurpose);
      expect(result).toBe('decorative');
    });

    it('should default to general for unknown purpose', () => {
      const result = mapPurposeToSolutionKey('unknown' as GlassPurpose);
      expect(result).toBe('general');
    });
  });

  describe('ensureGlassHasSolutions', () => {
    const mockSolutions = [
      { icon: 'Home', id: 'sol-1', key: 'general', nameEs: 'General' },
      { icon: 'Shield', id: 'sol-2', key: 'security', nameEs: 'Seguridad' },
      { icon: 'Snowflake', id: 'sol-3', key: 'thermal_insulation', nameEs: 'Térmico' },
    ];

    it('should return existing solutions if glass has them', () => {
      const glassWithSolutions = {
        purpose: 'general' as GlassPurpose,
        solutions: [
          {
            glassTypeId: 'gt-1',
            id: 'gts-1',
            isPrimary: true,
            solution: mockSolutions[0],
            solutionId: 'sol-1',
          },
        ],
      };

      const result = ensureGlassHasSolutions(glassWithSolutions, mockSolutions);

      expect(result).toEqual(glassWithSolutions.solutions);
      expect(result).toHaveLength(1);
      expect(result?.[0]?.solution.key).toBe('general');
    });

    it('should create fallback solution from purpose if glass has no solutions', () => {
      const glassWithoutSolutions = {
        purpose: 'security' as GlassPurpose,
        solutions: [],
      };

      const result = ensureGlassHasSolutions(glassWithoutSolutions, mockSolutions);

      expect(result).toHaveLength(1);
      expect(result?.[0]?.solution.key).toBe('security');
      expect(result?.[0]?.id).toContain('fallback-');
      expect(result?.[0]?.isPrimary).toBe(true);
    });

    it('should use general solution as ultimate fallback', () => {
      const glassWithUnknownPurpose = {
        purpose: 'unknown' as GlassPurpose,
        solutions: [],
      };

      const result = ensureGlassHasSolutions(glassWithUnknownPurpose, mockSolutions);

      expect(result).toHaveLength(1);
      expect(result?.[0]?.solution.key).toBe('general');
    });

    it('should return empty array if no solutions available at all', () => {
      const glassWithoutSolutions = {
        purpose: 'general' as GlassPurpose,
        solutions: [],
      };

      const result = ensureGlassHasSolutions(glassWithoutSolutions, []);

      expect(result).toEqual([]);
    });
  });

  describe('isUsingFallbackSolutions', () => {
    it('should return true if solutions have fallback ID', () => {
      const solutions = [{ id: 'fallback-security' }];

      expect(isUsingFallbackSolutions(solutions)).toBe(true);
    });

    it('should return false if solutions have real IDs', () => {
      const solutions = [{ id: 'gts-123' }, { id: 'gts-456' }];

      expect(isUsingFallbackSolutions(solutions)).toBe(false);
    });

    it('should return false for empty solutions', () => {
      expect(isUsingFallbackSolutions([])).toBe(false);
    });

    it('should return false for undefined solutions', () => {
      expect(isUsingFallbackSolutions(undefined)).toBe(false);
    });

    it('should return true if at least one solution is fallback', () => {
      const solutions = [{ id: 'gts-123' }, { id: 'fallback-thermal' }];

      expect(isUsingFallbackSolutions(solutions)).toBe(true);
    });
  });
});

describe('Glass Solutions - Utilities', () => {
  describe('serializeDecimalFields', () => {
    it('should convert Decimal fields to numbers', () => {
      const expectedBasePrice = 150.5;
      const expectedHeightCost = 2.5;
      const expectedWidthCost = 3.75;
      const expectedAccessory = 25.0;

      const model = {
        accessoryPrice: new Decimal('25.00'),
        basePrice: new Decimal('150.50'),
        costPerMmHeight: new Decimal('2.5'),
        costPerMmWidth: new Decimal('3.75'),
        id: 'model-1',
        name: 'Test Model',
      };

      const result = serializeDecimalFields(model);

      expect(result.basePrice).toBe(expectedBasePrice);
      expect(result.costPerMmHeight).toBe(expectedHeightCost);
      expect(result.costPerMmWidth).toBe(expectedWidthCost);
      expect(result.accessoryPrice).toBe(expectedAccessory);
    });

    it('should handle null accessoryPrice', () => {
      const model = {
        accessoryPrice: null,
        basePrice: new Decimal('100'),
        costPerMmHeight: new Decimal('1'),
        costPerMmWidth: new Decimal('1'),
        id: 'model-1',
        name: 'Test Model',
      };

      const result = serializeDecimalFields(model);

      expect(result.accessoryPrice).toBe(null);
    });

    it('should preserve non-Decimal fields', () => {
      const model = {
        accessoryPrice: new Decimal('0'),
        basePrice: new Decimal('200'),
        costPerMmHeight: new Decimal('5'),
        costPerMmWidth: new Decimal('5'),
        id: 'model-1',
        manufacturerId: 'mfr-1',
        name: 'Test Model',
      };

      const result = serializeDecimalFields(model);

      expect(result.id).toBe('model-1');
      expect(result.name).toBe('Test Model');
      expect(result.manufacturerId).toBe('mfr-1');
    });

    it('should handle zero values correctly', () => {
      const model = {
        accessoryPrice: new Decimal('0'),
        basePrice: new Decimal('0'),
        costPerMmHeight: new Decimal('0'),
        costPerMmWidth: new Decimal('0'),
      };

      const result = serializeDecimalFields(model);

      expect(result.basePrice).toBe(0);
      expect(result.costPerMmHeight).toBe(0);
      expect(result.costPerMmWidth).toBe(0);
      expect(result.accessoryPrice).toBe(0);
    });

    it('should handle large decimal numbers', () => {
      const expectedLargeBase = 9999.99;
      const expectedLargeCost = 99.999;

      const model = {
        accessoryPrice: null,
        basePrice: new Decimal('9999.99'),
        costPerMmHeight: new Decimal('99.999'),
        costPerMmWidth: new Decimal('99.999'),
      };

      const result = serializeDecimalFields(model);

      expect(result.basePrice).toBe(expectedLargeBase);
      expect(result.costPerMmHeight).toBe(expectedLargeCost);
      expect(result.costPerMmWidth).toBe(expectedLargeCost);
    });
  });
});
