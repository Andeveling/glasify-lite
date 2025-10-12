# Implementation Plan: My Quotes UX Redesign

**Branch**: `004-refactor-my-quotes` | **Date**: 2025-10-12 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/004-refactor-my-quotes/spec.md`

## Summary

Refactor the "My Quotes" views (`/my-quotes` and `/my-quotes/[quoteId]`) to eliminate user confusion with status labels, add visual product representation with images/diagrams, implement export functionality (PDF/Excel), and apply "Don't Make Me Think" UX principles throughout. The implementation focuses on **presentation layer improvements** without schema changes, using existing tRPC queries and adding new Server Actions for export generation.

**Key Technical Approach**:
- Replace confusing "Borrador" label with "En edición" + contextual icons/tooltips
- Add product thumbnail images to quote items with SVG fallback diagrams for window types
- Implement PDF export using `react-pdf/renderer` with professional formatting
- Implement Excel export using `exceljs` with formulas and styling
- Add filtering/search UI using URL search params (Next.js App Router patterns)
- Server Components for data fetching, Client Components only for interactive filters/export buttons
- Preserve existing tRPC procedures, add new export Server Actions
- Follow Atomic Design: atoms (ui/), molecules (components/), organisms (_components/), pages (page.tsx)

## Technical Context

**Language/Version**: TypeScript 5.8.2 (strict mode), ECMAScript ES2022  
**Primary Dependencies**: 
  - Next.js 15.2.3 (App Router with React Server Components)
  - tRPC 11.0.0 (queries) + Server Actions (exports)
  - React 19.0.0 (Server Components + Client Components)
  - React Hook Form 7.63.0 + Zod 4.1.1 (filter forms)
  - Prisma 6.17.0 (PostgreSQL ORM - no schema changes needed)
  - TanStack Query 5.69.0 (client-side caching)
  - Shadcn/ui (Radix UI components)
  - Lucide React (icons for status badges)
  - **PDF Export**: `@react-pdf/renderer` (React-based PDF generation)
  - **Excel Export**: `exceljs` (Excel workbook generation with formulas)
  
**Storage**: PostgreSQL 17 via Prisma ORM (existing `Quote` and `QuoteItem` tables, no migrations needed)

**Testing**: 
  - Vitest 3.2.4 with jsdom (unit tests for utilities, hooks)
  - @testing-library/react (component testing)
  - Playwright 1.55.1 (E2E tests for export flows)
  - Contract tests for export Server Actions (Zod schema validation)
  
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge), responsive design (desktop primary, mobile secondary)

**Project Type**: Web application (Next.js full-stack with App Router)

**Performance Goals**: 
  - Quote list page load < 2 seconds (50 quotes)
  - Quote detail page load < 1.5 seconds (30 items)
  - Thumbnail images lazy-load as user scrolls
  - Export generation < 10 seconds (50 items)
  - Status label comprehension 90%+ without help (measured by support tickets)

**Constraints**: 
  - No database schema changes (presentation layer only)
  - Existing tRPC procedures remain unchanged
  - Product images added incrementally (fallback diagrams required)
  - Export generation synchronous (user waits, no email delivery)
  - Company branding configured globally (env variables or settings table)
  
**Scale/Scope**: 
  - 2 existing pages refactored (`/my-quotes`, `/my-quotes/[quoteId]`)
  - ~10 new components (status badges, image viewers, export buttons, filters)
  - 2 new Server Actions (PDF export, Excel export)
  - ~20 SVG fallback diagrams for window types
  - No new database tables or migrations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Single Responsibility (SRP)
- **Status Display Logic**: Separate component (`QuoteStatusBadge`) handles status label/icon/tooltip rendering
- **Export Generation**: Dedicated Server Actions (`exportQuotePDF`, `exportQuoteExcel`) handle export logic
- **Image Fallback Strategy**: Utility function (`getWindowDiagram`) determines which SVG to use
- **Filter State Management**: Custom hook (`useQuoteFilters`) manages filter state + URL sync
- **PDF Layout**: Separate component tree for PDF template (`QuotePDFDocument`)

### ✅ Open/Closed (OCP)  
- **Extending Existing Views**: Wraps existing `QuoteListItem` and `QuoteDetailView` with new features (no modification)
- **Status Configuration**: `statusConfig` object easily extended with new statuses
- **Fallback Diagrams**: Lookup map for window types (add new types without code changes)
- **Export Formats**: New export formats added via new Server Actions (no changes to existing)

### ✅ Test-First (NON-NEGOTIABLE)
- Unit tests for status label mapping (`getStatusLabel`, `getStatusIcon`)
- Unit tests for image fallback logic (`getWindowDiagram`)
- Unit tests for filename generation (`generateExportFilename`)
- Component tests for `QuoteStatusBadge` (tooltip, icon, label)
- Integration tests for export Server Actions (PDF/Excel generation)
- E2E tests for complete export flow (Playwright: click button → file downloads)
- E2E tests for filtering (apply filters → URL updates → results update)

### ✅ Integration & Contract Testing
- **Server Actions**: Input/output schemas with Zod (quoteId validation, export options)
- **PDF Generation**: Contract tests verify PDF contains required sections (header, items table, footer)
- **Excel Generation**: Contract tests verify Excel structure (sheets, formulas, formatting)
- **Image CDN**: Integration tests for image loading with fallback behavior

### ✅ Observability & Versioning
- **Structured Logging**: Winston logger for all export operations (quote ID, format, duration, errors)
- **Error Tracking**: Specific error codes for export failures (EXPORT_GENERATION_FAILED, EMPTY_QUOTE)
- **Performance Monitoring**: Log export generation time for performance tracking
- **User Analytics**: Track export button clicks and success rate (optional, via client-side events)

**Gate Status**: ✅ PASS - All constitutional principles satisfied, no complexity violations

## Project Structure

### Documentation (this feature)

```
specs/004-refactor-my-quotes/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output: PDF/Excel libraries research
├── data-model.md        # Phase 1 output: Export data structures
├── quickstart.md        # Phase 1 output: Developer setup for exports
├── contracts/           # Phase 1 output: Server Action schemas
│   ├── export.schema.ts         # Export Server Action input/output
│   └── filters.schema.ts        # Filter form schemas
└── checklists/
    └── requirements.md  # Quality validation (already created)
