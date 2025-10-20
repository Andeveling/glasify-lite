# Feature Specification: Send Quote to Vendor

**Feature Branch**: `005-send-quote-to`  
**Created**: 2025-10-13  
**Status**: Draft  
**Input**: User description: "ahora debemos planear la continuacion del flujo, una vez tengo mis cotizaciones y quiero enviarlas yo como usuario quiero enviar la cotizacion al admin, 'carpintero / comercial' para entablar el inicio de una negociacion, ahora es clave porque el carpintero debe pulir su cotizacion en su sistema (software de carpinteria avanzado altamente configurable) fuera de nuestro flujo, ya hemos cumplido el proposito de la app con esto culminamos el camino del user regular quien entra a quere tener un presupuesto para remodelar o comprar ventanas para su contruccion nueva"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Submit Draft Quote for Review (Priority: P1)

A homeowner has generated a quote from their configured glass products in the cart. They now want to submit this draft quote to the carpentry business (admin/vendor) to initiate negotiations and get a professional refinement of the budget.

**Why this priority**: This is the culmination of the user journey - the moment they transition from self-service exploration to professional engagement. Without this, users cannot connect with vendors, defeating the app's core purpose of "first contact in minutes, not days."

**Independent Test**: Can be fully tested by creating a draft quote, clicking "Send to Vendor" button, confirming submission, and verifying the quote status changes to "sent" with a success confirmation message.

**Acceptance Scenarios**:

1. **Given** a user has a draft quote with at least one item, **When** they view the quote detail page, **Then** they see a prominent "Enviar Cotización" (Send Quote) button
2. **Given** a user clicks "Enviar Cotización", **When** the system processes the request, **Then** the quote status changes from "draft" to "sent" immediately
3. **Given** a quote is successfully sent, **When** the user returns to "My Quotes" list, **Then** they see the quote badge updated to "Enviada" (Sent) with appropriate icon
4. **Given** a quote is sent, **When** the user views the quote detail, **Then** they see a confirmation message indicating when it was sent and what happens next
5. **Given** a user tries to send an already-sent quote, **When** they view the detail page, **Then** the "Send" button is hidden or disabled with explanatory text

---

### User Story 2 - Include Contact Information with Submission (Priority: P1)

A user wants to ensure the vendor can contact them to discuss the quote. They need to provide or confirm their contact details (phone, email, preferred contact method) before submitting.

**Why this priority**: Critical for establishing the connection between user and vendor. Without contact info, the submission is useless - the vendor cannot follow up to refine the quote or close the deal.

**Independent Test**: Can be tested by attempting to send a quote, being prompted for contact details if missing, filling them in, and successfully submitting with contact info included.

**Acceptance Scenarios**:

1. **Given** a user has filled contact phone in the quote, **When** they click "Enviar Cotización", **Then** the system uses the existing contact information without prompting
2. **Given** a user has NOT filled contact phone, **When** they click "Enviar Cotización", **Then** the system shows a modal/form prompting for contact details
3. **Given** a user enters contact information in the send modal, **When** they confirm submission, **Then** the contact info is saved with the quote
4. **Given** contact information is required, **When** a user tries to submit without filling required fields, **Then** the system prevents submission and shows validation errors
5. **Given** a quote is sent with contact info, **When** the admin/vendor views it in their system, **Then** they can see all contact details to initiate follow-up

---

### User Story 3 - Understand Next Steps After Submission (Priority: P2)

After submitting a quote, a user wants to understand what happens next - when to expect a response, what the vendor will do with their quote, and what they should do while waiting.

**Why this priority**: Manages user expectations and reduces anxiety/support inquiries. Users need to know the handoff is complete and understand the timeline for vendor response.

**Independent Test**: Can be tested by sending a quote and verifying a clear confirmation message appears explaining next steps, expected timeline, and vendor actions.

**Acceptance Scenarios**:

1. **Given** a quote is successfully sent, **When** the confirmation appears, **Then** it explains the vendor will review and refine the quote in their professional system
2. **Given** a quote is sent, **When** the user sees the confirmation, **Then** it includes an expected response timeframe (e.g., "Recibirás respuesta en 24-48 horas")
3. **Given** a quote is sent, **When** the confirmation appears, **Then** it includes vendor contact information and explains user can reach out directly if they need to cancel or modify
4. **Given** a quote is sent, **When** the user views the quote detail, **Then** a status message shows "Enviada al vendedor" with send date/time
5. **Given** a quote is sent, **When** the user views "My Quotes" list, **Then** sent quotes are visually distinct from draft quotes (different badge color/icon)

---

### User Story 4 - View Quote Submission History (Priority: P3)

A user wants to see when they sent a quote and track their submitted quotes separately from drafts they're still preparing.

**Why this priority**: Nice-to-have for organization and peace of mind. Users can verify submission happened and easily find quotes they're waiting for responses on.

**Independent Test**: Can be tested by sending multiple quotes, filtering/sorting by status, and verifying sent quotes appear with submission timestamps.

**Acceptance Scenarios**:

1. **Given** a user has both draft and sent quotes, **When** they visit "My Quotes", **Then** they can filter by status to see only sent quotes
2. **Given** a quote was sent, **When** the user views the quote detail, **Then** they see a "Sent on [date/time]" timestamp
3. **Given** multiple quotes exist, **When** the user sorts by date, **Then** sent quotes show submission date, not creation date
4. **Given** a user has sent quotes, **When** they export to PDF/Excel, **Then** the export includes "Sent Date" if applicable

---

### Edge Cases

