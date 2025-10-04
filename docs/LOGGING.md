# Logger Documentation

Glasify Lite uses [Winston](https://github.com/winstonjs/winston) as its logging framework, providing structured logging with file rotation and multiple output formats.

## Quick Start

```typescript
import logger from '@/lib/logger';

// Basic logging
logger.info('User logged in');
logger.warn('API rate limit approaching');
logger.error('Database connection failed');
logger.debug('Processing quote calculation'); // Development only

// Logging with metadata
logger.info('Quote created', {
  quoteId: 'quote-123',
  userId: 'user-456',
  total: 5000,
});

// Error logging with stack trace
try {
  // Some operation
} catch (error) {
  logger.error('Operation failed', {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
  });
}
```

## Log Levels

Winston supports the following log levels (in order of priority):

| Level | Description | When to Use |
|-------|-------------|-------------|
| `error` | Critical errors | Database failures, unhandled exceptions, system errors |
| `warn` | Warning messages | Deprecated API usage, rate limit warnings, recoverable errors |
| `info` | Informational messages | User actions, API calls, system events |
| `debug` | Debug information | Development debugging (not logged in production) |

## Log Files

All log files are stored in the `logs/` directory:

| File | Contents | Rotation |
|------|----------|----------|
| `combined.log` | All log levels | 5MB max, keep 10 files |
| `error.log` | Error level only | 5MB max, keep 5 files |
| `debug.log` | Debug level (dev only) | 5MB max, keep 3 files |
| `exceptions.log` | Uncaught exceptions | 5MB max, keep 5 files |
| `rejections.log` | Unhandled promises | 5MB max, keep 5 files |

## NPM Scripts

```bash
# Test the logger
pnpm logger:test

# View logs in real-time
pnpm logs:view          # All logs
pnpm logs:errors        # Errors only

# Clean log files
pnpm logs:clean
```

## Viewing Logs

### Real-time monitoring

```bash
# Follow all logs
tail -f logs/combined.log

# Follow errors only
tail -f logs/error.log
```

### Search and filter

```bash
# Search for specific text
grep "user-123" logs/combined.log

# Search with context (5 lines before and after)
grep -C 5 "error" logs/combined.log
```

### Parse JSON logs

Log files are in JSON format for easy parsing:

```bash
# Pretty print
cat logs/combined.log | jq .

# Filter by level
cat logs/combined.log | jq 'select(.level == "error")'

# Filter by service
cat logs/combined.log | jq 'select(.service == "glasify-lite")'

# Get last 10 errors
cat logs/error.log | tail -n 10 | jq .
```

## Best Practices

### 1. Use appropriate log levels

```typescript
// ❌ Don't use info for errors
logger.info('Database connection failed');

// ✅ Use error for errors
logger.error('Database connection failed');
```

### 2. Include context with metadata

```typescript
// ❌ Don't log without context
logger.error('Update failed');

// ✅ Include relevant metadata
logger.error('Quote update failed', {
  quoteId: quote.id,
  userId: user.id,
  error: error.message,
});
```

### 3. Don't log sensitive data

```typescript
// ❌ Never log passwords or tokens
logger.info('User logged in', {
  email: user.email,
  password: user.password, // 🚨 Never do this!
});

// ✅ Log safe identifiers only
logger.info('User logged in', {
  userId: user.id,
  email: user.email,
});
```

### 4. Use structured logging

```typescript
// ❌ Don't concatenate strings
logger.info(`User ${userId} created quote ${quoteId}`);

// ✅ Use metadata for structured data
logger.info('Quote created', {
  userId,
  quoteId,
});
```

### 5. Log at appropriate points

```typescript
// ✅ Log important state changes
export async function createQuote(data: QuoteData) {
  logger.info('Creating quote', { userId: data.userId });
  
  try {
    const quote = await db.quote.create({ data });
    logger.info('Quote created successfully', { quoteId: quote.id });
    return quote;
  } catch (error) {
    logger.error('Quote creation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: data.userId,
    });
    throw error;
  }
}
```

## Environment-Specific Behavior

### Development
- All log levels are logged (including debug)
- Console output is colorized
- Logs written to files in `logs/`
- Debug file is created

### Production
- Only info, warn, and error are logged
- Console output is JSON formatted
- Logs written to files in `logs/`
- No debug file created

## Integration with Next.js

The logger works seamlessly in both Server Components and API routes:

```typescript
// In a Server Component
export default async function Page() {
  logger.info('Page rendered', { path: '/catalog' });
  // ...
}

// In a Route Handler
export async function GET(req: Request) {
  logger.info('API request', { endpoint: '/api/quotes' });
  // ...
}

// In a tRPC procedure
export const quoteRouter = createTRPCRouter({
  create: publicProcedure
    .input(quoteSchema)
    .mutation(async ({ ctx, input }) => {
      logger.info('Creating quote via tRPC', { input });
      // ...
    }),
});
```

## Monitoring in Production

For production environments, consider integrating with external logging services:

- **Vercel**: Logs are automatically captured in Vercel dashboard
- **Datadog**: Use `winston-transport` for Datadog
- **Sentry**: Use `@sentry/node` for error tracking
- **CloudWatch**: Use `winston-cloudwatch` for AWS

## Troubleshooting

### Logs not appearing

1. Check that the `logs/` directory exists
2. Verify file permissions
3. Check disk space

### Log files growing too large

Adjust rotation settings in `src/lib/logger.ts`:

```typescript
maxsize: 5242880, // 5MB - adjust as needed
maxFiles: 10,     // Number of rotated files to keep
```

### Performance impact

Winston is highly performant, but if you notice slowdowns:

1. Reduce log level in production (`'info'` instead of `'debug'`)
2. Disable file logging for non-critical environments
3. Use async transport if available

## Related Documentation

- [Winston GitHub](https://github.com/winstonjs/winston)
- [Winston Documentation](https://github.com/winstonjs/winston#readme)
- [Log Levels](https://github.com/winstonjs/winston#logging-levels)
