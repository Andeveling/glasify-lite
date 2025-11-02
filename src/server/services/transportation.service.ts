/**
 * Transportation Cost Service
 *
 * Feature: 001-delivery-address
 * Created: 2025-11-01
 *
 * Purpose:
 * Calculate transportation costs based on distance between warehouse
 * and delivery location using Haversine formula.
 *
 * Formula:
 * totalCost = baseRate + (distanceKm * perKmRate)
 */

import type { TenantConfig } from "@prisma/client";
import {
	DISTANCE_PRECISION_DIVISOR,
	DISTANCE_PRECISION_MULTIPLIER,
	EARTH_RADIUS_METERS,
	TRANSPORTATION_MAX_DISTANCE_KM,
} from "@/app/(dashboard)/admin/quotes/_constants/geocoding.constants";
import type {
	TransportationCost,
	WarehouseLocation,
} from "@/app/(dashboard)/admin/quotes/_types/address.types";
import logger from "@/lib/logger";
import { haversineDistance } from "@/lib/utils/coordinates";

/**
 * Calculate transportation cost from warehouse to delivery location
 *
 * @param deliveryLatitude - Delivery location latitude
 * @param deliveryLongitude - Delivery location longitude
 * @param tenantConfig - Tenant configuration with warehouse location and rates
 * @param deliveryCity - Optional delivery city name for display
 * @returns TransportationCost with distance and cost breakdown
 *
 * @throws Error if warehouse not configured or coordinates invalid
 *
 * @example
 * const cost = await calculateTransportationCost(
 *   4.6533,
 *   -74.0836,
 *   tenantConfig,
 *   'Bogotá'
 * );
 * console.log(cost.cost.totalCost); // 15000 COP
 * console.log(cost.distance.kilometers); // 12.5 km
 */
export function calculateTransportationCost(
	deliveryLatitude: number,
	deliveryLongitude: number,
	tenantConfig: TenantConfig,
	deliveryCity?: string | null,
): TransportationCost {
	try {
		// Validate warehouse configuration
		const warehouse = extractWarehouseLocation(tenantConfig);

		if (!warehouse) {
			throw new Error(
				"La ubicación del almacén no está configurada. Por favor, configure las coordenadas del almacén en la configuración del sistema.",
			);
		}

		// Calculate distance using Haversine formula
		const distanceMeters = haversineDistance(
			{ latitude: warehouse.latitude, longitude: warehouse.longitude },
			{ latitude: deliveryLatitude, longitude: deliveryLongitude },
		);

		const distanceKm = distanceMeters / EARTH_RADIUS_METERS;

		// Validate distance is within reasonable range
		if (distanceKm > TRANSPORTATION_MAX_DISTANCE_KM) {
			logger.warn("Transportation distance exceeds maximum", {
				distanceKm,
				maxDistanceKm: TRANSPORTATION_MAX_DISTANCE_KM,
				warehouse: warehouse.city,
				delivery: deliveryCity,
			});

			throw new Error(
				`La distancia de transporte (${Math.round(distanceKm)} km) excede el máximo permitido (${TRANSPORTATION_MAX_DISTANCE_KM} km)`,
			);
		}

		// Calculate cost components
		const baseRate = tenantConfig.transportBaseRate
			? Number(tenantConfig.transportBaseRate)
			: 0;
		const perKmRate = tenantConfig.transportPerKmRate
			? Number(tenantConfig.transportPerKmRate)
			: 0;

		const distanceCost = distanceKm * perKmRate;
		const totalCost = baseRate + distanceCost;

		// Format display text
		const displayText = `${warehouse.city} → ${deliveryCity ?? "Destino"} (${Math.round(distanceKm)} km)`;

		logger.info("Transportation cost calculated", {
			warehouse: warehouse.city,
			delivery: deliveryCity,
			distanceKm:
				Math.round(distanceKm * DISTANCE_PRECISION_MULTIPLIER) /
				DISTANCE_PRECISION_DIVISOR,
			baseRate,
			perKmRate,
			totalCost,
		});

		return {
			warehouse: {
				city: warehouse.city,
				latitude: warehouse.latitude,
				longitude: warehouse.longitude,
			},
			delivery: {
				city: deliveryCity ?? null,
				latitude: deliveryLatitude,
				longitude: deliveryLongitude,
			},
			distance: {
				meters: Math.round(distanceMeters),
				kilometers:
					Math.round(distanceKm * DISTANCE_PRECISION_MULTIPLIER) /
					DISTANCE_PRECISION_DIVISOR,
			},
			cost: {
				baseRate,
				perKmRate,
				distanceCost: Math.round(distanceCost),
				totalCost: Math.round(totalCost),
				displayText,
			},
		};
	} catch (error) {
		logger.error("Transportation cost calculation error", {
			deliveryLatitude,
			deliveryLongitude,
			deliveryCity,
			error: error instanceof Error ? error.message : String(error),
		});

		throw error;
	}
}

/**
 * Extract warehouse location from tenant configuration
 *
 * @param tenantConfig - Tenant configuration
 * @returns WarehouseLocation if configured, null otherwise
 */
export function extractWarehouseLocation(
	tenantConfig: TenantConfig,
): WarehouseLocation | null {
	// Check if warehouse coordinates are configured
	if (
		tenantConfig.warehouseLatitude === null ||
		tenantConfig.warehouseLongitude === null ||
		tenantConfig.warehouseCity === null
	) {
		return null;
	}

	return {
		latitude: Number(tenantConfig.warehouseLatitude),
		longitude: Number(tenantConfig.warehouseLongitude),
		city: tenantConfig.warehouseCity,
	};
}
