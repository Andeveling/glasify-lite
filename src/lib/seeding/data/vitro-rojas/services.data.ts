/**
 * Vitro Rojas - Services Data
 *
 * Servicios adicionales ofrecidos por Vitro Rojas.
 * Incluye instalación, transporte, y servicios especializados.
 *
 * Service Types:
 * - area: Cobro por área (m²) - ej. instalación
 * - perimeter: Cobro por perímetro (ml) - ej. sellado
 * - fixed: Cobro fijo por unidad - ej. transporte
 *
 * Units:
 * - sqm: Metro cuadrado (m²)
 * - ml: Metro lineal
 * - unit: Unidad
 *
 * Notas:
 * - rate es number en preset pero se convierte a string en seeder
 * - minimumBillingUnit define cantidad mínima facturable
 * - isActive controla visibilidad en cotizaciones
 *
 * @version 1.0.0
 * @date 2025-11-13
 */

export const vitroRojasServices = [
  // Instalación
  {
    name: "Instalación Estándar",
    type: "area" as const,
    unit: "sqm" as const,
    rate: 15.0,
    minimumBillingUnit: 2,
    isActive: true,
  },
  {
    name: "Instalación Premium (Altura > 3m)",
    type: "area" as const,
    unit: "sqm" as const,
    rate: 25.0,
    minimumBillingUnit: 2,
    isActive: true,
  },
  {
    name: "Instalación Urgente (24h)",
    type: "area" as const,
    unit: "sqm" as const,
    rate: 35.0,
    minimumBillingUnit: 2,
    isActive: true,
  },

  // Sellado y Acabados
  {
    name: "Sellado con Silicón",
    type: "perimeter" as const,
    unit: "ml" as const,
    rate: 3.5,
    minimumBillingUnit: 5,
    isActive: true,
  },
  {
    name: "Sellado Estructural",
    type: "perimeter" as const,
    unit: "ml" as const,
    rate: 6.0,
    minimumBillingUnit: 5,
    isActive: true,
  },

  // Transporte
  {
    name: "Transporte Local (Ciudad de Panamá)",
    type: "fixed" as const,
    unit: "unit" as const,
    rate: 50.0,
    minimumBillingUnit: 1,
    isActive: true,
  },
  {
    name: "Transporte Interior (Provincias)",
    type: "fixed" as const,
    unit: "unit" as const,
    rate: 120.0,
    minimumBillingUnit: 1,
    isActive: true,
  },

  // Servicios Especiales
  {
    name: "Remoción de Ventana Existente",
    type: "fixed" as const,
    unit: "unit" as const,
    rate: 35.0,
    minimumBillingUnit: 1,
    isActive: true,
  },
  {
    name: "Tratamiento Marco Existente",
    type: "perimeter" as const,
    unit: "ml" as const,
    rate: 8.0,
    minimumBillingUnit: 3,
    isActive: true,
  },
  {
    name: "Templado de Vidrio (Servicio Externo)",
    type: "area" as const,
    unit: "sqm" as const,
    rate: 22.0,
    minimumBillingUnit: 1,
    isActive: true,
  },
  {
    name: "Laminado de Vidrio (Servicio Externo)",
    type: "area" as const,
    unit: "sqm" as const,
    rate: 28.0,
    minimumBillingUnit: 1,
    isActive: true,
  },

  // Mantenimiento
  {
    name: "Mantenimiento Preventivo Anual",
    type: "fixed" as const,
    unit: "unit" as const,
    rate: 45.0,
    minimumBillingUnit: 1,
    isActive: true,
  },
  {
    name: "Reparación de Herrajes",
    type: "fixed" as const,
    unit: "unit" as const,
    rate: 30.0,
    minimumBillingUnit: 1,
    isActive: true,
  },

  // Servicios Desactivados (ejemplo)
  {
    name: "Instalación Experimental (Beta)",
    type: "area" as const,
    unit: "sqm" as const,
    rate: 40.0,
    minimumBillingUnit: 5,
    isActive: false,
  },
];
