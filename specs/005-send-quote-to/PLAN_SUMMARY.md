# Plan de Implementación - Feature 005: Send Quote to Vendor

## Resumen Ejecutivo

**Status**: ✅ **COMPLETO** - Listo para implementación  
**Branch**: `005-send-quote-to`  
**Fecha**: 2025-10-13  
**Tiempo Estimado**: 3-5 días

---

## ✅ Documentos Generados

### Phase 0: Research & Discovery
- **[research.md](./research.md)** - 10 decisiones técnicas clave documentadas
  - Validación de contacto con Zod + React Hook Form
  - Transición de estado inmutable (draft → sent)
  - Arquitectura Server Components + Client Components
  - Winston logger solo server-side
  - Manejo de errores en 3 capas
  - Optimización de rendimiento con actualizaciones optimistas

### Phase 1: Design & Contracts
- **[data-model.md](./data-model.md)** - Modelo de datos completo
  - Cambio mínimo en schema: agregar campo `sentAt: DateTime?`
  - Migración backward-compatible (nullable field)
  - Sin nuevos índices necesarios
  - Validaciones a nivel de aplicación documentadas

- **[contracts/send-to-vendor.contract.md](./contracts/send-to-vendor.contract.md)** - Contrato API tRPC
  - Input schema: quoteId + contactPhone + contactEmail (opcional)
  - Output schema: quote con status 'sent' + sentAt
  - 5 tipos de errores documentados
  - Ejemplos de uso completos
  - Tests unitarios, integración y E2E

- **[quickstart.md](./quickstart.md)** - Guía de implementación paso a paso
  - 6 fases de implementación detalladas
  - Código completo para cada componente
  - Troubleshooting para problemas comunes
  - Checklist de code review

---

## 📋 Resumen del Plan

### Cambios en Base de Datos

```prisma
model Quote {
  // ... existing fields ...
  sentAt DateTime? // ✨ NUEVO: Timestamp de envío
}
```

**Migración**: `20251013_add_quote_sent_at`
- ✅ Non-breaking change (nullable field)
- ✅ Sin backfill necesario
- ✅ Sin impacto en performance

### Cambios en Backend (tRPC)

**Nuevo Procedure**: `quote.send-to-vendor`

```typescript
// Input
{
  quoteId: string;          // CUID
  contactPhone: string;     // Formato internacional
  contactEmail?: string;    // Opcional
}

// Output
{
  id: string;
  status: 'sent';
  sentAt: Date;
  contactPhone: string;
  total: number;
  currency: string;
}
```

**Validaciones**:
- Usuario autenticado
- Quote pertenece al usuario
- Status === 'draft'
- Quote tiene al menos 1 item
- Teléfono formato internacional

### Cambios en Frontend

**Nuevos Componentes**:
1. `SendQuoteButton` - Botón para enviar cotización (Client Component)
2. `ContactInfoModal` - Modal para capturar/confirmar contacto (React Hook Form)
3. `QuoteStatusBadge` - Badge para mostrar estado (draft/sent/canceled)

**Hook Personalizado**:
- `useSendQuote` - Maneja mutación con optimistic updates

**Páginas Actualizadas**:
- `quotes/[quoteId]/page.tsx` - Mostrar sentAt + SendQuoteButton
- `quotes/page.tsx` - Mostrar status badges en lista

---

## 🎯 Constitution Check - PASS ✅

Todos los principios de arquitectura cumplidos:

- ✅ **Single Responsibility**: Separación clara de responsabilidades
- ✅ **Open/Closed**: Extensión sin modificación
- ✅ **Test-First**: Plan de tests completo
- ✅ **Server-First**: Pages como Server Components
- ✅ **Integration Testing**: Tests de contrato definidos
- ✅ **Observability**: Winston logging server-side
- ✅ **Technology Stack**: Next.js 15, tRPC 11, Prisma 6

---

## 📊 Estructura de Archivos

### Archivos Nuevos (9)
```
src/
├── hooks/use-send-quote.ts                          # Hook personalizado
├── app/(dashboard)/quotes/
│   ├── _components/quote-status-badge.tsx           # Badge atómico
│   └── [quoteId]/_components/
│       ├── send-quote-button.tsx                    # Botón enviar
│       └── contact-info-modal.tsx                   # Modal contacto

prisma/migrations/20251013_add_quote_sent_at/
└── migration.sql                                    # Migración DB

tests/
├── unit/quote/
│   ├── send-to-vendor.test.ts                       # Tests unitarios
│   └── contact-validation.test.ts                   # Validación Zod
├── integration/quote/quote-submission.test.ts       # Tests integración
└── contract/quote/send-to-vendor.contract.test.ts   # Tests contrato

e2e/quotes/send-quote-to-vendor.spec.ts              # Tests E2E
```

