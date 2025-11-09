/**
 * Transportation Types
 *
 * Server-side type definitions for transportation cost calculations
 * Used by transportation service and quote pricing
 */

/**
 * Warehouse location from TenantConfig
 */
export type WarehouseLocation = {
  latitude: number;
  longitude: number;
  city: string;
};

/**
 * Transportation cost calculation result
 */
export type TransportationCost = {
  warehouse: {
    city: string;
    latitude: number;
    longitude: number;
  };
  delivery: {
    city: string | null;
    latitude: number;
    longitude: number;
  };
  distance: {
    meters: number;
    kilometers: number;
  };
  cost: {
    baseRate: number;
    perKmRate: number;
    distanceCost: number;
    totalCost: number;
    displayText: string;
  };
};
