# Feature Specification: Budget Cart Workflow with Authentication

**Feature Branch**: `002-budget-cart-workflow`  
**Created**: 2025-10-09  
**Status**: Draft  
**Input**: User description: "budget cart workflow with authentication and quote generation"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add configured window to budget cart (Priority: P1)

A user browses the catalog, selects a window model, configures dimensions, glass type, solution, and services, then adds the configured window to their budget cart. They can add the same model multiple times with different configurations.

**Why this priority**: This is the core value proposition - enabling users to build a multi-item budget before requesting a quote. Without this, users cannot create meaningful budgets.

**Independent Test**: Can be fully tested by configuring a model in the existing form and clicking "Add to Cart" button. Delivers value by allowing users to accumulate multiple window configurations without authentication.

**Acceptance Scenarios**:

1. **Given** a user is on a model detail page with the configuration form, **When** they complete all required fields (dimensions, glass type) and click "Add to Cart", **Then** the configured window is added to the cart with an auto-generated name (model prefix + sequential number, e.g., "VEKA-001") and the form resets for another configuration
2. **Given** a user has already added one window configuration to cart, **When** they configure the same model with different dimensions and add to cart again, **Then** both configurations appear in the cart as separate items with different sequential names (e.g., "VEKA-001", "VEKA-002")
3. **Given** a user has configured a window but cart is empty, **When** they add to cart, **Then** a cart summary widget appears showing 1 item and total estimated price
4. **Given** a user has items in cart, **When** they view the cart, **Then** each item displays: auto-generated name (editable), model name, dimensions, glass type, selected services, unit price, and subtotal for quantity

---

### User Story 2 - Review and manage cart items (Priority: P2)

A user can view all items in their budget cart, edit item names for clarity, adjust quantities, remove items, and see updated totals in real-time.

**Why this priority**: Essential for usability - users need to review and refine their budget before requesting a quote. This builds confidence and reduces errors.

**Independent Test**: Can be tested by adding multiple items to cart and performing edit/delete operations. Delivers value by giving users control over their budget composition.

**Acceptance Scenarios**:

1. **Given** a user has 3 items in cart, **When** they access the cart page, **Then** all items are displayed in a table with columns: name, model, dimensions, glass type, services, quantity, unit price, subtotal
2. **Given** a user is viewing cart, **When** they click edit on an item's auto-generated name (e.g., "VEKA-001"), **Then** an inline input appears allowing them to rename it (e.g., "Ventana Sala Principal")
3. **Given** a user has edited an item name, **When** they save the change, **Then** the new name persists and is displayed in the cart
4. **Given** a user is viewing cart, **When** they adjust the quantity of an item, **Then** the subtotal and cart total update immediately
5. **Given** a user is viewing cart, **When** they click remove on an item, **Then** the item is deleted from cart and totals recalculate
6. **Given** a user's cart is empty, **When** they access the cart page, **Then** they see an empty state message with a link to browse catalog

---

### User Story 3 - Authenticate before quote generation (Priority: P1)

When a user is ready to convert their cart to a formal quote, the system requires Google authentication if not already logged in. Authentication is mandatory for quote generation but not for browsing or adding to cart.

**Why this priority**: Critical for quote tracking and user management. Without authentication, we cannot associate quotes with users or provide quote history access.

**Independent Test**: Can be tested by attempting to generate a quote without being logged in - system redirects to Google OAuth, then returns to quote generation flow. Delivers value by ensuring quote ownership and access control.

**Acceptance Scenarios**:

1. **Given** a user has items in cart and is not authenticated, **When** they click "Generate Quote" button, **Then** they are redirected to Google OAuth sign-in page
2. **Given** a user completes Google authentication, **When** OAuth succeeds, **Then** user is redirected back to the quote generation flow with their cart intact
3. **Given** a user is already authenticated, **When** they click "Generate Quote", **Then** they proceed directly to address input step without re-authentication
4. **Given** a user attempts to access the "My Quotes" page without authentication, **When** they navigate to the page, **Then** they are redirected to Google sign-in first

---

### User Story 4 - Provide project address and generate quote (Priority: P1)

An authenticated user provides the project address/location and generates a formal quote with 15-day validity. The quote locks in current prices and configurations.

