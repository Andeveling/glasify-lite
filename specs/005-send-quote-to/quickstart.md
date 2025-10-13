# Quickstart: Implementing Send Quote to Vendor

**Feature**: Send Quote to Vendor (Feature 005)  
**Date**: 2025-10-13  
**Target Audience**: Developers implementing this feature

---

## Overview

This guide walks you through implementing the "Send Quote to Vendor" feature, which allows homeowners to submit their self-generated draft quotes to the carpentry business for professional refinement.

**Estimated Time**: 3-5 days  
**Complexity**: Medium (tRPC mutation + React Hook Form + UI updates)  
**Dependencies**: Next.js 15, tRPC 11, Prisma 6, React Hook Form 7

---

## Prerequisites

Before starting, ensure you have:

- ✅ Node.js 18+ installed
- ✅ PostgreSQL database running
- ✅ Project dependencies installed (`pnpm install`)
- ✅ Development server running (`pnpm dev`)
- ✅ Prisma Studio access (`pnpm db:studio`)
- ✅ Familiarity with tRPC, Prisma, and Next.js App Router

**Required Reading**:
- [ ] [research.md](./research.md) - Technical decisions
- [ ] [data-model.md](./data-model.md) - Database changes
- [ ] [contracts/send-to-vendor.contract.md](./contracts/send-to-vendor.contract.md) - API contract

---

## Implementation Phases

### Phase 1: Database Migration (Day 1)

**Goal**: Add `sentAt` field to Quote model

#### Step 1.1: Update Prisma Schema

```bash
# Edit prisma/schema.prisma
```

```prisma
model Quote {
  // ... existing fields ...
  
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  sentAt      DateTime?                         // ✨ ADD THIS LINE
  
  // ... relations ...
}
```

#### Step 1.2: Generate and Apply Migration

```bash
# Create migration
pnpm prisma migrate dev --name add_quote_sent_at

# Generate Prisma Client
pnpm prisma generate

# Verify in Prisma Studio
pnpm db:studio
```

#### Step 1.3: Verify Migration

```sql
-- Check column exists in database
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Quote' AND column_name = 'sentAt';

-- Expected result:
-- column_name | data_type           | is_nullable
-- sentAt      | timestamp without timezone | YES
```

**✅ Checkpoint**: `sentAt` field exists in database and Prisma types

---

### Phase 2: tRPC Backend (Day 1-2)

**Goal**: Create `quote.send-to-vendor` procedure with validation

#### Step 2.1: Update Zod Schemas

**File**: `src/server/api/routers/quote/quote.schemas.ts`

```typescript
// Add to bottom of file

/**
 * Send quote to vendor (submit for review)
 *
 * tRPC Mutation: quote['send-to-vendor']
 */
export const sendToVendorInput = z.object({
  quoteId: z.string()
    .cuid('ID de cotización inválido')
    .describe('ID de la cotización a enviar'),
  
  contactPhone: z.string()
    .regex(
      /^\+?[1-9]\d{9,14}$/,
      'Formato de teléfono inválido. Use formato internacional: +573001234567'
    )
    .min(10, 'Teléfono debe tener al menos 10 dígitos')
    .max(15, 'Teléfono no puede exceder 15 dígitos')
    .describe('Teléfono de contacto del usuario'),
  
  contactEmail: z.string()
    .email('Correo electrónico inválido')
    .optional()
    .describe('Correo electrónico de contacto (opcional)'),
});

export type SendToVendorInput = z.infer<typeof sendToVendorInput>;

export const sendToVendorOutput = z.object({
  id: z.string(),
  status: z.literal('sent'),
  sentAt: z.date(),
  contactPhone: z.string(),
  contactEmail: z.string().optional(),
  total: z.number(),
  currency: z.string().length(3),
});

export type SendToVendorOutput = z.infer<typeof sendToVendorOutput>;
```

