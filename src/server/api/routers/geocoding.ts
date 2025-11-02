/**
 * Geocoding tRPC Router
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

import { TRPCError } from "@trpc/server";
import { geocodingSearchSchema } from "@/app/(dashboard)/admin/quotes/_schemas/project-address.schema";
import logger from "@/lib/logger";
import { searchAddress } from "@/server/services/geocoding.service";
import { createTRPCRouter, protectedProcedure } from "../trpc";

/**
 * Geocoding Router
 *
 * Authorization: All procedures require protectedProcedure (authenticated users)
 * Rate Limiting: Applied at procedure level (1 req/sec)
 */
export const geocodingRouter = createTRPCRouter({
	/**
	 * Search addresses using Nominatim API
	 *
	 * Input: { query: string, limit?: number, acceptLanguage?: string }
	 * Output: GeocodingResponse with results array
	 *
	 * Authorization: protectedProcedure (any authenticated user)
	 * Rate Limiting: 1 request per second (to comply with Nominatim policy)
	 * Task: T021 [US1]
	 */
	search: protectedProcedure
		.input(geocodingSearchSchema)
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
					input.acceptLanguage,
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
		}),
});
