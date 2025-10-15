# Capability: Glass Supplier Management

**Capability ID**: `glass-supplier-management`  
**Change**: `add-catalog-admin-management`  
**Status**: Draft

## Overview

Enable administrators to manage glass manufacturer directory (Guardian, Saint-Gobain, Pilkington, AGC, Vitro, etc.).

## ADDED Requirements

### Requirement: Create Glass Supplier

Administrators MUST be able to create glass supplier records with complete contact and identification information.

**Acceptance Criteria**:
- Admin can specify supplier name (unique)
- Admin can provide optional code (unique if provided)
- Admin can set country, website, contact info
- Admin can set active status
- System validates name and code uniqueness

#### Scenario: Admin creates glass supplier

**GIVEN** an authenticated admin user  
**WHEN** admin creates supplier with:
- name: "Guardian Glass"
- code: "GRD"
- country: "USA"
- website: "https://guardian.com"
- contactEmail: "sales@guardian.com"
- isActive: true

**THEN** system creates glass supplier  
**AND** system validates code uniqueness  
**AND** system returns success message

---

### Requirement: Update Glass Supplier

Administrators MUST be able to update supplier details including contact information and status.

**Acceptance Criteria**:
- Admin MUST be able to update all fields
- System MUST validate name and code uniqueness on update
- System MUST log updates with user attribution

#### Scenario: Admin updates supplier contact info

**GIVEN** an authenticated admin user  
**AND** a supplier "Guardian" exists  
**WHEN** admin updates contactEmail and contactPhone  
**THEN** system updates supplier  
**AND** system logs update event

---

### Requirement: Delete Glass Supplier

Administrators MUST be able to delete unused suppliers with referential integrity protection.

**Acceptance Criteria**:
- System MUST prevent deletion if supplier has associated glass types
- System MUST show count of affected glass types in error message
- System MUST log deletion attempts

#### Scenario: Admin attempts to delete supplier with glass types

**GIVEN** an authenticated admin user  
**AND** a supplier has 8 associated glass types  
**WHEN** admin attempts to delete supplier  
**THEN** system rejects with error: "No se puede eliminar el proveedor. Tiene 8 tipo(s) de vidrio asociados"  
**AND** supplier is not deleted

---

### Requirement: List Glass Suppliers

Administrators MUST be able to view suppliers with search and filtering capabilities.

**Acceptance Criteria**:
- System MUST support filtering by active status
- System MUST support search by name or code (case-insensitive)
- Response MUST include count of associated glass types per supplier

#### Scenario: Admin searches suppliers by name

**GIVEN** an authenticated admin user  
**AND** suppliers "Guardian", "Saint-Gobain", "Pilkington" exist  
**WHEN** admin searches with query: "guard"  
**THEN** system returns only "Guardian" (case-insensitive match)
