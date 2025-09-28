import { Decimal } from '@prisma/client/runtime/library';
import { describe, expect, it } from 'vitest';
import type { PriceItemCalculationInput } from '@/server/price/price-item';
import { calculatePriceItem } from '@/server/price/price-item';

describe('Unit Tests: Price Item Calculation', () => {
  describe('Basic Price Calculation', () => {
    it('should calculate basic dimension price correctly', () => {
      // Arrange
      const input: PriceItemCalculationInput = {
        heightMm: 800,
        model: {
          basePrice: 100_000,
          costPerMmHeight: 40,
          costPerMmWidth: 50,
        },
        widthMm: 1000,
      };

      // Act
      const result = calculatePriceItem(input);

      // Assert
      // Expected: basePrice + (widthMm * costPerMmWidth) + (heightMm * costPerMmHeight)
      // Expected: 100000 + (1000 * 50) + (800 * 40) = 100000 + 50000 + 32000 = 182000
      expect(result.dimPrice).toBe(182_000);
      expect(result.accPrice).toBe(0); // No accessory
      expect(result.services).toHaveLength(0);
      expect(result.adjustments).toHaveLength(0);
      expect(result.subtotal).toBe(182_000);
    });

    it('should handle accessory price when included', () => {
      // Arrange
      const input: PriceItemCalculationInput = {
        heightMm: 800,
        includeAccessory: true,
        model: {
          accessoryPrice: 25_000,
          basePrice: 100_000,
          costPerMmHeight: 40,
          costPerMmWidth: 50,
        },
        widthMm: 1000,
      };

      // Act
      const result = calculatePriceItem(input);

      // Assert
      expect(result.dimPrice).toBe(182_000); // Same as previous test
      expect(result.accPrice).toBe(25_000); // Accessory included
      expect(result.subtotal).toBe(207_000); // 182000 + 25000
    });

    it('should ignore accessory price when not included', () => {
      // Arrange
      const input: PriceItemCalculationInput = {
        heightMm: 800,
        includeAccessory: false,
        model: {
          accessoryPrice: 25_000,
          basePrice: 100_000,
          costPerMmHeight: 40,
          costPerMmWidth: 50,
        },
        widthMm: 1000,
      };

      // Act
      const result = calculatePriceItem(input);

      // Assert
      expect(result.accPrice).toBe(0); // Accessory not included
      expect(result.subtotal).toBe(182_000); // Only dimension price
    });

    it('should handle null accessory price', () => {
      // Arrange
      const input: PriceItemCalculationInput = {
        heightMm: 800,
        includeAccessory: true,
        model: {
          accessoryPrice: null,
          basePrice: 100_000,
          costPerMmHeight: 40,
          costPerMmWidth: 50,
        },
        widthMm: 1000,
      };

      // Act
      const result = calculatePriceItem(input);

      // Assert
      expect(result.accPrice).toBe(0); // Null accessory treated as 0
      expect(result.subtotal).toBe(182_000);
    });
  });

  describe('Service Calculations', () => {
    it('should calculate unit-based service correctly', () => {
      // Arrange
      const input: PriceItemCalculationInput = {
        heightMm: 800,
        model: {
          basePrice: 100_000,
          costPerMmHeight: 40,
          costPerMmWidth: 50,
        },
        services: [
          {
            rate: 15_000,
            serviceId: 'service1',
            type: 'fixed',
            unit: 'unit',
          },
        ],
        widthMm: 1000,
      };

      // Act
      const result = calculatePriceItem(input);

      // Assert
      expect(result.services).toHaveLength(1);
      expect(result.services[0]).toEqual({
        amount: 15_000, // 1 * 15000
        quantity: 1, // Unit services have quantity of 1
        serviceId: 'service1',
        unit: 'unit',
      });
      expect(result.subtotal).toBe(197_000); // 182000 + 15000
    });

    it('should calculate sqm-based service correctly', () => {
      // Arrange
      const input: PriceItemCalculationInput = {
        heightMm: 1000, // 1 meter
        model: {
          basePrice: 100_000,
          costPerMmHeight: 40,
          costPerMmWidth: 50,
        },
        services: [
          {
            rate: 20_000, // per square meter
            serviceId: 'service1',
            type: 'area',
            unit: 'sqm',
          },
        ],
        widthMm: 2000, // 2 meters
      };

      // Act
      const result = calculatePriceItem(input);

      // Assert
      expect(result.services[0]).toEqual({
        amount: 40_000, // 2 * 20000
        quantity: 2.0, // 2m * 1m = 2 sqm
        serviceId: 'service1',
        unit: 'sqm',
      });
    });

    it('should calculate ml-based service correctly', () => {
      // Arrange
      const input: PriceItemCalculationInput = {
        heightMm: 500, // 0.5 meters
        model: {
          basePrice: 100_000,
          costPerMmHeight: 40,
          costPerMmWidth: 50,
        },
        services: [
          {
            rate: 5000, // per meter of perimeter
            serviceId: 'service1',
            type: 'perimeter',
            unit: 'ml',
          },
        ],
        widthMm: 1000, // 1 meter
      };

      // Act
      const result = calculatePriceItem(input);

      // Assert
      // Perimeter = 2 * (width + height) = 2 * (1 + 0.5) = 3 meters
      expect(result.services[0]).toEqual({
        amount: 15_000, // 3 * 5000
        quantity: 3.0,
        serviceId: 'service1',
        unit: 'ml',
      });
    });

    it('should handle fixed service with quantity override', () => {
      // Arrange
      const input: PriceItemCalculationInput = {
        heightMm: 800,
        model: {
          basePrice: 100_000,
          costPerMmHeight: 40,
          costPerMmWidth: 50,
        },
        services: [
          {
            quantityOverride: 3, // Fixed quantity
            rate: 12_000,
            serviceId: 'service1',
            type: 'fixed',
            unit: 'unit',
          },
        ],
        widthMm: 1000,
      };

      // Act
      const result = calculatePriceItem(input);

      // Assert
      expect(result.services[0]).toEqual({
        amount: 36_000, // 3 * 12000
        quantity: 3, // Overridden quantity
        serviceId: 'service1',
        unit: 'unit',
      });
    });

    it('should handle multiple services', () => {
      // Arrange
      const input: PriceItemCalculationInput = {
        heightMm: 1000,
        model: {
          basePrice: 100_000,
          costPerMmHeight: 40,
          costPerMmWidth: 50,
        },
        services: [
          {
            rate: 10_000,
            serviceId: 'service1',
            type: 'fixed',
            unit: 'unit',
          },
          {
            rate: 15_000,
            serviceId: 'service2',
            type: 'area',
            unit: 'sqm',
          },
        ],
        widthMm: 1000,
      };

      // Act
      const result = calculatePriceItem(input);

      // Assert
      expect(result.services).toHaveLength(2);
      expect(result.services[0]?.amount).toBe(10_000); // 1 unit * 10000
      expect(result.services[1]?.amount).toBe(15_000); // 1 sqm * 15000

      const expectedSubtotal = 190_000 + 10_000 + 15_000; // dimPrice + services
      expect(result.subtotal).toBe(expectedSubtotal);
    });
  });

  describe('Adjustment Calculations', () => {
    it('should apply positive unit adjustment correctly', () => {
      // Arrange
      const input: PriceItemCalculationInput = {
        adjustments: [
          {
            concept: 'Recargo especial',
            sign: 'positive',
            unit: 'unit',
            value: 25_000,
          },
        ],
        heightMm: 800,
        model: {
          basePrice: 100_000,
          costPerMmHeight: 40,
          costPerMmWidth: 50,
        },
        widthMm: 1000,
      };

      // Act
      const result = calculatePriceItem(input);

      // Assert
      expect(result.adjustments).toHaveLength(1);
      expect(result.adjustments[0]).toEqual({
        amount: 25_000, // Positive adjustment
        concept: 'Recargo especial',
      });
      expect(result.subtotal).toBe(207_000); // 182000 + 25000
    });

    it('should apply negative unit adjustment correctly', () => {
      // Arrange
      const input: PriceItemCalculationInput = {
        adjustments: [
          {
            concept: 'Descuento cliente frecuente',
            sign: 'negative',
            unit: 'unit',
            value: 20_000,
          },
        ],
        heightMm: 800,
        model: {
          basePrice: 100_000,
          costPerMmHeight: 40,
          costPerMmWidth: 50,
        },
        widthMm: 1000,
      };

      // Act
      const result = calculatePriceItem(input);

      // Assert
      expect(result.adjustments[0]).toEqual({
        amount: -20_000, // Negative adjustment
        concept: 'Descuento cliente frecuente',
      });
      expect(result.subtotal).toBe(162_000); // 182000 - 20000
    });

    it('should apply sqm-based adjustment correctly', () => {
      // Arrange
      const input: PriceItemCalculationInput = {
        adjustments: [
          {
            concept: 'Descuento por m²',
            sign: 'negative',
            unit: 'sqm',
            value: 5000, // Per square meter
          },
        ],
        heightMm: 1500, // 1.5 meters
        model: {
          basePrice: 100_000,
          costPerMmHeight: 40,
          costPerMmWidth: 50,
        },
        widthMm: 2000, // 2 meters
      };

      // Act
      const result = calculatePriceItem(input);

      // Assert
      // Area = 2m * 1.5m = 3 sqm
      expect(result.adjustments[0]).toEqual({
        amount: -15_000, // 3 sqm * 5000 * -1
        concept: 'Descuento por m²',
      });
    });

    it('should apply ml-based adjustment correctly', () => {
      // Arrange
      const input: PriceItemCalculationInput = {
        adjustments: [
          {
            concept: 'Recargo por perímetro',
            sign: 'positive',
            unit: 'ml',
            value: 2000, // Per meter of perimeter
          },
        ],
        heightMm: 1000, // 1 meter
        model: {
          basePrice: 100_000,
          costPerMmHeight: 40,
          costPerMmWidth: 50,
        },
        widthMm: 1000, // 1 meter
      };

      // Act
      const result = calculatePriceItem(input);

      // Assert
      // Perimeter = 2 * (1 + 1) = 4 meters
      expect(result.adjustments[0]).toEqual({
        amount: 8000, // 4 ml * 2000
        concept: 'Recargo por perímetro',
      });
    });

    it('should handle multiple adjustments', () => {
      // Arrange
      const input: PriceItemCalculationInput = {
        adjustments: [
          {
            concept: 'Descuento cliente',
            sign: 'negative',
            unit: 'unit',
            value: 10_000,
          },
          {
            concept: 'Recargo urgencia',
            sign: 'positive',
            unit: 'unit',
            value: 15_000,
          },
        ],
        heightMm: 1000,
        model: {
          basePrice: 100_000,
          costPerMmHeight: 40,
          costPerMmWidth: 50,
        },
        widthMm: 1000,
      };

      // Act
      const result = calculatePriceItem(input);

      // Assert
      expect(result.adjustments).toHaveLength(2);
      expect(result.adjustments[0]?.amount).toBe(-10_000);
      expect(result.adjustments[1]?.amount).toBe(15_000);

      const expectedSubtotal = 190_000 - 10_000 + 15_000; // dimPrice + adjustments
      expect(result.subtotal).toBe(expectedSubtotal);
    });
  });

  describe('Edge Cases and Input Validation', () => {
    it('should handle zero dimensions', () => {
      // Arrange
      const input: PriceItemCalculationInput = {
        heightMm: 0,
        model: {
          basePrice: 100_000,
          costPerMmHeight: 40,
          costPerMmWidth: 50,
        },
        widthMm: 0,
      };

      // Act
      const result = calculatePriceItem(input);

      // Assert
      // Should treat zero dimensions as positive (ensurePositiveNumber)
      expect(result.dimPrice).toBe(100_000); // Only base price
      expect(result.subtotal).toBe(100_000);
    });

    it('should handle negative dimensions', () => {
      // Arrange
      const input: PriceItemCalculationInput = {
        heightMm: -800,
        model: {
          basePrice: 100_000,
          costPerMmHeight: 40,
          costPerMmWidth: 50,
        },
        widthMm: -1000,
      };

      // Act
      const result = calculatePriceItem(input);

      // Assert
      // Should treat negative dimensions as 0 (ensurePositiveNumber)
      expect(result.dimPrice).toBe(100_000); // Only base price
      expect(result.subtotal).toBe(100_000);
    });

    it('should handle Decimal inputs for prices', () => {
      // Arrange
      const input: PriceItemCalculationInput = {
        heightMm: 800,
        model: {
          basePrice: new Decimal(100_000.5),
          costPerMmHeight: new Decimal(40.75),
          costPerMmWidth: new Decimal(50.25),
        },
        widthMm: 1000,
      };

      // Act
      const result = calculatePriceItem(input);

      // Assert
      // Should handle Decimal precision correctly
      // Expected: 100000.5 + (1000 * 50.25) + (800 * 40.75) = 100000.5 + 50250 + 32600 = 182850.5
      expect(result.dimPrice).toBe(182_850.5);
    });

    it('should round results correctly', () => {
      // Arrange
      const input: PriceItemCalculationInput = {
        heightMm: 333,
        model: {
          basePrice: 100_000,
          costPerMmHeight: new Decimal('33.333'),
          costPerMmWidth: new Decimal('33.333'),
        },
        widthMm: 333, // Will create fractional results
      };

      // Act
      const result = calculatePriceItem(input);

      // Assert
      // Should be properly rounded to 2 decimal places
      // Expected: 100000 + (333 * 33.333) + (333 * 33.333) = 100000 + 11099.889 + 11099.889 = 122199.778
      expect(result.dimPrice).toBeCloseTo(122_199.78, 2);
    });

    it('should handle empty services and adjustments arrays', () => {
      // Arrange
      const input: PriceItemCalculationInput = {
        adjustments: [],
        heightMm: 800,
        model: {
          basePrice: 100_000,
          costPerMmHeight: 40,
          costPerMmWidth: 50,
        },
        services: [],
        widthMm: 1000,
      };

      // Act
      const result = calculatePriceItem(input);

      // Assert
      expect(result.services).toHaveLength(0);
      expect(result.adjustments).toHaveLength(0);
      expect(result.subtotal).toBe(182_000);
    });
  });

  describe('Complex Integration Scenarios', () => {
    it('should calculate complete scenario with all components', () => {
      // Arrange
      const input: PriceItemCalculationInput = {
        adjustments: [
          {
            concept: 'Descuento cliente VIP',
            sign: 'negative',
            unit: 'unit',
            value: 15_000,
          },
          {
            concept: 'Recargo por tamaño',
            sign: 'positive',
            unit: 'sqm',
            value: 8000,
          },
        ],
        heightMm: 1200,
        includeAccessory: true,
        model: {
          accessoryPrice: 30_000,
          basePrice: 120_000,
          costPerMmHeight: 45,
          costPerMmWidth: 60,
        },
        services: [
          {
            rate: 3000,
            serviceId: 'cutting',
            type: 'perimeter',
            unit: 'ml',
          },
          {
            quantityOverride: 2,
            rate: 25_000,
            serviceId: 'polishing',
            type: 'fixed',
            unit: 'unit',
          },
        ],
        widthMm: 1500,
      };

      // Act
      const result = calculatePriceItem(input);

      // Assert
      // Dimension price: 120000 + (1500 * 60) + (1200 * 45) = 120000 + 90000 + 54000 = 264000
      expect(result.dimPrice).toBe(264_000);

      // Accessory price: 30000
      expect(result.accPrice).toBe(30_000);

      // Services:
      // - Cutting (ml): perimeter = 2 * (1.5 + 1.2) = 5.4m * 3000 = 16200
      // - Polishing (fixed): 2 * 25000 = 50000
      expect(result.services).toHaveLength(2);
      expect(result.services[0]?.amount).toBe(16_200);
      expect(result.services[1]?.amount).toBe(50_000);

      // Adjustments:
      // - VIP discount: -15000
      // - Size surcharge: 1.5 * 1.2 = 1.8 sqm * 8000 = 14400
      expect(result.adjustments).toHaveLength(2);
      expect(result.adjustments[0]?.amount).toBe(-15_000);
      expect(result.adjustments[1]?.amount).toBe(14_400);

      // Subtotal: 264000 + 30000 + 16200 + 50000 - 15000 + 14400 = 359600
      expect(result.subtotal).toBe(359_600);
    });

    it('should handle calculation that results in negative subtotal', () => {
      // Arrange
      const input: PriceItemCalculationInput = {
        adjustments: [
          {
            concept: 'Descuento masivo',
            sign: 'negative',
            unit: 'unit',
            value: 20_000, // More than the item cost
          },
        ],
        heightMm: 100,
        model: {
          basePrice: 10_000,
          costPerMmHeight: 1,
          costPerMmWidth: 1,
        },
        widthMm: 100,
      };

      // Act
      const result = calculatePriceItem(input);

      // Assert
      // Dimension price: 10000 + 100 + 100 = 10200
      // Adjustment: -20000
      // Subtotal: 10200 - 20000 = -9800 (negative result is valid)
      expect(result.subtotal).toBe(-9800);
    });
  });
});
