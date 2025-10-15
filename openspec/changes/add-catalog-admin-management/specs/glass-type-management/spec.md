# Capability: Glass Type Management

**Capability ID**: `glass-type-management`  
**Change**: `add-catalog-admin-management`  
**Status**: Draft

## Overview

Enable administrators to manage glass type catalog including specifications, pricing, solutions, characteristics, and supplier relationships. Glass types represent glass products available for selection in models.

## ADDED Requirements

### Requirement: Create Glass Type

Administrators MUST be able to create glass types with complete technical specifications and pricing.

**Acceptance Criteria**:
- Admin can specify glass type name (unique)
- Admin can set thickness in mm (required)
- Admin can set price per square meter (required)
- Admin can select glass supplier (optional)
- Admin can provide SKU/product code (unique if provided)
- Admin can add description
- Admin can set technical specs (uValue, solarFactor, lightTransmission)
- Admin can assign glass solutions with performance ratings
- Admin can assign glass characteristics with values
- Admin can set active status (default true)
- System validates SKU uniqueness
- System creates price history record on creation
- System logs creation with user attribution

#### Scenario: Admin creates basic glass type

**GIVEN** an authenticated admin user  
**WHEN** admin submits create glass type form with:
- name: "Vidrio Claro 6mm"
- thicknessMm: 6
- pricePerSqm: 45000
- isActive: true

**THEN** system creates glass type with generated ID  
**AND** system creates initial price history record  
**AND** system logs creation event  
**AND** system returns success message: "Tipo de vidrio 'Vidrio Claro 6mm' creado exitosamente"

#### Scenario: Admin creates glass type with solutions and characteristics

**GIVEN** an authenticated admin user  
**AND** glass solution "security" exists  
**AND** glass characteristic "tempered" exists  
**WHEN** admin creates glass type with:
- name: "Vidrio Templado 8mm"
- thicknessMm: 8
- pricePerSqm: 75000
- solutions: [{ solutionId: "security", performanceRating: "excellent", isPrimary: true }]
- characteristics: [{ characteristicId: "tempered", value: "EN 12150" }]

**THEN** system creates glass type  
**AND** system creates GlassTypeSolution relationship  
**AND** system creates GlassTypeCharacteristic relationship  
**AND** system returns created glass type with nested relationships

#### Scenario: Validation fails for duplicate SKU

**GIVEN** an authenticated admin user  
**AND** a glass type exists with sku: "GRD-CLR-6MM"  
**WHEN** admin creates glass type with sku: "GRD-CLR-6MM"  
**THEN** system rejects with error: "Ya existe un tipo de vidrio con ese SKU"  
**AND** glass type is not created

---

### Requirement: Update Glass Type

Administrators MUST be able to update glass types including technical specs and relationships.

**Acceptance Criteria**:
- Admin can update all glass type fields except ID
- Admin can modify glass supplier assignment
- Admin can update technical specifications
- Admin can change price per sqm (creates price history)
- Admin can update SKU (validates uniqueness)
- Admin can activate/deactivate glass type
- System validates SKU uniqueness on update
- System creates price history if price changed
- System logs update with user attribution

#### Scenario: Admin updates glass type pricing

**GIVEN** an authenticated admin user  
**AND** a glass type exists with pricePerSqm: 45000  
**WHEN** admin updates with:
- id: "glass-1"
- pricePerSqm: 52000

**THEN** system updates price  
**AND** system creates price history record with reason and user attribution  
**AND** system logs update event

---

### Requirement: Delete Glass Type

Administrators MUST be able to delete glass types with referential integrity protection.

**Acceptance Criteria**:
- Admin can delete glass types by ID
- System checks for dependencies (models, quote items)
- System prevents deletion if glass type is referenced
- System cascades deletion to related records (solutions, characteristics, price history)
- System logs deletion attempt and result

#### Scenario: Admin deletes unused glass type

**GIVEN** an authenticated admin user  
**AND** a glass type exists with no dependencies  
**WHEN** admin deletes glass type  
**THEN** system deletes glass type record  
**AND** system deletes GlassTypeSolution relationships  
**AND** system deletes GlassTypeCharacteristic relationships  
**AND** system deletes price history records  
**AND** system logs deletion

#### Scenario: Admin attempts to delete glass type in use

**GIVEN** an authenticated admin user  
**AND** a glass type is referenced in 3 models  
**WHEN** admin attempts to delete glass type  
**THEN** system rejects with error: "No se puede eliminar el tipo de vidrio. Está en uso en 3 modelo(s)"  
**AND** glass type is not deleted

---

### Requirement: List Glass Types

Administrators MUST be able to view paginated list with filtering and search.

**Acceptance Criteria**:
- Admin can list glass types with pagination
- Admin can search by name or SKU
- Admin can filter by thickness, supplier, active status
- Admin can sort by name, thickness, pricePerSqm, createdAt
- System returns total count
- System includes related data (supplier name, solutions count, characteristics count)

#### Scenario: Admin lists glass types filtered by thickness

**GIVEN** an authenticated admin user  
**AND** glass types exist with thicknesses: 4mm, 6mm, 8mm, 10mm  
**WHEN** admin filters with thicknessMm: [6, 8]  
**THEN** system returns only glass types with 6mm and 8mm thickness

---

### Requirement: Manage Glass Type Solutions

Administrators MUST be able to assign and remove solutions from glass types.

**Acceptance Criteria**:
- Admin can add solution to glass type with performance rating
- Admin can mark solution as primary (only one primary per glass type)
- Admin can remove solution from glass type
- Admin can update performance rating and notes
- System validates solution exists before assignment
- System enforces single primary solution rule

#### Scenario: Admin adds security solution to glass type

**GIVEN** an authenticated admin user  
**AND** a glass type "Vidrio Templado" exists  
**AND** a solution "security" exists  
**WHEN** admin adds solution with:
- glassTypeId: "glass-1"
- solutionId: "security"
- performanceRating: "excellent"
- isPrimary: true

**THEN** system creates GlassTypeSolution relationship  
**AND** system marks as primary solution  
**AND** system logs assignment

---

### Requirement: Manage Glass Type Characteristics

Administrators MUST be able to assign and remove characteristics from glass types.

**Acceptance Criteria**:
- Admin can add characteristic with optional value and certification
- Admin can remove characteristic from glass type
- Admin can update characteristic value, certification, notes
- System validates characteristic exists before assignment
- System prevents duplicate characteristic assignments

#### Scenario: Admin adds tempered characteristic

**GIVEN** an authenticated admin user  
**AND** a glass type exists  
**AND** a characteristic "tempered" exists  
**WHEN** admin adds characteristic with:
- glassTypeId: "glass-1"
- characteristicId: "tempered"
- value: "EN 12150"
- certification: "ISO 9001"

**THEN** system creates GlassTypeCharacteristic relationship  
**AND** system stores value and certification  
**AND** system logs assignment
