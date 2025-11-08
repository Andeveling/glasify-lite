/**
 * Field length limits for GlassTypeCharacteristic schema
 */
export const GLASS_TYPE_CHARACTERISTIC_FIELD_LENGTHS = {
  ID: 36, // CUID length
  GLASS_TYPE_ID: 36, // CUID length (foreign key)
  CHARACTERISTIC_ID: 36, // CUID length (foreign key)
  VALUE: 255,
  CERTIFICATION: 100,
} as const;
