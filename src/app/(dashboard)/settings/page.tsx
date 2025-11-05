import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/server/auth";
import { SettingsPageContent } from "./_components/settings-page-content";

export const metadata: Metadata = {
  description: "Administra las preferencias y configuración del sistema",
  title: "Configuración - Glasify",
};

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-8 animate-pulse rounded bg-muted" />
            <div className="h-12 animate-pulse rounded bg-muted" />
            <div className="h-96 animate-pulse rounded-lg bg-muted" />
          </div>
        }
      >
        <SettingsPageContent />
      </Suspense>
    </div>
  );
}
