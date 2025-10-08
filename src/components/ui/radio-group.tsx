'use client';

import { Indicator, Item, Root } from '@radix-ui/react-radio-group';
import { CircleIcon } from 'lucide-react';
import type * as React from 'react';

import { cn } from '@/lib/utils';

function RadioGroup({ className, ...props }: React.ComponentProps<typeof Root>) {
  return <Root className={cn('grid gap-3', className)} data-slot="radio-group" {...props} />;
}

function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof Item>) {
  return (
    <Item
      className={cn(
        'aspect-square size-4 rounded-full border border-input text-primary shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        className
      )}
      data-slot="radio-group-item"
      {...props}
    >
      <Indicator className="flex items-center justify-center">
        <CircleIcon className="size-2 fill-current text-current" />
      </Indicator>
    </Item>
  );
}

export { RadioGroup, RadioGroupItem };