#### Step 2.2: Add Service Method (Optional)

**File**: `src/server/api/routers/quote/quote.service.ts`

```typescript
import type { PrismaClient, Quote } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import logger from '@/lib/logger';

export type SendToVendorParams = {
  quoteId: string;
  userId: string;
  contactPhone: string;
  contactEmail?: string;
};

export async function sendQuoteToVendor(
  db: PrismaClient,
  params: SendToVendorParams
): Promise<Quote> {
  const { quoteId, userId, contactPhone, contactEmail } = params;

  // 1. Fetch quote with items
  const quote = await db.quote.findUnique({
    where: { id: quoteId },
    include: { items: true },
  });

  // 2. Validate quote exists
  if (!quote) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Cotización no encontrada',
    });
  }

  // 3. Validate ownership
  if (quote.userId !== userId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'No tiene permiso para enviar esta cotización',
    });
  }

  // 4. Validate status
  if (quote.status !== 'draft') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Solo las cotizaciones en borrador pueden ser enviadas',
    });
  }

  // 5. Validate has items
  if (quote.items.length === 0) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'La cotización debe tener al menos un producto',
    });
  }

  // 6. Execute mutation
  const updated = await db.quote.update({
    where: { id: quoteId },
    data: {
      status: 'sent',
      sentAt: new Date(),
      contactPhone,
      contactEmail,
    },
  });

  // 7. Log success
  logger.info('Quote sent to vendor', {
    quoteId: updated.id,
    userId,
    sentAt: updated.sentAt,
    itemCount: quote.items.length,
  });

  return updated;
}
```

#### Step 2.3: Add tRPC Procedure

**File**: `src/server/api/routers/quote/quote.ts`

```typescript
import { sendToVendorInput, sendToVendorOutput } from './quote.schemas';
import { sendQuoteToVendor } from './quote.service';

export const quoteRouter = createTRPCRouter({
  // ... existing procedures ...

  'send-to-vendor': protectedProcedure
    .input(sendToVendorInput)
    .output(sendToVendorOutput)
    .mutation(async ({ ctx, input }) => {
      const updated = await sendQuoteToVendor(ctx.db, {
        quoteId: input.quoteId,
        userId: ctx.session.user.id,
        contactPhone: input.contactPhone,
        contactEmail: input.contactEmail,
      });

      return {
        id: updated.id,
        status: updated.status as 'sent',
        sentAt: updated.sentAt!,
        contactPhone: updated.contactPhone!,
        contactEmail: updated.contactEmail ?? undefined,
        total: updated.total.toNumber(),
        currency: updated.currency,
      };
    }),
});
```

#### Step 2.4: Test Backend

```bash
# Run unit tests
pnpm test src/server/api/routers/quote

# Manually test with tRPC panel (if installed)
# Or use Prisma Studio + direct tRPC calls
```

**✅ Checkpoint**: tRPC procedure works, validates inputs, updates database

---

### Phase 3: Custom Hook (Day 2)

**Goal**: Create reusable React Hook for quote submission

#### Step 3.1: Create Hook File

**File**: `src/hooks/use-send-quote.ts`

```typescript
'use client';

import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/trpc/react';
import { toast } from '@/hooks/use-toast';
import type { SendToVendorInput } from '@/server/api/routers/quote/quote.schemas';

export function useSendQuote() {
  const queryClient = useQueryClient();

  const mutation = api.quote['send-to-vendor'].useMutation({
    onMutate: async (input) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['quote', input.quoteId] });

      // Snapshot previous value
      const previous = queryClient.getQueryData(['quote', input.quoteId]);

      // Optimistically update to new value
      queryClient.setQueryData(['quote', input.quoteId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          status: 'sent',
          sentAt: new Date(),
          contactPhone: input.contactPhone,
          contactEmail: input.contactEmail,
        };
      });

      return { previous };
    },

    onError: (error, input, context) => {
      // Rollback optimistic update
      if (context?.previous) {
        queryClient.setQueryData(['quote', input.quoteId], context.previous);
      }

      // Show error toast
      toast({
        title: 'Error al enviar cotización',
        description: error.message,
        variant: 'destructive',
      });
    },

    onSuccess: (data) => {
      // Show success toast
      toast({
        title: '¡Cotización enviada!',
        description: 'El vendedor recibirá tu cotización pronto.',
      });

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['quote', data.id] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });

  return mutation;
}
```

