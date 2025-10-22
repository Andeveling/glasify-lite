import { renderHook } from '@testing-library/react';
import { useGlassSupplierMutations } from '@/app/(dashboard)/admin/glass-suppliers/_hooks/use-glass-supplier-mutations';
import { api } from '@/trpc/react';
import { toast } from 'sonner';
import { vi } from 'vitest';

vi.mock('@/trpc/react', () => ({
  api: {
    admin: {
      'glass-supplier': {
        create: {
          useMutation: vi.fn(),
        },
        update: {
          useMutation: vi.fn(),
        },
        delete: {
          useMutation: vi.fn(),
        },
      },
    },
    useUtils: vi.fn(() => ({
      admin: {
        'glass-supplier': {
          list: {
            invalidate: vi.fn(),
          },
        },
      },
    })),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

describe('useGlassSupplierMutations', () => {
  it('calls createMutation with correct data', () => {
    const mutate = vi.fn();
    (api.admin['glass-supplier'].create.useMutation as any).mockReturnValue({
      mutate,
    });
    const { result } = renderHook(() => useGlassSupplierMutations());
    const data = { name: 'Test' };
    result.current.createMutation.mutate(data);
    expect(mutate).toHaveBeenCalledWith(data);
  });

  it('calls updateMutation with id + data', () => {
    const mutate = vi.fn();
    (api.admin['glass-supplier'].update.useMutation as any).mockReturnValue({
      mutate,
    });
    const { result } = renderHook(() => useGlassSupplierMutations());
    const data = { id: '1', data: { name: 'Test' } };
    result.current.updateMutation.mutate(data);
    expect(mutate).toHaveBeenCalledWith(data);
  });

  it('invalidates cache on success', () => {
    const invalidate = vi.fn();
    (api.useUtils as any).mockReturnValue({
      admin: {
        'glass-supplier': {
          list: {
            invalidate,
          },
        },
      },
    });
    (api.admin['glass-supplier'].create.useMutation as any).mockImplementation(
      ({ onSuccess }: any) => {
        onSuccess();
        return { mutate: vi.fn() };
      }
    );
    renderHook(() => useGlassSupplierMutations());
    expect(invalidate).toHaveBeenCalled();
  });

  it('shows toasts for success/error', () => {
    (api.admin['glass-supplier'].create.useMutation as any).mockImplementation(
      ({ onSuccess, onError }: any) => {
        onSuccess();
        onError(new Error('Test Error'));
        return { mutate: vi.fn() };
      }
    );
    renderHook(() => useGlassSupplierMutations());
    expect(toast.success).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });
});
