"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { Control } from "react-hook-form";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
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
      `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`
    ),
  rememberMe: z.boolean(),
});

type SignInFormValues = z.infer<typeof signInFormSchema>;

type SignInFormProps = {
  isLoading?: boolean;
  error?: string | null;
};

type EmailInputProps = {
  control: Control<SignInFormValues>;
  disabled?: boolean;
};

function EmailInput({ control, disabled }: EmailInputProps) {
  const email = useWatch({ control, name: "email" });

  return (
    <InputGroup>
      <InputGroupAddon align="inline-start">
        <Mail data-icon="inline-start" />
      </InputGroupAddon>
      <InputGroupInput
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect="off"
        disabled={disabled}
        id="signin-email"
        placeholder="tu@ejemplo.com"
        type="email"
        value={email ?? ""}
        {...control.register("email")}
      />
    </InputGroup>
  );
}

type PasswordInputProps = {
  control: Control<SignInFormValues>;
  disabled?: boolean;
};

function PasswordInput({ control, disabled }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const password = useWatch({ control, name: "password" });

  const toggleVisibility = useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  return (
    <InputGroup>
      <InputGroupAddon align="inline-start">
        <Lock data-icon="inline-start" />
      </InputGroupAddon>
      <InputGroupInput
        autoCapitalize="none"
        autoComplete="current-password"
        autoCorrect="off"
        disabled={disabled}
        id="signin-password"
        placeholder="••••••••"
        type={isVisible ? "text" : "password"}
        value={password ?? ""}
        {...control.register("password")}
      />
      <InputGroupAddon align="inline-end">
        <button
          className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
          disabled={disabled}
          onClick={toggleVisibility}
          type="button"
        >
          {isVisible ? (
            <EyeOff data-icon="inline-end" />
          ) : (
            <Eye data-icon="inline-end" />
          )}
        </button>
      </InputGroupAddon>
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
              <EmailInput control={form.control} disabled={isSubmitDisabled} />
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
                control={form.control}
                disabled={isSubmitDisabled}
              />
              {form.formState.errors.password && (
                <FieldError errors={[form.formState.errors.password]} />
              )}
            </Field>

            <Field>
              <div className="flex items-center gap-2.5">
                <Checkbox
                  checked={form.watch("rememberMe")}
                  className="size-4"
                  disabled={isSubmitDisabled}
                  id="signin-remember"
                  onCheckedChange={(checked) => {
                    form.setValue("rememberMe", Boolean(checked), {
                      shouldValidate: true,
                    });
                  }}
                />
                <FieldLabel
                  className="cursor-pointer font-normal text-muted-foreground text-sm"
                  htmlFor="signin-remember"
                >
                  Recordar mi sesión
                </FieldLabel>
              </div>
            </Field>
          </FieldGroup>

          {(form.formState.errors.root || error) && (
            <Alert className="mt-4" variant="destructive">
              <AlertDescription>
                {form.formState.errors.root?.message || error}
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={isSubmitDisabled}
          form="signin-form"
          type="submit"
        >
          {isCredentialsLoading ? (
            <>
              <Spinner data-icon="inline-start" />
              Iniciando sesión...
            </>
          ) : (
            "Iniciar Sesión"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export { signInFormSchema, type SignInFormValues };
