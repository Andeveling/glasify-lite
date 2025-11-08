/**
 * Field length limits for GlassCharacteristic schema
 */
export const GLASS_CHARACTERISTIC_FIELD_LENGTHS = {
  ID: 36, // CUID length
  KEY: 100,
  NAME: 255,
  NAME_ES: 255,
  DESCRIPTION: 1000,
  CATEGORY: 100,
  SEED_VERSION: 20,
} as const;
