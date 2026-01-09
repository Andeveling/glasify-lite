/**
 * Simple Console Logger
 *
 * Lightweight server-side logger using console with structured formatting.
 * Designed for Vercel deployment (no file system writes required).
 *
 * IMPORTANT: This logger is optimized for server-side use.
 * - Primary use: Server Components, API Routes, Route Handlers, Server Actions
 * - Falls back gracefully on client-side (no-op in production)
 *
 * Log Levels:
 * - error: Critical errors that need immediate attention
 * - warn: Warning messages for potential issues
 * - info: General informational messages
 * - debug: Detailed debug information (development only)
 */

// Type definition for logger interface
type Logger = {
  info: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
  debug: (message: string, meta?: Record<string, unknown>) => void;
};

// Check if we're on the server and in development mode
const isServer = typeof window === "undefined";
const isDevelopment = process.env.NODE_ENV !== "production";

/**
 * Format timestamp for log entries
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Format log message with metadata
 */
function formatLog(
  level: string,
  message: string,
  meta?: Record<string, unknown>
): string {
  const timestamp = getTimestamp();
  let output = `[${timestamp}] [${level.toUpperCase()}]: ${message}`;

  if (meta && Object.keys(meta).length > 0) {
    output += `\n${JSON.stringify(meta, null, 2)}`;
  }

  return output;
}

/**
 * Simple console logger
 */
const logger: Logger = {
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (isServer && isDevelopment) {
      // biome-ignore lint/suspicious/noConsole: Debug logging in development
      console.debug(formatLog("debug", message, meta));
    }
  },
  error: (message: string, meta?: Record<string, unknown>) => {
    if (isServer) {
      // biome-ignore lint/suspicious/noConsole: Error logging
      console.error(formatLog("error", message, meta));
    }
  },
  info: (message: string, meta?: Record<string, unknown>) => {
    if (isServer) {
      // biome-ignore lint/suspicious/noConsole: Info logging
      console.log(formatLog("info", message, meta));
    }
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    if (isServer) {
      // biome-ignore lint/suspicious/noConsole: Warning logging
      console.warn(formatLog("warn", message, meta));
    }
  },
};

export default logger;
