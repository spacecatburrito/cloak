import { Container } from "@/components/site";

const STATS = [
  { n: "3", l: "fictional organisations in this demo" },
  { n: "5", l: "fictional countries where giving carries legal risk" },
  { n: "0", l: "real donations: this is a testnet demo" },
  { n: "1", l: "real deposit on the Sepolia testnet" },
];

export function ImpactStats() {
  return (
    <Container className="py-12">
      <p className="font-display mx-auto max-w-3xl text-center text-2xl font-light leading-snug tracking-tight sm:text-3xl">
        Across the fictional countries in this demo, supporting the wrong cause can mean prison - and the
        money trail gives you away. Cards, banks, and public blockchains all leave
        permanent proof of who you backed.
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
        Illustrative figures for this demo. No external sources.
      </p>
    </Container>
  );
}
