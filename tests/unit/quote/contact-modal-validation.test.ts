/**
 * Unit Tests: Contact Info Modal Validation (User Story 2)
 *
 * Tests form validation logic for contact information modal.
 * Validates required fields, phone regex, email format, and submission behavior.
 *
 * @module tests/unit/quote/contact-modal-validation.test
 */

import { describe, expect, it } from 'vitest';
import { z } from 'zod';

/**
 * Contact schema (matching ContactInfoModal implementation)
 */
const contactSchema = z.object({
  contactEmail: z.string().email('Correo electrónico inválido').optional().or(z.literal('')),
  contactPhone: z
    .string()
    .min(1, 'El teléfono es requerido')
    .regex(/^\+?[1-9]\d{9,14}$/, 'Formato de teléfono inválido. Ejemplo: +573001234567 o +12125551234'),
});

describe('ContactInfoModal - Validation Logic', () => {
  describe('Phone validation', () => {
    it('should accept valid Colombian phone number', () => {
      const result = contactSchema.safeParse({
        contactEmail: '',
        contactPhone: '+573001234567',
      });

      expect(result.success).toBe(true);
    });

    it('should accept valid US phone number', () => {
      const result = contactSchema.safeParse({
        contactEmail: '',
        contactPhone: '+12125551234',
      });

      expect(result.success).toBe(true);
    });

    it('should accept phone without + prefix', () => {
      const result = contactSchema.safeParse({
        contactEmail: '',
        contactPhone: '573001234567',
      });

      expect(result.success).toBe(true);
    });

    it('should reject phone starting with 0', () => {
      const result = contactSchema.safeParse({
        contactEmail: '',
        contactPhone: '03001234567',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('Formato de teléfono inválido');
      }
    });

    it('should reject phone shorter than 10 digits', () => {
      const result = contactSchema.safeParse({
        contactEmail: '',
        contactPhone: '+57300123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('Formato de teléfono inválido');
      }
    });

    it('should reject phone longer than 15 digits', () => {
      const result = contactSchema.safeParse({
        contactEmail: '',
        contactPhone: '+5730012345678901234',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('Formato de teléfono inválido');
      }
    });

    it('should reject empty phone', () => {
      const result = contactSchema.safeParse({
        contactEmail: '',
        contactPhone: '',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('El teléfono es requerido');
      }
    });

    it('should reject phone with letters', () => {
      const result = contactSchema.safeParse({
        contactEmail: '',
        contactPhone: '+57300ABC1234',
      });

      expect(result.success).toBe(false);
    });

    it('should reject phone with special characters', () => {
      const result = contactSchema.safeParse({
        contactEmail: '',
        contactPhone: '+57-300-123-4567',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Email validation', () => {
    it('should accept valid email', () => {
      const result = contactSchema.safeParse({
        contactEmail: 'test@example.com',
        contactPhone: '+573001234567',
      });

      expect(result.success).toBe(true);
    });

    it('should accept empty email (optional)', () => {
      const result = contactSchema.safeParse({
        contactEmail: '',
        contactPhone: '+573001234567',
      });

      expect(result.success).toBe(true);
    });

    it('should accept undefined email (optional)', () => {
      const result = contactSchema.safeParse({
        contactPhone: '+573001234567',
      });

      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const result = contactSchema.safeParse({
        contactEmail: 'invalid-email',
        contactPhone: '+573001234567',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('Correo electrónico inválido');
      }
    });

    it('should reject email without domain', () => {
      const result = contactSchema.safeParse({
        contactEmail: 'test@',
        contactPhone: '+573001234567',
      });

      expect(result.success).toBe(false);
    });

    it('should reject email without @', () => {
      const result = contactSchema.safeParse({
        contactEmail: 'testexample.com',
        contactPhone: '+573001234567',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Form submission', () => {
    it('should validate both phone and email together', () => {
      const result = contactSchema.safeParse({
        contactEmail: 'test@example.com',
        contactPhone: '+573001234567',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.contactPhone).toBe('+573001234567');
        expect(result.data.contactEmail).toBe('test@example.com');
      }
    });

    it('should return parsed data on successful validation', () => {
      const input = {
        contactEmail: 'john@example.com',
        contactPhone: '+12125551234',
      };

      const result = contactSchema.parse(input);

      expect(result).toEqual({
        contactEmail: 'john@example.com',
        contactPhone: '+12125551234',
      });
    });

    it('should handle whitespace in phone', () => {
      const result = contactSchema.safeParse({
        contactEmail: '',
        contactPhone: ' +573001234567 ',
      });

      // Schema doesn't trim, so should fail with spaces
      expect(result.success).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle null values gracefully', () => {
      const result = contactSchema.safeParse({
        contactEmail: null,
        contactPhone: null,
      });

      expect(result.success).toBe(false);
    });

    it('should handle undefined contactPhone', () => {
      const result = contactSchema.safeParse({
        contactEmail: 'test@example.com',
      });

      expect(result.success).toBe(false);
    });

    it('should accept international phone formats', () => {
      const phones = [
        '+442071234567', // UK
        '+861234567890', // China
        '+81901234567', // Japan
        '+330123456789', // France
      ];

      for (const phone of phones) {
        const result = contactSchema.safeParse({
          contactEmail: '',
          contactPhone: phone,
        });
        expect(result.success).toBe(true);
      }
    });
  });
});
