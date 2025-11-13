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

import type { NewGlassSolution } from "@/server/db/schemas/glass-solution.schema";

/**
 * Soluciones de vidrio para Vitro Rojas
 *
 * Adaptadas al mercado panameño con terminología local
 */
export const vitroRojasGlassSolutions: NewGlassSolution[] = [
  {
    key: "security",
    slug: "security",
    name: "Security Glass",
    nameEs: "Vidrio de Seguridad",
    description:
      "Vidrio laminado y templado para mayor seguridad contra impactos y robos.",
    icon: "Shield",
    sortOrder: 1,
    isActive: true,
    isSeeded: true,
    seedVersion: "1.0.0",
  },
  {
    key: "thermal_insulation",
    slug: "thermal-insulation",
    name: "Thermal Insulation Glass",
    nameEs: "Vidrio de Aislamiento Térmico",
    description:
      "DVH (Doble Vidrio Hermético) para aislamiento térmico y ahorro energético.",
    icon: "Snowflake",
    sortOrder: 2,
    isActive: true,
    isSeeded: true,
    seedVersion: "1.0.0",
  },
  {
    key: "decorative",
    slug: "decorative",
    name: "Decorative Glass",
    nameEs: "Vidrio Decorativo",
    description: "Vidrios tintados y reflectivos para privacidad y estética.",
    icon: "Sparkles",
    sortOrder: 3,
    isActive: true,
    isSeeded: true,
    seedVersion: "1.0.0",
  },
  {
    key: "general",
    slug: "general",
    name: "General Purpose Glass",
    nameEs: "Vidrio General",
    description: "Vidrio claro simple para uso residencial estándar.",
    icon: "Home",
    sortOrder: 4,
    isActive: true,
    isSeeded: true,
    seedVersion: "1.0.0",
  },
  {
    key: "sound_insulation",
    slug: "sound-insulation",
    name: "Sound Insulation Glass",
    nameEs: "Vidrio de Aislamiento Acústico",
    description: "Vidrio laminado acústico para reducción de ruido exterior.",
    icon: "Volume2",
    sortOrder: 5,
    isActive: true,
    isSeeded: true,
    seedVersion: "1.0.0",
  },
  {
    key: "energy_efficiency",
    slug: "energy-efficiency",
    name: "Energy Efficiency Glass",
    nameEs: "Vidrio de Eficiencia Energética",
    description:
      "Vidrio de baja emisividad (Low-E) para control solar y térmico.",
    icon: "Zap",
    sortOrder: 6,
    isActive: true,
    isSeeded: true,
    seedVersion: "1.0.0",
  },
];
