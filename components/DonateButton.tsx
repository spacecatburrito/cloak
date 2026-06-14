"use client";

import { useState } from "react";
import type { Cause } from "@/lib/causes";
import { DonateModal } from "@/components/DonateModal";

export function DonateButton({ cause }: { cause: Cause }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-accent px-6 py-3 font-medium text-surface hover:opacity-90"
      >
        Donate privately
      </button>
      {open && <DonateModal cause={cause} onClose={() => setOpen(false)} />}
    </>
  );
}
