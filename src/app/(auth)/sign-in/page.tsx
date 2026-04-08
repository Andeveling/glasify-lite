"use client";

import SignInForm from "@/app/(auth)/_components/signin-form";
import AuthCard from "@/app/(auth)/_components/auth-card";

export default function SignInPage() {
  return (
    <AuthCard
      description="Ingresa tus credenciales para continuar"
      title="Iniciar Sesión"
    >
      <SignInForm />
    </AuthCard>
  );
}
