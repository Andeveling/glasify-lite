/**
 * Window/Door Models Catalog - Colombian Market
 *
 * Real window and door models from manufacturers available in Colombia.
 *
 * Data sources:
 * - https://www.deceuninck.co/correderas.html (Deceuninck sliding windows)
 * - https://www.deceuninck.co/doble_contacto.html (Deceuninck tilt & turn)
 * - docs/context/alumina.info.md (Alumina series specifications)
 * - docs/context/veka-example.info.md (VEKA specifications)
 *
 * @version 1.0.0
 * @lastUpdated 2025-01-10
 */

import type { ModelInput } from '../../factories/model.factory';

/**
 * Window and door models catalog
 *
 * Note: compatibleGlassTypeIds will be populated during seeding
 * by referencing actual GlassType IDs created in database.
 *
 * For now, we use placeholder strings that will be replaced
 * with actual IDs during the seeding process.
 */

// ==========================================
// DECEUNINCK - CORREDERAS (Sliding Windows)
// ==========================================

/**
 * Deceuninck Inoutic S5500 - Premium Sliding
 * Fuente: https://www.deceuninck.co/correderas.html
 */
export const deceuninckInouticS5500: ModelInput = {
  accessoryPrice: 85_000,
  basePrice: 450_000, // COP base price
  compatibleGlassTypeIds: ['PLACEHOLDER'], // Will be populated during seeding
  costNotes:
    'Sistema corredera premium con perfiles multicámara. Excelente hermeticidad y aislamiento. Compatible con cristales de 4-30mm.',
  costPerMmHeight: 95,
  costPerMmWidth: 120,
  glassDiscountHeightMm: 50,
  glassDiscountWidthMm: 50, // Descuento para cálculo de cristal
  maxHeightMm: 2400,
  maxWidthMm: 3000,
  minHeightMm: 600,
  minWidthMm: 800,
  name: 'Deceuninck Inoutic S5500 - Corredera Premium',
  profileSupplierName: 'Deceuninck',
  profitMarginPercentage: 35,
  status: 'published',
};

/**
 * Deceuninck Zendow#neo S4100 - Mid-range Sliding
 * Fuente: https://www.deceuninck.co/correderas.html
 */
export const deceuninckZendowS4100: ModelInput = {
  accessoryPrice: 65_000,
  basePrice: 350_000, // COP
  compatibleGlassTypeIds: ['PLACEHOLDER'],
  costNotes:
    'Sistema corredera estándar con buen aislamiento. Compatible con cristales de 4-24mm. Ideal para proyectos residenciales.',
  costPerMmHeight: 75,
  costPerMmWidth: 95,
  glassDiscountHeightMm: 45,
  glassDiscountWidthMm: 45,
  maxHeightMm: 2200,
  maxWidthMm: 2500,
  minHeightMm: 500,
  minWidthMm: 700,
  name: 'Deceuninck Zendow#neo S4100 - Corredera Estándar',
  profileSupplierName: 'Deceuninck',
  profitMarginPercentage: 32,
  status: 'published',
};

// ==========================================
// DECEUNINCK - DOBLE CONTACTO (Tilt & Turn / Casement)
// ==========================================

/**
 * Deceuninck Elegant S8000 - Premium Tilt & Turn
 * Fuente: https://www.deceuninck.co/doble_contacto.html
 */
export const deceuninckElegantS8000: ModelInput = {
  accessoryPrice: 120_000, // Herrajes multipunto más caros
  basePrice: 520_000, // COP
  compatibleGlassTypeIds: ['PLACEHOLDER'],
  costNotes:
    'Sistema oscilobatiente premium con cierre multipunto. Máxima hermeticidad y seguridad. Compatible con cristales de 4-32mm. Herrajes alemanes de alta calidad.',
  costPerMmHeight: 115,
  costPerMmWidth: 140,
  glassDiscountHeightMm: 40,
  glassDiscountWidthMm: 40,
  maxHeightMm: 2000,
  maxWidthMm: 1400,
  minHeightMm: 600,
  minWidthMm: 500,
  name: 'Deceuninck Elegant S8000 - Oscilobatiente Premium',
  profileSupplierName: 'Deceuninck',
  profitMarginPercentage: 38,
  status: 'published',
};

/**
 * Deceuninck Elegant Batiente
 */
