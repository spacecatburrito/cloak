"use client";

import { useState } from "react";
import { isAddress } from "viem";
import Link from "next/link";
import { Container, SiteHeader, SiteFooter } from "@/components/site";
import { encodePage } from "@/lib/encodePage";

export default function CreatePage() {
  const [name, setName] = useState("");
  const [story, setStory] = useState("");
  const [recipient, setRecipient] = useState("");
  const [url, setUrl] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const recipientValid = recipient === "" || isAddress(recipient);
  const canGenerate = name.trim() && isAddress(recipient);

  function generate() {
    const d = encodePage({
      name: name.trim(),
      story: story.trim(),
      recipient,
      officialDonationUrl: url.trim() || undefined,
    });
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    setLink(`${origin}/give/custom?d=${d}`);
    setCopied(false);
  }

  const embedCode = link
    ? `<iframe src="${link}&embed=1" width="380" height="260" style="border:1px solid #e7e0d6;border-radius:16px" title="Donate privately with Cloak"></iframe>`
    : "";

  return (
    <>
      <SiteHeader />
      <Container className="py-14">
        <h1 className="font-display text-4xl font-light tracking-tight">
          Create a private donation page
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          No account, no gatekeeping. Enter where funds should go and you get a
          shareable page plus an embed for your own site. Supporters give without
          creating a public link to your cause.
        </p>

        <div className="mt-8 grid max-w-xl gap-4">
          <Field label="Cause name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Independent Voices Fund"
              className="input"
            />
          </Field>
          <Field label="Story (what it is, why it matters)">
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              rows={3}
              className="input resize-none"
            />
          </Field>
          <Field label="Recipient wallet (EVM address)">
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x…"
              className={`input ${!recipientValid ? "border-danger" : ""}`}
            />
            {!recipientValid && (
              <p className="mt-1 text-xs text-danger">Not a valid EVM address.</p>
            )}
          </Field>
          <Field label="Official donation page (optional)">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              className="input"
            />
          </Field>

          <button
            onClick={generate}
            disabled={!canGenerate}
            className="w-fit rounded-full bg-accent px-6 py-3 font-medium text-surface hover:opacity-90 disabled:opacity-50"
          >
            Generate page
          </button>
        </div>

        {link && (
          <div className="mt-10 max-w-xl rounded-2xl border border-border bg-surface p-6">
            <p className="text-sm font-medium">Your page is ready</p>
            <Link href={link} className="mt-2 block break-all text-sm text-accent hover:underline">
              {link}
            </Link>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(link).catch(() => {});
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="mt-3 rounded-full border border-border px-4 py-1.5 text-sm font-medium hover:bg-accent-soft"
            >
              {copied ? "Copied" : "Copy link"}
            </button>
            <p className="mt-5 text-sm font-medium">Embed on your site</p>
            <pre className="mt-2 max-h-28 overflow-auto rounded-lg bg-foreground/5 p-3 text-[11px] leading-5 text-foreground/80">
              {embedCode}
            </pre>
          </div>
        )}

        <style>{`.input{width:100%;border:1px solid var(--border);background:var(--surface);border-radius:.6rem;padding:.6rem .75rem;font-size:.9rem;outline:none}.input:focus{border-color:var(--accent)}`}</style>
      </Container>
      <SiteFooter />
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