**✅ Checkpoint**: Hook compiles, TypeScript types correct

---

### Phase 4: UI Components (Day 2-3)

**Goal**: Create Send button, contact modal, and status badges

#### Step 4.1: Status Badge Component

**File**: `src/app/(dashboard)/quotes/_components/quote-status-badge.tsx`

```typescript
import { Badge } from '@/components/ui/badge';
import { FileText, Send, XCircle } from 'lucide-react';
import type { QuoteStatus } from '@prisma/client';

type Props = {
  status: QuoteStatus;
};

export function QuoteStatusBadge({ status }: Props) {
  const config = {
    draft: {
      variant: 'secondary' as const,
      label: 'Borrador',
      icon: FileText,
      className: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    },
    sent: {
      variant: 'default' as const,
      label: 'Enviada',
      icon: Send,
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    },
    canceled: {
      variant: 'destructive' as const,
      label: 'Cancelada',
      icon: XCircle,
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    },
  }[status];

  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
}
```

#### Step 4.2: Contact Info Modal

**File**: `src/app/(dashboard)/quotes/[quoteId]/_components/contact-info-modal.tsx`

```typescript
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const contactSchema = z.object({
  contactPhone: z.string()
    .regex(/^\+?[1-9]\d{9,14}$/, 'Formato inválido. Ej: +573001234567')
    .min(10, 'Mínimo 10 dígitos')
    .max(15, 'Máximo 15 dígitos'),
  contactEmail: z.string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
});

type ContactFormData = z.infer<typeof contactSchema>;

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ContactFormData) => void;
  initialPhone?: string | null;
  isPending?: boolean;
};

export function ContactInfoModal({ 
  open, 
  onClose, 
  onSubmit, 
  initialPhone,
  isPending = false,
}: Props) {
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      contactPhone: initialPhone ?? '',
      contactEmail: '',
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
    form.reset();
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirma tus datos de contacto</DialogTitle>
          <DialogDescription>
            El vendedor usará esta información para ponerse en contacto contigo.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="+573001234567" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Incluye código de país (ej: +57 para Colombia)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="tu@email.com" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
              >
                {isPending ? 'Enviando...' : 'Confirmar y Enviar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

#### Step 4.3: Send Quote Button

**File**: `src/app/(dashboard)/quotes/[quoteId]/_components/send-quote-button.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSendQuote } from '@/hooks/use-send-quote';
import { ContactInfoModal } from './contact-info-modal';
import type { Quote } from '@prisma/client';

type Props = {
  quote: Pick<Quote, 'id' | 'status' | 'contactPhone'>;
};

export function SendQuoteButton({ quote }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const sendQuote = useSendQuote();

  // Only show for draft quotes
  if (quote.status !== 'draft') {
    return null;
  }

  const handleSubmit = (data: { contactPhone: string; contactEmail?: string }) => {
    sendQuote.mutate({
      quoteId: quote.id,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail || undefined,
    });
    setIsModalOpen(false);
  };

  return (
    <>
      <Button 
        onClick={() => setIsModalOpen(true)}
        disabled={sendQuote.isPending}
        className="w-full sm:w-auto"
      >
        <Send className="mr-2 h-4 w-4" />
        {sendQuote.isPending ? 'Enviando...' : 'Enviar Cotización'}
      </Button>

      <ContactInfoModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialPhone={quote.contactPhone}
        isPending={sendQuote.isPending}
      />
    </>
  );
}
```

#### Step 4.4: Update Quote Detail Page

**File**: `src/app/(dashboard)/quotes/[quoteId]/page.tsx`

```typescript
import { SendQuoteButton } from './_components/send-quote-button';
import { QuoteStatusBadge } from '../_components/quote-status-badge';

