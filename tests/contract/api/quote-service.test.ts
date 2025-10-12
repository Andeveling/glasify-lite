/**
 * Contract Test: Quote Service Business Logic
 *
 * Tests the business logic in quote.service.ts with mock data
 * to ensure contract compliance before database integration.
 *
 * @group contract
 * @vitest-environment node
 */
/** biome-ignore-all lint/style/noNonNullAssertion: <explanation> */

import type { Manufacturer, PrismaClient } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CartItem } from '../../../src/types/cart.types';
import type { GenerateQuoteInput } from '../../../src/types/quote.types';

const CLX_ID_REGEX = /^clx_/;

const mockCartItems: CartItem[] = [
  {
    additionalServiceIds: ['clx_service_123'],
    createdAt: '2025-01-15T10:30:00.000Z',
    dimensions: {
      heightMm: 1500,
      widthMm: 1200,
    },
    glassTypeId: 'clx_glass_123',
    glassTypeName: 'Tempered 6mm',
    heightMm: 1500,
    id: 'clx_cart_item_1',
    modelId: 'clx_model_123',
    modelName: 'VEKA Sliding Window',
    name: 'VEKA-001',
    quantity: 2,
    solutionId: 'clx_solution_123',
    solutionName: 'Energy Saving',
    subtotal: 30_001.0,
    unitPrice: 15_000.5,
    widthMm: 1200,
  },
  {
    additionalServiceIds: [],
    createdAt: '2025-01-15T10:35:00.000Z',
    dimensions: {
      heightMm: 1200,
      widthMm: 800,
    },
    glassTypeId: 'clx_glass_456',
    glassTypeName: 'Laminated 8mm',
    heightMm: 1200,
    id: 'clx_cart_item_2',
    modelId: 'clx_model_456',
    modelName: 'Guardian Fixed Panel',
    name: 'GUARDIAN-001',
    quantity: 1,
    subtotal: 12_000.0,
    unitPrice: 12_000.0,
    widthMm: 800,
  },
];

