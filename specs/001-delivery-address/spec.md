# Feature Specification: Geocoded Delivery Addresses for Quotes

**Feature Branch**: `001-delivery-address`  
**Created**: 2025-11-01  
**Status**: Draft  
**Input**: User description: "Agregar soporte de ubicación geográfica estructurada para direcciones de entrega en cotizaciones, permitiendo geocodificación y cálculo de costos de transporte"

**Note**: This specification must comply with project constitution (`.specify/memory/constitution.md`). The implementation plan (`plan.md`) will perform detailed constitution checks.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Specify Delivery Address with Geographic Search (Priority: P1)

As a seller creating a quote, I need to specify the exact delivery location for a project (construcción/obra) using a searchable address input, so that the system can calculate accurate transportation costs from our warehouse to the construction site.

**Why this priority**: Core MVP requirement - enables the primary use case of "quote in City A, deliver to City B". Without this, the feature provides no value.

**Independent Test**: Can be fully tested by creating a quote, typing "Medellín" in the delivery address field, selecting from autocomplete suggestions, and verifying that latitude/longitude are saved. Delivers immediate value by capturing precise delivery location.

**Acceptance Scenarios**:

1. **Given** a seller is creating a new quote, **When** they type "Medellín, Antioquia" in the delivery address field, **Then** system shows autocomplete suggestions with matching cities/regions
2. **Given** autocomplete suggestions are displayed, **When** seller selects "Medellín, Antioquia, Colombia", **Then** system captures full address details (city, region, country) and geographic coordinates (lat/lon)
3. **Given** seller selected a delivery address, **When** they save the quote, **Then** system persists the address with all geographic data in `ProjectAddress` model
4. **Given** a quote with saved delivery address, **When** seller views the quote, **Then** delivery address displays as formatted text (e.g., "Medellín, Antioquia, Colombia")

---

### User Story 2 - Manual Address Entry for Rural/Specific Locations (Priority: P2)

As a seller quoting for rural areas or specific construction sites, I need to manually enter detailed address information (street, reference landmarks) when autocomplete doesn't provide exact matches, so that delivery teams can locate the site accurately.

**Why this priority**: Essential for LATAM rural coverage where autocomplete may fail. Enables broader market reach beyond major cities.

**Independent Test**: Create a quote, manually type street address "Vereda El Carmelo, Km 5 vía Buga-Tuluá", add reference "Frente a finca Los Arrayanes", save, and verify all fields persist correctly.

**Acceptance Scenarios**:

1. **Given** autocomplete doesn't find exact match, **When** seller manually enters street address and reference landmark, **Then** system saves all text fields without requiring coordinates
2. **Given** manual address entry mode, **When** seller provides district/neighborhood name, **Then** system captures it in the `district` field for future reference
3. **Given** manual address with no coordinates, **When** quote is saved, **Then** latitude/longitude fields remain null (optional for MVP)

---

### User Story 3 - Calculate Transportation Cost Based on Distance (Priority: P2)

As a seller generating a quote, I need the system to automatically calculate transportation costs based on the distance from our warehouse to the delivery location, so that quotes accurately reflect delivery expenses.

**Why this priority**: Core business requirement for accurate pricing. Directly impacts profitability by preventing underquoting on distant deliveries.

**Independent Test**: Create quote with delivery address in Medellín (warehouse in Buga). System calculates ~240km distance and adds transportation cost to quote total. Verify cost appears as line item in quote summary.

**Acceptance Scenarios**:

1. **Given** warehouse location is configured in `TenantConfig` (lat/lon or default city), **When** seller selects delivery address with coordinates, **Then** system calculates straight-line distance (Haversine formula)
2. **Given** distance is calculated, **When** system applies transportation rate (e.g., $X per km), **Then** transportation cost is computed and displayed in quote summary
3. **Given** delivery address has no coordinates, **When** quote is finalized, **Then** system uses default city-to-city distance OR prompts seller to estimate distance manually
4. **Given** quote includes transportation cost, **When** seller edits delivery address, **Then** system recalculates distance and updates transportation cost automatically

---

### User Story 4 - Map Visualization for Address Verification (Priority: P3)

As a seller confirming delivery details, I want to see the delivery location on an interactive map, so that I can visually verify the address is correct before sending the quote to the client.

**Why this priority**: Nice-to-have UX enhancement. Improves confidence in address accuracy but not strictly required for MVP functionality.

