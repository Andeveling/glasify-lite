import type { Prisma } from '@prisma/client';
import logger from '@/lib/logger';
import { db } from '@/server/db';

/**
 * Glass Type Price History Service
 *
 * Automatically creates price history records when glass type pricing changes.
 * Provides audit trail for price changes over time.
 *
 * @server-side-only This service uses Winston logger (Node.js only)
 */

export interface GlassTypePriceChange {
  glassTypeId: string;
  pricePerSqm: number;
  reason?: string;
  createdBy: string;
}

export interface GlassTypePriceHistoryRecord {
  id: string;
  glassTypeId: string;
  pricePerSqm: number;
  reason: string | null;
  effectiveFrom: Date;
  createdBy: string | null;
  createdAt: Date;
}

/**
 * Convert Prisma Decimal to number
 */
function toNumber(decimal: Prisma.Decimal): number {
  return decimal.toNumber();
}

/**
 * Convert GlassTypePriceHistory from Prisma to service interface
 */
function toPriceHistoryRecord(history: Prisma.GlassTypePriceHistoryGetPayload<object>): GlassTypePriceHistoryRecord {
  return {
    createdAt: history.createdAt,
    createdBy: history.createdBy,
    effectiveFrom: history.effectiveFrom,
    glassTypeId: history.glassTypeId,
    id: history.id,
    pricePerSqm: toNumber(history.pricePerSqm),
    reason: history.reason,
  };
}

/**
 * Create a price history record for a glass type
 * Called automatically when glass type pricing is updated
 */
export async function createGlassTypePriceHistory(change: GlassTypePriceChange): Promise<GlassTypePriceHistoryRecord> {
  logger.info('Creating glass type price history record', {
    createdBy: change.createdBy,
    glassTypeId: change.glassTypeId,
    pricePerSqm: change.pricePerSqm,
  });

  try {
    const priceHistory = await db.glassTypePriceHistory.create({
      data: {
        createdBy: change.createdBy,
        effectiveFrom: new Date(),
        glassTypeId: change.glassTypeId,
        pricePerSqm: change.pricePerSqm,
        reason: change.reason ?? null,
      },
    });

    logger.info('Glass type price history record created successfully', {
      glassTypeId: change.glassTypeId,
      id: priceHistory.id,
    });

    return toPriceHistoryRecord(priceHistory);
  } catch (error) {
    logger.error('Failed to create glass type price history record', {
      error,
      glassTypeId: change.glassTypeId,
    });
    throw error;
  }
}

/**
 * Get price history for a glass type
 * Returns records ordered by most recent first
 */
export async function getGlassTypePriceHistory(
  glassTypeId: string,
  limit = 10
): Promise<GlassTypePriceHistoryRecord[]> {
  logger.info('Fetching glass type price history', { glassTypeId, limit });

  try {
    const history = await db.glassTypePriceHistory.findMany({
      orderBy: { effectiveFrom: 'desc' },
      take: limit,
      where: { glassTypeId },
    });

    logger.info('Glass type price history fetched successfully', {
      glassTypeId,
      recordCount: history.length,
    });

    return history.map(toPriceHistoryRecord);
  } catch (error) {
    logger.error('Failed to fetch glass type price history', {
      error,
      glassTypeId,
    });
    throw error;
  }
}

/**
 * Check if glass type pricing has changed
 * Used to determine if a price history record should be created
 */
export function hasPriceChanged(currentPrice: number, updatedPrice: number): boolean {
  return currentPrice !== updatedPrice;
}

/**
 * Get the most recent price for a glass type
 * Useful for comparing against current glass type price
 */
export async function getLatestGlassTypePrice(glassTypeId: string): Promise<GlassTypePriceHistoryRecord | null> {
  logger.info('Fetching latest glass type price', { glassTypeId });

  try {
    const latestPrice = await db.glassTypePriceHistory.findFirst({
      orderBy: { effectiveFrom: 'desc' },
      where: { glassTypeId },
    });

    logger.info('Latest glass type price fetched', {
      found: !!latestPrice,
      glassTypeId,
    });

    return latestPrice ? toPriceHistoryRecord(latestPrice) : null;
  } catch (error) {
    logger.error('Failed to fetch latest glass type price', {
      error,
      glassTypeId,
    });
    throw error;
  }
}
