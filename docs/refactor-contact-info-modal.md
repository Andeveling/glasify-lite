# Refactorización: ContactInfoModal - Testing & Verification Guide

## ✅ Cambios Completados

### Archivos Creados
- ✅ `src/app/_components/contact-info-modal.tsx` - Componente unificado

### Archivos Modificados
- ✅ `src/app/(dashboard)/quotes/[quoteId]/_components/send-quote-button.tsx`
- ✅ `src/app/(public)/my-quotes/[quoteId]/_components/send-quote-button.tsx`

### Archivos Eliminados
- ✅ `src/app/(dashboard)/quotes/[quoteId]/_components/contact-info-modal.tsx`
- ✅ `src/app/(public)/my-quotes/[quoteId]/_components/contact-info-modal.tsx`

---

## 🧪 Testing Manual

### 1. Flujo de Envío de Cotización (Dashboard - Admin)

```bash
# 1. Iniciar sesión como admin
# 2. Ir a /quotes
# 3. Seleccionar una cotización en estado "draft"
# 4. Click en "Enviar Cotización"
```

**Verificaciones**:
- ✅ Modal se abre con email pre-llenado (email del admin)
- ✅ Campo de email es read-only (no editable)
- ✅ PhoneInput muestra selector de país con bandera
- ✅ defaultCountry es "CO" (Colombia)
- ✅ Si la cotización tiene teléfono previo, se pre-llena
- ✅ Al seleccionar país, el prefijo se agrega automáticamente (+57, +1, etc.)
- ✅ Validación E164 funciona correctamente
- ✅ Al enviar, el modal se cierra y muestra toast de éxito
- ✅ La cotización cambia de estado "draft" a "sent"

### 2. Flujo de Envío de Cotización (Public - User)

```bash
# 1. Iniciar sesión como usuario normal
# 2. Ir a /my-quotes
# 3. Seleccionar una cotización en estado "draft"
# 4. Click en "Enviar Cotización"
```

**Verificaciones**:
- ✅ Modal se abre con email pre-llenado (email del usuario)
- ✅ Campo de email es read-only (no editable)
- ✅ PhoneInput muestra selector de país con bandera
- ✅ defaultCountry es "CO" (Colombia)
- ✅ Si la cotización tiene teléfono previo, se pre-llena
- ✅ Al seleccionar país, el prefijo se agrega automáticamente
- ✅ Validación E164 funciona correctamente
- ✅ Al enviar, el modal se cierra, muestra toast y refresca la página
- ✅ La cotización cambia de estado "draft" a "sent"

### 3. Validaciones de Formulario

**Casos de Prueba**:

1. **Email vacío (no debería pasar)**:
   - ❌ No debería ocurrir (siempre viene de sesión)
   - Si ocurre: "Correo electrónico inválido"

2. **Teléfono vacío**:
   - ❌ Error: "El teléfono es requerido"

3. **Teléfono con formato incorrecto**:
   - Ejemplo: "123" (sin prefijo)
   - ❌ Error: Validación E164 falla

4. **Teléfono válido**:
   - Colombia: +57 300 123 4567
   - USA: +1 212 555 1234
   - ✅ Envío exitoso

### 4. Interacción con PhoneInput

**Verificar**:
- ✅ Click en selector de país abre popover con lista de países
- ✅ Búsqueda de país funciona (ej: "colombia", "estados unidos")
- ✅ Flags se muestran correctamente
- ✅ Al seleccionar país, el código de llamada se muestra (+57, +1, etc.)
- ✅ Check mark aparece en el país seleccionado
- ✅ Input de teléfono acepta solo números
- ✅ Formato se aplica automáticamente (espacios entre grupos)

---

## 🔍 Verificación de Integración

### Backend (tRPC)

El procedimiento `quote['send-to-vendor']` espera:

```typescript
{
  quoteId: string;
  contactPhone: string;  // E164 format
  contactEmail?: string; // Opcional
}
```

**Verificar**:
- ✅ `contactPhone` llega en formato E164 (ej: "+573001234567")
- ✅ `contactEmail` llega con el email de la sesión
- ✅ Backend valida correctamente el formato

### Frontend (useSendQuote Hook)

```typescript
useSendQuote({
  redirectOnSuccess: false, // Public view
  // o
  redirectOnSuccess: true,  // Dashboard view (default)
});
```

**Verificar**:
- ✅ Dashboard: redirige después de envío exitoso
- ✅ Public: NO redirige, solo refresca (router.refresh())
- ✅ Toast se muestra en ambos casos
- ✅ Optimistic update funciona correctamente

---

## 🐛 Edge Cases a Probar

### 1. Usuario sin sesión
- **Escenario**: Sesión expirada mientras modal está abierto
- **Resultado esperado**: Email muestra "Cargando..." o error de autenticación

### 2. Cotización sin teléfono previo
- **Escenario**: Primera vez enviando cotización
- **Resultado esperado**: PhoneInput vacío, listo para ingresar número

