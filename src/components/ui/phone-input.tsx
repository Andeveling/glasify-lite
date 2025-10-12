'use client';

import { CheckIcon, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';
import * as RPNInput from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import 'react-phone-number-input/style.css';

// ============================================================================
// Types
// ============================================================================

type PhoneInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> &
  Omit<RPNInput.Props<typeof RPNInput.default>, 'onChange'> & {
    onChange?: (value: RPNInput.Value | '') => void;
  };

type CountrySelectOption = {
  label: string;
  value: RPNInput.Country;
};

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  onChange: (value: RPNInput.Country) => void;
  options: CountrySelectOption[];
};

type InputComponentProps = React.InputHTMLAttributes<HTMLInputElement>;

// ============================================================================
// Internal Components (Memoized)
// ============================================================================

/**
 * Custom input component for the phone number field.
 * Applies consistent styling and removes default browser outline.
 */
const InputComponent = React.memo(
  React.forwardRef<HTMLInputElement, InputComponentProps>(({ className, ...props }, ref) => (
    <input
      className={cn('rounded-e-lg rounded-s-none px-2 bg-primary-base outline-none w-full', className)}
      {...props}
      ref={ref}
    />
  ))
);
InputComponent.displayName = 'InputComponent';

/**
 * Flag component that displays the country flag icon.
 * Uses react-phone-number-input's flag components.
 */
const FlagComponent = React.memo(({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];

  return (
    <span className="bg-transparent flex h-auto w-4 overflow-hidden  mx-auto">
      {Flag ? <Flag title={countryName} /> : null}
    </span>
  );
});
FlagComponent.displayName = 'FlagComponent';

/**
 * Country selector dropdown component.
 * Provides searchable list of countries with flags and calling codes.
 */
const CountrySelect = React.memo(({ disabled, value, onChange, options }: CountrySelectProps) => {
  const handleSelect = React.useCallback(
    (country: RPNInput.Country) => {
      onChange(country);
    },
    [onChange]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          aria-label="Seleccionar país"
          className={cn('flex gap-1 rounded-e-none bg-primary-base rounded-s-lg px-3 justify-center')}
          disabled={disabled}
          type="button"
          variant="outline"
        >
          <div className="flex justify-center items-center text-center">
            <FlagComponent country={value} countryName={value} />
          </div>
          <ChevronsUpDown className={cn('-mr-2 h-4 w-4 opacity-50', disabled ? 'hidden' : 'opacity-100')} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command className="dark:bg-neutral-950 border dark:border-neutral-800 border-neutral-200">
          <CommandList>
            <ScrollArea className="h-72">
              <CommandInput placeholder="Buscar país..." />
              <CommandEmpty>No se encontró el país.</CommandEmpty>
              <CommandGroup>
                {options
                  .filter((x) => x.value)
                  .map((option) => (
                    <CommandItem className="gap-2" key={option.value} onSelect={() => handleSelect(option.value)}>
                      <FlagComponent country={option.value} countryName={option.label} />
                      <span className="flex-1 text-sm">{option.label}</span>
                      {option.value && (
                        <span className="text-foreground/50 text-sm">
                          {`+${RPNInput.getCountryCallingCode(option.value)}`}
                        </span>
                      )}
                      <CheckIcon
                        className={cn('ml-auto h-4 w-4', option.value === value ? 'opacity-100' : 'opacity-0')}
                      />
                    </CommandItem>
                  ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});
CountrySelect.displayName = 'CountrySelect';

// ============================================================================
// Main Component
// ============================================================================

/**
 * PhoneInput component with country selector.
 *
 * Provides an international phone number input with:
 * - Country flag and code selector
 * - Automatic formatting
 * - Type-safe value handling
 *
 * @example
 * ```tsx
 * <PhoneInput
 *   value={phoneNumber}
 *   onChange={setPhoneNumber}
 *   defaultCountry="MX"
 *   placeholder="Ingresa tu número"
 * />
 * ```
 */
const PhoneInput = React.forwardRef<React.ElementRef<typeof RPNInput.default>, PhoneInputProps>(
  ({ className, onChange, ...props }, ref) => {
    /**
     * Handles the onChange event with proper type safety.
     *
     * react-phone-number-input might trigger onChange as undefined
     * when a valid phone number is not entered. This handler ensures
     * the value is always a string (Value/E164Number or empty string).
     */
    const handleChange = React.useCallback(
      (value: RPNInput.Value | undefined) => {
        onChange?.(value || '');
      },
      [onChange]
    );

    return (
      <RPNInput.default
        className={cn(
          'h-9 w-full min-w-0 rounded-md border border-input bg-transparent  py-1 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
          'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
          'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
          className
        )}
        countrySelectComponent={CountrySelect}
        flagComponent={FlagComponent}
        inputComponent={InputComponent}
        onChange={handleChange}
        ref={ref}
        {...props}
      />
    );
  }
);
PhoneInput.displayName = 'PhoneInput';

// ============================================================================
// Exports
// ============================================================================

export { PhoneInput };
export type { PhoneInputProps };
