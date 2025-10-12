'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Icons } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';

// Constants
const MIN_PASSWORD_LENGTH = 6;

// Zod schema as single source of truth for form validation
const signInFormSchema = z.object({
  email: z.string().min(1, 'El email es requerido').email('Ingresa un email válido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(MIN_PASSWORD_LENGTH, `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`),
});

type SignInFormValues = z.infer<typeof signInFormSchema>;

type SignInFormProps = {
  onSubmit?: (values: SignInFormValues) => Promise<void>;
  onGoogleSignIn?: () => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
};

export default function SignInForm({ onSubmit, onGoogleSignIn, isLoading = false, error }: SignInFormProps) {
  const [isCredentialsLoading, setIsCredentialsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // React Hook Form with Zod resolver as single source of truth
  const form = useForm<SignInFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
    resolver: zodResolver(signInFormSchema),
  });

  const handleCredentialsSubmit = async (values: SignInFormValues) => {
    try {
      setIsCredentialsLoading(true);

      if (onSubmit) {
        await onSubmit(values);
      } else {
        // Default NextAuth credentials sign in
        const result = await signIn('credentials', {
          email: values.email,
          password: values.password,
          redirect: false,
        });

        if (result?.error) {
          form.setError('root', {
            message: 'Email o contraseña incorrectos',
          });
        }
      }
    } catch {
      form.setError('root', {
        message: 'Error al iniciar sesión. Intenta nuevamente.',
      });
    } finally {
      setIsCredentialsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);

      if (onGoogleSignIn) {
        await onGoogleSignIn();
      } else {
        // Default NextAuth Google sign in
        // Redirect will be handled by middleware based on user role
        await signIn('google', { callbackUrl: '/auth/callback' });
      }
    } catch {
      form.setError('root', {
        message: 'Error al conectar con Google. Intenta nuevamente.',
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const isSubmitDisabled = isLoading || isCredentialsLoading || isGoogleLoading;

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleCredentialsSubmit)}>
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={isSubmitDisabled}
                      placeholder="tu@ejemplo.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input
                      autoCapitalize="none"
                      autoComplete="current-password"
                      autoCorrect="off"
                      disabled={isSubmitDisabled}
                      placeholder="••••••••"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Form-level error message */}
          {(form.formState.errors.root || error) && (
            <div className="text-destructive text-sm">{form.formState.errors.root?.message || error}</div>
          )}

          <Button className="w-full" disabled={isSubmitDisabled} type="submit">
            {isCredentialsLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Iniciar Sesión
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">O continúa con</span>
        </div>
      </div>

      <Button disabled={isSubmitDisabled} onClick={handleGoogleSignIn} type="button" variant="outline">
        {isGoogleLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}
        Google
      </Button>
    </div>
  );
}

// Export the schema for reuse in server-side validation if needed
export { signInFormSchema, type SignInFormValues };