### 3. Cotización con teléfono previo
- **Escenario**: Re-envío o edición de cotización
- **Resultado esperado**: PhoneInput pre-lleno con número existente

### 4. Cancelar modal
- **Escenario**: Abrir modal y hacer click en "Cancelar"
- **Resultado esperado**: Modal se cierra, form se resetea, no hay cambios

### 5. Envío durante loading
- **Escenario**: Intentar cerrar o reenviar mientras `isLoading=true`
- **Resultado esperado**: Botones deshabilitados, modal no se puede cerrar

### 6. Error de red
- **Escenario**: Fallo en la mutación tRPC
- **Resultado esperado**: Toast de error, modal permanece abierto, datos no se pierden

---

## 📊 Coverage Actual

### Archivos sin Tests
- ⚠️ `src/app/_components/contact-info-modal.tsx` (nuevo archivo)

### Tests Recomendados

#### Unit Tests

```typescript
// tests/unit/components/contact-info-modal.test.tsx

describe('ContactInfoModal', () => {
  it('should render with session email pre-filled', () => {
    // Mock useSession with user email
    // Render modal
    // Assert email field shows user email
  });

  it('should render PhoneInput with CO as default country', () => {
    // Render modal
    // Assert PhoneInput has defaultCountry="CO"
  });

  it('should pre-fill phone if defaultValues provided', () => {
    // Render modal with defaultValues.contactPhone
    // Assert PhoneInput shows the phone number
  });

  it('should validate required phone number', async () => {
    // Render modal
    // Submit without phone
    // Assert error message appears
  });

  it('should call onSubmit with E164 formatted phone', async () => {
    // Render modal
    // Fill phone: "300 123 4567"
    // Submit
    // Assert onSubmit called with "+573001234567"
  });

  it('should disable inputs and buttons when isLoading=true', () => {
    // Render modal with isLoading=true
    // Assert all inputs and buttons are disabled
  });

  it('should reset form when modal closes', () => {
    // Render modal with data
    // Close modal
    // Re-open modal
    // Assert form is empty (except email from session)
  });
});
```

#### E2E Tests

```typescript
// e2e/quotes/send-quote-with-contact.spec.ts

test.describe('Send Quote - Contact Info Modal', () => {
  test('should send quote with phone number from admin dashboard', async ({ page }) => {
    // Login as admin
    // Navigate to draft quote
    // Click "Enviar Cotización"
    // Assert modal opens with email pre-filled
    // Select country (+57)
    // Type phone number
    // Click "Enviar Cotización"
    // Assert toast appears
    // Assert quote status changed to "sent"
  });

  test('should send quote with phone number from public my-quotes', async ({ page }) => {
    // Login as user
    // Navigate to draft quote in /my-quotes
    // Click "Enviar Cotización"
    // Assert modal opens with email pre-filled
    // Select country (+1)
    // Type phone number
    // Click "Enviar Cotización"
    // Assert toast appears
    // Assert page refreshes
    // Assert quote status changed to "sent"
  });

  test('should validate phone number format', async ({ page }) => {
    // Login as user
    // Open send quote modal
    // Type invalid phone: "123"
    // Click "Enviar Cotización"
    // Assert error message appears
  });

  test('should keep modal open on network error', async ({ page }) => {
    // Login as user
    // Open send quote modal
    // Mock network error
    // Fill phone and submit
    // Assert error toast appears
    // Assert modal remains open
    // Assert phone data is not lost
  });
});
```

---

## 🚀 Deployment Checklist

Antes de hacer merge a `main`:

- [ ] Pruebas manuales completadas en ambos flujos (dashboard y public)
- [ ] Verificar que email se toma de sesión correctamente
- [ ] Verificar PhoneInput con múltiples países (+57, +1, +34, etc.)
- [ ] Verificar validación E164 en backend
- [ ] Verificar toast notifications (success y error)
- [ ] Verificar que archivos duplicados fueron eliminados
- [ ] Verificar que imports están correctos en SendQuoteButton (ambos)
- [ ] Revisar que no hay console.errors en browser
- [ ] Verificar accesibilidad (keyboard navigation, ARIA labels)
- [ ] Verificar responsive design (mobile, tablet, desktop)

---

## 🎯 Beneficios de la Refactorización

1. **DRY**: De 2 archivos idénticos → 1 componente compartido
2. **UX**: PhoneInput con selector visual vs Input text con regex
3. **Mantenibilidad**: Un solo lugar para actualizar lógica
4. **Consistencia**: Email siempre de sesión, no editable manualmente
5. **Performance**: SessionProvider ya provee useSession (no extra fetch)
6. **Seguridad**: Email de sesión garantiza que es del usuario autenticado

---

## 📚 Referencias

- [react-phone-number-input](https://www.npmjs.com/package/react-phone-number-input)
- [E164 Format](https://en.wikipedia.org/wiki/E.164)
- [NextAuth useSession](https://next-auth.js.org/getting-started/client#usesession)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
