# CHANGELOG - Currency Formatting Consolidation

**Date**: 2025-01-19  
**Type**: Refactor  
**Impact**: Medium - Currency formatting standardization across the application

## Summary

Consolidated all currency formatting to use the new comprehensive `formatCurrency` utility from `@/app/_utils/format-currency.util.ts`, adding USD support for Panama and ensuring consistent formatting across all components.

## Problem Statement

The application had multiple inconsistent implementations of currency formatting:

1. **Duplicate formatCurrency functions**: One in `lib/utils.ts` (deprecated) and one in `app/_utils/format-currency.util.ts` (new comprehensive version)
2. **Missing USD support**: Only COP (Colombian Peso) was supported, Panama (USD) needed to be added
3. **Inconsistent imports**: Components imported formatCurrency from different locations
4. **Incorrect usage patterns**: Some components used the old 2-parameter signature `formatCurrency(value, currency)` instead of the new options object pattern

### Issues Found

- **CartSummary**: Displaying `{summary.currency} {formatCurrency(summary.total)}` - double currency display
- **QuoteDetailView**: Using old signature with `formatCurrency(value, currency)` 
- **QuoteListItem**: Using old signature
- **Multiple catalog components**: Mixed imports from `lib/utils` and `app/_utils`

## Changes Made

### 1. Enhanced Currency Utility (format-currency.util.ts)

Added USD/Panama support:

```typescript
// New currency code
export const CurrencyCodes = {
  cop: 'COP',
  usd: 'USD',
  pab: 'PAB', // Panamanian Balboa (equivalent to USD)
  // ... existing
} as const;

// New locale
export const LocaleCodes = {
  esCo: 'es-CO',
  esPa: 'es-PA', // Spanish - Panama
  // ... existing
} as const;

// New helper function
export const formatUSD = (
  value: number,
  options?: Omit<FormatCurrencyOptions, 'currency'>
): string => {
  return formatCurrency(value, {
    currency: 'USD',
    decimals: 2, // USD requires 2 decimal places
    display: 'symbol',
    locale: 'es-PA',
    ...options,
  });
};
```

### 2. Deprecated Old formatCurrency (lib/utils.ts)

```typescript
/**
 * Format a number as currency
 * @deprecated Use formatCurrency from @/app/_utils/format-currency.util instead
 * This function is kept for backward compatibility but delegates to the new implementation
 */
export function formatCurrency(value: string | number, currency = 'COP'): string {
  const numericValue = typeof value === 'string' ? Number.parseFloat(value) : value;
  
  // Delegate to new implementation with proper options
  return formatCurrencyUtil(numericValue, {
    currency: currency === 'USD' ? 'USD' : 'COP',
    decimals: currency === 'USD' ? 2 : 0,
    locale: currency === 'USD' ? 'es-PA' : 'es-CO',
  });
}
```

### 3. Updated Components

#### Cart Components

**cart-summary.tsx**:
```typescript
// Before
import { formatCurrency } from '@/lib/utils';
{summary.currency} {formatCurrency(summary.total)}

// After
import { formatCurrency } from '@/app/_utils/format-currency.util';
{formatCurrency(summary.total, {
  currency: summary.currency,
  decimals: summary.currency === 'USD' ? 2 : 0,
  locale: summary.currency === 'USD' ? 'es-PA' : 'es-CO',
})}
```

**cart-item.tsx**:
```typescript
// Before
import { formatCurrency } from '@/lib/utils'; // Not imported
Precio unitario: {currency} ${item.unitPrice.toFixed(2)}
{currency} ${item.subtotal.toFixed(2)}

// After
import { formatCurrency } from '@/app/_utils/format-currency.util';
Precio unitario: {formatCurrency(item.unitPrice, {
  currency,
  decimals: currency === 'USD' ? 2 : 0,
  locale: currency === 'USD' ? 'es-PA' : 'es-CO',
})}
{formatCurrency(item.subtotal, {
  currency,
  decimals: currency === 'USD' ? 2 : 0,
  locale: currency === 'USD' ? 'es-PA' : 'es-CO',
})}
```

