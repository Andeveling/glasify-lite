/**
 * Tests unitarios para QuoteValidatorService
 *
 * Estos tests NO requieren base de datos.
 * Solo validan lógica de negocio pura.
 */

import type { Model, QuoteStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";
import {
  type ValidationError,
  validateColorSurcharge,
  validateDimensions,
  validateGlassTypeCompatibility,
  validateModelAvailability,
  validateQuantity,
  validateQuoteStatus,
} from "@/domain/quotes/services/quote-validator.service";

describe("QuoteValidatorService", () => {
  describe("validateGlassTypeCompatibility", () => {
    it("should throw error if glass type is not compatible", () => {
      const model = {
        id: "model-1",
        name: "Ventana Corrediza",
        compatibleGlassTypeIds: ["glass-1", "glass-2"],
      } as Model;

      expect(() => {
        validateGlassTypeCompatibility(model, "glass-3");
      }).toThrow("Tipo de vidrio no compatible");
    });

    it("should NOT throw if glass type is compatible", () => {
      const model = {
        id: "model-1",
        name: "Ventana Corrediza",
        compatibleGlassTypeIds: ["glass-1", "glass-2"],
      } as Model;

      expect(() => {
        validateGlassTypeCompatibility(model, "glass-1");
      }).not.toThrow();
    });

    it("should include model name in error message", () => {
      const model = {
        id: "model-1",
        name: "Ventana Batiente",
        compatibleGlassTypeIds: ["glass-1"],
      } as Model;

      try {
        validateGlassTypeCompatibility(model, "glass-999");
      } catch (error) {
        expect((error as ValidationError).message).toContain(
          "Ventana Batiente"
        );
        expect((error as ValidationError).code).toBe("INCOMPATIBLE_GLASS_TYPE");
      }
    });
  });

  describe("validateDimensions", () => {
    const MIN_WIDTH_MM = 500;
    const MAX_WIDTH_MM = 2000;
    const MIN_HEIGHT_MM = 600;
    const MAX_HEIGHT_MM = 2500;
    const VALID_WIDTH_MM = 1000;
    const VALID_HEIGHT_MM = 1500;
    const BELOW_MIN_WIDTH_MM = 400;
    const ABOVE_MAX_WIDTH_MM = 2100;
    const BELOW_MIN_HEIGHT_MM = 500;
    const ABOVE_MAX_HEIGHT_MM = 3000;
    const TEST_INVALID_WIDTH_MM = 300;

    const model = {
      id: "model-1",
      name: "Ventana",
      minWidthMm: MIN_WIDTH_MM,
      maxWidthMm: MAX_WIDTH_MM,
      minHeightMm: MIN_HEIGHT_MM,
      maxHeightMm: MAX_HEIGHT_MM,
    } as Model;

    it("should throw error if width is below minimum", () => {
      expect(() => {
        validateDimensions(model, {
          widthMm: BELOW_MIN_WIDTH_MM,
          heightMm: VALID_WIDTH_MM,
        });
      }).toThrow("Ancho debe estar entre 500mm y 2000mm");
    });

    it("should throw error if width is above maximum", () => {
      expect(() => {
        validateDimensions(model, {
          widthMm: ABOVE_MAX_WIDTH_MM,
          heightMm: VALID_WIDTH_MM,
        });
      }).toThrow("Ancho debe estar entre 500mm y 2000mm");
    });

    it("should throw error if height is below minimum", () => {
      expect(() => {
        validateDimensions(model, {
          widthMm: VALID_WIDTH_MM,
          heightMm: BELOW_MIN_HEIGHT_MM,
        });
      }).toThrow("Alto debe estar entre 600mm y 2500mm");
    });

    it("should throw error if height is above maximum", () => {
      expect(() => {
        validateDimensions(model, {
          widthMm: VALID_WIDTH_MM,
          heightMm: ABOVE_MAX_HEIGHT_MM,
        });
      }).toThrow("Alto debe estar entre 600mm y 2500mm");
    });

    it("should NOT throw if dimensions are valid", () => {
      expect(() => {
        validateDimensions(model, {
          widthMm: VALID_WIDTH_MM,
          heightMm: VALID_HEIGHT_MM,
        });
      }).not.toThrow();
    });

    it("should accept dimensions at exact minimum", () => {
      expect(() => {
        validateDimensions(model, {
          widthMm: MIN_WIDTH_MM,
          heightMm: MIN_HEIGHT_MM,
        });
      }).not.toThrow();
    });

    it("should accept dimensions at exact maximum", () => {
      expect(() => {
        validateDimensions(model, {
          widthMm: MAX_WIDTH_MM,
          heightMm: MAX_HEIGHT_MM,
        });
      }).not.toThrow();
    });

    it("should include received value in error message", () => {
      try {
        validateDimensions(model, {
          widthMm: TEST_INVALID_WIDTH_MM,
          heightMm: VALID_WIDTH_MM,
        });
      } catch (error) {
        expect((error as ValidationError).message).toContain(
          `${TEST_INVALID_WIDTH_MM}mm`
        );
        expect((error as ValidationError).code).toBe("INVALID_WIDTH");
      }
    });
  });

  describe("validateQuoteStatus", () => {
    it("should throw error if status is not draft", () => {
      expect(() => {
        validateQuoteStatus("sent" as QuoteStatus, "agregar ítems");
      }).toThrow("No se puede agregar ítems en una cotización con estado");
    });

    it("should NOT throw if status is draft", () => {
      expect(() => {
        validateQuoteStatus("draft" as QuoteStatus, "agregar ítems");
      }).not.toThrow();
    });

    it("should include operation in error message", () => {
      try {
        validateQuoteStatus("cancelled" as QuoteStatus, "modificar precios");
      } catch (error) {
        expect((error as ValidationError).message).toContain(
          "modificar precios"
        );
        expect((error as ValidationError).code).toBe("INVALID_QUOTE_STATUS");
      }
    });
  });

  describe("validateModelAvailability", () => {
    it("should throw error if model is null", () => {
      expect(() => {
        validateModelAvailability(null);
      }).toThrow("Modelo no encontrado");
    });

    it("should throw error if model status is not published", () => {
      const model = {
        id: "model-1",
        name: "Ventana Draft",
        status: "draft",
      } as Model;

      expect(() => {
        validateModelAvailability(model);
      }).toThrow("no está disponible");
    });

    it("should NOT throw if model is published", () => {
      const model = {
        id: "model-1",
        name: "Ventana Publicada",
        status: "published",
      } as Model;

      expect(() => {
        validateModelAvailability(model);
      }).not.toThrow();
    });

    it("should include model name and status in error message", () => {
      const model = {
        id: "model-1",
        name: "Ventana Archivada",
        status: "archived",
      } as unknown as Model;

      try {
        validateModelAvailability(model);
      } catch (error) {
        expect((error as ValidationError).message).toContain(
          "Ventana Archivada"
        );
        expect((error as ValidationError).message).toContain("archived");
        expect((error as ValidationError).code).toBe("MODEL_NOT_AVAILABLE");
      }
    });

    it("should narrow type to Model after validation", () => {
      const maybeModel: Model | null = {
        id: "model-1",
        name: "Test",
        status: "published",
      } as Model;

      validateModelAvailability(maybeModel);

      // TypeScript should infer maybeModel as Model (not null)
      const modelName: string = maybeModel.name;
      expect(modelName).toBe("Test");
    });
  });

  describe("validateQuantity", () => {
    const ZERO = 0;
    const NEGATIVE_QUANTITY = -5;
    const DECIMAL_QUANTITY = 3.5;
    const VALID_QUANTITY = 10;
    const MIN_QUANTITY = 1;
    const TEST_NEGATIVE_VALUE = -3;

    it("should throw error if quantity is zero", () => {
      expect(() => {
        validateQuantity(ZERO);
      }).toThrow("La cantidad debe ser mayor a 0");
    });

    it("should throw error if quantity is negative", () => {
      expect(() => {
        validateQuantity(NEGATIVE_QUANTITY);
      }).toThrow("La cantidad debe ser mayor a 0");
    });

    it("should throw error if quantity is not an integer", () => {
      expect(() => {
        validateQuantity(DECIMAL_QUANTITY);
      }).toThrow("debe ser un número entero");
    });

    it("should NOT throw if quantity is a positive integer", () => {
      expect(() => {
        validateQuantity(VALID_QUANTITY);
      }).not.toThrow();
    });

    it("should accept quantity of 1", () => {
      expect(() => {
        validateQuantity(MIN_QUANTITY);
      }).not.toThrow();
    });

    it("should include received value in error message", () => {
      try {
        validateQuantity(TEST_NEGATIVE_VALUE);
      } catch (error) {
        expect((error as ValidationError).message).toContain(
          String(TEST_NEGATIVE_VALUE)
        );
        expect((error as ValidationError).code).toBe("INVALID_QUANTITY");
      }
    });
  });

  describe("validateColorSurcharge", () => {
    const NEGATIVE_PERCENTAGE = -10;
    const ABOVE_MAX_PERCENTAGE = 150;
    const MIN_PERCENTAGE = 0;
    const MAX_PERCENTAGE = 100;
    const VALID_PERCENTAGE = 50;
    const TEST_INVALID_PERCENTAGE = 120;

    it("should NOT throw if percentage is undefined", () => {
      expect(() => {
        validateColorSurcharge(undefined);
      }).not.toThrow();
    });

    it("should throw error if percentage is negative", () => {
      expect(() => {
        validateColorSurcharge(NEGATIVE_PERCENTAGE);
      }).toThrow("debe estar entre 0% y 100%");
    });

    it("should throw error if percentage is above 100", () => {
      expect(() => {
        validateColorSurcharge(ABOVE_MAX_PERCENTAGE);
      }).toThrow("debe estar entre 0% y 100%");
    });

    it("should NOT throw if percentage is 0", () => {
      expect(() => {
        validateColorSurcharge(MIN_PERCENTAGE);
      }).not.toThrow();
    });

    it("should NOT throw if percentage is 100", () => {
      expect(() => {
        validateColorSurcharge(MAX_PERCENTAGE);
      }).not.toThrow();
    });

    it("should NOT throw if percentage is within valid range", () => {
      expect(() => {
        validateColorSurcharge(VALID_PERCENTAGE);
      }).not.toThrow();
    });

    it("should include received value in error message", () => {
      try {
        validateColorSurcharge(TEST_INVALID_PERCENTAGE);
      } catch (error) {
        expect((error as ValidationError).message).toContain(
          `${TEST_INVALID_PERCENTAGE}%`
        );
        expect((error as ValidationError).code).toBe("INVALID_COLOR_SURCHARGE");
      }
    });
  });
});
