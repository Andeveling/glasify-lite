# Catalog Architecture - SOLID & Best Practices

## Overview

The catalog module has been refactored following SOLID principles, Atomic Design, and React best practices. This document explains the architecture and design decisions.

## Directory Structure

```
src/app/(public)/catalog/
├── _components/           # React components
│   ├── model-card-atoms.tsx        # Atomic components
│   ├── model-card.tsx              # Composed model card
│   ├── catalog-search.tsx          # Search UI
│   ├── catalog-pagination.tsx      # Pagination UI
│   ├── catalog-grid.tsx            # Grid layout
│   ├── catalog-content.tsx         # Server component orchestrator
│   ├── catalog-empty.tsx           # Empty state
│   ├── catalog-error.tsx           # Error state
│   └── catalog-skeleton.tsx        # Loading state
├── _hooks/                # Custom React hooks
│   └── use-catalog.ts              # Catalog-related hooks
├── _lib/                  # Utilities and pure functions
│   └── catalog.utils.ts            # Helper functions
└── page.tsx               # Main page (Server Component)
```

## SOLID Principles Applied

### 1. Single Responsibility Principle (SRP)

Each component, hook, and utility has ONE clear responsibility:

#### Components
- **`ModelCard`**: Display model information
- **`CatalogSearch`**: Render search input UI
- **`CatalogPagination`**: Render pagination controls
- **`CatalogGrid`**: Layout models in a grid
- **`CatalogContent`**: Orchestrate data fetching and component composition

#### Hooks
- **`useQueryParams`**: Manage URL query parameters
- **`useDebouncedSearch`**: Handle debounced search logic
- **`usePagination`**: Generate pagination URLs

#### Utilities
- **`formatRange`**: Format dimension ranges
- **`calculateTotalPages`**: Calculate pagination
- **`shouldShowEllipsis`**: Determine ellipsis display
- **`transformModelForDisplay`**: Transform API data for UI

### 2. Open/Closed Principle (OCP)

Components are open for extension but closed for modification:

```typescript
// ✅ Good: Extend via props
<CatalogGrid models={models} />

// ✅ Good: Add new features without modifying existing code
<CatalogSearch 
  initialValue={query} 
  onSearchComplete={handleComplete} // New feature
/>
```

### 3. Liskov Substitution Principle (LSP)

All presentational components can be replaced with their props interface:

```typescript
// Any component implementing this interface can replace ModelCard
interface ModelCardProps {
  id: string;
  name: string;
  manufacturer?: string;
  range: { width: [number, number]; height: [number, number] };
  basePrice: string;
}
```

### 4. Interface Segregation Principle (ISP)

Components only depend on interfaces they actually use:

```typescript
// ❌ Bad: Large interface with unused props
interface BadModelCardProps {
  id: string;
  name: string;
  manufacturer?: string;
  range: { width: [number, number]; height: [number, number] };
  basePrice: string;
  onEdit?: () => void;      // Not used in public catalog
  onDelete?: () => void;    // Not used in public catalog
  isAdmin?: boolean;        // Not used in public catalog
}

// ✅ Good: Minimal interface
interface GoodModelCardProps {
  id: string;
  name: string;
  manufacturer?: string;
  range: { width: [number, number]; height: [number, number] };
  basePrice: string;
}
```

### 5. Dependency Inversion Principle (DIP)

Components depend on abstractions (hooks, utilities) not implementations:

```typescript
// ✅ Component depends on hook abstraction
export function CatalogSearch() {
  const { query, isPending, handleSearchChange } = useDebouncedSearch();
  // Component doesn't care HOW search works, just that it works
}

// ✅ Hook encapsulates implementation
export function useDebouncedSearch() {
  // Implementation details hidden from component
  const router = useRouter();
  const debouncedUpdate = useDebouncedCallback(...);
  // ...
}
```

## Atomic Design

Components are organized following Atomic Design methodology:

### Atoms (model-card-atoms.tsx)
- **`DimensionDisplay`**: Shows single dimension
- **`ProductImagePlaceholder`**: Image placeholder
- **`ProductInfo`**: Product name/manufacturer
- **`ProductPrice`**: Price display

### Molecules
- **`ProductDimensions`**: Composed of `DimensionDisplay` atoms

### Organisms
- **`ModelCard`**: Composed of atoms and molecules
- **`CatalogGrid`**: Collection of `ModelCard` organisms

### Templates
- **`CatalogContent`**: Page template composition

### Pages
- **`page.tsx`**: Actual page with data

## Component Types

### Server Components
```typescript
// ✅ Server Component - Fetches data, no interactivity
export async function CatalogContent() {
  const data = await api.catalog['list-models']();
  return <CatalogGrid models={data.items} />;
}
```

### Client Components
```typescript
// ✅ Client Component - Interactive UI only
'use client';
export function CatalogSearch() {
  const { query, handleSearchChange } = useDebouncedSearch();
  return <input value={query} onChange={handleSearchChange} />;
}
```

### Presentational Components
```typescript
// ✅ Pure presentational - No state, no side effects
export function ProductPrice({ price }: { price: string }) {
  return <p>{price}</p>;
}
```

## Testing Strategy

### Presentational Components
```typescript
// Easy to test - just props in/out
it('should render product price', () => {
  render(<ProductPrice price="$100" />);
  expect(screen.getByText('$100')).toBeInTheDocument();
});
```

### Hooks
```typescript
// Test hooks in isolation
it('should debounce search', () => {
  const { result } = renderHook(() => useDebouncedSearch());
  act(() => result.current.handleSearchChange('test'));
  // Assert debounced behavior
});
```

### Utilities
```typescript
// Test pure functions
it('should calculate total pages', () => {
  expect(calculateTotalPages(100, 20)).toBe(5);
  expect(calculateTotalPages(101, 20)).toBe(6);
});
```

## Benefits

### Maintainability
- ✅ Clear separation of concerns
- ✅ Easy to find and modify code
- ✅ Changes isolated to specific files

### Testability
- ✅ Pure functions easy to test
- ✅ Presentational components snapshot testable
- ✅ Hooks testable in isolation
- ✅ No complex mocking needed

### Reusability
- ✅ Hooks reusable across components
- ✅ Utilities reusable across features
- ✅ Atomic components composable

### Performance
- ✅ Server Components for static content
- ✅ Client Components only where needed
- ✅ Minimal JavaScript sent to browser

### Developer Experience
- ✅ Clear component hierarchy
- ✅ Self-documenting code
- ✅ Easy to onboard new developers

## Examples

### Before Refactoring
```typescript
// ❌ All logic in component
export function CatalogSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  
  const debouncedSearch = useDebouncedCallback((value) => {
    const params = new URLSearchParams();
    params.set('q', value);
    startTransition(() => {
      router.replace(`/catalog?${params}`);
    });
  }, 300);
  
  // ... 50 more lines of logic
}
```

### After Refactoring
```typescript
// ✅ Logic extracted to hook
export function CatalogSearch() {
  const { query, isPending, handleSearchChange } = useDebouncedSearch();
  
  return (
    <input 
      value={query} 
      onChange={e => handleSearchChange(e.target.value)} 
    />
  );
}

// Hook is reusable and testable
export function useDebouncedSearch() {
  // All logic here, tested separately
}
```

## Future Improvements

1. **Add prop types validation** with Zod
2. **Extract more utilities** for common operations
3. **Add component documentation** with Storybook
4. **Implement visual regression testing**
5. **Add performance monitoring**

## Related Documentation

- [React Best Practices](https://react.dev/learn/thinking-in-react)
- [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
