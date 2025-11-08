/**
 * Field length limits for User schema
 */
export const USER_FIELD_LENGTHS = {
  ID: 36, // CUID length
  NAME: 255,
  EMAIL: 320, // RFC 5321 limit
  IMAGE_URL: 2048,
} as const;
