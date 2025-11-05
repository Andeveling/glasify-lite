/**
 * Public API for domain entities
 *
 * This module exports all value objects and aggregates from the pricing domain.
 */

// biome-ignore lint/performance/noBarrelFile: Domain layer public API boundary - intentional re-export pattern for clean architecture
export { Dimensions, type DimensionsInput } from "./dimensions";
export { Money } from "./money";