export const deceuninckElegantBatiente: ModelInput = {
  accessoryPrice: 75_000,
  basePrice: 380_000, // COP
  compatibleGlassTypeIds: ['PLACEHOLDER'],
  costNotes: 'Ventana batiente con apertura hacia el exterior. Buena hermeticidad. Compatible con cristales de 4-24mm.',
  costPerMmHeight: 85,
  costPerMmWidth: 105,
  glassDiscountHeightMm: 35,
  glassDiscountWidthMm: 35,
  maxHeightMm: 1800,
  maxWidthMm: 1200,
  minHeightMm: 500,
  minWidthMm: 400,
  name: 'Deceuninck Elegant - Batiente Estándar',
  profileSupplierName: 'Deceuninck',
  profitMarginPercentage: 33,
  status: 'published',
};

// ==========================================
// ALUMINA - KONCEPT SERIES (Aluminum)
// ==========================================

/**
 * Alumina Koncept 100 - Premium Aluminum
 * Fuente: docs/context/alumina.info.md
 */
export const aluminaKoncept100: ModelInput = {
  accessoryPrice: 150_000,
  basePrice: 650_000, // COP
  compatibleGlassTypeIds: ['PLACEHOLDER'],
  costNotes:
    'Sistema corredera/batiente/elevable. Espesor cristal 8-25mm. Perfil 101.5mm, marco 125mm. Capacidad 200-220kg. Diseño moderno, alta hermeticidad, norma NSR-10.',
  costPerMmHeight: 125,
  costPerMmWidth: 155,
  glassDiscountHeightMm: 55,
  glassDiscountWidthMm: 55,
  maxHeightMm: 2600,
  maxWidthMm: 3500,
  minHeightMm: 800,
  minWidthMm: 1000,
  name: 'Alumina Koncept 100 - Puerta Corredera Premium',
  profileSupplierName: 'Alumina',
  profitMarginPercentage: 40,
  status: 'published',
};

/**
 * Alumina Koncept 70 - Mid-range Sliding
 */
export const aluminaKoncept70: ModelInput = {
  accessoryPrice: 95_000,
  basePrice: 480_000, // COP
  compatibleGlassTypeIds: ['PLACEHOLDER'],
  costNotes:
    'Puerta y ventana corredera. Espesor cristal 6-15mm. Perfil 67mm, marco 95mm. Capacidad 160kg. Líneas suaves, buena atenuación acústica.',
  costPerMmHeight: 90,
  costPerMmWidth: 115,
  glassDiscountHeightMm: 45,
  glassDiscountWidthMm: 45,
  maxHeightMm: 2200,
  maxWidthMm: 3000,
  minHeightMm: 600,
  minWidthMm: 800,
  name: 'Alumina Koncept 70 - Puerta y Ventana Corredera',
  profileSupplierName: 'Alumina',
  profitMarginPercentage: 36,
  status: 'published',
};

/**
 * Alumina Koncept 50 - Sliding Window
 */
export const aluminaKoncept50: ModelInput = {
  accessoryPrice: 55_000,
  basePrice: 320_000, // COP
  compatibleGlassTypeIds: ['PLACEHOLDER'],
  costNotes:
    'Ventana corredera/cristal fijo. Espesor cristal 4-10mm. Perfil 53mm, marco 77mm. Capacidad 30kg. Alta hermeticidad, cortes a 45°.',
  costPerMmHeight: 65,
  costPerMmWidth: 85,
  glassDiscountHeightMm: 35,
  glassDiscountWidthMm: 35,
  maxHeightMm: 1800,
  maxWidthMm: 2400,
  minHeightMm: 400,
  minWidthMm: 600,
  name: 'Alumina Koncept 50 - Ventana Corredera',
  profileSupplierName: 'Alumina',
  profitMarginPercentage: 30,
  status: 'published',
};

/**
 * Alumina Koncept 40 - Tilt & Turn
 */
export const aluminaKoncept40: ModelInput = {
  accessoryPrice: 135_000,
  basePrice: 580_000, // COP
  compatibleGlassTypeIds: ['PLACEHOLDER'],
  costNotes:
    'Oscilobatiente/batiente/proyectante. Espesor cristal 4-10mm. Perfil 47-88mm, marco 88-100mm. Cierre multipunto, sellos EPDM, sistema europeo.',
  costPerMmHeight: 120,
  costPerMmWidth: 145,
  glassDiscountHeightMm: 40,
  glassDiscountWidthMm: 40,
  maxHeightMm: 1900,
  maxWidthMm: 1300,
  minHeightMm: 600,
  minWidthMm: 500,
  name: 'Alumina Koncept 40 - Oscilobatiente',
  profileSupplierName: 'Alumina',
  profitMarginPercentage: 37,
  status: 'published',
};

