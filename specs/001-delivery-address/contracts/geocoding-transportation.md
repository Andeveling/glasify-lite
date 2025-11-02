# tRPC API Contract: Geocoding & Transportation

**Feature**: 001-delivery-address  
**Router**: `src/server/api/routers/geocoding.ts`  
**Purpose**: Proxy geocoding API requests and calculate transportation costs

---

## Router: `geocoding`

### Procedure: `search`

**Type**: Query (protected - requires authentication)  
**Authorization**: Admin or Seller roles only  
**Rate Limiting**: 1 request/second (Nominatim usage policy)

**Input Schema**:
```typescript
{
  query: string;              // Search text (e.g., "Medellín Antioquia")
  limit?: number;             // Max results (default: 5, max: 10)
  acceptLanguage?: string;    // Locale (default: "es" from TenantConfig)
}
```

**Output Schema**:
```typescript
{
  results: Array<{
    placeId: string;          // OSM place ID (for future reverse lookup)
    displayName: string;      // Formatted address (e.g., "Medellín, Antioquia, Colombia")
    latitude: number;         // WGS84 latitude
    longitude: number;        // WGS84 longitude
    
    // Structured address components
    address: {
      city?: string;          // City/municipality
      state?: string;         // Department/state
      country?: string;       // Country
      countryCode?: string;   // ISO code (e.g., "CO")
      postcode?: string;      // Postal code (if available)
    };
    
    // Bounding box (for map visualization)
    boundingBox?: {
      south: number;
      west: number;
      north: number;
      east: number;
    };
  }>;
  
  // Metadata
  totalResults: number;
  queryTime: number;          // Response time in ms
}
```

**Example Request**:
```typescript
const results = await trpc.geocoding.search.query({ 
  query: 'Medellín Antioquia',
  limit: 5,
});
```

**Example Response**:
```json
{
  "results": [
    {
      "placeId": "12345678",
      "displayName": "Medellín, Antioquia, Colombia",
      "latitude": 6.2476,
      "longitude": -75.5658,
      "address": {
        "city": "Medellín",
        "state": "Antioquia",
        "country": "Colombia",
        "countryCode": "CO"
      },
      "boundingBox": {
        "south": 6.1345,
        "west": -75.6234,
        "north": 6.3607,
        "east": -75.5082
      }
    }
  ],
  "totalResults": 1,
  "queryTime": 342
}
```

**Errors**:
- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: User is not admin or seller
- `TIMEOUT`: Geocoding API didn't respond within 5 seconds
- `EXTERNAL_SERVICE_ERROR`: Nominatim API returned error
- `RATE_LIMIT_EXCEEDED`: Too many requests (>1/second)

