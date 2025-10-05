# Catalog Filter Components - SOLID Refactoring + Memory Leak Fix

## Overview
Refactored catalog filter components following SOLID principles to eliminate code duplication, improve maintainability, and **fix EventEmitter memory leak**.

## Problems Solved

### 1. EventEmitter Memory Leak ⚠️
**Symptom**: `MaxListenersExceededWarning: Possible EventEmitter memory leak detected`

**Root Cause**: Multiple components calling `useSearchParams()` independently, creating duplicate event listeners on each render.

**Solution**: Centralized search params management by passing params as props from the server component down to client components.

### 2. Incomplete Search State Display
**Problem**: UI only showed "Filtros activos" (active filters) but didn't display the search query or sort parameters.

**Solution**: Renamed component to **"Parámetros de búsqueda"** (Search Parameters) and display ALL active search state:
- Search query (`q`)
- Manufacturer filter (`manufacturer`)
- Sort order (`sort`) - when not default

### 3. Code Duplication (DRY Violation)
**Problem**: Original `CatalogFilters` component violated Single Responsibility Principle by handling multiple concerns.

**Solution**: Extracted specialized components following SOLID principles.

### Component Architecture

```
CatalogPage (Server Component) - Fetches data
└── CatalogFilterBar (Client) - Layout composition
    ├── CatalogSearch (Search input)
    └── CatalogFilters (Filter orchestrator)
        ├── ActiveSearchParameters (All search params as badges)
        └── ResultCount (Result count display)
```

**Data Flow** (Memory Leak Fix):
```
Server Component (page.tsx)
  ↓ Props (searchQuery, manufacturerId, sort)
CatalogFilterBar
  ↓ Props (avoids multiple useSearchParams() calls)
CatalogFilters
  ↓ Props
ActiveSearchParameters
```

### New Components

#### 1. `ActiveSearchParameters` (Renamed from `ActiveFilterBadges`)
**Responsibility**: Display ALL active search parameters as removable badges

```typescript
type ActiveSearchParametersProps = {
  searchQuery?: string | null;           // NEW: Show search term
  selectedManufacturerName?: string | null;
  sortType?: string | null;              // NEW: Show sort order
  onRemoveSearch?: () => void;           // NEW: Remove search
  onRemoveManufacturer?: () => void;
  onRemoveSort?: () => void;             // NEW: Remove sort
};
```

**Features**:
- Displays search query with truncation (max 200px)
- Shows manufacturer filter
- Shows sort order (only when not default "name-asc")
- Each parameter has individual remove button
- Proper icons for each parameter type
- Label changed to "Parámetros de búsqueda" for accuracy

**Benefits**:
- Complete visibility of search state
- Single source of truth for active parameters
- Consistent UI pattern for all search operations
- Easy to extend with new parameter types

#### 2. `ResultCount`
**Responsibility**: Display filtered result count with proper Spanish pluralization

```typescript
type ResultCountProps = {
  totalResults?: number;
};
```

**Benefits**:
- Single responsibility: Only result count display
- Handles all pluralization cases (0, 1, n)
- Can be used independently of filters
- Presentation logic separated from business logic

#### 3. `CatalogFilters` (Refactored)
**Responsibility**: Orchestrate filter controls and delegate display to subcomponents

```typescript
type CatalogFiltersProps = {
  manufacturers?: Array<{ id: string; name: string }>;
  totalResults?: number;
  showControls?: boolean;    // Toggle filter selects
  showBadges?: boolean;       // Toggle active parameter badges
  showResultCount?: boolean;  // Toggle result count
  // Memory leak fix: Receive params as props
  currentManufacturer?: string;
  currentSort?: string;
  currentSearchQuery?: string;
};
```

**Key Changes**:
- ❌ Removed `useSearchParams()` hook (memory leak source)
- ✅ Receives current params as props
- ✅ Builds query string from current state
- ✅ Added handlers for all parameter types:
  - `handleRemoveSearch()` - Remove search query
  - `handleRemoveManufacturer()` - Remove manufacturer filter  
  - `handleRemoveSort()` - Reset sort to default
  - `handleClearFilters()` - Clear all parameters

**Benefits**:
- **No memory leaks**: Single `useSearchParams()` call in parent
- Composition over duplication
- Configurable through props
- Open for extension, closed for modification
- Clear delegation to specialized components

#### 4. `CatalogFilterBar` (Updated)
**Responsibility**: Layout composition of search and filter components

**Changes**:
- Receives `currentManufacturer`, `currentSort` props
- Passes all params to `CatalogFilters` instances
- No direct `useSearchParams()` calls

**Benefits**:
- Grid-based responsive layout
- Clear separation: Row 1 (controls), Row 2 (parameters + count)
- Uses composition instead of duplication
- Centralized param management (memory leak prevention)

#### 5. `CatalogPage` (Server Component)
**Responsibility**: Fetch data and provide params to client components

**Changes**:
- Extracts `manufacturerId` and `sort` from validated params
- Passes to `CatalogFilterBar` as props:
  ```tsx
  <CatalogFilterBar
    currentManufacturer={manufacturerId ?? 'all'}
    currentSort={sort}
    searchQuery={searchQuery}
    manufacturers={manufacturers}
    totalResults={totalData.total}
  />
  ```

