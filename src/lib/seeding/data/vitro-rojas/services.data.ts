/**
 * Vitro Rojas - Services
 *
 * Servicios típicos de instalación y mantenimiento de ventanas/puertas
 * en el mercado panameño.
 *
 * Schema: service.schema.ts
 * - name: string (max 255)
 * - type: enum ("area" | "perimeter" | "fixed")
 * - unit: enum ("unit" | "sqm" | "ml")
 * - rate: decimal (precision 12, scale 4) - USD per unit/sqm/ml
 * - minimumBillingUnit: decimal optional
 * - isActive: boolean (stored as "true"/"false" string)
 *
 * Categorías:
 * - Instalación: Servicios medidos por área (m²)
 * - Sellado: Servicios medidos por perímetro (ml)
 * - Servicios fijos: Tarifa única por unidad
 *
 * @version 1.0.0
 * @date 2025-11-09
 */

import type { NewService } from "@/server/db/schemas/service.schema";

export const vitroRojasServices: NewService[] = [
  {
    name: "Instalación",
    rate: "15", // USD/m² - stored as string in decimal field
    type: "area",
    unit: "sqm",
    isActive: "true",
  },
  {
    name: "Sellado Perimetral",
    rate: "3.5", // USD/ml
    type: "perimeter",
    unit: "ml",
    isActive: "true",
  },
  {
    name: "Desmonte de Ventana",
    rate: "25", // USD/unidad
    type: "fixed",
    unit: "unit",
    isActive: "true",
  },
  {
    name: "Servicio de Reposición",
    rate: "35", // USD/unidad
    type: "fixed",
    unit: "unit",
    isActive: "true",
  },
  {
    name: "Protección para Obra",
    rate: "2.5", // USD/m²
    type: "area",
    unit: "sqm",
    isActive: "true",
  },
];
