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
    code: 'VR_CLEAR6',
    name: 'Vidrio Claro 6mm',
    thicknessMm: 6,
  },
  {
    code: 'VR_CLEAR8',
    name: 'Vidrio Claro 8mm',
    thicknessMm: 8,
  },
];

/**
 * Tipos de vidrio para seguridad (laminados)
 *
 * Aplicación: Áreas con riesgo de impacto, seguridad anti-robo
 * Adicional: +$15 USD/m² sobre precio base
 *
 * Nota: Los espesores se redondean al entero más cercano
 * - Laminado 6.38mm (6+6) → 6mm
 * - Laminado 8.38mm (8+8) → 8mm
 */
const securityGlassTypes: GlassTypeInput[] = [
  {
    code: 'VR_LAM6',
    name: 'Vidrio Laminado 6.38mm (6+6)',
    thicknessMm: 6,
  },
  {
    code: 'VR_LAM8',
    name: 'Vidrio Laminado 8.38mm (8+8)',
    thicknessMm: 8,
  },
  {
    code: 'VR_TEMP6',
    name: 'Vidrio Templado 6mm',
    thicknessMm: 6,
  },
];

/**
 * Tipos de vidrio para aislamiento térmico (DVH)
 *
 * Aplicación: Áreas con aire acondicionado, reducción de consumo energético
 * Compatible con: Sistema Corredizo Europa Clásica (DVH 16-18.5mm)
 * Compatible con: Sistema Abatible Europa (DVH 12.5-18.5mm)
 *
 * Nota: Espesores redondeados al entero más cercano
 * - DVH 18.5mm (6-6.5-6) → 19mm
 */
const insulationGlassTypes: GlassTypeInput[] = [
  {
    code: 'VR_DVH16',
    name: 'DVH 16mm (6-4-6)',
    thicknessMm: 16,
    uValue: 2.8, // W/m²K
  },
  {
    code: 'VR_DVH18',
    name: 'DVH 18.5mm (6-6.5-6)',
    thicknessMm: 19,
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
 *
 * Nota: Espesores redondeados al entero más cercano
 * - Laminado Gris 6.38mm → 6mm
 */
const decorativeGlassTypes: GlassTypeInput[] = [
  {
    code: 'VR_GRAY6',
    name: 'Vidrio Gris 6mm',
    thicknessMm: 6,
  },
  {
    code: 'VR_BRONZE6',
    name: 'Vidrio Bronce 6mm',
    thicknessMm: 6,
  },
  {
    code: 'VR_REFL6',
    name: 'Vidrio Reflectivo 6mm',
    thicknessMm: 6,
  },
  {
    code: 'VR_LAMGRAY6',
    name: 'Vidrio Laminado Gris 6.38mm',
    thicknessMm: 6,
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
