# Catalog Module

Clean, maintainable catalog implementation following SOLID principles and React best practices.

## Quick Start

```bash
# View the catalog
http://localhost:3000/catalog

# Search for models
http://localhost:3000/catalog?q=ventana

# Navigate pages
http://localhost:3000/catalog?page=2
```

## Architecture

### Directory Structure

```
catalog/
├── _components/       # UI components
│   ├── model-card-atoms.tsx      # ⚛️ Atomic components
│   ├── model-card.tsx            # 🔷 Organism component
│   ├── catalog-search.tsx        # 🔍 Search UI
│   ├── catalog-pagination.tsx    # 📄 Pagination UI
│   ├── catalog-grid.tsx          # 📊 Grid layout
│   └── catalog-content.tsx       # 🎯 Server orchestrator
├── _hooks/           # Custom hooks
│   └── use-catalog.ts            # 🎣 Business logic
├── _lib/             # Utilities
│   └── catalog.utils.ts          # 🛠️ Pure functions
└── page.tsx          # Main page
```

### Component Hierarchy

```
Page (Server)
└── CatalogContent (Server)
    ├── CatalogGrid (Server)
    │   └── ModelCard (Client)
    │       ├── ProductImagePlaceholder (Presentational)
    │       ├── ProductInfo (Presentational)
    │       ├── ProductDimensions (Presentational)
    │       └── ProductPrice (Presentational)
    ├── CatalogSearch (Client)
    └── CatalogPagination (Client)
```

## Design Principles

### 🎯 Single Responsibility

Each file has ONE clear purpose:

- **Components**: Render UI only
- **Hooks**: Manage state and side effects
- **Utils**: Pure functions, no side effects

### 🔓 Open/Closed

Components are open for extension (via props) but closed for modification:

```typescript
// ✅ Extend with new props
<CatalogSearch initialValue="test" debounceMs={500} />

// ❌ Don't modify internal implementation
```

### 🔄 Dependency Inversion

Components depend on abstractions (hooks), not implementations:

```typescript
// Component doesn't know HOW search works
const { query, handleSearchChange } = useDebouncedSearch();
```

## Component Types

### Server Components
- Render on server
- No interactivity
- Better SEO
- Smaller bundle

**Examples**: `CatalogContent`, `CatalogGrid`

### Client Components
- Interactive UI
- State management
- Event handlers

**Examples**: `CatalogSearch`, `CatalogPagination`

### Presentational Components
- Pure props in/out
- No state
- Easy to test
- Highly reusable

**Examples**: `ProductPrice`, `DimensionDisplay`

## Hooks

### `useQueryParams()`
```typescript
const { getParam, updateQueryParams } = useQueryParams();

// Read from URL
const search = getParam('q');

// Update URL
updateQueryParams({ q: 'ventana', page: null });
```

### `useDebouncedSearch()`
```typescript
const { query, isPending, handleSearchChange, handleClear } = useDebouncedSearch();

// Use in component
<input value={query} onChange={e => handleSearchChange(e.target.value)} />
```

### `usePagination()`
```typescript
const { createPageUrl, getVisiblePages, hasPrevious, hasNext } = usePagination(1, 10);

// Generate URL for page
const url = createPageUrl(2); // "?page=2"
```

## Utilities

### `formatRange()`
```typescript
formatRange(500, 2000); // "500 - 2000 mm"
```

### `calculateTotalPages()`
```typescript
calculateTotalPages(100, 20); // 5
```

### `shouldShowEllipsis()`
```typescript
shouldShowEllipsis(5, 3); // false (consecutive)
shouldShowEllipsis(5, 1); // true (gap)
```

## Testing

### Presentational Components
```typescript
// Snapshot testing
it('renders product price', () => {
  const { container } = render(<ProductPrice price="$100" />);
  expect(container).toMatchSnapshot();
});
```

### Hooks
```typescript
// Hook testing
it('debounces search input', async () => {
  const { result } = renderHook(() => useDebouncedSearch());
  
  act(() => result.current.handleSearchChange('test'));
  
  expect(result.current.query).toBe('test');
});
```

### Utilities
```typescript
// Pure function testing
it('calculates total pages correctly', () => {
  expect(calculateTotalPages(100, 20)).toBe(5);
  expect(calculateTotalPages(101, 20)).toBe(6);
});
```

## Performance

### Server-Side Rendering
- HTML pre-rendered on server
- Faster initial page load
- Better SEO

### Incremental Static Regeneration
```typescript
// page.tsx
export const revalidate = 3600; // Revalidate every hour
```

### Minimal Client JavaScript
- Only interactive components are client-side
- Smaller bundle size
- Faster hydration

## Best Practices

### ✅ DO

- Extract logic to hooks
- Use pure functions in utils
- Keep components presentational
- Test in isolation
- Document complex logic

### ❌ DON'T

- Put business logic in components
- Mix server and client code
- Create god components
- Skip prop validation
- Forget accessibility

## Common Patterns

### Adding a New Filter

1. **Add hook** in `use-catalog.ts`:
```typescript
export function useManufacturerFilter() {
  const { getParam, updateQueryParams } = useQueryParams();
  const manufacturer = getParam('manufacturer');
  
  const setManufacturer = (value: string) => {
    updateQueryParams({ manufacturer: value, page: null });
  };
  
  return { manufacturer, setManufacturer };
}
```

2. **Create component** in `_components/`:
```typescript
'use client';

export function ManufacturerFilter() {
  const { manufacturer, setManufacturer } = useManufacturerFilter();
  
  return (
    <select value={manufacturer} onChange={e => setManufacturer(e.target.value)}>
      {/* options */}
    </select>
  );
}
```

3. **Use in page**:
```typescript
<CatalogContent manufacturerId={manufacturer} />
```

### Adding a New Utility

```typescript
// _lib/catalog.utils.ts
export function formatDimension(value: number, unit: string): string {
  return `${value} ${unit}`;
}

// Use in component
const formattedWidth = formatDimension(model.width, 'mm');
```

## Troubleshooting

### Component Not Updating

**Problem**: URL changes but component doesn't update

**Solution**: Make sure you're using `useSearchParams()` in client components or passing params as props in server components

### Hydration Mismatch

**Problem**: Server and client render differently

**Solution**: Avoid using `window` or `document` in components. Use `useEffect` for client-only logic.

### Hook Errors

**Problem**: "Hooks can only be used in client components"

**Solution**: Add `'use client'` directive at top of file

## Related Documentation

- [Architecture Guide](../../docs/CATALOG_ARCHITECTURE.md)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/)
- [Next.js Routing](https://nextjs.org/docs/app/building-your-application/routing)
