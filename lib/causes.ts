import { isAddress } from "viem";
import causesData from "@/data/causes.json";

export type Cause = {
  slug: string;
  name: string;
  category: string;
  blurb: string;
  story: string;
  officialDonationUrl: string;
  /** Sepolia testnet recipient used for the demo. No real money moves. */
  testnetRecipient: string;
  accent: string;
};

/** Throws if a cause is missing fields or has a malformed recipient address. */
export function validateCause(c: Cause): Cause {
  for (const field of [
    "slug",
    "name",
    "category",
    "blurb",
    "story",
    "officialDonationUrl",
    "testnetRecipient",
  ] as const) {
    if (!c[field] || typeof c[field] !== "string") {
      throw new Error(`Cause "${c.slug ?? "?"}" missing field: ${field}`);
    }
  }
  if (!isAddress(c.testnetRecipient)) {
    throw new Error(
      `Cause "${c.slug}" has an invalid testnetRecipient address: ${c.testnetRecipient}`,
    );
  }
  return c;
}

export function getCauses(): Cause[] {
  return (causesData.causes as Cause[]).map(validateCause);
}

export function getCause(slug: string): Cause | undefined {
  return getCauses().find((c) => c.slug === slug);
}
