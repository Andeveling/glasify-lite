# Capability: Model Management

**Capability ID**: `model-management`  
**Change**: `add-catalog-admin-management`  
**Status**: Draft

## Overview

Enable administrators to create, read, update, delete, publish, and unpublish window/door models in the catalog. Models represent product configurations with dimensions, pricing, and compatible glass types.

## ADDED Requirements

### Requirement: Create Model

Administrators MUST be able to create new window/door models with complete configuration including pricing, dimensions, glass compatibility, and optional profile supplier assignment.

**Acceptance Criteria**:
- Admin can specify model name (unique per profile supplier)
- Admin can select profile supplier (optional)
- Admin can set dimension constraints (min/max width and height in mm)
- Admin can configure pricing (base price, cost per mm width/height, accessory price)
- Admin can configure glass discount dimensions (mm to subtract from dimensions for glass calculation)
- Admin can select compatible glass types (minimum 1 required)
- Admin can set status (draft or published)
- Admin can add optional metadata (profit margin, cost notes)
- System validates dimension constraints (min < max)
- System validates glass type IDs exist
- System prevents duplicate model names for same profile supplier
- System creates price history record on creation
- System logs creation with user attribution
- Model defaults to draft status if not specified

#### Scenario: Admin creates basic model without profile supplier

**GIVEN** an authenticated admin user  
**AND** at least one glass type exists in the system  
**WHEN** admin submits create model form with:
- name: "Ventana Básica 1H"
- status: "draft"
- minWidthMm: 500
- maxWidthMm: 1500
- minHeightMm: 600
- maxHeightMm: 2000
- basePrice: 150000
- costPerMmWidth: 50
- costPerMmHeight: 40
- compatibleGlassTypeIds: ["glass-type-1"]
- profileSupplierId: null

**THEN** system creates model with generated ID  
**AND** system creates initial price history record  
**AND** system logs creation event  
**AND** system returns success message: "Modelo 'Ventana Básica 1H' creado exitosamente"

#### Scenario: Admin creates model with profile supplier assignment

**GIVEN** an authenticated admin user  
**AND** a profile supplier "Rehau" exists with ID "supplier-1"  
**WHEN** admin creates model with profileSupplierId: "supplier-1"  
**THEN** system validates supplier exists  
**AND** system creates model linked to supplier  
**AND** system allows model name to be reused for different supplier

#### Scenario: Validation fails for invalid dimensions

**GIVEN** an authenticated admin user  
**WHEN** admin submits create model with:
- minWidthMm: 1500
- maxWidthMm: 500 (less than min)

**THEN** system rejects request with error: "Ancho mínimo debe ser menor al ancho máximo"  
**AND** model is not created

#### Scenario: Validation fails for duplicate model name

**GIVEN** an authenticated admin user  
**AND** a model "Ventana Premium" exists with profileSupplierId: "supplier-1"  
**WHEN** admin attempts to create another model:
- name: "Ventana Premium"
- profileSupplierId: "supplier-1"

**THEN** system rejects with error: "Ya existe un modelo con el nombre 'Ventana Premium'"  
**AND** model is not created

#### Scenario: Validation fails for non-existent glass types

**GIVEN** an authenticated admin user  
**WHEN** admin submits create model with compatibleGlassTypeIds: ["invalid-id"]  
**THEN** system rejects with error: "Uno o más tipos de vidrio no encontrados"  
**AND** model is not created

---

### Requirement: Update Model

Administrators MUST be able to update existing models while maintaining data integrity and audit trail.

**Acceptance Criteria**:
- Admin can update all model fields except ID
- Admin can change profile supplier (including set to null)
- Admin can modify dimension constraints
- Admin can update pricing fields
- Admin can modify compatible glass types list
- Admin can change status between draft and published
- System validates updated dimensions (min < max)
- System validates glass type IDs exist
- System prevents duplicate names on update
- System creates price history record if pricing changed
- System logs update with user attribution
- System returns updated model data

#### Scenario: Admin updates model pricing

**GIVEN** an authenticated admin user  
**AND** a model "Ventana Básica 1H" exists with ID "model-1"  
**AND** current basePrice: 150000  
**WHEN** admin updates model with:
- id: "model-1"
- basePrice: 175000
- costPerMmWidth: 55

**THEN** system updates model pricing  
**AND** system creates price history record with reason: "Ajuste de precio"  
**AND** system logs update event  
**AND** system returns success message: "Modelo 'Ventana Básica 1H' actualizado exitosamente"

#### Scenario: Admin changes model status to published

**GIVEN** an authenticated admin user  
**AND** a draft model exists  
**WHEN** admin updates status to "published"  
**THEN** system updates status  
**AND** model becomes visible in public catalog  
**AND** system logs status change

---

### Requirement: Delete Model

