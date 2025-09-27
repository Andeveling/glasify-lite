import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { createTestContext, testServer } from "../integration-setup";

describe("Integration: Quickstart E2E Flow", () => {
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
        name: "E2E Test Manufacturer",
        currency: "COP",
        quoteValidityDays: 15,
      },
    });
    manufacturerId = manufacturer.id;

    // 2. Create a test glass type
    const glassType = await db.glassType.create({
      data: {
        name: "Vidrio Templado Test",
        purpose: "general",
        thicknessMm: 6,
        manufacturerId,
      },
    });
    glassTypeId = glassType.id;

    // 3. Create a test service
    const service = await db.service.create({
      data: {
        name: "Corte Especial Test",
        type: "perimeter",
        unit: "ml",
        rate: 2500,
        manufacturerId,
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

  it("Step 1: Admin publishes a new glass model", async () => {
    // Arrange: Model data for creation
    const modelPayload = {
      manufacturerId,
      name: "Ventana Premium E2E Test",
      status: "published" as const,
      minWidthMm: 300,
      maxWidthMm: 2000,
      minHeightMm: 400,
      maxHeightMm: 1800,
      basePrice: 150_000,
      costPerMmWidth: 60,
      costPerMmHeight: 45,
      accessoryPrice: 20_000,
      compatibleGlassTypeIds: [glassTypeId],
    };

    // Act: Create and publish the model
    const result = await testServer.admin["model-upsert"](modelPayload);

    // Assert: Model should be created successfully
    expect(result.modelId).toBeDefined();
    expect(result.status).toBe("published");
    expect(result.message).toMatch(/creado|actualizado/i);

    // Store for next test
    modelId = result.modelId;
  });

  it("Step 2: User calculates price and adds item to new quote", async () => {
    // Arrange: Item calculation payload
    const calculatePayload = {
      modelId,
      widthMm: 1000,
      heightMm: 800,
      glassTypeId,
      services: [
        {
          serviceId,
          quantity: 1,
        },
      ],
      adjustments: [
        {
          concept: "Descuento cliente nuevo",
          unit: "unit" as const,
          sign: "negative" as const,
          value: 10_000,
        },
      ],
    };

    // Act: Calculate the item price first
    const calculation =
      await testServer.quote["calculate-item"](calculatePayload);

    // Assert: Calculation should return valid price structure
    expect(calculation.dimPrice).toBeGreaterThan(0);
    expect(calculation.services).toHaveLength(1);
    expect(calculation.adjustments).toHaveLength(1);
    expect(calculation.subtotal).toBeGreaterThan(0);

    // Store expected subtotal for comparison
    const expectedSubtotal = calculation.subtotal;

    // Now add the item to a quote
    const addItemResult = await testServer.quote["add-item"](calculatePayload);

    // Assert: Item should be added successfully
    expect(addItemResult.quoteId).toBeDefined();
    expect(addItemResult.itemId).toBeDefined();
    expect(addItemResult.subtotal).toBe(expectedSubtotal);

    // Store quote ID for next test
    quoteId = addItemResult.quoteId;
  });

  it("Step 3: User adds another item to existing quote", async () => {
    // Arrange: Second item with different dimensions
    const secondItemPayload = {
      quoteId,
      modelId,
      widthMm: 1200,
      heightMm: 1000,
      glassTypeId,
      services: [], // No additional services
      adjustments: [],
    };

    // Act: Add second item to existing quote
    const result = await testServer.quote["add-item"](secondItemPayload);

    // Assert: Should use same quote but different item
    expect(result.quoteId).toBe(quoteId);
    expect(result.itemId).toBeDefined();
    expect(result.subtotal).toBeGreaterThan(0);
  });

  it("Step 4: User submits the complete quote", async () => {
    // Arrange: Contact information for quote submission
    const submitPayload = {
      quoteId,
      contact: {
        phone: "+57 300 123 4567",
        address: "Calle 123 #45-67, Bogotá, Colombia",
      },
    };

    // Act: Submit the quote
    const submission = await testServer.quote["submit"](submitPayload);

    // Assert: Quote should be submitted successfully
    expect(submission.quoteId).toBe(quoteId);
    expect(submission.status).toBe("sent");
  });

  it("Step 5: Verify catalog listing works for published models", async () => {
    // Arrange: Request for published models from our manufacturer
    const listModelsPayload = {
      manufacturerId,
    };

    // Act: List available models
    const models = await testServer.catalog["list-models"](listModelsPayload);

    // Assert: Should include our published model
    expect(models).toHaveLength(1);
    expect(models[0]!.id).toBe(modelId);
    expect(models[0]!.name).toBe("Ventana Premium E2E Test");
    expect(models[0]!.status).toBe("published");
    expect(models[0]!.compatibleGlassTypeIds).toContain(glassTypeId);
  });

  it("Integration Performance: Complete flow should complete quickly", async () => {
    // Arrange: Performance test data
    const performancePayload = {
      modelId,
      widthMm: 1500,
      heightMm: 1200,
      glassTypeId,
      services: [{ serviceId, quantity: 2 }],
      adjustments: [
        {
          concept: "Test adjustment",
          unit: "sqm" as const,
          sign: "positive" as const,
          value: 5000,
        },
      ],
    };

    // Act: Measure time for complete calculate -> add -> submit flow
    const startTime = Date.now();

    // Step 1: Calculate
    const calculation =
      await testServer.quote["calculate-item"](performancePayload);

    // Step 2: Add to quote
    const addResult = await testServer.quote["add-item"](performancePayload);

    // Step 3: Submit quote
    const submitResult = await testServer.quote["submit"]({
      quoteId: addResult.quoteId,
      contact: {
        phone: "+57 300 999 8888",
        address: "Performance Test Address",
      },
    });

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Assert: Complete flow should be fast
    expect(totalTime).toBeLessThan(1000); // Under 1 second for complete flow
    expect(calculation.subtotal).toBeGreaterThan(0);
    expect(addResult.quoteId).toBeDefined();
    expect(submitResult.status).toBe("sent");
  });
});