**Why this priority**: Completes the core workflow - converting a cart to a trackable, time-bound quote. This is the deliverable users need to proceed with their project.

**Independent Test**: Can be tested by authenticating, providing an address, and generating a quote. Delivers value by creating a formal document with pricing and validity period.

**Acceptance Scenarios**:

1. **Given** an authenticated user clicks "Generate Quote", **When** the quote generation form appears, **Then** they see fields for project address (street, city, state/province, postal code) and an optional project name
2. **Given** a user submits the quote generation form with valid address, **When** the quote is created, **Then** a quote record is saved with status "draft", validUntil date = today + 15 days, total calculated from cart items, and associated with the authenticated user
3. **Given** a quote is generated, **When** the user views the quote, **Then** all cart items are converted to QuoteItems with their configured names, dimensions, glass types, and services preserved
4. **Given** a quote is generated successfully, **When** the process completes, **Then** the user's cart is emptied and they are redirected to the quote detail page showing the generated quote
5. **Given** a user tries to generate a quote without providing required address fields, **When** they submit, **Then** validation errors are displayed and quote is not created

---

### User Story 5 - Access and view quote history (Priority: P2)

Authenticated users can access a "My Quotes" page to view all their generated quotes, sorted by date, with status and validity information.

**Why this priority**: Important for user retention and quote management, but secondary to quote creation. Users need to track multiple quotes over time.

**Independent Test**: Can be tested by generating multiple quotes and accessing the quotes list page. Delivers value by providing historical access and quote comparison.

**Acceptance Scenarios**:

1. **Given** an authenticated user has generated 3 quotes, **When** they navigate to "My Quotes" page, **Then** all 3 quotes are listed in reverse chronological order (newest first)
2. **Given** a user is viewing their quotes list, **When** they see each quote row, **Then** it displays: quote ID/name, creation date, total amount, status, validity end date, and a "View" action
3. **Given** a user's quote validity period has expired, **When** they view the quotes list, **Then** expired quotes are visually differentiated (e.g., grayed out or labeled "Expired")
4. **Given** a user clicks "View" on a quote, **When** the quote detail page loads, **Then** they see all items, prices, project address, creation date, and validity information
5. **Given** a user has never generated a quote, **When** they access "My Quotes" page, **Then** they see an empty state message with a link to browse catalog

---

### Edge Cases

- What happens when a user's session expires during cart building? Cart should persist in localStorage or session storage until quote generation requires re-authentication
- What happens if prices change between adding items to cart and generating the quote? Quote should lock in prices at the moment of generation, not at cart add time
- What happens when a user adds the same configuration twice? System allows it but assigns different sequential names (e.g., "VEKA-001", "VEKA-002")
- What happens if a user tries to generate a quote with an empty cart? System should prevent quote generation and show validation message
- What happens when network fails during quote generation? System should show error message and preserve cart data for retry
- What happens when a user logs in with Google but cancels the OAuth flow? User returns to the cart page with items intact, can retry later
- What happens when two users are authenticated on same browser? Each user's cart and quotes should be isolated by user session

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an "Add to Cart" button in the model configuration form (existing form in `src/app/(public)/catalog/[modelId]/_components/form/`)
- **FR-002**: System MUST auto-generate sequential item names using model prefix + number format (e.g., model "VEKA" generates "VEKA-001", "VEKA-002")
- **FR-003**: System MUST allow users to add the same model multiple times with different configurations to the cart
- **FR-004**: System MUST display a cart summary widget showing item count and total price when cart has items
- **FR-005**: System MUST provide a cart page (`/cart`) displaying all items with: name (editable), model, dimensions, glass type, services, quantity, unit price, and subtotal
- **FR-006**: System MUST allow users to edit item names inline in the cart
- **FR-007**: System MUST allow users to adjust quantities for cart items with real-time total recalculation
- **FR-008**: System MUST allow users to remove items from cart
- **FR-009**: System MUST require Google OAuth authentication before allowing quote generation
- **FR-010**: System MUST redirect unauthenticated users to Google sign-in when they attempt to generate a quote
- **FR-011**: System MUST redirect authenticated users back to quote generation flow after successful OAuth
- **FR-012**: System MUST prevent access to "My Quotes" page for unauthenticated users
- **FR-013**: System MUST provide a quote generation form requiring project address (street, city, state/province, postal code) and optional project name
- **FR-014**: System MUST create Quote records with status "draft", validUntil = createdAt + 15 days, total calculated from cart items, and userId from authenticated session
- **FR-015**: System MUST convert all cart items to QuoteItem records preserving names, configurations, and calculations
- **FR-016**: System MUST empty the cart after successful quote generation
- **FR-017**: System MUST provide a "My Quotes" page (`/quotes`) listing all quotes for authenticated user, sorted newest first
- **FR-018**: System MUST display quote list with: ID/name, creation date, total, status, validity date, and "View" action
- **FR-019**: System MUST visually differentiate expired quotes (validUntil < today) in the quotes list
- **FR-020**: System MUST provide a quote detail page showing all items, prices, address, creation date, and validity
- **FR-021**: System MUST validate required address fields before creating quote
- **FR-022**: System MUST persist cart data during authentication redirects (using session storage or server-side session)
- **FR-023**: System MUST prevent quote generation when cart is empty

