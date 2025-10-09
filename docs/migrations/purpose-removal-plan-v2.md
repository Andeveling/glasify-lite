# Purpose Field Removal Plan (v2.0)

**Target Version**: v2.0  
**Deprecation Start**: v1.x (October 2025)  
**Removal Date**: TBD (6-12 months after deprecation)  
**Status**: Planning Phase  
**Owner**: Glasify Development Team

---

## 📋 Overview

This document outlines the plan for **complete removal** of the deprecated `GlassType.purpose` field and `GlassPurpose` enum in version 2.0 of Glasify.

### Why Remove?

1. **Technical Debt**: Maintaining two classification systems adds complexity
2. **Confusion**: Developers may use wrong field (purpose vs solutions)
3. **Database Efficiency**: Remove unused index and enum
4. **Code Clarity**: Single source of truth for glass classification

### Prerequisites for Removal

✅ All glass types have solutions assigned (current: 100%)  
⏳ Deprecation period completed (6-12 months)  
⏳ Zero production code using `purpose` field  
⏳ Migration utilities tested and documented  
⏳ Stakeholder approval obtained

---

## 🗓️ Timeline

### Phase 1: Deprecation Period (Current - 6-12 months)

**Duration**: October 2025 → April-October 2026

**Goals**:
- Monitor usage of `purpose` field
- Gradually migrate internal code
- Collect feedback on solution system
- Build confidence in new system

**Activities**:
- ✅ Mark fields as @deprecated
- ✅ Create migration guide
- ✅ Implement fallback logic
- 🔄 Monitor field usage in logs
- 🔄 Update internal codebase
- 🔄 Train team on new system

**Success Criteria**:
- Zero references to `purpose` in new code (last 3 months)
- No production incidents related to solutions
- Positive user feedback on solution selector
- Team comfortable with new system

### Phase 2: Pre-Removal Preparation (1-2 months before v2.0)

**Duration**: ~8 weeks before v2.0 release

**Goals**:
- Final audit of purpose field usage
- Create v2.0 migration script
- Update all documentation
- Communicate breaking changes

**Activities**:
- [ ] Audit codebase for `purpose` references
- [ ] Create automated migration script
- [ ] Update CHANGELOG with breaking changes
- [ ] Create upgrade guide for users
- [ ] Test removal in staging environment
- [ ] Plan rollback strategy

**Deliverables**:
- Migration script: `scripts/migrate-to-v2.ts`
- Upgrade guide: `docs/upgrades/v1-to-v2.md`
- Breaking changes list in CHANGELOG
- Communication plan for users

### Phase 3: v2.0 Release (TBD)

**Duration**: Release day

**Goals**:
- Remove purpose field safely
- Provide smooth upgrade path
- Minimize disruption

**Activities**:
- [ ] Release v2.0 with breaking changes
- [ ] Provide migration script
- [ ] Monitor for issues
- [ ] Support users during upgrade

---

## 🔧 Technical Changes in v2.0

### Database Schema Changes

```prisma
// BEFORE (v1.x)
model GlassType {
  // ...
  /// @deprecated Use solutions relationship instead
  purpose        GlassPurpose  // ← TO BE REMOVED
  solutions      GlassTypeSolution[]
  
  @@index([manufacturerId, purpose])  // ← TO BE REMOVED
}

enum GlassPurpose {  // ← TO BE REMOVED
  general
  insulation
  security
  decorative
}

// AFTER (v2.0)
model GlassType {
  // ...
  solutions      GlassTypeSolution[]  // ← ONLY classification system
  
  @@index([manufacturerId])  // ← Simplified index
}

// GlassPurpose enum REMOVED
```

### Migration Script

**Location**: `scripts/migrate-to-v2.ts` (to be created)

**Purpose**: Drop deprecated fields and indexes

```typescript
// Pseudocode - TO BE IMPLEMENTED
async function migrateToV2() {
  // 1. Verify all glasses have solutions
  const orphans = await db.glassType.findMany({
    where: { solutions: { none: {} } }
  });
  
  if (orphans.length > 0) {
    throw new Error(`Cannot migrate: ${orphans.length} glasses without solutions`);
  }
  
  // 2. Create Prisma migration
  // - Drop index on [manufacturerId, purpose]
  // - Drop purpose column
  // - Drop GlassPurpose enum
  
  // 3. Update Prisma schema
  // - Remove purpose field
  // - Remove GlassPurpose enum
  // - Regenerate client
  
  console.log('✅ Migration to v2.0 complete');
}
```

### Files to Remove

| File                                           | Type                | Reason                     |
| ---------------------------------------------- | ------------------- | -------------------------- |
| `catalog.migration-utils.ts`                   | Helper functions    | No longer needed           |
| `scripts/rollback-solutions-to-purpose.ts`     | Rollback script     | Cannot rollback after v2.0 |
| `scripts/check-glass-purpose.ts`               | Verification script | Purpose field gone         |
| `docs/migrations/glass-solutions-migration.md` | Guide               | Archive to v1 docs         |

### Code Changes Required

**TypeScript Types**:
```typescript
// REMOVE all references to GlassPurpose enum
import { GlassPurpose } from '@prisma/client'; // ❌ Remove

// UPDATE API outputs (purpose field gone)
type GlassTypeOutput = {
  // ... other fields
  purpose: GlassPurpose; // ❌ Remove this line
  solutions: GlassTypeSolutionOutput[]; // ✅ Keep only this
};
```

**Prisma Queries**:
```typescript
// BEFORE (v1.x)
const glasses = await db.glassType.findMany({
  select: {
    purpose: true, // ❌ Will fail in v2.0
    solutions: true, // ✅ Keep this
  },
});

// AFTER (v2.0)
const glasses = await db.glassType.findMany({
  select: {
    solutions: true, // ✅ Only way to classify
  },
});
```

