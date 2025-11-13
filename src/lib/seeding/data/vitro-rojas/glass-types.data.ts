/**
 * Vitro Rojas - Glass Types Data
 *
 * Tipos de vidrio disponibles en inventario de Vitro Rojas.
 * Incluye vidrios de Guardian, Saint-Gobain, AGC y Vitro.
 *
 * Nota: glassSupplierId se resolverá dinámicamente después de insertar suppliers
 * Por ahora usamos null y actualizaremos en el preset
 *
 * Características técnicas:
 * - thicknessMm: Espesor en milímetros (text field)
 * - pricePerSqm: Precio por metro cuadrado en USD (decimal as string)
 * - uValue: Valor U de aislamiento térmico W/(m²·K) (decimal as string)
 * - solarFactor: Factor solar g-value 0-1 (decimal as string)
 * - lightTransmission: Transmisión de luz visible 0-1 (decimal as string)
 *
 * @version 1.0.0
 * @date 2025-11-13
 */

export const vitroRojasGlassTypes = [
  // Guardian Glass - Clear Float
  {
    name: "Guardian Clear 6mm",
    code: "GUARD-CLR-6",
    series: "ClimaGuard",
    manufacturer: "Guardian Glass",
    glassSupplierId: null, // Se asignará después
    thicknessMm: "6",
    pricePerSqm: "25.50",
    uValue: "5.8",
    description: "Vidrio flotado claro estándar de 6mm",
    solarFactor: "0.87",
    lightTransmission: "0.90",
    isActive: "true",
    lastReviewDate: new Date("2025-11-01"),
    isSeeded: "true",
    seedVersion: "1.0.0",
  },
  {
    name: "Guardian Clear 8mm",
    code: "GUARD-CLR-8",
    series: "ClimaGuard",
    manufacturer: "Guardian Glass",
    glassSupplierId: null,
    thicknessMm: "8",
    pricePerSqm: "32.00",
    uValue: "5.7",
    description: "Vidrio flotado claro estándar de 8mm",
    solarFactor: "0.85",
    lightTransmission: "0.88",
    isActive: "true",
    lastReviewDate: new Date("2025-11-01"),
    isSeeded: "true",
    seedVersion: "1.0.0",
  },

  // Guardian Glass - Low-E
  {
    name: "Guardian SunGuard Solar Low-E 6mm",
    code: "GUARD-LOWE-6",
    series: "SunGuard",
    manufacturer: "Guardian Glass",
    glassSupplierId: null,
    thicknessMm: "6",
    pricePerSqm: "45.00",
    uValue: "1.6",
    description: "Vidrio Low-E con control solar para clima tropical",
    solarFactor: "0.35",
    lightTransmission: "0.70",
    isActive: "true",
    lastReviewDate: new Date("2025-11-01"),
    isSeeded: "true",
    seedVersion: "1.0.0",
  },

  // Saint-Gobain - Acoustic
  {
    name: "Saint-Gobain SGG Stadip Silence 8mm",
    code: "SG-ACOUSTIC-8",
    series: "Stadip Silence",
    manufacturer: "Saint-Gobain",
    glassSupplierId: null,
    thicknessMm: "8",
    pricePerSqm: "65.00",
    uValue: "2.8",
    description: "Vidrio laminado acústico, reducción de ruido 35dB",
    solarFactor: "0.75",
    lightTransmission: "0.82",
    isActive: "true",
    lastReviewDate: new Date("2025-11-01"),
    isSeeded: "true",
    seedVersion: "1.0.0",
  },

  // Saint-Gobain - Security
  {
    name: "Saint-Gobain SGG Securit 10mm",
    code: "SG-TEMP-10",
    series: "Securit",
    manufacturer: "Saint-Gobain",
    glassSupplierId: null,
    thicknessMm: "10",
    pricePerSqm: "55.00",
    uValue: "5.5",
    description: "Vidrio templado de seguridad 10mm",
    solarFactor: "0.83",
    lightTransmission: "0.87",
    isActive: "true",
    lastReviewDate: new Date("2025-11-01"),
    isSeeded: "true",
    seedVersion: "1.0.0",
  },

  // AGC Glass - Solar Control
  {
    name: "AGC Sunergy Clear 6mm",
    code: "AGC-SUNERGY-6",
    series: "Sunergy",
    manufacturer: "AGC Glass",
    glassSupplierId: null,
    thicknessMm: "6",
    pricePerSqm: "48.00",
    uValue: "1.7",
    description: "Vidrio con control solar de alta performance",
    solarFactor: "0.38",
    lightTransmission: "0.75",
    isActive: "true",
    lastReviewDate: new Date("2025-11-01"),
    isSeeded: "true",
    seedVersion: "1.0.0",
  },
  {
    name: "AGC Stopray Vision 50 - 6mm",
    code: "AGC-STOPRAY-6",
    series: "Stopray",
    manufacturer: "AGC Glass",
    glassSupplierId: null,
    thicknessMm: "6",
    pricePerSqm: "52.00",
    uValue: "1.5",
    description: "Vidrio reflectivo con excelente control solar",
    solarFactor: "0.32",
    lightTransmission: "0.50",
    isActive: "true",
    lastReviewDate: new Date("2025-11-01"),
    isSeeded: "true",
    seedVersion: "1.0.0",
  },

  // Vitro Architectural Glass - Standard
  {
    name: "Vitro Claro 6mm",
    code: "VITRO-CLR-6",
    series: "Standard",
    manufacturer: "Vitro Architectural Glass",
    glassSupplierId: null,
    thicknessMm: "6",
    pricePerSqm: "22.00",
    uValue: "5.8",
    description: "Vidrio flotado claro estándar económico",
    solarFactor: "0.87",
    lightTransmission: "0.89",
    isActive: "true",
    lastReviewDate: new Date("2025-11-01"),
    isSeeded: "true",
    seedVersion: "1.0.0",
  },
  {
    name: "Vitro Tintado Gris 6mm",
    code: "VITRO-GREY-6",
    series: "Tinted",
    manufacturer: "Vitro Architectural Glass",
    glassSupplierId: null,
    thicknessMm: "6",
    pricePerSqm: "28.00",
    uValue: "5.7",
    description: "Vidrio tintado gris para control solar",
    solarFactor: "0.65",
    lightTransmission: "0.45",
    isActive: "true",
    lastReviewDate: new Date("2025-11-01"),
    isSeeded: "true",
    seedVersion: "1.0.0",
  },

  // Cristales Centroamericanos - Local Stock
  {
    name: "Cristalca Float Claro 4mm",
    code: "CRISTALCA-CLR-4",
    series: "Basic",
    manufacturer: "Cristales Centroamericanos",
    glassSupplierId: null,
    thicknessMm: "4",
    pricePerSqm: "18.00",
    uValue: "5.9",
    description: "Vidrio flotado claro básico, stock local",
    solarFactor: "0.88",
    lightTransmission: "0.91",
    isActive: "true",
    lastReviewDate: new Date("2025-11-01"),
    isSeeded: "true",
    seedVersion: "1.0.0",
  },
];
