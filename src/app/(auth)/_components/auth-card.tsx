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
    <Card className={cn('w-full', className)}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-center font-semibold text-2xl tracking-tight">{title}</CardTitle>
        {description && <CardDescription className="text-center text-muted-foreground">{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