```

### Source Code (repository root)

```
src/
├── app/
│   ├── (public)/
│   │   └── my-quotes/                    # REFACTOR: Existing quote views
│   │       ├── _components/              # REFACTOR: Organisms
│   │       │   ├── quote-list-item.tsx             # MODIFY: Add status badge, item preview
│   │       │   ├── quote-status-badge.tsx          # NEW: Status label + icon + tooltip
│   │       │   ├── quote-filters.tsx               # NEW: Status/search/sort filters
│   │       │   ├── quote-item-preview.tsx          # NEW: First 3 items with thumbnails
│   │       │   └── empty-quotes-state.tsx          # EXTEND: Better empty state
│   │       │
│   │       ├── _hooks/                   # NEW: Custom hooks
│   │       │   ├── use-quote-filters.ts            # Filter state + URL sync
│   │       │   └── use-quote-export.ts             # Export action wrapper
│   │       │
│   │       ├── _utils/                   # NEW: Utilities
│   │       │   ├── status-config.ts                # Status label/icon/color mapping
│   │       │   └── export-filename.ts              # Filename generation logic
│   │       │
│   │       ├── page.tsx                  # MODIFY: Add filters, item previews
│   │       │
│   │       └── [quoteId]/
│   │           ├── _components/
│   │           │   ├── quote-detail-view.tsx       # MODIFY: Add export buttons, images
│   │           │   ├── quote-export-buttons.tsx    # NEW: PDF/Excel export buttons
│   │           │   ├── quote-items-grid.tsx        # NEW: Items with images/diagrams
│   │           │   ├── quote-item-image.tsx        # NEW: Image with fallback
│   │           │   └── image-viewer-dialog.tsx     # NEW: Lightbox for enlarged view
│   │           │
│   │           └── page.tsx              # MODIFY: Add export actions
│   │
│   └── _actions/                         # NEW: Server Actions directory
│       └── quote-export.actions.ts       # export-quote-pdf, export-quote-excel
│
├── components/                           # Shared UI components
│   ├── ui/                               # Shadcn/ui atoms (no changes)
│   │
│   └── quote/                            # NEW: Shared quote molecules
│       ├── status-badge.tsx              # Status badge (reusable)
│       └── window-diagram.tsx            # SVG window diagram component
│
├── lib/
│   ├── export/                           # NEW: Export generation
│   │   ├── pdf/
│   │   │   ├── quote-pdf-document.tsx    # React-PDF template
│   │   │   ├── pdf-styles.ts             # PDF styling config
│   │   │   └── pdf-utils.ts              # PDF helper functions
│   │   │
│   │   └── excel/
│   │       ├── quote-excel-workbook.ts   # ExcelJS workbook generator
│   │       ├── excel-styles.ts           # Excel formatting config
│   │       └── excel-utils.ts            # Excel helper functions
│   │
│   └── utils/
│       ├── window-diagram-map.ts         # NEW: Window type → SVG mapping
│       └── image-utils.ts                # NEW: Image URL helpers, CDN logic
│
├── server/
│   └── api/
│       └── routers/
│           └── quote/
│               └── quote.ts              # EXISTING: No changes needed
│
├── types/                                # NEW: TypeScript types
│   └── export.types.ts                   # ExportFormat, ExportOptions types
│
public/
└── diagrams/                             # NEW: SVG fallback diagrams
    └── windows/
        ├── french-2-panel.svg            # French window (2 panels)
        ├── french-4-panel.svg            # French window (4 panels)
        ├── sliding-2-panel.svg           # Sliding window (2 panels)
        ├── sliding-3-panel.svg           # Sliding window (3 panels)
        ├── fixed-single.svg              # Fixed window
        ├── awning.svg                    # Awning window
        ├── casement-left.svg             # Casement (left opening)
        ├── casement-right.svg            # Casement (right opening)
        └── ... (12 more window types)

