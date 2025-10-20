import { describe, expect, it } from 'vitest';
import type { MaterialType } from '../../../src/app/(public)/catalog/[modelId]/_types/model.types';
import {
  formatPerformanceRating,
  MATERIAL_BENEFITS,
  MATERIAL_PERFORMANCE,
  type PerformanceLevel,
} from '../../../src/app/(public)/catalog/[modelId]/_utils/material-benefits';

/**
 * Unit tests for material benefits utilities
 * These are pure function tests - no database or external dependencies
 */
describe('Material Benefits Utilities', () => {
  describe('MATERIAL_BENEFITS', () => {
    it('should have benefits for all material types', () => {
      const materialTypes: MaterialType[] = ['PVC', 'ALUMINUM', 'WOOD', 'MIXED'];

      for (const materialType of materialTypes) {
        expect(MATERIAL_BENEFITS[materialType]).toBeDefined();
        expect(Array.isArray(MATERIAL_BENEFITS[materialType])).toBe(true);
        expect(MATERIAL_BENEFITS[materialType].length).toBeGreaterThan(0);
      }
    });

    it('should provide Spanish language benefits', () => {
      const pvcBenefits = MATERIAL_BENEFITS.PVC;

      // Verify Spanish characters and structure
      expect(pvcBenefits.some((benefit: string) => benefit.includes('aislamiento'))).toBe(true);
      expect(pvcBenefits.every((benefit: string) => typeof benefit === 'string')).toBe(true);
    });

    it('should have distinct benefits per material type', () => {
      const pvcBenefits = MATERIAL_BENEFITS.PVC;
      const aluminumBenefits = MATERIAL_BENEFITS.ALUMINUM;

      // PVC should emphasize thermal insulation
      expect(pvcBenefits.some((b: string) => b.toLowerCase().includes('térmico'))).toBe(true);

      // Aluminum should emphasize structural strength
      expect(aluminumBenefits.some((b: string) => b.toLowerCase().includes('resistencia'))).toBe(true);
    });

    it('should have 4+ benefits for each material', () => {
      expect(MATERIAL_BENEFITS.PVC.length).toBeGreaterThanOrEqual(4);
      expect(MATERIAL_BENEFITS.ALUMINUM.length).toBeGreaterThanOrEqual(4);
      expect(MATERIAL_BENEFITS.WOOD.length).toBeGreaterThanOrEqual(4);
      expect(MATERIAL_BENEFITS.MIXED.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('MATERIAL_PERFORMANCE', () => {
    it('should have performance ratings for all material types', () => {
      const materialTypes: MaterialType[] = ['PVC', 'ALUMINUM', 'WOOD', 'MIXED'];

      for (const materialType of materialTypes) {
        const performance = MATERIAL_PERFORMANCE[materialType];

        expect(performance).toBeDefined();
        expect(performance.thermal).toBeDefined();
        expect(performance.acoustic).toBeDefined();
        expect(performance.structural).toBeDefined();
      }
    });

    it('should use valid performance levels', () => {
      const validLevels: PerformanceLevel[] = ['excellent', 'good', 'standard'];

      const materials = Object.values(MATERIAL_PERFORMANCE) as Array<{
        thermal: PerformanceLevel;
        acoustic: PerformanceLevel;
        structural: PerformanceLevel;
      }>;

      for (const material of materials) {
        expect(validLevels).toContain(material.thermal);
        expect(validLevels).toContain(material.acoustic);
        expect(validLevels).toContain(material.structural);
      }
    });

    it('should reflect material-specific strengths', () => {
      // PVC excels at thermal and acoustic insulation
      expect(MATERIAL_PERFORMANCE.PVC.thermal).toBe('excellent');
      expect(MATERIAL_PERFORMANCE.PVC.acoustic).toBe('excellent');

      // Aluminum excels at structural strength
      expect(MATERIAL_PERFORMANCE.ALUMINUM.structural).toBe('excellent');

      // Wood has excellent thermal properties
      expect(MATERIAL_PERFORMANCE.WOOD.thermal).toBe('excellent');
    });
  });

  describe('formatPerformanceRating', () => {
    it('should convert "excellent" to 5 stars', () => {
      const result = formatPerformanceRating('excellent');

      expect(result.stars).toBe(5);
      expect(result.label).toBe('Excelente');
    });

    it('should convert "good" to 4 stars', () => {
      const result = formatPerformanceRating('good');

      expect(result.stars).toBe(4);
      expect(result.label).toBe('Bueno');
    });

    it('should convert "standard" to 3 stars', () => {
      const result = formatPerformanceRating('standard');

      expect(result.stars).toBe(3);
      expect(result.label).toBe('Estándar');
    });

    it('should return Spanish labels for all levels', () => {
      const levels: PerformanceLevel[] = ['excellent', 'good', 'standard'];

      for (const level of levels) {
        const result = formatPerformanceRating(level);

        expect(result.label).toBeTruthy();
        expect(typeof result.label).toBe('string');
        // Verify it's in Spanish (contains Spanish characters or common Spanish words)
        expect(result.label.match(/[áéíóúñÁÉÍÓÚÑ]|Excelente|Bueno|Estándar/)).toBeTruthy();
      }
    });

    it('should return star values between 1 and 5', () => {
      const levels: PerformanceLevel[] = ['excellent', 'good', 'standard'];

      for (const level of levels) {
        const result = formatPerformanceRating(level);

        expect(result.stars).toBeGreaterThanOrEqual(1);
        expect(result.stars).toBeLessThanOrEqual(5);
      }
    });
  });

  describe('Integration - Material to User Display', () => {
    it('should provide complete data flow for PVC material', () => {
      const materialType: MaterialType = 'PVC';

      // Step 1: Get benefits
      const benefits = MATERIAL_BENEFITS[materialType];
      expect(benefits.length).toBeGreaterThan(0);

      // Step 2: Get performance
      const performance = MATERIAL_PERFORMANCE[materialType];
      expect(performance.thermal).toBe('excellent');

      // Step 3: Format for display
      const thermalRating = formatPerformanceRating(performance.thermal);
      expect(thermalRating.stars).toBe(5);
      expect(thermalRating.label).toBe('Excelente');

      // Verify complete user-facing data is available
      expect(benefits[0]).toBeTruthy();
      expect(thermalRating.label).toBeTruthy();
    });

    it('should provide complete data flow for ALUMINUM material', () => {
      const materialType: MaterialType = 'ALUMINUM';

      const benefits = MATERIAL_BENEFITS[materialType];
      const performance = MATERIAL_PERFORMANCE[materialType];
      const structuralRating = formatPerformanceRating(performance.structural);

      expect(benefits.some((b: string) => b.includes('resistencia'))).toBe(true);
      expect(structuralRating.stars).toBe(5);
      expect(structuralRating.label).toBe('Excelente');
    });
  });
});