#### Quote Components

**quote-detail-view.tsx**:
```typescript
// Before
import { formatCurrency } from '@/lib/utils';
{formatCurrency(item.unitPrice, quote.currency)}

// After
import { formatCurrency } from '@/app/_utils/format-currency.util';
{formatCurrency(item.unitPrice, {
  currency: quote.currency,
  decimals: quote.currency === 'USD' ? 2 : 0,
  locale: quote.currency === 'USD' ? 'es-PA' : 'es-CO',
})}
```

**quote-list-item.tsx**:
```typescript
// Before
import { formatCurrency } from '@/lib/utils';
{formatCurrency(quote.total, quote.currency)}

// After
import { formatCurrency } from '@/app/_utils/format-currency.util';
{formatCurrency(quote.total, {
  currency: quote.currency,
  decimals: quote.currency === 'USD' ? 2 : 0,
  locale: quote.currency === 'USD' ? 'es-PA' : 'es-CO',
})}
```

#### Catalog Components

**model-info.tsx**:
```typescript
// Before
import { formatCurrency } from '@/lib/utils';

// After
import { formatCurrency } from '@/app/_utils/format-currency.util';
```

**glass-type-selector-section.tsx**:
```typescript
// Before
import { cn, formatCurrency } from '@/lib/utils';

// After
import { formatCurrency } from '@/app/_utils/format-currency.util';
import { cn } from '@/lib/utils';
```

**services-selector-section.tsx**:
```typescript
// Before
import { cn, formatCurrency } from '@/lib/utils';

// After
import { formatCurrency } from '@/app/_utils/format-currency.util';
import { cn } from '@/lib/utils';
```

**catalog-grid.tsx**:
```typescript
// Before
import { formatCurrency } from '@/lib/utils';

// After
import { formatCurrency } from '@/app/_utils/format-currency.util';
```

#### Quote Generation Components

**quote-item.tsx**:
```typescript
// Before
import { formatCurrency } from '@/lib/utils';
{formatCurrency(subtotal)} // subtotal is a string

// After
import { formatCurrency } from '@/app/_utils/format-currency.util';
{formatCurrency(Number(subtotal))} // Convert to number
```

**price-calculator.tsx**:
```typescript
// Before
import { formatCurrency } from '@/lib/utils';
precioBase: formatCurrency(model.basePrice), // string
{formatCurrency(service.price)} // string
{formatCurrency(calculation.subtotal)} // string

// After
import { formatCurrency } from '@/app/_utils/format-currency.util';
precioBase: formatCurrency(Number(model.basePrice)),
{formatCurrency(Number(service.price))}
{formatCurrency(Number(calculation.subtotal))}
```

### 4. Components NOT Changed

These components have their own internal `formatCurrency` implementations and were left unchanged:

- **quote-list.tsx**: Uses ARS (Argentine Peso) with custom formatting
- **dashboard/page.tsx**: Uses ARS (Argentine Peso) with custom formatting
- **email.ts**: Server-side email service with CLP (Chilean Peso) support

## Technical Details

### Currency-Locale Mapping

| Currency | Locale | Decimals | Example Output |
| -------- | ------ | -------- | -------------- |
| COP      | es-CO  | 0        | $285.000       |
| USD      | es-PA  | 2        | $1,250.00      |
| PAB      | es-PA  | 2        | B/.1,250.00    |

### Usage Pattern

```typescript
// Simple COP (default)
formatCurrency(285000) // "$285.000"

// USD for Panama
formatCurrency(1250, {
  currency: 'USD',
  decimals: 2,
  locale: 'es-PA'
}) // "$1,250.00"

// Or use helper
formatUSD(1250) // "$1,250.00"

// Dynamic based on quote/cart currency
formatCurrency(total, {
  currency: quote.currency,
  decimals: quote.currency === 'USD' ? 2 : 0,
  locale: quote.currency === 'USD' ? 'es-PA' : 'es-CO',
})
```

