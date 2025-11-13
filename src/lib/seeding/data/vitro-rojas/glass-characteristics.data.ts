/**
 * Vitro Rojas - Glass Characteristics Data
 *
 * Características de vidrio disponibles en el catálogo de Vitro Rojas.
 * Basado en estándares internacionales y productos reales.
 *
 * Categorías:
 * - safety: Seguridad y protección
 * - thermal: Rendimiento térmico
 * - acoustic: Aislamiento acústico
 * - coating: Tratamientos de superficie
 * - solar: Control solar
 * - privacy: Privacidad y oscurecimiento
 * - substrate: Materiales base
 *
 * @version 1.0.0
 * @date 2025-11-13
 */

import type { NewGlassCharacteristic } from "@/server/db/schemas/glass-characteristic.schema";

export const vitroRojasGlassCharacteristics: NewGlassCharacteristic[] = [
  // Safety - Seguridad
  {
    key: "tempered",
    name: "Tempered",
    nameEs: "Templado",
    category: "safety",
    description:
      "Vidrio tratado térmicamente 4-5 veces más fuerte que el vidrio regular",
    isActive: true,
    sortOrder: 1,
    isSeeded: true,
    seedVersion: "1.0.0",
  },
  {
    key: "laminated",
    name: "Laminated",
    nameEs: "Laminado",
    category: "safety",
    description:
      "Dos o más capas de vidrio unidas con interlámina para seguridad",
    isActive: true,
    sortOrder: 2,
    isSeeded: true,
    seedVersion: "1.0.0",
  },
  {
    key: "bulletproof",
    name: "Bulletproof",
    nameEs: "Antibalas",
    category: "safety",
    description: "Vidrio laminado multicapa resistente a impacto balístico",
    isActive: false, // No disponible inicialmente
    sortOrder: 3,
    isSeeded: true,
    seedVersion: "1.0.0",
  },

  // Thermal - Térmico
  {
    key: "low_e",
    name: "Low-E Coating",
    nameEs: "Capa Low-E",
    category: "thermal",
    description:
      "Recubrimiento microscópico que refleja el calor permitiendo el paso de luz",
    isActive: true,
    sortOrder: 10,
    isSeeded: true,
    seedVersion: "1.0.0",
  },
  {
    key: "double_glazed",
    name: "Double Glazed",
    nameEs: "Doble Vidriado",
    category: "thermal",
    description:
      "Dos paneles de vidrio con espacio aislante de aire/gas entre ellos",
    isActive: true,
    sortOrder: 11,
    isSeeded: true,
    seedVersion: "1.0.0",
  },
  {
    key: "triple_glazed",
    name: "Triple Glazed",
    nameEs: "Triple Vidriado",
    category: "thermal",
    description: "Tres paneles de vidrio para máximo aislamiento térmico",
    isActive: false, // No disponible inicialmente
    sortOrder: 12,
    isSeeded: true,
    seedVersion: "1.0.0",
  },

  // Acoustic - Acústico
  {
    key: "acoustic_laminated",
    name: "Acoustic Laminated",
    nameEs: "Laminado Acústico",
    category: "acoustic",
    description:
      "Vidrio laminado con interlámina acústica para reducción de sonido",
    isActive: true,
    sortOrder: 20,
    isSeeded: true,
    seedVersion: "1.0.0",
  },
  {
    key: "sound_control",
    name: "Sound Control",
    nameEs: "Control de Sonido",
    category: "acoustic",
    description:
      "Composición especializada de vidrio para aislamiento acústico mejorado",
    isActive: true,
    sortOrder: 21,
    isSeeded: true,
    seedVersion: "1.0.0",
  },

  // Coating - Recubrimientos
  {
    key: "reflective",
    name: "Reflective",
    nameEs: "Reflectivo",
    category: "coating",
    description:
      "Recubrimiento metálico que refleja la luz y reduce el deslumbramiento",
    isActive: true,
    sortOrder: 30,
    isSeeded: true,
    seedVersion: "1.0.0",
  },
  {
    key: "self_cleaning",
    name: "Self-Cleaning",
    nameEs: "Autolimpiante",
    category: "coating",
    description:
      "Recubrimiento fotocatalítico que descompone suciedad orgánica",
    isActive: false, // No disponible inicialmente
    sortOrder: 31,
    isSeeded: true,
    seedVersion: "1.0.0",
  },

  // Solar - Control Solar
  {
    key: "solar_control",
    name: "Solar Control",
    nameEs: "Control Solar",
    category: "solar",
    description: "Reduce ganancia de calor solar manteniendo luz natural",
    isActive: true,
    sortOrder: 40,
    isSeeded: true,
    seedVersion: "1.0.0",
  },
  {
    key: "uv_protection",
    name: "UV Protection",
    nameEs: "Protección UV",
    category: "solar",
    description: "Bloquea radiación ultravioleta dañina",
    isActive: true,
    sortOrder: 41,
    isSeeded: true,
    seedVersion: "1.0.0",
  },

  // Privacy - Privacidad
  {
    key: "frosted",
    name: "Frosted",
    nameEs: "Esmerilado",
    category: "privacy",
    description: "Superficie translúcida que permite luz pero oscurece visión",
    isActive: true,
    sortOrder: 50,
    isSeeded: true,
    seedVersion: "1.0.0",
  },
  {
    key: "tinted",
    name: "Tinted",
    nameEs: "Tintado",
    category: "privacy",
    description: "Vidrio coloreado que reduce transmisión de luz y visibilidad",
    isActive: true,
    sortOrder: 51,
    isSeeded: true,
    seedVersion: "1.0.0",
  },

  // Substrate - Material Base
  {
    key: "clear_float",
    name: "Clear Float",
    nameEs: "Flotado Claro",
    category: "substrate",
    description: "Vidrio flotado estándar con alta transparencia",
    isActive: true,
    sortOrder: 60,
    isSeeded: true,
    seedVersion: "1.0.0",
  },
  {
    key: "extra_clear",
    name: "Extra Clear",
    nameEs: "Extra Claro",
    category: "substrate",
    description:
      "Vidrio con contenido ultra-bajo de hierro para máxima claridad",
    isActive: true,
    sortOrder: 61,
    isSeeded: true,
    seedVersion: "1.0.0",
  },
];
