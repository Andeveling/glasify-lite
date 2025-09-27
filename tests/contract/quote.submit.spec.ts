
import { describe, it, expect } from 'vitest';
import { quoteRouter } from '../../src/server/api/routers/quote';
import { type AppRouter } from '../../src/server/api/root';
import { inferProcedureInput } from '@trpc/server';
import { submitInput, submitOutput } from '../../src/server/api/routers/quote';

describe('Contract: quote.submit', () => {
  it('should have the correct input schema', () => {
    const validInput: inferProcedureInput<AppRouter['quote']['submit']> = {
      quoteId: 'quote_abc',
      contact: {
        phone: '123456789',
        address: '123 Main St',
      },
    };

    expect(() => submitInput.parse(validInput)).not.toThrow();

    const invalidInput = {
      quoteId: 'quote_abc',
      // Missing contact info
    };

    expect(() => submitInput.parse(invalidInput)).toThrow();
  });

  it('should have the correct output schema', () => {
    const validOutput: ReturnType<typeof submitOutput.parse> = {
      quoteId: 'quote_abc',
      status: 'sent',
    };

    expect(() => submitOutput.parse(validOutput)).not.toThrow();

    const invalidOutput = {
      quoteId: 'quote_abc',
      status: 'pending', // Invalid status
    };

    expect(() => submitOutput.parse(invalidOutput)).toThrow();
  });
});
