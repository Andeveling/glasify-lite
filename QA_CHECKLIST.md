# Manual QA Checklist - Glass Suppliers Dialog CRUD

**Feature**: Dialog-based Glass Supplier Management  
**Branch**: `013-standardize-glass-suppliers`  
**Status**: Ready for manual testing

## Pre-Test Environment Setup

- [ ] Database is running: `pnpm db:start` or `./start-database.sh`
- [ ] Seed data loaded: Run `pnpm db:seed`
- [ ] Dev server running: `pnpm dev`
- [ ] Logged in with admin account
- [ ] Navigated to: http://localhost:3000/dashboard/admin/glass-suppliers

## Functional Testing

### Test 1: Create Glass Supplier

**Steps**:
1. Click "Nuevo Proveedor" button
2. Fill form:
   - Name: `Test Supplier` (required)
   - Code: `TST` (optional)
   - Country: `Panama` (optional)
   - Website: `https://www.testsupplier.com` (optional)
   - Email: `contact@testsupplier.com` (optional)
   - Phone: `+507-1234-5678` (optional)
   - Notes: `Test supplier for QA` (optional)
   - Active: Toggle on (should be on by default)
3. Click "Crear Proveedor"

**Expected Results**:
- [ ] Success toast appears: "Proveedor creado correctamente"
- [ ] Dialog closes automatically
- [ ] New supplier appears in the list
- [ ] Data persists when page is refreshed

**Possible Issues**:
- Toast not appearing → Check Sonner library
- Dialog not closing → Check onSuccess callback
- Supplier not in list → Check cache invalidation

---

### Test 2: Edit Glass Supplier

**Steps**:
1. Click pencil icon (edit) on any supplier row
2. Dialog opens with "Editar Proveedor de Vidrio" title
3. Form pre-filled with existing data
4. Modify any field (e.g., change code or add notes)
5. Click "Guardar Cambios"

**Expected Results**:
- [ ] Dialog opens in edit mode with correct title
- [ ] Form shows existing data correctly
- [ ] Success toast: "Proveedor actualizado correctamente"
- [ ] Dialog closes automatically
- [ ] List shows updated data
- [ ] Changes persist after page refresh

**Possible Issues**:
- Form doesn't populate → Check defaultValues mapping
- Dialog doesn't close → Check onSuccess callback
- Changes don't appear → Check cache invalidation + router.refresh()

---

### Test 3: Delete Glass Supplier (No Relationships)

**Steps**:
1. Click trash icon on a supplier with NO related glass types
2. DeleteConfirmationDialog appears
3. Click "Eliminar" to confirm

**Expected Results**:
- [ ] Confirmation dialog appears
- [ ] Success toast: "Proveedor eliminado correctamente"
- [ ] Supplier removed from list immediately
- [ ] Removal persists after page refresh

**Possible Issues**:
- Toast not showing → Check toast implementation
- Supplier still in list → Check cache invalidation
- Page error → Check API error handling

---

### Test 4: Delete Glass Supplier (With Relationships)

**Steps**:
1. Find/create a supplier with related glass types
2. Click trash icon
3. Click "Eliminar" to confirm

**Expected Results**:
- [ ] Error toast appears with message about referential integrity
- [ ] Error message in Spanish (e.g., "No se puede eliminar...")
- [ ] Supplier remains in list
- [ ] Dialog can be retried

**Possible Issues**:
- Error not in Spanish → Check error message translation
- Error doesn't display → Check error toast handling
- Supplier deleted anyway → Check database constraints

---

### Test 5: Form Validation

**Test 5a: Empty Required Field**:
1. Open create dialog
2. Leave "Name" empty
3. Click "Crear Proveedor" without entering name

**Expected Results**:
- [ ] Error message appears below Name field (in red)
- [ ] Form doesn't submit
- [ ] Button doesn't show loading state

---

**Test 5b: Invalid Email**:
1. Open create dialog
2. Enter Name: `Test`
3. Enter Email: `invalid-email` (not valid format)
4. Try to submit (if validation is client-side)

**Expected Results**:
- [ ] Error appears if client validation exists
- [ ] Or server rejects with error toast

---

**Test 5c: Invalid URL**:
1. Enter Website: `not-a-url`
2. Try to submit

**Expected Results**:
- [ ] Validation message appears or server rejects

---

### Test 6: Dialog Interactions

**Test 6a: Close with Escape Key**:
1. Open dialog (any mode)
2. Press Escape key

**Expected Results**:
- [ ] Dialog closes
- [ ] Form resets for next use

---

**Test 6b: Close with Overlay Click**:
1. Open dialog
2. Click outside dialog (on overlay)

**Expected Results**:
- [ ] Dialog closes
- [ ] Form resets

---

**Test 6c: Close with Cancel Button**:
1. Open dialog
2. Click "Cancelar" button

**Expected Results**:
- [ ] Dialog closes
- [ ] Form resets

