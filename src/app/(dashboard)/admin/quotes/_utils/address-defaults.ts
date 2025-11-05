/**
 * Address Defaults Utility
 *
 * Feature: 001-delivery-address
 * Created: 2025-11-01
 *
 * Purpose:
 * Provide default/empty values for ProjectAddress entities
 */

import type { ProjectAddress } from "@/app/(dashboard)/admin/quotes/_types/address.types";

/**
 * Get empty ProjectAddress object for form initialization
 *
 * @returns ProjectAddress with all fields set to null/default values
 *
 * @example
 * const initialAddress = getEmptyAddress();
 * // Use in React Hook Form:
 * const form = useForm({ defaultValues: { deliveryAddress: initialAddress } });
 */
export function getEmptyAddress(): Partial<ProjectAddress> {
  return {
    id: undefined,
    quoteId: null,
    label: null,
    country: "Colombia", // Default to Colombia for most users
    region: null,
    city: null,
    district: null,
    street: null,
    reference: null,
    latitude: null,
    longitude: null,
    postalCode: null,
    createdAt: undefined,
    updatedAt: undefined,
  };
}

/**
 * Check if address is empty (all identifier fields are null)
 *
 * @param address - ProjectAddress to check
 * @returns true if address has no identifiers (city, street, reference all null)
 *
 * @example
 * const empty = isAddressEmpty(getEmptyAddress()); // true
 * const notEmpty = isAddressEmpty({ city: 'Bogotá' }); // false
 */
export function isAddressEmpty(
  address: Partial<ProjectAddress> | null | undefined
): boolean {
  if (!address) {
    return true;
  }

  // Check if at least one identifier field is present
  const hasCity = Boolean(address.city);
  const hasStreet = Boolean(address.street);
  const hasReference = Boolean(address.reference);

  const hasAnyIdentifier = hasCity || hasStreet || hasReference;

  return !hasAnyIdentifier;
}

/**
 * Check if address has valid coordinates
 *
 * @param address - ProjectAddress to check
 * @returns true if address has both latitude and longitude
 *
 * @example
 * const hasCoords = hasCoordinates({ latitude: 4.7110, longitude: -74.0721 }); // true
 * const noCoords = hasCoordinates({ latitude: 4.7110, longitude: null }); // false
 */
export function hasCoordinates(
  address: Partial<ProjectAddress> | null | undefined
): boolean {
  if (!address) {
    return false;
  }

  return (
    address.latitude !== null &&
    address.latitude !== undefined &&
    address.longitude !== null &&
    address.longitude !== undefined
  );
}

/**
 * Merge partial address updates with existing address
 *
 * @param existing - Current address object
 * @param updates - Partial updates to apply
 * @returns Merged address object
 *
 * @example
 * const current = { city: 'Bogotá', street: null };
 * const updated = mergeAddress(current, { street: 'Calle 72' });
 * // Returns: { city: 'Bogotá', street: 'Calle 72' }
 */
export function mergeAddress(
  existing: Partial<ProjectAddress> | null | undefined,
  updates: Partial<ProjectAddress>
): Partial<ProjectAddress> {
  const base = existing ?? getEmptyAddress();

  return {
    ...base,
    ...updates,
  };
}
