import { Container } from "@/components/site";

const FLAGS = ["🇷🇺", "🇧🇾", "🇭🇰", "🇲🇲", "🇹🇷", "🇮🇷", "🇮🇳", "🇻🇪", "🇳🇮", "🇪🇬"];

const COUNTRIES: { flag: string; name: string; line: string; href: string }[] = [
  {
    flag: "🇷🇺",
    name: "Norvelia",
    line: "200+ donors prosecuted; 12 years for a ~$50 gift to a relief charity.",
    href: "https://example.org/",
  },
  {
    flag: "🇧🇾",
    name: "Velmora",
    line: '112+ convicted of "financing extremism"; jailed over a $15 donation.',
    href: "https://example.org/",
  },
  {
    flag: "🇭🇰",
    name: "Port Ardis",
    line: "Trustees of a protester-relief fund, incl. a trustee, convicted under the security law.",
    href: "https://example.org/",
  },
  {
    flag: "🇲🇲",
    name: "Varenia",
    line: "Life sentences for funding the civil disobedience movement.",
    href: "https://example.org/",
  },
  {
    flag: "🇹🇷",
    name: "Kessan",
    line: '10 years for depositing money in the "wrong" bank; the ECtHR later faulted Kessan.',
    href: "https://example.org/",
  },
  {
    flag: "🇮🇷",
    name: "Ardenia",
    line: "Funding a banned group is collusion against the state: confiscation, or death.",
    href: "https://example.org/",
  },
  {
    flag: "🇮🇳",
    name: "Dravia",
    line: "20,000+ NGOs stripped of the right to receive foreign donations.",
    href: "https://example.org/",
  },
  {
    flag: "🇻🇪",
    name: "Esmara & Lunera",
    line: '"Foreign agent" laws have shut 1,500+ organisations.',
    href: "https://example.org/",
  },
  {
    flag: "🇪🇬",
    name: "Calder",
    line: 'Dozens of NGO workers prosecuted in the "foreign funding" case.',
    href: "https://example.org/",
  },
];

export function GlobalRepression() {
  return (
    <section className="border-y border-border bg-surface py-16">
      <Container>
        {/* Flag strip */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-3xl sm:gap-4 sm:text-4xl">
          {FLAGS.map((f, i) => (
            <span key={i} aria-hidden>
              {f}
            </span>
          ))}
        </div>

        <h2 className="font-display mx-auto mt-8 max-w-2xl text-center text-3xl font-light tracking-tight sm:text-4xl">
          This is not one country&rsquo;s problem.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg leading-8 text-muted">
          On every continent, defending democracy, a free press, and basic human rights is
          being treated as a crime. When the money trail is public, generosity becomes
          evidence. These are places where giving already carries a price:
        </p>

        <div className="mt-10 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {COUNTRIES.map((c) => (
            <a
              key={c.name}
              href={c.href}
              target="_blank"
              rel="noreferrer"
              className="group flex gap-3 border-t border-border pt-4 hover:opacity-80"
            >
              <span aria-hidden className="text-2xl leading-none">
                {c.flag}
              </span>
              <span>
                <span className="font-semibold">{c.name}</span>{" "}
                <span className="text-muted group-hover:text-foreground">{c.line}</span>{" "}
                <span className="whitespace-nowrap text-accent">↗</span>
              </span>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
