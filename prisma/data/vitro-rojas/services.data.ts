/**
 * Vitro Rojas - Services
 *
 * Servicios típicos de instalación y mantenimiento de ventanas/puertas
 * en el mercado panameño.
 *
 * @version 1.0.0
 * @date 2025-01-21
 */

import type { ServiceInput } from '../../factories/service.factory';

/**
 * Servicios de Vitro Rojas
 *
 * Categorías:
 * - Instalación: Servicios medidos por área (m²)
 * - Sellado: Servicios medidos por perímetro (ml)
 * - Servicios fijos: Tarifa única por unidad
 */
export const vitroRojasServices: ServiceInput[] = [
  {
    name: 'Instalación de Ventanas',
    rate: 15, // USD/m²
    type: 'area',
    unit: 'sqm',
  },
  {
    name: 'Sellado Perimetral',
    rate: 3.5, // USD/ml
    type: 'perimeter',
    unit: 'ml',
  },
  {
    name: 'Desmonte de Ventana Existente',
    rate: 25, // USD/unidad
    type: 'fixed',
    unit: 'unit',
  },
  {
    name: 'Servicio de Reposición',
    rate: 35, // USD/unidad
    type: 'fixed',
    unit: 'unit',
  },
  {
    name: 'Protección para Obra',
    rate: 2.5, // USD/m²
    type: 'area',
    unit: 'sqm',
  },
];