e2e/                                      # NEW: E2E tests
├── my-quotes/
│   ├── quote-status-clarity.spec.ts      # Test status label comprehension
│   ├── quote-export-pdf.spec.ts          # Test PDF export flow
│   ├── quote-export-excel.spec.ts        # Test Excel export flow
│   ├── quote-filters.spec.ts             # Test filtering/search
│   └── quote-image-viewer.spec.ts        # Test image lightbox
│
tests/
├── unit/
│   ├── utils/
│   │   ├── status-config.test.ts         # Status mapping tests
│   │   ├── window-diagram-map.test.ts    # Fallback logic tests
│   │   └── export-filename.test.ts       # Filename generation tests
│   │
│   └── export/
│       ├── pdf-generation.test.ts        # PDF generation unit tests
│       └── excel-generation.test.ts      # Excel generation unit tests
│
└── integration/
    └── quote-export.test.ts              # Export Server Actions integration tests
```

**Structure Decision**: Using Next.js App Router structure with route groups `(public)` for unauthenticated views. Following Atomic Design with `_components/` for organisms (feature-specific), `components/` for shared molecules, and `components/ui/` for atoms. Export logic isolated in `lib/export/` with separate modules for PDF and Excel generation. SVG diagrams stored in `public/diagrams/windows/` for static serving.

## Complexity Tracking

*No complexity violations - this is a presentation layer refactor with no architectural changes.*

---

## Phase 0: Research & Validation

*Objective: Validate technical feasibility of PDF/Excel export libraries and image fallback strategy.*

### Research Questions

1. **PDF Generation**: Can `@react-pdf/renderer` handle:
   - Complex table layouts with images?
   - Custom fonts and branding (logo embedding)?
   - Page breaks without splitting item rows?
   - File size optimization for 50+ items?

2. **Excel Generation**: Can `exceljs` support:
   - Multiple sheets (summary + items detail)?
   - Formula generation for totals/subtotals?
   - Currency and date formatting?
   - Column width auto-sizing?

3. **Image Strategy**: How to implement fallback diagrams:
   - SVG vs PNG for diagrams (scalability, file size)?
   - How to map window types to diagram files?
   - Lazy loading strategy for thumbnails?
   - CDN/optimization for product images?

4. **Performance**: Export generation time:
   - Benchmark PDF generation (10, 30, 50 items)
   - Benchmark Excel generation (same)
   - Can we achieve <10s for 50 items?

### Validation Tasks

- [ ] **Task R-001**: Create proof-of-concept PDF with `@react-pdf/renderer`
  - Include header with logo, table with images, footer with page numbers
  - Test with 50 items, measure generation time
  - Verify PDF opens correctly in browsers and PDF readers

- [ ] **Task R-002**: Create proof-of-concept Excel with `exceljs`
  - Create workbook with 2 sheets (summary, items)
  - Add formulas for totals
  - Apply currency formatting
  - Verify file opens in Excel and Google Sheets

- [ ] **Task R-003**: Create SVG diagram library
  - Design 5-10 window type diagrams (French, sliding, fixed, casement, awning)
  - Ensure consistent sizing (200x200px viewBox)
  - Test rendering in browser and PDF

- [ ] **Task R-004**: Benchmark export performance
  - Generate 10 quotes with varying item counts (5, 10, 30, 50)
  - Measure PDF generation time
  - Measure Excel generation time
  - Document results in `research.md`

### Research Output

Document findings in `research.md`:
- Library compatibility with Next.js 15 (Server Actions)
- Performance benchmarks (generation time vs item count)
- File size analysis (PDF/Excel with images)
- Recommended image optimization strategy
- Any limitations or workarounds needed

---

## Phase 1: Design & Contracts

*Objective: Define data structures, component interfaces, and Server Action contracts.*

### Data Model Design

Create `data-model.md` documenting:

#### Export Data Structures

```typescript
// Export options for Server Actions
interface ExportQuoteOptions {
  quoteId: string;
  format: 'pdf' | 'excel';
  includeImages: boolean;  // Option to exclude images for faster generation
}

