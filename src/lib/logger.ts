/**
 * Winston Logger Configuration
 *
 * Server-side logger with file rotation and console output.
 * Log files are stored in logs/ directory (gitignored).
 *
 * IMPORTANT: This logger is optimized for server-side use.
 * - Primary use: Server Components, API Routes, Route Handlers, Server Actions
 * - Can be imported anywhere but Winston features only work server-side
 * - Falls back to console logging if Winston cannot be loaded
 *
 * Log Levels:
 * - error: Critical errors that need immediate attention
 * - warn: Warning messages for potential issues
 * - info: General informational messages
 * - debug: Detailed debug information (development only)
 *
 * Log Files (server-side only):
 * - logs/error.log: Error level and above
 * - logs/combined.log: All levels
 * - logs/debug.log: Debug logs (development only)
 * - logs/exceptions.log: Uncaught exceptions
 * - logs/rejections.log: Unhandled promise rejections
 */

// Type definition for logger interface
type Logger = {
  info: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
  debug: (message: string, meta?: Record<string, unknown>) => void;
};

// Check if we're on the server
const isServer = typeof window === "undefined";

// Singleton Winston logger instance
let winstonLogger: Logger | null = null;
let isInitializing = false;

/**
 * Create Winston logger (server-side only)
 * Uses dynamic imports to avoid bundling Winston in client
 */
async function initializeWinston(): Promise<Logger> {
  if (!isServer) {
    // Return no-op logger for client-side
    return {
      debug: () => {},
      error: () => {},
      info: () => {},
      warn: () => {},
    };
  }

  if (winstonLogger) {
    return winstonLogger;
  }

  if (isInitializing) {
    // Wait for initialization to complete
    await new Promise((resolve) => setTimeout(resolve, 100));
    return winstonLogger || getFallbackLogger();
  }

  isInitializing = true;

  try {
    // Skip Winston initialization in production (Vercel is read-only)
    if (process.env.NODE_ENV === "production") {
      isInitializing = false;
      winstonLogger = getFallbackLogger();
      return winstonLogger;
    }

    // Dynamic imports for server-only modules (development only)
    const winston = await import("winston");
    const path = await import("node:path");

    const LogDir = path.join(process.cwd(), "logs");

    // Custom format for console output (colorized and readable)
    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.printf((info) => {
        const { timestamp, level, message, ...meta } = info as {
          timestamp: string;
          level: string;
          message: string;
          [key: string]: unknown;
        };

        let msg = `${timestamp} [${level}]: ${message}`;

        const metaKeys = Object.keys(meta).filter(
          (key) => !["service", "environment"].includes(key)
        );

        if (metaKeys.length > 0) {
          msg += `\n${JSON.stringify(meta, null, 2)}`;
        }

        return msg;
      })
    );

    // Custom format for file output (JSON for easy parsing)
    const fileFormat = winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );

    // Create Winston logger instance
    const logger = winston.createLogger({
      defaultMeta: {
        environment: process.env.NODE_ENV || "development",
        service: "glasify-lite",
      },
      exceptionHandlers: [
        new winston.transports.File({
          filename: path.join(LogDir, "exceptions.log"),
          format: fileFormat,
          maxFiles: 5,
          maxsize: 5_242_880, // 5MB
        }),
      ],
      level: "debug",
      rejectionHandlers: [
        new winston.transports.File({
          filename: path.join(LogDir, "rejections.log"),
          format: fileFormat,
          maxFiles: 5,
          maxsize: 5_242_880, // 5MB
        }),
      ],
      transports: [
        new winston.transports.Console({
          format: consoleFormat,
        }),
        new winston.transports.File({
          filename: path.join(LogDir, "error.log"),
          format: fileFormat,
          level: "error",
          maxFiles: 5,
          maxsize: 5_242_880, // 5MB
        }),
        new winston.transports.File({
          filename: path.join(LogDir, "combined.log"),
          format: fileFormat,
          maxFiles: 10,
          maxsize: 5_242_880, // 5MB
        }),
      ],
    });

    // Add debug log file (development only)
    logger.add(
      new winston.transports.File({
        filename: path.join(LogDir, "debug.log"),
        format: fileFormat,
        level: "debug",
        maxFiles: 3,
        maxsize: 5_242_880, // 5MB
      })
    );

    winstonLogger = logger as unknown as Logger;
    isInitializing = false;
    return winstonLogger;
  } catch (error) {
    isInitializing = false;
    // biome-ignore lint/suspicious/noConsole: Fallback error logging
    console.error("Failed to initialize Winston logger:", error);
    return getFallbackLogger();
  }
}

/**
 * Get fallback console logger
 * Used when Winston cannot be initialized
 */
function getFallbackLogger(): Logger {
  return {
    debug: (msg: string, meta?: Record<string, unknown>) => {
      if (process.env.NODE_ENV !== "production") {
        // biome-ignore lint/suspicious/noConsole: Fallback logger
        console.debug(`[DEBUG] ${msg}`, meta || "");
      }
    },
    error: (msg: string, meta?: Record<string, unknown>) => {
      // biome-ignore lint/suspicious/noConsole: Fallback logger
      console.error(`[ERROR] ${msg}`, meta || "");
    },
    info: (msg: string, meta?: Record<string, unknown>) => {
      // biome-ignore lint/suspicious/noConsole: Fallback logger
      console.log(`[INFO] ${msg}`, meta || "");
    },
    warn: (msg: string, meta?: Record<string, unknown>) => {
      // biome-ignore lint/suspicious/noConsole: Fallback logger
      console.warn(`[WARN] ${msg}`, meta || "");
    },
  };
}

// Export the logger with async initialization
const logger: Logger = {
  debug: (message: string, meta?: Record<string, unknown>) => {
    initializeWinston()
      .then((winston) => winston.debug(message, meta))
      .catch((_err) => getFallbackLogger().debug(message, meta));
  },
  error: (message: string, meta?: Record<string, unknown>) => {
    initializeWinston()
      .then((winston) => winston.error(message, meta))
      .catch((_err) => getFallbackLogger().error(message, meta));
  },
  info: (message: string, meta?: Record<string, unknown>) => {
    initializeWinston()
      .then((winston) => winston.info(message, meta))
      .catch((_err) => getFallbackLogger().info(message, meta));
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    initializeWinston()
      .then((winston) => winston.warn(message, meta))
      .catch((_err) => getFallbackLogger().warn(message, meta));
  },
};

export default logger;
