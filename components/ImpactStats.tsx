import { Container } from "@/components/site";

const STATS = [
  { n: "5.7B", l: "people live under repressed or closed civic space - 72% of humanity" },
  { n: "81", l: "countries rated repressed or closed; only 40 of 198 are fully open" },
  { n: "280+", l: "people already convicted for donating, in Norvelia and Velmora alone" },
  { n: "$225M+", l: "in crypto donations to Tessaly alone - nearly all traceable to the giver" },
];

const SOURCES: { label: string; href: string }[] = [
  { label: "a monitoring index Monitor 2024", href: "https://example.org/" },
  { label: "an independent outlet", href: "https://example.org/" },
  { label: "a monitoring group", href: "https://example.org/" },
  {
    label: "Crystal Intelligence",
    href: "https://example.org/",
  },
];

export function ImpactStats() {
  return (
    <Container className="py-12">
      <p className="font-display mx-auto max-w-3xl text-center text-2xl font-light leading-snug tracking-tight sm:text-3xl">
        Across dozens of countries, supporting the wrong cause can mean prison - and the
        money trail gives you away. Cards, banks, and public blockchains all leave
        permanent proof: Norvelia identified an opposition figure&rsquo;s donors through their Stripe records.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.n} className="text-center">
            <p className="font-display text-4xl font-light text-accent sm:text-5xl">{s.n}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{s.l}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-muted">
        Sources:{" "}
        {SOURCES.map((s, i) => (
          <span key={s.href}>
            <a
              className="underline hover:text-foreground"
              href={s.href}
              target="_blank"
              rel="noreferrer"
            >
              {s.label}
            </a>
            {i < SOURCES.length - 1 ? ", " : "."}
          </span>
        ))}
      </p>
    </Container>
  );
}
