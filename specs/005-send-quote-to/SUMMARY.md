# Feature 005: Send Quote to Vendor - Specification Summary

**Created**: 2025-10-13  
**Status**: ✅ **COMPLETE** - Ready for Planning  
**Branch**: `005-send-quote-to`

---

## Executive Summary

This feature completes the user journey by allowing homeowners to submit their self-generated quotes to the carpentry business (vendor/admin) for professional refinement and negotiation. This is the critical handoff moment where the app fulfills its core promise: "first contact in minutes, not days."

**Business Impact**: Without this feature, users can generate quotes but cannot connect with vendors, rendering the app incomplete.

---

## User Journey Completion

```
[EXISTING FLOW]
User → Catalog → Configure Products → Add to Cart → Generate Quote (status: draft)

[NEW FLOW - THIS FEATURE]
User → My Quotes → View Draft Quote → "Enviar Cotización" → Confirm Contact Info → Submit
↓
Quote Status: draft → sent
↓
Vendor checks their external system → Sees new quote → Contacts user → Negotiation begins
```

---

## Key Decisions Made

### 1. No Automated Notifications in MVP ✅

**Decision**: Database status update only. No email/SMS/WhatsApp notifications.

**Rationale**:
- Prioritizes MVP speed - no notification infrastructure needed
- Vendors check their external system manually (existing workflow)
- Avoids complexity of email deliverability, spam filtering, SMS costs
- Future-proofed: CRM and WhatsApp Business integrations planned post-MVP

**User Impact**: Vendors must check system regularly. Response time depends on vendor's checking frequency.

---

### 2. No Quote Withdrawal After Submission ✅

**Decision**: Submission is final. Users cannot cancel/withdraw sent quotes in the app.

**Rationale**:
- Maintains vendor trust (no "quote spam" or constant cancellations)
- Simplifies MVP (no withdrawal UI/logic needed)
- Encourages users to review carefully before sending
- Realistic workflow: users contact vendor directly if they need to cancel (human interaction)

**User Impact**: Users must contact vendor directly to cancel. Vendor contact info shown in confirmation message.

---

## Feature Highlights

### 4 Prioritized User Stories

1. **P1 - Submit Draft Quote**: Core functionality - status transition draft → sent
2. **P1 - Include Contact Info**: Critical for vendor follow-up
3. **P2 - Understand Next Steps**: Manages expectations, reduces support inquiries
4. **P3 - View Submission History**: Nice-to-have for organization

### 17 Functional Requirements

All requirements are complete, testable, and implementation-ready:

- Status transition logic (draft → sent, with validation)
- Contact information requirements and validation
- Confirmation messaging with vendor contact details
- Visual distinction between draft/sent quotes
- Audit logging of submissions
- Error handling and edge case management

### 10 Success Criteria

Measurable outcomes include:

- **Speed**: Submit in under 30 seconds
- **Success Rate**: 95% of users submit successfully
- **Clarity**: 100% visual distinction between draft/sent quotes
- **Support Reduction**: 70% fewer "what happens next?" inquiries
- **End-to-End**: Complete user journey in under 10 minutes (catalog → send)

---

## Technical Scope

### Database Changes Needed

**Quote Model**:
- Add `sentAt: DateTime?` field (nullable - only populated when sent)
- Existing `status` enum already supports 'sent' value ✅

**Optional - QuoteSubmission Audit Table**:
- Track submission events separately for history/analytics
- Fields: quoteId, submittedAt, submittedBy, contactPhone, contactEmail

### Key Entities

- **Quote**: Add sentAt timestamp
- **TenantConfig**: Use existing contactEmail/contactPhone for displaying vendor info to users
- **User**: No changes needed

---

## User Experience Flow

### Happy Path

1. **User views draft quote** in My Quotes
2. **Clicks "Enviar Cotización"** button (prominent, only visible for draft quotes)
3. **System checks contact info**:
   - If present: Proceed to confirmation
   - If missing: Show modal to collect phone/email
4. **User confirms submission**
5. **System updates**:
   - Status: draft → sent
   - sentAt: current timestamp
   - Logs submission event
6. **User sees confirmation** with:
   - "Quote sent successfully"
   - Next steps explanation
   - Expected response time (24-48hrs)
   - Vendor contact info (phone/email from TenantConfig)
   - Note: "Need to cancel? Contact vendor directly at [contact]"
7. **Badge updates**: "Pendiente" (amber) → "Enviada" (blue)

### Error Scenarios

- **No contact info**: Prompt to fill
- **Invalid contact format**: Show validation errors
- **Network failure**: Graceful error with retry option
- **Zero items in quote**: Validation prevents submission
- **Already sent**: Hide/disable button, show explanatory text

---

## Edge Cases Handled

9 edge cases identified and addressed:

