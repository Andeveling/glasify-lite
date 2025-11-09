/**
 * ⚠️ DEPRECATED: Geocoding module has been refactored into modular structure
 *
 * This file is kept for backwards compatibility only.
 * New code should import from './geocoding/index.ts'
 *
 * Migration: The router has been reorganized following Clean Architecture:
 * - Schemas: geocoding/geocoding.schemas.ts
 * - Queries: geocoding/geocoding.queries.ts
 * - Constants: geocoding/geocoding.constants.ts
 * - Service: src/server/services/geocoding.service.ts
 *
 * For documentation, see: ./geocoding/README.md
 */

// Re-export for backwards compatibility
export { geocodingRouter as geocodingRouterDeprecated } from "./geocoding/index";