- What happens when a user tries to send a quote with expired validity period? (Allow submission - validity is informational)
- How does the system handle submission if the user's session expires during the send process?
- What happens if a quote has no items (empty cart was used to generate it)? (Validation prevents submission)
- How does the system handle network failures during submission?
- What happens if a user realizes they made a mistake after sending? (Show vendor contact info, explain they must reach out directly)
- What happens if the vendor (TenantConfig contact) has no email/phone configured? (User still sees generic "vendor will contact you" message)
- Can a user edit their contact information after sending a quote? (No - quote data is immutable, user must contact vendor with corrections)
- What happens to quotes sent near the validity expiration date? (No restriction - vendor sees validity date and can decide)
- How does the user know if the vendor has seen their quote? (They don't - no read receipts in MVP)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a "Send Quote" action for quotes in "draft" status only
- **FR-002**: System MUST transition quote status from "draft" to "sent" when user confirms submission
- **FR-003**: System MUST capture and persist the submission timestamp (sentAt) when a quote is sent
- **FR-004**: System MUST require contact information (phone and/or email) before allowing quote submission
- **FR-005**: System MUST validate contact information format (phone format, email syntax) before submission
- **FR-006**: System MUST prevent re-sending of quotes already in "sent" status
- **FR-007**: System MUST display a confirmation message after successful submission explaining next steps
- **FR-008**: System MUST show different visual states for draft vs sent quotes (badge color, icon, text)
- **FR-009**: System MUST allow filtering quotes by status (draft, sent, canceled) in "My Quotes" list
- **FR-010**: System MUST include contact information in quote data accessible to vendor/admin
- **FR-011**: System MUST log quote submission events for audit purposes
- **FR-012**: System MUST handle submission errors gracefully with user-friendly messages
- **FR-013**: Users MUST be able to see submission date/time for sent quotes
- **FR-014**: System MUST prevent sending quotes with zero items (validation rule)
- **FR-015**: System MUST update quote status in database when submitted (vendor will check their external system for new quotes - no automated notifications in MVP)
- **FR-016**: System MUST NOT allow users to withdraw or cancel sent quotes (submission is final - users must contact vendor directly to cancel)
- **FR-017**: System MUST display vendor contact information (from TenantConfig) in the confirmation message so users know how to reach vendor if needed

### Key Entities

- **Quote**: 
  - Existing attributes: id, status (draft/sent/canceled), total, validUntil, createdAt, contactPhone, projectName, projectAddress, userId
  - New attribute needed: sentAt (timestamp when quote was sent to vendor)
  - Status transition: draft → sent (one-way unless FR-016 clarifies withdrawal)

- **QuoteSubmission** (potential new entity):
  - Represents the submission event for audit/history
  - Attributes: quoteId, submittedAt, submittedBy (userId), contactPhone, contactEmail, userNotes (optional message to vendor)
  - Allows tracking of submission history even if quote status changes later

- **TenantConfig**:
  - Existing attributes: contactEmail, contactPhone (vendor's contact info for receiving quotes)
  - Used to determine where/how to notify vendor of new submissions

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can submit a draft quote to the vendor in under 30 seconds from viewing the quote detail page
- **SC-002**: 95% of users successfully submit their first quote without encountering errors or confusion
- **SC-003**: Quote submission transitions status from "draft" to "sent" within 2 seconds of user confirmation
- **SC-004**: Users receive clear confirmation of submission with next steps explanation within 3 seconds
- **SC-005**: Sent quotes are visually distinguishable from draft quotes in the "My Quotes" list (100% visual clarity)
- **SC-006**: Zero quotes are submitted without valid contact information (validation prevents this)
- **SC-007**: Users can filter their quotes by status and see only sent quotes in under 2 seconds
- **SC-008**: Support inquiries about "What happens after I send a quote?" reduce by 70% due to clear next-steps messaging
- **SC-009**: Submission timestamps are accurate to within 1 second of actual submission time
- **SC-010**: Quote submission completes the user journey from catalog exploration to vendor engagement in under 10 minutes total (catalog → cart → quote → send)

## Assumptions

- Contact information (phone/email) is optional during quote generation but becomes required at submission time
- The vendor/admin has a separate system for managing received quotes (mentioned as "software de carpinteria avanzado")
- Quote submission is the final action in the user's journey - after this, the vendor takes over in their own system
- Users understand that "sent" quotes cannot be edited (immutability principle established in prior work)
- **Quote submission is permanent and cannot be withdrawn** - users must contact vendor directly to cancel
- **No automated notifications in MVP** - vendors check their system manually for new quote submissions
- The validity period (validUntil) is informational for the vendor but doesn't block submission if expired
- Users may have multiple quotes in various states (draft, sent, canceled)
- The current system does not include real-time vendor responses or quote negotiations within the app
- Vendors check their external system regularly for new quote submissions (daily or more frequently)
- The TenantConfig contains vendor contact details that will be displayed to users if they need to contact vendor directly
- **Future integrations planned**: CRM systems (Salesforce, HubSpot) and WhatsApp Business API for automated notifications

## Out of Scope

- Real-time chat or messaging between user and vendor within the app
- Quote negotiation flow (counter-offers, price adjustments) - handled in vendor's external system
- User account creation or authentication changes
- Quote duplication or editing after submission
- **Quote withdrawal/cancellation after submission** - users must contact vendor directly
- Vendor/admin portal for viewing submitted quotes (separate system handles this)
- Payment processing or deposit collection
- Quote expiration enforcement (blocking submission of expired quotes)
- Multi-language support for confirmation messages (Spanish only for MVP)
- **Email/SMS/WhatsApp notifications to vendors** (MVP: manual checking; Future: CRM/WhatsApp Business integrations)
- **CRM integrations** (Salesforce, HubSpot) - planned for post-MVP
- **WhatsApp Business API integration** - planned for post-MVP
- Analytics dashboard for submission rates or user engagement metrics
