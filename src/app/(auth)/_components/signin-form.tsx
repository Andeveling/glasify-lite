"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth-client";

// Constants
const MIN_PASSWORD_LENGTH = 6;

// Zod schema as single source of truth for form validation
const signInFormSchema = z.object({
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Ingresa un email válido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(
      MIN_PASSWORD_LENGTH,
      `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`
    ),
});

type SignInFormValues = z.infer<typeof signInFormSchema>;

type SignInFormProps = {
  isLoading?: boolean;
  error?: string | null;
};

export default function SignInForm({
  isLoading = false,
  error,
}: SignInFormProps) {
  const [isCredentialsLoading, setIsCredentialsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // React Hook Form with Zod resolver as single source of truth
  const form = useForm<SignInFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
    resolver: zodResolver(signInFormSchema),
  });

  const handleCredentialsSubmit = async (values: SignInFormValues) => {
    try {
      setIsCredentialsLoading(true);

      // Better Auth credentials sign in
      const result = await signIn.email({
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        form.setError("root", {
          message: "Email o contraseña incorrectos",
        });
      }
    } catch {
      form.setError("root", {
        message: "Error al iniciar sesión. Intenta nuevamente.",
      });
    } finally {
      setIsCredentialsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);

      // Better Auth Google sign in
      await signIn.social({
        callbackURL: "/admin",
        provider: "google",
      });
    } catch {
      form.setError("root", {
        message: "Error al conectar con Google. Intenta nuevamente.",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const isSubmitDisabled = isLoading || isCredentialsLoading || isGoogleLoading;

  return (
    <div className="space-y-6">
      <Button
        className="h-11 w-full bg-transparent font-medium"
        disabled={isSubmitDisabled}
        onClick={handleGoogleSignIn}
        size="lg"
        type="button"
        variant="outline"
      >
        {isGoogleLoading ? (
          <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-5 w-5" />
        )}
        Continuar con Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-border border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">
            O con tu email
          </span>
        </div>
      </div>

      <Form {...form}>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(handleCredentialsSubmit)}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium text-sm">Email</FormLabel>
                <FormControl>
                  <Input
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    className="h-11"
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="font-medium text-sm">
                    Contraseña
                  </FormLabel>
                  <button
                    className="text-primary text-sm hover:underline"
                    type="button"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <FormControl>
                  <Input
                    autoCapitalize="none"
                    autoComplete="current-password"
                    autoCorrect="off"
                    className="h-11"
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

          {/* Form-level error message */}
          {(form.formState.errors.root || error) && (
            <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
              {form.formState.errors.root?.message || error}
            </div>
          )}

          <Button
            className="h-11 w-full font-medium"
            disabled={isSubmitDisabled}
            size="lg"
            type="submit"
          >
            {isCredentialsLoading && (
              <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
            )}
            Iniciar Sesión
          </Button>
        </form>
      </Form>
    </div>
  );
}

// Export the schema for reuse in server-side validation if needed
export { signInFormSchema, type SignInFormValues };
