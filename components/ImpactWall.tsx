"use client";

import { useEffect, useState } from "react";
import { getImpact, type ImpactRow } from "@/lib/impact";
import { getCauses } from "@/lib/causes";

export function ImpactWall() {
  const [rows, setRows] = useState<ImpactRow[]>([]);
  useEffect(() => setRows(getImpact()), []);

  const names = Object.fromEntries(getCauses().map((c) => [c.slug, c.name]));
  const totalEth = rows.reduce((s, r) => s + r.totalEth, 0);
  const totalCount = rows.reduce((s, r) => s + r.count, 0);

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Impact Wall</h3>
          <p className="mt-1 text-sm text-muted">
            Verified-clean private giving. Amounts are public; donors are not.
          </p>
        </div>
        <p className="text-sm text-muted">
          <span className="font-semibold text-foreground">{totalEth.toFixed(3)} ETH</span>{" "}
          across {totalCount} private gifts
        </p>
      </div>
      <ul className="mt-6 space-y-3">
        {rows.map((r) => {
          const pct = totalEth ? (r.totalEth / totalEth) * 100 : 0;
          return (
            <li key={r.slug}>
              <div className="flex justify-between text-sm">
                <span className="font-medium">{names[r.slug] ?? r.slug}</span>
                <span className="text-muted">
                  {r.totalEth.toFixed(3)} ETH · {r.count} gifts
                </span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-accent-soft">
                <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