1. Expired validity period → Allow submission (informational only)
2. Session expiration during submit → Standard error handling
3. Empty quote (zero items) → Validation prevents
4. Network failures → Graceful error messages
5. User mistake after sending → Show vendor contact, explain direct cancellation
6. Missing TenantConfig contact → Generic "vendor will contact you" message
7. User wants to edit contact after send → Immutable, contact vendor with corrections
8. Quote sent near expiration → No restriction, vendor sees validity date
9. No read receipts → User doesn't know if vendor saw it (future feature)

---

## Out of Scope (MVP)

Explicitly excluded to maintain MVP focus:

- ❌ Email/SMS/WhatsApp notifications (future: CRM/WhatsApp Business integrations)
- ❌ Quote withdrawal/cancellation in-app
- ❌ Vendor portal to view submitted quotes
- ❌ Real-time chat or messaging
- ❌ Quote negotiation flow (counter-offers)
- ❌ Payment processing
- ❌ Quote expiration enforcement
- ❌ Multi-language support (Spanish only)
- ❌ Analytics dashboard

---

## Future Roadmap (Post-MVP)

### Planned Integrations

1. **CRM Systems** (Salesforce, HubSpot, Zoho)
   - Automated quote sync to CRM
   - Lead creation on submission
   - Sales pipeline integration

2. **WhatsApp Business API**
   - Instant notification to vendor
   - User can initiate chat with vendor
   - Higher response rate than email

3. **Email Notifications**
   - Transactional email service (SendGrid, AWS SES)
   - Quote PDF attachment
   - User and vendor notifications

### Enhancement Ideas

- Quote withdrawal with timeframe (e.g., within 1 hour)
- Read receipts (vendor viewed quote)
- Estimated response time based on vendor's history
- Quote templates for repeat users
- Bulk quote submission (multiple quotes at once)

---

## Dependencies & Assumptions

### Dependencies

- **Existing**: Quote model with status enum (draft/sent/canceled) ✅
- **Existing**: TenantConfig with contactEmail and contactPhone ✅
- **Existing**: User authentication and session management ✅
- **Existing**: My Quotes page with quote list and detail views ✅

### Assumptions

- Vendors check their external system regularly (daily or more frequently)
- Users understand quotes are immutable after creation
- Submission is the final user action (vendor takes over after)
- Contact info validation uses standard formats (phone: 10-15 digits, email: RFC 5322)
- Spanish language only for all user-facing messages
- Validity period is informational, not enforced

---

## Success Metrics

### Quantitative

- **Submission Time**: < 30 seconds (from quote detail to confirmation)
- **Success Rate**: 95% submit without errors
- **Performance**: Status update < 2 seconds
- **Validation**: 0% invalid contact info submissions
- **Filter Speed**: < 2 seconds to show sent quotes only

### Qualitative

- **User Confidence**: Clear confirmation messaging reduces anxiety
- **Support Reduction**: 70% fewer "what happens next?" tickets
- **Visual Clarity**: 100% users can distinguish draft vs sent quotes
- **Journey Completion**: End-to-end in < 10 minutes (catalog → send)

---

## Validation Status

### Specification Quality Checklist

✅ **All items PASSED**:

- [x] No implementation details
- [x] Focused on user value
- [x] Written for non-technical stakeholders
- [x] All mandatory sections complete
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements testable and unambiguous
- [x] Success criteria measurable and technology-agnostic
- [x] All acceptance scenarios defined
- [x] Edge cases identified
- [x] Scope clearly bounded
- [x] Dependencies and assumptions documented

---

## Next Steps

### 1. Proceed to Planning (`/speckit.plan`)

Generate technical implementation plan:
- Task breakdown
- Component design
- API endpoints (tRPC procedures)
- Database migrations
- UI components
- Testing strategy

### 2. Estimated Effort

**MVP Implementation**: ~3-5 days

- Day 1: Database migration (sentAt field) + tRPC procedure
- Day 2: UI components (button, modal, confirmation)
- Day 3: Contact validation + status badge updates
- Day 4: Error handling + edge cases
- Day 5: Testing + documentation

### 3. Testing Requirements

- **Unit Tests**: tRPC procedure logic, validation functions
- **Integration Tests**: Quote status transition, contact info handling
- **E2E Tests**: Complete submission flow (Playwright)
- **Manual Testing**: All edge cases and error scenarios

---

## Conclusion

This specification is **complete and ready for implementation**. All clarifications resolved, scope clearly defined, and future roadmap established.

**Key Strengths**:

1. ✅ Completes critical user journey (catalog → vendor engagement)
2. ✅ MVP-focused (no over-engineering with notifications)
3. ✅ Future-proofed (CRM/WhatsApp integrations planned)
4. ✅ User trust maintained (no withdrawal = no quote spam)
5. ✅ Clear handoff (vendor contact info shown for direct communication)

**Business Value**: This feature transforms the app from "quote generator" to "vendor connection platform" - fulfilling the core promise of rapid first contact.

---

**Specification Files**:
- Spec: `/specs/005-send-quote-to/spec.md`
- Checklist: `/specs/005-send-quote-to/checklists/requirements.md`
- Branch: `005-send-quote-to`
