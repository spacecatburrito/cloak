import { describe, it, expect } from "vitest";
import { getImpact, getImpactFor } from "@/lib/impact";

describe("impact", () => {
  it("returns seeded rows sorted by total descending", () => {
    const rows = getImpact();
    expect(rows.length).toBeGreaterThanOrEqual(3);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1].totalEth).toBeGreaterThanOrEqual(rows[i].totalEth);
    }
  });

  it("getImpactFor returns a seeded cause and a zero row for unknown", () => {
    expect(getImpactFor("lantern-post").count).toBeGreaterThan(0);
    expect(getImpactFor("unknown-cause")).toEqual({
      slug: "unknown-cause",
      totalEth: 0,
      count: 0,
    });
  });
});
