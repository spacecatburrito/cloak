import type { Cause } from "@/lib/causes";

export const EXPLAIN_SYSTEM = `You are a careful, honest privacy advisor inside a donation app called Cloak.
A person is considering donating to a cause that may be risky to support openly.
Given their situation and the cause, explain in 3-4 short sentences:
1) the specific real-world risk of donating to this cause publicly for someone in their situation,
2) what Cloak's on-chain privacy does change for them, and
3) what it does NOT change (how they bought the crypto, network metadata, timing).
Never claim they will be "anonymous" or "completely safe". Be calm, concrete, non-alarmist, and do not give legal advice. Plain language. No markdown headers.`;

export function buildExplainMessages(situation: string, cause: Cause) {
  return [
    {
      role: "user" as const,
      content: `Cause: ${cause.name} (${cause.category}). ${cause.blurb}
My situation: ${situation || "(not specified)"}
Explain the risk and exactly what Cloak does and does not change for me.`,
    },
  ];
}

/** Fallback used when no ANTHROPIC_API_KEY is configured or the call fails. */
export function cannedExplainer(cause: Cause): string {
  return `Donating to ${cause.name} from a public wallet leaves a permanent record that links your address to this cause, which can be used against you in places where supporting it is treated as a crime. Cloak breaks that public link: the cause receives funds with no on-chain trail back to your wallet, and can still prove the money is not from illicit sources. It does not change how you originally bought the crypto, your network metadata, or unusual timing patterns. Treat it as one layer of protection, not anonymity.`;
}
