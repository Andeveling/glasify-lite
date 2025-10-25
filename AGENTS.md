## Critical Pattern: SSR Cache Invalidation

### When You See SSR with `force-dynamic`

If a page uses:
```typescript
export const dynamic = 'force-dynamic';
```

And passes server data as props:
```typescript
<ComponentName initialData={serverData} />
```

**THEN mutations MUST use two-step invalidation**:

```typescript
const mutation = api.feature.action.useMutation({
  onSettled: () => {
    void utils.feature.query.invalidate();  // Step 1: Clear cache
    router.refresh();                        // Step 2: Re-fetch server data
  },
});
```

### Why Both Steps Are Required

1. **`invalidate()`**: Clears TanStack Query client cache
2. **`router.refresh()`**: Forces Next.js to re-run Server Component data fetching

Without `router.refresh()`, the UI won't update because:
- Server data isn't re-fetched
- Components still show old `initialData` from props
- Cache invalidation alone doesn't trigger server re-fetch

### Implementation Checklist

When implementing mutations in SSR pages:

- [ ] Import `useRouter` from `next/navigation`
- [ ] Call `invalidate()` for the affected query
- [ ] Call `router.refresh()` immediately after
- [ ] Place both calls in `onSettled` (not `onSuccess`)
- [ ] Apply to all mutations: create, update, delete

### Quick Reference

**File**: Any component with mutations in SSR routes  
**Import**: `import { useRouter } from 'next/navigation';`  
**Pattern**: `onSettled: () => { void utils.X.invalidate(); router.refresh(); }`  
**See**: `.github/copilot-instructions.md` section "SSR Cache Invalidation Pattern"

---

## Design Component Implementation Pattern (001-model-design-gallery)

### Architecture Overview

The design rendering system uses a **server-first, client-render boundary** pattern:

```
Server Layer (Validation & Adaptation)
├── validateDesignConfig(config) via Zod
├── designAdapterService.adaptDesign(config, dimensions)
└── Returns AdaptedDesign (all px values, resolved colors)

Client Layer (Rendering)
├── DesignRenderer.tsx (Konva Stage/Layer)
├── React.memo optimization
└── Intersection Observer lazy loading
```

### Critical Boundaries

⚠️ **Server-Side Operations** (ALLOWED):
- Zod schema validation in `src/lib/design/validation.ts`
- Design adaptation in `src/server/services/design-adapter-service.ts`
- tRPC procedures for design queries/mutations
- Design color resolution via `getMaterialColor()`

⚠️ **Client-Side Operations** (ALLOWED):
- Konva rendering in `'use client'` components only
- Canvas event handlers and interactivity
- React.memo memoization
- Intersection Observer for lazy loading

❌ **PROHIBITED** (Never Do This):
- Konva imports in Server Components
- Design validation in Client Components
- Design adaptation calculations in React hooks
- Winston logger in Client Components (server-side only)

### Implementation Checklist

When creating design-related components:

1. **Validation Layer**:
   - [ ] Use `validateDesignConfig(config)` for trusted data (throws)
   - [ ] Use `isValidDesignConfig(config)` for untrusted data (safe)
   - [ ] Validate in service layer before rendering

2. **Adaptation Layer**:
   - [ ] Call `designAdapterService.adaptDesign()` with exact dimensions
   - [ ] Expect AdaptedDesign with all values in px (no %)
   - [ ] Handle errors gracefully (show fallback)

3. **Rendering Layer**:
   - [ ] Create Client Component with `'use client'` directive
   - [ ] Import Konva and react-konva
   - [ ] Wrap with `React.memo` for optimization
   - [ ] Implement `Intersection Observer` for lazy loading
   - [ ] Use error boundaries to catch render failures

4. **Integration**:
   - [ ] Pass AdaptedDesign as props (not StoredDesignConfig)
   - [ ] Show DesignFallback on error or missing design
   - [ ] Test with multiple model dimensions

### File Reference Guide

| File                                             | Purpose          | Layer  | Can Use Winston? |
| ------------------------------------------------ | ---------------- | ------ | ---------------- |
| `src/lib/design/validation.ts`                   | Zod schemas      | Both   | No (utility)     |
| `src/lib/design/types.ts`                        | Type definitions | Both   | No (types only)  |
| `src/lib/design/material-colors.ts`              | Color mapping    | Both   | No (utility)     |
| `src/server/services/design-adapter-service.ts`  | Adaptation       | Server | Yes              |
| `src/app/_components/design/design-renderer.tsx` | Konva rendering  | Client | No (client-side) |
| `src/app/_components/design/design-fallback.tsx` | Placeholder      | Client | No (client-side) |
| tRPC router procedure                            | Design queries   | Server | Yes              |

### Quick Reference

**Import Konva** (Client Components Only):
```typescript
'use client';
import { Stage, Layer, Rect, Circle } from 'react-konva';
```

**Validate Design Config** (Server/Service Layer):
```typescript
import { validateDesignConfig } from '@lib/design/validation';
const validated = validateDesignConfig(config); // throws on error
```

**Adapt Design** (Server/Service Layer):
```typescript
import designAdapterService from '@server/services/design-adapter-service';
const adapted = designAdapterService.adaptDesign(config, width, height);
```

**Render with React.memo** (Client Component):
```typescript
'use client';
export const DesignRenderer = React.memo(({ design }: Props) => {
  return <Stage width={design.width} height={design.height}>...</Stage>;
});
```

See: `.github/copilot-instructions.md` section "Design Rendering Patterns"
**See**: `.github/copilot-instructions.md` section "SSR Cache Invalidation Pattern"