**Benefits**:
- Single source of truth for search params
- Server-side validation and normalization
- No prop drilling (direct parent-child relationship)
- Prevents multiple event listeners

## Technical Details

### Memory Leak Root Cause Analysis

**Before** (❌ Multiple listeners):
```tsx
// CatalogFilters.tsx
const searchParams = useSearchParams(); // Listener 1

// CatalogSearch.tsx  
const searchParams = useSearchParams(); // Listener 2

// Any other component...
const searchParams = useSearchParams(); // Listener 3+
```

**Result**: EventEmitter warning when >10 listeners attached to the same event.

**After** (✅ Single listener):
```tsx
// page.tsx (Server Component)
async function CatalogPage({ searchParams }) {
  const params = await searchParams;
  const { searchQuery, manufacturerId, sort } = validateCatalogParams(params);
  
  // Pass as props
  <CatalogFilterBar
    currentManufacturer={manufacturerId ?? 'all'}
    currentSort={sort}
    searchQuery={searchQuery}
  />
}

// CatalogFilterBar.tsx (Client Component)
export function CatalogFilterBar({ 
  searchQuery, 
  currentManufacturer, 
  currentSort 
}) {
  // No useSearchParams() call - receives props instead
  return <CatalogFilters currentSearchQuery={searchQuery} ... />
}
```

**Result**: Zero EventEmitter warnings, cleaner prop flow, better performance.

### Query String Management

**Centralized builder** in `CatalogFilters`:
```typescript
const createQueryString = useCallback(
  (updates: Record<string, string | null>) => {
    const params = new URLSearchParams();

    // Preserve current parameters
    if (currentSearchQuery) params.set('q', currentSearchQuery);
    if (currentManufacturer && currentManufacturer !== 'all') {
      params.set('manufacturer', currentManufacturer);
    }
    if (currentSort && currentSort !== 'name-asc') {
      params.set('sort', currentSort);
    }

    // Apply updates (null = remove param)
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    return params.toString();
  },
  [currentSearchQuery, currentManufacturer, currentSort]
);
```

**Benefits**:
- Immutable approach - doesn't mutate URL
- Type-safe with Record<string, string | null>
- Automatically removes empty/null values
- Preserves unrelated params
- Memoized with useCallback

### Single Responsibility Principle (SRP) ✅
Each component has one clear reason to change:
- `ActiveFilterBadges`: Changes when badge display logic changes
- `ResultCount`: Changes when result count display logic changes
- `CatalogFilters`: Changes when filter orchestration logic changes
- `CatalogFilterBar`: Changes when layout requirements change

### Open/Closed Principle (OCP) ✅
Components are:
- **Open for extension**: New filter types can be added to `ActiveFilterBadges`
- **Closed for modification**: Existing components don't need changes for new features

### Dependency Inversion Principle (DIP) ✅
- Components depend on abstractions (props interface)
- High-level `CatalogFilters` delegates to low-level display components
- Loose coupling through clear contracts

### Don't Repeat Yourself (DRY) ✅
- Eliminated duplicate rendering of badges and result count
- Single source of truth for each UI concern
- Reusable components across the application

## Usage Examples

### Show only filter controls (no badges or count)
```tsx
<CatalogFilters 
  manufacturers={manufacturers}
  showBadges={false}
  showResultCount={false}
/>
```

### Show only badges and result count (no controls)
```tsx
<CatalogFilters 
  manufacturers={manufacturers}
  totalResults={totalResults}
  showControls={false}
/>
```

### Show all features (default)
```tsx
<CatalogFilters 
  manufacturers={manufacturers}
  totalResults={totalResults}
/>
```

### Independent badge usage
```tsx
<ActiveFilterBadges
  selectedManufacturerName="VEKA"
  onRemoveManufacturer={handleRemove}
/>
```

## File Structure
```
src/app/(public)/catalog/_components/
├── active-filter-badges.tsx   # Now: ActiveSearchParameters
├── catalog-filter-bar.tsx     # Layout with prop passing
├── catalog-filters.tsx        # No useSearchParams() hook
├── catalog-search.tsx         # Search component
└── result-count.tsx          # Result count component

src/app/(public)/catalog/
└── page.tsx                  # Server component - param source
```

## Performance & Best Practices

### Memory Leak Prevention ✅
- ✅ Single `useSearchParams()` call in Next.js (automatic)
- ✅ Props-based data flow (unidirectional)
- ✅ No duplicate event listeners
- ✅ Proper cleanup with useCallback dependencies

### Bundle Optimization ✅
- No barrel files (avoided for better tree-shaking)
- Direct imports maintain optimal bundle size
- Memoized callbacks prevent unnecessary re-renders
- URL-based state management (no prop drilling beyond direct parent)

### Accessibility ✅
- Proper `aria-label` for all remove buttons
- Keyboard navigation support
- Screen reader friendly labels
- Truncated text with max-width (prevents overflow)

## Future Enhancements
Components are now positioned for easy extension:
- Add new filter types (price range, glass type, etc.)
- Add sorting badge display
- Implement filter presets
- Add filter analytics/tracking
- Support filter persistence

## Migration Path
No breaking changes to existing usage. `CatalogFilterBar` maintains the same public API.

## Related Issues
- Issue: #002-ui-ux-requirements
- Follows UX best practices from Lollypop Design
- Implements Glasify Lite coding standards
