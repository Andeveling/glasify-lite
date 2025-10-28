import { describe, expect, it } from "vitest";
import {
  formatNumber,
  formatResultCount,
  getResultCountParts,
  type PluralOptions,
  pluralize,
} from "@/app/(public)/catalog/_utils/text-formatting.utils";

// ============================================================================
// Test Constants
// ============================================================================

const ONE_THOUSAND = 1000;
const ONE_THOUSAND_TWO_HUNDRED_THIRTY_FOUR = 1234;
const ONE_MILLION_TWO_HUNDRED_THIRTY_FOUR_THOUSAND = 1_234_567;
const NINE_HUNDRED_NINETY_NINE = 999;
const NEGATIVE_ONE_THOUSAND = -1000;
const NEGATIVE_FIVE = -5;
const ONE_HUNDRED = 100;
const FIVE = 5;
const NINETY_NINE = 99;
const ONE_THOUSAND_FIVE_HUNDRED = 1500;
const NINE_HUNDRED_NINETY_NINE_THOUSAND = 999_999;

// ============================================================================
// formatNumber Tests
// ============================================================================

describe("formatNumber", () => {
  it("should format numbers with thousand separators (es-AR)", () => {
    expect(formatNumber(ONE_THOUSAND)).toBe("1.000");
    expect(formatNumber(ONE_THOUSAND_TWO_HUNDRED_THIRTY_FOUR)).toBe("1.234");
    expect(formatNumber(ONE_MILLION_TWO_HUNDRED_THIRTY_FOUR_THOUSAND)).toBe(
      "1.234.567"
    );
  });

  it("should handle numbers without thousand separators", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(1)).toBe("1");
    expect(formatNumber(NINE_HUNDRED_NINETY_NINE)).toBe("999");
  });

  it("should handle different locales", () => {
    expect(formatNumber(ONE_THOUSAND, "en-US")).toBe("1,000");
    expect(formatNumber(ONE_THOUSAND, "de-DE")).toBe("1.000");
    // French uses narrow non-breaking space (U+202F)
    expect(formatNumber(ONE_THOUSAND, "fr-FR")).toBe("1\u202f000");
  });

  it("should handle edge cases", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(NEGATIVE_ONE_THOUSAND)).toBe("-1.000");
  });
});

// ============================================================================
// pluralize Tests
// ============================================================================

describe("pluralize", () => {
  const modelOptions: PluralOptions = {
    one: "1 modelo",
    other: "modelos",
    zero: "No hay modelos",
  };

  describe("zero case", () => {
    it("should return zero text when count is 0 and zero is provided", () => {
      expect(pluralize(0, modelOptions)).toBe("No hay modelos");
    });

    it("should return other text when count is 0 and zero is not provided", () => {
      const options: PluralOptions = {
        one: "1 modelo",
        other: "modelos",
      };
      expect(pluralize(0, options)).toBe("modelos");
    });
  });

  describe("one case", () => {
    it("should return one text when count is 1", () => {
      expect(pluralize(1, modelOptions)).toBe("1 modelo");
    });
  });

  describe("other case", () => {
    it("should return other text when count is greater than 1", () => {
      expect(pluralize(2, modelOptions)).toBe("modelos");
      expect(pluralize(10, modelOptions)).toBe("modelos");
      expect(pluralize(ONE_HUNDRED, modelOptions)).toBe("modelos");
    });
  });

  describe("edge cases", () => {
    it("should handle negative numbers", () => {
      expect(pluralize(-1, modelOptions)).toBe("modelos");
      expect(pluralize(NEGATIVE_FIVE, modelOptions)).toBe("modelos");
    });

    it("should handle different text patterns", () => {
      const customOptions: PluralOptions = {
        one: "Un resultado",
        other: "Varios resultados",
        zero: "Sin resultados",
      };
      expect(pluralize(0, customOptions)).toBe("Sin resultados");
      expect(pluralize(1, customOptions)).toBe("Un resultado");
      expect(pluralize(FIVE, customOptions)).toBe("Varios resultados");
    });
  });
});

// ============================================================================
// formatResultCount Tests
// ============================================================================

