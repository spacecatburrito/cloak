import { describe, it, expect } from "vitest";
import { EXPLAIN_SYSTEM, buildExplainMessages, cannedExplainer } from "@/lib/aiExplain";
import { getCause } from "@/lib/causes";

const cause = getCause("Lantern Post")!;

describe("aiExplain", () => {
  it("system prompt forbids anonymity claims and demands the does/does-not split", () => {
    expect(EXPLAIN_SYSTEM.toLowerCase()).toContain("never claim");
    expect(EXPLAIN_SYSTEM.toLowerCase()).toContain("anonymous");
    expect(EXPLAIN_SYSTEM.toLowerCase()).toContain("does not");
  });

  it("builds a user message containing the situation and the cause", () => {
    const msgs = buildExplainMessages("Norvelian, live abroad", cause);
    expect(msgs[0].content).toContain("Norvelian, live abroad");
    expect(msgs[0].content).toContain("Lantern Post");
  });

  it("canned explainer names the cause and refuses to promise anonymity", () => {
    const text = cannedExplainer(cause);
    expect(text).toContain("Lantern Post");
    expect(text.toLowerCase()).toContain("not anonymity");
  });
});
