/**
 * Vitro Rojas - Glass Types
 *
 * Tipos de vidrio comunes en el mercado panameño.
 * Precios en USD según sistema de cotización Vitro Rojas.
 *
 * Adicionales por tipo de vidrio (sobre precio base de ventana):
 * - Claro: Incluido en precio base
 * - Laminado: +$15 USD/m²
 * - Gris/Bronce: +$10 USD/m²
 * - Reflectivo: +$15 USD/m²
 * - Laminado Gris/Bronce: +$18 USD/m²
 *
 * Data source:
 * - Vitro Rojas S.A. - Instrucciones de Corte y Presupuesto
 * - Extralum Panama - Fichas técnicas (espesores compatibles)
 * - Mercado panameño (precios de referencia)
 *
 * @version 1.0.0
 * @date 2025-01-21
 */

import type { GlassTypeInput } from '../../factories/glass-type.factory';

/**
 * Tipos de vidrio para uso general (económico)
 *
 * Aplicación: Ventanas residenciales estándar sin requerimientos especiales
 */
const generalPurposeGlassTypes: GlassTypeInput[] = [
  {
    isLaminated: false,
    isLowE: false,
    isTempered: false,
    isTripleGlazed: false,
    name: 'Vidrio Claro 6mm',
    pricePerSqm: 28, // USD
    purpose: 'general',
    thicknessMm: 6,
  },
  {
    isLaminated: false,
    isLowE: false,
    isTempered: false,
    isTripleGlazed: false,
    name: 'Vidrio Claro 8mm',
    pricePerSqm: 35, // USD
    purpose: 'general',
    thicknessMm: 8,
  },
];

/**
 * Tipos de vidrio para seguridad (laminados)
 *
 * Aplicación: Áreas con riesgo de impacto, seguridad anti-robo
 * Adicional: +$15 USD/m² sobre precio base
 */
const securityGlassTypes: GlassTypeInput[] = [
  {
    isLaminated: true,
    isLowE: false,
    isTempered: false,
    isTripleGlazed: false,
    name: 'Vidrio Laminado 6.38mm (6+6)',
    pricePerSqm: 43, // Base $28 + $15 laminado
    purpose: 'security',
    thicknessMm: 6.38,
  },
  {
    isLaminated: true,
    isLowE: false,
    isTempered: false,
    isTripleGlazed: false,
    name: 'Vidrio Laminado 8.38mm (8+8)',
    pricePerSqm: 50, // Base $35 + $15 laminado
    purpose: 'security',
    thicknessMm: 8.38,
  },
  {
    isLaminated: false,
    isLowE: false,
    isTempered: true,
    isTripleGlazed: false,
    name: 'Vidrio Templado 6mm',
    pricePerSqm: 45, // Templado para puertas
    purpose: 'security',
    thicknessMm: 6,
  },
];

/**
 * Tipos de vidrio para aislamiento térmico (DVH)
 *
 * Aplicación: Áreas con aire acondicionado, reducción de consumo energético
 * Compatible con: Sistema Corredizo Europa Clásica (DVH 16-18.5mm)
 * Compatible con: Sistema Abatible Europa (DVH 12.5-18.5mm)
 */
const insulationGlassTypes: GlassTypeInput[] = [
  {
    isLaminated: false,
    isLowE: false,
    isTempered: false,
    isTripleGlazed: false,
    name: 'DVH 16mm (6-4-6)',
    pricePerSqm: 85, // USD - Doble Vidrio Hermético
    purpose: 'insulation',
    thicknessMm: 16,
    uValue: 2.8, // W/m²K
  },
  {
    isLaminated: false,
    isLowE: false,
    isTempered: false,
    isTripleGlazed: false,
    name: 'DVH 18.5mm (6-6.5-6)',
    pricePerSqm: 92, // USD
    purpose: 'insulation',
    thicknessMm: 18.5,
    uValue: 2.7, // W/m²K - Mejor aislamiento
  },
];

/**
 * Tipos de vidrio decorativos (tintados y reflectivos)
 *
 * Aplicación: Control solar, privacidad, estética
 * Adicionales:
 * - Gris/Bronce: +$10 USD/m²
 * - Reflectivo: +$15 USD/m²
 * - Laminado Gris/Bronce: +$18 USD/m²
 */
const decorativeGlassTypes: GlassTypeInput[] = [
  {
    isLaminated: false,
    isLowE: false,
    isTempered: false,
    isTripleGlazed: false,
    name: 'Vidrio Gris 6mm',
    pricePerSqm: 38, // Base $28 + $10 tintado
    purpose: 'decorative',
    thicknessMm: 6,
  },
  {
    isLaminated: false,
    isLowE: false,
    isTempered: false,
    isTripleGlazed: false,
    name: 'Vidrio Bronce 6mm',
    pricePerSqm: 38, // Base $28 + $10 tintado
    purpose: 'decorative',
    thicknessMm: 6,
  },
  {
    isLaminated: false,
    isLowE: false,
    isTempered: false,
    isTripleGlazed: false,
    name: 'Vidrio Reflectivo 6mm',
    pricePerSqm: 43, // Base $28 + $15 reflectivo
    purpose: 'decorative',
    thicknessMm: 6,
  },
  {
    isLaminated: true,
    isLowE: false,
    isTempered: false,
    isTripleGlazed: false,
    name: 'Vidrio Laminado Gris 6.38mm',
    pricePerSqm: 46, // Base $28 + $18 laminado tintado
    purpose: 'decorative',
    thicknessMm: 6.38,
  },
];

/**
 * Todos los tipos de vidrio para Vitro Rojas
 * Total: 11 tipos (2 general + 3 security + 2 insulation + 4 decorative)
 */
export const vitroRojasGlassTypes: GlassTypeInput[] = [
  ...generalPurposeGlassTypes,
  ...securityGlassTypes,
  ...insulationGlassTypes,
  ...decorativeGlassTypes,
];
