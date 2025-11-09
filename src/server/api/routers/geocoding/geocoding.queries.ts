/**
 * Geocoding Queries
 *
 * Query procedures for geocoding operations
 */

import { TRPCError } from "@trpc/server";
import logger from "@/lib/logger";
import { searchAddress } from "@/server/services/geocoding.service";
import { protectedProcedure } from "../../trpc";
import { geocodingSearchInputSchema } from "./geocoding.schemas";

/**
 * Search for addresses using Nominatim API
 *
 * Authorization: protectedProcedure (any authenticated user)
 * Rate Limiting: 1 request per second (to comply with Nominatim policy)
 */
export const searchAddressQuery = protectedProcedure
  .input(geocodingSearchInputSchema)
  .query(async ({ ctx, input }) => {
    try {
      logger.info("Geocoding search request", {
        userId: ctx.session.user.id,
        query: input.query,
        limit: input.limit,
      });

      // TODO: Add rate limiting (1 req/sec)
      // Use rate-limiter-flexible library
      // const rateLimiter = new RateLimiterMemory({
      //   points: 1,
      //   duration: 1,
      // });
      // await rateLimiter.consume(ctx.session.user.id);

      // Call geocoding service
      const response = await searchAddress(
        input.query,
        input.limit,
        input.acceptLanguage
      );

      logger.info("Geocoding search completed", {
        userId: ctx.session.user.id,
        query: input.query,
        totalResults: response.totalResults,
        queryTime: response.queryTime,
      });

      return response;
    } catch (error) {
      logger.error("Geocoding search failed", {
        error: error instanceof Error ? error.message : String(error),
        userId: ctx.session.user.id,
        query: input.query,
      });

      // Transform service errors to user-friendly messages
      if (error instanceof Error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al buscar dirección",
      });
    }
  });