### Archivos Modificados (4)
```
prisma/schema.prisma                                 # + sentAt field
src/server/api/routers/quote/
├── quote.ts                                         # + procedure
├── quote.schemas.ts                                 # + schemas
└── quote.service.ts                                 # + service method
```

---

## 🧪 Estrategia de Testing

### Distribución de Tests
- **70% Unit Tests**: Zod validation, utility functions
- **20% Integration Tests**: tRPC procedures, DB operations
- **10% E2E Tests**: Flujo completo de usuario

### Cobertura Objetivo
- ✅ Unit: > 90% coverage
- ✅ Integration: > 80% coverage
- ✅ E2E: Happy path + 5 edge cases

---

## 🚀 Fases de Implementación

| Día | Fase | Tareas | Checkpoint |
|-----|------|--------|------------|
| 1 | Database + Backend | Migración, tRPC procedure, schemas | Procedure funciona, DB actualizada |
| 2 | Hook + UI | useSendQuote, modal, button | Hook compila, modal funciona |
| 3 | Integración UI | Actualizar pages, status badges | UI completa, navegación funciona |
| 4 | Testing | Unit, integration, E2E tests | Todos los tests pasan |
| 5 | Documentación | JSDoc, CHANGELOG, PR | PR listo para review |

---

## ⚠️ Puntos Críticos

### Winston Logger (CRÍTICO)
```typescript
// ✅ PERMITIDO: Server-side
- Server Components
- Server Actions ('use server')
- tRPC procedures
- API Route Handlers

// ❌ PROHIBIDO: Client-side
- Client Components ('use client')
- Custom hooks en cliente
- Browser code
```

### Inmutabilidad de Estado
```typescript
// Una vez enviada, la cotización NO puede "des-enviarse"
// Usuario debe contactar al vendedor directamente para cancelar
```

### Sin Notificaciones (MVP)
```typescript
// NO implementar en MVP:
- Email notifications
- SMS notifications
- WhatsApp notifications
- Vendor dashboard
```

---

## 📈 Métricas de Éxito

| Métrica | Objetivo | Medición |
|---------|----------|----------|
| Tiempo de envío | < 30 seg | User testing |
| Tasa de éxito | 95% | Error logs |
| Latencia mutación | < 200ms | Database metrics |
| Claridad visual | 100% | User testing |
| Reducción soporte | 70% | Ticket tracking |

---

## 🔗 Enlaces de Documentación

### Interna
- [Spec Completa](./spec.md)
- [Research](./research.md)
- [Data Model](./data-model.md)
- [API Contract](./contracts/send-to-vendor.contract.md)
- [Quickstart](./quickstart.md)

### Externa
- [tRPC Docs](https://trpc.io/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Prisma Client](https://www.prisma.io/docs)
- [Next.js App Router](https://nextjs.org/docs/app)

---

## 🎯 Próximos Pasos

### 1. Comenzar Implementación
```bash
# Checkout feature branch
git checkout 005-send-quote-to

# Start with Phase 1: Database Migration
# Follow quickstart.md step by step
```

### 2. Consideración Importante
**Los módulos de admin aún no están listos**:
- ✅ Feature funciona sin admin portal
- ✅ Vendors usan sistema externo (como se especificó)
- ✅ Status 'sent' se actualiza en DB (vendors lo verán en su sistema)
- 🔮 Admin portal es feature futura (post-MVP)

### 3. Integraciones Futuras (Post-MVP)
- WhatsApp Business API
- CRM Systems (Salesforce, HubSpot, Zoho)
- Email Notifications (SendGrid, AWS SES)
- Quote withdrawal (1-hour window)
- Vendor dashboard in-app

---

## ✅ Checklist Pre-Implementación

- [x] Plan de implementación completo
- [x] Research de decisiones técnicas
- [x] Data model diseñado
- [x] API contract definido
- [x] Quickstart guide creado
- [x] Constitution check passed
- [x] Agent context actualizado
- [ ] Branch creado (si no existe)
- [ ] Comenzar implementación

---

## 💡 Consejos para el Desarrollador

1. **Sigue el quickstart.md**: Tiene todo el código necesario
2. **Test-First**: Escribe tests antes de implementar
3. **Winston Server-Only**: Revisa dos veces antes de usar logger
4. **Commits Pequeños**: Commit por cada fase completada
5. **Code Review**: Usa el checklist antes de crear PR

---

**Plan Status**: ✅ COMPLETO  
**Implementation Status**: ⏳ PENDIENTE  
**Next Command**: Comenzar con Phase 1 del quickstart.md

🚀 **¡Listo para implementar Feature 005!**
