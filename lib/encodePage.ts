import type { Cause } from "@/lib/causes";

export type CustomPageInput = {
  name: string;
  story: string;
  recipient: string;
  officialDonationUrl?: string;
};

function toBase64Url(str: string): string {
  const b64 =
    typeof window === "undefined"
      ? Buffer.from(str, "utf8").toString("base64")
      : btoa(unescape(encodeURIComponent(str)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(b64url: string): string {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  if (typeof window === "undefined") {
    return Buffer.from(b64, "base64").toString("utf8");
  }
  return decodeURIComponent(escape(atob(b64)));
}

/** Encode a user-created donation page into a URL-safe string (no backend). */
export function encodePage(input: CustomPageInput): string {
  return toBase64Url(JSON.stringify(input));
}

/** Decode a `?d=` param back into a Cause. Returns undefined if malformed. */
export function decodePage(param: string): Cause | undefined {
  try {
    const input = JSON.parse(fromBase64Url(param)) as CustomPageInput;
    if (!input.name || !input.recipient) return undefined;
    return {
      slug: "custom",
      name: input.name,
      category: "Community",
      blurb: input.story?.slice(0, 140) || input.name,
      story: input.story || "",
      officialDonationUrl: input.officialDonationUrl || "",
      testnetRecipient: input.recipient,
      accent: "#2e6657",
    };
  } catch {
    return undefined;
  }
}