export default async function QuotePage({ params }: Props) {
  const quote = await api.quote['get-by-id']({ id: params.quoteId });

  return (
    <div>
      {/* Header with status badge */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Cotización #{quote.id.slice(-8)}</h1>
        <QuoteStatusBadge status={quote.status} />
      </div>

      {/* Quote details */}
      <div className="space-y-6">
        {/* ... existing quote detail content ... */}
        
        {/* Show sent date if applicable */}
        {quote.status === 'sent' && quote.sentAt && (
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              ✅ Cotización enviada el {new Date(quote.sentAt).toLocaleDateString('es-CO', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p className="mt-2 text-sm text-blue-600 dark:text-blue-300">
              El vendedor recibirá tu cotización y se pondrá en contacto contigo en 24-48 horas.
            </p>
          </div>
        )}

        {/* Send button (only for draft quotes) */}
        <SendQuoteButton quote={quote} />
      </div>
    </div>
  );
}
```

#### Step 4.5: Update Quote List

**File**: `src/app/(dashboard)/quotes/_components/quote-list.tsx`

```typescript
import { QuoteStatusBadge } from './quote-status-badge';

export function QuoteList({ quotes }: Props) {
  return (
    <div className="space-y-4">
      {quotes.map((quote) => (
        <div key={quote.id} className="rounded-lg border p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">
                {quote.projectName || `Cotización #${quote.id.slice(-8)}`}
              </h3>
              <p className="text-sm text-muted-foreground">
                {quote.status === 'sent' && quote.sentAt
                  ? `Enviada el ${formatDate(quote.sentAt)}`
                  : `Creada el ${formatDate(quote.createdAt)}`}
              </p>
            </div>
            <QuoteStatusBadge status={quote.status} />
          </div>
          
          {/* ... rest of quote card ... */}
        </div>
      ))}
    </div>
  );
}
```

**✅ Checkpoint**: UI components render correctly, modal works

---

### Phase 5: Testing (Day 4)

**Goal**: Write comprehensive tests for all layers

#### Step 5.1: Unit Tests (Zod Validation)

**File**: `tests/unit/quote/send-to-vendor-schema.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { sendToVendorInput } from '@/server/api/routers/quote/quote.schemas';

describe('sendToVendorInput schema', () => {
  it('accepts valid Colombian phone', () => {
    const result = sendToVendorInput.safeParse({
      quoteId: 'clx1a2b3c4d5e6f7g8h9i0j',
      contactPhone: '+573001234567',
    });
    
    expect(result.success).toBe(true);
  });

  it('rejects phone with dashes', () => {
    const result = sendToVendorInput.safeParse({
      quoteId: 'clx1a2b3c4d5e6f7g8h9i0j',
      contactPhone: '300-123-4567',
    });
    
    expect(result.success).toBe(false);
  });

  // Add more test cases from contract.md
});
```

#### Step 5.2: Integration Tests (tRPC Procedure)

**File**: `tests/integration/quote/send-to-vendor.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestQuote, createTestSession } from '@/tests/helpers';

describe('send-to-vendor procedure', () => {
  it('successfully sends draft quote', async () => {
    const session = await createTestSession();
    const quote = await createTestQuote({ 
      userId: session.user.id, 
      status: 'draft',
    });

    const result = await caller['send-to-vendor']({
      quoteId: quote.id,
      contactPhone: '+573001234567',
    });

    expect(result.status).toBe('sent');
    expect(result.sentAt).toBeInstanceOf(Date);
  });

  // Add more test cases from contract.md
});
```

#### Step 5.3: E2E Tests (Playwright)

**File**: `e2e/quotes/send-quote-to-vendor.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Send Quote to Vendor', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to quotes
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.goto('/quotes');
  });

  test('user can send draft quote successfully', async ({ page }) => {
    // Click on a draft quote
    await page.click('[data-status="draft"]');

    // Click send button
    await page.click('button:has-text("Enviar Cotización")');

    // Fill contact info
    await page.fill('input[name="contactPhone"]', '+573001234567');
    await page.fill('input[name="contactEmail"]', 'user@example.com');

    // Submit
    await page.click('button:has-text("Confirmar y Enviar")');

    // Verify success
    await expect(page.locator('text=¡Cotización enviada!')).toBeVisible();
    await expect(page.locator('[data-status="sent"]')).toBeVisible();
  });

  test('shows error for invalid phone format', async ({ page }) => {
    await page.click('[data-status="draft"]');
    await page.click('button:has-text("Enviar Cotización")');
    
    await page.fill('input[name="contactPhone"]', '300-123-4567');
    await page.click('button:has-text("Confirmar y Enviar")');

    await expect(page.locator('text=Formato inválido')).toBeVisible();
  });

  // Add more E2E scenarios
});
```

#### Step 5.4: Run All Tests

```bash
# Unit tests
pnpm test:unit

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# All tests
pnpm test
```

**✅ Checkpoint**: All tests pass, coverage > 80%

---

### Phase 6: Documentation & Cleanup (Day 5)

**Goal**: Document code, update CHANGELOG, prepare PR

#### Step 6.1: Add JSDoc Comments

```typescript
/**
 * Sends a draft quote to the vendor for professional refinement.
 *
 * @remarks
 * This mutation transitions the quote status from 'draft' to 'sent' and
 * captures the submission timestamp. Once sent, the quote cannot be un-sent.
 *
 * @throws {TRPCError} NOT_FOUND - Quote doesn't exist
 * @throws {TRPCError} FORBIDDEN - User doesn't own the quote
 * @throws {TRPCError} BAD_REQUEST - Quote is not in draft status or has no items
 *
 * @example
 * ```typescript
 * const result = await trpc.quote['send-to-vendor'].mutate({
 *   quoteId: 'clx1a2b3c4d5e6f7g8h9i0j',
 *   contactPhone: '+573001234567',
 * });
 * console.log(`Quote sent at ${result.sentAt}`);
 * ```
 */
