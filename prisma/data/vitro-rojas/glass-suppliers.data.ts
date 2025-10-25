/**
 * Vitro Rojas - Glass Suppliers
 *
 * Proveedores de cristal del mercado panameño
 *
 * @version 1.0.0
 * @date 2025-01-21
 */

import type { GlassSupplierInput } from '../../factories/glass-supplier.factory';

/**
 * Proveedores de cristal en Panamá
 *
 * Nota: Estos son proveedores genéricos para mercado panameño.
 * Vitro Rojas puede actualizar según sus proveedores reales.
 */
export const vitroRojasGlassSuppliers: GlassSupplierInput[] = [
  {
    isActive: true,
    name: 'Vidriera Nacional S.A.',
    notes: 'Proveedor local de cristal en Panamá. Especializado en cristal templado y laminado para construcción.',
  },
  {
    isActive: true,
    name: 'Guardian Glass Panamá',
    notes:
      'Distribuidor autorizado Guardian Glass. Proveedor de cristal flotado, templado, laminado y DVH para proyectos comerciales y residenciales.',
  },
];
