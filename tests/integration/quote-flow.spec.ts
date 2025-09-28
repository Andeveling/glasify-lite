import { describe, expect, it } from 'vitest';
import { testServer } from '../integration-setup';

// Constants for testing
const QUOTE_CALCULATION_PERFORMANCE_SLA_MS = 200;
const VALID_CUID_REGEX = /^c[a-z0-9]{24}$/;
const MULTIPLE_ITEMS_COUNT = 3;
const BASE_WIDTH_MM = 1000;
const BASE_HEIGHT_MM = 800;
const WIDTH_INCREMENT_MM = 200;
const HEIGHT_INCREMENT_MM = 100;

describe('Integration: Quote Creation Flow', () => {
  it('should complete full quote creation flow', async () => {
    // Setup test data
    const modelId = 'cm1model123def456ghi789jkl';
    const glassTypeId = 'cm1glass123def456ghi789jkl';
    const serviceId = 'cm1service123def456ghi789jkl';

    const quoteItemData = {
      glassTypeId,
      heightMm: 800,
      modelId,
      quantity: 1,
      services: [ { quantity: 1, serviceId } ],
      widthMm: 1000,
    };

    // Act 1: Calculate item price (first step in quote flow)
    const calculation = await testServer.quote[ 'calculate-item' ](quoteItemData);

    // Assert 1: Calculation should return valid price structure
    expect(calculation).toBeDefined();
    expect(calculation).toHaveProperty('subtotal');
    expect(typeof calculation.subtotal).toBe('number');
    expect(calculation.subtotal).toBeGreaterThan(0);

    // Act 2: Add item to quote (second step in quote flow)
    const addItemResult = await testServer.quote[ 'add-item' ](quoteItemData);

    // Assert 2: Item should be added successfully
    expect(addItemResult).toBeDefined();
    expect(addItemResult).toHaveProperty('quoteId');
    expect(addItemResult).toHaveProperty('itemId');
    expect(addItemResult).toHaveProperty('subtotal');
    expect(addItemResult.quoteId).toMatch(VALID_CUID_REGEX);
    expect(addItemResult.itemId).toMatch(VALID_CUID_REGEX);
    expect(typeof addItemResult.subtotal).toBe('number');

    // Act 3: Add second item to existing quote
    const secondItemPayload = {
      ...quoteItemData,
      heightMm: 1000,
      quoteId: addItemResult.quoteId,
      widthMm: 1200,
    };

    const secondItemResult = await testServer.quote[ 'add-item' ](secondItemPayload);

    // Assert 3: Should use same quote but different item
    expect(secondItemResult.quoteId).toBe(addItemResult.quoteId);
    expect(secondItemResult.itemId).not.toBe(addItemResult.itemId);
    expect(secondItemResult.itemId).toMatch(VALID_CUID_REGEX);

    // Act 4: Submit complete quote (final step)
    const submitData = {
      contact: {
        address: 'Calle 123 #45-67, Bogotá, Colombia',
        phone: '+57 300 123 4567',
      },
      quoteId: addItemResult.quoteId,
    };

    const submitResult = await testServer.quote.submit(submitData);

    // Assert 4: Quote should be submitted successfully
    expect(submitResult).toBeDefined();
    expect(submitResult).toHaveProperty('quoteId', addItemResult.quoteId);
    expect(submitResult).toHaveProperty('status', 'sent');
  });

  it('should handle quote calculation performance requirements', async () => {
    const quoteItemData = {
      glassTypeId: 'cm1glass123def456ghi789jkl',
      heightMm: 1200,
      modelId: 'cm1model123def456ghi789jkl',
      quantity: 1,
      services: [ { quantity: 2, serviceId: 'cm1service123def456ghi789jkl' } ],
      widthMm: 1500,
    };

    // Act: Measure calculation response time
    const startTime = performance.now();
    const calculation = await testServer.quote[ 'calculate-item' ](quoteItemData);
    const endTime = performance.now();
    const responseTime = endTime - startTime;

    // Assert: Should meet <200ms SLA requirement for real-time pricing
    expect(responseTime).toBeLessThan(QUOTE_CALCULATION_PERFORMANCE_SLA_MS);
    expect(calculation.subtotal).toBeGreaterThan(0);
  });

  it('should validate quote creation with services and adjustments', async () => {
    // This test validates the complex pricing scenarios
    // that the quote UI needs to handle

    const complexQuoteData = {
      adjustments: [
        {
          concept: 'Descuento cliente frecuente',
          sign: 'negative' as const,
          unit: 'sqm' as const,
          value: 5,
        },
      ],
      glassTypeId: 'cm1glass123def456ghi789jkl',
      heightMm: 1500,
      modelId: 'cm1model123def456ghi789jkl',
      quantity: 1,
      services: [
        { quantity: 1, serviceId: 'cm1service123def456ghi789jkl' },
        { quantity: 2, serviceId: 'cm1service456ghi789jkldef' },
      ],
      widthMm: 1800,
    };

    // Act: Calculate complex quote
    const calculation = await testServer.quote[ 'calculate-item' ](complexQuoteData);

    // Assert: Should handle complex pricing correctly
    expect(calculation).toBeDefined();
    expect(calculation.subtotal).toBeGreaterThan(0);

    // Act: Add complex item to quote
    const result = await testServer.quote[ 'add-item' ](complexQuoteData);

    // Assert: Should create quote with complex pricing
    expect(result.quoteId).toMatch(VALID_CUID_REGEX);
    expect(result.itemId).toMatch(VALID_CUID_REGEX);
    expect(result.subtotal).toBeGreaterThan(0);
  });

  it('should handle quote state management across multiple operations', async () => {
    // This test validates that quote state is maintained
    // during the multi-step UI flow

    const baseItemData = {
      glassTypeId: 'cm1glass123def456ghi789jkl',
      heightMm: 800,
      modelId: 'cm1model123def456ghi789jkl',
      quantity: 1,
      services: [ { quantity: 1, serviceId: 'cm1service123def456ghi789jkl' } ],
      widthMm: 1000,
    };

    // Step 1: Create initial quote
    const firstItem = await testServer.quote[ 'add-item' ](baseItemData);
    const quoteId = firstItem.quoteId;

    // Step 2: Add multiple items to same quote
    const items: Array<{ quoteId: string; itemId: string; subtotal: number }> = [];
    for (let i = 0; i < MULTIPLE_ITEMS_COUNT; i++) {
      const itemData = {
        ...baseItemData,
        heightMm: BASE_HEIGHT_MM + i * HEIGHT_INCREMENT_MM,
        quoteId,
        widthMm: BASE_WIDTH_MM + i * WIDTH_INCREMENT_MM,
      };

      const result = await testServer.quote[ 'add-item' ](itemData);
      items.push(result);

      // Assert: All items belong to same quote
      expect(result.quoteId).toBe(quoteId);
      expect(result.itemId).toMatch(VALID_CUID_REGEX);
    }

    // Assert: All items have unique IDs
    const itemIds = items.map((item) => item.itemId);
    const uniqueItemIds = new Set(itemIds);
    expect(uniqueItemIds.size).toBe(items.length);

    // Step 3: Submit consolidated quote
    const submitResult = await testServer.quote.submit({
      contact: {
        address: 'Calle 123 #45-67, Bogotá, Colombia',
        phone: '+57 300 123 4567',
      },
      quoteId,
    });

    // Assert: Quote submitted successfully with all items
    expect(submitResult.status).toBe('sent');
    expect(submitResult.quoteId).toBe(quoteId);
  });
});
