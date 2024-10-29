import { describe, it, expect } from "vitest";
import { formatLargeNumber } from "./numberFormat";

describe("formatLargeNumber", () => {
  // Billions
  it("formats billions correctly", () => {
    expect(formatLargeNumber(2_430_000_000)).toBe("£2.43B");
    expect(formatLargeNumber(1_000_000_000)).toBe("£1B");
    expect(formatLargeNumber(1_234_567_890)).toBe("£1.23B");
  });

  // Millions
  it("formats millions correctly", () => {
    expect(formatLargeNumber(2_430_000)).toBe("£2.43M");
    expect(formatLargeNumber(1_000_000)).toBe("£1M");
    expect(formatLargeNumber(243_000_000)).toBe("£243M");
  });

  // Regular numbers
  it("formats regular numbers correctly", () => {
    expect(formatLargeNumber(243_000)).toBe("£243,000");
    expect(formatLargeNumber(1_000)).toBe("£1,000");
    expect(formatLargeNumber(100)).toBe("£100");
  });

  // Edge cases
  it("handles edge cases correctly", () => {
    expect(formatLargeNumber(0)).toBe("£0");
    expect(formatLargeNumber(999_999_999)).toBe("£1B");
    expect(formatLargeNumber(999_499_999)).toBe("£999.5M");
  });

  // Negative numbers
  it("handles negative numbers correctly", () => {
    expect(formatLargeNumber(-2_430_000_000)).toBe("-£2.43B");
    expect(formatLargeNumber(-2_430_000)).toBe("-£2.43M");
    expect(formatLargeNumber(-243_000)).toBe("-£243,000");
  });
});