```

#### Step 6.2: Update CHANGELOG

**File**: `CHANGELOG.md`

```markdown
## [Unreleased]

### Added
- **Feature 005: Send Quote to Vendor** ([#XXX](link-to-pr))
  - Added `sentAt` timestamp to Quote model for tracking submission date
  - Created `quote.send-to-vendor` tRPC mutation with contact validation
  - Implemented Send Quote button with contact info modal (React Hook Form)
  - Added status badges for draft/sent/canceled quotes
  - Integrated optimistic UI updates for instant feedback
  - Added comprehensive test coverage (unit, integration, E2E)

### Changed
- Updated Quote detail page to show submission timestamp for sent quotes
- Enhanced Quote list with visual status indicators

### Technical
- Migration: `20251013_add_quote_sent_at` - Added sentAt field to Quote table
- Dependencies: No new dependencies added
```

#### Step 6.3: Code Review Checklist

- [ ] All TypeScript errors resolved
- [ ] No ESLint/Biome warnings
- [ ] Winston logger only used server-side
- [ ] All components have proper JSDoc
- [ ] Spanish UI text, English code/comments
- [ ] Tests pass (unit, integration, E2E)
- [ ] Database migration tested
- [ ] No console.log statements left
- [ ] No TODOs or placeholders
- [ ] Responsive design tested (mobile/desktop)

#### Step 6.4: Create Pull Request

```bash
# Ensure on feature branch
git checkout 005-send-quote-to

# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat: add send quote to vendor functionality

- Add sentAt field to Quote model
- Create tRPC send-to-vendor mutation
- Implement UI with contact info modal
- Add status badges and optimistic updates
- Add comprehensive test coverage

Closes #XXX"

# Push to remote
git push origin 005-send-quote-to

# Create PR on GitHub
```

**✅ Checkpoint**: Feature complete, PR created, ready for review

---

## Troubleshooting

### Issue: Build fails with Winston error in Client Component

**Symptom**:
```
Module not found: Can't resolve 'fs' in '/path/to/winston'
```

**Solution**:
- Remove `import logger from '@/lib/logger'` from Client Components
- Use Winston ONLY in Server Components, Server Actions, tRPC procedures
- For client-side logging, use `console.log` (dev only) or toast notifications

### Issue: Optimistic update doesn't revert on error

**Symptom**: UI shows "sent" status even after mutation fails

**Solution**:
```typescript
onError: (error, input, context) => {
  // MUST rollback using context from onMutate
  if (context?.previous) {
    queryClient.setQueryData(['quote', input.quoteId], context.previous);
  }
}
```

### Issue: Phone validation rejects valid numbers

**Symptom**: "+573001234567" shows "Formato inválido"

**Solution**: Check regex pattern matches contract:
```typescript
/^\+?[1-9]\d{9,14}$/
```

### Issue: Migration fails with "column already exists"

**Symptom**: `ERROR: column "sentAt" of relation "Quote" already exists`

**Solution**:
```bash
# Reset migration (DEV ONLY)
pnpm prisma migrate reset

# Or drop column manually
psql -d your_db -c 'ALTER TABLE "Quote" DROP COLUMN "sentAt";'

# Re-run migration
pnpm prisma migrate dev
```

---

## Next Steps After Implementation

1. **Monitor in Production**:
   - Check Winston logs for `Quote sent to vendor` events
   - Monitor error rates (should be < 5%)
   - Track mutation latency (target < 200ms)

2. **User Feedback**:
   - Gather feedback on contact info modal UX
   - Validate phone format works for all regions
   - Check if "sent" status is clear enough

3. **Future Enhancements** (Post-MVP):
   - Email notifications to vendor (SendGrid/AWS SES)
   - WhatsApp Business API integration
   - CRM system webhooks (Salesforce, HubSpot)
   - Quote withdrawal within 1-hour window
   - Read receipts (vendor viewed quote)

---

## Resources

### Internal Documentation
- [Feature Spec](./spec.md) - Full feature specification
- [Research](./research.md) - Technical decisions
- [Data Model](./data-model.md) - Database changes
- [API Contract](./contracts/send-to-vendor.contract.md) - tRPC procedure contract

### External Resources
- [tRPC Docs](https://trpc.io/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Prisma Client](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Zod Validation](https://zod.dev/)

### Team Contacts
- **Technical Lead**: [Name] - Questions about architecture
- **Product Owner**: [Name] - Questions about requirements
- **QA Lead**: [Name] - Questions about testing

---

## Summary

**Estimated Effort**: 3-5 days

| Day | Focus | Deliverables |
|-----|-------|--------------|
| 1 | Database + Backend | Migration, tRPC procedure, schemas |
| 2 | Custom Hook + UI Components | useSendQuote, modal, button |
| 3 | UI Integration | Update pages, status badges |
| 4 | Testing | Unit, integration, E2E tests |
| 5 | Documentation + PR | JSDoc, CHANGELOG, code review |

**Key Success Metrics**:
- ✅ Users can submit quotes in < 30 seconds
- ✅ 95% success rate on submissions
- ✅ < 200ms mutation latency
- ✅ 100% visual distinction between draft/sent quotes
- ✅ Zero Winston logger usage in Client Components

**You're ready to start! Begin with Phase 1: Database Migration.**
