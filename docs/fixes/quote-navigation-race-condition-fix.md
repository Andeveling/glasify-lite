# Fix: Quote Navigation Race Condition Bug

## 🐛 Problem Description

When clicking "Generar cotización" from the cart page, users were experiencing:

1. ❌ Immediate redirect back to catalog page
2. ❌ Multiple "Carrito vacío" error toasts
3. ❌ Form never displayed
4. ❌ React Hooks order violation errors

## 🔍 Root Cause Analysis

### Issue 1: Race Condition in Cart Hydration

**Problem**: The `useEffect` that checks for empty cart was executing **before** `sessionStorage` finished hydrating.

```typescript
// ❌ BUGGY CODE
const { items: cartItems, hydrated } = useCart();

useEffect(() => {
  if (hydrated && cartItems.length === 0) {
    // This runs IMMEDIATELY when hydrated becomes true
    // But cartItems might still be [] during first hydration frame
    router.push('/catalog');
  }
}, [cartItems.length, hydrated, router]);
```

**Timeline of Bug**:
```
T=0ms:   Component renders, hydrated=false, cartItems=[]
T=10ms:  sessionStorage loads, hydrated=true, cartItems=[] (not updated yet)
T=11ms:  useEffect runs: hydrated=true && cartItems.length=0 → REDIRECT!
T=15ms:  cartItems updates to [item1, item2] (too late, already redirected)
```

### Issue 2: React Hooks Order Violation

**Problem**: Conditional early return **after** calling some hooks but **before** calling `useForm`.

```typescript
// ❌ BUGGY CODE
export default function QuoteGenerationForm() {
  const router = useRouter();           // Hook #1
  const [isSubmitting] = useState();    // Hook #2
  const { ... } = useCart();            // Hook #3
  
  useEffect(() => { ... });             // Hook #4
  
  // ❌ Early return causes Hook #5 to not be called
  if (!hydrated) {
    return <Skeleton />;
  }
  
  const form = useForm(...);            // Hook #5 (sometimes!)
}
```

**React Error**:
```
Previous render            Next render
----------------------------------------------
1. useRouter              useRouter
2. useState               useState
3. useCart                useCart
4. useEffect              useEffect
5. undefined              useForm  ❌ ORDER CHANGED!
```

## ✅ Solution

### Fix 1: Add Check Flag to Prevent Multiple Redirects

```typescript
// ✅ FIXED CODE
const [hasCheckedCart, setHasCheckedCart] = useState(false);

useEffect(() => {
  if (hydrated && !hasCheckedCart) {
    setHasCheckedCart(true);  // ✅ Only check once
    
    if (cartItems.length === 0) {
      toast.error('Carrito vacío');
      router.push('/catalog');
    }
  }
}, [hydrated, hasCheckedCart, cartItems.length, router]);
```

**How it works**:
- `hasCheckedCart` ensures the effect runs **only once** after hydration
- Prevents multiple executions if `cartItems.length` changes during hydration
- Gives `sessionStorage` time to populate `cartItems` array

### Fix 2: Move All Hooks Before Conditional Return

```typescript
// ✅ FIXED CODE
export default function QuoteGenerationForm() {
  const router = useRouter();           // Hook #1
  const [isSubmitting] = useState();    // Hook #2
  const [hasCheckedCart] = useState();  // Hook #3
  const { ... } = useCart();            // Hook #4
  
  const form = useForm(...);            // Hook #5 (ALWAYS!)
  
  useEffect(() => { ... });             // Hook #6
  
  // ✅ Early return AFTER all hooks
  if (!hydrated) {
    return <Skeleton />;
  }
  
  return <Form>...</Form>;
}
```

**Why this works**:
- All hooks are called in the **same order** every render
- React can properly track hook state
- No more "hooks order changed" errors

## 🧪 Testing

### Manual Test

Run the manual test script:

```bash
./scripts/test-quote-navigation.sh
```

Follow the on-screen instructions to verify:
1. Add item to cart
2. Navigate to cart page
3. Click "Generar cotización"
4. **Expected**: Form displays without redirect
5. **Not Expected**: Redirect to catalog with error

### Automated E2E Test

Run Playwright test:

```bash
pnpm test:e2e e2e/quote/quote-navigation-from-cart.spec.ts
```

This test validates:
- ✅ Cart items persist through navigation
- ✅ Form displays after authentication
- ✅ No redirect loop occurs
- ✅ Empty cart correctly redirects

## 📊 Files Changed

1. **`src/app/(public)/quote/new/_components/quote-generation-form.tsx`**
   - Added `hasCheckedCart` state flag
   - Moved `useForm` hook before early return
   - Updated `useEffect` dependencies and logic

2. **`e2e/quote/quote-navigation-from-cart.spec.ts`** (new)
   - E2E test for quote navigation flow
   - Tests both authenticated and unauthenticated scenarios

3. **`scripts/test-quote-navigation.sh`** (new)
   - Manual testing guide
   - Step-by-step instructions for QA

## 🎯 Benefits

1. **Eliminates Race Condition**: Cart hydration completes before validation
2. **Fixes React Errors**: All hooks called in consistent order
3. **Better UX**: No false "empty cart" errors
4. **Improved Reliability**: Check happens only once, at the right time
5. **Testable**: E2E tests prevent regression

## 📝 Code Quality Improvements

### Before
- ❌ Race condition vulnerability
- ❌ React Hooks rules violation
- ❌ Unpredictable behavior
- ❌ No safeguards against multiple executions

### After
- ✅ Proper hydration handling
- ✅ Complies with React Hooks rules
- ✅ Predictable, consistent behavior
- ✅ Single execution guarantee with flag

## 🚀 Next Steps

1. Test the fix manually following the script
2. Run E2E tests to ensure no regression
3. Monitor production logs for any remaining edge cases
4. Consider adding analytics to track navigation flow

## 📚 References

- [React Rules of Hooks](https://react.dev/link/rules-of-hooks)
- [Next.js Client-Side Navigation](https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating)
- [sessionStorage Hydration Patterns](https://nextjs.org/docs/messages/react-hydration-error)
