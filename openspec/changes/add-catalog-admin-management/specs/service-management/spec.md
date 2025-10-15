# Capability: Service Management

**Capability ID**: `service-management`  
**Change**: `add-catalog-admin-management`  
**Status**: Draft

## Overview

Enable administrators to manage additional services (installation, measurements, delivery, etc.) available for quotes.

## ADDED Requirements

### Requirement: Create Service

Administrators MUST be able to create additional services for quote customization.

**Acceptance Criteria**:
- Admin can specify service name (unique)
- Admin can set service type (area, perimeter, fixed)
- Admin can set unit (unit, sqm, ml)
- Admin can set rate/price
- System validates name uniqueness

#### Scenario: Admin creates installation service

**GIVEN** an authenticated admin user  
**WHEN** admin creates service with:
- name: "Instalación Profesional"
- type: "area"
- unit: "sqm"
- rate: 50000

**THEN** system creates service  
**AND** system validates name uniqueness  
**AND** system returns success message

---

### Requirement: Update Service

Administrators MUST be able to update service details including pricing and configuration.

**Acceptance Criteria**:
- Admin MUST be able to update all service fields
- System MUST validate name uniqueness on update
- System MUST log updates with user attribution

#### Scenario: Admin updates service pricing

**GIVEN** an authenticated admin user  
**AND** a service "Instalación" exists with rate: 50000  
**WHEN** admin updates rate to 60000  
**THEN** system updates service  
**AND** system logs update event

---

### Requirement: Delete Service

Administrators MUST be able to delete unused services with referential integrity protection.

**Acceptance Criteria**:
- System MUST prevent deletion if service is used in quote items
- System MUST show count of affected quotes in error message
- System MUST log deletion attempts

#### Scenario: Admin deletes unused service

**GIVEN** an authenticated admin user  
**AND** a service exists with no quote item usage  
**WHEN** admin deletes service  
**THEN** system deletes service  
**AND** system logs deletion

---

### Requirement: List Services

Administrators MUST be able to view all services with filtering by type and unit.

**Acceptance Criteria**:
- System MUST support filtering by service type (area, perimeter, fixed)
- System MUST support filtering by unit (unit, sqm, ml)
- Response MUST include count of associated quote items per service

#### Scenario: Admin lists services filtered by type

**GIVEN** an authenticated admin user  
**AND** services exist with types "area", "perimeter", "fixed"  
**WHEN** admin filters by type: "area"  
**THEN** system returns only area-based services  
**AND** each service includes quote items count