// PDF-specific data structure
interface QuotePDFData {
  header: {
    logo: string;           // Base64 encoded logo or URL
    companyName: string;
    quoteNumber: string;
    date: string;
  };
  project: {
    name: string;
    address: string;
    contactPhone?: string;
  };
  items: Array<{
    name: string;
    modelName: string;
    glassType: string;
    solution?: string;
    dimensions: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    image?: string;       // Base64 encoded or URL
  }>;
  totals: {
    subtotal: number;
    tax: number;
    total: number;
    currency: string;
  };
  footer: {
    validUntil?: string;
    terms: string;
  };
}

// Excel-specific data structure (similar but optimized for spreadsheet)
interface QuoteExcelData {
  // Similar to PDF but with formula strings instead of calculated values
}
```

#### Status Configuration

```typescript
interface StatusConfig {
  draft: {
    label: string;         // "En edición"
    icon: LucideIcon;      // PencilIcon
    color: string;         // "blue"
    tooltip: string;       // "Esta cotización está en edición..."
    badgeVariant: BadgeProps['variant'];
    ctaLabel: string;      // "Continuar editando"
  };
  sent: { /* ... */ };
  canceled: { /* ... */ };
  // expired handled separately (computed, not a status)
}
```

#### Window Diagram Mapping

```typescript
type WindowType = 
  | 'french-2-panel' | 'french-4-panel'
  | 'sliding-2-panel' | 'sliding-3-panel'
  | 'fixed-single' | 'awning'
  | 'casement-left' | 'casement-right'
  | 'hopper' | 'tilt-turn'
  | /* ... more types ... */;

