import Link from "next/link";
import { Container, SiteHeader, SiteFooter } from "@/components/site";
import { CauseCard } from "@/components/CauseCard";
import { ThreatModelPanel } from "@/components/ThreatModelPanel";
import { getCauses } from "@/lib/causes";

const STEPS = [
  {
    n: "01",
    t: "Deposit into the pool",
    d: "Your wallet sends funds into a shared Privacy Pool. This part is public, like any transaction.",
  },
  {
    n: "02",
    t: "The link is broken",
    d: "The gift leaves the pool to the cause with no on-chain trail back to your address.",
  },
  {
    n: "03",
    t: "Clean, and accountable",
    d: "The cause can prove the funds are not from illicit sources, so it can accept them openly.",
  },
];

export default function Home() {
  const causes = getCauses();

  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="veil pointer-events-none absolute inset-0 -z-10" />
        <Container className="py-24 sm:py-32">
          <p className="reveal text-sm font-medium tracking-wide text-accent" style={{ animationDelay: "0ms" }}>
            Private, accountable giving · built on Privacy Pools v2
          </p>
          <h1
            className="reveal font-display mt-5 max-w-4xl text-5xl font-light leading-[1.05] tracking-tight sm:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            Give to what you believe in, without{" "}
            <em className="italic text-accent">becoming a target.</em>
          </h1>
          <p
            className="reveal mt-7 max-w-2xl text-lg leading-8 text-muted"
            style={{ animationDelay: "180ms" }}
          >
            In Norvelia, Ardenia, Velmora and beyond, donating to independent media or
            human-rights groups is now evidence that can be used against you. Cloak
            breaks the public on-chain link between you and the cause, so support stops
            being a confession.
          </p>
          <div
            className="reveal mt-9 flex flex-wrap gap-3"
            style={{ animationDelay: "280ms" }}
          >
            <Link
              href="/gallery"
              className="rounded-full bg-accent px-6 py-3 font-medium text-surface transition hover:opacity-90"
            >
              Give privately
            </Link>
            <Link
              href="/create"
              className="rounded-full border border-border bg-surface/70 px-6 py-3 font-medium backdrop-blur transition hover:bg-accent-soft"
            >
              Create a donation page
            </Link>
          </div>
        </Container>
      </section>

      {/* Anchor story - editorial pull quote */}
      <Container className="py-8">
        <figure className="relative rounded-3xl border border-border bg-surface px-7 py-10 sm:px-12 sm:py-14">
          <span
            aria-hidden
            className="font-display absolute left-6 top-3 select-none text-7xl italic leading-none text-accent/20"
          >
            &ldquo;
          </span>
          <blockquote className="font-display relative text-2xl font-light italic leading-relaxed sm:text-[28px]">
            I am Norvelian and I live abroad. I still will not donate to Lantern Post, because
            one day I might need to go back. And my friends who visit family in Norvelia?
            They give nothing at all. We are not afraid of the cause. We are afraid of
            being seen supporting it.
          </blockquote>
          <figcaption className="mt-6 text-sm text-muted">
            The reason millions of quiet supporters give nothing.
          </figcaption>
        </figure>
      </Container>

      {/* How it works */}
      <Container className="py-16">
        <h2 className="font-display text-3xl font-light tracking-tight">How it works</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n}>
              <span className="font-display text-2xl italic text-accent">{s.n}</span>
              <h3 className="mt-2 text-lg font-semibold tracking-tight">{s.t}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{s.d}</p>
            </div>
          ))}
        </div>
      </Container>

      {/* Causes */}
      <Container className="py-8">
        <div className="flex items-end justify-between">
          <h2 className="font-display max-w-md text-3xl font-light leading-snug tracking-tight">
            Causes that are dangerous to support openly
          </h2>
          <Link href="/gallery" className="text-sm font-medium text-accent hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {causes.map((cause) => (
            <CauseCard key={cause.slug} cause={cause} />
          ))}
        </div>
      </Container>

      {/* Threat model */}
      <Container className="py-12">
        <ThreatModelPanel />
      </Container>

      <SiteFooter />
    </>
  );
}
