/**
 * Vidrios La Equidad - Profile Suppliers
 *
 * Data source: https://vidrioslaequidad.com/
 * Empresa del Valle del Cauca, Colombia
 * Productos: Aluminio, cristal, acero y PVC
 *
 * Enfoque inicial:
 * - Ventanas en aluminio
 * - Puertas ventanas en aluminio
 * - Sistemas PVC Deceuninck
 *
 * @version 1.0.0
 * @date 2025-01-25
 */

import type { ProfileSupplierInput } from '../../factories/profile-supplier.factory';

/**
 * Proveedores de perfiles para Vidrios La Equidad
 *
 * 1. Nacional (Aluminio) - Proveedor local de perfiles de aluminio
 * 2. Deceuninck - Sistemas PVC de alta gama
 */
export const vidriosLaEquidadProfileSuppliers: ProfileSupplierInput[] = [
  {
    isActive: true,
    materialType: 'ALUMINUM',
    name: 'Sistemas Aluminio Nacional',
    notes:
      'Proveedor de perfiles de aluminio en Colombia. Sistemas corredizos y abatibles para ventanas y puertas. Uso residencial, comercial e institucional.',
  },
  {
    isActive: true,
    materialType: 'PVC',
    name: 'Deceuninck',
    notes:
      'Sistemas PVC de alta gama. Excelente aislamiento térmico y acústico. Ideal para proyectos que requieren eficiencia energética y durabilidad.',
  },
];
