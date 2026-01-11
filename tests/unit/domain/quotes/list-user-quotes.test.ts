/**
 * Tests unitarios para ListUserQuotesUseCase
 *
 * Estos tests NO requieren base de datos.
 * Solo validan lógica de negocio pura con mocks.
 */

import { describe, expect, it, vi } from "vitest";
import {
  type ListUserQuotesDeps,
  type ListUserQuotesInput,
  listUserQuotesUseCase,
} from "@/domain/quotes/use-cases/list-user-quotes";

// Constants for test data
const TEST_USER_ID = "user-456";
const DEFAULT_PAGE_SIZE = 20;

// Números reutilizables para evitar 'magic numbers'
const DEFAULT_QUOTE_TOTAL_UNIT = 100_000;
const CREATED_BASE_DAY = 10;
const VALID_UNTIL_BASE_DAY = 17;
const DEFAULT_PAGE = 1;
const PAGE_1 = 1;
const PAGE_2 = 2;
const PAGE_3 = 3;
const LIMIT_10 = 10;
const QUOTES_COUNT_SMALL = 3;
const QUOTES_COUNT_ONE = 1;
const QUOTES_COUNT_TWO = 2;
const QUOTES_COUNT_MEDIUM = 5;
const QUOTES_COUNT_LARGE = 10;
const TOTAL_35 = 35;
const TOTAL_25 = 25;
const TOTAL_50 = 50;
const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1000;
const MS_PER_DAY =
  HOURS_PER_DAY *
  MINUTES_PER_HOUR *
  SECONDS_PER_MINUTE *
  MILLISECONDS_PER_SECOND;
const DAYS_7 = 7;
const EXPECT_TOTAL_PAGES_35_10 = Math.ceil(TOTAL_35 / LIMIT_10);

// Mock de quotes en lista
function createMockQuotes(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `quote-${i + 1}`,
    status: i % 2 === 0 ? ("draft" as const) : ("sent" as const),
    currency: "COP",
    total: (i + 1) * DEFAULT_QUOTE_TOTAL_UNIT,
    createdAt: new Date(
      `2025-01-${(CREATED_BASE_DAY - i).toString().padStart(2, "0")}`
    ),
    sentAt:
      i % 2 === 0
        ? null
        : new Date(
            `2025-01-${(CREATED_BASE_DAY - i).toString().padStart(2, "0")}`
          ),
    validUntil: new Date(
      `2025-01-${(VALID_UNTIL_BASE_DAY - i).toString().padStart(2, "0")}`
    ),
    projectName: `Proyecto ${i + 1}`,
    itemCount: i + 1,
  }));
}

// Input válido base
function createValidInput(
  overrides: Partial<ListUserQuotesInput> = {}
): ListUserQuotesInput {
  return {
    userId: TEST_USER_ID,
    userRole: "user" as const,
    page: DEFAULT_PAGE,
    limit: DEFAULT_PAGE_SIZE,
    sortBy: "createdAt" as const,
    sortOrder: "desc" as const,
    includeExpired: false,
    ...overrides,
  };
}

// Dependencies mock factory
function createMockDeps(
  overrides: Partial<ListUserQuotesDeps> = {}
): ListUserQuotesDeps {
  return {
    listQuotes: vi.fn().mockResolvedValue({
      quotes: createMockQuotes(QUOTES_COUNT_MEDIUM),
      total: QUOTES_COUNT_MEDIUM,
    }),
    ...overrides,
  };
}

describe("ListUserQuotesUseCase", () => {
  describe("Role-Based Filtering", () => {
    it("should filter by userId for regular user", async () => {
      const input = createValidInput({ userRole: "user" });
      const listQuotesMock = vi.fn().mockResolvedValue({
        quotes: createMockQuotes(QUOTES_COUNT_SMALL),
        total: QUOTES_COUNT_SMALL,
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
        quotes: createMockQuotes(QUOTES_COUNT_SMALL),
        total: QUOTES_COUNT_SMALL,
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
        quotes: createMockQuotes(QUOTES_COUNT_LARGE),
        total: QUOTES_COUNT_LARGE,
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
      const input = createValidInput({ limit: LIMIT_10 });
      const deps = createMockDeps({
        listQuotes: vi.fn().mockResolvedValue({
          quotes: createMockQuotes(QUOTES_COUNT_LARGE),
          total: TOTAL_35,
        }),
      });

      const result = await listUserQuotesUseCase(input, deps);

      expect(result.totalPages).toBe(EXPECT_TOTAL_PAGES_35_10); // ceil(35/10) = 4
    });

    it("should set hasNextPage correctly on first page", async () => {
      const input = createValidInput({ page: PAGE_1, limit: LIMIT_10 });
      const deps = createMockDeps({
        listQuotes: vi.fn().mockResolvedValue({
          quotes: createMockQuotes(QUOTES_COUNT_LARGE),
          total: TOTAL_25,
        }),
      });

      const result = await listUserQuotesUseCase(input, deps);

      expect(result.hasNextPage).toBe(true);
      expect(result.hasPreviousPage).toBe(false);
    });

    it("should set hasPreviousPage correctly on middle page", async () => {
      const input = createValidInput({ page: PAGE_2, limit: LIMIT_10 });
      const deps = createMockDeps({
        listQuotes: vi.fn().mockResolvedValue({
          quotes: createMockQuotes(QUOTES_COUNT_LARGE),
          total: TOTAL_50,
        }),
      });

      const result = await listUserQuotesUseCase(input, deps);

      expect(result.hasNextPage).toBe(true);
      expect(result.hasPreviousPage).toBe(true);
    });

    it("should set hasNextPage to false on last page", async () => {
      const input = createValidInput({ page: PAGE_3, limit: LIMIT_10 });
      const deps = createMockDeps({
        listQuotes: vi.fn().mockResolvedValue({
          quotes: createMockQuotes(QUOTES_COUNT_MEDIUM),
          total: TOTAL_25,
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
        quotes: createMockQuotes(QUOTES_COUNT_SMALL),
        total: QUOTES_COUNT_SMALL,
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
        quotes: createMockQuotes(QUOTES_COUNT_TWO),
        total: QUOTES_COUNT_TWO,
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
        quotes: createMockQuotes(QUOTES_COUNT_MEDIUM),
        total: TOTAL_25,
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
        quotes: createMockQuotes(QUOTES_COUNT_MEDIUM),
        total: QUOTES_COUNT_MEDIUM,
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

      expect(result.quotes).toHaveLength(QUOTES_COUNT_MEDIUM);
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
      const validDate = new Date(Date.now() + DAYS_7 * MS_PER_DAY);
      const input = createValidInput();
      const deps = createMockDeps({
        listQuotes: vi.fn().mockResolvedValue({
          quotes: [
            {
              ...createMockQuotes(QUOTES_COUNT_ONE)[0],
              validUntil: expiredDate,
            },
            {
              ...createMockQuotes(QUOTES_COUNT_ONE)[0],
              id: "quote-2",
              validUntil: validDate,
            },
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
          quotes: [
            { ...createMockQuotes(QUOTES_COUNT_ONE)[0], projectName: null },
          ],
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
          quotes: createMockQuotes(QUOTES_COUNT_MEDIUM),
          total: TOTAL_25,
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
