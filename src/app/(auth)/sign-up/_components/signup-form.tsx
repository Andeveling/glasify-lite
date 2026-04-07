"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
import { authClient } from "@/lib/auth-client";

// Constants
const MIN_PASSWORD_LENGTH = 6;

// Zod schema as single source of truth for form validation
const signUpFormSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres"),
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

type SignUpFormValues = z.infer<typeof signUpFormSchema>;

type SignUpFormProps = {
  isLoading?: boolean;
  error?: string | null;
};

export default function SignUpForm({
  isLoading = false,
  error,
}: SignUpFormProps) {
  const router = useRouter();
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  // React Hook Form with Zod resolver as single source of truth
  const form = useForm<SignUpFormValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    mode: "onBlur",
    resolver: zodResolver(signUpFormSchema),
  });

  const handleSubmit = async (values: SignUpFormValues) => {
    try {
      setIsSubmitLoading(true);

      // Better Auth credentials sign up
      // Cast to unknown first, then to the expected type to satisfy linter
      type SignUpEmailFn = (opts: {
        email: string;
        password: string;
        name: string;
      }) => Promise<{ error: { message: string } | null }>;
      const signUpEmail = authClient.signUp.email as SignUpEmailFn;
      const { error: signUpError } = await signUpEmail({
        email: values.email,
        password: values.password,
        name: values.name,
      });

      if (signUpError) {
        form.setError("root", {
          message: signUpError.message || "Error al crear la cuenta",
        });
        return;
      }

      // Redirect to admin on success
      router.push("/admin");
    } catch {
      form.setError("root", {
        message: "Error al crear la cuenta. Intenta nuevamente.",
      });
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const isSubmitDisabled = isLoading || isSubmitLoading;

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium text-sm">Nombre</FormLabel>
              <FormControl>
                <Input
                  autoCapitalize="words"
                  autoComplete="name"
                  autoCorrect="off"
                  className="h-11"
                  disabled={isSubmitDisabled}
                  placeholder="Tu nombre"
                  type="text"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
              <FormLabel className="font-medium text-sm">Contraseña</FormLabel>
              <FormControl>
                <Input
                  autoCapitalize="none"
                  autoComplete="new-password"
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
        {form.formState.errors.root || error ? (
          <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
            {form.formState.errors.root?.message || error}
          </div>
        ) : null}

        <Button
          className="h-11 w-full font-medium"
          disabled={isSubmitDisabled}
          size="lg"
          type="submit"
        >
          {isSubmitLoading && (
            <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
          )}
          Crear Cuenta
        </Button>
      </form>
    </Form>
  );
}

// Export the schema for reuse in server-side validation if needed
export { signUpFormSchema, type SignUpFormValues };
