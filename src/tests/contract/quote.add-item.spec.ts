import { describe, expect, it } from "vitest";
import { testServer } from "../integration-setup";

// Regex constants for performance optimization
const CUID_REGEX = /^c[a-z0-9]{24}$/;
const DIMENSION_ERROR_REGEX =
  /(Ancho|Alto) debe estar entre \d+mm y \d+mm|dimensión|tamaño|límite/i;
const MODEL_ID_ERROR_REGEX = /ID del modelo debe ser válido/;
const HEIGHT_ERROR_REGEX = /Alto debe ser mayor a 0/;
const QUOTE_ID_ERROR_REGEX = /ID de la cotización debe ser válido/;
const GLASS_COMPATIBILITY_ERROR_REGEX = /compatible|vidrio|tipo/i;

describe("Contract: quote.add-item", () => {
  it("should add item to new quote when no quoteId provided", async () => {
    // Arrange: Valid input without quoteId (creates new quote)
    const validInput = {
      adjustments: [],
      glassTypeId: "cm1glass123def456ghi789jkl",
      heightMm: 800,
      modelId: "cm1model123def456ghi789jkl",
      services: [],
      widthMm: 1000,
    };

    // Act: Call the procedure
    const result = await testServer.quote["add-item"](validInput);

    // Assert: Output schema validation
    expect(result).toMatchObject({
      itemId: expect.any(String),
      quoteId: expect.any(String),
      subtotal: expect.any(Number),
    });

    // IDs should be valid CUIDs
    expect(result.quoteId).toMatch(CUID_REGEX);
    expect(result.itemId).toMatch(CUID_REGEX);

    // Subtotal should be non-negative
    expect(result.subtotal).toBeGreaterThanOrEqual(0);
  });

  it("should add item to existing quote when quoteId provided", async () => {
    // Arrange: First create a quote by adding an item
    const firstItemInput = {
      adjustments: [],
      glassTypeId: "cm1glass123def456ghi789jkl",
      heightMm: 600,
      modelId: "cm1model123def456ghi789jkl",
      services: [],
      widthMm: 800,
    };

    const firstResult = await testServer.quote["add-item"](firstItemInput);
    const existingQuoteId = firstResult.quoteId;

    // Now add second item to existing quote
    const secondItemInput = {
      ...firstItemInput,
      heightMm: 1000,
      quoteId: existingQuoteId,
      widthMm: 1200, // Different dimensions
    };

    // Act: Call the procedure for second item
    const result = await testServer.quote["add-item"](secondItemInput);

    // Assert: Should use the same quote ID
    expect(result).toMatchObject({
      itemId: expect.any(String),
      quoteId: existingQuoteId,
      subtotal: expect.any(Number),
    });

    // Item ID should be different from the first one
    expect(result.itemId).not.toBe(firstResult.itemId);
  });

  it("should add item with services and adjustments", async () => {
    // Arrange: Input with services and adjustments
    const complexInput = {
      adjustments: [
        {
          concept: "Descuento cliente frecuente",
          sign: "negative" as const,
          unit: "unit" as const,
          value: 100,
        },
      ],
      glassTypeId: "cm1glass123def456ghi789jkl",
      heightMm: 1200,
      modelId: "cm1model123def456ghi789jkl",
      services: [
        {
          quantity: 2,
          serviceId: "cm1service123def456ghi789",
        },
      ],
      widthMm: 1500,
    };

    // Act: Call the procedure
    const result = await testServer.quote["add-item"](complexInput);

    // Assert: Should create quote item successfully
    expect(result).toMatchObject({
      itemId: expect.any(String),
      quoteId: expect.any(String),
      subtotal: expect.any(Number),
    });

    // Subtotal should reflect the services and adjustments
    expect(result.subtotal).toBeGreaterThan(0); // Should have some positive value even with discount
  });

  it("should validate input schema - invalid modelId", async () => {
    // Arrange: Invalid model ID
    const invalidInput = {
      adjustments: [],
      glassTypeId: "cm1glass123def456ghi789jkl",
      heightMm: 800,
      modelId: "invalid-model-id", // Not a valid CUID
      services: [],
      widthMm: 1000,
    };

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.quote["add-item"](invalidInput);
    }).rejects.toThrow(MODEL_ID_ERROR_REGEX);
  });

  it("should validate input schema - invalid dimensions", async () => {
    // Arrange: Invalid height (negative)
    const invalidInput = {
      adjustments: [],
      glassTypeId: "cm1glass123def456ghi789jkl",
      heightMm: -100, // Invalid: must be > 0
      modelId: "cm1model123def456ghi789jkl",
      services: [],
      widthMm: 1000,
    };

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.quote["add-item"](invalidInput);
    }).rejects.toThrow(HEIGHT_ERROR_REGEX);
  });

  it("should validate input schema - invalid quoteId when provided", async () => {
    // Arrange: Invalid quote ID format
    const invalidInput = {
      adjustments: [],
      glassTypeId: "cm1glass123def456ghi789jkl",
      heightMm: 800,
      modelId: "cm1model123def456ghi789jkl",
      quoteId: "invalid-quote-id", // Not a valid CUID
      services: [],
      widthMm: 1000,
    };

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.quote["add-item"](invalidInput);
    }).rejects.toThrow(QUOTE_ID_ERROR_REGEX);
  });

  it("should handle model dimension constraints", async () => {
    // Arrange: Dimensions that might exceed model limits
    const inputWithLargeDimensions = {
      adjustments: [],
      glassTypeId: "cm1glass123def456ghi789jkl",
      heightMm: 4000, // Large height that might exceed model max
      modelId: "cm1model123def456ghi789jkl",
      services: [],
      widthMm: 5000, // Large width that might exceed model max
    };

    // Act & Assert: Should either succeed or throw a descriptive error
    try {
      const result = await testServer.quote["add-item"](
        inputWithLargeDimensions
      );
      expect(result).toMatchObject({
        itemId: expect.any(String),
        quoteId: expect.any(String),
        subtotal: expect.any(Number),
      });
    } catch (error) {
      // If it fails, it should be due to dimension constraints with Spanish message
      expect((error as Error).message).toMatch(DIMENSION_ERROR_REGEX);
    }
  });

  it("should handle glass type compatibility", async () => {
    // Arrange: Glass type that might not be compatible with model
    const inputWithIncompatibleGlass = {
      adjustments: [],
      glassTypeId: "cm1incompatible123456789", // Potentially incompatible glass type
      heightMm: 800,
      modelId: "cm1model123def456ghi789jkl",
      services: [],
      widthMm: 1000,
    };

    // Act & Assert: Should either succeed or throw compatibility error
    try {
      const result = await testServer.quote["add-item"](
        inputWithIncompatibleGlass
      );
      expect(result).toMatchObject({
        itemId: expect.any(String),
        quoteId: expect.any(String),
        subtotal: expect.any(Number),
      });
    } catch (error) {
      // If it fails, it should be due to compatibility with Spanish message
      expect((error as Error).message).toMatch(GLASS_COMPATIBILITY_ERROR_REGEX);
    }
  });

  it("should generate unique item IDs for multiple items in same quote", async () => {
    // Arrange: Create first item to get quote ID
    const firstItemInput = {
      adjustments: [],
      glassTypeId: "cm1glass123def456ghi789jkl",
      heightMm: 800,
      modelId: "cm1model123def456ghi789jkl",
      services: [],
      widthMm: 1000,
    };

    const firstResult = await testServer.quote["add-item"](firstItemInput);

    // Add multiple items to the same quote
    const secondItemInput = { ...firstItemInput, quoteId: firstResult.quoteId };
    const thirdItemInput = { ...firstItemInput, quoteId: firstResult.quoteId };

    // Act: Add multiple items
    const secondResult = await testServer.quote["add-item"](secondItemInput);
    const thirdResult = await testServer.quote["add-item"](thirdItemInput);

    // Assert: All items should have same quote ID but different item IDs
    expect(secondResult.quoteId).toBe(firstResult.quoteId);
    expect(thirdResult.quoteId).toBe(firstResult.quoteId);

    expect(firstResult.itemId).not.toBe(secondResult.itemId);
    expect(firstResult.itemId).not.toBe(thirdResult.itemId);
    expect(secondResult.itemId).not.toBe(thirdResult.itemId);

    // All item IDs should be valid CUIDs
    for (const result of [firstResult, secondResult, thirdResult]) {
      expect(result.itemId).toMatch(CUID_REGEX);
    }
  });
});
