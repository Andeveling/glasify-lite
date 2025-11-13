Seeding order (respects dependencies):
1. [] glassCharacteristics (independent)
2. [] glassSolutions (independent)  
3. [] profileSuppliers (independent)
4. [] glassSuppliers (depends on TenantConfig)
5. [] glassTypes (depends on glassSuppliers)
6. [] models (depends on profileSuppliers)
7. [] glassTypeSolutions (depends on glassTypes + glassSolutions)
8. [] services (independent)