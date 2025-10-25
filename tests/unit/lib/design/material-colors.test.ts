/**
 * Unit tests for material-colors utility module
 * No database setup required - pure function tests
 *
 * @vitest-environment node
 */

import { getMaterialColor, isValidMaterialColor, MATERIAL_COLORS } from '@lib/design/material-colors';
import { MaterialType } from '@prisma/client';
import { describe, expect, it } from 'vitest';

describe('material-colors', () => {
  describe('MATERIAL_COLORS constant', () => {
    it('should contain all required material types', () => {
      expect(Object.keys(MATERIAL_COLORS)).toEqual(['PVC', 'ALUMINUM', 'WOOD', 'MIXED']);
    });

    it('should have valid hex color values', () => {
      const hexColorRegex = /^#[0-9A-F]{6}$/i;
      for (const color of Object.values(MATERIAL_COLORS)) {
        expect(color).toMatch(hexColorRegex);
      }
    });

    it('should have distinct color values for each material', () => {
      const colors = Object.values(MATERIAL_COLORS);
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(colors.length);
    });
  });

  describe('getMaterialColor()', () => {
    it('should return white for PVC', () => {
      expect(getMaterialColor(MaterialType.PVC)).toBe('#FFFFFF');
    });

    it('should return gray for ALUMINUM', () => {
      expect(getMaterialColor(MaterialType.ALUMINUM)).toBe('#808080');
    });

    it('should return brown for WOOD', () => {
      expect(getMaterialColor(MaterialType.WOOD)).toBe('#8B4513');
    });

    it('should return light gray for MIXED', () => {
      expect(getMaterialColor(MaterialType.MIXED)).toBe('#D3D3D3');
    });

    it('should handle all MaterialType values', () => {
      const materialTypes = [MaterialType.PVC, MaterialType.ALUMINUM, MaterialType.WOOD, MaterialType.MIXED];
      for (const material of materialTypes) {
        const color = getMaterialColor(material);
        expect(color).toBeDefined();
        expect(color).toMatch(/^#[0-9A-F]{6}$/i);
      }
    });
  });

  describe('isValidMaterialColor()', () => {
    it('should return true for valid hex colors', () => {
      expect(isValidMaterialColor('#FFFFFF')).toBe(true);
      expect(isValidMaterialColor('#000000')).toBe(true);
      expect(isValidMaterialColor('#FF5733')).toBe(true);
    });

    it('should return false for invalid formats', () => {
      const invalidTestNumber = 123;
      expect(isValidMaterialColor('FFFFFF')).toBe(false);
      expect(isValidMaterialColor('#FFF')).toBe(false);
      expect(isValidMaterialColor('rgb(255, 255, 255)')).toBe(false);
      expect(isValidMaterialColor('white')).toBe(false);
      expect(isValidMaterialColor(invalidTestNumber)).toBe(false);
      expect(isValidMaterialColor(null)).toBe(false);
      expect(isValidMaterialColor(undefined)).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(isValidMaterialColor('#ffffff')).toBe(true);
      expect(isValidMaterialColor('#FfFfFf')).toBe(true);
    });
  });
});
