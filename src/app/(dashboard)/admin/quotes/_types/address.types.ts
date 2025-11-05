/**
 * Address Types
 *
 * Feature: 001-delivery-address
 * Purpose: TypeScript types for ProjectAddress entity
 */

import type { Decimal } from "@prisma/client/runtime/library";

/**
 * ProjectAddress entity from Prisma
 */
export type ProjectAddress = {
  id: string;
  quoteId: string | null;
  label: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  district: string | null;
  street: string | null;
  reference: string | null;
  latitude: Decimal | null;
  longitude: Decimal | null;
  postalCode: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Input type for creating/updating addresses
 */
export type ProjectAddressInput = {
  quoteId?: string | null;
  label?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  district?: string | null;
  street?: string | null;
  reference?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  postalCode?: string | null;
};

/**
 * Geocoding search result from Nominatim API
 */
export type GeocodingResult = {
  placeId: string;
  displayName: string;
  latitude: number;
  longitude: number;
  address: {
    city?: string;
    state?: string;
    country?: string;
    countryCode?: string;
    postcode?: string;
  };
  boundingBox?: {
    south: number;
    west: number;
    north: number;
    east: number;
  };
};

/**
 * Geocoding API response
 */
export type GeocodingResponse = {
  results: GeocodingResult[];
  totalResults: number;
  queryTime: number;
};

/**
 * Coordinate pair
 */
export type Coordinates = {
  latitude: number;
  longitude: number;
};

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
