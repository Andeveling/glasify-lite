/**
 * Tests unitarios para ListUserQuotesUseCase
 *
 * Estos tests NO requieren base de datos.
 * Solo validan lógica de negocio pura con mocks.
 */

import { describe, expect, it, vi } from "vitest";
import {
  listUserQuotesUseCase,
  type ListUserQuotesDeps,
  type ListUserQuotesInput,
} from "@/domain/quotes/use-cases/list-user-quotes";

// Constants for test data
const TEST_USER_ID = "user-456";
const DEFAULT_PAGE_SIZE = 20;

// Mock de quotes en lista
function createMockQuotes(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `quote-${i + 1}`,
    status: i % 2 === 0 ? ("draft" as const) : ("sent" as const),
    currency: "COP",
    total: (i + 1) * 100_000,
    createdAt: new Date(`2025-01-${(10 - i).toString().padStart(2, "0")}`),
    sentAt: i % 2 === 0 ? null : new Date(`2025-01-${(10 - i).toString().padStart(2, "0")}`),
    validUntil: new Date(`2025-01-${(17 - i).toString().padStart(2, "0")}`),
    projectName: `Proyecto ${i + 1}`,
    itemCount: i + 1,
  }));
}

// Input válido base
function createValidInput(overrides: Partial<ListUserQuotesInput> = {}): ListUserQuotesInput {
  return {
    userId: TEST_USER_ID,
    userRole: "user" as const,
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    sortBy: "createdAt" as const,
    sortOrder: "desc" as const,
    includeExpired: false,
    ...overrides,
  };
}

// Dependencies mock factory
function createMockDeps(overrides: Partial<ListUserQuotesDeps> = {}): ListUserQuotesDeps {
  return {
    listQuotes: vi.fn().mockResolvedValue({
      quotes: createMockQuotes(5),
      total: 5,
    }),
    ...overrides,
  };
}

