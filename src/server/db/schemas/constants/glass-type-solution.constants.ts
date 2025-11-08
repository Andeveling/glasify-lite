/**
 * Field length limits for GlassTypeSolution schema
 */
export const GLASS_TYPE_SOLUTION_FIELD_LENGTHS = {
  ID: 36, // CUID length
  GLASS_TYPE_ID: 36, // CUID length (foreign key)
  SOLUTION_ID: 36, // CUID length (foreign key)
} as const;