Administrators MUST be able to delete models with referential integrity protection.

**Acceptance Criteria**:
- Admin can delete models by ID
- System checks for dependencies before deletion
- System prevents deletion if model is used in quote items
- System shows dependency count in error message
- System performs hard delete (not soft delete for MVP)
- System logs deletion attempt and result
- System cascades deletion to related records (price history, cost breakdown)

#### Scenario: Admin deletes unused model

**GIVEN** an authenticated admin user  
**AND** a model "Test Model" exists with ID "model-1"  
**AND** model has no associated quote items  
**WHEN** admin deletes model with id: "model-1"  
**THEN** system deletes model record  
**AND** system deletes related price history records  
**AND** system deletes related cost breakdown records  
**AND** system logs deletion  
**AND** system returns success message: "Modelo eliminado exitosamente"

#### Scenario: Admin attempts to delete model in use

**GIVEN** an authenticated admin user  
**AND** a model exists with ID "model-1"  
**AND** model is referenced in 5 quote items  
**WHEN** admin attempts to delete model  
**THEN** system rejects with error: "No se puede eliminar el modelo. Está en uso en 5 cotización(es)"  
**AND** model is not deleted  
**AND** system logs failed deletion attempt

---

### Requirement: List Models

Administrators MUST be able to view paginated list of all models with search and filtering capabilities.

**Acceptance Criteria**:
- Admin can list models with pagination (default 20 per page, max 100)
- Admin can search models by name (case-insensitive)
- Admin can filter by status (draft, published)
- Admin can filter by profile supplier
- Admin can sort by name, createdAt, updatedAt, basePrice
- System returns total count for pagination
- System includes related data (profile supplier name, glass types count)
- System supports efficient database queries with indexes

#### Scenario: Admin lists first page of models

**GIVEN** an authenticated admin user  
**AND** 45 models exist in the system  
**WHEN** admin requests model list with:
- page: 1
- limit: 20

**THEN** system returns first 20 models  
**AND** system returns total: 45  
**AND** system returns hasNextPage: true  
**AND** each model includes: id, name, status, basePrice, profileSupplier, compatibleGlassTypesCount

#### Scenario: Admin searches models by name

**GIVEN** an authenticated admin user  
**AND** models named "Ventana Premium", "Ventana Básica", "Puerta Premium" exist  
**WHEN** admin searches with query: "premium"  
**THEN** system returns 2 models (case-insensitive match)  
**AND** returned models are "Ventana Premium" and "Puerta Premium"

#### Scenario: Admin filters by published status

**GIVEN** an authenticated admin user  
**AND** 10 draft models and 5 published models exist  
**WHEN** admin filters with status: "published"  
**THEN** system returns only 5 published models

---

### Requirement: Get Model by ID

Administrators MUST be able to retrieve complete model details including all relationships.

**Acceptance Criteria**:
- Admin can fetch model by ID
- System returns full model data including:
  - All model fields
  - Profile supplier details (if assigned)
  - Compatible glass types list with details
  - Price history records
  - Cost breakdown records (if any)
- System returns 404 if model not found
- System validates ID format (CUID)

#### Scenario: Admin fetches existing model

**GIVEN** an authenticated admin user  
**AND** a model exists with ID "model-1"  
**WHEN** admin requests model with id: "model-1"  
**THEN** system returns complete model data  
**AND** response includes profileSupplier object  
**AND** response includes compatibleGlassTypes array  
**AND** response includes priceHistory array ordered by effectiveFrom DESC

#### Scenario: Admin fetches non-existent model

**GIVEN** an authenticated admin user  
**WHEN** admin requests model with id: "invalid-id"  
**THEN** system returns error: "Modelo no encontrado"  
**AND** error code is "NOT_FOUND"

---

### Requirement: Publish/Unpublish Model

Administrators MUST be able to change model visibility in public catalog through dedicated publish/unpublish actions.

**Acceptance Criteria**:
- Admin can publish draft model (makes it visible in public catalog)
- Admin can unpublish published model (hides from public catalog)
- System validates model exists before status change
- System logs status change with user attribution
- System triggers ISR revalidation for public catalog pages
- System returns updated model with new status

#### Scenario: Admin publishes draft model

**GIVEN** an authenticated admin user  
**AND** a draft model "Ventana Premium" exists  
**WHEN** admin publishes model  
**THEN** system updates status to "published"  
**AND** system triggers revalidation of /catalog pages  
**AND** model appears in public catalog  
**AND** system logs publish event

#### Scenario: Admin unpublishes model

**GIVEN** an authenticated admin user  
**AND** a published model exists  
**WHEN** admin unpublishes model  
**THEN** system updates status to "draft"  
**AND** system triggers revalidation of /catalog pages  
**AND** model is hidden from public catalog  
**AND** system logs unpublish event
