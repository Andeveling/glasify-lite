/**
 * Vidrios La Equidad - Glass Types Catalog
 *
 * Data source: https://vidrioslaequidad.com/
 * Tipos de cristal para mercado colombiano
 *
 * Aplicaciones: Residencial, comercial e institucional
 * Mercado: Valle del Cauca, Quindío y Risaralda
 * Precios en COP (Pesos Colombianos)
 *
 * @version 1.0.0
 * @date 2025-01-25
 */

import type { GlassTypeInput } from '../../factories/glass-type.factory';

/**
 * Vidrio Claro Transparente
 * Vidrio flotado estándar sin tratamiento
 */
export const clearFloat: GlassTypeInput = {
  code: 'VLE-CLR-6',
  description: 'Vidrio flotado transparente de alta claridad, ideal para aplicaciones generales.',
  lightTransmission: 0.88,
  manufacturer: 'Nacional',
  name: 'Vidrio Claro Transparente',
  pricePerSqm: 35_000,
  thicknessMm: 6,
};

/**
 * Vidrio Bronce Reflectivo
 * Vidrio con tinte bronce para control solar
 */
export const bronzeReflective: GlassTypeInput = {
  code: 'VLE-BRZ-6',
  description: 'Vidrio reflectivo con tinte bronce, reduce entrada de calor y ofrece privacidad.',
  lightTransmission: 0.35,
  manufacturer: 'Nacional',
  name: 'Vidrio Bronce Reflectivo',
  pricePerSqm: 48_000,
  solarFactor: 0.42,
  thicknessMm: 6,
};

/**
 * Vidrio Gris Reflectivo
 * Control solar y estética moderna
 */
export const grayReflective: GlassTypeInput = {
  code: 'VLE-GRY-6',
  description: 'Vidrio reflectivo gris para control solar y estética contemporánea.',
  lightTransmission: 0.38,
  manufacturer: 'Nacional',
  name: 'Vidrio Gris Reflectivo',
  pricePerSqm: 48_000,
  solarFactor: 0.45,
  thicknessMm: 6,
};

/**
 * Vidrio Templado Transparente
 * Seguridad y resistencia mejorada
 */
export const temperedClear: GlassTypeInput = {
  code: 'VLE-TMP-6',
  description: 'Vidrio flotado templado de alta resistencia, seguro al romperse en fragmentos pequeños.',
  lightTransmission: 0.87,
  manufacturer: 'Nacional',
  name: 'Vidrio Templado Transparente',
  pricePerSqm: 65_000,
  thicknessMm: 6,
};

/**
 * Vidrio Laminado Transparente
 * Seguridad superior contra impactos
 */
export const laminatedClear: GlassTypeInput = {
  code: 'VLE-LAM-6',
  description: 'Vidrio laminado con película PVB, alta seguridad y protección UV.',
  lightTransmission: 0.85,
  manufacturer: 'Nacional',
  name: 'Vidrio Laminado 6mm',
  pricePerSqm: 95_000,
  thicknessMm: 6,
};

/**
 * Doble Vidriado Hermético (DVH)
 * Aislamiento térmico y acústico
 */
export const insulatedGlass: GlassTypeInput = {
  code: 'VLE-DVH-18',
  description: 'DVH con cámara de aire, excelente aislamiento térmico y acústico.',
  lightTransmission: 0.78,
  manufacturer: 'Nacional',
  name: 'Doble Vidriado Hermético 18mm',
  pricePerSqm: 145_000,
  thicknessMm: 18,
  uValue: 2.7,
};

/**
 * Vidrio Low-E (Bajo Emisivo)
 * Máxima eficiencia energética
 */
export const lowEGlass: GlassTypeInput = {
  code: 'VLE-LOWE-6',
  description: 'Vidrio con capa de baja emisividad, máxima eficiencia energética.',
  lightTransmission: 0.82,
  manufacturer: 'Importado',
  name: 'Vidrio Low-E 6mm',
  pricePerSqm: 125_000,
  solarFactor: 0.62,
  thicknessMm: 6,
  uValue: 1.7,
};

/**
 * Vidrio Esmerilado/Satinado
 * Privacidad con transmisión de luz
 */
export const frostedGlass: GlassTypeInput = {
  code: 'VLE-FST-6',
  description: 'Vidrio satinado translúcido, ideal para privacidad manteniendo iluminación natural.',
  lightTransmission: 0.72,
  manufacturer: 'Nacional',
  name: 'Vidrio Esmerilado 6mm',
  pricePerSqm: 55_000,
  thicknessMm: 6,
};

/**
 * Vidrio Acústico Laminado
 * Control de ruido superior
 */
export const acousticLaminated: GlassTypeInput = {
  code: 'VLE-ACU-8',
  description: 'Vidrio laminado con película acústica especial, reduce ruido hasta 38dB.',
  lightTransmission: 0.83,
  manufacturer: 'Importado',
  name: 'Vidrio Acústico Laminado 8mm',
  pricePerSqm: 165_000,
  thicknessMm: 8,
};

/**
 * Vidrio de Seguridad Antibalas
 * Máxima protección
 */
export const bulletResistantGlass: GlassTypeInput = {
  code: 'VLE-BLT-22',
  description: 'Vidrio laminado de seguridad nivel 1, protección contra impactos de arma corta.',
  lightTransmission: 0.75,
  manufacturer: 'Importado',
  name: 'Vidrio Antibalas Nivel 1',
  pricePerSqm: 380_000,
  thicknessMm: 22,
};

/**
 * All glass types for Vidrios La Equidad
 */
export const vidriosLaEquidadGlassTypes: GlassTypeInput[] = [
  clearFloat,
  bronzeReflective,
  grayReflective,
  temperedClear,
  laminatedClear,
  insulatedGlass,
  lowEGlass,
  frostedGlass,
  acousticLaminated,
  bulletResistantGlass,
];
