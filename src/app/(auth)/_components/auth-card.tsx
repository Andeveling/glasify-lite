import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type AuthCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export default function AuthCard({ title, description, children, className }: AuthCardProps) {
  return (
    <Card className={cn('w-full border-border/50 shadow-lg', className)}>
      <CardHeader className="space-y-2 pb-6">
        <CardTitle className="text-center font-semibold text-2xl tracking-tight">{title}</CardTitle>
        {description && (
          <CardDescription className="text-balance text-center text-muted-foreground">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-8">{children}</CardContent>
    </Card>
  );
}
