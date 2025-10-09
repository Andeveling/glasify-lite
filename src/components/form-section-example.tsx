import { AlertCircle, Gem, Ruler, Wrench } from 'lucide-react';
import { FormSection } from '@/components/form-section';

/**
 * Ejemplos de uso del componente FormSection mejorado
 */

// ✅ Ejemplo básico con icono
export function BasicExample() {
  return (
    <FormSection description="Especifica las dimensiones del vidrio requeridas." icon={Ruler} legend="Dimensiones">
      <div className="space-y-4">
        <input className="w-full" placeholder="Ancho (cm)" type="number" />
        <input className="w-full" placeholder="Alto (cm)" type="number" />
      </div>
    </FormSection>
  );
}

// ✅ Ejemplo sin icono
export function WithoutIconExample() {
  return (
    <FormSection description="Datos generales del proyecto" legend="Información básica">
      <div className="space-y-4">
        <input className="w-full" placeholder="Nombre del proyecto" type="text" />
        <textarea className="w-full" placeholder="Descripción" rows={3} />
      </div>
    </FormSection>
  );
}

// ✅ Ejemplo con clases personalizadas
export function CustomStylingExample() {
  return (
    <FormSection
      className="border-2 border-dashed"
      description="Selecciona los servicios extra que desees agregar"
      descriptionClassName="text-sm italic"
      icon={Wrench}
      legend="Servicios adicionales"
      legendClassName="text-xl font-bold"
    >
      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center space-x-2">
          <input type="checkbox" />
          <span>Corte personalizado</span>
        </label>
        <label className="flex items-center space-x-2">
          <input type="checkbox" />
          <span>Pulido</span>
        </label>
      </div>
    </FormSection>
  );
}

// ✅ Ejemplo con errores
export function WithErrorsExample() {
  const errors = [{ message: 'El ancho debe ser mayor a 50cm' }, { message: 'El alto no puede exceder 300cm' }];

  return (
    <FormSection
      description="Corrige los errores antes de continuar"
      errors={errors}
      icon={AlertCircle}
      legend="Dimensiones con errores"
    >
      <div className="space-y-4">
        <input className="w-full border-destructive" placeholder="Ancho (cm)" type="number" />
        <input className="w-full border-destructive" placeholder="Alto (cm)" type="number" />
      </div>
    </FormSection>
  );
}

// ✅ Ejemplo con orientación horizontal
export function HorizontalOrientationExample() {
  return (
    <FormSection description="Datos de contacto del cliente" legend="Información de contacto" orientation="horizontal">
      <div className="grid grid-cols-2 gap-4">
        <input className="w-full" placeholder="Nombre" type="text" />
        <input className="w-full" placeholder="Email" type="email" />
      </div>
    </FormSection>
  );
}

// ✅ Ejemplo con separador
export function WithSeparatorExample() {
  return (
    <FormSection
      description="Selecciona la solución de cristal que mejor se adapte."
      icon={Gem}
      legend="Tipo de Cristal"
      separatorText="Continuar con servicios"
      showSeparator
    >
      <div className="space-y-4">
        <select className="w-full">
          <option>Templado</option>
          <option>Laminado</option>
          <option>Simple</option>
        </select>
      </div>
    </FormSection>
  );
}

// ✅ Ejemplo de refactorización de sección existente
export function RefactoredSectionExample() {
  return (
    <FormSection
      description="Selecciona la solución de cristal que mejor se adapte."
      icon={Gem}
      legend="Tipo de Cristal"
    >
      {/* ... contenido del formulario */}
      <div>Contenido del selector de tipo de cristal</div>
    </FormSection>
  );
}
