import { describe, expect, it } from 'vitest';
import { testServer } from '../integration-setup';

// Regex constants for performance optimization
const MODEL_ID_ERROR_REGEX = /ID del modelo debe ser válido/;
const WIDTH_ERROR_REGEX = /Ancho debe ser mayor a 0/;
const GLASS_TYPE_ID_ERROR_REGEX = /ID del tipo de cristal debe ser válido/;
const SERVICE_ID_ERROR_REGEX = /ID del servicio debe ser válido/;
const UNIT_REGEX = /^(unit|sqm|ml)$/;
const CALCULATION_TIME_LIMIT_MS = 200; // Performance requirement: calculation under 200ms

describe('Contract: quote.calculate-item', () => {
  it('should calculate item price with basic dimensions', async () => {
    // Arrange: Valid input for basic calculation
    const validInput = {
      adjustments: [],
      glassTypeId: 'cm1glass123def456ghi789jkl',
      heightMm: 800,
      modelId: 'cm1model123def456ghi789jkl',
      services: [],
      widthMm: 1000,
    };

    // Act: Call the procedure
    const result = await testServer.quote['calculate-item'](validInput);

    // Assert: Output schema validation
    expect(result).toMatchObject({
      accPrice: expect.any(Number),
      adjustments: expect.any(Array),
      dimPrice: expect.any(Number),
      services: expect.any(Array),
      subtotal: expect.any(Number),
    });

    // Prices should be non-negative
    expect(result.dimPrice).toBeGreaterThanOrEqual(0);
    expect(result.accPrice).toBeGreaterThanOrEqual(0);
    expect(result.subtotal).toBeGreaterThanOrEqual(0);

    // Subtotal should be sum of dimPrice + accPrice + services + adjustments
    const servicesTotal = result.services.reduce((sum, service) => sum + service.amount, 0);
    const adjustmentsTotal = result.adjustments.reduce((sum, adj) => sum + adj.amount, 0);
    const expectedSubtotal = result.dimPrice + result.accPrice + servicesTotal + adjustmentsTotal;

    expect(result.subtotal).toBeCloseTo(expectedSubtotal, 2);
  });

  it('should calculate item price with services', async () => {
    // Arrange: Input with services
    const inputWithServices = {
      adjustments: [],
      glassTypeId: 'cm1glass123def456ghi789jkl',
      heightMm: 1000,
      modelId: 'cm1model123def456ghi789jkl',
      services: [
        {
          quantity: 2,
          serviceId: 'cm1service123def456ghi789',
        },
      ],
      widthMm: 1200,
    };

    // Act: Call the procedure
    const result = await testServer.quote['calculate-item'](inputWithServices);

    // Assert: Services should be included in output
    expect(result.services).toHaveLength(1);
    expect(result.services[0]).toMatchObject({
      amount: expect.any(Number),
      quantity: expect.any(Number),
      unit: expect.stringMatching(UNIT_REGEX),
    });
  });

  it('should calculate item price with adjustments', async () => {
    // Arrange: Input with adjustments
    const inputWithAdjustments = {
      adjustments: [
        {
          concept: 'Descuento especial',
          sign: 'negative' as const,
          unit: 'unit' as const,
          value: 50,
        },
      ],
      glassTypeId: 'cm1glass123def456ghi789jkl',
      heightMm: 600,
      modelId: 'cm1model123def456ghi789jkl',
      services: [],
      widthMm: 800,
    };

    // Act: Call the procedure
    const result = await testServer.quote['calculate-item'](inputWithAdjustments);

    // Assert: Adjustments should be included in output
    expect(result.adjustments).toHaveLength(1);
    expect(result.adjustments[0]).toMatchObject({
      amount: expect.any(Number),
      concept: 'Descuento especial',
    });
  });

  it('should validate input schema - invalid modelId', async () => {
    // Arrange: Invalid model ID
    const invalidInput = {
      adjustments: [],
      glassTypeId: 'cm1glass123def456ghi789jkl',
      heightMm: 800,
      modelId: 'invalid-id', // Not a valid CUID
      services: [],
      widthMm: 1000,
    };

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.quote['calculate-item'](invalidInput);
    }).rejects.toThrow(MODEL_ID_ERROR_REGEX);
  });

  it('should validate input schema - invalid dimensions', async () => {
    // Arrange: Invalid dimensions (zero/negative)
    const invalidInput = {
      adjustments: [],
      glassTypeId: 'cm1glass123def456ghi789jkl',
      heightMm: 800,
      modelId: 'cm1model123def456ghi789jkl',
      services: [],
      widthMm: 0, // Invalid: must be > 0
    };

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.quote['calculate-item'](invalidInput);
    }).rejects.toThrow(WIDTH_ERROR_REGEX);
  });

  it('should validate input schema - invalid glassTypeId', async () => {
    // Arrange: Invalid glass type ID
    const invalidInput = {
      adjustments: [],
      glassTypeId: 'invalid-glass-id', // Not a valid CUID
      heightMm: 800,
      modelId: 'cm1model123def456ghi789jkl',
      services: [],
      widthMm: 1000,
    };

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.quote['calculate-item'](invalidInput);
    }).rejects.toThrow(GLASS_TYPE_ID_ERROR_REGEX);
  });

  it('should validate service input schema', async () => {
    // Arrange: Invalid service ID
    const invalidInput = {
      adjustments: [],
      glassTypeId: 'cm1glass123def456ghi789jkl',
      heightMm: 800,
      modelId: 'cm1model123def456ghi789jkl',
      services: [
        {
          quantity: 1,
          serviceId: 'invalid-service-id', // Not a valid CUID
        },
      ],
      widthMm: 1000,
    };

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.quote['calculate-item'](invalidInput);
    }).rejects.toThrow(SERVICE_ID_ERROR_REGEX);
  });

  it('should validate adjustment input schema', async () => {
    // Arrange: Invalid adjustment unit - using any to bypass TypeScript validation for testing
    const invalidInput = {
      adjustments: [
        {
          concept: 'Test adjustment',
          sign: 'positive' as const,
          unit: 'invalid-unit' as any, // Invalid unit - using any to bypass TS for testing
          value: 10,
        },
      ],
      glassTypeId: 'cm1glass123def456ghi789jkl',
      heightMm: 800,
      modelId: 'cm1model123def456ghi789jkl',
      services: [],
      widthMm: 1000,
    };

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.quote['calculate-item'](invalidInput);
    }).rejects.toThrow();
  });

  it('should handle performance requirement - calculation under 200ms', async () => {
    // Arrange: Complex calculation input
    const complexInput = {
      adjustments: [
        {
          concept: 'Descuento',
          sign: 'negative' as const,
          unit: 'unit' as const,
          value: 100,
        },
        {
          concept: 'Recargo',
          sign: 'positive' as const,
          unit: 'sqm' as const,
          value: 50,
        },
      ],
      glassTypeId: 'cm1glass123def456ghi789jkl',
      heightMm: 1500,
      modelId: 'cm1model123def456ghi789jkl',
      services: [
        { quantity: 3, serviceId: 'cm1service1def456ghi789' },
        { quantity: 1, serviceId: 'cm1service2def456ghi789' },
      ],
      widthMm: 2000,
    };

    // Act: Measure calculation time
    const startTime = Date.now();
    const result = await testServer.quote['calculate-item'](complexInput);
    const endTime = Date.now();

    const calculationTime = endTime - startTime;

    // Assert: Should complete under 200ms (performance requirement)
    expect(calculationTime).toBeLessThan(CALCULATION_TIME_LIMIT_MS);
    expect(result).toMatchObject({
      accPrice: expect.any(Number),
      adjustments: expect.any(Array),
      dimPrice: expect.any(Number),
      services: expect.any(Array),
      subtotal: expect.any(Number),
    });
  });
});
