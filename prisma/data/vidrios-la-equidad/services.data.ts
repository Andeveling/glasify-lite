/**
 * Vidrios La Equidad - Services
 *
 * Servicios ofrecidos según https://vidrioslaequidad.com/nosotros/
 * - Asesoría y diseño
 * - Fabricación e instalación
 * - Control de calidad
 * - Garantía y mantenimiento
 *
 * Precios en COP (Pesos Colombianos)
 * Mercado: Valle del Cauca, Quindío y Risaralda
 *
 * @version 1.0.0
 * @date 2025-01-25
 */

import type { ServiceInput } from "../../factories/service.factory";

/**
 * Servicios de Vidrios La Equidad
 *
 * Categorías:
 * - Instalación: Servicios medidos por área (m²)
 * - Sellado: Servicios medidos por perímetro (ml)
 * - Servicios fijos: Tarifa única por unidad
 */
export const vidriosLaEquidadServices: ServiceInput[] = [
  {
    name: "Instalación de Ventanas",
    rate: 80_000, // COP/m² - Instalación profesional con garantía
    type: "area",
    unit: "sqm",
  },
  {
    name: "Sellado Perimetral",
    rate: 8000, // COP/ml - Silicona estructural de alta calidad
    type: "perimeter",
    unit: "ml",
  },
  {
    name: "Desmonte de Existentes",
    rate: 40_000, // COP/unidad - Desmonte de ventanas o puertas existentes
    type: "fixed",
    unit: "unit",
  },
  {
    name: "Ajuste y Nivelación",
    rate: 25_000, // COP/unidad - Ajuste posterior a instalación
    type: "fixed",
    unit: "unit",
  },
  {
    name: "Protección durante Obra",
    rate: 15_000, // COP/m² - Protección del producto durante construcción
    type: "area",
    unit: "sqm",
  },
  {
    name: "Visita Técnica",
    rate: 50_000, // COP/unidad - Asesoría técnica y toma de medidas
    type: "fixed",
    unit: "unit",
  },
];