// ==========================================
// ALUMINA - SUPERIOR SERIES
// ==========================================

/**
 * Alumina Superior 80
 */
export const aluminaSuperior80: ModelInput = {
  accessoryPrice: 80_000,
  basePrice: 420_000, // COP
  compatibleGlassTypeIds: ['PLACEHOLDER'],
  costNotes:
    'Puerta/ventana corredera. Espesor cristal 6-12mm. Perfil 83mm, marco 70-85mm. Capacidad 125kg. Perfiles redondeados, cierre automático.',
  costPerMmHeight: 85,
  costPerMmWidth: 105,
  glassDiscountHeightMm: 42,
  glassDiscountWidthMm: 42,
  maxHeightMm: 2100,
  maxWidthMm: 2800,
  minHeightMm: 500,
  minWidthMm: 700,
  name: 'Alumina Superior 80 - Puerta/Ventana Corredera',
  profileSupplierName: 'Alumina',
  profitMarginPercentage: 34,
  status: 'published',
};

/**
 * Alumina Superior 50
 */
export const aluminaSuperior50: ModelInput = {
  accessoryPrice: 45_000,
  basePrice: 280_000, // COP
  compatibleGlassTypeIds: ['PLACEHOLDER'],
  costNotes:
    'Ventana corredera. Espesor cristal 6-10mm. Perfil 53mm, marco 55mm. Corte a 90°, sistema simple, uso residencial.',
  costPerMmHeight: 60,
  costPerMmWidth: 75,
  glassDiscountHeightMm: 30,
  glassDiscountWidthMm: 30,
  maxHeightMm: 1600,
  maxWidthMm: 2200,
  minHeightMm: 400,
  minWidthMm: 600,
  name: 'Alumina Superior 50 - Ventana Corredera',
  profileSupplierName: 'Alumina',
  profitMarginPercentage: 28,
  status: 'published',
};

// ==========================================
// CATALOG EXPORT
// ==========================================

/**
 * All models catalog
 */
export const modelsCatalog: ModelInput[] = [
  // Deceuninck - Correderas
  deceuninckInouticS5500,
  deceuninckZendowS4100,

  // Deceuninck - Doble Contacto
  deceuninckElegantS8000,
  deceuninckElegantBatiente,

  // Alumina - Koncept
  aluminaKoncept100,
  aluminaKoncept70,
  aluminaKoncept50,
  aluminaKoncept40,

  // Alumina - Superior
  aluminaSuperior80,
  aluminaSuperior50,
];

/**
 * Models grouped by supplier
 */
export const modelsBySupplier = {
  Alumina: [
    aluminaKoncept100,
    aluminaKoncept70,
    aluminaKoncept50,
    aluminaKoncept40,
    aluminaSuperior80,
    aluminaSuperior50,
  ],
  Deceuninck: [deceuninckInouticS5500, deceuninckZendowS4100, deceuninckElegantS8000, deceuninckElegantBatiente],
};

/**
 * Models grouped by type
 */
export const modelsByType = {
  casement: [deceuninckElegantBatiente],
  sliding: [
    deceuninckInouticS5500,
    deceuninckZendowS4100,
    aluminaKoncept100,
    aluminaKoncept70,
    aluminaKoncept50,
    aluminaSuperior80,
    aluminaSuperior50,
  ],
  tiltTurn: [deceuninckElegantS8000, aluminaKoncept40],
};

/**
 * Recommended models by project type
 */
export const recommendedModels = {
  budget: ['Alumina Superior 50 - Ventana Corredera', 'Alumina Koncept 50 - Ventana Corredera'],
  commercial: [
    'Deceuninck Inoutic S5500 - Corredera Premium',
    'Deceuninck Elegant S8000 - Oscilobatiente Premium',
    'Alumina Koncept 100 - Puerta Corredera Premium',
  ],
  premium: [
    'Deceuninck Elegant S8000 - Oscilobatiente Premium',
    'Deceuninck Inoutic S5500 - Corredera Premium',
    'Alumina Koncept 100 - Puerta Corredera Premium',
  ],
  residential: [
    'Deceuninck Zendow#neo S4100 - Corredera Estándar',
    'Deceuninck Elegant - Batiente Estándar',
    'Alumina Koncept 50 - Ventana Corredera',
  ],
};
