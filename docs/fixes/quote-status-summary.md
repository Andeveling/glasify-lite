# Quote Status Semantic Clarification - Summary

## Cambio Realizado ✅

Se cambió la semántica del estado "draft" de cotizaciones para reflejar correctamente su naturaleza **inmutable** y evitar confusión con funcionalidad de edición que no existe.

---

## Antes vs Después

### Estado "draft" - ANTES ❌

| Aspecto     | Valor Anterior                                                     | Problema                          |
| ----------- | ------------------------------------------------------------------ | --------------------------------- |
| **Label**   | "En edición"                                                       | Sugiere editabilidad (falso)      |
| **Icon**    | Edit3 (lápiz)                                                      | Icono de editar (confuso)         |
| **Tooltip** | "Esta cotización está en edición. Puedes continuar modificándola." | Promete funcionalidad inexistente |
| **CTA**     | action: 'edit', label: 'Continuar editando'                        | Acción imposible de ejecutar      |

### Estado "draft" - DESPUÉS ✅

| Aspecto     | Valor Nuevo                                                                                                      | Beneficio                          |
| ----------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| **Label**   | "Pendiente"                                                                                                      | Indica estado de espera (claridad) |
| **Icon**    | FileText (documento)                                                                                             | Icono neutral (no sugiere editar)  |
| **Tooltip** | "Esta cotización fue generada desde el carrito y está lista para enviar. Revisa los detalles antes de enviarla." | Descripción honesta del estado     |
| **CTA**     | action: 'view', label: 'Ver detalles'                                                                            | Acción realista y ejecutable       |

---

## Principio UX Aplicado: "Don't Make Me Think"

### Confusión Eliminada

**Antes**: Usuario ve "En edición" → intenta editar → no encuentra cómo → frustración  
**Después**: Usuario ve "Pendiente" → entiende que falta enviar → busca botón de envío (futuro) → claridad

### Promesas Cumplidas

- ✅ Label honesto: "Pendiente" = esperando acción, no editando
- ✅ Tooltip realista: explica qué es y qué hacer, no promete edición
- ✅ CTA ejecutable: "Ver detalles" funciona, no promete "Continuar editando"

---

## Arquitectura: Por Qué las Cotizaciones Son Inmutables

### Flujo de Generación

```
1. Usuario → Catálogo
2. Configurar modelo → Agregar al carrito
3. Repetir para más productos
4. Carrito → "Generar cotización"
   ↓
   - Precios se **capturan** del momento actual
   - Items se **transfieren** de Cart → Quote
   - Carrito se **vacía**
   - Quote creada con status: 'draft'
   ↓
5. Usuario ve cotización en /my-quotes
   - Status badge: "Pendiente" (Amber)
   - Solo lectura (view mode)
   - Puede exportar PDF/Excel
```

### Razones de Inmutabilidad

1. **Vigencia**: Quotes expiran en X días (config: `quoteValidityDays`)
   - Permitir edición invalidaría la fecha de expiración
   - ¿Editar el día 14 de 15? Raro y confuso

2. **Precios fijos**: Precios se capturan al generar
   - Modelos pueden tener cambios de precio después
   - Editar = recalcular con precios nuevos = cotización diferente

3. **Historial**: Quote es propuesta formal al cliente
   - Debe quedar registro inmutable de lo ofrecido
   - Cambios = nueva cotización (duplicar)

4. **Lógica de negocio**: Quote representa oferta formal
   - Una vez generada, debe permanecer tal cual
   - Cliente debe poder confiar en que no cambiará

---

## Estados de Cotización - Semántica Completa

### 1. Draft (Pendiente) 🟡

**Significado**: Cotización generada, esperando envío al vendedor/cliente

**Características**:
- Creada desde carrito (cart vacío después)
- Precios capturados del momento de generación
- **Solo lectura** (no editable)
- Vigencia activa (hasta `validUntil`)

**Acciones disponibles**:
- ✅ Ver detalles
- ✅ Exportar PDF/Excel
- ✅ (Futuro) Enviar al vendedor → cambia a "sent"
- ✅ Cancelar → cambia a "canceled"
- ✅ (Futuro) Duplicar → crea nueva quote con precios actuales

**Color badge**: Amber/Yellow (secondary) - indica acción pendiente

---

### 2. Sent (Enviada) 🔵

**Significado**: Cotización enviada al vendedor/cliente, esperando respuesta

**Características**:
- Ya fue enviada (email, WhatsApp, etc.)
- Aún vigente (hasta `validUntil`)
- Cliente la está revisando

**Acciones disponibles**:
- ✅ Ver detalles
- ✅ Exportar PDF/Excel
- ✅ (Futuro) Reenviar cotización
- ✅ Cancelar → cambia a "canceled"

**Color badge**: Blue (default) - estado informacional

---

### 3. Canceled (Cancelada) 🔴

**Significado**: Cotización cancelada, ya no activa

**Características**:
- Usuario la canceló manualmente
- No está activa (pero se mantiene para historial)
- Puede estar expirada o no

