/**
 * Vidrios La Equidad - PVC Deceuninck Window Models
 *
 * Data source: https://vidrioslaequidad.com/
 * Sistemas PVC Deceuninck de alta gama
 *
 * Características Deceuninck:
 * - Excelente aislamiento térmico y acústico
 * - Mayor eficiencia energética
 * - Durabilidad superior
 * - Estética premium
 *
 * Mercado: Valle del Cauca, Quindío y Risaralda
 * Precios en COP (Pesos Colombianos)
 *
 * @version 1.0.0
 * @date 2025-01-25
 */

import type { ModelInput } from "../../factories/model.factory";

/**
 * Ventana PVC Deceuninck Corrediza 2 Paños
 *
 * Sistema PVC de alta gama con excelente aislamiento
 * Configuración: 1 paño móvil + 1 paño fijo
 */
export const pvcSliding2Panes: ModelInput = {
	accessoryPrice: 150_000, // COP - Herrajes europeos de alta calidad
	basePrice: 520_000, // COP/m² - PVC premium
	compatibleGlassTypeIds: ["placeholder"],
	costNotes:
		"Precio base $520.000/m². Sistema PVC Deceuninck con aislamiento térmico y acústico superior.",
	costPerMmHeight: 45,
	costPerMmWidth: 50,
	glassDiscountHeightMm: 70,
	glassDiscountWidthMm: 10,
	maxHeightMm: 2400,
	maxWidthMm: 3000,
	minHeightMm: 600,
	minWidthMm: 800,
	name: "Ventana PVC Deceuninck Corrediza 2 Paños",
	profileSupplierName: "Deceuninck",
	profitMarginPercentage: 38,
	status: "published",
};

/**
 * Ventana PVC Deceuninck Abatible 1 Hoja
 *
 * Sistema abatible PVC con apertura interna o externa
 * Excelente hermeticidad y aislamiento
 */
export const pvcCasement1Panel: ModelInput = {
	accessoryPrice: 180_000, // COP - Herrajes de apertura premium
	basePrice: 560_000, // COP/m²
	compatibleGlassTypeIds: ["placeholder"],
	costNotes:
		"Precio base $560.000/m². Sistema abatible PVC con hermeticidad superior.",
	costPerMmHeight: 48,
	costPerMmWidth: 52,
	glassDiscountHeightMm: 75,
	glassDiscountWidthMm: 12,
	maxHeightMm: 2200,
	maxWidthMm: 1200,
	minHeightMm: 600,
	minWidthMm: 600,
	name: "Ventana PVC Deceuninck Abatible 1 Hoja",
	profileSupplierName: "Deceuninck",
	profitMarginPercentage: 38,
	status: "published",
};

/**
 * Ventana PVC Deceuninck Abatible 2 Hojas
 *
 * Sistema abatible PVC de doble hoja
 * Ideal para espacios amplios que requieren ventilación
 */
export const pvcCasement2Panels: ModelInput = {
	accessoryPrice: 220_000, // COP
	basePrice: 590_000, // COP/m²
	compatibleGlassTypeIds: ["placeholder"],
	costNotes:
		"Precio base $590.000/m². Sistema abatible doble hoja con máxima eficiencia energética.",
	costPerMmHeight: 50,
	costPerMmWidth: 55,
	glassDiscountHeightMm: 75,
	glassDiscountWidthMm: 15,
	maxHeightMm: 2200,
	maxWidthMm: 2400,
	minHeightMm: 600,
	minWidthMm: 1200,
	name: "Ventana PVC Deceuninck Abatible 2 Hojas",
	profileSupplierName: "Deceuninck",
	profitMarginPercentage: 38,
	status: "published",
};

/**
 * All PVC Deceuninck models
 */
export const vidriosLaEquidadPVCModels: ModelInput[] = [
	pvcSliding2Panes,
	pvcCasement1Panel,
	pvcCasement2Panels,
];
