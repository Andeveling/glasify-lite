/**
 * Tests unitarios para GetQuoteByIdUseCase
 *
 * Estos tests NO requieren base de datos.
 * Solo validan lógica de negocio pura con mocks.
 */

import { describe, expect, it, vi } from "vitest";
import {
  getQuoteByIdUseCase,
  type GetQuoteByIdDeps,
  type GetQuoteByIdInput,
  AuthorizationError,
} from "@/domain/quotes/use-cases/get-quote-by-id";

// Constants for test data
const TEST_QUOTE_ID = "quote-123";
const TEST_USER_ID = "user-456";
const TEST_OTHER_USER_ID = "user-789";
const TEST_TOTAL = 1_500_000;
const TEST_CURRENCY = "COP";
const TEST_BUSINESS_NAME = "Glasify Colombia";
const TEST_CONTACT_PHONE = "+573001234567";

// Mock de quote con items
function createMockQuoteWithItems(overrides = {}) {
  return {
    id: TEST_QUOTE_ID,
    userId: TEST_USER_ID,
    status: "draft" as const,
    currency: TEST_CURRENCY,
    total: TEST_TOTAL,
    createdAt: new Date("2025-01-10"),
    sentAt: null,
    validUntil: new Date("2025-01-17"),
    contactPhone: TEST_CONTACT_PHONE,
    projectName: "Proyecto Test",
    projectStreet: "Calle 123",
    projectCity: "Bogotá",
    projectState: "Cundinamarca",
    projectPostalCode: "110111",
    items: [
      {
        id: "item-1",
        name: "Ventana Corrediza 100x120",
        widthMm: 1000,
        heightMm: 1200,
        quantity: 2,
        subtotal: 750_000,
        glassType: { id: "glass-1", name: "Vidrio Templado 6mm" },
        model: { id: "model-1", name: "Ventana Corrediza", imageUrl: "/models/corrediza.png" },
        services: [
          { service: { id: "service-1", name: "Instalación" } },
        ],
      },
    ],
    user: {
      id: TEST_USER_ID,
      name: "Juan Pérez",
      email: "juan@example.com",
      role: "user" as const,
    },
    ...overrides,
  };
}

// Input válido base
function createValidInput(overrides: Partial<GetQuoteByIdInput> = {}): GetQuoteByIdInput {
  return {
    quoteId: TEST_QUOTE_ID,
    userId: TEST_USER_ID,
    userRole: "user" as const,
    ...overrides,
  };
}

// Dependencies mock factory
function createMockDeps(overrides: Partial<GetQuoteByIdDeps> = {}): GetQuoteByIdDeps {
  return {
    findQuoteWithDetails: vi.fn().mockResolvedValue(createMockQuoteWithItems()),
    getTenantBusinessName: vi.fn().mockResolvedValue(TEST_BUSINESS_NAME),
    getTenantContactPhone: vi.fn().mockResolvedValue(TEST_CONTACT_PHONE),
    ...overrides,
  };
}