**Independent Test**: Select delivery address from autocomplete, verify map marker appears at correct location. Pan/zoom map to confirm surrounding area matches expected delivery zone.

**Acceptance Scenarios**:

1. **Given** delivery address has coordinates, **When** address is selected, **Then** mini map displays with marker at delivery location
2. **Given** map is displayed, **When** seller clicks marker, **Then** tooltip shows formatted address details
3. **Given** map displays incorrect location, **When** seller manually adjusts marker position, **Then** system updates coordinates to new position

---

### Edge Cases

- **No postal code**: System allows saving addresses without postal codes (common in LATAM rural areas) - `postalCode` field is nullable
- **Autocomplete API failure**: System gracefully falls back to manual text entry mode if geocoding service is unavailable
- **Duplicate addresses**: System allows saving same address multiple times for different quotes (no uniqueness constraint)
- **Warehouse location not configured**: System displays warning and disables transportation cost calculation until `TenantConfig` warehouse coordinates are set
- **Very long distances**: System caps maximum transportation cost or flags quotes >500km for manual review (prevents calculation errors)
- **Address in different country**: System handles cross-border deliveries by supporting `country` field in ISO 3166-1 format
- **Coordinate precision**: System stores coordinates with 7 decimal places (~1cm precision) to support future route optimization

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow sellers to search and select delivery addresses using autocomplete powered by geocoding API (Nominatim or Mapbox)
- **FR-002**: System MUST capture structured address components: country, region (state/department), city, district (neighborhood), street, and reference landmarks
- **FR-003**: System MUST persist geographic coordinates (latitude, longitude) when address is geocoded from autocomplete selection
- **FR-004**: System MUST associate one delivery address (`ProjectAddress`) per quote with optional one-to-one relationship
- **FR-005**: System MUST support manual address entry with all fields optional except at least one of: city, street, or reference (prevents completely empty addresses)
- **FR-006**: System MUST display saved delivery addresses in human-readable format (e.g., "Calle 45 #23-10, Medellín, Antioquia, Colombia")
- **FR-007**: System MUST calculate straight-line distance between warehouse location and delivery address using Haversine formula when both coordinates are available
- **FR-008**: System MUST apply configurable transportation rate (e.g., cost per kilometer) to calculated distance and add result to quote total
- **FR-009**: System MUST store warehouse location in `TenantConfig` as either full address with coordinates OR fixed coordinates with city name
- **FR-010**: System MUST allow null coordinates in `ProjectAddress` for manually entered addresses without geocoding (supports rural/imprecise locations)
- **FR-011**: System MUST maintain backward compatibility with existing `Quote.projectCity`, `Quote.projectStreet` fields during migration (deprecate but not remove immediately)
- **FR-012**: System MUST validate coordinate ranges: latitude (-90 to +90), longitude (-180 to +180) before persisting
- **FR-013**: System MUST support soft delete of delivery addresses (cascade delete when quote is deleted, set null when address is removed)

### Key Entities *(mandatory)*

- **ProjectAddress**: Represents the structured delivery location for a construction project or delivery site
  - Attributes: label (optional tag like "Obra Principal", "Bodega Cliente"), country, region, city, district, street, reference (landmarks), latitude, longitude, postal code
  - Relationships: belongs to one Quote (optional one-to-one), can exist independently for address reuse
  - Constraints: At least one of city/street/reference must be non-null; latitude/longitude are optional but both must be present or both null
  
- **Quote** (modified): Existing quote model with new optional relationship to ProjectAddress
  - New Relationship: optional foreign key `projectAddressId` pointing to `ProjectAddress.id`
  - Backward Compatibility: existing `projectCity`, `projectStreet`, `projectState`, `projectPostalCode` fields remain but are marked as deprecated
  - Migration Path: existing structured project fields can be migrated to `ProjectAddress` records in data migration script

- **TenantConfig** (modified): Singleton configuration for tenant-level settings, extended to include warehouse location
  - New Attributes: `warehouseLatitude` (Decimal, nullable), `warehouseLongitude` (Decimal, nullable), `warehouseCity` (String, nullable for display)
  - Purpose: Provides origin point for distance/cost calculations
  - Fallback: If coordinates not set, use `businessAddress` field to geocode warehouse location (one-time operation)

### File Organization *(mandatory)*

Address selection component follows SOLID architecture:

