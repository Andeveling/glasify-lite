# Phase 0: Research & Technical Decisions

**Feature**: Send Quote to Vendor  
**Date**: 2025-10-13  
**Purpose**: Document technical decisions, patterns, and best practices for implementing quote submission

---

## 1. Contact Information Validation Strategy

### Decision: Use Zod with React Hook Form

**Rationale**:
- **End-to-end type safety**: Zod schemas shared between tRPC server and client validation
- **Consistent validation**: Same rules enforced client-side (UX) and server-side (security)
- **React Hook Form integration**: `@hookform/resolvers/zod` provides seamless form state management
- **Existing pattern**: Project already uses Zod for all tRPC procedure inputs

**Alternatives Considered**:
- **Native HTML5 validation**: Too basic, no custom error messages, inconsistent browser behavior
- **Yup**: Less popular, no native TypeScript inference, switching cost from Zod
- **Custom validation**: Reinventing the wheel, harder to test, no type inference

**Implementation**:
```typescript
// Shared schema (server/api/routers/quote/quote.schemas.ts)
export const sendToVendorInput = z.object({
  quoteId: z.string().cuid(),
  contactPhone: z.string()
    .regex(/^\+?[1-9]\d{9,14}$/, 'Formato de teléfono inválido (ej: +573001234567)'),
  contactEmail: z.string().email('Correo electrónico inválido').optional(),
});

// Client-side form (React Hook Form)
const form = useForm({
  resolver: zodResolver(sendToVendorInput.omit({ quoteId: true })),
});
```

---

## 2. Quote Status Transition Pattern

### Decision: Immutable Status Change (draft → sent)

**Rationale**:
- **Data integrity**: Prevents accidental status rollbacks or invalid transitions
- **Audit trail**: `sentAt` timestamp provides clear submission record
- **Vendor trust**: Once sent, quote represents user's committed intent
- **Simplified logic**: No complex state machine needed for MVP

**Alternatives Considered**:
- **Reversible status**: Allow users to "unsend" quotes
  - ❌ Rejected: Creates confusion for vendors, enables quote spam
- **Multiple sent statuses**: sent_pending, sent_confirmed, sent_viewed
  - ❌ Rejected: Over-engineering for MVP, requires notification infrastructure
- **Soft delete**: Mark as deleted but keep status
  - ❌ Rejected: User needs to contact vendor anyway, in-app delete is misleading

**Implementation**:
```typescript
// tRPC procedure
.mutation(async ({ input, ctx }) => {
  const quote = await ctx.db.quote.findUnique({ 
    where: { id: input.quoteId },
    select: { status: true, userId: true },
  });

  // Validation: Only draft quotes can be sent
  if (quote.status !== 'draft') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Solo las cotizaciones en borrador pueden ser enviadas',
    });
  }

  // Status transition (one-way)
  const updated = await ctx.db.quote.update({
    where: { id: input.quoteId },
    data: {
      status: 'sent',
      sentAt: new Date(),
      contactPhone: input.contactPhone,
    },
  });

  return updated;
});
```

---

## 3. Server Component vs Client Component Boundaries

### Decision: Server Component Pages + Client Component Interactions

**Rationale**:
- **SEO**: My Quotes page needs metadata for Google indexing
- **Performance**: Server-side data fetching reduces client bundle size
- **Security**: Winston logger only works server-side (Node.js modules)
- **Constitution compliance**: Server-first architecture principle

**Pattern**:
```typescript
// ✅ app/(dashboard)/quotes/[quoteId]/page.tsx - SERVER COMPONENT
export const metadata: Metadata = { title: 'Detalle de Cotización' };

export default async function QuotePage({ params }: Props) {
  const quote = await api.quote['get-by-id']({ id: params.quoteId });
  return <QuoteDetailContent quote={quote} />;
}

// ✅ _components/quote-detail-content.tsx - CLIENT COMPONENT
'use client';
export function QuoteDetailContent({ quote }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const sendQuote = useSendQuote();

  return (
    <>
      {quote.status === 'draft' && (
        <SendQuoteButton onClick={() => setIsModalOpen(true)} />
      )}
      <ContactInfoModal 
        open={isModalOpen} 
        onSubmit={sendQuote.mutate}
      />
    </>
  );
}
```

