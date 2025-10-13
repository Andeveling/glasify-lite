/**
 * Unit tests for window diagram map utility
 *
 * Tests the window diagram mapping functions that connect WindowType
 * enum values to their corresponding SVG diagram paths.
 *
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest';
import {
  getAllWindowDiagrams,
  getWindowDiagram,
  getWindowDiagramAltText,
  getWindowDiagramPath,
  getWindowDiagramsByCategory,
  hasWindowDiagram,
  WINDOW_DIAGRAM_MAP,
  type WindowDiagram,
} from '@/lib/utils/window-diagram-map';
import { DEFAULT_WINDOW_TYPE, WindowType } from '@/types/window.types';

describe('Window Diagram Map Utility', () => {
  describe('getWindowDiagram', () => {
    it('should return correct diagram for valid WindowType', () => {
      const diagram = getWindowDiagram(WindowType.SLIDING_2_PANEL);

      expect(diagram).toBeDefined();
      expect(diagram.type).toBe(WindowType.SLIDING_2_PANEL);
      expect(diagram.svgPath).toBe('/diagrams/windows/sliding-2-panel.svg');
      expect(diagram.viewBox).toBeDefined();
      expect(diagram.aspectRatio).toBeGreaterThan(0);
      expect(diagram.altText).toContain('corrediza');
    });

    it('should return correct diagram for each basic window type', () => {
      const basicTypes = [
        WindowType.FRENCH_2_PANEL,
        WindowType.FRENCH_4_PANEL,
        WindowType.SLIDING_2_PANEL,
        WindowType.SLIDING_3_PANEL,
        WindowType.FIXED_SINGLE,
        WindowType.AWNING,
        WindowType.CASEMENT_LEFT,
        WindowType.CASEMENT_RIGHT,
        WindowType.HOPPER,
        WindowType.TILT_TURN,
      ];

      basicTypes.forEach((type) => {
        const diagram = getWindowDiagram(type);
        expect(diagram).toBeDefined();
        expect(diagram.type).toBe(type);
        expect(diagram.svgPath).toContain('/diagrams/windows/');
        expect(diagram.svgPath).toContain('.svg');
      });
    });

    it('should fall back to default diagram for unknown type', () => {
      const unknownType = 'totally-unknown-type' as WindowType;
      const diagram = getWindowDiagram(unknownType);

      expect(diagram).toBeDefined();
      expect(diagram.type).toBe(DEFAULT_WINDOW_TYPE);
      expect(diagram.svgPath).toContain('fixed-single.svg');
    });

    it('should fall back to default for null/undefined', () => {
      const nullDiagram = getWindowDiagram(null as unknown as WindowType);
      const undefinedDiagram = getWindowDiagram(undefined as unknown as WindowType);

      expect(nullDiagram.type).toBe(DEFAULT_WINDOW_TYPE);
      expect(undefinedDiagram.type).toBe(DEFAULT_WINDOW_TYPE);
    });

    it('should fall back to default for empty string', () => {
      const diagram = getWindowDiagram('');
      expect(diagram.type).toBe(DEFAULT_WINDOW_TYPE);
    });

    it('should handle WindowType.UNKNOWN correctly', () => {
      const diagram = getWindowDiagram(WindowType.UNKNOWN);
      expect(diagram.type).toBe(WindowType.UNKNOWN);
      expect(diagram.svgPath).toContain('fixed-single.svg');
    });
  });

  describe('getWindowDiagramPath', () => {
    it('should return SVG path for valid type', () => {
      const path = getWindowDiagramPath(WindowType.CASEMENT_LEFT);
      expect(path).toBe('/diagrams/windows/casement-left.svg');
    });

    it('should return default path for unknown type', () => {
      const path = getWindowDiagramPath('unknown' as WindowType);
      expect(path).toContain('/diagrams/windows/fixed-single.svg');
    });

    it('should return string (not object)', () => {
      const path = getWindowDiagramPath(WindowType.AWNING);
      expect(typeof path).toBe('string');
    });
  });

  describe('getWindowDiagramAltText', () => {
    it('should return accessible Spanish alt text', () => {
      const altText = getWindowDiagramAltText(WindowType.FRENCH_2_PANEL);
      expect(altText).toContain('puerta');
      expect(altText).toContain('francesa');
    });

    it('should return different alt text for different types', () => {
      const french = getWindowDiagramAltText(WindowType.FRENCH_2_PANEL);
      const sliding = getWindowDiagramAltText(WindowType.SLIDING_2_PANEL);

      expect(french).not.toBe(sliding);
      expect(french).toContain('francesa');
      expect(sliding).toContain('corrediza');
    });

    it('should return default alt text for unknown type', () => {
      const altText = getWindowDiagramAltText('unknown' as WindowType);
      expect(altText).toBeDefined();
      expect(typeof altText).toBe('string');
    });
  });

  describe('hasWindowDiagram', () => {
    it('should return true for valid WindowType', () => {
      expect(hasWindowDiagram(WindowType.SLIDING_2_PANEL)).toBe(true);
      expect(hasWindowDiagram(WindowType.FRENCH_4_PANEL)).toBe(true);
      expect(hasWindowDiagram(WindowType.AWNING)).toBe(true);
    });

    it('should return false for unknown type', () => {
      expect(hasWindowDiagram('totally-unknown' as WindowType)).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(hasWindowDiagram(null as unknown as WindowType)).toBe(false);
      expect(hasWindowDiagram(undefined as unknown as WindowType)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(hasWindowDiagram('')).toBe(false);
    });

    it('should return true for WindowType.UNKNOWN (it exists in enum)', () => {
      expect(hasWindowDiagram(WindowType.UNKNOWN)).toBe(true);
    });
  });

  describe('getAllWindowDiagrams', () => {
    it('should return array of all diagrams', () => {
      const allDiagrams = getAllWindowDiagrams();

      expect(Array.isArray(allDiagrams)).toBe(true);
      expect(allDiagrams.length).toBeGreaterThan(0);
    });

    it('should include all WindowType enum values', () => {
      const allDiagrams = getAllWindowDiagrams();
      const allTypes = Object.values(WindowType);

      expect(allDiagrams.length).toBe(allTypes.length);
    });

    it('each diagram should have required properties', () => {
      const allDiagrams = getAllWindowDiagrams();

      allDiagrams.forEach((diagram: WindowDiagram) => {
        expect(diagram).toHaveProperty('type');
        expect(diagram).toHaveProperty('svgPath');
        expect(diagram).toHaveProperty('viewBox');
        expect(diagram).toHaveProperty('aspectRatio');
        expect(diagram).toHaveProperty('altText');
      });
    });
  });

  describe('getWindowDiagramsByCategory', () => {
    it('should return french category diagrams', () => {
      const french = getWindowDiagramsByCategory('french');

      expect(Array.isArray(french)).toBe(true);
      expect(french.length).toBe(2); // FRENCH_2_PANEL, FRENCH_4_PANEL
      expect(french.some((d: WindowDiagram) => d.type === WindowType.FRENCH_2_PANEL)).toBe(true);
      expect(french.some((d: WindowDiagram) => d.type === WindowType.FRENCH_4_PANEL)).toBe(true);
    });

    it('should return sliding category diagrams', () => {
      const sliding = getWindowDiagramsByCategory('sliding');

      expect(sliding.length).toBeGreaterThanOrEqual(3); // At least 2, 3, 4 panel
      expect(sliding.some((d: WindowDiagram) => d.type === WindowType.SLIDING_2_PANEL)).toBe(true);
      expect(sliding.some((d: WindowDiagram) => d.type === WindowType.SLIDING_3_PANEL)).toBe(true);
    });

    it('should return casement category diagrams', () => {
      const casement = getWindowDiagramsByCategory('casement');

      expect(casement.length).toBeGreaterThanOrEqual(2); // At least LEFT, RIGHT
      expect(casement.some((d: WindowDiagram) => d.type === WindowType.CASEMENT_LEFT)).toBe(true);
      expect(casement.some((d: WindowDiagram) => d.type === WindowType.CASEMENT_RIGHT)).toBe(true);
    });

    it('should return fixed category diagrams', () => {
      const fixed = getWindowDiagramsByCategory('fixed');

      expect(fixed.length).toBeGreaterThanOrEqual(1);
      expect(fixed.some((d: WindowDiagram) => d.type === WindowType.FIXED_SINGLE)).toBe(true);
    });

    it('should return projecting category diagrams', () => {
      const projecting = getWindowDiagramsByCategory('projecting');

      expect(projecting.length).toBe(2); // AWNING, HOPPER
      expect(projecting.some((d: WindowDiagram) => d.type === WindowType.AWNING)).toBe(true);
      expect(projecting.some((d: WindowDiagram) => d.type === WindowType.HOPPER)).toBe(true);
    });

    it('should not have overlapping categories', () => {
      const french = getWindowDiagramsByCategory('french');
      const sliding = getWindowDiagramsByCategory('sliding');

      const frenchTypes = french.map((d: WindowDiagram) => d.type);
      const slidingTypes = sliding.map((d: WindowDiagram) => d.type);

      const overlap = frenchTypes.filter((t: WindowType) => slidingTypes.includes(t));
      expect(overlap.length).toBe(0);
    });
  });

  describe('WINDOW_DIAGRAM_MAP constant', () => {
    it('should be a valid object', () => {
      expect(WINDOW_DIAGRAM_MAP).toBeDefined();
      expect(typeof WINDOW_DIAGRAM_MAP).toBe('object');
    });

    it('should have entry for each WindowType', () => {
      const allTypes = Object.values(WindowType);

      allTypes.forEach((type: WindowType) => {
        expect(WINDOW_DIAGRAM_MAP[type]).toBeDefined();
      });
    });

    it('should have consistent viewBox dimensions', () => {
      Object.values(WINDOW_DIAGRAM_MAP).forEach((diagram: WindowDiagram) => {
        expect(diagram.viewBox.width).toBeGreaterThan(0);
        expect(diagram.viewBox.height).toBeGreaterThan(0);
        expect(diagram.aspectRatio).toBe(diagram.viewBox.width / diagram.viewBox.height);
      });
    });

    it('should have SVG paths matching type names', () => {
      Object.entries(WINDOW_DIAGRAM_MAP).forEach(([type, diagram]) => {
        if (type !== WindowType.UNKNOWN) {
          expect((diagram as WindowDiagram).svgPath).toContain(type);
        }
      });
    });
  });

  describe('SVG Path Consistency', () => {
    it('all SVG paths should start with /diagrams/windows/', () => {
      const allDiagrams = getAllWindowDiagrams();

      allDiagrams.forEach((diagram: WindowDiagram) => {
        expect(diagram.svgPath).toMatch(/^\/diagrams\/windows\//);
      });
    });

    it('all SVG paths should end with .svg', () => {
      const allDiagrams = getAllWindowDiagrams();

      allDiagrams.forEach((diagram: WindowDiagram) => {
        expect(diagram.svgPath).toMatch(/\.svg$/);
      });
    });

    it('SVG paths should use kebab-case', () => {
      const allDiagrams = getAllWindowDiagrams();

      allDiagrams.forEach((diagram: WindowDiagram) => {
        const filename = diagram.svgPath.split('/').pop()!.replace('.svg', '');
        expect(filename).toMatch(/^[a-z0-9-]+$/);
      });
    });
  });

  describe('Alt Text Accessibility', () => {
    it('all alt texts should be in Spanish', () => {
      const allDiagrams = getAllWindowDiagrams();

      allDiagrams.forEach((diagram: WindowDiagram) => {
        expect(diagram.altText).toMatch(/ventana|puerta|diagrama|tragaluz/i);
      });
    });

    it('alt texts should be descriptive (>10 characters)', () => {
      const allDiagrams = getAllWindowDiagrams();

      allDiagrams.forEach((diagram: WindowDiagram) => {
        expect(diagram.altText.length).toBeGreaterThan(10);
      });
    });
  });
});

/**
 * Expected test results:
 * ✅ All tests should PASS - utility is already implemented (T006)
 *
 * Coverage: ~100% (all functions, edge cases, data validation)
 */
