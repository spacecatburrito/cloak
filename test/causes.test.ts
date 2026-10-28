import { describe, it, expect } from "vitest";
import { getCauses, getCause, validateCause, type Cause } from "@/lib/causes";

describe("causes", () => {
  it("loads the seeded causes and all are valid", () => {
    const causes = getCauses();
    expect(causes.length).toBeGreaterThanOrEqual(3);
    expect(causes.map((c) => c.slug)).toContain("lantern-post");
    expect(causes.map((c) => c.slug)).toContain("open-docket");
    expect(causes.map((c) => c.slug)).toContain("harbor-relief");
  });

  it("getCause returns a known cause and undefined otherwise", () => {
    expect(getCause("lantern-post")?.name).toBe("Lantern Post");
    expect(getCause("nope")).toBeUndefined();
  });

  it("validateCause rejects a malformed recipient address", () => {
    const bad = { ...getCause("lantern-post"), testnetRecipient: "0x123" } as Cause;
    expect(() => validateCause(bad)).toThrow(/invalid testnetRecipient/);
  });
});