describe("GetQuoteByIdUseCase", () => {
  describe("Quote Existence", () => {
    it("should throw NOT_FOUND error when quote does not exist", async () => {
      const input = createValidInput();
      const deps = createMockDeps({
        findQuoteWithDetails: vi.fn().mockResolvedValue(null),
      });

      await expect(getQuoteByIdUseCase(input, deps)).rejects.toThrow(
        AuthorizationError
      );

      try {
        await getQuoteByIdUseCase(input, deps);
      } catch (error) {
        expect((error as AuthorizationError).code).toBe("NOT_FOUND");
        expect((error as AuthorizationError).message).toBe("Cotización no encontrada");
      }
    });
  });

  describe("Authorization", () => {
    it("should throw FORBIDDEN error when user does not own quote", async () => {
      const input = createValidInput({ userId: TEST_OTHER_USER_ID });
      const deps = createMockDeps();

      try {
        await getQuoteByIdUseCase(input, deps);
      } catch (error) {
        expect((error as AuthorizationError).code).toBe("FORBIDDEN");
        expect((error as AuthorizationError).message).toContain("No tienes permiso");
      }
    });

    it("should allow owner to access their quote", async () => {
      const input = createValidInput();
      const deps = createMockDeps();

      const result = await getQuoteByIdUseCase(input, deps);

      expect(result.id).toBe(TEST_QUOTE_ID);
    });

    it("should allow admin to access any quote", async () => {
      const input = createValidInput({
        userId: TEST_OTHER_USER_ID,
        userRole: "admin",
      });
      const deps = createMockDeps();

      const result = await getQuoteByIdUseCase(input, deps);

      expect(result.id).toBe(TEST_QUOTE_ID);
    });

    it("should deny seller access to other users quotes", async () => {
      const input = createValidInput({
        userId: TEST_OTHER_USER_ID,
        userRole: "seller",
      });
      const deps = createMockDeps();

      await expect(getQuoteByIdUseCase(input, deps)).rejects.toThrow(
        AuthorizationError
      );
    });
  });

  describe("Response Transformation", () => {
    it("should return complete quote details", async () => {
      const input = createValidInput();
      const deps = createMockDeps();

      const result = await getQuoteByIdUseCase(input, deps);

      expect(result).toMatchObject({
        id: TEST_QUOTE_ID,
        status: "draft",
        currency: TEST_CURRENCY,
        total: TEST_TOTAL,
        manufacturerName: TEST_BUSINESS_NAME,
        vendorContactPhone: TEST_CONTACT_PHONE,
        projectName: "Proyecto Test",
        itemCount: 1,
      });
    });

    it("should calculate isExpired correctly for valid quote", async () => {
      const input = createValidInput();
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const deps = createMockDeps({
        findQuoteWithDetails: vi.fn().mockResolvedValue(
          createMockQuoteWithItems({ validUntil: futureDate })
        ),
      });

      const result = await getQuoteByIdUseCase(input, deps);

      expect(result.isExpired).toBe(false);
    });

    it("should calculate isExpired correctly for expired quote", async () => {
      const input = createValidInput();
      const pastDate = new Date("2024-01-01");
      const deps = createMockDeps({
        findQuoteWithDetails: vi.fn().mockResolvedValue(
          createMockQuoteWithItems({ validUntil: pastDate })
        ),
      });

      const result = await getQuoteByIdUseCase(input, deps);

      expect(result.isExpired).toBe(true);
    });

    it("should transform items correctly", async () => {
      const input = createValidInput();
      const deps = createMockDeps();

      const result = await getQuoteByIdUseCase(input, deps);

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        id: "item-1",
        name: "Ventana Corrediza 100x120",
        modelName: "Ventana Corrediza",
        glassTypeName: "Vidrio Templado 6mm",
        widthMm: 1000,
        heightMm: 1200,
        quantity: 2,
        subtotal: 750_000,
        serviceNames: ["Instalación"],
      });
    });

    it("should calculate totalUnits from all items", async () => {
      const input = createValidInput();
      const deps = createMockDeps({
        findQuoteWithDetails: vi.fn().mockResolvedValue(
          createMockQuoteWithItems({
            items: [
              { ...createMockQuoteWithItems().items[0], quantity: 3 },
              { ...createMockQuoteWithItems().items[0], id: "item-2", quantity: 5 },
            ],
          })
        ),
      });

      const result = await getQuoteByIdUseCase(input, deps);

      expect(result.totalUnits).toBe(8);
    });

    it("should include user info when available", async () => {
      const input = createValidInput();
      const deps = createMockDeps();

      const result = await getQuoteByIdUseCase(input, deps);

      expect(result.user).toMatchObject({
        id: TEST_USER_ID,
        name: "Juan Pérez",
        email: "juan@example.com",
        role: "user",
      });
    });

    it("should handle null user gracefully", async () => {
      // Use admin role since null userId quote has no owner
      const input = createValidInput({ userRole: "admin" });
      const deps = createMockDeps({
        findQuoteWithDetails: vi.fn().mockResolvedValue(
          createMockQuoteWithItems({ user: null, userId: null })
        ),
      });

      const result = await getQuoteByIdUseCase(input, deps);

      expect(result.user).toBeNull();
    });
  });

  describe("Project Address", () => {
    it("should return complete project address", async () => {
      const input = createValidInput();
      const deps = createMockDeps();

      const result = await getQuoteByIdUseCase(input, deps);

      expect(result.projectAddress).toMatchObject({
        projectName: "Proyecto Test",
        projectStreet: "Calle 123",
        projectCity: "Bogotá",
        projectState: "Cundinamarca",
      });
    });

    it("should handle null project fields", async () => {
      const input = createValidInput();
      const deps = createMockDeps({
        findQuoteWithDetails: vi.fn().mockResolvedValue(
          createMockQuoteWithItems({
            projectName: null,
            projectStreet: null,
            projectCity: null,
            projectState: null,
          })
        ),
      });

      const result = await getQuoteByIdUseCase(input, deps);

      expect(result.projectAddress).toMatchObject({
        projectName: "Sin nombre",
        projectStreet: "",
        projectCity: "",
        projectState: "",
      });
    });
  });
});