```
src/app/(dashboard)/admin/quotes/
├── _components/
│   ├── quote-form.tsx                    # Main form orchestration
│   └── delivery-address-picker.tsx       # Delivery address UI (target <150 lines)
├── _hooks/
│   ├── use-address-autocomplete.ts       # Geocoding API integration with debounce
│   ├── use-address-mutations.ts          # Create/update ProjectAddress mutations
│   └── use-transportation-cost.ts        # Distance calculation + cost formula
├── _schemas/
│   └── project-address.schema.ts         # Zod validation for address fields
├── _utils/
│   ├── address-formatter.ts              # formatAddress(), parseCoordinates()
│   ├── distance-calculator.ts            # haversineDistance(), validateCoords()
│   └── address-defaults.ts               # getEmptyAddress(), default values
└── _types/
    └── address.types.ts                  # ProjectAddress DTO types
```

**SOLID Requirements**:
- **Single Responsibility**: Autocomplete logic separated from mutation logic from formatting logic
- **No magic numbers**: Extract min/max coordinate values, default map zoom levels, transportation rates to constants
- **No inline schemas**: Address validation rules in dedicated `project-address.schema.ts`
- **No API calls in UI**: All geocoding requests in `use-address-autocomplete.ts` hook
- **No hardcoded formatting**: Address display logic in `address-formatter.ts` utility

**Additional Architecture Notes**:
- Geocoding provider (Nominatim/Mapbox) configurable via environment variable (`GEOCODING_PROVIDER`)
- Distance calculation uses pure function `haversineDistance(point1, point2)` for testability
- Map component lazy-loaded to reduce bundle size (optional P3 feature)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Sellers can specify delivery address in under 30 seconds using autocomplete (measured from quote form open to address selection)
- **SC-002**: System accurately calculates distance within 5% margin of error compared to actual road distance for 90% of Colombian city pairs (Haversine approximation acceptable for MVP)
- **SC-003**: 100% of quotes with geocoded addresses display formatted delivery location in quote PDF/summary views
- **SC-004**: Transportation cost calculation completes in under 500ms for any distance computation (ensures real-time quote updates)
- **SC-005**: System supports addresses in at least 3 LATAM countries (Colombia, Panama, Mexico) without code changes (validated by `country` field supporting ISO codes)
- **SC-006**: Zero data loss during migration of existing `Quote.projectCity/projectStreet` fields to new `ProjectAddress` model (100% of existing addresses preserved)
- **SC-007**: Manual address entry supports 100% of rural addresses without requiring coordinates (validated by nullable lat/lon fields)
- **SC-008**: Sellers report 40% reduction in quote revision requests related to incorrect delivery locations (measured 30 days post-launch vs. baseline)

### Business Value

- **Accurate Pricing**: Eliminates underquoting on long-distance deliveries by calculating exact transportation costs
- **Operational Efficiency**: Reduces delivery errors and failed deliveries due to imprecise addresses
- **Market Expansion**: Enables quoting for rural and remote construction sites previously difficult to price accurately
- **Customer Trust**: Professional geocoded addresses in quotes increase client confidence in delivery capabilities

## Assumptions *(mandatory)*

1. **Geocoding Service Availability**: Assumes Nominatim (OpenStreetMap) or Mapbox API is accessible and has sufficient coverage for Colombian cities/regions. Fallback to manual entry if service unavailable.

2. **Warehouse Location**: Assumes single warehouse location per tenant (stored in `TenantConfig`). Multi-warehouse support is out of scope for MVP.

3. **Transportation Rate**: Assumes fixed cost-per-kilometer rate stored in `TenantConfig` or quote-level adjustment. Dynamic pricing based on fuel costs or route complexity is future enhancement.

4. **Straight-Line Distance**: Assumes Haversine (great-circle) distance is acceptable approximation for MVP. Actual road distance calculation via routing API (Google/OSRM) deferred to v1.2.

5. **Address Format**: Assumes LATAM address formats follow pattern: Street, City, Region, Country. System flexible enough to handle variations via optional fields.

6. **Postal Code**: Assumes postal codes are optional for LATAM addresses (many rural areas lack formal postal codes).

7. **Coordinate System**: Assumes WGS84 (GPS standard) coordinate system with decimal degrees format. No support for alternative coordinate systems in MVP.

8. **Language**: Assumes geocoding API returns results in Spanish or English based on `TenantConfig.locale` setting. Hardcoded to Spanish (es-CO) for Colombian deployment.

