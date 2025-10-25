/**
 * Vidrios La Equidad - Aluminum Sliding Window Models
 *
 * Data source: https://vidrioslaequidad.com/
 * Productos en aluminio para mercado residencial y comercial
 *
 * Sistemas corredizos en aluminio:
 * - 2 paños (OX o XO) - Configuración básica
 * - 3 paños (XOX) - Configuración intermedia
 * - 4 paños (OXXO) - Configuración premium
 *
 * Mercado: Valle del Cauca, Quindío y Risaralda
 * Precios en COP (Pesos Colombianos)
 *
 * @version 1.0.0
 * @date 2025-01-25
 */

import type { ModelInput } from '../../factories/model.factory';

/**
 * Ventana Corrediza Aluminio 2 Paños (OX o XO)
 *
 * Configuración: 1 paño móvil + 1 paño fijo
 * Uso: Residencial y comercial
 * Características:
 * - Sistema económico y funcional
 * - Fácil mantenimiento
 * - Operación suave
 */
export const aluminumSliding2Panes: ModelInput = {
  accessoryPrice: 120_000, // COP - Rodines, cerraduras, felpas
  basePrice: 380_000, // COP/m²
  compatibleGlassTypeIds: ['placeholder'],
  costNotes: 'Precio base $380.000/m². Sistema corredizo en aluminio con herrajes de calidad.',
  costPerMmHeight: 35, // COP/mm - Factor de ajuste por altura
  costPerMmWidth: 40, // COP/mm - Factor de ajuste por ancho
  glassDiscountHeightMm: 66, // Descuento para cálculo de cristal
  glassDiscountWidthMm: 7, // Descuento total entre paños
  maxHeightMm: 2400,
  maxWidthMm: 3000,
  minHeightMm: 600,
  minWidthMm: 800,
  name: 'Ventana Corrediza Aluminio 2 Paños',
  profileSupplierName: 'Sistemas Aluminio Nacional',
  profitMarginPercentage: 35,
  status: 'published',
};

/**
 * Ventana Corrediza Aluminio 3 Paños (XOX)
 *
 * Configuración: 2 paños móviles + 1 paño fijo central
 * Uso: Residencial, comercial e institucional
 */
export const aluminumSliding3Panes: ModelInput = {
  accessoryPrice: 180_000, // COP
  basePrice: 420_000, // COP/m²
  compatibleGlassTypeIds: ['placeholder'],
  costNotes: 'Precio base $420.000/m². Sistema de 3 vías con paño central fijo.',
  costPerMmHeight: 38,
  costPerMmWidth: 45,
  glassDiscountHeightMm: 66,
  glassDiscountWidthMm: 21,
  maxHeightMm: 2400,
  maxWidthMm: 4500,
  minHeightMm: 600,
  minWidthMm: 1200,
  name: 'Ventana Corrediza Aluminio 3 Paños',
  profileSupplierName: 'Sistemas Aluminio Nacional',
  profitMarginPercentage: 35,
  status: 'published',
};

/**
 * Ventana Corrediza Aluminio 4 Paños (OXXO)
 *
 * Configuración: 2 paños móviles centrales + 2 paños fijos laterales
 * Uso: Comercial e institucional, fachadas amplias
 */
export const aluminumSliding4Panes: ModelInput = {
  accessoryPrice: 240_000, // COP
  basePrice: 460_000, // COP/m²
  compatibleGlassTypeIds: ['placeholder'],
  costNotes: 'Precio base $460.000/m². Sistema de 4 paños con laterales fijos.',
  costPerMmHeight: 40,
  costPerMmWidth: 48,
  glassDiscountHeightMm: 66,
  glassDiscountWidthMm: 28,
  maxHeightMm: 2400,
  maxWidthMm: 6000,
  minHeightMm: 600,
  minWidthMm: 1600,
  name: 'Ventana Corrediza Aluminio 4 Paños',
  profileSupplierName: 'Sistemas Aluminio Nacional',
  profitMarginPercentage: 35,
  status: 'published',
};

/**
 * All aluminum sliding models
 */
export const vidriosLaEquidadAluminumSlidingModels: ModelInput[] = [
  aluminumSliding2Panes,
  aluminumSliding3Panes,
  aluminumSliding4Panes,
];
