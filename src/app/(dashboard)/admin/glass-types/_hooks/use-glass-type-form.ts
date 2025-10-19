/**
 * useGlassTypeForm Hook
 *
 * Main form orchestration hook - combines form state, validation, and mutations
 *
 * @module _hooks/use-glass-type-form
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  type CreateGlassTypeInput,
  createGlassTypeSchema,
  type GetGlassTypeByIdOutput,
} from '@/lib/validations/admin/glass-type.schema';
import { useFormDefaults } from './use-form-defaults';
import { useGlassTypeMutations } from './use-glass-type-mutations';

interface UseGlassTypeFormOptions {
  mode: 'create' | 'edit';
  defaultValues?: GetGlassTypeByIdOutput;
  onSuccessCallback?: () => void;
}

/**
 * Main form hook - orchestrates form state, validation and mutations
 *
 * @param options - Form configuration (mode, defaultValues, callbacks)
 * @returns Form instance, submit handler, and loading state
 */
export function useGlassTypeForm({ mode, defaultValues, onSuccessCallback }: UseGlassTypeFormOptions) {
  const formDefaults = useFormDefaults(defaultValues);
  const { createMutation, updateMutation, isLoading } = useGlassTypeMutations({
    onSuccessCallback,
  });

  const form = useForm<CreateGlassTypeInput>({
    defaultValues: formDefaults,
    resolver: zodResolver(createGlassTypeSchema),
  });

  const handleSubmit = (data: CreateGlassTypeInput) => {
    if (mode === 'create') {
      createMutation.mutate(data);
    } else if (defaultValues) {
      updateMutation.mutate({
        data,
        id: defaultValues.id,
      });
    }
  };

  return {
    form,
    handleSubmit,
    isLoading,
  };
}
