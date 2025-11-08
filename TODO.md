# Drizzle Migration TODO

## Completed ✅
- [x] Drizzle config setup
- [x] Enums migration (12 enums)
- [x] User model with Zod schemas and field limits
- [x] Session model with Zod schemas and field limits
- [x] VerificationToken model with Zod schemas and field limits

## In Progress 🚧
- [ ] Verification model
- [ ] Account model (refine)

## Pending 📋
- [ ] TenantConfig model
- [ ] Manufacturer model
- [ ] Model model
- [ ] GlassType model
- [ ] GlassSolution model
- [ ] Quote model
- [ ] QuoteItem model
- [ ] Cart model
- [ ] CartItem model
- [ ] Service model
- [ ] ServiceItem model
- [ ] QuoteStatus model
- [ ] UserRole model
- [ ] ModelStatus model
- [ ] ServiceType model
- [ ] GlassThickness model
- [ ] GlassColor model
- [ ] GlassFinish model
- [ ] GlassShape model
- [ ] GlassTreatment model
- [ ] PaymentMethod model
- [ ] PaymentStatus model
- [ ] DeliveryMethod model
- [ ] DeliveryStatus model

## Notes
- Using pgEnum for database-level enum constraints
- Zod schemas generated from table definitions
- Field length limits defined as constants
- varchar preferred over text for constrained fields