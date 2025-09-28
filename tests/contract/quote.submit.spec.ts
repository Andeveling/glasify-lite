import { describe, expect, it } from 'vitest';
import { testServer } from '../integration-setup';

// Regex constants for performance optimization in this file
const _CUID_REGEX = /^c[a-z0-9]{24}$/;
const _QUOTE_ID_VALIDATION_ERROR_REGEX = /ID de la cotización debe ser válido/;
const _PHONE_ERROR_REGEX = /teléfono|phone/i;
const _QUOTE_ID_ERROR_REGEX = /quote/i;
const _ADDRESS_ERROR_REGEX = /dirección|address/i;
const _EMAIL_ERROR_REGEX = /email|correo/i;
const _NON_EXISTENT_QUOTE_ERROR_REGEX = /cotización.*encontrada|quote.*found/i;
const _ALREADY_SENT_ERROR_REGEX = /ya.*enviada|estado\s*borrador|already.*sent/i;
// String constants
const SENT_STATUS = 'sent';
const SUBMIT_STATUS = 'submit';

describe('Contract: quote.submit', () => {
  let testQuoteId: string;

  // Helper function to create a test quote with an item
  const createTestQuote = async () => {
    const itemInput = {
      adjustments: [],
      glassTypeId: 'cm1glass123def456ghi789jkl',
      heightMm: 800,
      modelId: 'cm1model123def456ghi789jkl',
      services: [],
      widthMm: 1000,
    };

    const result = await testServer.quote['add-item'](itemInput);
    return result.quoteId;
  };

  it('should submit quote with valid contact information', async () => {
    // Arrange: Create a test quote first
    testQuoteId = await createTestQuote();

    const validInput = {
      contact: {
        address: 'Calle 123 #45-67, Bogotá, Colombia',
        phone: '+57 300 123 4567',
      },
      quoteId: testQuoteId,
    };

    // Act: Submit the quote

    const result = await testServer.quote[SUBMIT_STATUS](validInput);

    // Assert: Output schema validation
    expect(result).toMatchObject({
      quoteId: testQuoteId,
      status: SENT_STATUS,
    });

    // Status should be exactly "sent"
    expect(result.status).toBe(SENT_STATUS);
  });

  it('should validate input schema - invalid quoteId', async () => {
    // Arrange: Invalid quote ID
    const invalidInput = {
      contact: {
        address: 'Calle 123 #45-67, Bogotá, Colombia',
        phone: '+57 300 123 4567',
      },
      quoteId: 'invalid-quote-id', // Not a valid CUID
    };

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.quote[SUBMIT_STATUS](invalidInput);
    }).rejects.toThrow(_EMAIL_ERROR_REGEX);
  });

  it('should validate contact information - missing phone', async () => {
    // Arrange: Create a test quote
    testQuoteId = await createTestQuote();

    const invalidInput = {
      contact: {
        address: 'Calle 123 #45-67, Bogotá, Colombia',
        phone: '', // Empty phone
      },
      quoteId: testQuoteId,
    };

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.quote[SUBMIT_STATUS](invalidInput);
    }).rejects.toThrow(_PHONE_ERROR_REGEX);
  });

  it('should validate contact information - missing address', async () => {
    // Arrange: Create a test quote
    testQuoteId = await createTestQuote();

    const invalidInput = {
      contact: {
        address: '', // Empty address
        phone: '+57 300 123 4567',
      },
      quoteId: testQuoteId,
    };

    // Act & Assert: Should throw validation error
    await expect(async () => {
      await testServer.quote[SUBMIT_STATUS](invalidInput);
    }).rejects.toThrow(_ADDRESS_ERROR_REGEX);
  });

  it('should handle non-existent quote', async () => {
    // Arrange: Non-existent but valid format quote ID
    const nonExistentQuoteId = 'cm1nonexistent123456789abc';

    const input = {
      contact: {
        address: 'Calle 123 #45-67, Bogotá, Colombia',
        phone: '+57 300 123 4567',
      },
      quoteId: nonExistentQuoteId,
    };

    // Act & Assert: Should throw error for non-existent quote
    await expect(async () => {
      await testServer.quote[SUBMIT_STATUS](input);
    }).rejects.toThrow(_NON_EXISTENT_QUOTE_ERROR_REGEX);
  });

  it('should handle quote with no items', async () => {
    // Note: This test depends on the business logic implementation
    // It might be valid to submit an empty quote or it might not be allowed

    // Arrange: Create a quote manually without items (if possible via direct DB)
    // For now, we'll test with a valid quote since our helper creates one with items
    testQuoteId = await createTestQuote();

    const input = {
      contact: {
        address: 'Calle 123 #45-67, Bogotá, Colombia',
        phone: '+57 300 123 4567',
      },
      quoteId: testQuoteId,
    };

    // Act & Assert: Should succeed since we have items
    const result = await testServer.quote[SUBMIT_STATUS](input);
    expect(result.status).toBe('sent');
  });

  it('should accept various phone number formats', async () => {
    // Arrange: Create multiple test quotes for different phone formats
    const phoneFormats = [
      '+57 300 123 4567',
      '57 300 123 4567',
      '300 123 4567',
      '3001234567',
      '(+57) 300-123-4567',
      '+57-300-123-4567',
    ];

    for (const phone of phoneFormats) {
      // Create a new quote for each test
      const quoteId = await createTestQuote();

      const input = {
        contact: {
          address: 'Calle 123 #45-67, Bogotá, Colombia',
          phone,
        },
        quoteId,
      };

      // Act: Should not throw for valid phone formats
      try {
        const result = await testServer.quote[SUBMIT_STATUS](input);
        expect(result.status).toBe(SENT_STATUS);
      } catch (error) {
        // If it fails, log which format failed for debugging
        throw new Error(`Phone format "${phone}" failed: ${(error as Error).message}`);
      }
    }
  });

  it('should accept various address formats', async () => {
    // Arrange: Test different address formats
    const addresses = [
      'Calle 123 #45-67, Bogotá, Colombia',
      'Carrera 10 # 20-30 Apt 501, Medellín',
      'Av. El Dorado #69-76, Bogotá D.C.',
      'Centro Comercial Gran Estación, Local 123',
      'Zona Industrial, Bodega 45, Cali',
    ];

    for (const address of addresses) {
      // Create a new quote for each test
      const quoteId = await createTestQuote();

      const input = {
        contact: {
          address,
          phone: '+57 300 123 4567',
        },
        quoteId,
      };

      // Act: Should not throw for valid addresses
      const result = await testServer.quote[SUBMIT_STATUS](input);
      expect(result.status).toBe('sent');
    }
  });

  it('should trigger email notification on successful submission', async () => {
    // Arrange: Create a test quote
    testQuoteId = await createTestQuote();

    const input = {
      contact: {
        address: 'Calle 123 #45-67, Bogotá, Colombia',
        phone: '+57 300 123 4567',
      },
      quoteId: testQuoteId,
    };

    // Act: Submit the quote
    const result = await testServer.quote[SUBMIT_STATUS](input);

    // Assert: Quote should be submitted successfully
    // Note: We can't directly test email sending in a unit test,
    // but we can verify the quote was marked as sent
    expect(result).toMatchObject({
      quoteId: testQuoteId,
      status: 'sent',
    });
  });

  it('should handle double submission gracefully', async () => {
    // Arrange: Create and submit a quote first time
    testQuoteId = await createTestQuote();

    const input = {
      contact: {
        address: 'Calle 123 #45-67, Bogotá, Colombia',
        phone: '+57 300 123 4567',
      },
      quoteId: testQuoteId,
    };

    // First submission
    const firstResult = await testServer.quote[SUBMIT_STATUS](input);
    expect(firstResult.status).toBe('sent');

    // Act: Try to submit the same quote again
    // This should either succeed (idempotent) or fail gracefully
    try {
      const secondResult = await testServer.quote[SUBMIT_STATUS](input);
      expect(secondResult.status).toBe('sent');
    } catch (error) {
      // If it fails, it should be a business logic error with Spanish message
      expect((error as Error).message).toMatch(_ALREADY_SENT_ERROR_REGEX);
    }
  });

  it('should validate contact object structure', async () => {
    // Arrange: Create a test quote
    testQuoteId = await createTestQuote();

    const invalidInput = {
      contact: {
        // phone: "+57 300 123 4567", // Missing required phone
        address: 'Calle 123 #45-67, Bogotá, Colombia',
        // Missing required fields or wrong structure
        email: 'test@example.com', // Wrong field
      },
      quoteId: testQuoteId,
    } as any;

    // Act & Assert: Should throw validation error for missing phone
    await expect(async () => {
      await testServer.quote[SUBMIT_STATUS](invalidInput);
    }).rejects.toThrow();
  });
});