**Why This Matters**:
- ❌ **WRONG**: Making entire page Client Component loses SEO
- ❌ **WRONG**: Using Winston logger in Client Component causes build error
- ✅ **RIGHT**: Server Component fetches data, Client Component handles interaction

---

## 4. Contact Information Pre-fill Strategy

### Decision: Optional contactPhone in Quote, Required on Send

**Rationale**:
- **Flexibility**: Users can generate quotes without phone initially
- **Privacy**: Not all users want to share contact info upfront
- **Validation gate**: Submission enforces contact requirement
- **Existing schema**: Quote already has `contactPhone` field (nullable)

**User Flow**:
```
1. User generates quote (contactPhone optional)
2. User clicks "Enviar Cotización"
3. System checks if contactPhone exists:
   - YES → Proceed to confirmation
   - NO → Show modal to collect contactPhone
4. User confirms submission
5. Status: draft → sent, sentAt populated
```

**Implementation**:
```typescript
// tRPC procedure validation
const sendToVendorInput = z.object({
  quoteId: z.string().cuid(),
  contactPhone: z.string().regex(/^\+?[1-9]\d{9,14}$/),
});

// Client-side hook
export function useSendQuote() {
  const mutation = api.quote['send-to-vendor'].useMutation({
    onSuccess: (data) => {
      toast.success('¡Cotización enviada!');
      // Optimistic update
      queryClient.setQueryData(['quote', data.id], data);
    },
  });

  return mutation;
}
```

---

## 5. No Admin Portal (Scope Boundary)

### Decision: Vendor Uses External System

**Rationale**:
- **MVP focus**: User journey ends at quote submission
- **Existing workflow**: Vendors already have "software de carpinteria avanzado"
- **Separation of concerns**: Vendor system is highly configurable, our app is for homeowners
- **Future-proofing**: Admin portal is post-MVP (separate epic)

**What This Means**:
- ✅ User can submit quotes
- ✅ Quote status changes to 'sent' in database
- ✅ Vendor checks their external system (manual polling)
- ❌ No automated email/SMS notifications (MVP)
- ❌ No vendor dashboard in our app
- ❌ No real-time notifications

**Future Integrations (Post-MVP)**:
- **CRM Systems**: Salesforce, HubSpot, Zoho (webhook on quote.sentAt change)
- **WhatsApp Business API**: Instant notification to vendor
- **Email Service**: SendGrid/AWS SES for transactional emails
- **Webhook**: Generic POST to vendor's system

---

## 6. Winston Logger Usage (Critical)

### Decision: Server-Side Only (No Client Components)

**Rationale**:
- **Node.js dependency**: Winston uses `fs`, `path` modules unavailable in browser
- **Build error prevention**: Webpack cannot bundle Node.js modules for client
- **Constitution requirement**: Explicit rule against Winston in Client Components

**Allowed Contexts**:
- ✅ Server Components (page.tsx without 'use client')
- ✅ Server Actions ('use server' directives)
- ✅ tRPC procedures (server/api/routers/)
- ✅ API Route Handlers (app/api/)
- ✅ Middleware (middleware.ts)

