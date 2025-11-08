/**
 * Field length limits for Session schema
 */
export const SESSION_FIELD_LENGTHS = {
  ID: 36,
  TOKEN: 1024,
  IP_ADDRESS: 45, // IPv6 max length
  USER_AGENT: 512,
} as const;
