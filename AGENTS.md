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