# Quickstart: Geocoded Delivery Addresses

**Feature**: 001-delivery-address  
**Date**: 2025-11-01  
**Audience**: Developers implementing the feature

---

## Overview

This feature adds structured geographic delivery address support to quotes, enabling:
- Address autocomplete with geocoding (Nominatim API)
- Manual address entry for rural areas
- Automatic transportation cost calculation based on distance
- Optional map visualization (P3)

**Key Components**:
- `ProjectAddress` model (database)
- `DeliveryAddressPicker` component (UI)
- `address` tRPC router (API)
- `geocoding` + `transportation` tRPC routers (services)

---

## Prerequisites

1. **Database Migration**: Run Prisma migration to add `ProjectAddress` model
2. **Environment Variables**: Configure geocoding API (optional, defaults to Nominatim public endpoint)
3. **TenantConfig**: Set warehouse location and transportation rates (admin task)

### Environment Setup

```bash
# .env (optional - uses public Nominatim by default)
GEOCODING_PROVIDER=nominatim
GEOCODING_API_URL=https://nominatim.openstreetmap.org
```

### Database Migration

```bash
# Generate migration
pnpm prisma migrate dev --name add_project_address

# Run data migration script (migrate existing Quote.projectCity/projectStreet)
pnpm ts-node prisma/migrations-scripts/migrate-project-addresses.ts
```

### TenantConfig Setup (Admin)

Access admin panel → Tenant Settings → Warehouse Configuration:

```typescript
// Seed data example (prisma/seed-tenant.ts)
await prisma.tenantConfig.update({
  where: { id: '1' },
  data: {
    warehouseLatitude: 3.9009,      // Buga, Colombia
    warehouseLongitude: -76.2978,
    warehouseCity: 'Buga',
    transportBaseRate: 50000,       // 50,000 COP fixed cost
    transportPerKmRate: 1000,       // 1,000 COP per km
  },
});
```

---

## Usage Guide

### 1. Using the Address Picker Component

#### Basic Integration (Quote Form)

```typescript
// src/app/(dashboard)/admin/quotes/_components/quote-form.tsx
import { DeliveryAddressPicker } from './delivery-address-picker';

export function QuoteForm() {
  const form = useForm<QuoteFormData>({
    defaultValues: {
      deliveryAddress: null,
    },
  });
  
  return (
    <Form {...form}>
      {/* ...other fields... */}
      
      <FormField
        control={form.control}
        name="deliveryAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dirección de Entrega</FormLabel>
            <FormControl>
              <DeliveryAddressPicker
                value={field.value}
                onChange={field.onChange}
                quoteId={quoteId}  // Optional: auto-associate with quote
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  );
}
```

#### Address Picker Props

```typescript
interface DeliveryAddressPickerProps {
  value: ProjectAddress | null;
  onChange: (address: ProjectAddress | null) => void;
  quoteId?: string;               // Optional: Associate with quote
  showMap?: boolean;              // Default: false (P3 feature)
  mode?: 'autocomplete' | 'manual' | 'both';  // Default: 'both'
  disabled?: boolean;
}
```

---

### 2. Using tRPC API Directly

#### Create Address with Geocoding

```typescript
// Client-side component
import { api } from '@/trpc/react';

export function AddressForm() {
  const createAddress = api.address.create.useMutation({
    onSuccess: (data) => {
      console.log('Address created:', data.id);
    },
  });
  
  const handleGeocodedAddress = (geocodingResult) => {
    createAddress.mutate({
      city: geocodingResult.address.city,
      region: geocodingResult.address.state,
      country: geocodingResult.address.country,
      latitude: geocodingResult.latitude,
      longitude: geocodingResult.longitude,
    });
  };
}
```

#### Fetch Quote with Delivery Address

```typescript
// Server Component
import { api } from '@/trpc/server';

export default async function QuotePage({ params }) {
  const quote = await api.quote.getById.query({ 
    id: params.id,
    include: { projectAddress: true },  // Populate delivery address
  });
  
  return (
    <div>
      <h1>Quote #{quote.id}</h1>
      
      {quote.projectAddress && (
        <div>
          <h2>Delivery Location</h2>
          <p>{formatAddress(quote.projectAddress)}</p>
        </div>
      )}
    </div>
  );
}
```

---

### 3. Geocoding Autocomplete

#### Client-Side Hook

