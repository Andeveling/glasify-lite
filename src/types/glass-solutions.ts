/**
 * Glass Solutions Types
 *
 * Shared types for glass solution highlighting feature.
 * Used across tRPC procedures and UI components.
 */

import type { PerformanceRating } from '@prisma/client';

/** Scoring constants for solution prioritization */
const PRIMARY_SOLUTION_BONUS = 20;
const FREQUENCY_MULTIPLIER = 5;

/** Performance rating score constants */
const RATING_EXCELLENT = 100;
const RATING_VERY_GOOD = 80;
const RATING_GOOD = 60;
const RATING_STANDARD = 40;
const RATING_BASIC = 20;

/**
 * Highlighted solution to display in UI
 * Represents the top solutions for a window model
 */
export type HighlightedSolution = {
  /** Lucide icon name (Shield, Snowflake, Volume2, Sparkles) */
  icon?: string;
  /** Solution name in Spanish (from GlassSolution.nameEs) */
  nameEs: string;
  /** Best performance rating found across compatible glass types */
  rating: PerformanceRating;
};

/**
 * Solution aggregation data (internal use in tRPC)
 * Used to calculate scores and determine top solutions
 */
export type SolutionAggregation = {
  id: string;
  nameEs: string;
  icon?: string;
  bestRating: PerformanceRating;
  count: number;
  isPrimary: boolean;
  sortOrder: number;
  score: number;
};

/**
 * Get numeric score for a performance rating
 * Higher score = better performance
 */
export function getRatingScore(rating: PerformanceRating): number {
  switch (rating) {
    case 'excellent':
      return RATING_EXCELLENT;
    case 'very_good':
      return RATING_VERY_GOOD;
    case 'good':
      return RATING_GOOD;
    case 'standard':
      return RATING_STANDARD;
    case 'basic':
      return RATING_BASIC;
    default:
      return RATING_BASIC;
  }
}

/**
 * Calculate priority score for a solution
 *
 * Score components:
 * 1. Rating weight (most important): 20-100 points
 * 2. Primary solution bonus: +20 points
 * 3. Frequency multiplier: count * 5 points
 */
export function calculateSolutionScore(solution: {
  bestRating: PerformanceRating;
  isPrimary: boolean;
  count: number;
}): number {
  return (
    getRatingScore(solution.bestRating) +
    (solution.isPrimary ? PRIMARY_SOLUTION_BONUS : 0) +
    solution.count * FREQUENCY_MULTIPLIER
  );
}
