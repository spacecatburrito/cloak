import { describe, it, expect } from "vitest";
import { encodePage, decodePage } from "@/lib/encodePage";

describe("encodePage", () => {
  it("round-trips a custom page through the URL param", () => {
    const d = encodePage({
      name: "Independent Voices",
      story: "A fund for journalists at risk.",
      recipient: "0x000000000000000000000000000000000000dEaD",
      officialDonationUrl: "https://example.org",
    });
    const cause = decodePage(d);
    expect(cause?.name).toBe("Independent Voices");
    expect(cause?.testnetRecipient).toBe(
      "0x000000000000000000000000000000000000dEaD",
    );
    expect(cause?.slug).toBe("custom");
    expect(cause?.story).toContain("journalists");
  });

  it("returns undefined for a malformed param", () => {
    expect(decodePage("!!!not-base64!!!")).toBeUndefined();
  });

  it("returns undefined when required fields are missing", () => {
    const d = encodePage({ name: "", story: "x", recipient: "" });
    expect(decodePage(d)).toBeUndefined();
  });
});