```typescript
// src/app/(dashboard)/admin/quotes/_hooks/use-address-autocomplete.ts
import { api } from '@/trpc/react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

export function useAddressAutocomplete() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);  // 300ms debounce
  
  const { data, isLoading } = api.geocoding.search.useQuery(
    { query: debouncedQuery, limit: 5 },
    { enabled: debouncedQuery.length > 2 }  // Only search if >2 chars
  );
  
  return {
    query,
    setQuery,
    results: data?.results ?? [],
    isLoading,
  };
}
```

#### Usage in Component

```typescript
export function AddressAutocomplete({ onSelect }) {
  const { query, setQuery, results, isLoading } = useAddressAutocomplete();
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar dirección..."
        />
      </PopoverTrigger>
      
      <PopoverContent>
        <Command>
          <CommandList>
            {isLoading && <CommandLoading>Buscando...</CommandLoading>}
            
            {results.map((result) => (
              <CommandItem
                key={result.placeId}
                onSelect={() => onSelect(result)}
              >
                {result.displayName}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

---

### 4. Transportation Cost Calculation

#### Automatic Calculation on Address Selection

```typescript
// src/app/(dashboard)/admin/quotes/_hooks/use-transportation-cost.ts
import { api } from '@/trpc/react';

export function useTransportationCost(deliveryAddress: ProjectAddress | null) {
  const { data: cost, isLoading } = api.transportation.calculateCost.useQuery(
    {
      deliveryLatitude: deliveryAddress?.latitude ?? 0,
      deliveryLongitude: deliveryAddress?.longitude ?? 0,
    },
    {
      enabled: !!deliveryAddress?.latitude && !!deliveryAddress?.longitude,
      staleTime: 5 * 60 * 1000,  // Cache 5 minutes
    }
  );
  
  return { cost, isLoading };
}
```

#### Display Cost in Quote Summary

```typescript
export function QuoteSummary({ quote }) {
  const { cost } = useTransportationCost(quote.projectAddress);
  
  return (
    <div>
      <h2>Resumen de Cotización</h2>
      
      {/* ...other line items... */}
      
      {cost && (
        <div className="flex justify-between">
          <span>Transporte a {cost.warehouse.city} → {quote.projectAddress.city}</span>
          <span>{cost.cost.displayText}</span>
        </div>
      )}
      
      <div className="flex justify-between font-bold">
        <span>Total</span>
        <span>{formatCurrency(quote.total + (cost?.cost.totalCost ?? 0))}</span>
      </div>
    </div>
  );
}
```

---

### 5. Manual Address Entry (Fallback)

#### Toggle Manual Mode

```typescript
export function DeliveryAddressPicker({ value, onChange }) {
  const [mode, setMode] = useState<'autocomplete' | 'manual'>('autocomplete');
  
  return (
    <div>
      <Tabs value={mode} onValueChange={setMode}>
        <TabsList>
          <TabsTrigger value="autocomplete">Buscar dirección</TabsTrigger>
          <TabsTrigger value="manual">Ingresar manualmente</TabsTrigger>
        </TabsList>
        
        <TabsContent value="autocomplete">
          <AddressAutocomplete onSelect={(result) => {
            onChange({
              city: result.address.city,
              region: result.address.state,
              latitude: result.latitude,
              longitude: result.longitude,
            });
          }} />
        </TabsContent>
        
        <TabsContent value="manual">
          <ManualAddressForm value={value} onChange={onChange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

#### Manual Form Component

```typescript
export function ManualAddressForm({ value, onChange }) {
  return (
    <div className="space-y-4">
      <Input
        value={value?.city ?? ''}
        onChange={(e) => onChange({ ...value, city: e.target.value })}
        placeholder="Ciudad *"
      />
      
      <Input
        value={value?.street ?? ''}
        onChange={(e) => onChange({ ...value, street: e.target.value })}
        placeholder="Dirección (opcional)"
      />
      
      <Textarea
        value={value?.reference ?? ''}
        onChange={(e) => onChange({ ...value, reference: e.target.value })}
        placeholder="Referencia o punto de entrega (ej: 'Frente a la iglesia')"
      />
    </div>
  );
}
```

---

## Utility Functions

### Address Formatter

```typescript
// src/app/(dashboard)/admin/quotes/_utils/address-formatter.ts
export function formatAddress(address: ProjectAddress | null): string {
  if (!address) return 'Sin dirección';
  
  const parts = [
    address.street,
    address.district,
    address.city,
    address.region,
    address.country,
  ].filter(Boolean);
  
  return parts.join(', ');
}

// Example output: "Calle 45 #23-10, Barrio Granada, Medellín, Antioquia, Colombia"
```

### Distance Calculator

```typescript
// src/lib/utils/coordinates.ts
export function haversineDistance(
  point1: { lat: number; lon: number },
  point2: { lat: number; lon: number }
): number {
  const R = 6371e3;  // Earth's radius in meters
  const φ1 = (point1.lat * Math.PI) / 180;
  const φ2 = (point2.lat * Math.PI) / 180;
  const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
  const Δλ = ((point2.lon - point1.lon) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;  // Distance in meters
}

// Usage:
const distanceMeters = haversineDistance(
  { lat: 3.9009, lon: -76.2978 },   // Buga
  { lat: 6.2476, lon: -75.5658 }    // Medellín
);
console.log(`${distanceMeters / 1000} km`);  // ~238.7 km
```

---

## Testing

### Unit Tests

```bash
# Run unit tests for utilities
pnpm vitest run tests/unit/distance-calculator.test.ts
pnpm vitest run tests/unit/address-formatter.test.ts
pnpm vitest run tests/unit/project-address-schema.test.ts
```

### Integration Tests

```bash
# Run tRPC endpoint tests
pnpm vitest run tests/integration/address-crud.test.ts
pnpm vitest run tests/integration/transportation.test.ts
```

### E2E Tests

```bash
# Run Playwright tests for full address flow
pnpm playwright test e2e/delivery-address-flow.spec.ts
```

---

## Troubleshooting

### Geocoding API Not Responding

**Symptom**: Autocomplete shows "Buscando..." indefinitely

**Solution**:
1. Check network tab for failed requests to `nominatim.openstreetmap.org`
2. Verify rate limiting: max 1 request/second (debounce should handle this)
3. Fallback to manual entry mode if API is down

```typescript
// Error handling in hook
const { data, error } = api.geocoding.search.useQuery(
  { query: debouncedQuery },
  {
    retry: 2,
    onError: (err) => {
      toast.error('No se pudo buscar la dirección. Intenta ingresar manualmente.');
    },
  }
);
```

---

### Warehouse Location Not Configured

**Symptom**: Transportation cost calculation fails with "Warehouse location not configured"

**Solution**:
1. Access admin panel → Tenant Settings
2. Set warehouse coordinates and city:
   - Latitude: e.g., `3.9009`
   - Longitude: e.g., `-76.2978`
   - City: e.g., `Buga`
3. Set transportation rates:
   - Base rate: e.g., `50000` (COP)
   - Per km rate: e.g., `1000` (COP)

```typescript
// Admin form to configure warehouse
const updateTenantConfig = api.tenant.update.useMutation();

updateTenantConfig.mutate({
  warehouseLatitude: 3.9009,
  warehouseLongitude: -76.2978,
  warehouseCity: 'Buga',
  transportBaseRate: 50000,
  transportPerKmRate: 1000,
});
```

---

### Invalid Coordinate Pairs

**Symptom**: Validation error "Latitud y longitud deben estar ambos presentes o ambos ausentes"

**Cause**: Manual entry set latitude without longitude (or vice versa)

**Solution**: Ensure both coordinates are provided together:

```typescript
// ❌ WRONG - partial coordinates
onChange({ city: 'Medellín', latitude: 6.2476 });

// ✅ CORRECT - both or neither
onChange({ city: 'Medellín', latitude: 6.2476, longitude: -75.5658 });
// OR
onChange({ city: 'Medellín' });  // No coordinates (manual entry)
```

---

## Next Steps

1. **Implement Address Picker UI**: Start with `DeliveryAddressPicker` component
2. **Add tRPC Routers**: Create `address`, `geocoding`, `transportation` routers
3. **Integrate with Quote Form**: Add address picker to quote creation flow
4. **Test Transportation Cost**: Verify distance calculation with known coordinates
5. **Add E2E Tests**: Cover autocomplete → selection → cost calculation flow

For detailed implementation plans, see:
- [Data Model](./data-model.md)
- [API Contracts](./contracts/)
- [Research Decisions](./research.md)
