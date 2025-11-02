/**
 * Vitro Rojas - Sliding Window Models (Sistemas Corredizos)
 *
 * Data sources:
 * - Extralum Panamá: Catálogo VC Panamá (Serie 100/400)
 * - Extralum Panamá: Sistema Corredizo Europa Clásica (3 vías)
 * - Vitro Rojas: Sistema de cotización por m² y cantidad de paños
 *
 * Sistema de Precios Vitro Rojas:
 * - 2 paños: $130 USD/m²
 * - 3 paños: $150 USD/m²
 * - 4 paños: $165 USD/m²
 *
 * Fórmulas de corte para vidrio:
 * - 2 paños: Alto = H-66mm, Ancho = (W-7mm)÷2
 * - 3 paños: Alto = H-66mm, Ancho = (W+63mm)÷3
 * - 4 paños: Alto = H-66mm, Ancho = (W+48mm)÷4
 *
 * @version 1.0.0
 * @date 2025-01-21
 */

import type { ModelInput } from "../../factories/model.factory";

/**
 * Sistema Corredizo VC Panamá
 *
 * Características:
 * - Perfiles Serie 100/400
 * - Espesores: 1.10-1.52mm
 * - Vidrios compatibles: 6mm simple, 33.1mm laminado
 * - Sistema económico y funcional
 */

/**
 * VC Panamá 2 Paños (OX o XO)
 *
 * Configuración: 1 paño móvil + 1 paño fijo
 * Restricciones Extralum:
 * - Ancho móvil (X): 250-1350mm
 * - Alto móvil (X): 272-1850mm
 * - Ancho fijo (O): 250-1600mm
 * - Alto fijo (O): 272-1850mm
 */
export const vcPanama2Panos: ModelInput = {
	accessoryPrice: 45, // USD - Rodines, cerraduras, felpas
	basePrice: 130, // USD/m²
	compatibleGlassTypeIds: ["placeholder"], // Se populará automáticamente con todos los tipos de vidrio
	costNotes:
		"Precio base $130/m². Compatible con vidrio simple 6-8mm o laminado 33.1mm.",
	costPerMmHeight: 0.012, // $0.012 USD/mm (factor de ajuste por altura)
	costPerMmWidth: 0.015, // $0.015 USD/mm (factor de ajuste por ancho)
	glassDiscountHeightMm: 66, // Fórmula Vitro Rojas: Alto = H - 66mm
	glassDiscountWidthMm: 4, // Por paño: (W-7mm)÷2 ≈ W/2 - 3.5mm (redondeado a 4)
	maxHeightMm: 1850,
	maxWidthMm: 2950, // 1350mm móvil + 1600mm fijo
	minHeightMm: 272,
	minWidthMm: 500, // 250mm móvil + 250mm fijo
	name: "Corredizo VC Panamá 2 Paños (OX)",
	profileSupplierName: "Extralum",
	profitMarginPercentage: 35, // 35% margen sobre costos
	status: "published",
};

/**
 * VC Panamá 3 Paños (XOX)
 *
 * Configuración: 2 paños móviles + 1 paño fijo central
 */
export const vcPanama3Panos: ModelInput = {
	accessoryPrice: 65, // USD - Más rodines y cerraduras
	basePrice: 150, // USD/m²
	compatibleGlassTypeIds: ["placeholder"],
	costNotes: "Precio base $150/m². Sistema de 3 vías con paño central fijo.",
	costPerMmHeight: 0.013,
	costPerMmWidth: 0.017,
	glassDiscountHeightMm: 66, // Alto = H - 66mm
	glassDiscountWidthMm: 21, // Por paño: (W+63mm)÷3 ≈ W/3 + 21mm de descuento total
	maxHeightMm: 1850,
	maxWidthMm: 4550, // 3 paños (1350+1600+1600)
	minHeightMm: 272,
	minWidthMm: 750, // 3x250mm
	name: "Corredizo VC Panamá 3 Paños (XOX)",
	profileSupplierName: "Extralum",
	profitMarginPercentage: 35,
	status: "published",
};

/**
 * VC Panamá 4 Paños (OXXO)
 *
 * Configuración: 2 paños móviles centrales + 2 paños fijos laterales
 */
