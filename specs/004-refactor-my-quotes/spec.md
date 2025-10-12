# Feature Specification: My Quotes UX Redesign

**Feature Branch**: `004-refactor-my-quotes`  
**Created**: 2025-10-12  
**Status**: Draft  
**Input**: User description: "Refactor My Quotes view to improve UX clarity and add export functionality"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Understanding Quote Status at a Glance (Priority: P1)

Users view their quotes list and immediately understand what each status means and what actions they can take next, without confusion about terms like "Borrador" (Draft).

**Why this priority**: This is the primary pain point identified - users are confused by the "Borrador" label and don't know what it means or what to do next. This affects every user interaction with the quotes list.

**Independent Test**: Can be fully tested by viewing the quotes list and verifying that all status labels are self-explanatory, with visual cues and contextual help that makes the next action obvious.

**Acceptance Scenarios**:

1. **Given** a user has quotes in different statuses, **When** they view the quotes list, **Then** each quote displays a clear, self-explanatory status label with an icon that indicates its meaning
2. **Given** a quote has "draft" status, **When** the user sees it in the list, **Then** the status shows "En edición" (In Progress) with an edit icon and a clear call-to-action button to continue editing
3. **Given** a quote has "sent" status, **When** the user sees it in the list, **Then** the status shows "Enviada al cliente" (Sent to Client) with a checkmark icon
4. **Given** a quote is expired, **When** the user sees it in the list, **Then** it displays a clear "Expirada" badge with a visual indicator (reduced opacity) and explanation
5. **Given** a user hovers over a status badge, **When** the tooltip appears, **Then** it explains what the status means and suggests next actions

---

### User Story 2 - Visualizing Quote Items with Product Images (Priority: P1)

Users see visual representations of their quoted items (windows, doors) with product images to quickly identify what's in each quote.

**Why this priority**: Visual recognition is faster than reading text. Users need to quickly scan their quotes and identify products visually, especially when comparing multiple quotes or looking for a specific window configuration.

**Independent Test**: Can be tested by viewing quote details and verifying that each item displays a representative image (fallback image showing window configuration if product image unavailable).

**Acceptance Scenarios**:

1. **Given** a user views quote details, **When** the items list loads, **Then** each item displays a thumbnail image showing the product or window configuration
2. **Given** a quote item has a window configuration, **When** no product photo is available, **Then** a fallback diagram shows the window type (French window, sliding window, etc.) with the correct number of panels
3. **Given** a user clicks on an item thumbnail, **When** the enlarged view opens, **Then** it shows the full image with dimensions and specifications overlay
4. **Given** multiple items with the same model, **When** displayed in the list, **Then** they show the same product image for visual consistency
5. **Given** a quote item list with images, **When** the user scans the list, **Then** they can identify different product types in under 3 seconds without reading text

---

### User Story 3 - Exporting Quotes for Sharing and Archival (Priority: P2)

Users export their quotes in multiple formats (PDF, Excel) to share with contractors, clients, or for their own records.

**Why this priority**: Users need to share quotes with others who may not have access to the system. This is essential for business workflows but secondary to understanding existing quotes.

**Independent Test**: Can be tested by clicking export buttons and verifying that generated files contain all quote information in the expected format.

**Acceptance Scenarios**:

1. **Given** a user is viewing quote details, **When** they click the "Exportar PDF" button, **Then** a professionally formatted PDF downloads with all quote information, items, prices, and company branding
2. **Given** a user is viewing quote details, **When** they click the "Exportar Excel" button, **Then** an Excel file downloads with items in a structured table format suitable for further analysis
3. **Given** a user exports a quote to PDF, **When** the PDF opens, **Then** it includes the product images/diagrams for each item
4. **Given** a user wants to share a quote, **When** they click the share button, **Then** they see options to export PDF, export Excel, or copy a shareable link
5. **Given** a quote is exported, **When** the file is generated, **Then** the filename includes the project name and date (e.g., "Cotizacion_Casa_Juan_2025-10-12.pdf")

