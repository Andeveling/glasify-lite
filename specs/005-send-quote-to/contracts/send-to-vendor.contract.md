# tRPC Contract: quote.send-to-vendor

**Feature**: Send Quote to Vendor  
**Date**: 2025-10-13  
**Purpose**: Define the API contract for the quote submission procedure

---

## Contract Overview

**Procedure Name**: `quote.send-to-vendor`  
**Type**: Mutation (protected)  
**Router**: `quoteRouter`  
**Authentication**: Required (protectedProcedure)

**Purpose**: Transition a draft quote to 'sent' status, capturing the submission timestamp and ensuring contact information is present.

---

## 1. Input Schema

### 1.1 TypeScript Type

```typescript
type SendToVendorInput = {
  quoteId: string;          // CUID of the quote to send
  contactPhone: string;     // User's contact phone (international format)
  contactEmail?: string;    // Optional: User's contact email
};
```

### 1.2 Zod Schema

```typescript
import { z } from 'zod';

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
```

### 1.3 Validation Rules

| Field          | Required | Type          | Constraints                   | Example                   |
| -------------- | -------- | ------------- | ----------------------------- | ------------------------- |
| `quoteId`      | ✅ Yes    | string (CUID) | Must be valid CUID format     | `clx1a2b3c4d5e6f7g8h9i0j` |
| `contactPhone` | ✅ Yes    | string        | Regex: `^\+?[1-9]\d{9,14}$`   | `+573001234567`           |
| `contactEmail` | ❌ No     | string        | Valid email format (RFC 5322) | `user@example.com`        |

**Phone Number Format**:
- Optional `+` prefix (international code)
- Must start with digit 1-9 (no leading zeros)
- Length: 10-15 digits (excluding `+`)
- Examples:
  - ✅ `+573001234567` (Colombia)
  - ✅ `573001234567` (without +)
  - ✅ `14155552671` (USA)
  - ❌ `300-123-4567` (dashes not allowed)
  - ❌ `+0123456789` (starts with 0)

---

## 2. Output Schema

### 2.1 TypeScript Type

```typescript
type SendToVendorOutput = {
  id: string;               // Quote ID
  status: 'sent';           // Always 'sent' after successful submission
  sentAt: Date;             // Timestamp of submission
  contactPhone: string;     // Confirmed contact phone
  contactEmail?: string;    // Confirmed contact email (if provided)
  total: number;            // Quote total amount
  currency: string;         // Currency code (e.g., 'COP')
};
```

### 2.2 Zod Schema

```typescript
export const sendToVendorOutput = z.object({
  id: z.string()
    .describe('ID de la cotización'),
  
  status: z.literal('sent')
    .describe('Estado de la cotización (siempre "sent")'),
  
  sentAt: z.date()
    .describe('Fecha y hora de envío'),
  
  contactPhone: z.string()
    .describe('Teléfono de contacto confirmado'),
  
  contactEmail: z.string()
    .optional()
    .describe('Email de contacto confirmado (si se proporcionó)'),
  
  total: z.number()
    .describe('Total de la cotización'),
  
  currency: z.string()
    .length(3)
    .describe('Código de moneda (ISO 4217)'),
});

export type SendToVendorOutput = z.infer<typeof sendToVendorOutput>;
```

### 2.3 Success Response

```json
{
  "id": "clx1a2b3c4d5e6f7g8h9i0j",
  "status": "sent",
  "sentAt": "2025-10-13T14:30:00.000Z",
  "contactPhone": "+573001234567",
  "contactEmail": "user@example.com",
  "total": 1500000,
  "currency": "COP"
}
```

---

## 3. Error Responses

### 3.1 Error Types

| Error Code              | HTTP Status | Condition                    | User Message (Spanish)                                                   |
| ----------------------- | ----------- | ---------------------------- | ------------------------------------------------------------------------ |
| `UNAUTHORIZED`          | 401         | User not authenticated       | `Debe iniciar sesión para enviar cotizaciones`                           |
| `FORBIDDEN`             | 403         | Quote doesn't belong to user | `No tiene permiso para enviar esta cotización`                           |
| `BAD_REQUEST`           | 400         | Quote status is not 'draft'  | `Solo las cotizaciones en borrador pueden ser enviadas`                  |
| `BAD_REQUEST`           | 400         | Quote has no items           | `La cotización debe tener al menos un producto`                          |
| `BAD_REQUEST`           | 400         | Invalid phone format         | `Formato de teléfono inválido. Use formato internacional: +573001234567` |
| `NOT_FOUND`             | 404         | Quote doesn't exist          | `Cotización no encontrada`                                               |
| `INTERNAL_SERVER_ERROR` | 500         | Database error               | `Error al procesar la solicitud. Intente nuevamente`                     |

### 3.2 Error Response Format

