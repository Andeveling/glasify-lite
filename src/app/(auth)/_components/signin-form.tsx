"use client";

import { AlertCircle, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth-client";

const MIN_PASSWORD_LENGTH = 8;

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
    <InputGroup>
      <InputGroupAddon align={"inline-start"}>
        <Lock className="h-4 w-4 text-muted-foreground" />
      </InputGroupAddon>
      <Input
        autoCapitalize="none"
        autoComplete="current-password"
        autoCorrect="off"
        className="h-11 mx-2 my-1 pl-8 pr-10"
        disabled={disabled}
        placeholder={placeholder}
        type={isVisible ? "text" : "password"}
        value={value}
        onChange={onChange}
      />
      <InputGroupAddon align={"inline-end"}>
        <button
          className="text-muted-foreground hover:text-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 transition-colors"
          disabled={disabled}
          type="button"
          onClick={toggleVisibility}
        >
          {isVisible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </InputGroupAddon>
    </InputGroup>
  );
}

interface EmailInputProps {
  value: string;
  onChange: (...event: unknown[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

function EmailInput({
  value,
  onChange,
  disabled,
  placeholder,
}: EmailInputProps) {
  return (
    <InputGroup>
      <InputGroupAddon align={"inline-start"}>
        <Mail className="h-4 w-4 text-muted-foreground" />
      </InputGroupAddon>
      <Input
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect="off"
        className="h-11 pl-10 mx-6 my-1"
        disabled={disabled}
        placeholder={placeholder}
        type="email"
        value={value}
        onChange={onChange}
      />
    </InputGroup>
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
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Iniciar Sesión</CardTitle>
        <CardDescription>
          Ingresa tus credenciales para acceder a tu cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="signin-form"
          onSubmit={form.handleSubmit(handleCredentialsSubmit)}
        >
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.email}>
              <FieldLabel htmlFor="signin-email">Email</FieldLabel>
              <EmailInput
                disabled={isSubmitDisabled}
                onChange={form.register("email").onChange}
                placeholder="tu@ejemplo.com"
                value={form.watch("email")}
              />
              {form.formState.errors.email && (
                <FieldError errors={[form.formState.errors.email]} />
              )}
            </Field>

            <Field data-invalid={!!form.formState.errors.password}>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="signin-password">Contraseña</FieldLabel>
                <button
                  className="text-primary text-xs hover:underline focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                  disabled={isSubmitDisabled}
                  type="button"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <PasswordInput
                disabled={isSubmitDisabled}
                placeholder="••••••••"
                value={form.watch("password")}
                onChange={form.register("password").onChange}
              />
              {form.formState.errors.password && (
                <FieldError errors={[form.formState.errors.password]} />
              )}
            </Field>

            <Field>
              <div className="flex items-center gap-2.5">
                <Checkbox
                  checked={form.watch("rememberMe")}
                  className="h-4 w-4"
                  disabled={isSubmitDisabled}
                  id="signin-remember"
                  onCheckedChange={form.register("rememberMe").onChange}
                />
                <FieldLabel
                  className="text-sm font-normal cursor-pointer text-muted-foreground"
                  htmlFor="signin-remember"
                >
                  Recordar mi sesión
                </FieldLabel>
              </div>
            </Field>
          </FieldGroup>

          {(form.formState.errors.root || error) && (
            <div className="flex items-center gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3.5 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {form.formState.errors.root?.message || error}
            </div>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button
          className="h-11 w-full text-sm font-medium tracking-wide"
          disabled={isSubmitDisabled}
          form="signin-form"
          type="submit"
        >
          {isCredentialsLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
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
      </CardFooter>
    </Card>
  );
}

export { signInFormSchema, type SignInFormValues };
