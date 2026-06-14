import { describe, it, expect } from "vitest";
import { getCauses, getCause, validateCause, type Cause } from "@/lib/causes";

describe("causes", () => {
  it("loads the seeded causes and all are valid", () => {
    const causes = getCauses();
    expect(causes.length).toBeGreaterThanOrEqual(3);
    expect(causes.map((c) => c.slug)).toContain("Lantern Post");
    expect(causes.map((c) => c.slug)).toContain("Open Docket");
    expect(causes.map((c) => c.slug)).toContain("Harbor Relief");
  });

  it("getCause returns a known cause and undefined otherwise", () => {
    expect(getCause("Lantern Post")?.name).toBe("Lantern Post");
    expect(getCause("nope")).toBeUndefined();
  });

  it("validateCause rejects a malformed recipient address", () => {
    const bad = { ...getCause("Lantern Post"), testnetRecipient: "0x123" } as Cause;
    expect(() => validateCause(bad)).toThrow(/invalid testnetRecipient/);
  });
});