describe("ListUserQuotesUseCase", () => {
  describe("Role-Based Filtering", () => {
    it("should filter by userId for regular user", async () => {
      const input = createValidInput({ userRole: "user" });
      const listQuotesMock = vi.fn().mockResolvedValue({
        quotes: createMockQuotes(3),
        total: 3,
      });
      const deps = createMockDeps({ listQuotes: listQuotesMock });

      await listUserQuotesUseCase(input, deps);

      expect(listQuotesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: TEST_USER_ID,
        })
      );
    });

    it("should filter by userId for seller", async () => {
      const input = createValidInput({ userRole: "seller" });
      const listQuotesMock = vi.fn().mockResolvedValue({
        quotes: createMockQuotes(3),
        total: 3,
      });
      const deps = createMockDeps({ listQuotes: listQuotesMock });

      await listUserQuotesUseCase(input, deps);

      expect(listQuotesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: TEST_USER_ID,
        })
      );
    });

    it("should NOT filter by userId for admin (sees all)", async () => {
      const input = createValidInput({ userRole: "admin" });
      const listQuotesMock = vi.fn().mockResolvedValue({
        quotes: createMockQuotes(10),
        total: 10,
      });
      const deps = createMockDeps({ listQuotes: listQuotesMock });

      await listUserQuotesUseCase(input, deps);

      expect(listQuotesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: undefined,
        })
      );
    });
  });

  describe("Pagination", () => {
    it("should calculate totalPages correctly", async () => {
      const input = createValidInput({ limit: 10 });
      const deps = createMockDeps({
        listQuotes: vi.fn().mockResolvedValue({
          quotes: createMockQuotes(10),
          total: 35,
        }),
      });

      const result = await listUserQuotesUseCase(input, deps);

      expect(result.totalPages).toBe(4); // ceil(35/10) = 4
    });

    it("should set hasNextPage correctly on first page", async () => {
      const input = createValidInput({ page: 1, limit: 10 });
      const deps = createMockDeps({
        listQuotes: vi.fn().mockResolvedValue({
          quotes: createMockQuotes(10),
          total: 25,
        }),
      });

      const result = await listUserQuotesUseCase(input, deps);

      expect(result.hasNextPage).toBe(true);
      expect(result.hasPreviousPage).toBe(false);
    });

    it("should set hasPreviousPage correctly on middle page", async () => {
      const input = createValidInput({ page: 2, limit: 10 });
      const deps = createMockDeps({
        listQuotes: vi.fn().mockResolvedValue({
          quotes: createMockQuotes(10),
          total: 50,
        }),
      });

      const result = await listUserQuotesUseCase(input, deps);

      expect(result.hasNextPage).toBe(true);
      expect(result.hasPreviousPage).toBe(true);
    });

    it("should set hasNextPage to false on last page", async () => {
      const input = createValidInput({ page: 3, limit: 10 });
      const deps = createMockDeps({
        listQuotes: vi.fn().mockResolvedValue({
          quotes: createMockQuotes(5),
          total: 25,
        }),
      });

      const result = await listUserQuotesUseCase(input, deps);

      expect(result.hasNextPage).toBe(false);
      expect(result.hasPreviousPage).toBe(true);
    });
  });

  describe("Filtering", () => {
    it("should pass status filter to repository", async () => {
      const input = createValidInput({ status: "sent" });
      const listQuotesMock = vi.fn().mockResolvedValue({
        quotes: createMockQuotes(3),
        total: 3,
      });
      const deps = createMockDeps({ listQuotes: listQuotesMock });

      await listUserQuotesUseCase(input, deps);

      expect(listQuotesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "sent",
        })
      );
    });

    it("should pass search filter to repository", async () => {
      const input = createValidInput({ search: "ventana" });
      const listQuotesMock = vi.fn().mockResolvedValue({
        quotes: createMockQuotes(2),
        total: 2,
      });
      const deps = createMockDeps({ listQuotes: listQuotesMock });

      await listUserQuotesUseCase(input, deps);

      expect(listQuotesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          search: "ventana",
        })
      );
    });

    it("should pass includeExpired filter to repository", async () => {
      const input = createValidInput({ includeExpired: true });
      const listQuotesMock = vi.fn().mockResolvedValue({
        quotes: createMockQuotes(5),
        total: 5,
      });
      const deps = createMockDeps({ listQuotes: listQuotesMock });

      await listUserQuotesUseCase(input, deps);

      expect(listQuotesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          includeExpired: true,
        })
      );
    });
  });

  describe("Sorting", () => {
    it("should pass sortBy and sortOrder to repository", async () => {
      const input = createValidInput({ sortBy: "total", sortOrder: "asc" });
      const listQuotesMock = vi.fn().mockResolvedValue({
        quotes: createMockQuotes(5),
        total: 5,
      });
      const deps = createMockDeps({ listQuotes: listQuotesMock });

      await listUserQuotesUseCase(input, deps);

      expect(listQuotesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: "total",
          sortOrder: "asc",
        })
      );
    });
  });

  describe("Response Transformation", () => {
    it("should transform quotes correctly", async () => {
      const input = createValidInput();
      const deps = createMockDeps();

      const result = await listUserQuotesUseCase(input, deps);

      expect(result.quotes).toHaveLength(5);
      expect(result.quotes[0]).toMatchObject({
        id: "quote-1",
        status: "draft",
        currency: "COP",
        projectName: "Proyecto 1",
        itemCount: 1,
      });
    });

    it("should calculate isExpired for each quote", async () => {
      const expiredDate = new Date("2024-01-01");
      const validDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const input = createValidInput();
      const deps = createMockDeps({
        listQuotes: vi.fn().mockResolvedValue({
          quotes: [
            { ...createMockQuotes(1)[0], validUntil: expiredDate },
            { ...createMockQuotes(1)[0], id: "quote-2", validUntil: validDate },
          ],
          total: 2,
        }),
      });

      const result = await listUserQuotesUseCase(input, deps);

      expect(result.quotes[0]?.isExpired).toBe(true);
      expect(result.quotes[1]?.isExpired).toBe(false);
    });

    it("should handle null projectName", async () => {
      const input = createValidInput();
      const deps = createMockDeps({
        listQuotes: vi.fn().mockResolvedValue({
          quotes: [{ ...createMockQuotes(1)[0], projectName: null }],
          total: 1,
        }),
      });

      const result = await listUserQuotesUseCase(input, deps);

      expect(result.quotes[0]?.projectName).toBe("Sin nombre");
    });

    it("should return correct pagination metadata", async () => {
      const input = createValidInput({ page: 2, limit: 10 });
      const deps = createMockDeps({
        listQuotes: vi.fn().mockResolvedValue({
          quotes: createMockQuotes(10),
          total: 25,
        }),
      });

      const result = await listUserQuotesUseCase(input, deps);

      expect(result).toMatchObject({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
      });
    });
  });
});
