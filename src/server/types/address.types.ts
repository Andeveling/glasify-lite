/**
 * Address Types
 *
 * Server-side type definitions for ProjectAddress entity
 * Used by address service, quote service, and transportation
 */

/**
 * ProjectAddress entity from database
 * Uses string for decimal fields (latitude/longitude) for database serialization
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
  latitude: string | null; // Decimal as string from database
  longitude: string | null; // Decimal as string from database
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
