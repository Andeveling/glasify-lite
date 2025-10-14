# Feature Specification: Enhanced Catalog Model Sidebar Information

**Feature Branch**: `007-enhanced-catalog-model`  
**Created**: 2025-10-14  
**Status**: Draft  
**Input**: User description: "ahora yo como usuario de el catalogo donde configuro mi modelo de ventana http://localhost:3000/catalog/cmgpu1gfv00125ip736s2tnfm quiero que el side bar me muestre informacion relevante que pueda ayudarme a tomar una buena desicion, quiero ver que caracteristicas tiene el modelo / serie de ventanas que estoy eligiendo, los fabricantes de los perfiles por ejemplo en la doc que te comparti"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Technical Specifications (Priority: P1)

A user browsing the catalog needs to understand the technical capabilities of a window model before requesting a quote. They want to see key specifications like material type, profile series, thermal/acoustic insulation ratings, and dimensional limits displayed in the sidebar while configuring their window.

**Why this priority**: This is the core value proposition. Without technical specs, users cannot make informed decisions about window performance characteristics, which is critical for residential and commercial projects.

**Independent Test**: Navigate to any model detail page (e.g., `/catalog/[modelId]`), verify that the sidebar displays technical specifications including material type, profile series, insulation ratings, and dimensional constraints. This delivers immediate value by helping users understand product capabilities.

**Acceptance Scenarios**:

1. **Given** a user is on a model detail page, **When** they view the sidebar, **Then** they see a "Especificaciones Técnicas" card displaying material type (PVC/Aluminum), profile series name, thermal insulation rating, acoustic insulation rating, and opening mechanism type
2. **Given** a user views technical specifications, **When** the model has specific performance ratings (e.g., water resistance class 6, air permeability class 5), **Then** these ratings are displayed with user-friendly labels and icons
3. **Given** a user is comparing different models, **When** they switch between model pages, **Then** the technical specifications update to reflect the currently selected model

---

### User Story 2 - Understand Profile Supplier Details (Priority: P1)

A user wants to know which profile supplier manufactures the window system (e.g., Deceuninck, REHAU, Alumina) and understand the supplier's reputation and material characteristics. This information is displayed prominently in the sidebar with supplier logo and brief description.

**Why this priority**: Profile supplier is a critical decision factor for customers who have brand preferences or need to match existing installations. This is essential information for informed purchasing.

**Independent Test**: View a model detail page, verify that the sidebar shows the profile supplier name, logo, material type, and a brief description of the supplier's characteristics. Users can make supplier-based decisions independently of other features.

**Acceptance Scenarios**:

1. **Given** a user is viewing a model with an assigned profile supplier, **When** they check the sidebar, **Then** they see a "Proveedor de Perfiles" card showing supplier name, material type (PVC/Aluminum), and key supplier characteristics
2. **Given** a model has no assigned profile supplier, **When** the user views the sidebar, **Then** they see "Proveedor no especificado" instead of incomplete information
3. **Given** a user wants supplier details, **When** they view the supplier card, **Then** they see material-specific benefits (e.g., for PVC: thermal insulation, low maintenance; for Aluminum: structural strength, modern aesthetics)

---

### User Story 3 - Review Product Features and Benefits (Priority: P2)

A user wants to understand the practical benefits and features of the window model beyond raw technical specs. They need to see what makes this model suitable for their project (e.g., "Ideal para climas fríos", "Alta reducción de ruido exterior", "Bajo mantenimiento").

**Why this priority**: While technical specs are important, practical benefits help users connect product capabilities to their specific needs. This bridges the gap between data and decision-making.

**Independent Test**: Navigate to a model page, verify that the sidebar displays a "Características Destacadas" section with 4-8 feature bullets describing practical benefits. Users understand product value proposition independently.

**Acceptance Scenarios**:

