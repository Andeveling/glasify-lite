/**
 * Geocoding Router
 *
 * Feature: 001-delivery-address
 * Created: 2025-11-01
 *
 * Purpose:
 * Geocoding operations using Nominatim API
 *
 * Endpoints:
 * - search: Search addresses with autocomplete
 */

import { createTRPCRouter } from "../../trpc";
import { searchAddressQuery } from "./geocoding.queries";

/**
 * Geocoding Router
 *
 * Authorization: All procedures require protectedProcedure (authenticated users)
 * Rate Limiting: Applied at procedure level (1 req/sec)
 */
export const geocodingRouter = createTRPCRouter({
  search: searchAddressQuery,
});