**Acciones disponibles**:
- ✅ Ver detalles (solo lectura)
- ✅ Exportar PDF/Excel
- ✅ (Futuro) Duplicar → crear nueva versión

**Color badge**: Red (destructive) - estado negativo

---

## Archivos Modificados

### 1. `src/app/(public)/my-quotes/_utils/status-config.ts`

**Cambios**:
```diff
draft: {
-  label: 'En edición',
+  label: 'Pendiente',
-  icon: Edit3,
+  icon: FileText,
-  iconName: 'edit',
+  iconName: 'file-text',
-  tooltip: 'Esta cotización está en edición. Puedes continuar modificándola.',
+  tooltip: 'Esta cotización fue generada desde el carrito y está lista para enviar. Revisa los detalles antes de enviarla.',
-  cta: { action: 'edit', label: 'Continuar editando' },
+  cta: { action: 'view', label: 'Ver detalles' },
}
```

### 2. `prisma/schema.prisma`

**Cambios**:
```diff
+/// Quote lifecycle status
+/// - draft: Generated from cart, pending review/send (read-only, not editable)
+/// - sent: Sent to vendor/client, awaiting response
+/// - canceled: Canceled and no longer active
enum QuoteStatus {
  draft
  sent
  canceled
}
```

### 3. `src/server/api/routers/quote/quote.service.ts`

**Cambios**:
```diff
-  status: 'draft', // Initial status is draft
+  status: 'draft', // Initial status: pending review/send (read-only, not editable after creation)
```

### 4. Documentación

**Nuevos archivos**:
- `docs/fixes/quote-status-semantic-clarification.md` - Explicación completa del problema y solución
- `tests/unit/status-config.test.ts` - Tests para validar configuración de estados

---

## Tests Creados

### Test Suite: `status-config.test.ts`

**Cobertura**:
- ✅ Draft status tiene label "Pendiente" (no "En edición")
- ✅ Draft usa icono FileText (no Edit3)
- ✅ Draft tooltip indica solo lectura
- ✅ Draft CTA es "view" (no "edit")
- ✅ Todos los estados tienen estructura consistente
- ✅ Ningún estado sugiere editabilidad para draft
- ✅ Iconos coinciden con semántica (FileText, Send, XCircle)

**Comando**:
```bash
pnpm test status-config.test.ts
```

---

## Verificación de Build

### TypeScript Check ✅

```bash
$ pnpm typecheck
# Sin errores - compilación exitosa
```

### Next.js Build ✅

```bash
$ pnpm build
✓ Compiled successfully
✓ Generating static pages (12/12)
# Build completo sin errores
```

---

## Impacto en Usuarios

### Experiencia Mejorada

**Antes**:
1. Usuario genera cotización
2. Ve badge "En edición" 🤔
3. Intenta editar... no encuentra cómo ❌
4. Confusión y frustración

**Después**:
1. Usuario genera cotización
2. Ve badge "Pendiente" ✅
3. Entiende que debe enviarla
4. Busca botón de envío (feature futuro) o exporta PDF

### Expectativas Alineadas

- ✅ Label honesto = usuario no espera edición
- ✅ Tooltip claro = usuario sabe qué hacer
- ✅ Sin frustración = mejor UX

---

## Próximos Pasos (Futuros Features)

### 1. Botón "Enviar Cotización" (Alta prioridad)

**User Story**: Como usuario, quiero enviar mi cotización pendiente al vendedor

**Implementación**:
- Botón visible solo para `status: 'draft'`
- Modal para confirmar envío (email, teléfono, mensaje)
- Actualizar status: `draft` → `sent`
- (Opcional) Enviar email/WhatsApp

### 2. Función "Duplicar Cotización" (Media prioridad)

**User Story**: Como usuario, quiero crear nueva cotización basada en una existente

**Implementación**:
- Botón visible para todos los estados (especialmente `canceled`)
- Copiar items de Quote → Cart
- Usuario puede modificar en cart antes de generar nueva quote
- Nueva quote tendrá precios actuales y nueva fecha de vigencia

### 3. Historial de Cambios de Precio (Baja prioridad)

**User Story**: Como usuario, quiero ver si los precios han cambiado desde que generé la cotización

**Implementación**:
- Comparar precios de Quote vs precios actuales en catálogo
- Mostrar badge "Precios actualizados" si hay diferencias
- Sugerir duplicar para obtener nueva cotización con precios actuales

---

## Conclusión

✅ **Problema resuelto**: Confusión entre label "En edición" y realidad (no editable)  
✅ **Solución aplicada**: Cambio de semántica a "Pendiente" (honesto y claro)  
✅ **Principio UX aplicado**: Don't Make Me Think (claridad inmediata)  
✅ **Arquitectura documentada**: Inmutabilidad de quotes explicada  
✅ **Tests creados**: Validación de configuración de estados  
✅ **Build exitoso**: Sin errores, listo para producción

**Status**: ✅ **COMPLETO** - Ready for production