1. **Given** a user is evaluating a model, **When** they scroll to the features section in the sidebar, **Then** they see 4-8 bullet points describing key benefits and use cases
2. **Given** a model has specific strengths (e.g., high acoustic insulation rating > 40dB), **When** features are displayed, **Then** relevant benefits are highlighted (e.g., "Excelente aislamiento acústico - Reduce el ruido exterior significativamente")
3. **Given** a user wants to understand suitability, **When** they read features, **Then** they see use-case oriented descriptions (e.g., "Ideal para viviendas cerca de vías principales" for high acoustic models)

---

### User Story 4 - Access Dimensional Guidelines (Priority: P2)

A user configuring custom dimensions needs quick reference to minimum and maximum width/height constraints while filling out the quote form. The sidebar displays these limits in a clear, scannable format.

**Why this priority**: Dimensional constraints prevent users from requesting invalid configurations. Having this information visible while configuring saves time and reduces frustration from validation errors.

**Independent Test**: View a model detail page, verify the sidebar shows a "Dimensiones Permitidas" card with min/max width and height in millimeters. Users can validate their requirements before form submission.

**Acceptance Scenarios**:

1. **Given** a user is entering custom dimensions in the quote form, **When** they check the sidebar, **Then** they see minimum and maximum width and height values clearly labeled
2. **Given** a user enters dimensions outside allowed range, **When** they refer to the sidebar, **Then** they can easily identify the valid range to correct their input
3. **Given** a model has unusually large dimensional capacity (e.g., sliding doors up to 6700mm width), **When** displayed in sidebar, **Then** this capability is highlighted as a notable feature

---

### User Story 5 - Compare Material Types (Priority: P3)

A user uncertain about material choice wants to understand the key differences between PVC and Aluminum window systems. The sidebar provides material-specific information that helps them understand which material suits their project requirements.

**Why this priority**: Material selection is fundamental but many users need education. This helps convert uncertain visitors into confident buyers. Lower priority because users often arrive with material preference already established.

**Independent Test**: Compare sidebar information between a PVC model and an Aluminum model, verify that material-specific characteristics and benefits are displayed differently based on materialType from ProfileSupplier.

**Acceptance Scenarios**:

1. **Given** a user viewing a PVC window model, **When** they check material information, **Then** they see PVC-specific benefits: thermal insulation, low maintenance, corrosion resistance, noise reduction
2. **Given** a user viewing an Aluminum model, **When** they check material information, **Then** they see Aluminum-specific benefits: structural strength, slim profiles, modern aesthetics, durability
3. **Given** a user comparing materials, **When** they navigate between PVC and Aluminum models, **Then** the sidebar updates to reflect material-appropriate characteristics

---

### Edge Cases

- What happens when a model has no assigned profileSupplier? (Display "Proveedor no especificado" with generic material benefits if materialType could be inferred, otherwise show minimal information)
- How does the system handle models with incomplete technical specifications? (Display only available fields, never show empty values or "N/A" - omit missing sections entirely)
- What if thermal/acoustic ratings are not available in current database schema? (Phase 1: Display generic material-based performance descriptions; Phase 2: Add rating fields to Model schema)
- How are performance ratings communicated to non-technical users? (Use visual scales or badges like "⭐⭐⭐⭐⭐ Excelente" instead of technical class numbers)
- What happens on mobile viewports where sidebar is collapsed or repositioned? (Specifications become scrollable cards above the quote form, maintaining same information hierarchy)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a "Especificaciones Técnicas" card in the model detail sidebar showing material type, profile series, and performance characteristics
- **FR-002**: System MUST display profile supplier name and material type in a dedicated "Proveedor de Perfiles" card
- **FR-003**: System MUST show dimensional constraints (minWidth, maxWidth, minHeight, maxHeight) in millimeters in a "Dimensiones Permitidas" card
- **FR-004**: System MUST display 4-8 feature bullets describing practical benefits and use cases in a "Características Destacadas" section
- **FR-005**: System MUST handle models without assigned profileSupplier gracefully by showing "Proveedor no especificado" without breaking the UI
- **FR-006**: System MUST derive material-specific benefits from ProfileSupplier.materialType (PVC vs Aluminum characteristics)
- **FR-007**: System MUST omit sections entirely when data is unavailable rather than showing empty states or "N/A" placeholders
- **FR-008**: System MUST maintain existing sidebar cards (ModelInfo, ModelDimensions, ModelFeatures) while enhancing them with richer data
- **FR-009**: System MUST display all monetary values in the currency specified by TenantConfig
- **FR-010**: System MUST present technical information in Spanish (es-LA) with user-friendly labels suitable for non-technical audiences
- **FR-011**: System MUST fetch profile supplier data via tRPC from the existing ModelDetailOutput schema
- **FR-012**: System MUST adapt server data using the existing adapter pattern (adaptModelFromServer) to include new supplier and specification fields

