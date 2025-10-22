#!/usr/bin/env tsx
/**
 * DEPRECATED SCRIPT - v2.0 Schema Migration
 * 
 * This script is no longer functional because it references deprecated schema fields:
 * - pricePerSqm (removed: pricing now via TenantGlassTypePrice)
 * - purpose (removed: use characteristics relationships instead)
 * - isLaminated, isLowE, isTempered, isTripleGlazed (removed: use GlassTypeCharacteristic)
 * - glassSupplier (removed: use manufacturer field and tenant config)
 * 
 * Schema migration completed successfully - database is up-to-date.
 * This file is kept for reference only.
 */

console.log('DEPRECATED SCRIPT - see file header for details');
process.exit(0);
