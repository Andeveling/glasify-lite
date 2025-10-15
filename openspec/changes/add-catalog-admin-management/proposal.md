# Add Catalog Admin Management

**Change ID**: `add-catalog-admin-management`  
**Type**: Feature  
**Status**: Draft  
**Created**: 2025-10-15  
**Author**: AI Assistant

## Overview

Enable administrators to fully manage the product catalog by providing CRUD operations for all catalog entities: Models, Glass Types, Glass Solutions, Glass Characteristics, Glass Suppliers, Profile Suppliers, and Services. This feature empowers admins to configure the system's product offering without requiring database access or developer intervention.

## Motivation

Currently, the system has partial admin capabilities (model creation via `model-upsert`), but lacks complete CRUD operations for the entire catalog ecosystem. Admins need the ability to:

1. **Manage Models**: Create, update, publish/unpublish, and delete window/door models
2. **Manage Glass Types**: Define glass products with pricing, specifications, and performance characteristics
3. **Manage Glass Solutions**: Categorize glass types by use case (security, thermal, acoustic, etc.)
4. **Manage Glass Characteristics**: Define extensible glass properties (tempered, laminated, low-e, etc.)
5. **Manage Glass Suppliers**: Maintain glass manufacturer directory (Guardian, Saint-Gobain, etc.)
6. **Manage Profile Suppliers**: Maintain profile manufacturer directory (Rehau, Deceuninck, etc.)
7. **Manage Services**: Configure additional services (installation, measurements, delivery, etc.)

This feature is critical for:
- **Business Flexibility**: Adapt catalog to market changes without code deployments
- **Data Integrity**: Ensure proper validation and relationships through admin UI
- **Operational Efficiency**: Reduce dependency on developers for catalog updates
- **Scalability**: Support multi-tenant configurations with tenant-specific catalogs

## Goals

- Provide complete CRUD operations for all catalog entities via tRPC procedures
- Build admin UI pages for managing each catalog entity
- Enforce role-based access control (admin-only operations)
- Implement proper data validation and referential integrity
- Support audit logging for catalog changes
- Enable bulk operations (import/export) where applicable
- Maintain backward compatibility with existing catalog queries

## Non-Goals

- Multi-tenant catalog segmentation (single tenant per deployment)
- Version control or change approval workflows for catalog items
- Advanced inventory management or stock tracking
- Automated pricing algorithms or dynamic pricing
- Integration with external ERP/inventory systems
- Real-time collaboration or concurrent editing features

## Success Criteria

### Functional Requirements
- [ ] Admin can create, read, update, and delete all catalog entities
- [ ] System enforces referential integrity (prevent deletion of entities with dependencies)
- [ ] All mutations are logged with user attribution and timestamp
- [ ] Admin UI provides intuitive forms with proper validation feedback
- [ ] Catalog changes are immediately reflected in public catalog views
- [ ] System supports importing/exporting catalog data (CSV/JSON)

### Technical Requirements
- [ ] All tRPC procedures use `adminProcedure` for authorization
- [ ] Input validation via Zod schemas with Spanish error messages
- [ ] Server-side logging via Winston (never in Client Components)
- [ ] Database transactions ensure data consistency
- [ ] E2E tests cover critical admin workflows
- [ ] Pages follow Server Component + Client Content pattern

### Performance Requirements
- [ ] Catalog mutations complete within 500ms (p95)
- [ ] Admin list views support pagination (20 items default)
- [ ] Bulk operations handle up to 100 items per request
- [ ] ISR revalidation for public catalog pages on mutations

## Affected Areas

### Database Schema
- **Models**: `Model`, `ProfileSupplier`, `ModelCostBreakdown`, `ModelPriceHistory`
- **Glass Types**: `GlassType`, `GlassSupplier`, `GlassCharacteristic`, `GlassTypeCharacteristic`, `GlassTypePriceHistory`
- **Solutions**: `GlassSolution`, `GlassTypeSolution`
- **Services**: `Service`

### API Layer (tRPC)
- New routers: `admin/model`, `admin/glass-type`, `admin/glass-solution`, `admin/glass-characteristic`, `admin/glass-supplier`, `admin/service`
- Existing router: `admin/profile-supplier` (already implemented)
- Existing router: `admin/tenant-config` (already implemented)

### UI Layer (Next.js App Router)
- New pages: `/dashboard/models`, `/dashboard/glass-types`, `/dashboard/glass-solutions`, `/dashboard/glass-characteristics`, `/dashboard/glass-suppliers`, `/dashboard/services`
- New components: Forms, data tables, delete confirmation dialogs
- Existing: `/dashboard/models/page.tsx` (may need enhancement)

### Authorization
- All mutations require `admin` role via `adminProcedure`
- Middleware protection for `/dashboard/*` routes
- UI guards for role-based navigation

## Dependencies

- **Existing**: RBAC system (middleware, `adminProcedure`)
- **Existing**: Prisma schema with all catalog entities
- **Existing**: Winston logger for server-side logging
- **Existing**: Zod validation patterns
- **Existing**: Shadcn/ui components for forms and tables

## Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Accidental deletion of catalog items with dependencies | High | Medium | Implement referential integrity checks; show dependency count before deletion; soft delete option |
| Poor UX for complex forms (Glass Type with characteristics) | Medium | High | Use progressive disclosure; auto-save drafts; clear validation feedback |
| Performance degradation with large catalogs | Medium | Low | Implement pagination; debounce search; index database queries |
| Data migration complexity for existing catalogs | High | Low | Provide migration scripts; validate data integrity before deployment |
| Concurrent edits causing conflicts | Low | Low | Last-write-wins; show last updated timestamp |

## Open Questions

1. **Soft Delete vs Hard Delete**: Should we implement soft delete (isDeleted flag) or hard delete for catalog items?
   - **Recommendation**: Soft delete for audit trail; admin can permanently delete if needed

2. **Bulk Import Format**: Should we support CSV, JSON, or both for bulk imports?
   - **Recommendation**: Start with JSON (easier validation), add CSV later if requested

3. **Price History**: Should price changes automatically create history records?
   - **Recommendation**: Yes, automatic history creation with reason field (optional)

4. **Draft Mode**: Should all catalog items support draft mode (unpublished state)?
   - **Recommendation**: Yes for Models and Glass Types; not needed for characteristics/suppliers

5. **Validation Rules**: Should admins be able to configure validation rules (min/max dimensions)?
   - **Out of Scope**: Hardcode validation rules for MVP; defer customization to later phase

## Timeline & Phases

### Phase 1: Core CRUD Operations (Week 1-2)
- tRPC routers for all entities
- Zod schemas and validation
- Unit and integration tests
- Server-side logging

### Phase 2: Admin UI Pages (Week 3-4)
- Dashboard pages for each entity
- Forms with validation feedback
- Data tables with pagination
- Delete confirmation flows

### Phase 3: Advanced Features (Week 5-6)
- Bulk import/export
- Audit logging UI
- Price history tracking
- E2E tests

### Phase 4: Polish & Documentation (Week 7)
- UI/UX refinements
- Admin documentation
- Migration guides
- Performance optimization

## Related Changes

- None (initial catalog management proposal)

## References

- Prisma Schema: `prisma/schema.prisma`
- Existing Model Router: `src/server/api/routers/admin/admin.ts`
- Existing Profile Supplier Router: `src/server/api/routers/admin/profile-supplier.ts`
- RBAC Patterns: `.github/copilot-instructions.md#role-based-access-control-rbac-patterns`
- Constitution: `.specify/memory/constitution.md`
