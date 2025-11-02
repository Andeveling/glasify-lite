# Research: Geocoded Delivery Addresses

**Feature**: 001-delivery-address  
**Date**: 2025-11-01  
**Purpose**: Research technical decisions for geocoding, distance calculation, and LATAM address handling

---

## 1. Geocoding API Selection

### Decision: Nominatim (OpenStreetMap)

**Rationale**:
- **Free and open-source**: No API costs, no rate limits for self-hosted instances
- **LATAM coverage**: Good coverage for major Colombian cities (Medellín, Bogotá, Cali, Buga)
- **Self-hostable**: Can run own instance if needed (avoids vendor lock-in)
- **Autocomplete support**: Forward geocoding with search endpoint
- **Reverse geocoding**: Convert coordinates back to addresses if needed (future feature)
- **No authentication required**: Public API endpoint available immediately

**Alternatives Considered**:

| API              | Pros                                          | Cons                                          | Why Rejected                                 |
| ---------------- | --------------------------------------------- | --------------------------------------------- | -------------------------------------------- |
| Mapbox Geocoding | Better autocomplete UX, faster response times | $0.50 per 1000 requests, requires API key     | Cost prohibitive for MVP (100-200 calls/day) |
| Google Maps API  | Best accuracy, rich place data                | $5 per 1000 requests, complex billing         | Expensive, overkill for basic geocoding      |
| Here API         | Good LATAM coverage, free tier 250k/month     | Requires account setup, less familiar to team | Nominatim simpler, no signup required        |
| Manual only      | Zero dependencies                             | Poor UX, no coordinates, no distance calc     | Defeats primary feature purpose              |

**Implementation Details**:
- **Endpoint**: `https://nominatim.openstreetmap.org/search`
- **Query format**: `?q={city}, {region}, Colombia&format=json&limit=5&accept-language=es`
- **Response fields**: Extract `lat`, `lon`, `display_name`, `address.city`, `address.state`
- **Rate limiting**: Max 1 request/second (Nominatim usage policy) - handled by debounce (300ms)
- **Timeout**: 5 seconds, then fallback to manual entry
- **Error handling**: Graceful degradation - show manual input fields on API failure

**References**:
- Nominatim API docs: https://nominatim.org/release-docs/develop/api/Search/
- OSM Colombia coverage: https://wiki.openstreetmap.org/wiki/Colombia

---

## 2. Distance Calculation Algorithm

### Decision: Haversine Formula (Great-Circle Distance)

**Rationale**:
- **Simple implementation**: Pure JavaScript function, no dependencies
- **Acceptable accuracy**: ±5% margin for straight-line distance vs road distance
- **Fast computation**: <1ms for any coordinate pair (performance goal: <100ms)
- **Industry standard**: Widely used for "as the crow flies" distance
- **Sufficient for MVP**: Transportation cost is rough estimate, not exact logistics planning

**Alternatives Considered**:

| Algorithm           | Pros                                         | Cons                                                     | Why Rejected                                      |
| ------------------- | -------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------- |
| Google Directions   | Actual road distance, traffic                | $5 per 1000 requests, requires API key, slow             | Overkill for MVP, expensive for simple cost calc  |
| OSRM (Open routing) | Free, road distance                          | Requires self-hosted server, slower (500ms-1s)           | Infrastructure overhead not justified for MVP     |
| Vincenty formula    | More accurate (accounts for WGS84 ellipsoid) | More complex, minimal accuracy gain (<0.5% vs Haversine) | Haversine sufficient for transportation estimates |
| Simple Euclidean    | Fastest                                      | Inaccurate at large distances (>100km)                   | Unacceptable error for intercity distances        |