9. **Data Migration**: Assumes existing quotes with `projectCity/projectStreet` can be batch-migrated to `ProjectAddress` model without manual intervention (automated script).

10. **User Permissions**: Assumes only `admin` and `seller` roles can create/edit delivery addresses. Standard RBAC patterns apply.

## Dependencies *(mandatory)*

### External Services

- **Geocoding API**: Nominatim (OpenStreetMap - free, self-hostable) OR Mapbox Geocoding API (commercial, better autocomplete)
  - Impact: Required for autocomplete and coordinate resolution
  - Fallback: Manual entry mode if API unavailable

### Infrastructure

- **Database**: PostgreSQL with PostGIS extension (optional for future geospatial queries like "find quotes within 50km radius")
  - Impact: Stores `ProjectAddress` with Decimal columns for lat/lon
  - Alternative: Standard Decimal columns sufficient for MVP without PostGIS

### Internal Dependencies

- **TenantConfig**: Warehouse location (coordinates or address) must be configured before transportation cost calculation works
- **Quote Model**: Existing quote flow must integrate new address picker component
- **tRPC Router**: New procedures for address CRUD and geocoding proxy
- **Prisma Schema**: Migration to add `ProjectAddress` model and `Quote.projectAddressId` foreign key

### Third-Party Libraries

- **haversine-distance** (npm): Pure function for distance calculation, zero dependencies
- **react-map-gl** (optional for P3): Mapbox GL JS wrapper for React map visualization
- **@mapbox/mapbox-gl-geocoder** (optional): Pre-built autocomplete widget for Mapbox

## Out of Scope *(mandatory)*

1. **Multi-Warehouse Support**: Single warehouse location per tenant only. Selecting nearest warehouse for delivery is v1.1 feature.

2. **Route Optimization**: Actual road distance calculation using routing APIs (Google Maps Directions, OSRM) deferred to v1.2. MVP uses straight-line distance.

3. **Address Validation**: No validation against official postal databases (e.g., Colombia's DANE). System accepts any address text seller enters.

4. **Delivery Time Estimation**: No ETA calculation based on distance/traffic. Out of scope for MVP.

5. **Historical Address Changes**: No versioning or audit trail for address modifications. Current address overwrites previous.

6. **Address Book/Favorites**: No saved address list for quick reuse across quotes. Each quote creates new address instance.

7. **Automatic Address Correction**: No "Did you mean X?" suggestions if seller types similar-sounding city name. Autocomplete shows matches as-is.

8. **Geofencing/Service Areas**: No validation that delivery address falls within serviceable region. All addresses accepted regardless of distance.

9. **International Shipping Costs**: Transportation cost calculation assumes domestic deliveries only. Cross-border logistics out of scope.

10. **Mobile Map Interaction**: Map component (P3) targets desktop users only. Mobile-optimized map interactions deferred to future release.

## Migration Strategy *(mandatory)*

### Phase 1: Schema Migration (Zero Downtime)

1. **Add `ProjectAddress` table**: New model with all fields nullable initially
2. **Add `Quote.projectAddressId` column**: Nullable foreign key, no constraints yet
3. **Keep existing fields**: `Quote.projectCity`, `projectStreet`, etc. remain unchanged (deprecated but functional)

### Phase 2: Data Migration (Background Job)

1. **Migrate existing quotes**: For each `Quote` with non-null `projectCity` or `projectStreet`:
   - Create `ProjectAddress` record with data from old fields
   - Map `projectStreet` → `street`, `projectCity` → `city`, `projectState` → `region`, `projectPostalCode` → `postalCode`
   - Set `projectAddressId` foreign key
   - Leave lat/lon null (geocoding optional post-migration)

2. **Validation**: Count records before/after, verify 100% migration success

### Phase 3: Application Rollout

1. **Deploy new address picker UI**: Feature flag controlled, initially disabled
2. **Enable for admin users**: Test with internal quotes first
3. **Enable for all sellers**: Gradual rollout over 1 week
4. **Monitor**: Track geocoding API usage, distance calculation errors

### Phase 4: Cleanup (Future Release)

1. **Deprecation warnings**: Log warnings when old `projectCity/projectStreet` fields accessed
2. **Remove deprecated fields**: After 6 months, drop columns from `Quote` model (v2.0)

### Rollback Plan

- If critical issues found, disable address picker via feature flag
- System falls back to existing `projectCity/projectStreet` text fields
- No data loss: `ProjectAddress` records preserved, can retry migration
