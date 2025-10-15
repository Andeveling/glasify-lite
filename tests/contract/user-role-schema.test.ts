/**
 * Contract Test: UserRole Schema Validation
 *
 * Tests Zod validation schemas for user role management.
 * Validates input/output schemas for user.update-role and user.list-all procedures.
 *
 * Reference: T044 [P] Create contract test: UserRole schema validation
 * @module tests/contract/user-role-schema
 */

import { describe, expect, it } from 'vitest';
import { z } from 'zod';

// Define schemas inline (matching src/server/api/routers/user.ts)
const UserRoleEnum = z.enum(['admin', 'seller', 'user']);

const updateUserRoleInput = z.object({
  role: UserRoleEnum,
  userId: z.string().cuid({ message: 'ID de usuario inválido.' }),
});

const listUsersInput = z.object({
  role: UserRoleEnum.optional(),
  search: z.string().optional(),
});

const userOutput = z.object({
  email: z.string(),
  id: z.string(),
  name: z.string().nullable(),
  quoteCount: z.number().int().nonnegative(),
  role: UserRoleEnum,
});

const listUsersOutput = z.array(userOutput);

const updateUserRoleOutput = z.object({
  id: z.string(),
  role: UserRoleEnum,
});

describe('Contract Test - UserRole Schemas', () => {
  describe('UserRoleEnum Validation', () => {
    it('should accept valid role: admin', () => {
      const result = UserRoleEnum.safeParse('admin');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('admin');
      }
    });

    it('should accept valid role: seller', () => {
      const result = UserRoleEnum.safeParse('seller');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('seller');
      }
    });

    it('should accept valid role: user', () => {
      const result = UserRoleEnum.safeParse('user');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('user');
      }
    });

    it('should reject invalid role', () => {
      const result = UserRoleEnum.safeParse('superadmin');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
      }
    });

    it('should reject empty string', () => {
      const result = UserRoleEnum.safeParse('');

      expect(result.success).toBe(false);
    });

    it('should reject null', () => {
      const result = UserRoleEnum.safeParse(null);

      expect(result.success).toBe(false);
    });

    it('should reject undefined', () => {
      const result = UserRoleEnum.safeParse(undefined);

      expect(result.success).toBe(false);
    });
  });

  describe('updateUserRoleInput Schema', () => {
    it('should accept valid input', () => {
      const validInput = {
        role: 'admin' as const,
        userId: 'clx1234567890abcdefghi',
      };

      const result = updateUserRoleInput.safeParse(validInput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.userId).toBe('clx1234567890abcdefghi');
        expect(result.data.role).toBe('admin');
      }
    });

    it('should accept all valid roles', () => {
      const roles = ['admin', 'seller', 'user'] as const;

      for (const role of roles) {
        const input = { role, userId: 'clx1234567890abcdefghi' };
        const result = updateUserRoleInput.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.role).toBe(role);
        }
      }
    });

    it('should reject invalid userId format', () => {
      const invalidInput = {
        role: 'admin' as const,
        userId: 'not-a-cuid',
      };

      const result = updateUserRoleInput.safeParse(invalidInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        const userIdError = result.error.issues.find((issue) => issue.path[0] === 'userId');
        expect(userIdError?.message).toBe('ID de usuario inválido.');
      }
    });

    it('should reject invalid role', () => {
      const invalidInput = {
        role: 'superadmin',
        userId: 'clx1234567890abcdefghi',
      };

      const result = updateUserRoleInput.safeParse(invalidInput);

      expect(result.success).toBe(false);
    });

    it('should reject missing userId', () => {
      const invalidInput = {
        role: 'admin' as const,
      };

      const result = updateUserRoleInput.safeParse(invalidInput);

      expect(result.success).toBe(false);
    });

    it('should reject missing role', () => {
      const invalidInput = {
        userId: 'clx1234567890abcdefghi',
      };

      const result = updateUserRoleInput.safeParse(invalidInput);

      expect(result.success).toBe(false);
    });
  });

  describe('listUsersInput Schema', () => {
    it('should accept empty input', () => {
      const validInput = {};

      const result = listUsersInput.safeParse(validInput);

      expect(result.success).toBe(true);
    });

    it('should accept input with role filter', () => {
      const validInput = { role: 'seller' as const };

      const result = listUsersInput.safeParse(validInput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe('seller');
      }
    });

    it('should accept input with search query', () => {
      const validInput = { search: 'john@example.com' };

      const result = listUsersInput.safeParse(validInput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.search).toBe('john@example.com');
      }
    });

    it('should accept input with both role and search', () => {
      const validInput = {
        role: 'admin' as const,
        search: 'admin@example.com',
      };

      const result = listUsersInput.safeParse(validInput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe('admin');
        expect(result.data.search).toBe('admin@example.com');
      }
    });

    it('should reject invalid role in filter', () => {
      const invalidInput = { role: 'superadmin' };

      const result = listUsersInput.safeParse(invalidInput);

      expect(result.success).toBe(false);
    });
  });

  describe('userOutput Schema', () => {
    it('should validate complete user output', () => {
      const validOutput = {
        email: 'john@example.com',
        id: 'clx1234567890abcdefghi',
        name: 'John Doe',
        quoteCount: 5,
        role: 'seller' as const,
      };

      const result = userOutput.safeParse(validOutput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('clx1234567890abcdefghi');
        expect(result.data.role).toBe('seller');
        expect(result.data.quoteCount).toBe(5);
      }
    });

    it('should accept null name', () => {
      const validOutput = {
        email: 'john@example.com',
        id: 'clx1234567890abcdefghi',
        name: null,
        quoteCount: 0,
        role: 'user' as const,
      };

      const result = userOutput.safeParse(validOutput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBeNull();
      }
    });

    it('should accept zero quote count', () => {
      const validOutput = {
        email: 'jane@example.com',
        id: 'clx1234567890abcdefghi',
        name: 'Jane Doe',
        quoteCount: 0,
        role: 'user' as const,
      };

      const result = userOutput.safeParse(validOutput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.quoteCount).toBe(0);
      }
    });

    it('should reject negative quote count', () => {
      const invalidOutput = {
        email: 'john@example.com',
        id: 'clx1234567890abcdefghi',
        name: 'John Doe',
        quoteCount: -1,
        role: 'seller' as const,
      };

      const result = userOutput.safeParse(invalidOutput);

      expect(result.success).toBe(false);
    });

    it('should reject decimal quote count', () => {
      const invalidOutput = {
        email: 'john@example.com',
        id: 'clx1234567890abcdefghi',
        name: 'John Doe',
        quoteCount: 2.5,
        role: 'seller' as const,
      };

      const result = userOutput.safeParse(invalidOutput);

      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const invalidOutput = {
        email: 'john@example.com',
        id: 'clx1234567890abcdefghi',
        // Missing: name, role, quoteCount
      };

      const result = userOutput.safeParse(invalidOutput);

      expect(result.success).toBe(false);
    });
  });

  describe('listUsersOutput Schema', () => {
    it('should validate array of users', () => {
      const validOutput = [
        {
          email: 'admin@example.com',
          id: 'user-1',
          name: 'Admin User',
          quoteCount: 10,
          role: 'admin' as const,
        },
        {
          email: 'seller@example.com',
          id: 'user-2',
          name: 'Seller User',
          quoteCount: 5,
          role: 'seller' as const,
        },
      ];

      const result = listUsersOutput.safeParse(validOutput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
        expect(result.data[0]?.role).toBe('admin');
        expect(result.data[1]?.role).toBe('seller');
      }
    });

    it('should accept empty array', () => {
      const validOutput: unknown[] = [];

      const result = listUsersOutput.safeParse(validOutput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(0);
      }
    });

    it('should reject array with invalid user object', () => {
      const invalidOutput = [
        {
          email: 'admin@example.com',
          id: 'user-1',
          name: 'Admin User',
          quoteCount: 10,
          role: 'admin' as const,
        },
        {
          id: 'user-2',
          // Missing required fields
        },
      ];

      const result = listUsersOutput.safeParse(invalidOutput);

      expect(result.success).toBe(false);
    });
  });

  describe('updateUserRoleOutput Schema', () => {
    it('should validate successful role update', () => {
      const validOutput = {
        id: 'clx1234567890abcdefghi',
        role: 'admin' as const,
      };

      const result = updateUserRoleOutput.safeParse(validOutput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('clx1234567890abcdefghi');
        expect(result.data.role).toBe('admin');
      }
    });

    it('should reject output with invalid role', () => {
      const invalidOutput = {
        id: 'clx1234567890abcdefghi',
        role: 'superadmin',
      };

      const result = updateUserRoleOutput.safeParse(invalidOutput);

      expect(result.success).toBe(false);
    });

    it('should reject output with missing fields', () => {
      const invalidOutput = {
        id: 'clx1234567890abcdefghi',
        // Missing: role
      };

      const result = updateUserRoleOutput.safeParse(invalidOutput);

      expect(result.success).toBe(false);
    });
  });
});