**Prohibited Contexts**:
- ❌ Client Components ('use client')
- ❌ Custom hooks (hooks/*.ts used in client)
- ❌ Browser-executed utilities

**Implementation**:
```typescript
// ✅ GOOD: tRPC procedure (server-side)
import logger from '@/lib/logger';

export const quoteRouter = createTRPCRouter({
  'send-to-vendor': protectedProcedure
    .input(sendToVendorInput)
    .mutation(async ({ input, ctx }) => {
      logger.info('Sending quote to vendor', { 
        quoteId: input.quoteId, 
        userId: ctx.session.user.id 
      });
      // ... mutation logic
    }),
});

// ❌ BAD: Client Component
'use client';
import logger from '@/lib/logger'; // ❌ Build error!

export function SendQuoteButton() {
  const handleClick = () => {
    logger.info('Button clicked'); // ❌ Fails at build time
  };
}

// ✅ GOOD: Client Component (no logger)
'use client';
export function SendQuoteButton() {
  const handleClick = () => {
    // User already gets feedback via toast
    toast.success('¡Cotización enviada!');
    // Errors captured in DevTools automatically
  };
}
```

---

## 7. Status Badge Design Pattern

### Decision: Atomic UI Component with Variants

**Rationale**:
- **Reusability**: Badge used in list and detail views
- **Consistency**: Same visual language across app
- **Accessibility**: ARIA labels for screen readers
- **Shadcn/ui pattern**: Follows existing component library

**Visual Design**:
```typescript
export function QuoteStatusBadge({ status }: Props) {
  const variants = {
    draft: { 
      variant: 'secondary' as const, 
      label: 'Borrador',
      icon: FileTextIcon,
      ariaLabel: 'Cotización en borrador',
    },
    sent: { 
      variant: 'default' as const, 
      label: 'Enviada',
      icon: SendIcon,
      ariaLabel: 'Cotización enviada al vendedor',
    },
    canceled: { 
      variant: 'destructive' as const, 
      label: 'Cancelada',
      icon: XCircleIcon,
      ariaLabel: 'Cotización cancelada',
    },
  };

  const config = variants[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} aria-label={config.ariaLabel}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
}
```

---

## 8. Error Handling Strategy

### Decision: Three-Layer Error Handling

**Rationale**:
- **User clarity**: Different errors need different messages
- **Security**: Don't expose internal errors to users
- **Debugging**: Server logs capture full context

**Layers**:

1. **Client Validation** (React Hook Form + Zod)
   - Prevents invalid submissions
   - Immediate feedback (no network round-trip)
   - Spanish error messages

2. **Server Validation** (tRPC + Zod)
   - Protects against malicious requests
   - Enforces business rules (status === 'draft')
   - Returns typed TRPCError

3. **Database/Network Errors** (Prisma + tRPC)
   - Logs full error with Winston (server)
   - Returns generic user message
   - Supports retry for transient failures

**Implementation**:
```typescript
// Client-side
const form = useForm({
  resolver: zodResolver(contactSchema),
});

const sendQuote = useSendQuote({
  onError: (error) => {
    if (error.data?.code === 'BAD_REQUEST') {
      toast.error(error.message); // User-friendly message from server
    } else {
      toast.error('Error al enviar. Por favor intenta de nuevo.');
    }
  },
});

// Server-side
.mutation(async ({ input, ctx }) => {
  try {
    // Business logic validation
    if (quote.status !== 'draft') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Solo las cotizaciones en borrador pueden ser enviadas',
      });
    }

    // Database operation
    const updated = await ctx.db.quote.update({...});
    
    logger.info('Quote sent successfully', { quoteId: input.quoteId });
    return updated;

  } catch (error) {
    logger.error('Failed to send quote', { 
      quoteId: input.quoteId, 
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Re-throw known errors
    if (error instanceof TRPCError) throw error;

    // Generic error for unexpected failures
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Error al procesar la solicitud',
    });
  }
});
```

---

## 9. Performance Optimization

### Decision: Optimistic UI Updates + Invalidation

**Rationale**:
- **Perceived speed**: User sees immediate feedback
- **Data consistency**: Server is source of truth
- **UX best practice**: Don't make users wait for network

**Implementation**:
```typescript
const mutation = api.quote['send-to-vendor'].useMutation({
  // Optimistic update
  onMutate: async (input) => {
    await queryClient.cancelQueries(['quote', input.quoteId]);
    
    const previous = queryClient.getQueryData(['quote', input.quoteId]);
    
    queryClient.setQueryData(['quote', input.quoteId], (old) => ({
      ...old,
      status: 'sent',
      sentAt: new Date(),
    }));
    
    return { previous };
  },
  
  // Rollback on error
  onError: (error, input, context) => {
    if (context?.previous) {
      queryClient.setQueryData(['quote', input.quoteId], context.previous);
    }
    toast.error('Error al enviar cotización');
  },
  
  // Refetch to ensure consistency
  onSettled: (data, error, input) => {
    queryClient.invalidateQueries(['quote', input.quoteId]);
    queryClient.invalidateQueries(['quotes']); // Refresh list
  },
});
```

---

## 10. Testing Strategy

### Decision: Pyramid Approach (Unit > Integration > E2E)

**Rationale**:
- **Speed**: Unit tests run fastest, catch most bugs
- **Confidence**: Integration tests validate database interactions
- **Coverage**: E2E tests verify complete user flow

**Test Distribution**:
- **Unit Tests (70%)**: Zod schemas, utility functions, component logic
- **Integration Tests (20%)**: tRPC procedures, database operations
- **E2E Tests (10%)**: Complete submission flow

**Key Test Scenarios**:
```typescript
// Unit: Zod validation
describe('sendToVendorInput schema', () => {
  it('validates correct phone format', () => {
    expect(() => sendToVendorInput.parse({
      quoteId: 'cuid',
      contactPhone: '+573001234567',
    })).not.toThrow();
  });
  
  it('rejects invalid phone format', () => {
    expect(() => sendToVendorInput.parse({
      quoteId: 'cuid',
      contactPhone: 'invalid',
    })).toThrow();
  });
});

// Integration: Status transition
describe('send-to-vendor procedure', () => {
  it('transitions draft quote to sent', async () => {
    const quote = await createTestQuote({ status: 'draft' });
    
    const result = await caller.quote['send-to-vendor']({
      quoteId: quote.id,
      contactPhone: '+573001234567',
    });
    
    expect(result.status).toBe('sent');
    expect(result.sentAt).toBeDefined();
  });
  
  it('throws error for already sent quote', async () => {
    const quote = await createTestQuote({ status: 'sent' });
    
    await expect(
      caller.quote['send-to-vendor']({ quoteId: quote.id, contactPhone: '+57300...' })
    ).rejects.toThrow('Solo las cotizaciones en borrador pueden ser enviadas');
  });
});

// E2E: Complete flow
test('user can send draft quote', async ({ page }) => {
  await page.goto('/quotes');
  await page.click('text=Ver detalle');
  await page.click('button:has-text("Enviar Cotización")');
  await page.fill('input[name="contactPhone"]', '+573001234567');
  await page.click('button:has-text("Confirmar")');
  
  await expect(page.locator('text=¡Cotización enviada!')).toBeVisible();
  await expect(page.locator('[data-status="sent"]')).toBeVisible();
});
```

---

## Summary of Technical Decisions

| Decision Area | Chosen Approach | Key Benefit |
|--------------|-----------------|-------------|
| Validation | Zod + React Hook Form | End-to-end type safety |
| Status Transition | Immutable (draft → sent) | Data integrity, vendor trust |
| Component Architecture | Server Components + Client interactions | SEO, performance, security |
| Contact Info | Optional on create, required on send | User privacy, flexible UX |
| Admin Portal | Out of scope (external system) | MVP focus, clear boundaries |
| Logging | Winston server-side only | Constitution compliance |
| Status Badges | Atomic UI component | Reusability, consistency |
| Error Handling | Three-layer (client/server/db) | User clarity, security, debugging |
| Performance | Optimistic updates + invalidation | Perceived speed, data consistency |
| Testing | Pyramid (70% unit, 20% int, 10% E2E) | Speed, confidence, coverage |

**All technical unknowns resolved. Ready for Phase 1: Data Model & Contracts.**