export const vcPanama4Panos: ModelInput = {
	accessoryPrice: 85, // USD - Mayor cantidad de accesorios
	basePrice: 165, // USD/m²
	compatibleGlassTypeIds: ["placeholder"],
	costNotes: "Precio base $165/m². Sistema de 4 paños con laterales fijos.",
	costPerMmHeight: 0.014,
	costPerMmWidth: 0.018,
	glassDiscountHeightMm: 66, // Alto = H - 66mm
	glassDiscountWidthMm: 12, // Por paño: (W+48mm)÷4 = W/4 + 12mm
	maxHeightMm: 1850,
	maxWidthMm: 5900, // 4 paños (1350+1350+1600+1600)
	minHeightMm: 272,
	minWidthMm: 1000, // 4x250mm
	name: "Corredizo VC Panamá 4 Paños (OXXO)",
	profileSupplierName: "Extralum",
	profitMarginPercentage: 35,
	status: "published",
};

/**
 * Sistema Corredizo Europa Clásica
 *
 * Características:
 * - Perfiles EX-1289, EX-1379, EX-1399, EX-1401
 * - Espesores: 1.10-1.70mm (más robusto que VC)
 * - Vidrios compatibles: 6-12mm simple, DVH 16-18.5mm
 * - Sistema premium con mejor estanqueidad
 */

/**
 * Europa Clásica 2 Paños (OX)
 *
 * Restricciones Extralum:
 * - Ancho móvil (X): 402-1600mm
 * - Alto móvil (X): 320-2800mm
 * - Ancho fijo (O): 402-1600mm
 * - Alto fijo (O): 320-2800mm
 */
export const europaClasica2Panos: ModelInput = {
	accessoryPrice: 55, // USD - Accesorios premium
	basePrice: 140, // USD/m² (premium sobre VC)
	compatibleGlassTypeIds: ["placeholder"],
	costNotes:
		"Precio base $140/m². Compatible con vidrio simple 6-12mm o DVH 16-18.5mm. Sistema premium.",
	costPerMmHeight: 0.014,
	costPerMmWidth: 0.017,
	glassDiscountHeightMm: 66,
	glassDiscountWidthMm: 4,
	maxHeightMm: 2800,
	maxWidthMm: 3200, // 1600mm + 1600mm
	minHeightMm: 320,
	minWidthMm: 804, // 402mm + 402mm
	name: "Corredizo Europa Clásica 2 Paños (OX)",
	profileSupplierName: "Extralum",
	profitMarginPercentage: 38, // Mayor margen por ser premium
	status: "published",
};

/**
 * Europa Clásica 3 Paños (XOX)
 */
export const europaClasica3Panos: ModelInput = {
	accessoryPrice: 75, // USD
	basePrice: 160, // USD/m²
	compatibleGlassTypeIds: ["placeholder"],
	costNotes: "Precio base $160/m². Sistema premium de 3 vías con DVH.",
	costPerMmHeight: 0.015,
	costPerMmWidth: 0.019,
	glassDiscountHeightMm: 66,
	glassDiscountWidthMm: 21,
	maxHeightMm: 2800,
	maxWidthMm: 4800, // 3x1600mm
	minHeightMm: 320,
	minWidthMm: 1206, // 3x402mm
	name: "Corredizo Europa Clásica 3 Paños (XOX)",
	profileSupplierName: "Extralum",
	profitMarginPercentage: 38,
	status: "published",
};

/**
 * Europa Clásica 4 Paños (OXXO)
 */
export const europaClasica4Panos: ModelInput = {
	accessoryPrice: 95, // USD
	basePrice: 175, // USD/m²
	compatibleGlassTypeIds: ["placeholder"],
	costNotes: "Precio base $175/m². Sistema premium de 4 paños con DVH.",
	costPerMmHeight: 0.016,
	costPerMmWidth: 0.02,
	glassDiscountHeightMm: 66,
	glassDiscountWidthMm: 12,
	maxHeightMm: 2800,
	maxWidthMm: 6400, // 4x1600mm
	minHeightMm: 320,
	minWidthMm: 1608, // 4x402mm
	name: "Corredizo Europa Clásica 4 Paños (OXXO)",
	profileSupplierName: "Extralum",
	profitMarginPercentage: 38,
	status: "published",
};

/**
 * Todos los modelos de sistemas corredizos
 * Total: 6 modelos (3 VC Panamá + 3 Europa Clásica)
 */
export const vitroRojasSlidingModels: ModelInput[] = [
	vcPanama2Panos,
	vcPanama3Panos,
	vcPanama4Panos,
	europaClasica2Panos,
	europaClasica3Panos,
	europaClasica4Panos,
];
