/**
 * Vitro Rojas - Glass Types
 *
 * Tipos de vidrio para Vitro Rojas Panama.
 * Precios en USD según lista oficial de Juan Pablo Rojas (Abril 2026).
 *
 * Data source:
 * - Vitro Rojas S.A. - Lista de precios oficial
 *
 * @version 2.0.0
 * @date 2026-04-04
 */

import type { GlassTypeInput } from "../../factories/glass-type.factory";

/**
 * Vidrios Vitro Rojas - Lista oficial Abril 2026
 *
 * Precios por m² en USD:
 * - Claro 6mm: $12
 * - Gris 6mm: $14
 * - Bronce 6mm: $14
 * - Laminado Claro 6mm: $16
 * - Laminado Gris/Bronce 6mm: $18
 * - Reflectivo 6mm: $20
 * - Insulado (DVH): $40
 */
export const vitroRojasGlassTypes: GlassTypeInput[] = [
  {
    code: "VR_CLEAR6",
    name: "Vidrio Claro 6mm",
    pricePerSqm: 12,
    thicknessMm: 6,
  },
  {
    code: "VR_GRAY6",
    name: "Vidrio Gris 6mm",
    pricePerSqm: 14,
    thicknessMm: 6,
  },
  {
    code: "VR_BRONZE6",
    name: "Vidrio Bronce 6mm",
    pricePerSqm: 14,
    thicknessMm: 6,
  },
  {
    code: "VR_LAM_CLEAR6",
    name: "Vidrio Laminado Claro 6mm",
    pricePerSqm: 16,
    thicknessMm: 6,
  },
  {
    code: "VR_LAM_GRAY6",
    name: "Vidrio Laminado Gris 6mm",
    pricePerSqm: 18,
    thicknessMm: 6,
  },
  {
    code: "VR_LAM_BRONZE6",
    name: "Vidrio Laminado Bronce 6mm",
    pricePerSqm: 18,
    thicknessMm: 6,
  },
  {
    code: "VR_REFL6",
    name: "Vidrio Reflectivo 6mm",
    pricePerSqm: 20,
    thicknessMm: 6,
  },
  {
    code: "VR_INSUL21",
    name: "Vidrio Insulado (DVH) 21mm",
    pricePerSqm: 40,
    thicknessMm: 21,
  },
];
