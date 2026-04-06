/**
 * Unit tests for compatible-glass-types utility
 *
 * Tests the parseCompatibleGlassTypeIds and stringifyCompatibleGlassTypeIds functions
 * that handle JSON serialization/deserialization of the compatibleGlassTypeIds field.
 */

import { describe, expect, it } from "vitest";
import {
  parseCompatibleGlassTypeIds,
  stringifyCompatibleGlassTypeIds,
} from "@/lib/utils/compatible-glass-types";

describe("compatible-glass-types utilities", () => {
  describe("parseCompatibleGlassTypeIds", () => {
    it("should return empty array for null input", () => {
      const result = parseCompatibleGlassTypeIds(null);
      expect(result).toEqual([]);
    });

    it("should return empty array for undefined input", () => {
      const result = parseCompatibleGlassTypeIds(
        undefined as unknown as string | null
      );
      expect(result).toEqual([]);
    });

    it("should return empty array for empty JSON string '[]'", () => {
      const result = parseCompatibleGlassTypeIds("[]");
      expect(result).toEqual([]);
    });

    it("should parse single-element array", () => {
      const result = parseCompatibleGlassTypeIds('["glass-1"]');
      expect(result).toEqual(["glass-1"]);
    });

    it("should parse multiple-element array", () => {
      const result = parseCompatibleGlassTypeIds(
        '["glass-1","glass-2","glass-3"]'
      );
      expect(result).toEqual(["glass-1", "glass-2", "glass-3"]);
    });

    it("should return empty array for invalid JSON string", () => {
      const result = parseCompatibleGlassTypeIds("not valid json");
      expect(result).toEqual([]);
    });

    it("should return empty array for non-array JSON (object)", () => {
      const result = parseCompatibleGlassTypeIds('{"id":"glass-1"}');
      expect(result).toEqual([]);
    });

    it("should return empty array for non-array JSON (string)", () => {
      const result = parseCompatibleGlassTypeIds('"glass-1"');
      expect(result).toEqual([]);
    });
  });

  describe("stringifyCompatibleGlassTypeIds", () => {
    it("should serialize empty array to '[]'", () => {
      const result = stringifyCompatibleGlassTypeIds([]);
      expect(result).toBe("[]");
    });

    it("should serialize single-element array", () => {
      const result = stringifyCompatibleGlassTypeIds(["glass-1"]);
      expect(result).toBe('["glass-1"]');
    });

    it("should serialize multiple-element array", () => {
      const result = stringifyCompatibleGlassTypeIds(["glass-1", "glass-2"]);
      expect(result).toBe('["glass-1","glass-2"]');
    });
  });

  describe("round-trip", () => {
    it("should maintain data integrity through serialize/deserialize cycle", () => {
      const original = ["glass-1", "glass-2", "glass-3"];
      const serialized = stringifyCompatibleGlassTypeIds(original);
      const deserialized = parseCompatibleGlassTypeIds(serialized);
      expect(deserialized).toEqual(original);
    });

    it("should handle empty array round-trip", () => {
      const original: string[] = [];
      const serialized = stringifyCompatibleGlassTypeIds(original);
      const deserialized = parseCompatibleGlassTypeIds(serialized);
      expect(deserialized).toEqual(original);
    });
  });
});
