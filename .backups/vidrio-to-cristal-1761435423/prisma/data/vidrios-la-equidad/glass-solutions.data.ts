/**
 * Vidrios La Equidad - Glass Solutions
 *
 * Soluciones de vidrio para el mercado colombiano
 * Valle del Cauca, Quindío y Risaralda
 *
 * Vinculación con GlassTypes mediante categorización por propósito
 *
 * @version 1.0.0
 * @date 2025-01-25
 */

import type { GlassSolutionInput } from '../../factories/glass-solution.factory';

/**
 * Soluciones de vidrio para Vidrios La Equidad
 *
 * Adaptadas al mercado colombiano (Valle del Cauca)
 */
export const vidriosLaEquidadGlassSolutions: GlassSolutionInput[] = [
  {
    description:
      'Vidrio claro estándar para aplicaciones residenciales y comerciales básicas. Ideal para ventanas donde no se requieren características especiales.',
    icon: 'Home',
    key: 'general',
    name: 'General Purpose',
    nameEs: 'Uso General',
    sortOrder: 1,
  },
  {
    description:
      'Vidrio templado, laminado y antibalas para máxima seguridad contra impactos y robos. Recomendado para puertas, plantas bajas, oficinas y áreas vulnerables.',
    icon: 'Shield',
    key: 'security',
    name: 'Security',
    nameEs: 'Seguridad',
    sortOrder: 2,
  },
  {
    description:
      'Doble Vidriado Hermético (DVH) y Low-E para aislamiento térmico y eficiencia energética. Ideal para edificios con aire acondicionado y calefacción.',
    icon: 'Snowflake',
    key: 'energy_efficiency',
    name: 'Thermal Insulation',
    nameEs: 'Aislamiento Térmico',
    sortOrder: 3,
  },
  {
    description:
      'Vidrio acústico laminado para control de ruido en zonas urbanas. Reduce ruido exterior hasta 38dB, ideal para oficinas y apartamentos.',
    icon: 'Volume2',
    key: 'sound_insulation',
    name: 'Acoustic Insulation',
    nameEs: 'Aislamiento Acústico',
    sortOrder: 4,
  },
  {
    description:
      'Vidrios reflectivos (Bronce, Gris), esmerilados y tintados para privacidad, control solar y diseño. Reducen el paso de luz y calor.',
    icon: 'Sparkles',
    key: 'decorative',
    name: 'Decorative',
    nameEs: 'Decorativo',
    sortOrder: 5,
  },
];
