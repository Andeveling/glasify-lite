# Capability: Glass Characteristic Management

**Capability ID**: `glass-characteristic-management`  
**Change**: `add-catalog-admin-management`  
**Status**: Draft

## Overview

Enable administrators to manage extensible glass characteristics (tempered, laminated, low-e, acoustic interlayer, etc.) for flexible glass type classification.

## ADDED Requirements

### Requirement: Create Glass Characteristic

Administrators MUST be able to create extensible glass characteristics for flexible glass type classification.

**Acceptance Criteria**:
- Admin can specify unique key (slug format)
- Admin can set technical and commercial names
- Admin can assign category (safety, thermal, acoustic, coating)
- Admin can set sort order
- System validates key uniqueness and format

#### Scenario: Admin creates tempered characteristic

**GIVEN** an authenticated admin user  
**WHEN** admin creates characteristic with:
- key: "tempered"
- name: "Tempered"
- nameEs: "Templado"
- category: "safety"
- sortOrder: 1
- isActive: true

**THEN** system creates glass characteristic  
**AND** system validates key format (lowercase, hyphens/underscores only)  
**AND** system returns success message

---

### Requirement: Update Glass Characteristic

Administrators MUST be able to update characteristic details including names, categories, and display order.

**Acceptance Criteria**:
- Admin MUST be able to update all fields except key (immutable)
- System MUST validate category values
- System MUST log updates with user attribution

#### Scenario: Admin updates characteristic category

**GIVEN** an authenticated admin user  
**AND** a characteristic "tempered" exists with category "safety"  
**WHEN** admin updates category to "safety-enhanced"  
**THEN** system updates characteristic  
**AND** system logs update event

---

### Requirement: Delete Glass Characteristic

Administrators MUST be able to delete unused characteristics with referential integrity protection.

**Acceptance Criteria**:
- System MUST prevent deletion if characteristic is assigned to glass types
- System MUST show count of affected glass types in error message
- System MUST log deletion attempts

#### Scenario: Admin deletes unused characteristic

**GIVEN** an authenticated admin user  
**AND** a characteristic exists with no glass type assignments  
**WHEN** admin deletes characteristic  
**THEN** system deletes characteristic  
**AND** system logs deletion

---

### Requirement: List Glass Characteristics

Administrators MUST be able to view characteristics filtered by category and ordered by priority.

**Acceptance Criteria**:
- System MUST support filtering by category
- Results MUST be ordered by sortOrder within category
- Response MUST include count of associated glass types per characteristic

#### Scenario: Admin lists characteristics filtered by category

**GIVEN** an authenticated admin user  
**AND** characteristics exist in categories "safety", "thermal", "acoustic"  
**WHEN** admin filters by category: "safety"  
**THEN** system returns only safety characteristics  
**AND** results ordered by sortOrder ASC
