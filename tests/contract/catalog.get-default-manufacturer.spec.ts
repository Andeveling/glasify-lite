import { describe, expect, it } from 'vitest';
import { testServer } from '../integration-setup';

/**
 * Contract Test: catalog.get-default-manufacturer
 * Issue: #002-ui-ux-requirements
 *
 * Given that the catalog page needs a manufacturer
 * When I request the default manufacturer
 * Then I should receive a valid manufacturer without hardcoded IDs
 */

// ISO 4217 currency format regex - defined at top level for performance
const CURRENCY_FORMAT_REGEX = /^[A-Z]{3}$/;

describe('Contract: catalog.get-default-manufacturer - Issue002', () => {
  it('Should_ReturnValidManufacturer_When_RequestedWithoutHardcodedID_Issue002', async () => {
    // Act
    const result = await testServer.catalog['get-default-manufacturer']();

    // Assert
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('string');
    expect(result.id.length).toBeGreaterThan(0);
    expect(result.name).toBeDefined();
    expect(typeof result.name).toBe('string');
    expect(result.name.length).toBeGreaterThan(0);
  });

  it('Should_ReturnManufacturerWithCurrency_When_Requested_Issue002', async () => {
    // Act
    const result = await testServer.catalog['get-default-manufacturer']();

    // Assert
    expect(result.currency).toBeDefined();
    expect(result.currency).toMatch(CURRENCY_FORMAT_REGEX); // ISO 4217 format
  });

  it('Should_ReturnSameManufacturer_When_CalledMultipleTimes_Issue002', async () => {
    // Act
    const firstCall = await testServer.catalog['get-default-manufacturer']();
    const secondCall = await testServer.catalog['get-default-manufacturer']();

    // Assert - Should be deterministic
    expect(firstCall.id).toBe(secondCall.id);
    expect(firstCall.name).toBe(secondCall.name);
  });
});
