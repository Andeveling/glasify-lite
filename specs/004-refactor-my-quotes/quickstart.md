# Quickstart Guide: My Quotes UX Redesign

**Feature**: 004-refactor-my-quotes  
**Last Updated**: 2025-10-12  
**Audience**: Developers extending or maintaining this feature

---

## Table of Contents

1. [Overview](#overview)
2. [Adding New Window Diagrams](#adding-new-window-diagrams)
3. [Customizing PDF Templates](#customizing-pdf-templates)
4. [Customizing Excel Templates](#customizing-excel-templates)
5. [Adding New Export Formats](#adding-new-export-formats)
6. [Adding New Filter Types](#adding-new-filter-types)
7. [Customizing Status Badges](#customizing-status-badges)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The My Quotes UX Redesign feature includes:

- **Status clarity**: Self-explanatory status badges with icons and tooltips
- **Product visualization**: Product images with SVG fallbacks
- **Export functionality**: PDF and Excel export capabilities
- **Filtering**: Search, status filter, and sorting options

**Key Files**:
- Components: `src/app/(public)/my-quotes/_components/`
- Hooks: `src/app/(public)/my-quotes/_hooks/`
- Utils: `src/app/(public)/my-quotes/_utils/`
- Export logic: `src/lib/export/` and `src/app/_actions/quote-export.actions.ts`
- Window diagrams: `public/diagrams/windows/`

---

## Adding New Window Diagrams

### 1. Create SVG File

Create a new SVG file in `public/diagrams/windows/`:

```bash
# Example: Adding a "garden-window" diagram
touch public/diagrams/windows/garden-window.svg
```

### 2. Design Guidelines

**Requirements**:
- **Dimensions**: 24x24 viewBox (icon-sized)
- **File size**: < 5KB (preferably < 2KB)
- **Colors**: Monochrome (use currentColor for theming)
- **Stroke**: 2px stroke width for consistency
- **Clean paths**: Optimize with SVGO

**Example SVG Structure**:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="3" width="18" height="18" rx="2"/>
  <line x1="12" y1="3" x2="12" y2="21"/>
  <!-- Additional paths for your design -->
</svg>
```

### 3. Update WindowType Enum

Add the new type to `src/types/window.types.ts`:

```typescript
export enum WindowType {
  // ... existing types
  GARDEN_WINDOW = 'garden-window',
}

export const WINDOW_TYPE_LABELS: Record<WindowType, string> = {
  // ... existing labels
  [WindowType.GARDEN_WINDOW]: 'Ventana de Jardín',
};
```

### 4. Update Window Diagram Map

The `getWindowDiagram` utility will automatically pick up the new SVG based on the filename matching the enum value.

No code changes needed in `src/lib/utils/window-diagram-map.ts` - it dynamically constructs paths!

### 5. Test

```bash
# Run component tests
pnpm test tests/unit/utils/window-diagram-map.test.ts

# Manual test
# Navigate to /my-quotes/[quoteId] with a quote item that has the new window type
```

---

## Customizing PDF Templates

### File: `src/lib/export/pdf/quote-pdf-document.tsx`

This file contains the React-PDF template. It uses `@react-pdf/renderer` components.

### Modify Header

```tsx
// In QuotePDFDocument component
<View style={styles.header}>
  <Image src="/your-logo.png" style={styles.logo} />
  <Text style={styles.title}>Your Company Name</Text>
</View>
```

### Modify Styles

Edit `src/lib/export/pdf/pdf-styles.ts`:

```typescript
export const pdfStyles = StyleSheet.create({
  // Modify existing styles
  header: {
    marginBottom: 20,
    borderBottom: '2pt solid #3B65C4', // Your brand color
  },
  
  // Add new styles
  watermark: {
    position: 'absolute',
    fontSize: 60,
    color: '#EFEFEF',
    transform: 'rotate(-45deg)',
  },
});
```

### Add Watermark

```tsx
// In Document component
<Page size="LETTER" style={styles.page}>
  <Text style={styles.watermark}>DRAFT</Text>
  {/* ... rest of content */}
</Page>
```

### Add Company Branding

1. Add logo to `public/assets/`:
```bash
cp your-logo.png public/assets/company-logo.png
```

2. Reference in PDF:
```tsx
<Image src="/assets/company-logo.png" style={styles.logo} />
```

### Environment Variables

Configure in `.env`:

```env
NEXT_PUBLIC_COMPANY_NAME="Your Company"
NEXT_PUBLIC_COMPANY_LOGO_URL="/assets/company-logo.png"
EXPORT_PDF_PAGE_SIZE="LETTER"  # or "A4"
```

---

## Customizing Excel Templates

### File: `src/lib/export/excel/quote-excel-workbook.ts`

### Add New Sheet

```typescript
export async function writeQuoteExcel(data: QuoteExcelData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  
  // Existing sheets
  const summarySheet = workbook.addWorksheet('Resumen');
  const itemsSheet = workbook.addWorksheet('Items');
  
  // Add new sheet
  const analyticsSheet = workbook.addWorksheet('Análisis');
  
  // Populate new sheet
  analyticsSheet.addRow(['Métrica', 'Valor']);
  analyticsSheet.addRow(['Descuento Total', data.totals.discount]);
  analyticsSheet.addRow(['Margen Promedio', '15%']); // Calculate
  
  // ...
}
```

### Modify Column Widths

Edit `src/lib/export/excel/excel-styles.ts`:

```typescript
export const COLUMN_WIDTHS = {
  // Existing
  item: 10,
  name: 30,
  
  // Add new
  category: 20,
  notes: 40,
};
```

### Add Formulas

```typescript
// In items sheet
const totalRow = itemsSheet.addRow([
  '', // Item #
  'TOTAL',
  '', // Quantity
  '', // Unit Price
  { formula: `SUM(E2:E${lastRow})` }, // Subtotal formula
]);
```

### Add Conditional Formatting

```typescript
// Highlight high-value items
itemsSheet.addConditionalFormatting({
  ref: `E2:E${lastRow}`, // Subtotal column
  rules: [{
    type: 'cellIs',
    operator: 'greaterThan',
    formulae: [1000000],
    style: {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF00' }, // Yellow
      },
    },
  }],
});
```

---

## Adding New Export Formats

### 1. Create Export Library Module

```bash
# Example: Adding CSV export
mkdir -p src/lib/export/csv
touch src/lib/export/csv/quote-csv.ts
```

### 2. Implement Export Function

```typescript
// src/lib/export/csv/quote-csv.ts
import type { QuoteExcelData } from '@/types/export.types';

export function writeQuoteCSV(data: QuoteExcelData): string {
  const headers = ['Item', 'Name', 'Quantity', 'Unit Price', 'Subtotal'];
  
  const rows = data.items.map(item => [
    item.itemNumber,
    item.name,
    item.quantity,
    item.unitPrice,
    item.subtotal,
  ]);
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');
  
  return csv;
}
```

### 3. Add Server Action

Edit `src/app/_actions/quote-export.actions.ts`:

```typescript
export async function exportQuoteCSV(input: ExportQuoteInput): Promise<ExportResult> {
  const startTime = Date.now();
  
  try {
    // ... validation and data fetching (same as PDF/Excel)
    
    const csvData = writeQuoteCSV(excelData);
    const base64Data = Buffer.from(csvData).toString('base64');
    
    logger.info('CSV export completed', {
      duration: Date.now() - startTime,
      quoteId,
    });
    
    return {
      success: true,
      data: base64Data,
      filename: `Cotizacion_${quote.projectName}_${new Date().toISOString().split('T')[0]}.csv`,
      mimeType: 'text/csv',
    };
  } catch (error) {
    logger.error('CSV export failed', { error, quoteId });
    return { success: false, error: 'Error al generar CSV' };
  }
}
```

### 4. Update Hook

Edit `src/app/(public)/my-quotes/_hooks/use-quote-export.ts`:

```typescript
export function useQuoteExport() {
  // ... existing state
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  
  const exportCSV = async (quoteId: string) => {
    setIsExportingCSV(true);
    
    try {
      const result = await exportQuoteCSV({ quoteId, format: 'csv' });
      
      if (!result.success) {
        toast.error(result.error || 'Error al exportar CSV');
        return;
      }
      
      downloadFile(result.data!, result.filename!, result.mimeType!);
      toast.success('CSV descargado exitosamente');
    } catch (error) {
      toast.error('Error al exportar CSV');
    } finally {
      setIsExportingCSV(false);
    }
  };
  
  return { exportPDF, exportExcel, exportCSV, isExportingPDF, isExportingExcel, isExportingCSV };
}
```

### 5. Add Button

Edit `src/app/(public)/my-quotes/[quoteId]/_components/quote-export-buttons.tsx`:

```tsx
import { FileText } from 'lucide-react'; // CSV icon

export function QuoteExportButtons({ quoteId }: Props) {
  const { exportPDF, exportExcel, exportCSV } = useQuoteExport();
  
  return (
    <div className="flex gap-2">
      {/* ... PDF and Excel buttons */}
      
      <Button onClick={() => exportCSV(quoteId)} variant="outline">
        <FileText className="mr-2 h-4 w-4" />
        CSV
      </Button>
    </div>
  );
}
```

---

## Adding New Filter Types

### 1. Update Hook Types

Edit `src/app/(public)/my-quotes/_hooks/use-quote-filters.ts`:

```typescript
export interface QuoteFilters {
  status?: QuoteStatus;
  searchQuery: string;
  sortBy: QuoteSortOption;
  
  // Add new filter
  dateRange?: {
    from: Date;
    to: Date;
  };
}
```

### 2. Add State Management

```typescript
export function useQuoteFilters() {
  const [filters, setFilters] = useState<QuoteFilters>(() => {
    // ... existing initialization
    
    // Parse date range from URL
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    const dateRange = fromParam && toParam
      ? { from: new Date(fromParam), to: new Date(toParam) }
      : undefined;
    
    return { status, searchQuery, sortBy, dateRange };
  });
  
  const setDateRange = useCallback((range: { from: Date; to: Date } | undefined) => {
    const newFilters = { ...filters, dateRange: range };
    setFilters(newFilters);
    updateURL(newFilters);
  }, [filters, updateURL]);
  
  return { ...existing, setDateRange };
}
```

### 3. Add UI Component

Edit `src/app/(public)/my-quotes/_components/quote-filters.tsx`:

```tsx
import { DateRangePicker } from '@/components/ui/date-range-picker';

export function QuoteFilters() {
  const { filters, setDateRange } = useQuoteFilters();
  
  return (
    <>
      {/* ... existing filters */}
      
      <DateRangePicker
        value={filters.dateRange}
        onChange={setDateRange}
        placeholder="Filtrar por fecha"
      />
    </>
  );
}
```

### 4. Update Server Query

The filters are already passed to the server via URL params. Update the tRPC procedure to use them:

```typescript
// src/server/api/routers/quote.ts
'list-user-quotes': protectedProcedure
  .input(z.object({
    // ... existing
    dateFrom: z.date().optional(),
    dateTo: z.date().optional(),
  }))
  .query(async ({ input, ctx }) => {
    const where = {
      userId: ctx.session.user.id,
      status: input.status,
      createdAt: input.dateFrom && input.dateTo ? {
        gte: input.dateFrom,
        lte: input.dateTo,
      } : undefined,
    };
    
    // ... fetch quotes
  })
```

---

## Customizing Status Badges

### File: `src/app/(public)/my-quotes/_utils/status-config.ts`

### Add New Status

```typescript
export const STATUS_CONFIG: Record<QuoteStatus, StatusConfig> = {
  // ... existing statuses
  
  // Add new status (if added to Prisma schema)
  approved: {
    label: 'Aprobada',
    icon: CheckCircle2,
    iconName: 'check-circle',
    tooltip: 'Cotización aprobada por el cliente',
    variant: 'default', // Use existing variant or create new
    color: 'default',
    cta: {
      label: 'Generar factura',
      action: 'invoice',
    },
  },
};
```

### Create Custom Variant

Edit `src/components/ui/badge.tsx` to add new variant:

```typescript
const badgeVariants = cva(
  "inline-flex items-center rounded-full...",
  {
    variants: {
      variant: {
        // ... existing variants
        success: "bg-green-500 text-white hover:bg-green-600",
      },
    },
  }
);
```

### Update Type

```typescript
export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
```

---

## Troubleshooting

### PDF Export Issues

**Problem**: PDF not downloading

**Solution**:
1. Check browser console for errors
2. Verify Winston logs: `logger.error('PDF export failed'...)`
3. Test with curl:
```bash
curl -X POST http://localhost:3000/api/quote-export \
  -H "Content-Type: application/json" \
  -d '{"quoteId": "xxx", "format": "pdf"}'
```

**Problem**: Images not appearing in PDF

**Solution**:
1. Ensure image URLs are absolute (not relative)
2. Check CORS settings if using external CDN
3. Verify image is accessible: `curl -I https://your-image-url.jpg`

### Excel Export Issues

**Problem**: Formulas not calculating

**Solution**:
- Excel requires specific cell references
- Use `{ formula: 'SUM(A1:A10)' }` format
- Open file in Excel (not Google Sheets) for full formula support

### Filter Issues

**Problem**: Filters not persisting on page reload

**Solution**:
1. Verify URL params are being set: `console.log(searchParams)`
2. Check `useQuoteFilters` initialization logic
3. Ensure `router.replace` is called, not `router.push`

### Image Fallback Issues

**Problem**: SVG diagrams not showing

**Solution**:
1. Verify SVG file exists: `ls public/diagrams/windows/your-type.svg`
2. Check WindowType enum value matches filename
3. Test fallback logic: `getWindowDiagram('invalid-type')` should return default

---

## Performance Tips

### Lazy Load Images

```tsx
<QuoteItemImage
  eager={false} // Lazy load (default)
  // ... other props
/>
```

### Optimize PDF Generation

- Limit items per page
- Compress images before including
- Use vector graphics where possible

### Debounce Search

Already implemented (300ms). To adjust:

```typescript
// In useQuoteFilters
const timer = setTimeout(() => {
  updateURL(newFilters);
}, 500); // Change from 300ms to 500ms
```

---

## Testing

### Run Tests

```bash
# Unit tests
pnpm test tests/unit/utils/status-config.test.ts
pnpm test tests/unit/hooks/use-quote-filters.test.ts

# E2E tests
pnpm test:e2e e2e/my-quotes/

# Specific test
pnpm test:e2e e2e/my-quotes/quote-export-pdf.spec.ts
```

### Manual Testing Checklist

- [ ] Status badges display correctly for all states
- [ ] Window diagrams load/fallback works
- [ ] PDF export downloads with correct filename
- [ ] Excel export contains all data
- [ ] Filters update URL
- [ ] Search debounces properly
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly

---

## Resources

- **React-PDF**: https://react-pdf.org/
- **ExcelJS**: https://github.com/exceljs/exceljs
- **Next.js Server Actions**: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions
- **Radix UI**: https://www.radix-ui.com/
- **shadcn/ui**: https://ui.shadcn.com/

---

## Support

For questions or issues:

1. Check this guide first
2. Review the spec: `specs/004-refactor-my-quotes/spec.md`
3. Check implementation plan: `specs/004-refactor-my-quotes/plan.md`
4. Review tests for usage examples
5. Check Winston logs for runtime errors

---

**Last Updated**: 2025-10-12  
**Version**: 1.0.0
