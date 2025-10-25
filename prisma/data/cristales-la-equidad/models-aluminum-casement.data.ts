/**
 * Vidrios La Equidad - Aluminum Casement Window Models
 *
 * Data source: https://cristaleslaequidad.com/
 * Puertas ventanas en aluminio (ventanas abatibles)
 *
 * Sistemas de apertura interna/externa
 * Aplicación: Residencial, comercial e institucional
 *
 * Mercado: Valle del Cauca, Quindío y Risaralda
 * Precios en COP (Pesos Colombianos)
 *
 * @version 1.0.0
 * @date 2025-01-25
 */

import type { ModelInput } from '../../factories/model.factory';

/**
 * Ventana Abatible Aluminio 1 Hoja
 *
 * Sistema de apertura interior o exterior
 * Configuración: 1 hoja móvil
 */
export const aluminumCasement1Panel: ModelInput = {
  accessoryPrice: 140_000, // COP - Herrajes y bisagras
  basePrice: 420_000, // COP/m²
  compatibleGlassTypeIds: ['placeholder'],
  costNotes: 'Precio base $420.000/m². Ventana abatible 1 hoja con herrajes de alta durabilidad.',
  costPerMmHeight: 42,
  costPerMmWidth: 45,
  glassDiscountHeightMm: 68,
  glassDiscountWidthMm: 12,
  maxHeightMm: 2200,
  maxWidthMm: 1200,
  minHeightMm: 600,
  minWidthMm: 600,
  name: 'Ventana Abatible Aluminio 1 Hoja',
  profileSupplierName: 'Sistemas Aluminio Nacional',
  profitMarginPercentage: 35,
  status: 'published',
};

/**
 * Ventana Abatible Aluminio 2 Hojas
 *
 * Sistema de doble hoja con apertura independiente
 * Ideal para ventilación y espacios amplios
 */
export const aluminumCasement2Panels: ModelInput = {
  accessoryPrice: 180_000, // COP
  basePrice: 460_000, // COP/m²
  compatibleGlassTypeIds: ['placeholder'],
  costNotes: 'Precio base $460.000/m². Ventana abatible 2 hojas con apertura independiente.',
  costPerMmHeight: 45,
  costPerMmWidth: 48,
  glassDiscountHeightMm: 68,
  glassDiscountWidthMm: 15,
  maxHeightMm: 2200,
  maxWidthMm: 2400,
  minHeightMm: 600,
  minWidthMm: 1200,
  name: 'Ventana Abatible Aluminio 2 Hojas',
  profileSupplierName: 'Sistemas Aluminio Nacional',
  profitMarginPercentage: 35,
  status: 'published',
};

/**
 * Puerta Ventana Aluminio 1 Hoja
 *
 * Puerta de piso a techo con apertura abatible
 * Aplicación: Acceso a terrazas, balcones, jardines
 */
export const aluminumDoor1Panel: ModelInput = {
  accessoryPrice: 200_000, // COP - Herrajes reforzados y cerradura
  basePrice: 480_000, // COP/m²
  compatibleGlassTypeIds: ['placeholder'],
  costNotes: 'Precio base $480.000/m². Puerta ventana con herrajes reforzados y cerradura de seguridad.',
  costPerMmHeight: 47,
  costPerMmWidth: 50,
  glassDiscountHeightMm: 70,
  glassDiscountWidthMm: 12,
  maxHeightMm: 2400,
  maxWidthMm: 1200,
  minHeightMm: 1800,
  minWidthMm: 700,
  name: 'Puerta Ventana Aluminio 1 Hoja',
  profileSupplierName: 'Sistemas Aluminio Nacional',
  profitMarginPercentage: 35,
  status: 'published',
};

/**
 * All aluminum casement models
 */
export const cristalesLaEquidadAluminumCasementModels: ModelInput[] = [
  aluminumCasement1Panel,
  aluminumCasement2Panels,
  aluminumDoor1Panel,
];
