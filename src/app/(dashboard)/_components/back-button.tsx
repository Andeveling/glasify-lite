'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Back Button Component
 *
 * Client Component that handles browser history navigation.
 * Used in error pages to allow users to go back to previous page.
 */
export function BackButton() {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <Button className="gap-2" onClick={handleBack} variant="ghost">
      <ArrowLeft className="h-4 w-4" />
      Página Anterior
    </Button>
  );
}