```typescript
type TRPCError = {
  message: string;
  code: string;
  data?: {
    code: string;
    httpStatus: number;
    path: string;
    zodError?: ZodError; // If validation error
  };
};
```

### 3.3 Error Examples

**Already Sent Quote**:
```json
{
  "message": "Solo las cotizaciones en borrador pueden ser enviadas",
  "code": "BAD_REQUEST",
  "data": {
    "code": "BAD_REQUEST",
    "httpStatus": 400,
    "path": "quote.send-to-vendor"
  }
}
```

**Invalid Phone Format**:
```json
{
  "message": "Formato de teléfono inválido. Use formato internacional: +573001234567",
  "code": "BAD_REQUEST",
  "data": {
    "code": "BAD_REQUEST",
    "httpStatus": 400,
    "path": "quote.send-to-vendor",
    "zodError": {
      "issues": [
        {
          "code": "invalid_string",
          "validation": "regex",
          "message": "Formato de teléfono inválido...",
          "path": ["contactPhone"]
        }
      ]
    }
  }
}
```

**Unauthorized Access**:
```json
{
  "message": "No tiene permiso para enviar esta cotización",
  "code": "FORBIDDEN",
  "data": {
    "code": "FORBIDDEN",
    "httpStatus": 403,
    "path": "quote.send-to-vendor"
  }
}
```

---

## 4. Business Logic Validation

### 4.1 Pre-condition Checks

```typescript
// Order of validation (fail fast)
1. ✅ User authentication (protectedProcedure)
2. ✅ Input schema validation (Zod)
3. ✅ Quote existence (findUnique)
4. ✅ Quote ownership (quote.userId === session.user.id)
5. ✅ Quote status (status === 'draft')
6. ✅ Quote has items (items.length > 0)
7. ✅ Quote total > 0
8. ✅ Execute mutation
```

### 4.2 Post-condition Guarantees

```typescript
// After successful mutation
1. ✅ Quote status === 'sent'
2. ✅ Quote sentAt is populated with current timestamp
3. ✅ Quote sentAt >= createdAt (temporal consistency)
4. ✅ Quote contactPhone is updated
5. ✅ Quote contactEmail is updated (if provided)
6. ✅ Winston logger emits success event
7. ✅ Database transaction committed
```

### 4.3 Idempotency

**NOT Idempotent**: Calling this procedure multiple times with the same input will fail after the first success.

**Reason**: Once a quote is sent (status = 'sent'), it cannot be re-sent. The second call will throw `BAD_REQUEST` error.

**Retry Strategy**: If mutation fails due to network error, client can safely retry. If fails due to business logic (status not draft), client should NOT retry.

---

## 5. Side Effects

### 5.1 Database Changes

```sql
-- Single UPDATE statement (atomic)
UPDATE "Quote"
SET 
  "status" = 'sent',
  "sentAt" = NOW(),
  "contactPhone" = $1,
  "contactEmail" = $2,  -- NULL if not provided
  "updatedAt" = NOW()
WHERE "id" = $3;
```

### 5.2 Logging Events

```typescript
// Success log (Winston - server-side only)
logger.info('Quote sent to vendor', {
  quoteId: quote.id,
  userId: session.user.id,
  sentAt: quote.sentAt,
  total: quote.total,
  currency: quote.currency,
  itemCount: quote.items.length,
});

// Error log
logger.error('Failed to send quote', {
  quoteId: input.quoteId,
  userId: session.user.id,
  error: error.message,
  stack: error.stack,
});
```

### 5.3 Cache Invalidation (Client-Side)

```typescript
// TanStack Query invalidation after mutation
queryClient.invalidateQueries(['quote', quoteId]);     // Refresh quote detail
queryClient.invalidateQueries(['quotes']);            // Refresh quote list
queryClient.invalidateQueries(['quotes', 'user']);    // Refresh user quotes
```

### 5.4 NO Side Effects (Explicitly Excluded)

- ❌ Email notifications (out of scope for MVP)
- ❌ SMS notifications (out of scope for MVP)
- ❌ WhatsApp notifications (out of scope for MVP)
- ❌ Webhook triggers (out of scope for MVP)
- ❌ CRM integration (out of scope for MVP)

---

## 6. Performance Characteristics

### 6.1 Expected Latency

| Operation        | Target  | Measured |
| ---------------- | ------- | -------- |
| Input validation | < 1ms   | TBD      |
| Database query   | < 50ms  | TBD      |
| Database update  | < 50ms  | TBD      |
| Total request    | < 200ms | TBD      |

### 6.2 Database Operations

```typescript
// Operations count per request
1. SELECT (findUnique): 1 query - fetch quote + items
2. UPDATE (update): 1 query - transition status
Total: 2 queries (no transaction needed for simple update)
```

### 6.3 Load Characteristics