**Implementation Details**:
```typescript
// src/server/services/geocoding.service.ts
export async function searchAddress(query: string, limit = 5) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?` +
    `q=${encodeURIComponent(query)}` +
    `&format=json` +
    `&limit=${limit}` +
    `&accept-language=es` +
    `&addressdetails=1`,
    {
      headers: {
        'User-Agent': 'Glasify-Lite/1.0',  // Required by Nominatim
      },
      signal: AbortSignal.timeout(5000),  // 5s timeout
    }
  );
  
  if (!response.ok) {
    logger.error('Geocoding API error', { 
      status: response.status, 
      query 
    });
    throw new TRPCError({ code: 'EXTERNAL_SERVICE_ERROR' });
  }
  
  const data = await response.json();
  
  // Transform Nominatim response to our schema
  return {
    results: data.map((item: any) => ({
      placeId: item.place_id,
      displayName: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      address: {
        city: item.address?.city || item.address?.town,
        state: item.address?.state,
        country: item.address?.country,
        countryCode: item.address?.country_code,
        postcode: item.address?.postcode,
      },
      boundingBox: item.boundingbox ? {
        south: parseFloat(item.boundingbox[0]),
        west: parseFloat(item.boundingbox[2]),
        north: parseFloat(item.boundingbox[1]),
        east: parseFloat(item.boundingbox[3]),
      } : undefined,
    })),
    totalResults: data.length,
    queryTime: performance.now(),
  };
}
```

---

### Procedure: `reverse`

**Type**: Query (protected - requires authentication)  
**Authorization**: Admin or Seller roles only  
**Purpose**: Convert coordinates to address (future feature - P3)

**Input Schema**:
```typescript
{
  latitude: number;           // -90 to +90
  longitude: number;          // -180 to +180
}
```

**Output Schema**:
```typescript
{
  displayName: string;        // Formatted address
  address: {
    city?: string;
    state?: string;
    country?: string;
  };
}
```

**Note**: Not implemented in MVP (reserved for map pin placement feature).

---

## Router: `transportation`

### Procedure: `calculateCost`

**Type**: Query (protected - requires authentication)  
**Authorization**: Admin, Seller, or User (owner of quote)

**Input Schema**:
```typescript
{
  deliveryLatitude: number;   // Delivery location latitude
  deliveryLongitude: number;  // Delivery location longitude
  quoteId?: string;           // Optional: For logging/tracking
}
```

**Output Schema**:
```typescript
{
  distance: {
    kilometers: number;       // Haversine distance (e.g., 238.7)
    displayText: string;      // Formatted (e.g., "238.7 km")
  };
  
  cost: {
    baseRate: Decimal;        // Fixed cost (from TenantConfig)
    perKmRate: Decimal;       // Variable cost per km
    distanceCost: Decimal;    // distance * perKmRate
    totalCost: Decimal;       // baseRate + distanceCost
    currency: string;         // From TenantConfig (e.g., "COP")
    displayText: string;      // Formatted (e.g., "$288,700 COP")
  };
  
  warehouse: {
    city: string;             // Warehouse city name
    latitude: number;
    longitude: number;
  };
  
  // Metadata
  calculatedAt: Date;
}
```

**Example Request**:
```typescript
const cost = await trpc.transportation.calculateCost.query({
  deliveryLatitude: 6.2476,
  deliveryLongitude: -75.5658,
  quoteId: 'quote_123',
});
```

**Example Response**:
```json
{
  "distance": {
    "kilometers": 238.7,
    "displayText": "238.7 km"
  },
  "cost": {
    "baseRate": "50000.0000",
    "perKmRate": "1000.0000",
    "distanceCost": "238700.0000",
    "totalCost": "288700.0000",
    "currency": "COP",
    "displayText": "$288,700 COP"
  },
  "warehouse": {
    "city": "Buga",
    "latitude": 3.9009,
    "longitude": -76.2978
  },
  "calculatedAt": "2025-11-01T10:45:00.000Z"
}
```

**Errors**:
- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: User doesn't own quote and is not admin/seller
- `PRECONDITION_FAILED`: Warehouse location not configured in TenantConfig
- `BAD_REQUEST`: Invalid coordinates (out of range)

**Implementation Details**:
```typescript
// src/server/services/transportation.service.ts
import { haversineDistance } from '@/lib/utils/coordinates';

export async function calculateTransportationCost(
  deliveryLat: number,
  deliveryLon: number,
  tenantConfig: TenantConfig
) {
  // Validate warehouse configured
  if (!tenantConfig.warehouseLatitude || !tenantConfig.warehouseLongitude) {
    throw new TRPCError({ 
      code: 'PRECONDITION_FAILED',
      message: 'Warehouse location not configured. Contact administrator.',
    });
  }
  
  // Calculate distance
  const distanceMeters = haversineDistance(
    { lat: tenantConfig.warehouseLatitude, lon: tenantConfig.warehouseLongitude },
    { lat: deliveryLat, lon: deliveryLon }
  );
  
  const distanceKm = distanceMeters / 1000;
  
  // Apply cost formula
  const baseRate = tenantConfig.transportBaseRate ?? 0;
  const perKmRate = tenantConfig.transportPerKmRate ?? 0;
  const distanceCost = distanceKm * perKmRate;
  const totalCost = baseRate + distanceCost;
  
  // Log calculation
  logger.info('Transportation cost calculated', {
    distanceKm,
    totalCost,
    warehouseCity: tenantConfig.warehouseCity,
  });
  
  return {
    distance: {
      kilometers: parseFloat(distanceKm.toFixed(2)),
      displayText: `${distanceKm.toFixed(1)} km`,
    },
    cost: {
      baseRate,
      perKmRate,
      distanceCost,
      totalCost,
      currency: tenantConfig.currency,
      displayText: formatCurrency(totalCost, tenantConfig.currency),
    },
    warehouse: {
      city: tenantConfig.warehouseCity ?? 'Unknown',
      latitude: tenantConfig.warehouseLatitude,
      longitude: tenantConfig.warehouseLongitude,
    },
    calculatedAt: new Date(),
  };
}
```

---

### Procedure: `getWarehouseLocation`

**Type**: Query (protected - requires authentication)  
**Authorization**: Admin or Seller only

**Input Schema**: None (reads from singleton TenantConfig)

**Output Schema**:
```typescript
{
  configured: boolean;        // Whether warehouse location is set
  city?: string;
  latitude?: number;
  longitude?: number;
  
  // Cost configuration
  transportBaseRate?: Decimal;
  transportPerKmRate?: Decimal;
  currency: string;
}
```

**Example Request**:
```typescript
const warehouse = await trpc.transportation.getWarehouseLocation.query();
```

**Example Response**:
```json
{
  "configured": true,
  "city": "Buga",
  "latitude": 3.9009,
  "longitude": -76.2978,
  "transportBaseRate": "50000.0000",
  "transportPerKmRate": "1000.0000",
  "currency": "COP"
}
```

**Use Case**: Display warning if not configured, show origin city in quote summary.

---

## Rate Limiting Strategy

### Geocoding API

Nominatim usage policy: max 1 request/second

**Implementation**:
```typescript
// src/server/api/routers/geocoding.ts
import { RateLimiterMemory } from 'rate-limiter-flexible';

