import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="font-bold text-4xl">Glasify MVP</h1>
        <p className="mt-4 text-gray-600 text-lg">
          Cotizador multi-ítem con cálculo dinámico
        </p>
        {session?.user && (
          <p className="mt-2 text-sm">
            Bienvenido, {session.user.name ?? session.user.email}
          </p>
        )}
      </main>
    </HydrateClient>
  );
}
