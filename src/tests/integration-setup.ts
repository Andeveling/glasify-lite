import '@testing-library/jest-dom';
import { createCaller } from '@/server/api/root';
import { db } from '@/server/db';

// Create a test context for tRPC procedures
export const createTestContext = () => ({
  db,
  headers: new Headers(),
  session: null, // For unauthenticated tests
});

// Create a server-side caller for testing
export const testServer = createCaller(createTestContext());
