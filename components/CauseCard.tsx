import Link from "next/link";
import type { Cause } from "@/lib/causes";

export function CauseCard({ cause }: { cause: Cause }) {
  return (
    <Link
      href={`/give/${cause.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-surface p-6 transition hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
    >
      <span
        className="inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium"
        style={{ backgroundColor: `${cause.accent}1a`, color: cause.accent }}
      >
        {cause.category}
      </span>
      <h3 className="mt-4 text-xl font-semibold tracking-tight">{cause.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-muted">{cause.blurb}</p>
      <span className="mt-4 text-sm font-medium text-accent group-hover:underline">
        Give privately →
      </span>
    </Link>
  );
}
