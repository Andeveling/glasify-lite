import { describe, expect, it } from "vitest";
import { testServer } from "../integration-setup";

describe("Contract: quote.calculate-item", () => {
  it("should calculate item price with basic dimensions", async () => {
    // Arrange: Valid input for basic calculation
    const validInput = {
      modelId: "cm1model123def456ghi789jkl",
      widthMm: 1000,
      heightMm: 800,
      glassTypeId: "cm1glass123def456ghi789jkl",
      services: [],
      adjustments: [],
    };

    // Act: Call the procedure
    const result = await testServer.quote["calculate-item"](validInput);

    // Assert: Output schema validation
    expect(result).toMatchObject({
      dimPrice: expect.any(Number),
      accPrice: expect.any(Number),
      services: expect.any(Array),
      adjustments: expect.any(Array),
      subtotal: expect.any(Number),
    });

    // Prices should be non-negative
    expect(result.dimPrice).toBeGreaterThanOrEqual(0);
    expect(result.accPrice).toBeGreaterThanOrEqual(0);
    expect(result.subtotal).toBeGreaterThanOrEqual(0);

    // Subtotal should be sum of dimPrice + accPrice + services + adjustments
    const servicesTotal = result.services.reduce(
      (sum, service) => sum + service.amount,
      0
    );
    const adjustmentsTotal = result.adjustments.reduce(
      (sum, adj) => sum + adj.amount,
      0
    );
    const expectedSubtotal =
      result.dimPrice + result.accPrice + servicesTotal + adjustmentsTotal;

    expect(result.subtotal).toBeCloseTo(expectedSubtotal, 2);
  });

  it("should calculate item price with services", async () => {
    // Arrange: Input with services
    const inputWithServices = {
      modelId: "cm1model123def456ghi789jkl",
      widthMm: 1200,
      heightMm: 1000,
      glassTypeId: "cm1glass123def456ghi789jkl",
      services: [
        {
          serviceId: "cm1service123def456ghi789",
          quantity: 2,
        },
      ],
      adjustments: [],
    };

    // Act: Call the procedure
    const result = await testServer.quote["calculate-item"](inputWithServices);

    // Assert: Services should be included in output
    expect(result.services).toHaveLength(1);
    expect(result.services[0]).toMatchObject({
      serviceId: expect.any(String),
      unit: expect.stringMatching(/^(unit|sqm|ml)$/),
      quantity: expect.any(Number),
      amount: expect.any(Number),
    });
  });

  it("should calculate item price with adjustments", async () => {
    // Arrange: Input with adjustments
    const inputWithAdjustments = {
      modelId: "cm1model123def456ghi789jkl",
      widthMm: 800,
      heightMm: 600,
      glassTypeId: "cm1glass123def456ghi789jkl",
      services: [],
      adjustments: [
        {
          concept: "Descuento especial",
          unit: "unit" as const,
          sign: "negative" as const,
          value: 50,
        },
      ],
    };

    // Act: Call the procedure
    const result =
      await testServer.quote["calculate-item"](inputWithAdjustments);

    // Assert: Adjustments should be included in output
    expect(result.adjustments).toHaveLength(1);
    expect(result.adjustments[0]).toMatchObject({
      concept: "Descuento especial",
      amount: expect.any(Number),
    });
  });

  it("should validate input schema - invalid modelId", async () => {
    // Arrange: Invalid model ID
    const invalidInput = {
      modelId: "invalid-id", // Not a valid CUID
      widthMm: 1000,
      heightMm: 800,
      glassTypeId: "cm1glass123def456ghi789jkl",
      services: [],
      adjustments: [],
    };

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.quote["calculate-item"](invalidInput);
    }).rejects.toThrow(/ID del modelo debe ser válido/);
  });

  it("should validate input schema - invalid dimensions", async () => {
    // Arrange: Invalid dimensions (zero/negative)
    const invalidInput = {
      modelId: "cm1model123def456ghi789jkl",
      widthMm: 0, // Invalid: must be > 0
      heightMm: 800,
      glassTypeId: "cm1glass123def456ghi789jkl",
      services: [],
      adjustments: [],
    };

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.quote["calculate-item"](invalidInput);
    }).rejects.toThrow(/Ancho debe ser mayor a 0/);
  });

  it("should validate input schema - invalid glassTypeId", async () => {
    // Arrange: Invalid glass type ID
    const invalidInput = {
      modelId: "cm1model123def456ghi789jkl",
      widthMm: 1000,
      heightMm: 800,
      glassTypeId: "invalid-glass-id", // Not a valid CUID
      services: [],
      adjustments: [],
    };

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.quote["calculate-item"](invalidInput);
    }).rejects.toThrow(/ID del tipo de vidrio debe ser válido/);
  });

  it("should validate service input schema", async () => {
    // Arrange: Invalid service ID
    const invalidInput = {
      modelId: "cm1model123def456ghi789jkl",
      widthMm: 1000,
      heightMm: 800,
      glassTypeId: "cm1glass123def456ghi789jkl",
      services: [
        {
          serviceId: "invalid-service-id", // Not a valid CUID
          quantity: 1,
        },
      ],
      adjustments: [],
    };

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.quote["calculate-item"](invalidInput);
    }).rejects.toThrow(/ID del servicio debe ser válido/);
  });

  it("should validate adjustment input schema", async () => {
    // Arrange: Invalid adjustment unit - using any to bypass TypeScript validation for testing
    const invalidInput = {
      modelId: "cm1model123def456ghi789jkl",
      widthMm: 1000,
      heightMm: 800,
      glassTypeId: "cm1glass123def456ghi789jkl",
      services: [],
      adjustments: [
        {
          concept: "Test adjustment",
          unit: "invalid-unit" as any, // Invalid unit - using any to bypass TS for testing
          sign: "positive" as const,
          value: 10,
        },
      ],
    };

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.quote["calculate-item"](invalidInput);
    }).rejects.toThrow();
  });

  it("should handle performance requirement - calculation under 200ms", async () => {
    // Arrange: Complex calculation input
    const complexInput = {
      modelId: "cm1model123def456ghi789jkl",
      widthMm: 2000,
      heightMm: 1500,
      glassTypeId: "cm1glass123def456ghi789jkl",
      services: [
        { serviceId: "cm1service1def456ghi789", quantity: 3 },
        { serviceId: "cm1service2def456ghi789", quantity: 1 },
      ],
      adjustments: [
        {
          concept: "Descuento",
          unit: "unit" as const,
          sign: "negative" as const,
          value: 100,
        },
        {
          concept: "Recargo",
          unit: "sqm" as const,
          sign: "positive" as const,
          value: 50,
        },
      ],
    };

    // Act: Measure calculation time
    const startTime = Date.now();
    const result = await testServer.quote["calculate-item"](complexInput);
    const endTime = Date.now();

    const calculationTime = endTime - startTime;

    // Assert: Should complete under 200ms (performance requirement)
    expect(calculationTime).toBeLessThan(200);
    expect(result).toMatchObject({
      dimPrice: expect.any(Number),
      accPrice: expect.any(Number),
      services: expect.any(Array),
      adjustments: expect.any(Array),
      subtotal: expect.any(Number),
    });
  });
});
