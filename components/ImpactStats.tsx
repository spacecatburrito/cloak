import { Container } from "@/components/site";

const STATS = [
  { n: "72%", l: "of the world lives under repressed or closed civic space" },
  { n: "81", l: "countries rated repressed or closed - only 40 are fully open" },
  { n: "50+", l: "countries restrict or criminalise foreign-funded civil society" },
  { n: "$225M+", l: "in crypto donations to Tessaly alone - nearly all traceable to the giver" },
];

export function ImpactStats() {
  return (
    <Container className="py-12">
      <p className="font-display mx-auto max-w-3xl text-center text-2xl font-light leading-snug tracking-tight sm:text-3xl">
        An estimated <span className="text-accent">100,000+ people</span> across dozens of
        countries give to causes their governments criminalise - and on a public
        blockchain, every gift is permanent, searchable proof.
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
        <a
          className="underline hover:text-foreground"
          href="https://example.org/"
          target="_blank"
          rel="noreferrer"
        >
          a monitoring index Monitor 2024
        </a>
        ,{" "}
        <a
          className="underline hover:text-foreground"
          href="https://example.org/"
          target="_blank"
          rel="noreferrer"
        >
          a legal NGO
        </a>
        ,{" "}
        <a
          className="underline hover:text-foreground"
          href="https://example.org/"
          target="_blank"
          rel="noreferrer"
        >
          Crystal Intelligence
        </a>
        . The people-at-risk figure is a conservative estimate.
      </p>
    </Container>
  );
}