- **Estimated frequency**: 10-50 requests/hour (peak)
- **Concurrency**: Low (user-initiated action)
- **Database load**: Minimal (2 queries per request)
- **Index usage**: `Quote_userId_status_idx` (existing)

---

## 7. Example Usage

### 7.1 Server-Side (tRPC Procedure)

```typescript
// src/server/api/routers/quote/quote.ts
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { sendToVendorInput, sendToVendorOutput } from './quote.schemas';

export const quoteRouter = createTRPCRouter({
  'send-to-vendor': protectedProcedure
    .input(sendToVendorInput)
    .output(sendToVendorOutput)
    .mutation(async ({ ctx, input }) => {
      // 1. Fetch quote with items
      const quote = await ctx.db.quote.findUnique({
        where: { id: input.quoteId },
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
      if (quote.userId !== ctx.session.user.id) {
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
      const updated = await ctx.db.quote.update({
        where: { id: input.quoteId },
        data: {
          status: 'sent',
          sentAt: new Date(),
          contactPhone: input.contactPhone,
          contactEmail: input.contactEmail,
        },
        select: {
          id: true,
          status: true,
          sentAt: true,
          contactPhone: true,
          contactEmail: true,
          total: true,
          currency: true,
        },
      });

      // 7. Log success
      logger.info('Quote sent to vendor', {
        quoteId: updated.id,
        userId: ctx.session.user.id,
        sentAt: updated.sentAt,
      });

      return updated;
    }),
});
```

### 7.2 Client-Side (React Hook)

```typescript
// src/hooks/use-send-quote.ts
'use client';

import { api } from '@/trpc/react';
import { toast } from '@/hooks/use-toast';

export function useSendQuote() {
  const queryClient = useQueryClient();
  
  const mutation = api.quote['send-to-vendor'].useMutation({
    onMutate: async (input) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['quote', input.quoteId]);
      
      // Optimistic update
      const previous = queryClient.getQueryData(['quote', input.quoteId]);
      queryClient.setQueryData(['quote', input.quoteId], (old: any) => ({
        ...old,
        status: 'sent',
        sentAt: new Date(),
        contactPhone: input.contactPhone,
      }));
      
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
      
      // Invalidate queries
      queryClient.invalidateQueries(['quote', data.id]);
      queryClient.invalidateQueries(['quotes']);
    },
  });
  
  return mutation;
}
```

### 7.3 Client-Side (Component)

```typescript
// src/app/(dashboard)/quotes/[quoteId]/_components/send-quote-button.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSendQuote } from '@/hooks/use-send-quote';
import { ContactInfoModal } from './contact-info-modal';

export function SendQuoteButton({ quote }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const sendQuote = useSendQuote();
  
  const handleSubmit = (data: { contactPhone: string; contactEmail?: string }) => {
    sendQuote.mutate({
      quoteId: quote.id,
      ...data,
    });
    setIsModalOpen(false);
  };
  
  if (quote.status !== 'draft') {
    return null; // Only show for draft quotes
  }
  
  return (
    <>
      <Button 
        onClick={() => setIsModalOpen(true)}
        disabled={sendQuote.isPending}
      >
        {sendQuote.isPending ? 'Enviando...' : 'Enviar Cotización'}
      </Button>
      
      <ContactInfoModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialPhone={quote.contactPhone}
      />
    </>
  );
}
```

---

## 8. Testing Contract

### 8.1 Unit Tests (Zod Validation)

```typescript
// tests/unit/quote/send-to-vendor-schema.test.ts
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
  
  it('accepts valid US phone', () => {
    const result = sendToVendorInput.safeParse({
      quoteId: 'clx1a2b3c4d5e6f7g8h9i0j',
      contactPhone: '+14155552671',
    });
    
    expect(result.success).toBe(true);
  });
  
  it('rejects phone with invalid format', () => {
    const result = sendToVendorInput.safeParse({
      quoteId: 'clx1a2b3c4d5e6f7g8h9i0j',
      contactPhone: '300-123-4567',
    });
    
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain('Formato de teléfono inválido');
  });
  
  it('rejects phone starting with 0', () => {
    const result = sendToVendorInput.safeParse({
      quoteId: 'clx1a2b3c4d5e6f7g8h9i0j',
      contactPhone: '+0123456789',
    });
    
    expect(result.success).toBe(false);
  });
  
  it('accepts optional email', () => {
    const result = sendToVendorInput.safeParse({
      quoteId: 'clx1a2b3c4d5e6f7g8h9i0j',
      contactPhone: '+573001234567',
      contactEmail: 'user@example.com',
    });
    
    expect(result.success).toBe(true);
  });
  
  it('rejects invalid email', () => {
    const result = sendToVendorInput.safeParse({
      quoteId: 'clx1a2b3c4d5e6f7g8h9i0j',
      contactPhone: '+573001234567',
      contactEmail: 'invalid-email',
    });
    
    expect(result.success).toBe(false);
  });
});
```

