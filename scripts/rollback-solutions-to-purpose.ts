#!/usr/bin/env tsx
/**
 * DEPRECATED SCRIPT - v2.0 Schema Migration
 *
 * This rollback script is no longer functional because it references deprecated schema fields:
 * - purpose (removed: use characteristics relationships instead)
 * - solutions (refactored: now via GlassTypeSolution join table)
 *
 * The schema migration to v2.0 has been completed and committed to production.
 * Rollback is no longer supported.
 */

console.log('DEPRECATED SCRIPT - Rollback not supported for v2.0 migration');
process.exit(0);
