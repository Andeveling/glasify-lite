import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "./ui/field";

type FormSectionProps = {
  icon?: LucideIcon;
  legend: string;
  description?: string;
  children: ReactNode;
  errors?: Array<{ message?: string } | undefined>;
  className?: string;
  legendClassName?: string;
  descriptionClassName?: string;
  groupClassName?: string;
  orientation?: "vertical" | "horizontal" | "responsive";
  showSeparator?: boolean;
  separatorText?: string;
};

/**
 * FormSection component for consistent form section layout.
 *
 * @param props - FormSectionProps
 */
export function FormSection({
  icon: Icon,
  legend,
  description,
  children,
  errors,
  className,
  legendClassName,
  descriptionClassName,
  groupClassName,
  orientation = "vertical",
  showSeparator = false,
  separatorText,
}: FormSectionProps) {
  return (
    <FieldSet className={className}>
      <FieldGroup className={groupClassName} data-orientation={orientation}>
        <div className="space-y-2">
          <FieldLegend
            className={cn("font-bold text-2xl tracking-tight", legendClassName)}
          >
            {Icon && <Icon className="mr-3 mb-1 inline size-6 text-primary" />}
            {legend}
          </FieldLegend>
          {description && (
            <FieldDescription className={descriptionClassName}>
              {description}
            </FieldDescription>
          )}
        </div>

        <FieldContent>{children}</FieldContent>

        <FieldError errors={errors} />
      </FieldGroup>

      {showSeparator && (
        <FieldSeparator>
          {separatorText && (
            <span className="font-medium text-xs">{separatorText}</span>
          )}
        </FieldSeparator>
      )}
    </FieldSet>
  );
}
