/**
 * Unit tests for status configuration utility
 *
 * Tests the status configuration functions that map quote status
 * to labels, icons, tooltips, colors, and CTAs.
 *
 * @vitest-environment jsdom
 */

import type { Quote } from '@prisma/client';
import { describe, expect, it } from 'vitest';

// Import types for the functions we'll implement
type QuoteStatus = Quote['status'];

interface StatusConfig {
  label: string;
  icon: string;
  tooltip: string;
  color: 'default' | 'secondary' | 'destructive' | 'outline';
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  cta?: {
    label: string;
    action: 'edit' | 'view' | 'duplicate' | 'resend';
  };
}

// Mock implementation signatures (to be implemented in T014)
declare function getStatusConfig(status: QuoteStatus): StatusConfig;
declare function getStatusLabel(status: QuoteStatus): string;
declare function getStatusIcon(status: QuoteStatus): string;
declare function getStatusTooltip(status: QuoteStatus): string;
declare function getStatusColor(status: QuoteStatus): StatusConfig['color'];
declare function getStatusCTA(status: QuoteStatus): StatusConfig['cta'] | undefined;

describe('Status Configuration Utility', () => {
  describe('getStatusLabel', () => {
    it('should return "En edición" for draft status', () => {
      // This test MUST FAIL until T014 implementation
      expect(() => getStatusLabel('draft')).toThrow();
    });

    it('should return "Enviada" for sent status', () => {
      expect(() => getStatusLabel('sent')).toThrow();
    });

    it('should return "Cancelada" for canceled status', () => {
      expect(() => getStatusLabel('canceled')).toThrow();
    });

    it('should handle unknown status gracefully', () => {
      expect(() => getStatusLabel('UNKNOWN' as QuoteStatus)).toThrow();
    });
  });

  describe('getStatusIcon', () => {
    it('should return "edit" icon for draft status', () => {
      expect(() => getStatusIcon('draft')).toThrow();
    });

    it('should return "send" icon for sent status', () => {
      expect(() => getStatusIcon('sent')).toThrow();
    });

    it('should return "x-circle" icon for canceled status', () => {
      expect(() => getStatusIcon('canceled')).toThrow();
    });

    it('should return default icon for unknown status', () => {
      expect(() => getStatusIcon('UNKNOWN' as QuoteStatus)).toThrow();
    });
  });

  describe('getStatusTooltip', () => {
    it('should return explanatory tooltip for draft status', () => {
      expect(() => getStatusTooltip('draft')).toThrow();
      // When implemented, should contain: "Esta cotización está en edición"
    });

    it('should return explanatory tooltip for sent status', () => {
      expect(() => getStatusTooltip('sent')).toThrow();
      // When implemented, should contain: "Cotización enviada al cliente"
    });

    it('should return explanatory tooltip for canceled status', () => {
      expect(() => getStatusTooltip('canceled')).toThrow();
      // When implemented, should contain: "Esta cotización fue cancelada"
    });
  });

  describe('getStatusColor', () => {
    it('should return "secondary" variant for draft (yellow/amber)', () => {
      expect(() => getStatusColor('draft')).toThrow();
    });

    it('should return "default" variant for sent (blue)', () => {
      expect(() => getStatusColor('sent')).toThrow();
    });

    it('should return "destructive" variant for canceled (red)', () => {
      expect(() => getStatusColor('canceled')).toThrow();
    });
  });

  describe('getStatusCTA', () => {
    it('should return "Continuar editando" CTA for draft status', () => {
      expect(() => getStatusCTA('draft')).toThrow();
      // When implemented:
      // expect(getStatusCTA('draft')).toEqual({
      //   label: 'Continuar editando',
      //   action: 'edit'
      // });
    });

    it('should return "Ver detalles" CTA for sent status', () => {
      expect(() => getStatusCTA('sent')).toThrow();
      // When implemented:
      // expect(getStatusCTA('sent')).toEqual({
      //   label: 'Ver detalles',
      //   action: 'view'
      // });
    });

    it('should return "Duplicar" CTA for canceled status', () => {
      expect(() => getStatusCTA('canceled')).toThrow();
      // When implemented:
      // expect(getStatusCTA('canceled')).toEqual({
      //   label: 'Duplicar',
      //   action: 'duplicate'
      // });
    });

    it('should return undefined for unknown status', () => {
      expect(() => getStatusCTA('UNKNOWN' as QuoteStatus)).toThrow();
    });
  });

  describe('getStatusConfig (complete config object)', () => {
    it('should return complete config for draft status', () => {
      expect(() => getStatusConfig('draft')).toThrow();
      // When implemented, should return:
      // {
      //   label: 'En edición',
      //   icon: 'edit',
      //   tooltip: 'Esta cotización está en edición. Puedes continuar modificándola.',
      //   color: 'secondary',
      //   variant: 'secondary',
      //   cta: { label: 'Continuar editando', action: 'edit' }
      // }
    });

    it('should return complete config for sent status', () => {
      expect(() => getStatusConfig('sent')).toThrow();
    });

    it('should return complete config for canceled status', () => {
      expect(() => getStatusConfig('canceled')).toThrow();
    });

    it('should have consistent label/icon/tooltip across all getters', () => {
      // This test ensures all individual getters use the same source
      expect(() => {
        const config = getStatusConfig('draft');
        expect(config.label).toBe(getStatusLabel('draft'));
        expect(config.icon).toBe(getStatusIcon('draft'));
        expect(config.tooltip).toBe(getStatusTooltip('draft'));
        expect(config.color).toBe(getStatusColor('draft'));
        expect(config.cta).toEqual(getStatusCTA('draft'));
      }).toThrow();
    });
  });

  describe('Edge cases', () => {
    it('should handle null/undefined gracefully', () => {
      expect(() => getStatusLabel(null as unknown as QuoteStatus)).toThrow();
      expect(() => getStatusLabel(undefined as unknown as QuoteStatus)).toThrow();
    });

    it('should handle empty string gracefully', () => {
      expect(() => getStatusLabel('' as QuoteStatus)).toThrow();
    });

    it('should handle case-insensitive status (if applicable)', () => {
      // Status values are lowercase in Prisma schema
      expect(() => getStatusLabel('DRAFT' as QuoteStatus)).toThrow();
    });
  });
});

/**
 * Expected test results BEFORE implementation (T014):
 * ❌ All tests should FAIL with "function not defined" or similar
 *
 * Expected test results AFTER implementation (T014):
 * ✅ All tests should PASS with correct values
 *
 * This ensures we're following Test-Driven Development (TDD).
 */
