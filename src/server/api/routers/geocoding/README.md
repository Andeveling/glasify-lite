# Geocoding Router

**Feature**: 001-delivery-address  
**Status**: Active  
**Last Updated**: 2025-11-09

## Overview

Geocoding module handles address-to-coordinates conversion using Nominatim (OpenStreetMap) API. Provides autocomplete functionality for delivery address selection.

## Architecture

```
geocoding/
├── index.ts                    # Router composition
├── geocoding.schemas.ts        # Zod validation schemas
├── geocoding.queries.ts        # tRPC query procedures
├── geocoding.constants.ts      # Configuration constants
└── repositories/
    └── (future: database operations if needed)
```

## API Endpoints

### `search` (Query)

Search for addresses with autocomplete using Nominatim API.

**Authorization**: `protectedProcedure` (authenticated users only)

**Input**:
```typescript
{
  query: string;              // Min 3, max 500 chars
  limit?: number;             // 1-10, default 5
  acceptLanguage?: string;    // Language code, default 'es'
}
```

**Output**:
```typescript
{
  results: GeocodingResult[];  // Array of results
  totalResults: number;        // Count of results
  queryTime: number;           // Execution time in ms
}
```

**GeocodingResult**:
```typescript
{
  placeId: string;
  displayName: string;
  latitude: number;
  longitude: number;
  address: {
    country: string | null;
    state: string | null;
    city: string | null;
    postcode: string | null;
  };
  boundingBox: {
    south: number;
    north: number;
    west: number;
    east: number;
  };
}
```

**Error Handling**:
- Timeout (>5s): `INTERNAL_SERVER_ERROR` - "La búsqueda de dirección excedió el tiempo límite"
- Invalid input: Zod validation error with field-specific messages
- Network error: `INTERNAL_SERVER_ERROR` - "Error al buscar dirección"

## Service Layer

**File**: `src/server/services/geocoding.service.ts`

### `searchAddress(query, limit, acceptLanguage)`

Main function for Nominatim API integration. Handles:
- Query parameter validation
- API request with User-Agent header (required by Nominatim)
- Response transformation to internal format
- Timeout handling (5 seconds)
- Error logging and user-friendly messages

**Rate Limiting**: 1 request per second (enforced by Nominatim terms)

**Nominatim API**: https://nominatim.openstreetmap.org/search

## Constants

All magic numbers extracted to `geocoding.constants.ts`:

```typescript
GEOCODING_QUERY_MIN_LENGTH = 3
GEOCODING_QUERY_MAX_LENGTH = 500
GEOCODING_DEFAULT_LIMIT = 5
GEOCODING_MAX_LIMIT = 10
GEOCODING_DEFAULT_LANGUAGE = 'es'
GEOCODING_API_URL = 'https://nominatim.openstreetmap.org'
GEOCODING_API_TIMEOUT_MS = 5000
```

## Integration Points

- **Quote Configuration**: Address search during delivery address setup
- **Transportation Cost**: Uses search results coordinates for distance calculation
- **Tenant Configuration**: Warehouse location set via geocoding

## Usage Example

```typescript
// Client-side (tRPC)
const { data } = await trpc.geocoding.search.useQuery({
  query: 'Calle 72 #10-34, Bogotá',
  limit: 5,
});

console.log(data.results[0].displayName);
console.log(data.results[0].coordinates); // { latitude: 4.6533, longitude: -74.0836 }
```

## Best Practices

1. **Rate Limiting**: Implement frontend debouncing (300ms) on search input
2. **Caching**: Cache results locally to avoid duplicate API calls
3. **Error Handling**: Display user-friendly Spanish messages for API errors
4. **Performance**: Query time is returned for monitoring (target: <1000ms)

## Future Improvements

- [ ] Implement rate limiter (1 req/sec) using `rate-limiter-flexible`
- [ ] Add local caching layer (Redis)
- [ ] Support for reverse geocoding (coordinates → address)
- [ ] Batch geocoding for multiple addresses
- [ ] Custom geocoding provider abstraction

## Testing

```typescript
describe('geocoding.search', () => {
  it('should return results for valid address', async () => {
    const result = await caller.geocoding.search({
      query: 'Calle 72, Bogotá',
    });
    expect(result.results).toHaveLength(5);
    expect(result.results[0].latitude).toBeDefined();
  });
});
```
