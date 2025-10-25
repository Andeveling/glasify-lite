import type { MaterialType } from '../_types/model.types';

/**
 * Material-specific benefits in Spanish for user-facing display
 * Based on industry standards and common material characteristics
 * User Story 3: Enhanced with use-case oriented descriptions
 */
export const MATERIAL_BENEFITS: Record<MaterialType, string[]> = {
  ALUMINUM: [
    'Máxima resistencia estructural - Soporta grandes dimensiones sin deformarse',
    'Perfiles delgados y estética moderna - Maximiza el área de vidrio',
    'Durabilidad excepcional - Vida útil superior a 30 años',
    'Ideal para grandes dimensiones - Puertas corredizas hasta 6700mm',
  ],
  MIXED: [
    'Combina ventajas de múltiples materiales - Lo mejor de cada tecnología',
    'Versatilidad en aplicaciones - Adaptable a diversos proyectos',
    'Balance entre estética y rendimiento - Solución integral',
  ],
  PVC: [
    'Excelente aislamiento térmico - Ideal para climas fríos',
    'Bajo mantenimiento - No requiere pintura ni tratamientos especiales',
    'Resistente a la corrosión y humedad - Perfecto para zonas costeras',
    'Alta reducción de ruido exterior - Recomendado para viviendas cerca de vías principales',
  ],
  WOOD: [
    'Calidez natural y estética clásica - Perfecto para diseños tradicionales',
    'Excelente aislamiento térmico - Reduce consumo energético',
    'Renovable y ecológico - Opción sustentable con baja huella de carbono',
    'Personalizable con acabados - Barniz, pintura o tinte según preferencia',
  ],
};

/**
 * Performance levels by material type
 * Used to generate performance ratings in the UI
 */
export type PerformanceLevel = 'excellent' | 'good' | 'standard';

export const MATERIAL_PERFORMANCE: Record<
  MaterialType,
  {
    thermal: PerformanceLevel;
    acoustic: PerformanceLevel;
    structural: PerformanceLevel;
  }
> = {
  ALUMINUM: { acoustic: 'good', structural: 'excellent', thermal: 'standard' },
  MIXED: { acoustic: 'good', structural: 'good', thermal: 'good' },
  PVC: { acoustic: 'excellent', structural: 'good', thermal: 'excellent' },
  WOOD: { acoustic: 'good', structural: 'good', thermal: 'excellent' },
};

/**
 * Format performance level to stars and Spanish label
 * Following "Don't Make Me Think" UX principle - instant comprehension
 */
export function formatPerformanceRating(level: PerformanceLevel): {
  stars: 1 | 2 | 3 | 4 | 5;
  label: string;
} {
  const ratings = {
    excellent: { label: 'Excelente', stars: 5 as const },
    good: { label: 'Bueno', stars: 4 as const },
    standard: { label: 'Estándar', stars: 3 as const },
  };
  return ratings[level];
}