### Key Entities

- **Model**: Window model with dimensional constraints (minWidthMm, maxWidthMm, minHeightMm, maxHeightMm), basePrice, status, and optional profileSupplierId
- **ProfileSupplier**: Supplier of window profiles with name, materialType (PVC/Aluminum), isActive status, and optional notes describing characteristics
- **ModelDetailOutput**: tRPC output schema containing model data with nested profileSupplier relationship
- **MaterialType**: Enum defining whether profiles are PVC or ALUMINUM
- **TenantConfig**: Singleton configuration containing business settings including default currency

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users viewing model detail pages can identify the profile supplier and material type within 3 seconds of page load
- **SC-002**: Users can determine if a model meets their dimensional requirements without trial-and-error form submissions (reduction in validation errors by 60%)
- **SC-003**: 80% of users viewing enhanced sidebar information spend more time on model detail pages (avg. session time increase from 45s to 90s)
- **SC-004**: Users can identify at least 3 key benefits of a model within 15 seconds of viewing the sidebar
- **SC-005**: Models with complete supplier and specification information receive 40% more quote requests than models with minimal information
- **SC-006**: Support requests asking "What material is this?" or "Who makes these profiles?" decrease by 70%
- **SC-007**: Zero UI errors or broken layouts when models lack profileSupplier or have incomplete data

## Assumptions *(include when relevant)*

- Users browsing the catalog have basic familiarity with window terminology (material types, dimensions) but may not understand technical ratings
- The existing ProfileSupplier relationship in the Model schema is properly populated for active catalog models
- Performance ratings (thermal insulation, acoustic insulation, water resistance classes) are not currently stored in the database and will need to be added in a future phase or derived from ProfileSupplier.notes
- The existing tRPC procedure `catalog['model-detail']` already includes profileSupplier in its output via Prisma include/select
- Currency for display is obtained from TenantConfig singleton as per existing pattern in adapters.ts
- Mobile viewports will maintain the same information but may reflow the sidebar layout (implementation decision, not a specification requirement)
- Users on slow connections should still see critical information (supplier, dimensions) load first, with feature descriptions loading progressively

## Out of Scope *(include when relevant)*

- Adding new fields to ProfileSupplier schema (e.g., logo URLs, detailed descriptions) - will use existing data only
- Creating a comprehensive database of technical performance ratings for all models - Phase 1 uses material-type defaults
- Implementing comparison views where users can see multiple models side-by-side
- Adding user reviews or ratings to model pages
- Internationalization beyond Spanish (es-LA) - only Spanish labels required
- Interactive visualizations of window cross-sections or 3D models
- Integration with external supplier APIs for real-time specification updates
- Historical price tracking or "notify me when back in stock" features

## Dependencies *(include when relevant)*

- Existing tRPC router `catalog['model-detail']` must include ProfileSupplier relation in query
- Prisma schema must have ProfileSupplier.materialType properly populated for active suppliers
- TenantConfig singleton must be initialized with valid currency configuration
- Existing UI components (Card, Icons from lucide-react) are available and functional
- The adapter pattern (adaptModelFromServer) must be extended to map new specification fields