interface WindowDiagramMap {
  [key in WindowType]: {
    svg: string;           // Path to SVG file
    alt: string;           // Alt text for accessibility
    aspectRatio: string;   // "1:1" or "4:3"
  };
}
```

### Component Contracts

Create `contracts/` with component prop interfaces:

```typescript
// contracts/status-badge.contract.ts
export interface QuoteStatusBadgeProps {
  status: 'draft' | 'sent' | 'canceled';
  isExpired: boolean;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// contracts/export-button.contract.ts
export interface QuoteExportButtonProps {
  quoteId: string;
  format: 'pdf' | 'excel';
  variant?: ButtonProps['variant'];
  disabled?: boolean;
  onExportStart?: () => void;
  onExportComplete?: (filename: string) => void;
  onExportError?: (error: Error) => void;
}

// contracts/item-image.contract.ts
export interface QuoteItemImageProps {
  modelName: string;
  windowType: WindowType;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}
```

### Server Action Contracts

Create `contracts/export.schema.ts`:

```typescript
import { z } from 'zod';

export const exportQuoteInputSchema = z.object({
  quoteId: z.string().cuid2(),
  format: z.enum(['pdf', 'excel']),
  includeImages: z.boolean().default(true),
});

export const exportQuoteOutputSchema = z.object({
  success: z.boolean(),
  filename: z.string(),
  data: z.instanceof(Blob).or(z.string()), // Blob for download, string for error
  contentType: z.string(),
});

export type ExportQuoteInput = z.infer<typeof exportQuoteInputSchema>;
export type ExportQuoteOutput = z.infer<typeof exportQuoteOutputSchema>;
```

### Design Output

Document in `quickstart.md`:
- How to add a new window diagram
- How to add a new export format
- How to customize PDF/Excel templates
- Environment variables needed (logo URL, company name, etc.)
- Testing strategy for export functionality

---

## Phase 2: Implementation Tasks

*Objective: Break down implementation into testable, independent tasks. Use `/speckit.tasks` to generate detailed task list.*

### Task Categories (High-Level)

#### Category 1: Status Label Improvements (P1)
- Create `QuoteStatusBadge` component with icons and tooltips
- Update `statusConfig` with new labels ("En edición", etc.)
- Modify `QuoteListItem` to use new badge component
- Add unit tests for status mapping logic
- Add E2E test for status comprehension

#### Category 2: Image Display & Fallbacks (P1)
- Create SVG diagram library (20 window types)
- Implement `getWindowDiagram` utility
- Create `QuoteItemImage` component with fallback logic
- Create `ImageViewerDialog` for enlarged view
- Update `QuoteDetailView` to show item images
- Add lazy loading for thumbnails
- Add unit tests for fallback logic
- Add E2E test for image viewer

#### Category 3: PDF Export (P2)
- Install and configure `@react-pdf/renderer`
- Create `QuotePDFDocument` component
- Implement PDF generation Server Action
- Add PDF download functionality
- Add unit tests for PDF generation
- Add integration test for Server Action
- Add E2E test for PDF download flow

#### Category 4: Excel Export (P2)
- Install and configure `exceljs`
- Create Excel workbook generator
- Implement Excel generation Server Action
- Add Excel download functionality
- Add unit tests for Excel generation
- Add integration test for Server Action
- Add E2E test for Excel download flow

#### Category 5: Filtering & Search (P3)
- Create `QuoteFilters` component
- Implement `useQuoteFilters` hook with URL sync
- Add search input with debouncing
- Add status dropdown filter
- Add sort dropdown
- Update `MyQuotesPage` to use filters
- Add E2E test for filtering flow

#### Category 6: Item Preview in List (P3)
- Create `QuoteItemPreview` component
- Modify `QuoteListItem` to show first 3 items
- Add item count badge
- Add unit tests for preview logic

### Task Dependencies

```
Phase 2.1 (P1 - Core UX)
├─ Status Labels (no dependencies)
│  └─ Can be deployed independently
│
└─ Image Display (depends on diagrams)
   └─ Diagrams must be created first
   └─ Can be deployed independently

Phase 2.2 (P2 - Export)
├─ PDF Export (depends on image display for embedded images)
│  └─ Can work without images if needed
│
└─ Excel Export (independent of PDF)
   └─ Can be deployed independently

Phase 2.3 (P3 - Enhanced UX)
├─ Filtering (independent)
│  └─ Can be deployed independently
│
└─ Item Preview (depends on image display)
   └─ Can be deployed after images ready
```

### Deployment Strategy

1. **Deploy P1 (Status + Images)** - Immediate UX improvement
2. **Deploy P2a (PDF Export)** - Most requested feature
3. **Deploy P2b (Excel Export)** - Secondary export format
4. **Deploy P3 (Filters + Preview)** - Enhanced navigation

Each deployment is independently testable and provides incremental value.

---

## Phase 3: Testing Strategy

### Unit Tests (Vitest)

```typescript
// tests/unit/utils/status-config.test.ts
describe('Status Configuration', () => {
  it('maps draft status to "En edición" label', () => {
    expect(getStatusLabel('draft')).toBe('En edición');
  });
  
  it('returns correct icon for each status', () => {
    expect(getStatusIcon('draft')).toBe(PencilIcon);
    expect(getStatusIcon('sent')).toBe(CheckCircleIcon);
  });
  
  it('provides tooltip text for each status', () => {
    expect(getStatusTooltip('draft')).toContain('edición');
  });
});

// tests/unit/utils/window-diagram-map.test.ts
describe('Window Diagram Fallback', () => {
  it('returns correct SVG path for French window', () => {
    expect(getWindowDiagram('french-2-panel')).toMatch(/french-2-panel\.svg$/);
  });
  
  it('falls back to default diagram for unknown type', () => {
    expect(getWindowDiagram('unknown' as any)).toMatch(/default\.svg$/);
  });
});

// tests/unit/export/pdf-generation.test.ts
describe('PDF Generation', () => {
  it('generates PDF with all required sections', async () => {
    const pdf = await generateQuotePDF(mockQuoteData);
    expect(pdf).toContain('header');
    expect(pdf).toContain('items table');
    expect(pdf).toContain('footer');
  });
  
  it('generates correct filename', () => {
    const filename = generateExportFilename({
      projectName: 'Casa Juan',
      date: new Date('2025-10-12'),
      format: 'pdf',
    });
    expect(filename).toBe('Cotizacion_Casa_Juan_2025-10-12.pdf');
  });
});
```

### Integration Tests (Vitest)

```typescript
// tests/integration/quote-export.test.ts
describe('Quote Export Server Actions', () => {
  it('exports PDF successfully', async () => {
    const result = await exportQuotePDF({ quoteId: 'test-123', format: 'pdf' });
    expect(result.success).toBe(true);
    expect(result.filename).toMatch(/\.pdf$/);
    expect(result.contentType).toBe('application/pdf');
  });
  
  it('validates empty quote', async () => {
    await expect(
      exportQuotePDF({ quoteId: 'empty-quote-id', format: 'pdf' })
    ).rejects.toThrow('No se puede exportar una cotización vacía');
  });
  
  it('includes images when requested', async () => {
    const result = await exportQuotePDF({ 
      quoteId: 'test-123', 
      format: 'pdf',
      includeImages: true 
    });
    // Assert PDF blob contains image data
  });
});
```

### E2E Tests (Playwright)

```typescript
// e2e/my-quotes/quote-export-pdf.spec.ts
test.describe('PDF Export Flow', () => {
  test('exports PDF with correct filename', async ({ page }) => {
    await page.goto('/my-quotes/test-quote-id');
    
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Exportar PDF")')
    ]);
    
    expect(download.suggestedFilename()).toMatch(/Cotizacion_.*_\d{4}-\d{2}-\d{2}\.pdf/);
    
    // Verify PDF content
    const path = await download.path();
    const pdfContent = await fs.readFile(path, 'utf-8');
    expect(pdfContent).toContain('Quote Items');
  });
  