---

### User Story 4 - Quick Quote Comparison and Filtering (Priority: P3)

Users filter and compare multiple quotes to make informed decisions about their projects.

**Why this priority**: This enhances usability but is not critical for basic quote viewing and management. Users can work without this feature but it improves efficiency.

**Independent Test**: Can be tested by applying filters and verifying that only relevant quotes appear in the list.

**Acceptance Scenarios**:

1. **Given** a user has many quotes, **When** they use the status filter dropdown, **Then** only quotes matching the selected status are displayed
2. **Given** a user wants to find recent quotes, **When** they sort by date (newest/oldest), **Then** quotes reorder accordingly
3. **Given** a user searches for a project, **When** they type in the search box, **Then** quotes are filtered by project name, address, or item names
4. **Given** a user views quotes in list view, **When** they switch to grid view, **Then** quotes display as cards with key information visible

---

### Edge Cases

- What happens when a quote has no items (empty quote)?
  - Display message "Esta cotización no tiene items todavía" with action to add items
- What happens when a quote has many items (50+ windows)?
  - Paginate items in the detail view (show 20 per page with "Ver más" button)
- What happens when image loading fails for a product?
  - Show fallback window diagram based on window type (French, sliding, etc.)
- What happens when user tries to export a quote with no items?
  - Show validation message "No se puede exportar una cotización vacía"
- What happens when export generation takes too long?
  - Show loading state with progress indicator; allow cancellation after 30 seconds
- What happens when user has no quotes at all?
  - Show empty state with illustration and call-to-action to browse catalog

## Requirements *(mandatory)*

### Functional Requirements

#### Status Clarity & Labeling

- **FR-001**: System MUST replace confusing status labels with self-explanatory, action-oriented labels in Spanish:
  - "draft" → "En edición" (In Progress)
  - "sent" → "Enviada al cliente" (Sent to Client)
  - "canceled" → "Cancelada" (Canceled)
  
- **FR-002**: System MUST display status-specific icons alongside labels:
  - "En edición" → Edit/Pencil icon
  - "Enviada al cliente" → Checkmark/Send icon
  - "Cancelada" → X/Cancel icon
  - "Expirada" → Clock/Warning icon

- **FR-003**: System MUST show contextual tooltips on status badges explaining what the status means and suggesting next actions

- **FR-004**: System MUST display clear call-to-action buttons based on quote status:
  - Draft quotes → "Continuar editando" button
  - Sent quotes → "Ver detalles" button
  - Expired quotes → "Crear nueva versión" button

#### Visual Product Representation

- **FR-005**: System MUST display thumbnail images for each quote item in the details view (minimum 120x120px, maximum 200x200px)

- **FR-006**: System MUST use fallback window/door diagrams when product images are unavailable, showing:
  - Window type (French, sliding, fixed, etc.)
  - Number of panels/sections
  - Opening direction indicators

- **FR-007**: System MUST allow users to click on item thumbnails to view enlarged images with specifications overlay

- **FR-008**: System MUST display product images in the items table with responsive sizing (larger on desktop, smaller on mobile)

#### Export Functionality

- **FR-009**: System MUST provide PDF export with professional formatting including:
  - Company logo and branding
  - Quote header with project name, date, and quote number
  - Items table with images, descriptions, quantities, and prices
  - Total amount with tax breakdown
  - Footer with validity period and terms

- **FR-010**: System MUST provide Excel export with structured data including:
  - Separate sheets for quote summary and items detail
  - Formulas for totals and subtotals
  - Formatted cells for currency and dates

- **FR-011**: System MUST generate filenames for exports following pattern: "Cotizacion_{ProjectName}_{YYYY-MM-DD}.{extension}"

- **FR-012**: System MUST show export options in quote detail view with clear icons (PDF icon, Excel icon)

- **FR-013**: System MUST display loading state during export generation with progress indication

- **FR-014**: System MUST prevent export of quotes with zero items (validation message)

#### Filtering & Search

