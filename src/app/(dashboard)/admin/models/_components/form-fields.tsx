/**
 * Reusable Form Field Components
 *
 * Form field wrappers that use useFormContext() for cleaner code
 */

"use client";

import { format } from "@formkit/tempo";
import { CalendarIcon } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type BaseFieldProps = {
  name: string;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
};

/**
 * Text Input Field
 */
export function FormTextInput({
  name,
  label,
  description,
  placeholder,
  required = false,
}: BaseFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label} {required && "*"}
          </FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder}
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Number Input Field
 */
type NumberFieldProps = BaseFieldProps & {
  min?: number;
  max?: number;
  step?: number;
};

export function FormNumberInput({
  name,
  label,
  description,
  placeholder,
  required = false,
  min,
  max,
  step = 1,
}: NumberFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label} {required && "*"}
          </FormLabel>
          <FormControl>
            <Input
              max={max}
              min={min}
              placeholder={placeholder}
              step={step}
              type="number"
              {...field}
              onChange={(e) =>
                field.onChange(
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              value={field.value ?? ""}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Currency Input Field (formatted as money)
 * Supports up to 4 decimal places for precise pricing
 *
 * @param decimals - Number of decimal places (default: 2, use 4 for precise cost factors)
 */
type CurrencyFieldProps = NumberFieldProps & {
  decimals?: 0 | 1 | 2 | 3 | 4;
};

export function FormCurrencyInput({
  name,
  label,
  description,
  placeholder,
  required = false,
  min = 0,
  decimals = 2,
}: CurrencyFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label} {required && "*"}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                $
              </span>
              <Input
                className="pl-7"
                min={min}
                placeholder={placeholder}
                step={10 ** -decimals}
                type="number"
                {...field}
                onChange={(e) =>
                  field.onChange(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                value={field.value ?? ""}
              />
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Percentage Input Field
 */
export function FormPercentageInput({
  name,
  label,
  description,
  placeholder,
  required = false,
  min = 0,
  max = 100,
}: NumberFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label} {required && "*"}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                className="pr-8"
                max={max}
                min={min}
                placeholder={placeholder}
                step="0.01"
                type="number"
                {...field}
                onChange={(e) =>
                  field.onChange(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                value={field.value ?? ""}
              />
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                %
              </span>
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Textarea Field
 */
type TextareaFieldProps = BaseFieldProps & {
  rows?: number;
};

export function FormTextarea({
  name,
  label,
  description,
  placeholder,
  required = false,
  rows = 3,
}: TextareaFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label} {required && "*"}
          </FormLabel>
          <FormControl>
            <Textarea
              placeholder={placeholder}
              rows={rows}
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Select Field
 */
type SelectOption = {
  label: string;
  value: string;
};

type SelectFieldProps = BaseFieldProps & {
  options: SelectOption[];
};

export function FormSelect({
  name,
  label,
  description,
  placeholder,
  required = false,
  options,
}: SelectFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label} {required && "*"}
          </FormLabel>
          <Select onValueChange={field.onChange} value={field.value ?? ""}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Date Picker Field (using shadcn/ui Calendar + Tempo)
 */
export function FormDateInput({
  name,
  label,
  description,
  required = false,
}: Omit<BaseFieldProps, "placeholder">) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>
            {label} {required && "*"}
          </FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  className={cn(
                    "w-full justify-start pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                  variant="outline"
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {field.value ? (
                    format(field.value, "DD/MM/YYYY", "es-CO")
                  ) : (
                    <span>Seleccionar fecha</span>
                  )}
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                initialFocus
                mode="single"
                onSelect={field.onChange}
                selected={field.value}
              />
            </PopoverContent>
          </Popover>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
