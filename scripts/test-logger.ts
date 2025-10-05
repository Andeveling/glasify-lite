/**
 * Logger Test Script
 *
 * Run with: pnpm tsx scripts/test-logger.ts
 */

import logger from '../src/lib/logger';

console.log('\n=== Testing Winston Logger ===\n');

// Test different log levels
logger.info('This is an info message');
logger.warn('This is a warning message');
logger.error('This is an error message');
logger.debug('This is a debug message');

// Test with metadata
logger.info('User action', {
  action: 'login',
  timestamp: new Date().toISOString(),
  userId: 'user123',
});

// Test error with stack trace
try {
  throw new Error('Test error with stack trace');
} catch (error) {
  logger.error('Caught an error', {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
  });
}

// Test complex object logging
logger.info('Complex data structure', {
  quote: {
    id: 'quote-123',
    items: [
      { model: 'Ventana A', price: 1500 },
      { model: 'Puerta B', price: 2500 },
    ],
    total: 4000,
  },
});

console.log('\n=== Logger Test Complete ===');
console.log('Check the following files:');
console.log('- logs/combined.log (all logs)');
console.log('- logs/error.log (errors only)');
console.log('- logs/debug.log (debug logs - dev only)');
console.log('');
