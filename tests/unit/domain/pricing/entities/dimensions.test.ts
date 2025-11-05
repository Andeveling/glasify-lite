/** biome-ignore-all lint/style/noMagicNumbers: Test file with expected numeric literal values for assertions */
import { Dimensions } from "@domain/pricing/core/entities/dimensions";
import { describe, expect, it } from "vitest";

describe("Dimensions", () => {
  describe("creation", () => {
    it("should create Dimensions with valid values", () => {
      const dims = new Dimensions({
        widthMm: 1000,
        heightMm: 2000,
        minWidthMm: 800,
        minHeightMm: 800,
      });
      expect(dims.widthMm).toBe(1000);
      expect(dims.heightMm).toBe(2000);
      expect(dims.minWidthMm).toBe(800);
      expect(dims.minHeightMm).toBe(800);
    });

    it("should handle zero minimum dimensions", () => {
      const dims = new Dimensions({
        widthMm: 500,
        heightMm: 600,
        minWidthMm: 0,
        minHeightMm: 0,
      });
      expect(dims.minWidthMm).toBe(0);
      expect(dims.minHeightMm).toBe(0);
    });
  });

  describe("effective dimensions", () => {
    it("should calculate effective width (width > min)", () => {
      const dims = new Dimensions({
        widthMm: 1000,
        heightMm: 2000,
        minWidthMm: 800,
        minHeightMm: 800,
      });
      expect(dims.getEffectiveWidth()).toBe(200); // 1000 - 800
    });

    it("should calculate effective height (height > min)", () => {
      const dims = new Dimensions({
        widthMm: 1000,
        heightMm: 1200,
        minWidthMm: 800,
        minHeightMm: 800,
      });
      expect(dims.getEffectiveHeight()).toBe(400); // 1200 - 800
    });

    it("should return zero when width equals minimum", () => {
      const dims = new Dimensions({
        widthMm: 800,
        heightMm: 1000,
        minWidthMm: 800,
        minHeightMm: 800,
      });
      expect(dims.getEffectiveWidth()).toBe(0);
    });

    it("should return zero when height equals minimum", () => {
      const dims = new Dimensions({
        widthMm: 1000,
        heightMm: 800,
        minWidthMm: 800,
        minHeightMm: 800,
      });
      expect(dims.getEffectiveHeight()).toBe(0);
    });

    it("should clamp effective width to zero when below minimum", () => {
      const dims = new Dimensions({
        widthMm: 700,
        heightMm: 1000,
        minWidthMm: 800,
        minHeightMm: 800,
      });
      expect(dims.getEffectiveWidth()).toBe(0); // max(700 - 800, 0) = 0
    });

    it("should clamp effective height to zero when below minimum", () => {
      const dims = new Dimensions({
        widthMm: 1000,
        heightMm: 700,
        minWidthMm: 800,
        minHeightMm: 800,
      });
      expect(dims.getEffectiveHeight()).toBe(0); // max(700 - 800, 0) = 0
    });
  });

  describe("conversion to meters", () => {
    it("should convert millimeters to meters", () => {
      const dims = new Dimensions({
        widthMm: 1000,
        heightMm: 2000,
        minWidthMm: 800,
        minHeightMm: 800,
      });
      const meters = dims.toMeters();
      expect(meters.widthM).toBe(1.0); // 1000mm = 1.0m
      expect(meters.heightM).toBe(2.0); // 2000mm = 2.0m
    });

    it("should handle fractional meters", () => {
      const dims = new Dimensions({
        widthMm: 1500,
        heightMm: 2500,
        minWidthMm: 0,
        minHeightMm: 0,
      });
      const meters = dims.toMeters();
      expect(meters.widthM).toBe(1.5);
      expect(meters.heightM).toBe(2.5);
    });

    it("should convert zero dimensions to zero meters", () => {
      const dims = new Dimensions({
        widthMm: 0,
        heightMm: 0,
        minWidthMm: 0,
        minHeightMm: 0,
      });
      const meters = dims.toMeters();
      expect(meters.widthM).toBe(0);
      expect(meters.heightM).toBe(0);
    });
  });

  describe("edge cases", () => {
    it("should handle very large dimensions", () => {
      const dims = new Dimensions({
        widthMm: 10_000,
        heightMm: 10_000,
        minWidthMm: 800,
        minHeightMm: 800,
      });
      expect(dims.getEffectiveWidth()).toBe(9200);
      expect(dims.getEffectiveHeight()).toBe(9200);
    });

    it("should handle negative dimensions (edge case)", () => {
      const dims = new Dimensions({
        widthMm: -100,
        heightMm: -200,
        minWidthMm: 800,
        minHeightMm: 800,
      });
      // Negative dimensions below minimum should still clamp to zero
      expect(dims.getEffectiveWidth()).toBe(0);
      expect(dims.getEffectiveHeight()).toBe(0);
    });

    it("should handle zero width and non-zero minimum", () => {
      const dims = new Dimensions({
        widthMm: 0,
        heightMm: 1000,
        minWidthMm: 800,
        minHeightMm: 800,
      });
      expect(dims.getEffectiveWidth()).toBe(0); // max(0 - 800, 0) = 0
      expect(dims.getEffectiveHeight()).toBe(200); // 1000 - 800
    });
  });
});
