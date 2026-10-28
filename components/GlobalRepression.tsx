import { Container } from "@/components/site";

const FLAGS = ["🌍", "🌏", "🌎", "🗺️", "🧭"];

const COUNTRIES: { flag: string; name: string; line: string; href: string }[] = [
  {
    flag: "🌍",
    name: "Norvelia",
    line: "Donors to an 'undesirable' outlet face criminal cases. Fictional example.",
    href: "https://example.org/",
  },
  {
    flag: "🌏",
    name: "Ardenia",
    line: "Giving to a banned aid group is treated as financing an offence. Fictional example.",
    href: "https://example.org/",
  },
  {
    flag: "🌎",
    name: "Tessaly",
    line: "Trustees of a relief fund are fined for not registering it. Fictional example.",
    href: "https://example.org/",
  },
  {
    flag: "🗺️",
    name: "Velmora",
    line: "Long sentences for people accused of funding a local defence group. Fictional example.",
    href: "https://example.org/",
  },
  {
    flag: "🧭",
    name: "Korrin",
    line: "Foreign donations to civil society must be approved by the state. Fictional example.",
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
          Fictional countries used in this demo. In the real world the pattern repeats: defending
          democracy, a free press, and basic human rights can be treated as a crime. When the money trail is public, generosity becomes
          evidence. These are fictional places where giving already carries a price:
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