- **FR-015**: System MUST provide status filter dropdown with options: "Todas", "En edición", "Enviadas", "Canceladas"

- **FR-016**: System MUST provide search field to filter quotes by project name, address, or item names

- **FR-017**: System MUST provide sort options: "Más recientes", "Más antiguas", "Mayor valor", "Menor valor"

- **FR-018**: System MUST preserve filter and sort selections in URL parameters for shareable links

#### Improved Item Display

- **FR-019**: System MUST show item previews in quote list view (first 3 items with thumbnails)

- **FR-020**: System MUST display item count with icon in quote list cards

- **FR-021**: System MUST group items by window type or room in detail view

- **FR-022**: System MUST show item dimensions with visual scale indicator (small/medium/large window icon)

### Key Entities *(include if feature involves data)*

- **Quote**: User's quotation request with status, dates, project info, and total amount. Relationships: has many QuoteItems, belongs to User and Manufacturer.

- **QuoteItem**: Individual item in a quote with model reference, dimensions, quantity, prices. Relationships: belongs to Quote, references Model, GlassType, GlassSolution.

- **Model**: Product model with name, description, base pricing. Relationships: has many QuoteItems, belongs to Manufacturer.

- **QuoteStatus**: Enum representing quote lifecycle state (draft/sent/canceled). Current values cause user confusion.

- **ExportFormat**: Enum for export file types (PDF/Excel). Determines export generation strategy.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify quote status meaning without external help in 90% of cases (measured by user testing and reduction in status-related support tickets)

- **SC-002**: Users can visually identify quoted products (window types) in under 3 seconds when scanning the items list (measured by time-to-task completion in usability testing)

- **SC-003**: Quote export generation completes in under 10 seconds for quotes with up to 50 items (measured by performance monitoring)

- **SC-004**: Users successfully export quotes to PDF or Excel on first attempt in 95% of cases (measured by analytics tracking export success rate)

- **SC-005**: Support tickets related to "What does 'Borrador' mean?" reduce by 80% within first month after deployment (measured by support ticket categorization)

- **SC-006**: Users complete the full flow from viewing quotes to exporting in under 1 minute (measured by session analytics and task completion time)

- **SC-007**: Zero quotes are exported with missing critical information (quote number, project name, items, totals) - measured by export validation checks

- **SC-008**: Users can find specific quotes using search/filters in under 20 seconds when they have 20+ quotes (measured by time-to-task completion)

## Assumptions *(mandatory)*

- Users access the quotes view from desktop browsers primarily, with mobile as secondary use case
- Product images will be added to the database incrementally; fallback diagrams will be needed for existing data
- Export generation happens synchronously (user waits) rather than asynchronously (email delivery)
- PDF exports will use standard US Letter or A4 page size based on user locale
- Excel exports target Microsoft Excel 2016+ and Google Sheets compatibility
- Quote data structure (schema) remains unchanged; only presentation layer is refactored
- Users have basic familiarity with Spanish business terminology (cotización, presupuesto, etc.)
- Export files are downloaded directly to user's browser (no cloud storage integration required in this phase)
- Company branding (logo, colors) for PDF exports is configured globally in application settings
- Window diagrams for fallbacks follow standard industry iconography (ANSI/CSI standards for architectural symbols)

## Out of Scope *(mandatory)*

- Duplicate quote functionality (creating copies of existing quotes)
- Email sharing integration (sending quotes via email from the app)
- Quote versioning system (tracking changes over time)
- Collaborative editing (multiple users editing same quote)
- Real-time pricing updates (prices remain locked when quote is created)
- Integration with external quoting/estimation tools
- Customizable PDF templates (single standard template for all users)
- Batch export functionality (exporting multiple quotes at once)
- Quote comparison side-by-side view
- Advanced analytics and reporting on quote metrics
- Integration with CRM systems
- Mobile-specific UI optimizations (responsive design sufficient for now)
- Offline access to quotes (requires internet connection)

## Dependencies *(mandatory)*

