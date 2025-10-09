import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { FieldContent, FieldDescription, FieldLegend, FieldSet } from './ui/field';

type FormSectionProps = {
  /**
   * Icono de Lucide React para mostrar junto al título
   */
  icon?: LucideIcon;
  /**
   * Texto del título de la sección
   */
  legend: string;
  /**
   * Descripción opcional de la sección
   */
  description?: string;
  /**
   * Contenido de la sección (campos del formulario)
   */
  children: ReactNode;
  /**
   * Clases CSS adicionales para el FieldSet
   */
  className?: string;
  /**
   * Clases CSS adicionales para el FieldLegend
   */
  legendClassName?: string;
  /**
   * Clases CSS adicionales para el FieldDescription
   */
  descriptionClassName?: string;
};

/**
 * Componente reusable para secciones de formularios
 *
 * Proporciona una estructura consistente para las secciones de formularios
 * con icono opcional, título, descripción y contenido.
 *
 * ## Uso básico
 * ```tsx
 * import { Ruler } from 'lucide-react';
 *
 * <FormSection
 *   icon={Ruler}
 *   legend="Dimensiones"
 *   description="Especifica las dimensiones requeridas"
 * >
 *   <input type="number" placeholder="Ancho" />
 *   <input type="number" placeholder="Alto" />
 * </FormSection>
 * ```
 *
 * ## Sin icono
 * ```tsx
 * <FormSection legend="Información básica">
 *   <input type="text" placeholder="Nombre" />
 * </FormSection>
 * ```
 *
 * @param props - Propiedades del componente
 */
export function FormSection({
  icon: Icon,
  legend,
  description,
  children,
  className,
  legendClassName,
  descriptionClassName,
}: FormSectionProps) {
  return (
    <FieldSet className={className}>
      <div className="space-y-2">
        <FieldLegend className={legendClassName}>
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
    </FieldSet>
  );
}