  test('shows loading state during export', async ({ page }) => {
    await page.goto('/my-quotes/test-quote-id');
    await page.click('button:has-text("Exportar PDF")');
    
    await expect(page.locator('text=Generando PDF...')).toBeVisible();
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
  });
  
  test('prevents export of empty quote', async ({ page }) => {
    await page.goto('/my-quotes/empty-quote-id');
    await page.click('button:has-text("Exportar PDF")');
    
    await expect(page.locator('text=No se puede exportar una cotización vacía')).toBeVisible();
  });
});

// e2e/my-quotes/quote-status-clarity.spec.ts
test.describe('Status Label Clarity', () => {
  test('displays "En edición" for draft quotes', async ({ page }) => {
    await page.goto('/my-quotes');
    
    const draftBadge = page.locator('[data-testid="quote-status-badge"]:has-text("En edición")').first();
    await expect(draftBadge).toBeVisible();
    
    // Verify icon is present
    await expect(draftBadge.locator('svg')).toBeVisible();
  });
  
  test('shows tooltip on hover', async ({ page }) => {
    await page.goto('/my-quotes');
    
    const badge = page.locator('[data-testid="quote-status-badge"]').first();
    await badge.hover();
    
    await expect(page.locator('[role="tooltip"]')).toBeVisible();
    await expect(page.locator('[role="tooltip"]')).toContainText('edición');
  });
});

