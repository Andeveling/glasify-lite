/**
 * EmptyQuotesState Component
 *
 * Displays a message when the user has no quotes,
 * with a link to browse the catalog.
 *
 * Task: T073 [P] [US5]
 * User Story: US5 - Access and view quote history
 */

import { FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyQuotesState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
        <FileText className="h-16 w-16 text-muted-foreground" />
        <div className="text-center">
          <h3 className="mb-2 font-semibold text-lg">
            No tienes cotizaciones aún
          </h3>
          <p className="text-muted-foreground">
            Explora nuestro catálogo y configura ventanas para generar tu
            primera cotización
          </p>
        </div>
        <Button asChild>
          <Link href="/catalog">Ir al catálogo</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
