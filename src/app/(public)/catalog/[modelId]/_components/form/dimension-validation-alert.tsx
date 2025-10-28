import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type DimensionValidationAlertProps = {
  showAlert: boolean;
};

/**
 * DimensionValidationAlert - Organism component
 * Displays validation alert when dimension values are out of range
 * Uses destructive variant for error feedback
 */
export function DimensionValidationAlert({
  showAlert,
}: DimensionValidationAlertProps) {
  if (!showAlert) {
    return null;
  }

  return (
    <Alert className="mt-4" variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Una o más dimensiones están fuera del rango permitido.
      </AlertDescription>
    </Alert>
  );
}