const geocodingLimiter = new RateLimiterMemory({
  points: 1,      // 1 request
  duration: 1,    // per 1 second
});

export const geocodingRouter = createTRPCRouter({
  search: protectedProcedure
    .input(geocodingSearchSchema)
    .query(async ({ ctx, input }) => {
      // Check rate limit
      try {
        await geocodingLimiter.consume(ctx.session.user.id);
      } catch {
        throw new TRPCError({ 
          code: 'TOO_MANY_REQUESTS',
          message: 'Geocoding rate limit exceeded. Wait 1 second.',
        });
      }
      
      // Proceed with geocoding
      return await geocodingService.searchAddress(input.query, input.limit);
    }),
});
```

---

## Caching Strategy

### Geocoding Results

**Decision**: No caching (queries are ephemeral, autocomplete-driven)

**Rationale**:
- User types query → sees results → selects → done
- Results vary by query (no cache key reuse)
- API is fast enough (<500ms)
- Nominatim rate limit (1/s) enforced client-side via debounce (300ms)

### Transportation Cost

**Decision**: No caching (pure function, computed on-demand)

**Rationale**:
- Calculation is fast (<100ms)
- Depends on delivery address (changes frequently during quote creation)
- Result is deterministic (same coords → same cost)
- TenantConfig rates may change (stale cache risk)

### Warehouse Location

**Decision**: 5-minute cache (rarely changes)

**Rationale**:
- Read from singleton TenantConfig
- Only changes when admin updates warehouse
- Reduce database queries for frequent distance calculations

```typescript
export const transportationRouter = createTRPCRouter({
  getWarehouseLocation: protectedProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.tenantConfig.findUnique({
        where: { id: '1' },
        select: {
          warehouseCity: true,
          warehouseLatitude: true,
          warehouseLongitude: true,
          transportBaseRate: true,
          transportPerKmRate: true,
          currency: true,
        },
        // Use React Query staleTime: 5 minutes on client
      });
    }),
});
```

---

## Testing Contract

### Unit Tests (Geocoding Service)

```typescript
// tests/unit/geocoding.service.test.ts
import { searchAddress } from '@/server/services/geocoding.service';

describe('searchAddress', () => {
  it('returns results for valid query', async () => {
    const results = await searchAddress('Medellín Antioquia', 5);
    
    expect(results.results.length).toBeGreaterThan(0);
    expect(results.results[0].address.city).toBe('Medellín');
  });
  
  it('handles timeout gracefully', async () => {
    // Mock fetch with slow response
    global.fetch = jest.fn(() => 
      new Promise((resolve) => setTimeout(resolve, 6000))
    );
    
    await expect(searchAddress('test')).rejects.toThrow('TIMEOUT');
  });
});
```

### Integration Tests (Transportation Cost)

```typescript
// tests/integration/transportation.test.ts
describe('transportation.calculateCost', () => {
  it('calculates cost for valid coordinates', async () => {
    const ctx = await createInnerTRPCContext({ session: mockAdminSession });
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.transportation.calculateCost({
      deliveryLatitude: 6.2476,
      deliveryLongitude: -75.5658,
    });
    
    expect(result.distance.kilometers).toBeCloseTo(238.7, 1);
    expect(parseFloat(result.cost.totalCost)).toBeGreaterThan(0);
  });
  
  it('throws error when warehouse not configured', async () => {
    // Mock TenantConfig with null warehouse
    const ctx = await createInnerTRPCContext({ session: mockAdminSession });
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.transportation.calculateCost({
        deliveryLatitude: 6.2476,
        deliveryLongitude: -75.5658,
      })
    ).rejects.toThrow('Warehouse location not configured');
  });
});
```
