/**
 * Field length limits for Account (OAuth) schema
 */
export const ACCOUNT_FIELD_LENGTHS = {
  ID: 36,
  ACCOUNT_ID: 255,
  PROVIDER_ID: 255,
  ACCESS_TOKEN: 4096,
  REFRESH_TOKEN: 4096,
  ID_TOKEN: 4096,
  SCOPE: 1024,
  PASSWORD: 255,
} as const;