### 8.2 Integration Tests (tRPC Procedure)

```typescript
// tests/integration/quote/send-to-vendor.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createCallerFactory } from '@/server/api/trpc';
import { quoteRouter } from '@/server/api/routers/quote/quote';

describe('send-to-vendor procedure', () => {
  const createCaller = createCallerFactory(quoteRouter);
  let caller: ReturnType<typeof createCaller>;
  let testQuote: Quote;
  
  beforeEach(async () => {
    // Create test user and quote
    const session = await createTestSession();
    caller = createCaller({ session, db });
    testQuote = await createTestQuote({ userId: session.user.id, status: 'draft' });
  });
  
  it('successfully sends draft quote', async () => {
    const result = await caller['send-to-vendor']({
      quoteId: testQuote.id,
      contactPhone: '+573001234567',
    });
    
    expect(result.status).toBe('sent');
    expect(result.sentAt).toBeInstanceOf(Date);
    expect(result.contactPhone).toBe('+573001234567');
  });
  
  it('throws error for already sent quote', async () => {
    const sentQuote = await createTestQuote({ 
      userId: session.user.id, 
      status: 'sent',
      sentAt: new Date(),
    });
    
    await expect(
      caller['send-to-vendor']({
        quoteId: sentQuote.id,
        contactPhone: '+573001234567',
      })
    ).rejects.toThrowError('Solo las cotizaciones en borrador pueden ser enviadas');
  });
  
  it('throws error for quote with no items', async () => {
    const emptyQuote = await createTestQuote({ 
      userId: session.user.id, 
      status: 'draft',
      items: [], // No items
    });
    
    await expect(
      caller['send-to-vendor']({
        quoteId: emptyQuote.id,
        contactPhone: '+573001234567',
      })
    ).rejects.toThrowError('La cotización debe tener al menos un producto');
  });
  
  it('throws error for unauthorized user', async () => {
    const otherUserQuote = await createTestQuote({ 
      userId: 'different-user-id', 
      status: 'draft',
    });
    
    await expect(
      caller['send-to-vendor']({
        quoteId: otherUserQuote.id,
        contactPhone: '+573001234567',
      })
    ).rejects.toThrowError('No tiene permiso para enviar esta cotización');
  });
});
```

### 8.3 Contract Tests (Input/Output)

```typescript
// tests/contract/quote/send-to-vendor.contract.test.ts
import { describe, it, expect } from 'vitest';
import { sendToVendorInput, sendToVendorOutput } from '@/server/api/routers/quote/quote.schemas';

describe('send-to-vendor contract', () => {
  describe('input contract', () => {
    it('enforces required fields', () => {
      const result = sendToVendorInput.safeParse({});
      
      expect(result.success).toBe(false);
      expect(result.error?.issues).toHaveLength(2); // quoteId, contactPhone
    });
    
    it('validates CUID format for quoteId', () => {
      const result = sendToVendorInput.safeParse({
        quoteId: 'not-a-cuid',
        contactPhone: '+573001234567',
      });
      
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toContain('ID de cotización inválido');
    });
  });
  
  describe('output contract', () => {
    it('ensures status is always "sent"', () => {
      const result = sendToVendorOutput.safeParse({
        id: 'clx1a2b3c4d5e6f7g8h9i0j',
        status: 'draft', // Wrong status
        sentAt: new Date(),
        contactPhone: '+573001234567',
        total: 1000,
        currency: 'COP',
      });
      
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toContain('status');
    });
    
    it('requires sentAt to be present', () => {
      const result = sendToVendorOutput.safeParse({
        id: 'clx1a2b3c4d5e6f7g8h9i0j',
        status: 'sent',
        // sentAt missing
        contactPhone: '+573001234567',
        total: 1000,
        currency: 'COP',
      });
      
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toContain('sentAt');
    });
  });
});
```

---

## Summary

### Contract Guarantees

✅ **Input Validation**: All inputs validated with Zod before execution  
✅ **Type Safety**: End-to-end TypeScript inference from client to server  
✅ **Error Handling**: Structured error responses with Spanish messages  
✅ **Idempotency**: NOT idempotent (by design - prevents duplicate sends)  
✅ **Performance**: < 200ms target latency  
✅ **Security**: Authentication required, ownership validated  
✅ **Audit Trail**: Winston logging on server, cache invalidation on client  

### Testing Coverage

✅ **Unit Tests**: Zod schema validation (input/output)  
✅ **Integration Tests**: tRPC procedure logic, database operations  
✅ **Contract Tests**: Input/output schema adherence  
✅ **E2E Tests**: Complete user flow (planned in separate file)  

**Contract is complete and ready for implementation.**
