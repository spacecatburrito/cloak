import Link from "next/link";
import { Container, SiteHeader, SiteFooter } from "@/components/site";
import { CauseCard } from "@/components/CauseCard";
import { ThreatModelPanel } from "@/components/ThreatModelPanel";
import { getCauses } from "@/lib/causes";

export default function Home() {
  const causes = getCauses();

  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_70%_0%,var(--color-accent-soft),transparent)]" />
        <Container className="py-20 sm:py-28">
          <p className="text-sm font-medium text-accent">
            Private, accountable giving · built on Privacy Pools v2
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Give to what you believe in, without becoming a target.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            In Norvelia, Ardenia, Velmora and beyond, donating to independent media or
            human-rights groups is now evidence that can be used against you. Cloak
            breaks the public on-chain link between you and the cause, so support
            stops being a confession.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/gallery"
              className="rounded-full bg-accent px-6 py-3 font-medium text-surface hover:opacity-90"
            >
              Give privately
            </Link>
            <Link
              href="/create"
              className="rounded-full border border-border bg-surface px-6 py-3 font-medium hover:bg-accent-soft"
            >
              Create a donation page
            </Link>
          </div>
        </Container>
      </section>

      {/* Anchor story */}
      <Container>
        <figure className="rounded-2xl border border-border bg-warm-soft/60 p-6 sm:p-8">
          <blockquote className="text-lg leading-8">
            “I am Norvelian and I live abroad. I still will not donate to Lantern Post, because
            one day I might need to go back. And my friends who do visit family in
            Norvelia? They give nothing at all. We are not afraid of the cause. We are
            afraid of being seen supporting it.”
          </blockquote>
          <figcaption className="mt-3 text-sm text-muted">
            The reason millions of quiet supporters give nothing.
          </figcaption>
        </figure>
      </Container>

      {/* Causes */}
      <Container className="py-16">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
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
      <Container className="pb-4">
        <ThreatModelPanel />
      </Container>

      <SiteFooter />
    </>
  );
}