// e2e/my-quotes/quote-filters.spec.ts
test.describe('Quote Filtering', () => {
  test('filters by status', async ({ page }) => {
    await page.goto('/my-quotes');
    
    await page.selectOption('select[name="status"]', 'sent');
    
    // URL should update
    await expect(page).toHaveURL(/status=sent/);
    
    // Only sent quotes visible
    await expect(page.locator('text=Enviada al cliente')).toHaveCount(3);
    await expect(page.locator('text=En edición')).toHaveCount(0);
  });
  
  test('searches by project name', async ({ page }) => {
    await page.goto('/my-quotes');
    
    await page.fill('input[name="search"]', 'Casa Juan');
    
    // Debounced - wait for URL update
    await expect(page).toHaveURL(/search=Casa\+Juan/);
    
    // Only matching quotes visible
    await expect(page.locator('h3:has-text("Casa Juan")')).toHaveCount(1);
  });
});
```

### Contract Tests

```typescript
// tests/contract/export-actions.contract.ts
describe('Export Server Action Contracts', () => {
  it('validates input schema', () => {
    expect(() => exportQuoteInputSchema.parse({
      quoteId: 'invalid',  // Not a CUID2
      format: 'pdf'
    })).toThrow();
    
    expect(() => exportQuoteInputSchema.parse({
      quoteId: 'cm0abc123',
      format: 'csv'  // Invalid format
    })).toThrow();
  });
  
  it('validates output schema', () => {
    const validOutput = {
      success: true,
      filename: 'quote.pdf',
      data: new Blob(),
      contentType: 'application/pdf'
    };
    
    expect(() => exportQuoteOutputSchema.parse(validOutput)).not.toThrow();
  });
});
```

---

## Phase 4: Deployment & Monitoring

### Pre-Deployment Checklist

- [ ] All unit tests passing (100% coverage on utilities)
- [ ] All integration tests passing
- [ ] All E2E tests passing (Playwright CI)
- [ ] Performance benchmarks meet targets (<10s export, <2s page load)
- [ ] Accessibility audit passed (WCAG AA for status badges, images)
- [ ] SVG diagrams created for all window types
- [ ] Environment variables configured (logo URL, company name)
- [ ] Error handling tested (empty quotes, network failures)

### Monitoring Plan

**Metrics to Track**:
1. **Export Success Rate**: Track % of successful PDF/Excel exports
2. **Export Generation Time**: P50, P95, P99 latencies
3. **Status Comprehension**: Measure reduction in support tickets about "Borrador"
4. **Filter Usage**: Track which filters are most used
5. **Image Load Failures**: Track fallback diagram usage rate

**Logging**:
```typescript
// Example structured log for export
logger.info('Quote export initiated', {
  quoteId,
  format,
  itemCount,
  includeImages,
  userId,
});

