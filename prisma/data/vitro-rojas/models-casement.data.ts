/**
 * Vitro Rojas - Casement Window Models (Sistemas Abatibles)
 *
 * Data sources:
 * - Extralum Panamá: FT-026 Sistema de Ventana Abatible Europa
 * - Vitro Rojas: Sistema de cotización por m² y cantidad de hojas
 *
 * Sistema de Precios Vitro Rojas:
 * - 2 hojas: $130 USD/m²
 * - 3 hojas: $150 USD/m²
 * - 4 hojas: $170 USD/m²
 *
 * Fórmula de corte para marco perimetral:
 * - Alto = Alto total - 63mm
 * - Ancho = Ancho total - 63mm
 *
 * Características Sistema Abatible Europa:
 * - Perfiles con corte a 45° (elegancia y fortaleza)
 * - Espesores: 1.10-1.50mm
 * - Cerradura multipunto para seguridad
 * - Apertura interna o externa
 * - Vidrios: 6-12mm simple, DVH 12.5-18.5mm
 *
 * @version 1.0.0
 * @date 2025-01-21
 */

import type { ModelInput } from '../../factories/model.factory';

/**
 * Abatible Europa 2 Hojas (OX)
 *
 * Configuración: 1 hoja móvil + 1 hoja fija
 *
 * Restricciones Extralum (contramarco EX-1385):
 * - Ancho hoja móvil (X): 478-1050mm
 * - Alto hoja móvil (X): 478-2000mm
 * - Ancho hoja fija (O): 395-2400mm
 * - Alto hoja fija (O): 395-2800mm
 *
 * Descuento de vidrio: 63mm en perímetro (marco perimetral)
 */
export const abatibleEuropa2Hojas: ModelInput = {
  accessoryPrice: 85, // USD - Bisagras, cerraduras, manillas
  basePrice: 130, // USD/m²
  compatibleGlassTypeIds: [], // Se populará con 6-12mm simple + DVH 12.5-18.5mm
  costNotes:
    'Precio base $130/m². Sistema abatible con bisagras V8000 (75kg por par). Compatible con vidrio 6-12mm o DVH 12.5-18.5mm.',
  costPerMmHeight: 0.016, // Mayor costo que corredizo por complejidad
  costPerMmWidth: 0.019,
  glassDiscountHeightMm: 63, // Fórmula marco perimetral: H - 63mm
  glassDiscountWidthMm: 63, // Fórmula marco perimetral: W - 63mm
  maxHeightMm: 2800, // Límite para hoja fija (más restrictivo)
  maxWidthMm: 3450, // 1050mm móvil + 2400mm fijo
  minHeightMm: 478,
  minWidthMm: 873, // 478mm móvil + 395mm fijo
  name: 'Abatible Europa 2 Hojas (OX)',
  profileSupplierName: 'Extralum',
  profitMarginPercentage: 40, // Mayor margen por complejidad de instalación
  status: 'published',
};

/**
 * Abatible Europa 3 Hojas (XOX)
 *
 * Configuración: 2 hojas móviles laterales + 1 hoja fija central
 */
export const abatibleEuropa3Hojas: ModelInput = {
  accessoryPrice: 125, // USD - Más bisagras y cerraduras
  basePrice: 150, // USD/m²
  compatibleGlassTypeIds: [],
  costNotes: 'Precio base $150/m². Sistema de 3 hojas con panel central fijo. Cerradura multipunto opcional.',
  costPerMmHeight: 0.017,
  costPerMmWidth: 0.021,
  glassDiscountHeightMm: 63,
  glassDiscountWidthMm: 63,
  maxHeightMm: 2800,
  maxWidthMm: 4500, // 1050mm + 2400mm + 1050mm
  minHeightMm: 478,
  minWidthMm: 1351, // 478mm + 395mm + 478mm
  name: 'Abatible Europa 3 Hojas (XOX)',
  profileSupplierName: 'Extralum',
  profitMarginPercentage: 40,
  status: 'published',
};

/**
 * Abatible Europa 4 Hojas (XXOO)
 *
 * Configuración: 2 hojas móviles + 2 hojas fijas
 * Ideal para: Balcones, terrazas, áreas de paso amplias
 */
export const abatibleEuropa4Hojas: ModelInput = {
  accessoryPrice: 165, // USD - Mayor cantidad de herrajes
  basePrice: 170, // USD/m²
  compatibleGlassTypeIds: [],
  costNotes:
    'Precio base $170/m². Sistema de 4 hojas premium. Cerradura multipunto con cilindro recomendada para alturas >1800mm.',
  costPerMmHeight: 0.018,
  costPerMmWidth: 0.023,
  glassDiscountHeightMm: 63,
  glassDiscountWidthMm: 63,
  maxHeightMm: 2800,
  maxWidthMm: 6900, // 2x1050mm móvil + 2x2400mm fijo
  minHeightMm: 478,
  minWidthMm: 1746, // 2x478mm + 2x395mm
  name: 'Abatible Europa 4 Hojas (XXOO)',
  profileSupplierName: 'Extralum',
  profitMarginPercentage: 42, // Mayor margen por complejidad premium
  status: 'published',
};

/**
 * Todos los modelos de sistemas abatibles
 * Total: 3 modelos (2, 3, 4 hojas)
 */
export const vitroRojasCasementModels: ModelInput[] = [
  abatibleEuropa2Hojas,
  abatibleEuropa3Hojas,
  abatibleEuropa4Hojas,
];
