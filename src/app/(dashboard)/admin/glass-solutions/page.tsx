import type { Metadata } from "next";
import { Suspense } from "react";
import { api } from "@/trpc/server-client";
import { GlassSolutionList } from "./_components/glass-solution-list";

export const metadata: Metadata = {
  description: "Gestiona las soluciones base para tipos de vidrio",
  title: "Soluciones de Vidrio | Admin",
};

export default async function GlassSolutionsPage() {
  const initialData = await api.admin["glass-solution"].list({
    limit: 20,
    page: 1,
    sortBy: "sortOrder",
    sortOrder: "asc",
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-bold text-3xl tracking-tight">
          Soluciones de Vidrio
        </h1>
        <p className="text-muted-foreground">
          Gestiona las soluciones base para tipos de vidrio
        </p>
      </div>

      <Suspense fallback={<div>Cargando...</div>}>
        <GlassSolutionList initialData={initialData} />
      </Suspense>
    </div>
  );
}