### Key Entities

- **CartItem**: Temporary storage for configured window before quote generation. Attributes: id, modelId, glassTypeId, solutionId (optional), widthMm, heightMm, quantity, additionalServiceIds, name (editable, defaults to model prefix + sequence), unitPrice (calculated), subtotal (calculated). Lifetime: session-based, cleared after quote generation.

- **Quote**: Formal quote document with time-bound validity. Attributes: id, userId, manufacturerId, status (draft/sent/canceled), currency, total, validUntil (createdAt + 15 days), projectAddress (street/city/state/postal), projectName (optional), contactPhone (from User), createdAt. Relationships: belongs to User, has many QuoteItems. Already exists in Prisma schema.

- **QuoteItem**: Individual window configuration within a quote. Attributes: id, quoteId, modelId, glassTypeId, name (from CartItem), widthMm, heightMm, quantity, accessoryApplied (boolean), subtotal, createdAt. Relationships: belongs to Quote, references Model and GlassType. Already exists in Prisma schema.

- **User**: Authenticated user via Google OAuth. Already exists in schema. Additional usage: owner of Quotes, required for accessing quote history.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can add multiple window configurations to cart and generate a quote in under 5 minutes from first model selection
- **SC-002**: 95% of users successfully complete Google authentication on first attempt without errors
- **SC-003**: Cart data persists across authentication redirects with 100% accuracy (no item loss)
- **SC-004**: Users can edit item names and adjust quantities with real-time price updates appearing in under 500ms
- **SC-005**: Quote generation succeeds with correct 15-day validity calculation for 100% of valid submissions
- **SC-006**: Authenticated users can access their quote history and view all previously generated quotes
- **SC-007**: System prevents unauthenticated access to quote generation and quote history with clear authentication prompts

## Assumptions

- Google OAuth is already configured and working (AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET environment variables exist)
- NextAuth.js session management is functional for user authentication
- Cart data will persist client-side using browser sessionStorage (cleared on browser close) with fallback to localStorage for longer persistence if needed
- Price calculations use existing tRPC procedure `catalog.calculate-price` which is already implemented
- Model prefix for item naming will be extracted from the first word of the model name (e.g., "VEKA Premium" → "VEKA")
- Sequential numbering resets per model type (each model has its own sequence)
- The existing form in `src/app/(public)/catalog/[modelId]/_components/form/` will be extended, not replaced
- Quote generation will use manufacturer's default validity days (15) from the Manufacturer record in database

## Data Model Changes Required

The following schema changes will be needed to support this feature (to be implemented in planning phase):

### Quote Model Extensions
- Add `projectName` field (String?, optional) - User-friendly name for the project/quote
- Add `projectStreet` field (String?) - Street address of project location
- Add `projectCity` field (String?) - City of project location  
- Add `projectState` field (String?) - State/province of project location
- Add `projectPostalCode` field (String?) - Postal/ZIP code of project location
- **Note**: Current `contactAddress` field will be deprecated in favor of structured address fields

### QuoteItem Model Extensions  
- Add `name` field (String) - User-editable name for the item (defaults to model prefix + sequence)
- Add `quantity` field (Int, default 1) - Number of units for this configuration
- **Note**: Current schema has widthMm/heightMm but no quantity field

### Model Prefix
- No schema change needed - prefix extraction will be handled in application logic from existing `Model.name` field

