"use client";

import { useState } from "react";
import type { Cause } from "@/lib/causes";
import { BASE_PATH } from "@/lib/basePath";

export function RiskExplainer({ cause, d }: { cause: Cause; d?: string }) {
  const [situation, setSituation] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function explain() {
    setLoading(true);
    setAnswer(null);
    try {
      const res = await fetch(`${BASE_PATH}/api/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation, causeSlug: cause.slug, d }),
      });
      const data = await res.json();
      setAnswer(data.text ?? "Could not generate an explanation right now.");
    } catch {
      setAnswer("Could not generate an explanation right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-accent-soft/50 p-6">
      <h3 className="text-base font-semibold tracking-tight">
        Is giving risky for you? Ask first.
      </h3>
      <p className="mt-1 text-sm text-muted">
        Describe your situation and get a plain, honest read on what changes - and
        what does not - if you give through Cloak.
      </p>
      <textarea
        value={situation}
        onChange={(e) => setSituation(e.target.value)}
        rows={2}
        placeholder="e.g. I'm Norvelian, I live abroad, but I visit family in Norvelia."
        className="mt-3 w-full resize-none rounded-lg border border-border bg-surface p-3 text-sm outline-none focus:border-accent"
      />
      <button
        onClick={explain}
        disabled={loading}
        className="mt-2 rounded-full bg-accent px-5 py-2 text-sm font-medium text-surface hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Thinking…" : "Explain my risk"}
      </button>
      {answer && (
        <p className="mt-4 whitespace-pre-line text-sm leading-6 text-foreground/90">
          {answer}
        </p>
      )}
    </div>
  );
}
