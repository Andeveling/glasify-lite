// Simple logger for Vercel compatibility
type Logger = {
  info: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
  debug: (message: string, meta?: Record<string, unknown>) => void;
};

const createConsoleLogger = (): Logger => {
  const log = (level: string, message: string, meta?: Record<string, unknown>) => {
    const timestamp = new Date().toISOString();
    let output = `${timestamp} [${level}]: ${message}`;
    if (meta && Object.keys(meta).length > 0) {
      output += ` ${JSON.stringify(meta)}`;
    }
    // biome-ignore lint/suspicious/noConsole: Logger needs console for output
    console.log(output);
  };

  return {
    debug: (message: string, meta?: Record<string, unknown>) =>
      process.env.NODE_ENV !== 'production' ? log('debug', message, meta) : undefined,
    error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta),
    info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
    warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
  };
};

const logger = createConsoleLogger();
export default logger;
