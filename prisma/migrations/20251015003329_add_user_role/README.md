# Migration: add_user_role

**Date**: 2025-10-15
**Feature**: 009-role-based-access

## Description

This migration adds role-based access control to the User model:

- Creates `UserRole` enum with values: `admin`, `seller`, `user`
- Adds `role` field to User model with default value `user`
- Creates index on `role` field for query performance

## Forward Migration

The forward migration is applied automatically via Prisma:

```bash
pnpm prisma migrate dev --name add_user_role
```

## Rollback Procedure

If you need to rollback this migration, follow these steps:

### Step 1: Verify no data loss

Before rolling back, ensure that removing the `role` field will not cause data loss. Check if any users have non-default roles:

```sql
SELECT role, COUNT(*) 
FROM "User" 
GROUP BY role;
```

### Step 2: Execute rollback script

Connect to your PostgreSQL database and run the rollback script:

```bash
# Using psql
psql -U your_username -d glasify-litle -f rollback.sql

# Or using Prisma Studio SQL editor
# Copy contents of rollback.sql and execute
```

### Step 3: Update Prisma schema

After running the rollback script, you must also revert the schema changes:

1. Remove the `UserRole` enum from `prisma/schema.prisma`
2. Remove the `role` field from the `User` model
3. Remove the `@@index([role])` from the `User` model

### Step 4: Regenerate Prisma Client

```bash
pnpm prisma generate
```

### Step 5: Mark migration as reverted

Update your migration history:

```bash
# This will mark the migration as rolled back
pnpm prisma migrate resolve --rolled-back 20251015003329_add_user_role
```

## Important Notes

⚠️ **Data Loss Warning**: Rolling back this migration will permanently delete all role assignments. Users will lose their admin/seller roles.

⚠️ **Session Impact**: Active user sessions may contain cached role information. Users should logout and login again after rollback.

⚠️ **Application Code**: Ensure all code referencing `user.role` is removed or updated before rollback to prevent runtime errors.

## Testing Rollback

To test the rollback in a safe environment:

1. Create a database backup before rollback
2. Test rollback in development/staging first
3. Verify application still works without role field
4. Check that NextAuth session callback handles missing role gracefully

## Related Files

- Migration SQL: `migration.sql`
- Rollback SQL: `rollback.sql`
- Prisma Schema: `../../schema.prisma`
- Feature Spec: `/specs/009-role-based-access/spec.md`