describe("formatResultCount", () => {
  describe("zero results", () => {
    it('should return "No se encontraron resultados" when count is 0', () => {
      expect(formatResultCount(0)).toBe("No se encontraron resultados");
    });
  });

  describe("one result", () => {
    it("should return singular form when count is 1", () => {
      expect(formatResultCount(1)).toBe("1 modelo encontrado");
    });
  });

  describe("multiple results", () => {
    it("should return plural form for small numbers", () => {
      expect(formatResultCount(2)).toBe("2 modelos encontrados");
      expect(formatResultCount(10)).toBe("10 modelos encontrados");
      expect(formatResultCount(NINETY_NINE)).toBe("99 modelos encontrados");
    });

    it("should return plural form with thousand separators", () => {
      expect(formatResultCount(ONE_THOUSAND)).toBe("1.000 modelos encontrados");
      expect(formatResultCount(ONE_THOUSAND_TWO_HUNDRED_THIRTY_FOUR)).toBe(
        "1.234 modelos encontrados"
      );
      expect(
        formatResultCount(ONE_MILLION_TWO_HUNDRED_THIRTY_FOUR_THOUSAND)
      ).toBe("1.234.567 modelos encontrados");
    });
  });

  describe("integration with formatNumber", () => {
    it("should use formatNumber for count formatting", () => {
      // Verify the number is properly formatted
      const result = formatResultCount(ONE_THOUSAND_FIVE_HUNDRED);
      expect(result).toContain("1.500");
      expect(result).toBe("1.500 modelos encontrados");
    });
  });

  describe("edge cases", () => {
    it("should handle large numbers", () => {
      expect(formatResultCount(NINE_HUNDRED_NINETY_NINE_THOUSAND)).toBe(
        "999.999 modelos encontrados"
      );
    });

    it("should handle negative numbers (edge case)", () => {
      // While count should never be negative in real usage,
      // the function should handle it gracefully
      expect(formatResultCount(-1)).toBe("-1 modelos encontrados");
    });
  });
});

// ============================================================================
// getResultCountParts Tests
// ============================================================================

describe("getResultCountParts", () => {
  describe("zero results", () => {
    it("should return null count and hasResults false when count is 0", () => {
      const result = getResultCountParts(0);
      expect(result).toEqual({
        count: null,
        hasResults: false,
      });
    });
  });

  describe("one result", () => {
    it("should return formatted count and hasResults true when count is 1", () => {
      const result = getResultCountParts(1);
      expect(result).toEqual({
        count: "1",
        hasResults: true,
      });
    });
  });

  describe("multiple results", () => {
    it("should return formatted count without separators for small numbers", () => {
      expect(getResultCountParts(2)).toEqual({
        count: "2",
        hasResults: true,
      });
      expect(getResultCountParts(NINETY_NINE)).toEqual({
        count: "99",
        hasResults: true,
      });
    });

    it("should return formatted count with separators for large numbers", () => {
      expect(getResultCountParts(ONE_THOUSAND)).toEqual({
        count: "1.000",
        hasResults: true,
      });
      expect(getResultCountParts(ONE_THOUSAND_TWO_HUNDRED_THIRTY_FOUR)).toEqual(
        {
          count: "1.234",
          hasResults: true,
        }
      );
    });
  });

  describe("integration with formatNumber", () => {
    it("should use formatNumber for count formatting", () => {
      const result = getResultCountParts(ONE_THOUSAND_FIVE_HUNDRED);
      expect(result.count).toBe("1.500");
      expect(result.hasResults).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle large numbers", () => {
      const result = getResultCountParts(NINE_HUNDRED_NINETY_NINE_THOUSAND);
      expect(result).toEqual({
        count: "999.999",
        hasResults: true,
      });
    });

    it("should handle negative numbers (edge case)", () => {
      const result = getResultCountParts(-1);
      expect(result).toEqual({
        count: "-1",
        hasResults: true,
      });
    });
  });
});

// ============================================================================
// Type Exports Validation
// ============================================================================

describe("Type Exports", () => {
  it("should export PluralOptions type", () => {
    const options: PluralOptions = {
      one: "one",
      other: "other",
      zero: "zero",
    };
    expect(options).toBeDefined();
  });

  it("should allow optional zero in PluralOptions", () => {
    const optionsWithoutZero: PluralOptions = {
      one: "one",
      other: "other",
    };
    expect(optionsWithoutZero.zero).toBeUndefined();
  });
});
