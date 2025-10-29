/**
 * Wizard configuration constants
 * Defines limits, delays, and wizard behavior settings
 */

/**
 * Minimum dimension constraint in millimeters
 */
export const MIN_DIMENSION = 500;

/**
 * Maximum dimension constraint in millimeters
 */
export const MAX_DIMENSION = 3000;

/**
 * Debounce delay for price calculation in milliseconds
 */
export const DEBOUNCE_DELAY = 300;

/**
 * LocalStorage key prefix for wizard progress persistence
 * Actual key format: `${LOCALSTORAGE_KEY_PREFIX}-${modelId}`
 */
export const LOCALSTORAGE_KEY_PREFIX = "wizard-progress";

/**
 * Total number of configuration steps in wizard (excluding summary)
 */
export const WIZARD_TOTAL_STEPS = 4;

/**
 * Total number of wizard screens including summary step
 */
export const WIZARD_MAX_STEP = 5;

/**
 * Maximum length for room location field
 */
export const MAX_ROOM_LOCATION_LENGTH = 100;

/**
 * Debounce delay for localStorage saves in milliseconds
 */
export const LOCALSTORAGE_SAVE_DELAY = 500;

/**
 * Conversion factor from millimeters squared to square meters
 * Used for area calculations (mm² to m²)
 */
export const MM_TO_SQM = 1_000_000;

/**
 * Placeholder price per square meter for calculations (in currency units)
 * TODO: Replace with actual price calculation from tRPC
 */
export const PLACEHOLDER_PRICE_PER_SQM = 100;

/**
 * Step numbers for wizard navigation
 */
export const STEP_LOCATION = 1;
export const STEP_DIMENSIONS = 2;
export const STEP_GLASS = 3;
export const STEP_SERVICES = 4;
