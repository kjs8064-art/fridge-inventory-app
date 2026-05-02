import { describe, it, expect } from "vitest";
import { normalizeDateFormat, isValidDate, normalizeExpirationDate } from "./date-utils";

describe("Date Utils", () => {
  describe("normalizeDateFormat", () => {
    it("should handle ISO format (YYYY-MM-DD)", () => {
      expect(normalizeDateFormat("2025-05-01")).toBe("2025-05-01");
    });

    it("should handle YYYY/MM/DD format", () => {
      expect(normalizeDateFormat("2025/05/01")).toBe("2025-05-01");
    });

    it("should handle YYYY.MM.DD format", () => {
      expect(normalizeDateFormat("2025.05.01")).toBe("2025-05-01");
    });

    it("should handle English month names (May 1, 2025)", () => {
      expect(normalizeDateFormat("May 1, 2025")).toBe("2025-05-01");
    });

    it("should handle English month names (May 1 2025)", () => {
      expect(normalizeDateFormat("May 1 2025")).toBe("2025-05-01");
    });

    it("should handle short English month names (Jan 15, 2025)", () => {
      expect(normalizeDateFormat("Jan 15, 2025")).toBe("2025-01-15");
    });

    it("should handle Korean format (2025년 5월 1일)", () => {
      expect(normalizeDateFormat("2025년 5월 1일")).toBe("2025-05-01");
    });

    it("should handle Korean format with spaces (2025 년 5 월 1 일)", () => {
      // 정규식이 \s*로 공백을 처리하므로 이 형식도 지원
      const result = normalizeDateFormat("2025 년 5 월 1 일");
      expect(result).toBe("2025-05-01");
    });

    it("should handle simple Korean format (5월 1일 2025)", () => {
      expect(normalizeDateFormat("5월 1일 2025")).toBe("2025-05-01");
    });

    it("should handle numeric format (20250501)", () => {
      expect(normalizeDateFormat("20250501")).toBe("2025-05-01");
    });

    it("should handle ISO 8601 with timezone (2025-05-01T00:00:00Z)", () => {
      const result = normalizeDateFormat("2025-05-01T00:00:00Z");
      expect(result).toBe("2025-05-01");
    });

    it("should handle ISO 8601 with timezone offset (2025-05-01T00:00:00+09:00)", () => {
      // UTC 기준으로 변환되므로 타임존에 따라 다를 수 있음
      const result = normalizeDateFormat("2025-05-01T00:00:00+09:00");
      // +09:00은 UTC보다 9시간 앞이므로 UTC로는 2025-04-30
      expect(["2025-05-01", "2025-04-30"]).toContain(result);
    });

    it("should handle European format (01.05.2025)", () => {
      // 유럽식 DD.MM.YYYY 형식
      const result = normalizeDateFormat("01.05.2025");
      expect(result).toBe("2025-05-01");
    });

    it("should handle European format with hyphens (01-05-2025)", () => {
      // 유럽식 DD-MM-YYYY 형식
      const result = normalizeDateFormat("01-05-2025");
      expect(result).toBe("2025-05-01");
    });

    it("should return empty string for invalid input", () => {
      expect(normalizeDateFormat("invalid date")).toBe("");
    });

    it("should return empty string for empty input", () => {
      expect(normalizeDateFormat("")).toBe("");
    });
  });

  describe("isValidDate", () => {
    it("should validate correct date (2025-05-01)", () => {
      expect(isValidDate("2025-05-01")).toBe(true);
    });

    it("should validate date from different format", () => {
      expect(isValidDate("May 1, 2025")).toBe(true);
    });

    it("should reject invalid month (2025-13-01)", () => {
      expect(isValidDate("2025-13-01")).toBe(false);
    });

    it("should reject invalid day (2025-05-32)", () => {
      expect(isValidDate("2025-05-32")).toBe(false);
    });

    it("should reject year out of range (1800-05-01)", () => {
      expect(isValidDate("1800-05-01")).toBe(false);
    });

    it("should handle leap year (2024-02-29)", () => {
      expect(isValidDate("2024-02-29")).toBe(true);
    });

    it("should reject invalid leap year (2025-02-29)", () => {
      expect(isValidDate("2025-02-29")).toBe(false);
    });
  });

  describe("normalizeExpirationDate", () => {
    it("should return valid date as is", () => {
      expect(normalizeExpirationDate("2025-05-01")).toBe("2025-05-01");
    });

    it("should convert and validate date from different format", () => {
      expect(normalizeExpirationDate("May 1, 2025")).toBe("2025-05-01");
    });

    it("should return default date for invalid input", () => {
      const result = normalizeExpirationDate("invalid date", 7);
      const today = new Date();
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() + 7);
      const expectedString = expectedDate.toISOString().split("T")[0];
      expect(result).toBe(expectedString);
    });

    it("should use custom offset for default date", () => {
      const result = normalizeExpirationDate("invalid", 14);
      const today = new Date();
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() + 14);
      const expectedString = expectedDate.toISOString().split("T")[0];
      expect(result).toBe(expectedString);
    });
  });
});
