/**
 * User Router Constants
 *
 * Search and pagination limits for user list operations.
 */

/**
 * Search query length limits
 * - MIN: Prevent excessive wildcard queries on short strings
 * - MAX: Prevent memory exhaustion and performance issues
 */
export const USER_SEARCH_LIMITS = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 50,
} as const;

/**
 * Validation messages
 */
export const USER_VALIDATION_MESSAGES = {
  INVALID_USER_ID: "ID de usuario inválido",
  INVALID_SEARCH: `La búsqueda debe tener entre ${USER_SEARCH_LIMITS.MIN_LENGTH} y ${USER_SEARCH_LIMITS.MAX_LENGTH} caracteres`,
  CANNOT_DEMOTE_SELF: "No puedes cambiar tu propio rol de administrador",
  USER_NOT_FOUND: "Usuario no encontrado",
  OPERATION_FAILED: {
    LIST_USERS: "Error al listar usuarios",
    UPDATE_ROLE: "Error al actualizar el rol del usuario",
  },
} as const;
