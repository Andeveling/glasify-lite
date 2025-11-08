/**
 * Field length limits for ProjectAddress schema
 */
export const PROJECT_ADDRESS_FIELD_LENGTHS = {
  ID: 36, // CUID length
  QUOTE_ID: 36, // CUID length (foreign key, optional)
  LABEL: 100,
  COUNTRY: 100,
  REGION: 100,
  CITY: 100,
  DISTRICT: 100,
  STREET: 200,
  REFERENCE: 200,
  POSTAL_CODE: 20,
} as const;

/**
 * Decimal precision constants for ProjectAddress
 * WGS84 standard coordinates
 */
export const PROJECT_ADDRESS_DECIMAL_PRECISION = {
  LATITUDE: { precision: 10, scale: 7 }, // Range: -90 to +90, 7 decimal places (~0.01mm)
  LONGITUDE: { precision: 10, scale: 7 }, // Range: -180 to +180, 7 decimal places (~0.01mm)
} as const;

/**
 * Geographic constraints for coordinate validation
 */
export const PROJECT_ADDRESS_CONSTRAINTS = {
  LATITUDE_MIN: -90,
  LATITUDE_MAX: 90,
  LONGITUDE_MIN: -180,
  LONGITUDE_MAX: 180,
} as const;
