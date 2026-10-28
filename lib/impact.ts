/**
 * Impact Wall aggregation. Tracks verified-clean private giving per cause, with
 * NO donor identities. Backed by localStorage and seeded with demo totals so the
 * wall is never empty. This is the transparency half of "accountable privacy".
 */
export type ImpactRow = { slug: string; totalEth: number; count: number };

const STORAGE_KEY = "cloak.impact";

const SEED: Record<string, ImpactRow> = {
  "lantern-post": { slug: "lantern-post", totalEth: 0.42, count: 7 },
  "open-docket": { slug: "open-docket", totalEth: 0.31, count: 5 },
  "harbor-relief": { slug: "harbor-relief", totalEth: 0.58, count: 9 },
};

function read(): Record<string, ImpactRow> {
  if (typeof window === "undefined") return { ...SEED };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...SEED };
    return { ...SEED, ...JSON.parse(raw) };
  } catch {
    return { ...SEED };
  }
}

export function getImpact(): ImpactRow[] {
  return Object.values(read()).sort((a, b) => b.totalEth - a.totalEth);
}

export function getImpactFor(slug: string): ImpactRow {
  return read()[slug] ?? { slug, totalEth: 0, count: 0 };
}

export function recordGift(slug: string, amountEth: number) {
  if (typeof window === "undefined") return;
  try {
    const data = read();
    const prev = data[slug] ?? { slug, totalEth: 0, count: 0 };
    data[slug] = {
      slug,
      totalEth: Number((prev.totalEth + amountEth).toFixed(6)),
      count: prev.count + 1,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* non-fatal */
  }
}