- PDF generation library must support header/footer, tables, and image embedding
- Excel generation library must support formulas and cell formatting
- Product image storage and CDN for serving thumbnails efficiently
- Window diagram SVG assets for fallback images (French window, sliding window, fixed window, etc.)
- Company branding assets (logo in vector format, brand color definitions)
- Existing tRPC procedures for fetching quote data remain stable
- Database schema includes necessary fields for export (quote number, project details, validity period)

## Non-Functional Requirements *(optional)*

### Performance

- Quote list page loads in under 2 seconds with 50 quotes
- Quote detail page loads in under 1.5 seconds with 30 items
- Thumbnail images lazy-load as user scrolls
- Export generation completes in under 10 seconds for standard quotes (up to 50 items)

### Accessibility

- Status badges have sufficient color contrast (WCAG AA minimum)
- Status icons have accessible labels for screen readers
- Keyboard navigation works for all export actions
- Focus states are clearly visible on interactive elements
- Image alt texts describe window configurations for screen readers

### Usability

- Status labels use familiar, everyday Spanish terminology
- Export buttons use recognizable icons (PDF document icon, Excel spreadsheet icon)
- Loading states provide clear feedback during export generation
- Error messages are specific and actionable (e.g., "La cotización debe tener al menos un item para exportar")

### Security

- Export generation is rate-limited to prevent abuse (max 10 exports per user per hour)
- Exported files do not contain sensitive internal data (cost breakdowns, profit margins)
- Users can only export quotes they own or have permission to access

## UI/UX Guidelines *(optional)*

### Visual Design Principles

Apply "Don't Make Me Think" principles throughout:

1. **Self-evident status indicators**: Use color + icon + text together, not relying on color alone
2. **Obvious clickability**: Export buttons should look clearly clickable with sufficient size and contrast
3. **Immediate feedback**: Show loading states, success confirmations, and error messages inline
4. **Clear visual hierarchy**: Most important actions (export, view details) are visually prominent
5. **Scannable layouts**: Use white space, grouping, and visual rhythm to make content easy to scan

### Status Badge Design

- **En edición** (Draft): Blue/cyan badge with pencil icon
- **Enviada al cliente** (Sent): Green badge with checkmark icon
- **Cancelada** (Canceled): Red badge with X icon
- **Expirada** (Expired): Orange/yellow badge with clock icon

### Item Thumbnail Display

- Grid layout for items (3-4 columns on desktop, 1-2 on mobile)
- Consistent aspect ratio for all thumbnails (1:1 or 4:3)
- Subtle border or shadow to separate images from background
- Hover effect to indicate images are clickable for enlarged view

### Export Button Placement

- Primary position: Top-right of quote detail view, next to quote title
- Secondary position: Bottom of quote detail view after items table
- Button styling: Use primary button variant for PDF (most common), outline variant for Excel
- Group export options together with label "Exportar:"

## Technical Guidance *(optional - for planning phase)*

*Note: This section provides hints for implementation planning but does NOT dictate specific technologies or code structure.*

### PDF Generation Considerations

- Include page numbers and quote metadata in footer
- Ensure tables handle page breaks gracefully (avoid splitting item rows)
- Embed images at appropriate resolution (72-150 DPI for screen viewing)
- Consider including QR code linking to online quote view

### Excel Export Considerations

- Use first row for column headers with bold formatting
- Apply currency formatting to price columns
- Include formulas for subtotals and totals (not just values)
- Freeze first row for easier scrolling in large quotes

### Image Fallback Strategy

- Define fallback diagram for each window configuration type (enum or lookup table)
- SVG format for fallbacks (scalable, small file size)
- Pre-generate fallback images rather than creating on-the-fly
- Consider showing window dimensions overlaid on diagram

### Performance Optimization Hints

- Thumbnail images should be pre-generated in appropriate sizes (avoid browser resizing)
- Lazy-load images below the fold
- Consider pagination for quotes with 30+ items
- Cache export generation results for 5 minutes (same quote exported multiple times)

