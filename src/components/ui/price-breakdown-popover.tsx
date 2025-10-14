import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

type PriceBreakdownItem = {
  amount: number;
  label: string;
};

type PriceBreakdownPopoverProps = {
  breakdown: PriceBreakdownItem[];
  className?: string;
  currency?: string;
  totalAmount: number;
};

// ============================================================================
// Component
// ============================================================================

/**
 * Price Breakdown Popover Component (Atom)
 *
 * Displays itemized price details in a popover triggered by an info icon.
 *
 * ## Features
 * - **Shadcn Popover**: Uses Radix UI popover for accessible overlay
 * - **Table Layout**: Itemized breakdown with labels and amounts
 * - **Total Row**: Bold total amount with separator
 * - **Responsive**: Adapts content width to available space
 * - **Accessibility**: Keyboard navigation, ARIA labels
 *
 * ## Usage
 * ```tsx
 * <PriceBreakdownPopover
 *   totalAmount={1444983}
 *   currency="$"
 *   breakdown={[
 *     { label: 'Base del modelo', amount: 650000 },
 *     { label: 'Vidrio Laminado', amount: 120000 },
 *     { label: 'Servicio de corte', amount: 25000 }
 *   ]}
 * />
 * ```
 *
 * @example
 * // In sticky price header
 * <div className="flex items-center gap-2">
 *   <span className="text-3xl font-bold">${totalPrice.toLocaleString()}</span>
 *   <PriceBreakdownPopover breakdown={breakdown} totalAmount={totalPrice} />
 * </div>
 */
export function PriceBreakdownPopover({
  breakdown,
  className,
  currency = '$',
  totalAmount,
}: PriceBreakdownPopoverProps) {
  const formatAmount = (amount: number): string => {
    return `${currency}${amount.toLocaleString('es-AR')}`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          aria-label="Ver desglose de precio"
          className={cn('h-8 w-8 p-0', className)}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Info className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Desglose del precio</h3>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60%]">Concepto</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {breakdown.map((item, index) => (
                <TableRow key={`${item.label}-${index}`}>
                  <TableCell className="text-sm">{item.label}</TableCell>
                  <TableCell className="text-right text-sm">{formatAmount(item.amount)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t-2">
                <TableCell className="font-bold">Total</TableCell>
                <TableCell className="text-right font-bold">{formatAmount(totalAmount)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </PopoverContent>
    </Popover>
  );
}
