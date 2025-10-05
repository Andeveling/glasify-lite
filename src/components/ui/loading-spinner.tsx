import { cn } from '@/lib/utils';

type LoadingSpinnerProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

export function LoadingSpinner({ className, size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    lg: 'h-8 w-8',
    md: 'h-6 w-6',
    sm: 'h-4 w-4',
  };

  return (
    <div
      aria-label="Cargando..."
      className={cn('animate-spin rounded-full border-2 border-muted border-t-primary', sizeClasses[size], className)}
      role="img"
    >
      <span className="sr-only">Cargando...</span>
    </div>
  );
}