## Testing Checklist

- [ ] **Catalog page**: Verify model prices display correctly in COP
- [ ] **Model detail form**: Verify glass type prices and service rates display in COP
- [ ] **Cart summary**: Verify totals display correctly (COP: no decimals, USD: 2 decimals)
- [ ] **Quote list**: Verify quote totals display correctly based on currency
- [ ] **Quote detail**: Verify item prices, subtotals, and total display correctly
- [ ] **Multi-currency**: Test with manufacturers configured for USD
- [ ] **Type safety**: Verify no TypeScript errors with `pnpm typecheck`

## Migration Guide

If you need to add a new component that displays currency:

1. Import from the correct location:
   ```typescript
   import { formatCurrency } from '@/app/_utils/format-currency.util';
   ```

2. Use the options object pattern:
   ```typescript
   // Good
   formatCurrency(value, { currency: 'COP', decimals: 0 })
   
   // Bad - deprecated signature
   formatCurrency(value, 'COP')
   ```

3. For dynamic currency (quotes/cart):
   ```typescript
   formatCurrency(value, {
     currency: dynamicCurrency,
     decimals: dynamicCurrency === 'USD' ? 2 : 0,
     locale: dynamicCurrency === 'USD' ? 'es-PA' : 'es-CO',
   })
   ```

4. Convert string values to numbers:
   ```typescript
   // If value is a string
   formatCurrency(Number(stringValue))
   ```

## Files Changed

### Modified
- `src/app/_utils/format-currency.util.ts` - Added USD/PAB support, formatUSD helper
- `src/lib/utils.ts` - Deprecated old formatCurrency, delegates to new util
- `src/app/(public)/cart/_components/cart-summary.tsx` - Updated import and usage
- `src/app/(public)/cart/_components/cart-item.tsx` - Updated import and usage for unit price and subtotal
- `src/app/(dashboard)/quotes/_components/quote-list-item.tsx` - Updated import and usage
- `src/app/(dashboard)/quotes/[quoteId]/_components/quote-detail-view.tsx` - Updated import and usage
- `src/app/(public)/catalog/[modelId]/_components/model-info.tsx` - Updated import
- `src/app/(public)/catalog/[modelId]/_components/form/sections/glass-type-selector-section.tsx` - Updated import
- `src/app/(public)/catalog/[modelId]/_components/form/sections/services-selector-section.tsx` - Updated import
- `src/app/(public)/catalog/_components/organisms/catalog-grid.tsx` - Updated import
- `src/app/(public)/quote/_components/quote-item.tsx` - Updated import and string conversion
- `src/app/(public)/quote/_components/price-calculator.tsx` - Updated import and string conversions

### Not Modified (Internal Implementations)
- `src/app/(dashboard)/_components/quote-list.tsx` - Uses ARS
- `src/app/(dashboard)/page.tsx` - Uses ARS
- `src/server/services/email.ts` - Server-side with CLP support

## Next Steps

1. **Test multi-currency flows**: Create quotes with USD manufacturers
2. **Update E2E tests**: Add currency formatting assertions
3. **Consider**: Extract the dynamic currency logic to a helper:
   ```typescript
   export const formatQuoteCurrency = (value: number, currency: string) =>
     formatCurrency(value, {
       currency,
       decimals: currency === 'USD' ? 2 : 0,
       locale: currency === 'USD' ? 'es-PA' : 'es-CO',
     });
   ```

## Related Changes

- **Session Provider**: See `CHANGELOG-session-cart-fixes.md`
- **Form Submit Refactor**: See `CHANGELOG-form-submit-refactor.md`

## References

- Currency formatting utility: `src/app/_utils/format-currency.util.ts`
- Test suite: `src/tests/unit/format-currency.util.test.ts`
- Locale codes: [MDN Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
