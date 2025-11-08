/**
 * Field length limits for GlassSolution schema
 */
export const GLASS_SOLUTION_FIELD_LENGTHS = {
  ID: 36, // CUID length
  KEY: 100,
  SLUG: 100,
  NAME: 255,
  NAME_ES: 255,
  DESCRIPTION: 1000,
  ICON: 50, // Lucide React icon name
  SEED_VERSION: 20,
} as const;