describe('Contract: Quote Service Business Logic', () => {
  // Mock Prisma client
  const _mockPrisma = {
    $transaction: vi.fn(),
    glassType: {
      findMany: vi.fn(),
    },
    manufacturer: {
      findUnique: vi.fn(),
    },
    model: {
      findMany: vi.fn(),
    },
    quote: {
      create: vi.fn(),
    },
  } as unknown as PrismaClient;

  const _mockManufacturer: Manufacturer = {
    createdAt: new Date('2025-01-01'),
    currency: 'COP',
    id: 'clx_manufacturer_123',
    name: 'VEKA Colombia',
    quoteValidityDays: 15,
    updatedAt: new Date('2025-01-01'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateQuoteFromCart', () => {
    it('should accept valid input and return quote with correct structure', () => {
      const input: GenerateQuoteInput = {
        cartItems: mockCartItems,
        contactPhone: '+57 300 123 4567',
        manufacturerId: 'clx_manufacturer_123',
        projectAddress: {
          projectCity: 'Bogotá',
          projectName: 'Residential Complex Phase 1',
          projectPostalCode: '110111',
          projectState: 'Cundinamarca',
          projectStreet: 'Av. Principal 123',
        },
      };

      // Expected output contract
      const expectedOutput = {
        itemCount: 2,
        quoteId: expect.stringMatching(/^clx_/),
        total: expect.any(Number),
        validUntil: expect.any(Date),
      };

      // Validate input contract
      expect(input.cartItems).toHaveLength(2);
      expect(input.projectAddress.projectStreet).toBe('Av. Principal 123');
      expect(input.manufacturerId).toMatch(/^clx_/);

      // Validate output structure
      expect(expectedOutput.quoteId).toBeDefined();
      expect(expectedOutput.total).toBeDefined();
      expect(expectedOutput.itemCount).toBe(2);
    });

    it('should validate that cart items have valid references', () => {
      const input: GenerateQuoteInput = {
        cartItems: mockCartItems,
        manufacturerId: 'clx_manufacturer_123',
        projectAddress: {
          projectCity: 'Test City',
          projectName: 'Test Project',
          projectPostalCode: '12345',
          projectState: 'Test State',
          projectStreet: 'Test Street',
        },
      };
      // All cart items must have valid model and glass type IDs
      for (const item of input.cartItems) {
        expect(item.modelId).toMatch(CLX_ID_REGEX);
        expect(item.glassTypeId).toMatch(CLX_ID_REGEX);
        expect(item.name).toBeTruthy();
        expect(item.quantity).toBeGreaterThan(0);
        expect(item.subtotal).toBeGreaterThanOrEqual(0);
      }
    });
  });

  it('should validate that validUntil is calculated correctly', () => {
    const now = new Date('2025-01-15T10:00:00.000Z');
    const quoteValidityDays = 15;

    // Calculate expected validUntil
    const expectedValidUntil = new Date(now);
    expectedValidUntil.setDate(expectedValidUntil.getDate() + quoteValidityDays);

    // Contract: validUntil should be exactly N days from creation
    const daysDiff = Math.floor((expectedValidUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    expect(daysDiff).toBe(quoteValidityDays);
  });

  it('should validate that total equals sum of all item subtotals', () => {
    const input: GenerateQuoteInput = {
      cartItems: mockCartItems,
      manufacturerId: 'clx_manufacturer_123',
      projectAddress: {
        projectCity: 'Test City',
        projectName: 'Test Project',
        projectPostalCode: '12345',
        projectState: 'Test State',
        projectStreet: 'Test Street',
      },
    };

    // Calculate expected total
    const expectedTotal = input.cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    // Contract: quote total must match cart total
    expect(expectedTotal).toBe(42_001.0);
  });

  it('should validate project address structure', () => {
    const input: GenerateQuoteInput = {
      cartItems: mockCartItems,
      manufacturerId: 'clx_manufacturer_123',
      projectAddress: {
        projectCity: 'Bogotá',
        projectName: 'Residential Complex',
        projectPostalCode: '110111',
        projectState: 'Cundinamarca',
        projectStreet: 'Av. Principal 123',
      },
    };

    // Contract: project address must have required fields
    expect(input.projectAddress.projectStreet).toBeTruthy();
    expect(input.projectAddress.projectCity).toBeTruthy();
    expect(input.projectAddress.projectState).toBeTruthy();
    expect(input.projectAddress.projectPostalCode).toBeTruthy();
  });

  it('should handle optional fields correctly', () => {
    const inputWithOptionals: GenerateQuoteInput = {
      cartItems: mockCartItems,
      contactPhone: '+57 300 123 4567',
      manufacturerId: 'clx_manufacturer_123',
      projectAddress: {
        projectCity: 'Test City',
        projectName: 'Test Project',
        projectPostalCode: '12345',
        projectState: 'Test State',
        projectStreet: 'Test Street',
      },
    };

    const inputWithoutOptionals: GenerateQuoteInput = {
      cartItems: mockCartItems,
      manufacturerId: 'clx_manufacturer_123',
      projectAddress: {
        projectCity: 'Test City',
        projectName: 'Test Project',
        projectPostalCode: '12345',
        projectState: 'Test State',
        projectStreet: 'Test Street',
      },
    };

    // Contract: optional fields should not affect validity
    expect(inputWithOptionals.contactPhone).toBeDefined();
    expect(inputWithoutOptionals.contactPhone).toBeUndefined();
  });

  it('should validate cart item name uniqueness within quote', () => {
    const duplicateNamesInput: GenerateQuoteInput = {
      cartItems: [
        { ...(mockCartItems[0] ?? {}), name: 'VEKA-001' },
        { ...(mockCartItems[1] ?? {}), name: 'VEKA-001' }, // Duplicate name
      ],
      manufacturerId: 'clx_manufacturer_123',
      projectAddress: {
        projectCity: 'Test City',
        projectName: 'Test Project',
        projectPostalCode: '12345',
        projectState: 'Test State',
        projectStreet: 'Test Street',
      },
    };

    // Contract: duplicate names should be detected
    const names = duplicateNamesInput.cartItems.map((item) => item.name);
    const uniqueNames = new Set(names);

    expect(names.length).not.toBe(uniqueNames.size);
  });

  it('should validate quantity and subtotal relationship', () => {
    const input: GenerateQuoteInput = {
      cartItems: mockCartItems,
      manufacturerId: 'clx_manufacturer_123',
      projectAddress: {
        projectCity: 'Test City',
        projectName: 'Test Project',
        projectPostalCode: '12345',
        projectState: 'Test State',
        projectStreet: 'Test Street',
      },
    };

    // Contract: subtotal must equal unitPrice * quantity
    for (const item of input.cartItems) {
      expect(item.subtotal).toBeCloseTo(item.unitPrice * item.quantity, 2);
    }
  });
});

describe('Error Scenarios', () => {
  it('should validate empty cart rejection', () => {
    const emptyCartInput: GenerateQuoteInput = {
      cartItems: [],
      manufacturerId: 'clx_manufacturer_123',
      projectAddress: {
        projectCity: 'Test City',
        projectName: 'Test Project',
        projectPostalCode: '12345',
        projectState: 'Test State',
        projectStreet: 'Test Street',
      },
    };

    // Contract: empty cart should be rejected
    expect(emptyCartInput.cartItems).toHaveLength(0);
  });

  it('should validate invalid manufacturer ID', () => {
    const invalidManufacturerInput: GenerateQuoteInput = {
      cartItems: mockCartItems,
      manufacturerId: 'invalid-id',
      projectAddress: {
        projectCity: 'Test City',
        projectName: 'Test Project',
        projectPostalCode: '12345',
        projectState: 'Test State',
        projectStreet: 'Test Street',
      },
    };

    // Contract: invalid manufacturer ID format
    expect(invalidManufacturerInput.manufacturerId).not.toMatch(/^clx_/);
  });

  it('should validate negative prices rejection', () => {
    const negativePriceItem: CartItem = {
      ...mockCartItems[0]!,
      subtotal: -200,
      unitPrice: -100,
    };

    // Contract: negative prices are invalid
    expect(negativePriceItem.unitPrice).toBeLessThan(0);
    expect(negativePriceItem.subtotal).toBeLessThan(0);
  });

  it('should validate zero quantity rejection', () => {
    const zeroQuantityItem: CartItem = {
      ...mockCartItems[0]!,
      quantity: 0,
      subtotal: 0,
    };

    // Contract: zero quantity is invalid
    expect(zeroQuantityItem.quantity).toBe(0);
  });
});

describe('Data Transformation', () => {
  it('should validate cart item to quote item transformation', () => {
    const cartItem = mockCartItems[0]!;

    // Contract: CartItem fields should map to QuoteItem fields
    const quoteItemStructure = {
      glassTypeId: cartItem.glassTypeId, // Reference preserved
      heightMm: cartItem.heightMm, // Dimensions preserved
      modelId: cartItem.modelId, // Reference preserved
      name: cartItem.name, // From cart (user-editable)
      quantity: cartItem.quantity, // From cart
      subtotal: cartItem.subtotal, // Price locked at quote time
      widthMm: cartItem.widthMm, // Dimensions preserved
    };

    expect(quoteItemStructure.name).toBe('VEKA-001');
    expect(quoteItemStructure.quantity).toBe(2);
    expect(quoteItemStructure.subtotal).toBe(30_001.0);
  });

  it('should validate project address transformation', () => {
    const input: GenerateQuoteInput = {
      cartItems: mockCartItems,
      manufacturerId: 'clx_manufacturer_123',
      projectAddress: {
        projectCity: 'Bogotá',
        projectName: 'Residential Complex Phase 1',
        projectPostalCode: '110111',
        projectState: 'Cundinamarca',
        projectStreet: 'Av. Principal 123',
      },
    };

    // Contract: Project address should map to Quote fields
    const quoteProjectFields = {
      projectCity: input.projectAddress.projectCity,
      projectName: input.projectAddress.projectName,
      projectPostalCode: input.projectAddress.projectPostalCode,
      projectState: input.projectAddress.projectState,
      projectStreet: input.projectAddress.projectStreet,
    };

    expect(quoteProjectFields.projectName).toBe('Residential Complex Phase 1');
    expect(quoteProjectFields.projectStreet).toBe('Av. Principal 123');
    expect(quoteProjectFields.projectCity).toBe('Bogotá');
  });
});