**Implementation Details**:
- **Formula**: `a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)`  
              `c = 2 ⋅ atan2(√a, √(1−a))`  
              `d = R ⋅ c` where R = 6371 km (Earth's radius)
- **Library**: `haversine-distance` (npm) - zero dependencies, 200 bytes
- **Input validation**: Check latitude ∈ [-90, 90], longitude ∈ [-180, 180]
- **Edge cases**: Same coordinates return 0, antipodal points max distance ~20,000 km
- **Output**: Distance in kilometers (decimal), rounded to 2 places for display

**Example Calculation**:
```typescript
// Buga (warehouse) to Medellín (delivery)
const origin = { latitude: 3.9009, longitude: -76.2978 };
const dest = { latitude: 6.2476, longitude: -75.5658 };
const distance = haversineDistance(origin, dest) / 1000; // ~238.7 km
```

**References**:
- Haversine formula explained: https://en.wikipedia.org/wiki/Haversine_formula
- npm package: https://www.npmjs.com/package/haversine-distance

---

## 3. LATAM Address Handling Best Practices

### Decision: Flexible Structured Fields with Optional Postal Code

**Rationale**:
- **Cultural fit**: LATAM addresses vary widely (urban vs rural, different formats per country)
- **Postal code optional**: Many rural areas lack formal postal codes (Colombia's DANE coverage ~70% urban)
- **Reference landmarks**: Essential for delivery (e.g., "Frente a la iglesia", "Al lado del supermercado")
- **Progressive disclosure**: Require at least one field (city OR street OR reference) to prevent empty addresses

**Field Structure**:

| Field      | Required | Example (Colombia)             | Purpose                            |
| ---------- | -------- | ------------------------------ | ---------------------------------- |
| country    | No       | "Colombia"                     | Multi-country support (ISO 3166-1) |
| region     | No       | "Valle del Cauca", "Antioquia" | Department/State for filtering     |
| city       | No*      | "Buga", "Medellín"             | Primary delivery location          |
| district   | No       | "Barrio Granada", "Comuna 10"  | Neighborhood for local routing     |
| street     | No*      | "Calle 45 #23-10"              | Specific address (if urban)        |
| reference  | No*      | "Frente a finca Los Arrayanes" | Landmark for rural/ambiguous areas |
| postalCode | No       | "763001"                       | Optional (rural areas lack codes)  |
| latitude   | No       | 3.9009                         | From geocoding (null if manual)    |
| longitude  | No       | -76.2978                       | From geocoding (null if manual)    |

**\*At least one of city, street, or reference must be provided**

**Validation Rules**:
- **Coordinate pairs**: Both lat/lon present OR both null (no partial coordinates)
- **Coordinate ranges**: Latitude ∈ [-90, 90], Longitude ∈ [-180, 180]
- **Field lengths**: All text fields max 200 chars (prevent abuse)
- **At least one identifier**: Zod schema ensures `city || street || reference` is non-empty

**Country-Specific Adaptations**:

| Country  | Address Pattern                           | Postal Code Status                 | Notes                                    |
| -------- | ----------------------------------------- | ---------------------------------- | ---------------------------------------- |
| Colombia | "Calle/Carrera # XX-YY, City, Department" | Optional (urban 70%, rural 30%)    | Use reference for rural "Vereda X, Km Y" |
| Panama   | "Calle X, City, Province"                 | Optional (urban only)              | Province field maps to `region`          |
| Mexico   | "Calle X #Y, Colonia, City, State, CP"    | Required (urban), optional (rural) | "Colonia" maps to `district`             |

**Geocoding Fallback Strategy**:
1. **Autocomplete selected**: Full structured address + coordinates from Nominatim
2. **Autocomplete failed**: Manual entry → only text fields, coordinates null
3. **Partial geocoding**: City found but no street → coordinates approximate (city center)
4. **Reverse geocoding** (future): User pins map location → reverse lookup to fill text fields

**References**:
- Colombia postal code coverage: DANE (Colombian statistics agency)
- LATAM address formats: Universal Postal Union standards

---

## 4. Transportation Cost Calculation Strategy

### Decision: Configurable Rate per Kilometer (Server-Side)

**Rationale**:
- **Simple formula**: `cost = baseRate + (distance * perKmRate)` - easy to understand and audit
- **Tenant-configurable**: Store rates in `TenantConfig` or quote-level adjustment
- **Server-side calculation**: Prevent tampering, ensure consistent pricing
- **Real-time updates**: Recalculate on address change (triggers on address selection)

**Cost Model**:

```typescript
interface TransportationCost {
  distanceKm: number;           // Haversine distance
  baseRate: Decimal;            // Fixed cost (e.g., vehicle deployment)
  perKmRate: Decimal;           // Variable cost (fuel, driver time)
  totalCost: Decimal;           // baseRate + (distanceKm * perKmRate)
  currency: string;             // From TenantConfig (COP, USD, etc.)
}
```

**Configuration Location**:

| Option                   | Pros                                  | Cons                                 | Decision                                      |
| ------------------------ | ------------------------------------- | ------------------------------------ | --------------------------------------------- |
| `TenantConfig` fields    | Single source of truth, easy admin UI | No per-quote customization           | ✅ **MVP choice** - simple, consistent pricing |
| `Quote.Adjustment` model | Flexible per-quote overrides          | Complex UI, risk of inconsistency    | Future enhancement (manual adjustments)       |
| External pricing service | Dynamic pricing (fuel costs, zones)   | Additional infrastructure complexity | Out of scope for MVP                          |

**Formula Application**:
1. User selects delivery address → coordinates captured
2. System fetches warehouse coordinates from `TenantConfig`
3. Calculate distance: `d = haversineDistance(warehouse, delivery)`
4. Fetch rates from `TenantConfig`: `baseRate = 50000 COP`, `perKmRate = 1000 COP/km`
5. Compute cost: `cost = 50000 + (238.7 * 1000) = 288,700 COP` (Buga → Medellín)
6. Add as line item to quote or adjustment (implementation decision in Phase 1)

**Edge Cases**:
- **Warehouse not configured**: Display warning, disable cost calculation until admin sets coordinates
- **Very long distances** (>500km): Flag for manual review (prevent calculation errors, unusual deliveries)
- **Same-city delivery** (<10km): Apply minimum charge (baseRate only, ignore perKmRate)
- **No coordinates** (manual entry): Prompt user to estimate distance OR leave cost blank for manual entry

**References**:
- Colombian trucking rates: ~800-1500 COP/km (varies by region, load)
- Industry standard: Base rate covers fixed costs (driver, insurance), per-km covers variable (fuel, wear)

---

## 5. Database Schema Design

### Decision: Separate `ProjectAddress` Table with Optional One-to-One Relationship

**Rationale**:
- **Normalization**: Addresses are reusable entities (future: address book feature)
- **Null-safe**: Optional foreign key allows quotes without addresses (backward compatibility)
- **Extensible**: Easy to add multi-address support (e.g., billing vs delivery address)
- **Soft delete**: Cascade delete when quote deleted, preserves address history

**Schema Design**:

```prisma
model ProjectAddress {
  id          String   @id @default(cuid())
  quoteId     String?  // Optional FK for backward compatibility
  quote       Quote?   @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  
  // Structured fields
  label       String?  @db.VarChar(100)  // "Obra Principal", "Bodega Cliente"
  country     String?  @db.VarChar(100)
  region      String?  @db.VarChar(100)  // Department/State
  city        String?  @db.VarChar(100)
  district    String?  @db.VarChar(100)  // Neighborhood
  street      String?  @db.VarChar(200)
  reference   String?  @db.VarChar(200)  // Landmarks
  
  // Geographic coordinates (both null or both present)
  latitude    Decimal? @db.Decimal(10, 7)  // 7 decimal places = ~1cm precision
  longitude   Decimal? @db.Decimal(10, 7)
  
  // Optional
  postalCode  String?  @db.VarChar(20)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([quoteId])
  @@index([city])                // Search by city
  @@index([latitude, longitude]) // Geospatial queries (future: nearby quotes)
}

model Quote {
  // ...existing fields...
  
  projectAddressId String?
  projectAddress   ProjectAddress? @relation(fields: [projectAddressId], references: [id], onDelete: SetNull)
  
  @@index([projectAddressId])
}

model TenantConfig {
  // ...existing fields...
  
  // Warehouse location for distance calculation
  warehouseLatitude  Decimal? @db.Decimal(10, 7)
  warehouseLongitude Decimal? @db.Decimal(10, 7)
  warehouseCity      String?  @db.VarChar(100)  // Display name
  
  // Transportation cost rates
  transportBaseRate  Decimal? @db.Decimal(12, 4)  // Fixed cost per delivery
  transportPerKmRate Decimal? @db.Decimal(12, 4)  // Variable cost per km
}
```

**Index Strategy**:
- `@@index([quoteId])`: Fast lookup of address for quote (most common query)
- `@@index([city])`: Filter quotes by delivery city (admin reports)
- `@@index([latitude, longitude])`: Future geospatial queries (find quotes within radius)

**Migration Path**:
1. Add `ProjectAddress` table (no constraints)
2. Add `Quote.projectAddressId` (nullable FK)
3. Migrate existing `Quote.projectCity/projectStreet` → create `ProjectAddress` records
4. Mark old fields as deprecated (remove in v2.0 after 6 months)

**References**:
- PostgreSQL Decimal precision: https://www.postgresql.org/docs/current/datatype-numeric.html
- Coordinate precision table: 7 decimals = ±1.11 cm accuracy (sufficient for delivery)

---

## 6. UI/UX Component Architecture

### Decision: Shadcn Command + Popover for Autocomplete

**Rationale**:
- **Consistent with design system**: Uses existing Shadcn/ui primitives
- **Accessible**: Radix Popover + Command primitives handle keyboard nav, focus management
- **Responsive**: Works on desktop (primary target) and mobile (graceful degradation)
- **Debounced input**: Prevents excessive API calls (300ms debounce)

**Component Breakdown**:

```typescript
// delivery-address-picker.tsx (orchestration)
<DeliveryAddressPicker>
  <AddressAutocomplete />    // Popover + Command for search
  <ManualAddressForm />      // Fallback text inputs
  <AddressMap />             // Optional (P3): Map visualization
</DeliveryAddressPicker>
```

**State Management**:
- **Autocomplete state**: `use-address-autocomplete.ts` hook
  - Debounced search query (300ms)
  - Loading state during API call
  - Results array from Nominatim
  - Error state (API timeout/failure)
- **Selected address**: React Hook Form controlled field
- **Manual mode toggle**: Boolean state (switches between autocomplete and manual)

**User Flow**:
1. User clicks "Dirección de entrega" input
2. Popover opens with Command search
3. User types "Medellín" → debounced API call after 300ms
4. Results display in dropdown (city, region, country)
5. User selects → coordinates captured, form populated, popover closes
6. **OR** user clicks "Ingresar manualmente" → switches to text input fields

**Accessibility Checklist**:
- [x] Keyboard navigation (arrow keys, Enter to select)
- [x] Screen reader announcements (aria-labels, live regions)
- [x] Focus management (return focus to input after selection)
- [x] Error messages (Spanish, clear instructions)

**References**:
- Shadcn Command component: https://ui.shadcn.com/docs/components/command
- Radix Popover primitive: https://www.radix-ui.com/primitives/docs/components/popover

---

## 7. Testing Strategy

### Decision: Test Pyramid with Focus on Integration Tests

**Rationale**:
- **Unit tests**: Fast, isolated testing of pure functions (distance calc, formatters)
- **Integration tests**: Verify tRPC endpoints with real database (address CRUD)
- **E2E tests**: Validate user flows (autocomplete → select → verify cost)
- **Test ratio**: 60% integration, 30% unit, 10% E2E (prioritize API contract testing)

**Test Plan**:

| Test Type   | Focus                                        | Tools                     | Coverage Target |
| ----------- | -------------------------------------------- | ------------------------- | --------------- |
| Unit        | Haversine, formatters, validators, schemas   | Vitest                    | 100% (pure fns) |
| Integration | tRPC address CRUD, distance calc with DB     | Vitest + tRPC test client | 90%             |
| E2E         | Autocomplete flow, manual entry, cost update | Playwright                | Critical paths  |

**Example Tests**:

```typescript
// Unit: distance-calculator.test.ts
describe('haversineDistance', () => {
  it('calculates Buga to Medellín correctly', () => {
    const result = haversineDistance(
      { lat: 3.9009, lon: -76.2978 },
      { lat: 6.2476, lon: -75.5658 }
    );
    expect(result).toBeCloseTo(238700, -2); // ~238.7 km ±100m
  });
});

// Integration: address-crud.test.ts
describe('address.create', () => {
  it('creates ProjectAddress with valid coordinates', async () => {
    const result = await caller.address.create({
      city: 'Medellín',
      latitude: 6.2476,
      longitude: -75.5658,
    });
    expect(result.id).toBeDefined();
    expect(result.city).toBe('Medellín');
  });
});

// E2E: delivery-address-flow.spec.ts
test('select address from autocomplete', async ({ page }) => {
  await page.goto('/admin/quotes/new');
  await page.fill('[data-testid="address-search"]', 'Medellín');
  await page.waitForSelector('[role="option"]');
  await page.click('text=Medellín, Antioquia, Colombia');
  await expect(page.locator('[data-testid="coordinates"]')).toContainText('6.2476');
});
```

**References**:
- Testing trophy: https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications
- tRPC testing guide: https://trpc.io/docs/server/testing

---

## Summary of Research Decisions

| Decision Area       | Choice                           | Key Reason                                    |
| ------------------- | -------------------------------- | --------------------------------------------- |
| Geocoding API       | Nominatim (OSM)                  | Free, good LATAM coverage, no vendor lock-in  |
| Distance Algorithm  | Haversine formula                | Simple, fast, acceptable accuracy for MVP     |
| Address Structure   | Flexible fields, postal optional | LATAM rural support, cultural fit             |
| Transportation Cost | Configurable rate per km         | Simple formula, tenant-configurable           |
| Database Schema     | Separate ProjectAddress table    | Normalization, extensibility, soft delete     |
| UI Component        | Shadcn Command + Popover         | Design system consistency, accessibility      |
| Testing Strategy    | Test pyramid (60% integration)   | Prioritize API contracts, critical user flows |

**All NEEDS CLARIFICATION items resolved. Ready for Phase 1: Design & Contracts.**
