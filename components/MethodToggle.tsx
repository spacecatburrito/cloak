"use client";

import { useMethod, type Method } from "@/components/MethodContext";

const OPTIONS: { value: Method; label: string }[] = [
  { value: "1step", label: "1 step" },
  { value: "2step", label: "2 steps" },
];

export function MethodToggle() {
  const { method, setMethod } = useMethod();
  return (
    <div
      className="inline-flex rounded-full border border-border bg-surface p-0.5 text-xs"
      title="1 step: we send straight to the cause. 2 steps: deposit to your own pool balance, then withdraw yourself."
    >
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => setMethod(o.value)}
          className={`rounded-full px-3 py-1 font-medium transition ${
            method === o.value ? "bg-accent text-white" : "text-muted hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
