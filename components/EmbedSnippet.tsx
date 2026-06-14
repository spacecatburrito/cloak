"use client";

import { useState } from "react";

export function EmbedSnippet({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  const code = `<iframe src="https://YOUR-CLOAK-URL/give/${slug}?embed=1" width="380" height="260" style="border:1px solid #e7e0d6;border-radius:16px" title="Donate privately with Cloak"></iframe>`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked; user can select manually */
    }
  }

  return (
    <div>
      <p className="text-sm font-medium">Embed on your own site</p>
      <p className="mt-1 text-xs text-muted">
        Drop this anywhere to let supporters give privately, without leaving your page.
      </p>
      <pre className="mt-3 max-h-28 overflow-auto rounded-lg bg-foreground/5 p-3 text-[11px] leading-5 text-foreground/80">
        {code}
      </pre>
      <button
        onClick={copy}
        className="mt-2 rounded-full border border-border px-4 py-1.5 text-sm font-medium hover:bg-accent-soft"
      >
        {copied ? "Copied" : "Copy embed code"}
      </button>
    </div>
  );
}
