/**
 * Unit tests for validation.ts
 * Tests Zod schemas and validation functions for StoredDesignConfig
 *
 * @vitest-environment node
 */

import type { StoredDesignConfig } from '@lib/design/types';
import { isValidDesignConfig, validateDesignConfig } from '@lib/design/validation';
import { ModelType } from '@prisma/client';
import { describe, expect, it } from 'vitest';

describe('validation', () => {
  describe('validateDesignConfig', () => {
    it('should accept valid fixed window design', () => {
      const validConfig: StoredDesignConfig = {
        constraints: {
          frameThicknessMax: 80,
          frameThicknessMin: 40,
          glassMargin: 5,
        },
        dimensions: {
          baseHeight: 1200,
          baseWidth: 1000,
        },
        metadata: {
          id: 'fixed-window-1',
          name: 'fixed-window-simple',
          nameEs: 'Ventana Fija Simple',
          type: ModelType.fixed_window,
        },
        shapes: [
          {
            id: 'frame-1',
            layer: 1,
            position: { x: 0, y: 0 },
            role: 'frame',
            size: { h: { percent: 1 }, w: { percent: 1 } },
            style: {
              fill: 'material',
              stroke: '#333333',
              strokeWidth: 2,
            },
            type: 'rect',
          },
          {
            id: 'glass-1',
            layer: 2,
            position: { x: 40, y: 40 },
            role: 'glass',
            size: { h: 'fill', w: 'fill' },
            style: {
              fill: '#E0F7FA',
              opacity: 0.7,
            },
            type: 'rect',
          },
        ],
        version: '1.0',
      };

      expect(() => validateDesignConfig(validConfig)).not.toThrow();
    });

    it('should reject config without version', () => {
      const invalidConfig = {
        constraints: { frameThicknessMax: 80, frameThicknessMin: 40, glassMargin: 5 },
        dimensions: { baseHeight: 1200, baseWidth: 1000 },
        metadata: { id: 'test', name: 'test', nameEs: 'Test', type: ModelType.fixed_window },
        shapes: [],
      };

      expect(() => validateDesignConfig(invalidConfig)).toThrow();
    });

    it('should reject config with wrong version', () => {
      const invalidConfig = {
        constraints: { frameThicknessMax: 80, frameThicknessMin: 40, glassMargin: 5 },
        dimensions: { baseHeight: 1200, baseWidth: 1000 },
        metadata: { id: 'test', name: 'test', nameEs: 'Test', type: ModelType.fixed_window },
        shapes: [],
        version: '2.0',
      };

      expect(() => validateDesignConfig(invalidConfig)).toThrow();
    });

    it('should reject config with too many shapes', () => {
      const shapes = Array.from({ length: 101 }, (_, i) => ({
        id: `shape-${i}`,
        layer: 1,
        position: { x: 0, y: 0 },
        role: 'decorative' as const,
        size: { h: 10, w: 10 },
        style: { fill: '#000000' },
        type: 'rect' as const,
      }));

      const invalidConfig = {
        constraints: { frameThicknessMax: 80, frameThicknessMin: 40, glassMargin: 5 },
        dimensions: { baseHeight: 1200, baseWidth: 1000 },
        metadata: { id: 'test', name: 'test', nameEs: 'Test', type: ModelType.fixed_window },
        shapes,
        version: '1.0',
      };

      expect(() => validateDesignConfig(invalidConfig)).toThrow();
    });

    it('should reject config with zero shapes', () => {
      const invalidConfig = {
        constraints: { frameThicknessMax: 80, frameThicknessMin: 40, glassMargin: 5 },
        dimensions: { baseHeight: 1200, baseWidth: 1000 },
        metadata: { id: 'test', name: 'test', nameEs: 'Test', type: ModelType.fixed_window },
        shapes: [],
        version: '1.0',
      };

      expect(() => validateDesignConfig(invalidConfig)).toThrow();
    });

    it('should reject invalid shape type', () => {
      const invalidConfig = {
        constraints: { frameThicknessMax: 80, frameThicknessMin: 40, glassMargin: 5 },
        dimensions: { baseHeight: 1200, baseWidth: 1000 },
        metadata: { id: 'test', name: 'test', nameEs: 'Test', type: ModelType.fixed_window },
        shapes: [
          {
            id: 'invalid-1',
            layer: 1,
            position: { x: 0, y: 0 },
            role: 'frame',
            size: { h: 100, w: 100 },
            style: { fill: '#000000' },
            type: 'triangle', // Invalid type
          },
        ],
        version: '1.0',
      };

      expect(() => validateDesignConfig(invalidConfig)).toThrow();
    });

    it('should reject opacity > 1', () => {
      const invalidConfig = {
        constraints: { frameThicknessMax: 80, frameThicknessMin: 40, glassMargin: 5 },
        dimensions: { baseHeight: 1200, baseWidth: 1000 },
        metadata: { id: 'test', name: 'test', nameEs: 'Test', type: ModelType.fixed_window },
        shapes: [
          {
            id: 'invalid-1',
            layer: 1,
            position: { x: 0, y: 0 },
            role: 'glass',
            size: { h: 100, w: 100 },
            style: { fill: '#000000', opacity: 1.5 }, // Invalid opacity
            type: 'rect',
          },
        ],
        version: '1.0',
      };

      expect(() => validateDesignConfig(invalidConfig)).toThrow();
    });
  });

  describe('isValidDesignConfig', () => {
    it('should return true for valid config', () => {
      const validConfig: StoredDesignConfig = {
        constraints: { frameThicknessMax: 80, frameThicknessMin: 40, glassMargin: 5 },
        dimensions: { baseHeight: 1200, baseWidth: 1000 },
        metadata: {
          id: 'test',
          name: 'test',
          nameEs: 'Test',
          type: ModelType.fixed_window,
        },
        shapes: [
          {
            id: 'frame-1',
            layer: 1,
            position: { x: 0, y: 0 },
            role: 'frame',
            size: { h: 100, w: 100 },
            style: { fill: '#000000' },
            type: 'rect',
          },
        ],
        version: '1.0',
      };

      expect(isValidDesignConfig(validConfig)).toBe(true);
    });

    it('should return false for invalid config without throwing', () => {
      const invalidConfig = {
        constraints: { frameThicknessMax: 80, frameThicknessMin: 40, glassMargin: 5 },
        dimensions: { baseHeight: 1200, baseWidth: 1000 },
        metadata: { id: 'test', name: 'test', nameEs: 'Test', type: ModelType.fixed_window },
        shapes: [],
        version: '2.0', // Wrong version
      };

      expect(isValidDesignConfig(invalidConfig)).toBe(false);
    });

    it('should return false for null input', () => {
      expect(isValidDesignConfig(null)).toBe(false);
    });

    it('should return false for undefined input', () => {
      expect(isValidDesignConfig(undefined)).toBe(false);
    });

    it('should return false for non-object input', () => {
      const testNumber = 123;
      expect(isValidDesignConfig('invalid')).toBe(false);
      expect(isValidDesignConfig(testNumber)).toBe(false);
      expect(isValidDesignConfig(true)).toBe(false);
    });
  });
});