---

## 🚨 Breaking Changes

### For Application Code

**BREAKING**: `GlassType.purpose` field removed

**Impact**: Any code reading/writing purpose field will fail

**Migration**:
```typescript
// ❌ BEFORE (v1.x)
const glassType = await db.glassType.findUnique({
  select: { purpose: true },
  where: { id },
});
console.log(glassType.purpose); // 'security'

// ✅ AFTER (v2.0)
const glassType = await db.glassType.findUnique({
  select: { 
    solutions: { 
      where: { isPrimary: true },
      select: { solution: { select: { key: true } } }
    } 
  },
  where: { id },
});
console.log(glassType.solutions[0]?.solution.key); // 'security'
```

**BREAKING**: `GlassPurpose` enum removed

**Impact**: TypeScript types using enum will fail

**Migration**:
```typescript
// ❌ BEFORE (v1.x)
import { GlassPurpose } from '@prisma/client';
function filterByPurpose(purpose: GlassPurpose) { ... }

// ✅ AFTER (v2.0)
type SolutionKey = 'general' | 'security' | 'thermal_insulation' | ...;
function filterBySolution(solutionKey: SolutionKey) { ... }
```

**BREAKING**: Migration utilities removed

**Impact**: Cannot use fallback functions

**Migration**: Update code to use solutions directly

### For Database

**BREAKING**: purpose column dropped

**Impact**: Direct SQL queries will fail

**Migration**:
```sql
-- ❌ BEFORE (v1.x)
SELECT purpose FROM "GlassType" WHERE id = $1;

-- ✅ AFTER (v2.0)
SELECT gs.key 
FROM "GlassTypeSolution" gts
JOIN "GlassSolution" gs ON gs.id = gts.solution_id
WHERE gts.glass_type_id = $1 AND gts.is_primary = true;
```

---

## ✅ Pre-Release Checklist

### Code Audit

- [ ] Search codebase for `purpose` string
- [ ] Search for `GlassPurpose` enum references
- [ ] Check all Prisma queries
- [ ] Review API endpoint outputs
- [ ] Scan frontend components

### Testing

- [ ] Unit tests pass without purpose field
- [ ] Contract tests updated for v2.0 schema
- [ ] Integration tests cover solution queries
- [ ] E2E tests use only solutions
- [ ] Performance tests show no regression

### Documentation

- [ ] CHANGELOG.md lists breaking changes
- [ ] README.md updated for v2.0
- [ ] API docs reflect new schema
- [ ] Upgrade guide created
- [ ] Migration script documented

### Communication

- [ ] Email users about v2.0 changes
- [ ] Blog post explaining migration
- [ ] Update website documentation
- [ ] Prepare support FAQ
- [ ] Schedule Q&A session

---

## 🛡️ Risk Mitigation

### Risk 1: Code Still Using Purpose

**Probability**: Medium  
**Impact**: High (runtime errors)

**Mitigation**:
- Automated code scanning
- TypeScript strict mode
- Pre-release testing period
- Clear upgrade documentation

**Fallback**: Keep purpose field with `null` allowed (not recommended)

### Risk 2: User Resistance

**Probability**: Low  
**Impact**: Medium (support load)

**Mitigation**:
- Long deprecation period (6-12 months)
- Clear communication
- Migration script provided
- Support resources ready

**Fallback**: Extend deprecation period

### Risk 3: Performance Regression

**Probability**: Low  
**Impact**: Medium (UX degradation)

**Mitigation**:
- Performance testing before release
- Database index optimization
- Query caching
- Monitor metrics post-release

**Fallback**: Rollback to v1.x (provide downgrade script)

---

## 📊 Success Metrics

### Technical Metrics

| Metric                 | Target                      | How to Measure   |
| ---------------------- | --------------------------- | ---------------- |
| Zero runtime errors    | 0 errors related to purpose | Error monitoring |
| Query performance      | < 100ms (maintained)        | APM tools        |
| Migration success rate | > 95%                       | User surveys     |
| Support tickets        | < 5 in first week           | Ticket system    |

### Business Metrics

| Metric                | Target            | How to Measure    |
| --------------------- | ----------------- | ----------------- |
| User adoption of v2.0 | > 80% in 3 months | Version analytics |
| Feature satisfaction  | > 4/5 stars       | User feedback     |
| Documentation clarity | > 90% helpful     | Doc feedback      |

---

## 📝 Action Items

### Immediate (Before v2.0 Planning)

- [x] Create this removal plan
- [ ] Schedule team discussion
- [ ] Get stakeholder approval
- [ ] Set target date for v2.0

### Short-term (3-6 months)

- [ ] Monitor purpose field usage
- [ ] Update internal code to use solutions
- [ ] Collect user feedback
- [ ] Review deprecation timeline

### Medium-term (6-9 months)

- [ ] Final code audit
- [ ] Create migration script
- [ ] Write upgrade guide
- [ ] Test in staging

### Long-term (v2.0 Release)

- [ ] Remove deprecated code
- [ ] Release v2.0
- [ ] Support users during upgrade
- [ ] Monitor metrics

---

## 📚 References

- [Glass Solutions Migration Guide](./glass-solutions-migration.md)
- [Implementation Plan](../../plan/feature-glass-solutions-many-to-many-1.md)
- [Prisma Schema Changes](../../prisma/schema.prisma)
- [CHANGELOG](../../CHANGELOG.md) (to be updated)

---

**Next Review Date**: April 2026 (6 months after deprecation)  
**Decision Point**: Set v2.0 release date  
**Owner**: Technical Lead  
**Last Updated**: October 9, 2025
