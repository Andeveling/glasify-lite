/**
 * Contract Tests: Cart Actions
 *
 * Tests Zod schema validation for cart Server Actions.
 * These tests verify input/output contracts without executing actual business logic.
 *
 * @see src/server/api/routers/cart/cart.schemas.ts
 */

import { describe, expect, it } from 'vitest';
import {
  type AddToCartInput,
  addToCartInput,
  type CartActionResponse,
  type ClearCartInput,
  cartActionResponse,
  cartItemSchema,
  clearCartInput,
  type RemoveFromCartInput,
  removeFromCartInput,
  type UpdateCartItemInput,
  updateCartItemInput,
} from '../../../src/server/api/routers/cart/cart.schemas';

describe('Cart Actions Contract Tests', () => {
  describe('addToCartInput schema', () => {
    it('should validate valid input', () => {
      const validInput: AddToCartInput = {
        additionalServiceIds: [],
        glassTypeId: 'clx1234567890abcdefghi',
        glassTypeName: 'Templado 6mm',
        heightMm: 1500,
        modelId: 'clx0987654321zyxwvutsr',
        modelName: 'VEKA Premium',
        quantity: 2,
        widthMm: 1200,
      };

      const result = addToCartInput.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should apply default quantity of 1', () => {
      const inputWithoutQuantity = {
        additionalServiceIds: [],
        glassTypeId: 'clx1234567890abcdefghi',
        glassTypeName: 'Templado 6mm',
        heightMm: 1500,
        modelId: 'clx0987654321zyxwvutsr',
        modelName: 'VEKA Premium',
        widthMm: 1200,
      };

      const result = addToCartInput.safeParse(inputWithoutQuantity);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.quantity).toBe(1);
      }
    });

    it('should validate with optional solution fields', () => {
      const inputWithSolution = {
        additionalServiceIds: [],
        glassTypeId: 'clx1234567890abcdefghi',
        glassTypeName: 'Templado 6mm',
        heightMm: 1500,
        modelId: 'clx0987654321zyxwvutsr',
        modelName: 'VEKA Premium',
        quantity: 1,
        solutionId: 'clxsolution123456789',
        solutionName: 'Doble Vidriado Hermético',
        widthMm: 1200,
      };

      const result = addToCartInput.safeParse(inputWithSolution);
      expect(result.success).toBe(true);
    });

    it('should reject invalid cuid for modelId', () => {
      const invalidInput = {
        additionalServiceIds: [],
        glassTypeId: 'clx1234567890abcdefghi',
        glassTypeName: 'Templado 6mm',
        heightMm: 1500,
        modelId: 'invalid-id',
        modelName: 'VEKA Premium',
        quantity: 1,
        widthMm: 1200,
      };

      const result = addToCartInput.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('ID del modelo debe ser válido');
      }
    });

    it('should reject negative dimensions', () => {
      const invalidInput = {
        additionalServiceIds: [],
        glassTypeId: 'clx1234567890abcdefghi',
        glassTypeName: 'Templado 6mm',
        heightMm: -100,
        modelId: 'clx0987654321zyxwvutsr',
        modelName: 'VEKA Premium',
        quantity: 1,
        widthMm: 1200,
      };

      const result = addToCartInput.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('Alto debe ser positivo');
      }
    });

    it('should reject zero or negative quantity', () => {
      const invalidInput = {
        additionalServiceIds: [],
        glassTypeId: 'clx1234567890abcdefghi',
        glassTypeName: 'Templado 6mm',
        heightMm: 1500,
        modelId: 'clx0987654321zyxwvutsr',
        modelName: 'VEKA Premium',
        quantity: 0,
        widthMm: 1200,
      };

      const result = addToCartInput.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('updateCartItemInput schema', () => {
    it('should validate update with name only', () => {
      const validInput: UpdateCartItemInput = {
        itemId: 'clxitem123456789abcdef',
        name: 'Custom Window Name',
      };

      const result = updateCartItemInput.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate update with quantity only', () => {
      const validInput: UpdateCartItemInput = {
        itemId: 'clxitem123456789abcdef',
        quantity: 5,
      };

      const result = updateCartItemInput.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate update with both name and quantity', () => {
      const validInput: UpdateCartItemInput = {
        itemId: 'clxitem123456789abcdef',
        name: 'Updated Name',
        quantity: 3,
      };

      const result = updateCartItemInput.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject empty update (no name or quantity)', () => {
      const invalidInput = {
        itemId: 'clxitem123456789abcdef',
      };

      const result = updateCartItemInput.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('Debe proporcionar nombre o cantidad');
      }
    });

    it('should reject name exceeding max length', () => {
      const invalidInput = {
        itemId: 'clxitem123456789abcdef',
        name: 'A'.repeat(60), // > 50 characters
      };

      const result = updateCartItemInput.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('Nombre muy largo');
      }
    });
  });

  describe('removeFromCartInput schema', () => {
    it('should validate valid item removal', () => {
      const validInput: RemoveFromCartInput = {
        itemId: 'clxitem123456789abcdef',
      };

      const result = removeFromCartInput.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject invalid cuid', () => {
      const invalidInput = {
        itemId: 'invalid-id',
      };

      const result = removeFromCartInput.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('clearCartInput schema', () => {
    it('should validate when confirm is true', () => {
      const validInput: ClearCartInput = {
        confirm: true,
      };

      const result = clearCartInput.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject when confirm is false', () => {
      const invalidInput = {
        confirm: false,
      };

      const result = clearCartInput.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        // Zod's z.literal() produces a generic "expected true" message
        expect(result.error.issues[0]?.message).toBeTruthy();
      }
    });
  });

  describe('cartItemSchema (output)', () => {
    it('should validate complete cart item', () => {
      const validItem = {
        additionalServiceIds: ['clxservice1', 'clxservice2'],
        createdAt: new Date().toISOString(),
        glassTypeId: 'clx1234567890abcdefghi',
        glassTypeName: 'Templado 6mm',
        heightMm: 1500,
        id: 'clxitem123456789abcdef',
        modelId: 'clx0987654321zyxwvutsr',
        modelName: 'VEKA Premium',
        name: 'VEKA-001',
        quantity: 2,
        subtotal: 200_000,
        unitPrice: 100_000,
        widthMm: 1200,
      };

      const result = cartItemSchema.safeParse(validItem);
      expect(result.success).toBe(true);
    });

    it('should validate cart item with optional solution', () => {
      const validItem = {
        additionalServiceIds: [],
        createdAt: new Date().toISOString(),
        glassTypeId: 'clx1234567890abcdefghi',
        glassTypeName: 'Templado 6mm',
        heightMm: 1500,
        id: 'clxitem123456789abcdef',
        modelId: 'clx0987654321zyxwvutsr',
        modelName: 'VEKA Premium',
        name: 'VEKA-001',
        quantity: 1,
        solutionId: 'clxsolution123456789',
        solutionName: 'Doble Vidriado Hermético',
        subtotal: 150_000,
        unitPrice: 150_000,
        widthMm: 1200,
      };

      const result = cartItemSchema.safeParse(validItem);
      expect(result.success).toBe(true);
    });
  });

  describe('cartActionResponse (discriminated union)', () => {
    it('should validate success response', () => {
      const successResponse: CartActionResponse = {
        data: {
          item: {
            additionalServiceIds: [],
            createdAt: new Date().toISOString(),
            glassTypeId: 'clx1234567890abcdefghi',
            glassTypeName: 'Templado 6mm',
            heightMm: 1500,
            id: 'clxitem123456789abcdef',
            modelId: 'clx0987654321zyxwvutsr',
            modelName: 'VEKA Premium',
            name: 'VEKA-001',
            quantity: 1,
            subtotal: 100_000,
            unitPrice: 100_000,
            widthMm: 1200,
          },
          itemCount: 1,
          total: 100_000,
        },
        success: true,
      };

      const result = cartActionResponse.safeParse(successResponse);
      expect(result.success).toBe(true);
    });

    it('should validate error response', () => {
      const errorResponse: CartActionResponse = {
        error: {
          code: 'LIMIT_EXCEEDED',
          message: 'No puedes agregar más de 20 items al carrito',
        },
        success: false,
      };

      const result = cartActionResponse.safeParse(errorResponse);
      expect(result.success).toBe(true);
    });

    it('should reject invalid error code', () => {
      const invalidResponse = {
        error: {
          code: 'INVALID_CODE',
          message: 'Some error',
        },
        success: false,
      };

      const result = cartActionResponse.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });
  });
});
