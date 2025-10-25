/**
 * Vitro Rojas - Glass Solutions
 *
 * Soluciones de vidrio para diferentes necesidades del mercado panameño
 *
 * Nota: Las soluciones se vinculan con GlassTypes mediante el campo 'purpose'
 * (general, security, insulation, decorative)
 *
 * @version 1.0.0
 * @date 2025-01-21
 */

import type { GlassSolutionInput } from '../../factories/glass-solution.factory';

/**
 * Soluciones de vidrio para Vitro Rojas
 *
 * Adaptadas al mercado panameño con terminología local
 */
export const vitroRojasGlassSolutions: GlassSolutionInput[] = [
  {
    description:
      'Vidrio claro simple para uso residencial estándar. Ideal para ventanas donde no se requieren características especiales.',
    icon: 'Home',
    key: 'general',
    name: 'General Purpose',
    nameEs: 'Uso General',
    sortOrder: 1,
  },
  {
    description:
      'Vidrio laminado y templado para mayor seguridad contra impactos y robos. Recomendado para puertas, plantas bajas y áreas vulnerables.',
    icon: 'Shield',
    key: 'security',
    name: 'Security',
    nameEs: 'Seguridad',
    sortOrder: 2,
  },
  {
    description:
      'DVH (Doble Vidrio Hermético) para aislamiento térmico y ahorro energético. Ideal para espacios con aire acondicionado en clima tropical.',
    icon: 'Snowflake',
    key: 'energy_efficiency',
    name: 'Thermal Insulation',
    nameEs: 'Aislamiento Térmico',
    sortOrder: 3,
  },
  {
    description:
      'Vidrios tintados (Gris, Bronce) y reflectivos para control solar, privacidad y estética. Reducen el paso de luz y calor.',
    icon: 'Sparkles',
    key: 'decorative',
    name: 'Decorative',
    nameEs: 'Decorativo',
    sortOrder: 4,
  },
];
