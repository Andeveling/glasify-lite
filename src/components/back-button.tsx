"use client";

import { Button } from "@/components/ui/button";

export function BackButton() {
  return (
    <Button
      className="h-auto p-0"
      onClick={() => window.history.back()}
      size="sm"
      variant="link"
    >
      ← Volver atrás
    </Button>
  );
}
