import type { Prisma } from "@prisma/client";
import logger from "@/lib/logger";
import { db } from "@/server/db";

/**
 * Model Price History Service
 *
 * Automatically creates price history records when model pricing changes.
 * Provides audit trail for price changes over time.
 *
 * @server-side-only This service uses Winston logger (Node.js only)
 */

export type ModelPriceChange = {
	modelId: string;
	basePrice: number;
	costPerMmWidth: number;
	costPerMmHeight: number;
	reason?: string;
	createdBy: string;
};

export type PriceHistoryRecord = {
	id: string;
	modelId: string;
	basePrice: number;
	costPerMmWidth: number;
	costPerMmHeight: number;
	reason: string | null;
	effectiveFrom: Date;
	createdBy: string | null;
	createdAt: Date;
};

/**
 * Convert Prisma Decimal to number
 */
function toNumber(decimal: Prisma.Decimal): number {
	return decimal.toNumber();
}

/**
 * Convert ModelPriceHistory from Prisma to service interface
 */
function toPriceHistoryRecord(
	history: Prisma.ModelPriceHistoryGetPayload<object>,
): PriceHistoryRecord {
	return {
		basePrice: toNumber(history.basePrice),
		costPerMmHeight: toNumber(history.costPerMmHeight),
		costPerMmWidth: toNumber(history.costPerMmWidth),
		createdAt: history.createdAt,
		createdBy: history.createdBy,
		effectiveFrom: history.effectiveFrom,
		id: history.id,
		modelId: history.modelId,
		reason: history.reason,
	};
}

/**
 * Create a price history record for a model
 * Called automatically when model pricing is updated
 */
export async function createModelPriceHistory(
	change: ModelPriceChange,
): Promise<PriceHistoryRecord> {
	logger.info("Creating model price history record", {
		basePrice: change.basePrice,
		createdBy: change.createdBy,
		modelId: change.modelId,
	});

	try {
		const priceHistory = await db.modelPriceHistory.create({
			data: {
				basePrice: change.basePrice,
				costPerMmHeight: change.costPerMmHeight,
				costPerMmWidth: change.costPerMmWidth,
				createdBy: change.createdBy,
				effectiveFrom: new Date(),
				modelId: change.modelId,
				reason: change.reason ?? null,
			},
		});

		logger.info("Model price history record created successfully", {
			id: priceHistory.id,
			modelId: change.modelId,
		});

		return toPriceHistoryRecord(priceHistory);
	} catch (error) {
		logger.error("Failed to create model price history record", {
			error,
			modelId: change.modelId,
		});
		throw error;
	}
}

/**
 * Get price history for a model
 * Returns records ordered by most recent first
 */
export async function getModelPriceHistory(
	modelId: string,
	limit = 10,
): Promise<PriceHistoryRecord[]> {
	logger.info("Fetching model price history", { limit, modelId });

	try {
		const history = await db.modelPriceHistory.findMany({
			orderBy: { effectiveFrom: "desc" },
			take: limit,
			where: { modelId },
		});

		logger.info("Model price history fetched successfully", {
			modelId,
			recordCount: history.length,
		});

		return history.map(toPriceHistoryRecord);
	} catch (error) {
		logger.error("Failed to fetch model price history", {
			error,
			modelId,
		});
		throw error;
	}
}

/**
 * Check if model pricing has changed
 * Used to determine if a price history record should be created
 */
export function hasPriceChanged(
	current: {
		basePrice: number;
		costPerMmWidth: number;
		costPerMmHeight: number;
	},
	updated: {
		basePrice: number;
		costPerMmWidth: number;
		costPerMmHeight: number;
	},
): boolean {
	return (
		current.basePrice !== updated.basePrice ||
		current.costPerMmWidth !== updated.costPerMmWidth ||
		current.costPerMmHeight !== updated.costPerMmHeight
	);
}

/**
 * Get the most recent price for a model
 * Useful for comparing against current model price
 */
export async function getLatestModelPrice(
	modelId: string,
): Promise<PriceHistoryRecord | null> {
	logger.info("Fetching latest model price", { modelId });

	try {
		const latestPrice = await db.modelPriceHistory.findFirst({
			orderBy: { effectiveFrom: "desc" },
			where: { modelId },
		});

		logger.info("Latest model price fetched", {
			found: !!latestPrice,
			modelId,
		});

		return latestPrice ? toPriceHistoryRecord(latestPrice) : null;
	} catch (error) {
		logger.error("Failed to fetch latest model price", {
			error,
			modelId,
		});
		throw error;
	}
}
