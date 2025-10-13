/**
 * Next.js Instrumentation Hook
 *
 * This file is automatically loaded by Next.js before the server starts.
 * It's used to configure global Node.js settings and perform one-time initialization.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

import { EventEmitter } from 'node:events';

/**
 * Register function runs once when the server starts (both dev and production)
 */
export function register() {
  // Increase the default limit for event listeners in development
  // This prevents "MaxListenersExceededWarning" when multiple Server Components
  // register event handlers (e.g., for tRPC queries, logging, error handling)
  if (process.env.NODE_ENV === 'development') {
    // Set a higher limit for development (default is 10)
    // This is safe in development and prevents spurious warnings
    EventEmitter.defaultMaxListeners = 20;

    console.log('[Instrumentation] Event listener limit increased to 20 for development');
  }

  // Additional production optimizations can be added here
  if (process.env.NODE_ENV === 'production') {
    // Production-specific initialization
    console.log('[Instrumentation] Production environment initialized');
  }
}
