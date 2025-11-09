/**
 * @file Validation Utilities using Zod
 * @description Zod-based validation helpers for factories and seeders
 * No ORM-specific code, pure validation logic
 */

import type { ZodError, ZodType } from "zod";
import type { FactoryResult, ValidationError } from "../types/base.types";

/**
 * Validates data against a Zod schema and returns a FactoryResult
 *
 * @template T - The type being validated
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns FactoryResult with validation outcome
 *
 * @example
 * ```typescript
 * const schema = z.object({ email: z.string().email() });
 * const result = validateWithSchema(schema, { email: 'user@example.com' });
 * if (result.success) {
 *   console.log(result.data); // TypeScript knows it's the validated type
 * }
 * ```
 */
export function validateWithSchema<T>(
  schema: ZodType<T>,
  data: unknown
): FactoryResult<T> {
  try {
    const validated = schema.parse(data);
    return {
      data: validated,
      success: true,
    };
  } catch (error) {
    if (isZodError(error)) {
      return {
        errors: mapZodErrors(error),
        success: false,
      };
    }

    return {
      errors: [
        {
          code: "VALIDATION_ERROR",
          context: {
            received:
              typeof error === "object" && error !== null ? error : undefined,
          },
          message:
            error instanceof Error ? error.message : "Unknown validation error",
          path: [],
        },
      ],
      success: false,
    };
  }
}

/**
 * Type guard to check if error is a Zod error
 * @internal
 */
function isZodError(error: unknown): error is ZodError {
  return (
    typeof error === "object" &&
    error !== null &&
    "issues" in error &&
    Array.isArray((error as { issues: unknown }).issues)
  );
}

/**
 * Maps Zod errors to our ValidationError format
 * @internal
 */
function mapZodErrors(error: ZodError): ValidationError[] {
  return error.issues.map((issue) => ({
    code: issue.code,
    context: {
      expected: "expected" in issue ? issue.expected : undefined,
      received: "received" in issue ? issue.received : undefined,
    },
    message: issue.message,
    path: issue.path.map(String),
  }));
}

/**
 * Validates that a number is within a range (inclusive)
 *
 * @param value - Number to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @param fieldName - Field name for error messages
 * @returns ValidationError or null if valid
 *
 * @example
 * ```typescript
 * const error = validateRange(50, 0, 100, 'percentage');
 * if (error) {
 *   console.error(error.message);
 * }
 * ```
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): ValidationError | null {
  if (value < min || value > max) {
    return {
      code: "OUT_OF_RANGE",
      context: {
        max,
        min,
        received: value,
      },
      message: `${fieldName} must be between ${min} and ${max}, got ${value}`,
      path: [fieldName],
    };
  }

  return null;
}

/**
 * Validates that a string matches a pattern
 *
 * @param value - String to validate
 * @param pattern - Regular expression pattern
 * @param fieldName - Field name for error messages
 * @returns ValidationError or null if valid
 */
export function validatePattern(
  value: string,
  pattern: RegExp,
  fieldName: string
): ValidationError | null {
  if (!pattern.test(value)) {
    return {
      code: "INVALID_FORMAT",
      context: {
        pattern: pattern.source,
        received: value,
      },
      message: `${fieldName} has invalid format`,
      path: [fieldName],
    };
  }

  return null;
}

/**
 * Validates that a string is not empty
 *
 * @param value - String to validate
 * @param fieldName - Field name for error messages
 * @returns ValidationError or null if valid
 */
export function validateNotEmpty(
  value: string,
  fieldName: string
): ValidationError | null {
  if (!value || value.trim().length === 0) {
    return {
      code: "EMPTY_STRING",
      message: `${fieldName} cannot be empty`,
      path: [fieldName],
    };
  }

  return null;
}

/**
 * Validates that a string has a specific length
 *
 * @param value - String to validate
 * @param min - Minimum length
 * @param max - Maximum length
 * @param fieldName - Field name for error messages
 * @returns ValidationError or null if valid
 */
export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName: string
): ValidationError | null {
  const len = value.length;
  if (len < min || len > max) {
    return {
      code: "INVALID_LENGTH",
      context: {
        max,
        min,
        received: len,
      },
      message: `${fieldName} must be between ${min} and ${max} characters, got ${len}`,
      path: [fieldName],
    };
  }

  return null;
}

/**
 * Validates that an array has items
 *
 * @param value - Array to validate
 * @param min - Minimum number of items
 * @param max - Maximum number of items (optional)
 * @param arrayFieldName - Field name for error messages
 * @returns ValidationError or null if valid
 */
export function validateArrayLength(
  value: unknown[],
  min: number,
  max?: number,
  arrayFieldName = "array"
): ValidationError | null {
  const len = value.length;
  if (len < min) {
    return {
      code: "ARRAY_TOO_SHORT",
      context: {
        min,
        received: len,
      },
      message: `${arrayFieldName} must have at least ${min} items, got ${len}`,
      path: [arrayFieldName],
    };
  }

  if (max !== undefined && len > max) {
    return {
      code: "ARRAY_TOO_LONG",
      context: {
        max,
        received: len,
      },
      message: `${arrayFieldName} must have at most ${max} items, got ${len}`,
      path: [arrayFieldName],
    };
  }

  return null;
}

/**
 * Combines multiple validation errors
 *
 * @param errors - Array of validation errors or nulls
 * @returns Array of non-null validation errors
 */
export function combineValidationErrors(
  errors: (ValidationError | null)[]
): ValidationError[] {
  return errors.filter((error): error is ValidationError => error !== null);
}

/**
 * Creates a FactoryResult from validation errors
 *
 * @param errors - Validation errors
 * @returns FactoryResult with errors
 */
export function createErrorResult(
  errors: ValidationError[]
): FactoryResult<never> {
  return {
    errors: errors.length > 0 ? errors : undefined,
    success: false,
  };
}

/**
 * Creates a FactoryResult with data
 *
 * @template T - Data type
 * @param data - Successfully validated data
 * @returns FactoryResult with data
 */
export function createSuccessResult<T>(data: T): FactoryResult<T> {
  return {
    data,
    success: true,
  };
}
