/**
 * Contract Tests - tRPC Catalog Procedures
 *
 * Tests that verify tRPC procedures comply with their input/output contracts.
 * These tests validate Zod schemas and ensure data structures match expectations.
 */

import { describe, expect, it } from 'vitest';
import {
  glassSolutionOutput,
  glassTypeOutput,
  listGlassSolutionsInput,
  listGlassSolutionsOutput,
  listGlassTypesInput,
  listGlassTypesOutput,
} from '@/server/api/routers/catalog/catalog.schemas';

describe('Contract Tests - Catalog Schemas', () => {
  describe('listGlassSolutionsInput schema', () => {
    it('should accept valid input with includeGlassCount true', () => {
      const validInput = { includeGlassCount: true };

      const result = listGlassSolutionsInput.safeParse(validInput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.includeGlassCount).toBe(true);
      }
    });

    it('should accept valid input with includeGlassCount false', () => {
      const validInput = { includeGlassCount: false };

      const result = listGlassSolutionsInput.safeParse(validInput);

      expect(result.success).toBe(true);
    });

    it('should use default value when includeGlassCount is omitted', () => {
      const validInput = {};

      const result = listGlassSolutionsInput.safeParse(validInput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.includeGlassCount).toBe(false); // Default
      }
    });

    it('should reject invalid input types', () => {
      const invalidInput = { includeGlassCount: 'yes' };

      const result = listGlassSolutionsInput.safeParse(invalidInput);

      expect(result.success).toBe(false);
    });
  });

  describe('glassSolutionOutput schema', () => {
    it('should validate complete solution output', () => {
      const expectedGlassCount = 5;

      const validOutput = {
        descriptionEn: null,
        descriptionEs: 'Vidrio de seguridad laminado',
        glassCount: expectedGlassCount,
        icon: 'Shield',
        id: 'sol_123',
        key: 'security',
        nameEn: 'Security',
        nameEs: 'Seguridad',
      };

      const result = glassSolutionOutput.safeParse(validOutput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('sol_123');
        expect(result.data.key).toBe('security');
        expect(result.data.glassCount).toBe(expectedGlassCount);
      }
    });
    it('should accept null values for optional fields', () => {
      const validOutput = {
        descriptionEn: null,
        descriptionEs: 'Aislamiento térmico',
        glassCount: undefined,
        icon: null,
        id: 'sol_456',
        key: 'thermal_insulation',
        nameEn: 'Thermal',
        nameEs: 'Térmico',
      };

      const result = glassSolutionOutput.safeParse(validOutput);

      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidOutput = {
        // Missing key, nameEs, nameEn
        icon: 'Home',
        id: 'sol_789',
      };

      const result = glassSolutionOutput.safeParse(invalidOutput);

      expect(result.success).toBe(false);
    });
  });

  describe('listGlassTypesInput schema', () => {
    it('should accept valid input with all optional fields', () => {
      const validInput = {
        includeManufacturer: true,
        includeSolutions: true,
        manufacturerId: 'mfr_123',
        solutionKey: 'security',
      };

      const result = listGlassTypesInput.safeParse(validInput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.manufacturerId).toBe('mfr_123');
        expect(result.data.solutionKey).toBe('security');
      }
    });

    it('should accept empty object as all fields are optional', () => {
      const validInput = {};

      const result = listGlassTypesInput.safeParse(validInput);

      expect(result.success).toBe(true);
    });

    it('should use default values for includeManufacturer and includeSolutions', () => {
      const validInput = {};

      const result = listGlassTypesInput.safeParse(validInput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.includeManufacturer).toBe(true); // Default
        expect(result.data.includeSolutions).toBe(true); // Default
      }
    });

    it('should reject invalid manufacturer ID format', () => {
      const invalidInput = {
        manufacturerId: 123, // Should be string
      };

      const result = listGlassTypesInput.safeParse(invalidInput);

      expect(result.success).toBe(false);
    });
  });

  describe('glassTypeOutput schema', () => {
    it('should validate complete glass type output with solutions', () => {
      const validOutput = {
        id: 'gt_123',
        isLaminated: true,
        isLowE: false,
        isTempered: false,
        isTripleGlazed: false,
        manufacturer: {
          id: 'mfr_123',
          name: 'Guardian',
        },
        manufacturerId: 'mfr_123',
        name: 'Guardian Sun 6mm',
        pricePerSqm: 85.5,
        solutions: [
          {
            acousticRating: 'standard',
            energyRating: 'very_good',
            id: 'gts_1',
            isPrimary: true,
            securityRating: 'good',
            solution: {
              icon: 'Shield',
              id: 'sol_1',
              key: 'security',
              nameEn: 'Security',
              nameEs: 'Seguridad',
            },
            thermalRating: 'standard',
          },
        ],
        thickness: '6.00',
      };

      const result = glassTypeOutput.safeParse(validOutput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('gt_123');
        expect(result.data.solutions).toHaveLength(1);
        expect(result.data.solutions?.[0]?.isPrimary).toBe(true);
        expect(result.data.solutions?.[0]?.securityRating).toBe('good');
      }
    });

    it('should validate all performance rating values', () => {
      const performanceRatings = ['basic', 'standard', 'good', 'very_good', 'excellent'];

      for (const rating of performanceRatings) {
        const validOutput = {
          id: 'gt_test',
          isLaminated: false,
          isLowE: false,
          isTempered: false,
          isTripleGlazed: false,
          manufacturerId: 'mfr_1',
          name: 'Test Glass',
          pricePerSqm: 50,
          solutions: [
            {
              acousticRating: rating,
              energyRating: rating,
              id: 'gts_test',
              isPrimary: true,
              securityRating: rating,
              solution: {
                icon: 'Home',
                id: 'sol_1',
                key: 'general',
                nameEn: 'General',
                nameEs: 'General',
              },
              thermalRating: rating,
            },
          ],
          thickness: '4.00',
        };

        const result = glassTypeOutput.safeParse(validOutput);

        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid performance rating', () => {
      const invalidOutput = {
        id: 'gt_invalid',
        isLaminated: false,
        isLowE: false,
        isTempered: false,
        isTripleGlazed: false,
        manufacturerId: 'mfr_1',
        name: 'Invalid Glass',
        pricePerSqm: 50,
        solutions: [
          {
            acousticRating: 'basic',
            energyRating: 'basic',
            id: 'gts_invalid',
            isPrimary: true,
            securityRating: 'super_excellent', // Invalid rating
            solution: {
              icon: 'Home',
              id: 'sol_1',
              key: 'general',
              nameEn: 'General',
              nameEs: 'General',
            },
            thermalRating: 'basic',
          },
        ],
        thickness: '4.00',
      };

      const result = glassTypeOutput.safeParse(invalidOutput);

      expect(result.success).toBe(false);
    });

    it('should accept glass type without solutions', () => {
      const validOutput = {
        id: 'gt_no_solutions',
        isLaminated: false,
        isLowE: false,
        isTempered: true,
        isTripleGlazed: false,
        manufacturerId: 'mfr_1',
        name: 'Glass Without Solutions',
        pricePerSqm: 75,
        solutions: [],
        thickness: '6.00',
      };

      const result = glassTypeOutput.safeParse(validOutput);

      expect(result.success).toBe(true);
    });
  });

  describe('listGlassSolutionsOutput schema', () => {
    it('should validate array of solutions', () => {
      const validOutput = [
        {
          descriptionEn: null,
          descriptionEs: 'Vidrio de seguridad',
          glassCount: 3,
          icon: 'Shield',
          id: 'sol_1',
          key: 'security',
          nameEn: 'Security',
          nameEs: 'Seguridad',
        },
        {
          descriptionEn: null,
          descriptionEs: 'Aislamiento térmico',
          glassCount: 2,
          icon: 'Snowflake',
          id: 'sol_2',
          key: 'thermal_insulation',
          nameEn: 'Thermal',
          nameEs: 'Térmico',
        },
      ];

      const result = listGlassSolutionsOutput.safeParse(validOutput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
        expect(result.data[0]?.key).toBe('security');
      }
    });

    it('should accept empty array', () => {
      const validOutput: unknown[] = [];

      const result = listGlassSolutionsOutput.safeParse(validOutput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(0);
      }
    });
  });

  describe('listGlassTypesOutput schema', () => {
    it('should validate array of glass types', () => {
      const validOutput = [
        {
          id: 'gt_1',
          isLaminated: false,
          isLowE: false,
          isTempered: false,
          isTripleGlazed: false,
          manufacturerId: 'mfr_1',
          name: 'Glass Type 1',
          pricePerSqm: 45,
          solutions: [],
          thickness: '4.00',
        },
        {
          id: 'gt_2',
          isLaminated: false,
          isLowE: true,
          isTempered: true,
          isTripleGlazed: false,
          manufacturerId: 'mfr_1',
          name: 'Glass Type 2',
          pricePerSqm: 65,
          solutions: [],
          thickness: '6.00',
        },
      ];

      const result = listGlassTypesOutput.safeParse(validOutput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
      }
    });
  });
});
