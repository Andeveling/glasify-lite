import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock NextAuth for testing environment
vi.mock("@/server/auth", () => ({
  auth: vi.fn(() => Promise.resolve(null)),
}));

// Mock database for pure unit tests (will be overridden in integration tests)
vi.mock("@/server/db", () => ({
  db: {},
}));
