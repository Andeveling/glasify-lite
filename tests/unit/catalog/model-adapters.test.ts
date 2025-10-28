import { describe, expect, it } from "vitest";
import { adaptModelFromServer } from "../../../src/app/(public)/catalog/[modelId]/_utils/adapters";
import type { ModelDetailOutput } from "../../../src/server/api/routers/catalog";

describe("adaptModelFromServer", () => {
  const baseMockModel: ModelDetailOutput = {
    accessoryPrice: null,
    basePrice: 150_000,
    compatibleGlassTypeIds: ["glass-1", "glass-2"],
    costPerMmHeight: 100,
    costPerMmWidth: 80,
    createdAt: new Date("2024-01-15"),
    id: "test-id-123",
    maxHeightMm: 2200,
    maxWidthMm: 2400,
    minHeightMm: 800,
    minWidthMm: 600,
    name: "Ventana Corrediza Moderna",
    profileSupplier: null,
    status: "published" as const,
    updatedAt: new Date("2024-01-20"),
  };

  describe("Material-Specific Features Enhancement", () => {
    it("should include PVC material benefits in features array", () => {
      const modelWithPVC: ModelDetailOutput = {
        ...baseMockModel,
        profileSupplier: {
          id: "supplier-pvc",
          materialType: "PVC",
          name: "Deceuninck",
        },
      };

      const adapted = adaptModelFromServer(modelWithPVC);

      // Should include base features
      expect(adapted.features).toContain("Fabricación de alta calidad");
      expect(adapted.features).toContain("Garantía del fabricante");

      // Should include PVC-specific benefits
      expect(adapted.features).toContain("Excelente aislamiento térmico");
      expect(adapted.features).toContain(
        "Bajo mantenimiento - No requiere pintura"
      );
      expect(adapted.features).toContain("Resistente a la corrosión y humedad");
      expect(adapted.features).toContain("Alta reducción de ruido exterior");

      // Total features: 2 base + 4 PVC = 6
      expect(adapted.features).toHaveLength(6);
    });

    it("should include Aluminum material benefits in features array", () => {
      const modelWithAluminum: ModelDetailOutput = {
        ...baseMockModel,
        profileSupplier: {
          id: "supplier-aluminum",
          materialType: "ALUMINUM",
          name: "Alumina",
        },
      };

      const adapted = adaptModelFromServer(modelWithAluminum);

      // Should include base features
      expect(adapted.features).toContain("Fabricación de alta calidad");
      expect(adapted.features).toContain("Garantía del fabricante");

      // Should include Aluminum-specific benefits
      expect(adapted.features).toContain("Máxima resistencia estructural");
      expect(adapted.features).toContain(
        "Perfiles delgados y estética moderna"
      );
      expect(adapted.features).toContain("Durabilidad excepcional");
      expect(adapted.features).toContain("Ideal para grandes dimensiones");

      // Total features: 2 base + 4 Aluminum = 6
      expect(adapted.features).toHaveLength(6);
    });

    it("should include Wood material benefits in features array", () => {
      const modelWithWood: ModelDetailOutput = {
        ...baseMockModel,
        profileSupplier: {
          id: "supplier-wood",
          materialType: "WOOD",
          name: "WoodCraft",
        },
      };

      const adapted = adaptModelFromServer(modelWithWood);

      // Should include Wood-specific benefits
      expect(adapted.features).toContain("Calidez natural y estética clásica");
      expect(adapted.features).toContain("Excelente aislamiento térmico");
      expect(adapted.features).toContain("Renovable y ecológico");
      expect(adapted.features).toContain("Personalizable con acabados");

      // Total features: 2 base + 4 Wood = 6
      expect(adapted.features).toHaveLength(6);
    });

    it("should include Mixed material benefits in features array", () => {
      const modelWithMixed: ModelDetailOutput = {
        ...baseMockModel,
        profileSupplier: {
          id: "supplier-mixed",
          materialType: "MIXED",
          name: "HybridWindows",
        },
      };

      const adapted = adaptModelFromServer(modelWithMixed);

      // Should include Mixed-specific benefits
      expect(adapted.features).toContain(
        "Combina ventajas de múltiples materiales"
      );
      expect(adapted.features).toContain("Versatilidad en aplicaciones");
      expect(adapted.features).toContain(
        "Balance entre estética y rendimiento"
      );

      // Total features: 2 base + 3 Mixed = 5
      expect(adapted.features).toHaveLength(5);
    });

    it("should only include base features when profileSupplier is NULL", () => {
      const modelWithoutSupplier: ModelDetailOutput = {
        ...baseMockModel,
        profileSupplier: null,
      };

      const adapted = adaptModelFromServer(modelWithoutSupplier);

      // Should only have base features
      expect(adapted.features).toContain("Fabricación de alta calidad");
      expect(adapted.features).toContain("Garantía del fabricante");

      // Should NOT include any material-specific benefits
      expect(adapted.features).not.toContain("Excelente aislamiento térmico");
      expect(adapted.features).not.toContain("Máxima resistencia estructural");

      // Total features: 2 base only
      expect(adapted.features).toHaveLength(2);
    });

    it("should preserve correct feature order: base features first, then material benefits", () => {
      const modelWithPVC: ModelDetailOutput = {
        ...baseMockModel,
        profileSupplier: {
          id: "supplier-pvc",
          materialType: "PVC",
          name: "Deceuninck",
        },
      };

      const adapted = adaptModelFromServer(modelWithPVC);

      // First two items should be base features
      expect(adapted.features[0]).toBe("Fabricación de alta calidad");
      expect(adapted.features[1]).toBe("Garantía del fabricante");

      // Remaining items should be PVC benefits
      expect(adapted.features.slice(2)).toEqual([
        "Excelente aislamiento térmico",
        "Bajo mantenimiento - No requiere pintura",
        "Resistente a la corrosión y humedad",
        "Alta reducción de ruido exterior",
      ]);
    });
  });

  describe("ProfileSupplier Object Mapping", () => {
    it("should correctly map profileSupplier object with materialType", () => {
      const modelWithSupplier: ModelDetailOutput = {
        ...baseMockModel,
        profileSupplier: {
          id: "supplier-123",
          materialType: "PVC",
          name: "Deceuninck",
        },
      };

      const adapted = adaptModelFromServer(modelWithSupplier);

      expect(adapted.profileSupplier).toEqual({
        id: "supplier-123",
        materialType: "PVC",
        name: "Deceuninck",
      });
    });

    it("should set profileSupplier to null when missing", () => {
      const modelWithoutSupplier: ModelDetailOutput = {
        ...baseMockModel,
        profileSupplier: null,
      };

      const adapted = adaptModelFromServer(modelWithoutSupplier);

      expect(adapted.profileSupplier).toBeNull();
    });
  });

  describe("Dimensions Mapping", () => {
    it("should correctly map dimensional constraints", () => {
      const adapted = adaptModelFromServer(baseMockModel);

      expect(adapted.dimensions).toEqual({
        maxHeight: 2200,
        maxWidth: 2400,
        minHeight: 800,
        minWidth: 600,
      });
    });
  });

  describe("Other Fields Mapping", () => {
    it("should map basic fields correctly", () => {
      const adapted = adaptModelFromServer(baseMockModel);

      expect(adapted.id).toBe("test-id-123");
      expect(adapted.name).toBe("Ventana Corrediza Moderna");
      expect(adapted.basePrice).toBe(150_000);
      expect(adapted.currency).toBe("USD");
    });

    it("should include placeholder description and imageUrl", () => {
      const adapted = adaptModelFromServer(baseMockModel);

      expect(adapted.description).toBe(
        "Modelo de alta calidad con excelentes características"
      );
      expect(adapted.imageUrl).toBe("/modern-aluminum-sliding-window.jpg");
    });
  });
});
