# Capability: Glass Solution Management

**Capability ID**: `glass-solution-management`  
**Change**: `add-catalog-admin-management`  
**Status**: Draft

## Overview

Enable administrators to manage glass solution categories (security, thermal insulation, acoustic, decorative, etc.) used to classify glass types by use case.

## ADDED Requirements

### Requirement: Create Glass Solution

Administrators MUST be able to create solution categories with unique keys and localized names.

**Acceptance Criteria**:
- Admin can specify unique key (slug format: lowercase, hyphens)
- Admin can set technical name (English) and commercial name (Spanish)
- Admin can add description
- Admin can assign Lucide icon name
- Admin can set sort order for display prioritization
- Admin can set active status
- System validates key uniqueness and format

#### Scenario: Admin creates security solution

**GIVEN** an authenticated admin user  
**WHEN** admin creates solution with:
- key: "security"
- name: "Security"
- nameEs: "Seguridad"
- description: "Glass solutions for security and protection"
- icon: "Shield"
- sortOrder: 1
- isActive: true

**THEN** system creates glass solution  
**AND** system validates key format (lowercase, hyphens only)  
**AND** system returns success message

---

### Requirement: Update Glass Solution

Administrators MUST be able to update solution details including names, descriptions, icons, and display order.

**Acceptance Criteria**:
- Admin MUST be able to update all fields except key (immutable)
- System MUST validate uniqueness of updated fields
- System MUST log updates with user attribution

#### Scenario: Admin updates solution description

**GIVEN** an authenticated admin user  
**AND** a solution "security" exists  
**WHEN** admin updates description field  
**THEN** system updates solution  
**AND** system logs update event

---

### Requirement: Delete Glass Solution

Administrators MUST be able to delete unused solutions with referential integrity protection.

**Acceptance Criteria**:
- System MUST prevent deletion if solution is assigned to glass types
- System MUST show count of affected glass types in error message
- System MUST log deletion attempts

#### Scenario: Admin attempts to delete solution in use

**GIVEN** an authenticated admin user  
**AND** a solution is assigned to 10 glass types  
**WHEN** admin attempts to delete solution  
**THEN** system rejects with error: "No se puede eliminar la solución. Está en uso en 10 tipo(s) de vidrio"  
**AND** solution is not deleted

---

### Requirement: List Glass Solutions

Administrators MUST be able to view all solutions ordered by display priority.

**Acceptance Criteria**:
- Results MUST be ordered by sortOrder ASC by default
- Response MUST include count of associated glass types per solution
- System MUST support filtering by active status

#### Scenario: Admin lists all solutions

**GIVEN** an authenticated admin user  
**WHEN** admin requests solution list  
**THEN** system returns all solutions ordered by sortOrder  
**AND** each solution includes count of associated glass types

---

### Requirement: Reorder Solutions

Administrators MUST be able to change display order of solutions for UI prioritization.

**Acceptance Criteria**:
- Admin MUST provide array of solution IDs in desired order
- System MUST update sortOrder field accordingly (0-indexed)
- System MUST validate all provided IDs exist

#### Scenario: Admin reorders solutions

**GIVEN** an authenticated admin user  
**AND** solutions ["security", "thermal", "acoustic"] exist  
**WHEN** admin reorders to ["thermal", "security", "acoustic"]  
**THEN** system updates sortOrder (thermal=0, security=1, acoustic=2)  
**AND** system returns updated solution list