---

**Test 6d: Unsaved Changes Close**:
1. Open dialog
2. Fill in some data
3. Close dialog (Escape/overlay/cancel)

**Expected Results**:
- [ ] No confirmation dialog needed (per design)
- [ ] Dialog closes immediately
- [ ] Changes discarded

---

### Test 7: Loading States

**Steps**:
1. Create a slow network: Browser DevTools → Network tab → Throttle to "Slow 3G"
2. Open dialog and create supplier
3. Observe button and form during submission

**Expected Results**:
- [ ] Button shows loading spinner (Loader2 icon)
- [ ] Button text changes to "Crear Proveedor" (or "Guardando...")
- [ ] Form inputs are disabled (grayed out)
- [ ] Can't interact with form during submission

**Possible Issues**:
- Spinner doesn't appear → Check isPending state
- Inputs not disabled → Check disabled attribute binding
- Can submit twice → Check isPending guard

---

### Test 8: Toast Notifications (Spanish)

Verify all toast messages are in Spanish:

- [ ] Create success: "Proveedor creado correctamente"
- [ ] Update success: "Proveedor actualizado correctamente"
- [ ] Delete success: "Proveedor eliminado correctamente"
- [ ] Create loading: "Creando proveedor..."
- [ ] Update loading: "Actualizando proveedor..."
- [ ] Delete loading: "Eliminando proveedor..."
- [ ] Error messages in Spanish (if any occur)

---

### Test 9: List Refresh After Mutations

**Steps**:
1. Note current list content
2. Open dialog and create supplier
3. Observe list immediately after submission

**Expected Results**:
- [ ] List updates automatically (no manual refresh needed)
- [ ] New supplier appears at correct position (if sorted)
- [ ] List count/pagination updates correctly

**Possible Issues**:
- Old data still showing → Check cache invalidation
- Page needs manual refresh → Check router.refresh() call
- Wrong data displays → Check data mapping

---

### Test 10: Browser Navigation

**Steps**:
1. Perform mutations (create/edit/delete)
2. Use browser back/forward buttons
3. Verify page state

**Expected Results**:
- [ ] Browser back/forward works correctly
- [ ] List shows correct state
- [ ] No console errors

---

## Edge Cases Testing

### Edge Case 1: Rapid Clicks

**Steps**:
1. Open create dialog
2. Fill form quickly
3. Click "Crear Proveedor" multiple times rapidly

**Expected Results**:
- [ ] Only one request sent (mutations prevented duplicate)
- [ ] Only one success toast (not multiple)
- [ ] Only one supplier created (not duplicated)

---

### Edge Case 2: Network Error Simulation

**Steps**:
1. Open DevTools Network tab
2. Set to "Offline"
3. Try to create supplier
4. Set back to "Online"

**Expected Results**:
- [ ] Error toast appears
- [ ] Form stays open (can retry)
- [ ] Dialog can be closed and retried

---

### Edge Case 3: Session Expiration

**Steps**:
1. Open dialog
2. Wait for session to expire
3. Try to submit form

**Expected Results**:
- [ ] Redirect to login (or 401 error handled)
- [ ] Graceful error message

---

## UI/UX Validation

### Visual Consistency

- [ ] Dialog styling matches Services module
- [ ] Button styling matches (primary/outline)
- [ ] Form field styling consistent
- [ ] Spacing and alignment look good
- [ ] Loading spinner style is consistent
- [ ] Error messages display in red

### Accessibility

- [ ] Form labels are visible
- [ ] Form inputs are focusable (Tab key)
- [ ] Can submit with Enter key
- [ ] Error messages are readable
- [ ] Dialog title is clear

### Performance

- [ ] Dialog opens quickly (<200ms)
- [ ] Form submission completes in <1s (network dependent)
- [ ] List updates quickly after mutation (<500ms)
- [ ] No lag when typing in form fields

---

## Final Sign-Off

- [ ] All core functionality working (create/edit/delete)
- [ ] Form validation working correctly
- [ ] Loading states visible
- [ ] Toast notifications showing in Spanish
- [ ] List updates automatically
- [ ] No console errors
- [ ] No performance issues
- [ ] Dialog interactions smooth

**Overall Status**: 
- [ ] ✅ PASS - Ready for PR
- [ ] ⚠️ ISSUES - Needs fixes (list below)

**Issues Found** (if any):
```
1. 
2. 
3. 
```

**Tester Name**: _______________  
**Date**: _______________  
**Browser**: _______________

---

## Post-QA Steps

If all tests pass:
1. Push changes to branch
2. Create PR with title: `refactor(glass-suppliers): standardize with SOLID pattern`
3. Link to specification: `specs/013-standardize-glass-suppliers/spec.md`
4. Request code review

If issues found:
1. Document issues in this checklist
2. Fix issues in code
3. Re-test affected functionality
4. Verify fixes don't break anything else

