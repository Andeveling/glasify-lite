import { FileX, PackageOpen, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateIcon = "package" | "search" | "file" | "users";

type EmptyStateProps = {
  className?: string;
  icon?: EmptyStateIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary" | "ghost";
  };
  children?: React.ReactNode;
};

const iconMap = {
  file: FileX,
  package: PackageOpen,
  search: Search,
  users: Users,
} as const;

export function EmptyState({
  className,
  icon = "package",
  title,
  description,
  action,
  children,
}: EmptyStateProps) {
  const IconComponent = iconMap[icon];

  return (
    <output
      aria-label={`Estado vacío: ${title}`}
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center",
        className
      )}
    >
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
        <IconComponent
          aria-hidden="true"
          className="h-10 w-10 text-muted-foreground"
        />
      </div>

      <h3 className="mt-4 font-semibold text-foreground text-lg">{title}</h3>

      {description && (
        <p className="mt-2 max-w-sm text-muted-foreground text-sm">
          {description}
        </p>
      )}

      {action && (
        <Button
          aria-describedby="empty-state-description"
          className="mt-4"
          onClick={action.onClick}
          variant={action.variant || "default"}
        >
          {action.label}
        </Button>
      )}

      {children && <div className="mt-4">{children}</div>}

      <div aria-live="polite" className="sr-only" id="empty-state-description">
        {description ||
          `No hay elementos para mostrar en ${title.toLowerCase()}`}
      </div>
    </output>
  );
}