logger.info('Quote export completed', {
  quoteId,
  format,
  duration: Date.now() - startTime,
  fileSize,
});

logger.error('Quote export failed', {
  quoteId,
  format,
  error: error.message,
  stack: error.stack,
});
```

### Rollback Plan

**If issues arise**:
1. Feature flags for export buttons (disable PDF/Excel independently)
2. Revert to old status labels via config
3. Fallback diagrams can be disabled (show placeholder instead)
4. Filters can be hidden without breaking page functionality

**Each feature is independently toggleable** without full rollback.

---

## Dependencies & Prerequisites

### NPM Packages to Install

```bash
# PDF generation
pnpm add @react-pdf/renderer

# Excel generation
pnpm add exceljs

# Additional icons for status badges (if not already available)
# lucide-react already installed - verify we have: Pencil, CheckCircle, X, Clock

# Type definitions
pnpm add -D @types/node  # Blob type support
```

### Environment Variables

Add to `.env`:
```bash
# Export Configuration
NEXT_PUBLIC_COMPANY_NAME="Glasify"
NEXT_PUBLIC_COMPANY_LOGO_URL="/logo.png"  # Or CDN URL
EXPORT_PDF_PAGE_SIZE="letter"  # or "a4"
EXPORT_MAX_ITEMS=100  # Limit for performance
```

### External Dependencies

- **CDN for Product Images**: Ensure image URLs work or fallback gracefully
- **Font Files for PDF**: If using custom fonts, add to `public/fonts/`
- **SVG Diagrams**: Create in Figma/Illustrator, export to `public/diagrams/windows/`

### Database Prerequisites

**None** - No schema changes required. Existing `Quote` and `QuoteItem` tables have all necessary fields.

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| PDF generation takes >10s | High - Poor UX | Benchmark early, optimize (remove images option, pagination) |
| Excel formulas break in Google Sheets | Medium - Excel-only users | Test in both Excel and Sheets, use compatible formula syntax |
| Window diagrams don't cover all types | Medium - Fallback to generic | Create generic "window" diagram as ultimate fallback |
| Image CDN slow/unavailable | Medium - Slow page loads | Implement aggressive lazy loading, timeout for image loads |
| Export file too large | Low - Download issues | Compress images, limit PDF resolution, add file size warning |
| Status labels still confusing | High - Defeats purpose | A/B test with users, iterate on wording before full rollout |

---

## Success Metrics (from Spec)

Recall from specification:

- **SC-001**: 90% users identify status meaning without help
- **SC-002**: Visual product ID in <3 seconds
- **SC-003**: Export generation <10 seconds (50 items)
- **SC-004**: 95% export success rate on first try
- **SC-005**: 80% reduction in "Borrador" support tickets
- **SC-006**: View→Export flow <1 minute
- **SC-007**: Zero exports with missing critical info
- **SC-008**: Find quote with search <20 seconds (20+ quotes)

**Measurement Plan**:
- Pre-launch user testing for SC-001, SC-002
- Performance monitoring for SC-003, SC-006
- Analytics tracking for SC-004
- Support ticket tracking for SC-005
- Automated validation for SC-007
- User testing for SC-008

---

## Next Steps

1. **Review this plan** with team for feedback
2. **Run `/speckit.plan`** (if available) to generate Phase 0 research tasks
3. **Create proof-of-concept** for PDF/Excel export (research phase)
4. **Design SVG diagram library** (5-10 initial window types)
5. **Run `/speckit.tasks`** to generate detailed task breakdown
6. **Start with P1 tasks** (Status Labels + Images) for immediate value

---

**Plan Status**: ✅ Ready for Phase 0 Research

**Estimated Timeline**:
- Phase 0 (Research): 2-3 days
- Phase 1 (Design): 2-3 days
- Phase 2 (Implementation): 10-15 days (split into 4 deployable phases)
- Phase 3 (Testing): 3-5 days (concurrent with implementation)
- **Total**: ~3-4 weeks for full feature set

**MVP (Status + Images only)**: ~1 week
