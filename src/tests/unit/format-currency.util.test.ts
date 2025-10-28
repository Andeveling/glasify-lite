/**
 * @fileoverview Tests for currency formatting utilities
 * biome-ignore-all lint/style/noMagicNumbers: Test values are intentionally hardcoded for clarity
 */
import { describe, expect, it } from "vitest";
import {
  CurrencyCodes,
  formatCOP,
  formatCurrency,
  formatCurrencyCompact,
  LocaleCodes,
  parseCurrency,
} from "../../app/_utils/format-currency.util";

describe("formatCurrency", () => {
  describe("basic formatting", () => {
    it("formats Colombian Pesos with default options", () => {
      const result = formatCurrency(285_000);
      // Note: COP format uses non-breaking space (U+00A0) between symbol and number
      expect(result).toBe("$\u00A0285.000");
    });

    it("formats without grouping separators", () => {
      const result = formatCurrency(285_000, { useGrouping: false });
      expect(result).toBe("$\u00A0285000");
    });

    it("formats with decimals", () => {
      const result = formatCurrency(285_000.5, { decimals: 2 });
      expect(result).toBe("$\u00A0285.000,50");
    });

    it("formats zero correctly", () => {
      const result = formatCurrency(0);
      expect(result).toBe("$\u00A00");
    });

    it("formats negative numbers", () => {
      const result = formatCurrency(-285_000);
      expect(result).toContain("285.000");
    });
  });

  describe("different currencies", () => {
    it("formats USD with US locale", () => {
      const result = formatCurrency(285_000, {
        currency: CurrencyCodes.usd,
        locale: LocaleCodes.enUs,
      });
      expect(result).toBe("$285,000");
    });

    it("formats EUR with Spanish locale", () => {
      const result = formatCurrency(285_000, {
        currency: CurrencyCodes.eur,
        locale: LocaleCodes.esEs,
      });
      expect(result).toContain("285.000");
      expect(result).toContain("€");
    });

    it("formats MXN with Mexican locale", () => {
      const result = formatCurrency(285_000, {
        currency: CurrencyCodes.mxn,
        locale: LocaleCodes.esMx,
      });
      expect(result).toContain("285,000");
    });
  });

  describe("display modes", () => {
    it("displays currency symbol by default", () => {
      const result = formatCurrency(285_000);
      expect(result).toContain("$");
    });

    it("displays currency code when requested", () => {
      const result = formatCurrency(285_000, { display: "code" });
      expect(result).toContain("COP");
    });

    it("displays currency name when requested", () => {
      const result = formatCurrency(285_000, { display: "name" });
      // The exact name depends on locale implementation
      expect(result).toBeTruthy();
    });
  });
});

describe("formatCOP", () => {
  it("formats COP without decimals by default", () => {
    const result = formatCOP(285_000);
    expect(result).toBe("$\u00A0285.000");
  });

  it("formats COP with decimals when requested", () => {
    const result = formatCOP(285_000.5, true);
    expect(result).toBe("$\u00A0285.000,50");
  });

  it("handles whole numbers with decimal flag", () => {
    const result = formatCOP(285_000, true);
    expect(result).toBe("$\u00A0285.000,00");
  });
});

describe("formatCurrencyCompact", () => {
  it("formats large numbers in compact notation", () => {
    const result = formatCurrencyCompact(1_500_000);
    // Could be "$1,5 M" or similar depending on locale
    expect(result).toContain("1");
    expect(result.length).toBeLessThan(15);
  });

  it("formats thousands in compact notation", () => {
    const result = formatCurrencyCompact(2500);
    expect(result).toBeTruthy();
  });

  it("formats millions correctly", () => {
    const result = formatCurrencyCompact(5_000_000);
    expect(result).toContain("5");
  });
});

describe("parseCurrency", () => {
  describe("Colombian format", () => {
    it("parses Colombian formatted currency", () => {
      const result = parseCurrency("$285.000");
      expect(result).toBe(285_000);
    });

    it("parses with decimals", () => {
      const result = parseCurrency("$285.000,50");
      expect(result).toBe(285_000.5);
    });

    it("parses without currency symbol", () => {
      const result = parseCurrency("285.000");
      expect(result).toBe(285_000);
    });

    it("parses with COP code", () => {
      const result = parseCurrency("285.000 COP");
      expect(result).toBe(285_000);
    });
  });

  describe("US format", () => {
    it("parses US formatted currency", () => {
      const result = parseCurrency("$285,000", LocaleCodes.enUs);
      expect(result).toBe(285_000);
    });

    it("parses US format with decimals", () => {
      const result = parseCurrency("$285,000.50", LocaleCodes.enUs);
      expect(result).toBe(285_000.5);
    });
  });

  describe("edge cases", () => {
    it("returns 0 for empty string", () => {
      const result = parseCurrency("");
      expect(result).toBe(0);
    });

    it("returns 0 for invalid input", () => {
      const result = parseCurrency("invalid");
      expect(result).toBe(0);
    });

    it("returns 0 for only symbols", () => {
      const result = parseCurrency("$$$");
      expect(result).toBe(0);
    });
  });
});

describe("currency and locale constants", () => {
  it("exports currency codes", () => {
    expect(CurrencyCodes.cop).toBe("COP");
    expect(CurrencyCodes.usd).toBe("USD");
    expect(CurrencyCodes.eur).toBe("EUR");
    expect(CurrencyCodes.mxn).toBe("MXN");
  });

  it("exports locale codes", () => {
    expect(LocaleCodes.esCo).toBe("es-CO");
    expect(LocaleCodes.enUs).toBe("en-US");
    expect(LocaleCodes.esMx).toBe("es-MX");
    expect(LocaleCodes.esEs).toBe("es-ES");
  });
});
