"use client";

import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth-client";

const MIN_PASSWORD_LENGTH = 6;

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
      `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
    ),
  rememberMe: z.boolean(),
});

type SignInFormValues = z.infer<typeof signInFormSchema>;

type SignInFormProps = {
  isLoading?: boolean;
  error?: string | null;
};

interface PasswordInputProps {
  value: string;
  onChange: (...event: unknown[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

function PasswordInput({
  value,
  onChange,
  disabled,
  placeholder,
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  return (
    <div className="relative">
      <Input
        autoCapitalize="none"
        autoComplete="current-password"
        autoCorrect="off"
        className="h-12 pr-10"
        disabled={disabled}
        placeholder={placeholder}
        type={isVisible ? "text" : "password"}
        value={value}
        onChange={onChange}
      />
      <button
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
        disabled={disabled}
        type="button"
        onClick={toggleVisibility}
      >
        {isVisible ? (
          <EyeOff className="h-5 w-5" />
        ) : (
          <Eye className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}

export default function SignInForm({
  isLoading = false,
  error,
}: SignInFormProps) {
  const router = useRouter();
  const [isCredentialsLoading, setIsCredentialsLoading] = useState(false);

  const form = useForm<SignInFormValues>({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    mode: "onBlur",
    resolver: zodResolver(signInFormSchema),
  });

  const handleCredentialsSubmit = async (values: SignInFormValues) => {
    try {
      setIsCredentialsLoading(true);

      const result = await signIn.email({
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        form.setError("root", {
          message: "Email o contraseña incorrectos",
        });
        return;
      }

      router.push("/admin");
    } catch {
      form.setError("root", {
        message: "Error al iniciar sesión. Intenta nuevamente.",
      });
    } finally {
      setIsCredentialsLoading(false);
    }
  };

  const isSubmitDisabled = isLoading || isCredentialsLoading;

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form
          className="space-y-5"
          onSubmit={form.handleSubmit(handleCredentialsSubmit)}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium">Email</FormLabel>
                <FormControl>
                  <Input
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    className="h-12"
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
              <FormItem className="space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-sm font-medium">
                    Contraseña
                  </FormLabel>
                  <button
                    className="text-primary text-sm hover:underline focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                    disabled={isSubmitDisabled}
                    type="button"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <FormControl>
                  <PasswordInput
                    disabled={isSubmitDisabled}
                    placeholder="••••••••"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    className="h-5 w-5"
                    disabled={isSubmitDisabled}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal cursor-pointer">
                  Recordar mi sesión
                </FormLabel>
              </FormItem>
            )}
          />

          {(form.formState.errors.root || error) && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive text-sm flex items-center gap-2">
              <svg
                className="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              {form.formState.errors.root?.message || error}
            </div>
          )}

          <Button
            className="h-12 w-full text-base font-medium"
            disabled={isSubmitDisabled}
            type="submit"
          >
            {isCredentialsLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Iniciando sesión...
              </span>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export { signInFormSchema, type SignInFormValues };
