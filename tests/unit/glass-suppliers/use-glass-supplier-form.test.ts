import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useGlassSupplierForm } from '@/app/(dashboard)/admin/glass-suppliers/_hooks/use-glass-supplier-form';

describe('useGlassSupplierForm', () => {
  it('initializes with empty values in create mode', () => {
    const { result } = renderHook(() => useGlassSupplierForm({ mode: 'create', open: true }));
    expect(result.current.form.getValues()).toEqual({
      code: '',
      contactEmail: '',
      contactPhone: '',
      country: '',
      isActive: true,
      name: '',
      notes: '',
      website: '',
    });
  });

  it('initializes with defaultValues in edit mode', () => {
    const defaultValues = {
      code: 'TST',
      contactEmail: 'test@test.com',
      contactPhone: '1234567890',
      country: 'Testland',
      isActive: false,
      name: 'Test Supplier',
      notes: 'Test notes',
      website: 'https://test.com',
    };
    const { result } = renderHook(() => useGlassSupplierForm({ defaultValues, mode: 'edit', open: true }));
    expect(result.current.form.getValues()).toEqual(defaultValues);
  });

  it('validates required fields', async () => {
    const { result } = renderHook(() => useGlassSupplierForm({ mode: 'create', open: true }));
    await act(async () => {
      await result.current.form.trigger();
    });
    expect(result.current.form.formState.errors.name).toBeDefined();
  });

  it('validates optional field formats', async () => {
    const { result } = renderHook(() => useGlassSupplierForm({ mode: 'create', open: true }));
    await act(async () => {
      result.current.form.setValue('contactEmail', 'invalid-email');
      result.current.form.setValue('website', 'invalid-url');
      await result.current.form.trigger();
    });
    expect(result.current.form.formState.errors.contactEmail).toBeDefined();
    expect(result.current.form.formState.errors.website).toBeDefined();
  });

  it('prevents submission when form is invalid', async () => {
    const { result } = renderHook(() => useGlassSupplierForm({ mode: 'create', open: true }));
    const onSubmit = vi.fn();
    await act(async () => {
      await result.current.form.handleSubmit(onSubmit)();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
