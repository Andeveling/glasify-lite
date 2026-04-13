import Link from "next/link"
import SignUpForm from "./_components/signup-form"

export default function SignUpPage() {
  return (
    <>
      <SignUpForm />
      <p className="mt-6 text-center text-muted-foreground text-sm">
        ¿Ya tienes una cuenta?{" "}
        <Link className="text-primary hover:underline" href="/sign-in">
          Inicia sesión
        </Link>
      </p>
    </>
  )
}
