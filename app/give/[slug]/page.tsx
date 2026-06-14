import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, SiteHeader, SiteFooter } from "@/components/site";
import { ThreatModelPanel } from "@/components/ThreatModelPanel";
import { DonateButton } from "@/components/DonateButton";
import { EmbedSnippet } from "@/components/EmbedSnippet";
import { RiskExplainer } from "@/components/RiskExplainer";
import { getCause, type Cause } from "@/lib/causes";
import { decodePage } from "@/lib/encodePage";

type Params = Promise<{ slug: string }>;
type Search = Promise<{ embed?: string; d?: string }>;

function resolveCause(slug: string, d?: string): Cause | undefined {
  if (slug === "custom" && d) return decodePage(d);
  return getCause(slug);
}

export default async function GivePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { slug } = await params;
  const { embed, d } = await searchParams;
  const cause = resolveCause(slug, d);
  if (!cause) notFound();

  const isEmbed = embed === "1";

  // Compact, chrome-free variant for iframe embedding on a cause's own site.
  if (isEmbed) {
    return (
      <main className="p-5">
        <span
          className="inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium"
          style={{ backgroundColor: `${cause.accent}1a`, color: cause.accent }}
        >
          {cause.category}
        </span>
        <h1 className="mt-3 text-xl font-semibold tracking-tight">{cause.name}</h1>
        <p className="mt-2 text-sm leading-6 text-muted">{cause.blurb}</p>
        <div className="mt-4">
          <DonateButton cause={cause} />
        </div>
        <p className="mt-3 text-xs text-muted">
          Private giving via Cloak · testnet demo
        </p>
      </main>
    );
  }

  return (
    <>
      <SiteHeader />
      <Container className="py-14">
        <Link href="/gallery" className="text-sm text-muted hover:text-foreground">
          ← All causes
        </Link>
        <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <span
              className="inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium"
              style={{ backgroundColor: `${cause.accent}1a`, color: cause.accent }}
            >
              {cause.category}
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">{cause.name}</h1>
            <p className="mt-4 text-lg leading-8 text-foreground/90">{cause.story}</p>
            <a
              href={cause.officialDonationUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
            >
              Official donation page ↗
            </a>

            <div className="mt-8">
              <RiskExplainer cause={cause} d={d} />
            </div>
          </div>

          <aside className="lg:sticky lg:top-8 h-fit rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold tracking-tight">Give privately</h2>
            <p className="mt-2 text-sm text-muted">
              Your wallet deposits into a Privacy Pool, then the gift reaches{" "}
              {cause.name} with no public link back to you.
            </p>
            <div className="mt-5">
              <DonateButton cause={cause} />
            </div>
            <div className="mt-6 border-t border-border pt-5">
              <EmbedSnippet slug={cause.slug} />
            </div>
          </aside>
        </div>

        <div className="mt-12">
          <ThreatModelPanel />
        </div>
      </Container>
      <SiteFooter />
    </>
  );
}
