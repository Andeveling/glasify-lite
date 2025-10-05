import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { db } from '@/server/db';
import { testServer } from '../integration-setup';

// Test constants
const MAX_COMPLETE_FLOW_TIME_MS = 1000;
const STATUS_MESSAGE_PATTERN = /creado|actualizado/i;

describe('Integration: Quickstart E2E Flow', () => {
  let manufacturerId: string;
  let glassTypeId: string;
  let serviceId: string;
  let modelId: string;
  let quoteId: string;

  beforeAll(async () => {
    // Setup test data in the database

    // 1. Create a test manufacturer
    const manufacturer = await db.manufacturer.create({
      data: {
        currency: 'COP',
        name: 'E2E Test Manufacturer',
        quoteValidityDays: 15,
      },
    });
    manufacturerId = manufacturer.id;

    // 2. Create a test glass type
    const glassType = await db.glassType.create({
      data: {
        manufacturerId,
        name: 'Vidrio Templado Test',
        pricePerSqm: 50_000,
        purpose: 'general',
        thicknessMm: 6,
      },
    });
    glassTypeId = glassType.id;

    // 3. Create a test service
    const service = await db.service.create({
      data: {
        manufacturerId,
        name: 'Corte Especial Test',
        rate: 2500,
        type: 'perimeter',
        unit: 'ml',
      },
    });
    serviceId = service.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await db.quoteItem.deleteMany({
      where: {
        quote: {
          manufacturerId,
        },
      },
    });

    await db.quote.deleteMany({
      where: { manufacturerId },
    });

    await db.model.deleteMany({
      where: { manufacturerId },
    });

    await db.service.deleteMany({
      where: { manufacturerId },
    });

    await db.glassType.deleteMany({
      where: { manufacturerId },
    });

    await db.manufacturer.delete({
      where: { id: manufacturerId },
    });
  });

  it('Step 1: Admin publishes a new glass model', async () => {
    // Arrange: Model data for creation
    const modelPayload = {
      accessoryPrice: 20_000,
      basePrice: 150_000,
      compatibleGlassTypeIds: [glassTypeId],
      costPerMmHeight: 45,
      costPerMmWidth: 60,
      manufacturerId,
      maxHeightMm: 1800,
      maxWidthMm: 2000,
      minHeightMm: 400,
      minWidthMm: 300,
      name: 'Ventana Premium E2E Test',
      status: 'published' as const,
    };

    // Act: Create and publish the model
    const result = await testServer.admin['model-upsert'](modelPayload);

    // Assert: Model should be created successfully
    expect(result.modelId).toBeDefined();
    expect(result.status).toBe('published');
    expect(result.message).toMatch(STATUS_MESSAGE_PATTERN);

    // Store for next test
    modelId = result.modelId;
  });

  it('Step 2: User calculates price and adds item to new quote', async () => {
    // Arrange: Item calculation payload
    const calculatePayload = {
      adjustments: [
        {
          concept: 'Descuento cliente nuevo',
          sign: 'negative' as const,
          unit: 'unit' as const,
          value: 10_000,
        },
      ],
      glassTypeId,
      heightMm: 800,
      modelId,
      services: [
        {
          quantity: 1,
          serviceId,
        },
      ],
      widthMm: 1000,
    };

    // Act: Calculate the item price first
    const calculation = await testServer.quote['calculate-item'](calculatePayload);

    // Assert: Calculation should return valid price structure
    expect(calculation.dimPrice).toBeGreaterThan(0);
    expect(calculation.services).toHaveLength(1);
    expect(calculation.adjustments).toHaveLength(1);
    expect(calculation.subtotal).toBeGreaterThan(0);

    // Store expected subtotal for comparison
    const expectedSubtotal = calculation.subtotal;

    // Now add the item to a quote
    const addItemResult = await testServer.quote['add-item'](calculatePayload);

    // Assert: Item should be added successfully
    expect(addItemResult.quoteId).toBeDefined();
    expect(addItemResult.itemId).toBeDefined();
    expect(addItemResult.subtotal).toBe(expectedSubtotal);

    // Store quote ID for next test
    quoteId = addItemResult.quoteId;
  });

  it('Step 3: User adds another item to existing quote', async () => {
    // Arrange: Second item with different dimensions
    const secondItemPayload = {
      adjustments: [],
      glassTypeId,
      heightMm: 1000,
      modelId,
      quoteId,
      services: [], // No additional services
      widthMm: 1200,
    };

    // Act: Add second item to existing quote
    const result = await testServer.quote['add-item'](secondItemPayload);

    // Assert: Should use same quote but different item
    expect(result.quoteId).toBe(quoteId);
    expect(result.itemId).toBeDefined();
    expect(result.subtotal).toBeGreaterThan(0);
  });

  it('Step 4: User submits the complete quote', async () => {
    // Arrange: Contact information for quote submission
    const submitPayload = {
      contact: {
        address: 'Calle 123 #45-67, Bogotá, Colombia',
        phone: '+57 300 123 4567',
      },
      quoteId,
    };

    // Act: Submit the quote
    const submission = await testServer.quote.submit(submitPayload);

    // Assert: Quote should be submitted successfully
    expect(submission.quoteId).toBe(quoteId);
    expect(submission.status).toBe('sent');
  });

  it('Step 5: Verify catalog listing works for published models', async () => {
    // Arrange: Request for published models from our manufacturer
    const listModelsPayload = {
      manufacturerId,
    };

    // Act: List available models
    const result = await testServer.catalog['list-models'](listModelsPayload);

    // Assert: Should include our published model
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.id).toBe(modelId);
    expect(result.items[0]?.name).toBe('Ventana Premium E2E Test');
    expect(result.items[0]?.status).toBe('published');
    expect(result.items[0]?.compatibleGlassTypeIds).toContain(glassTypeId);
  });

  it('Integration Performance: Complete flow should complete quickly', async () => {
    // Arrange: Performance test data
    const performancePayload = {
      adjustments: [
        {
          concept: 'Test adjustment',
          sign: 'positive' as const,
          unit: 'sqm' as const,
          value: 5000,
        },
      ],
      glassTypeId,
      heightMm: 1200,
      modelId,
      services: [{ quantity: 2, serviceId }],
      widthMm: 1500,
    };

    // Act: Measure time for complete calculate -> add -> submit flow
    const startTime = Date.now();

    // Step 1: Calculate
    const calculation = await testServer.quote['calculate-item'](performancePayload);

    // Step 2: Add to quote
    const addResult = await testServer.quote['add-item'](performancePayload);

    // Step 3: Submit quote
    const submitResult = await testServer.quote.submit({
      contact: {
        address: 'Performance Test Address',
        phone: '+57 300 999 8888',
      },
      quoteId: addResult.quoteId,
    });

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Assert: Complete flow should be fast
    expect(totalTime).toBeLessThan(MAX_COMPLETE_FLOW_TIME_MS); // Under 1 second for complete flow
    expect(calculation.subtotal).toBeGreaterThan(0);
    expect(addResult.quoteId).toBeDefined();
    expect(submitResult.status).toBe('sent');
  });
});
