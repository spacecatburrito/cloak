import Link from "next/link";
import { Container, SiteHeader, SiteFooter } from "@/components/site";
import { CauseCard } from "@/components/CauseCard";
import { ImpactWall } from "@/components/ImpactWall";
import { getCauses } from "@/lib/causes";

export default function GalleryPage() {
  const causes = getCauses();
  return (
    <>
      <SiteHeader />
      <Container className="py-14">
        <h1 className="font-display text-4xl font-light tracking-tight">Causes</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Each of these is dangerous to support openly somewhere in the world. Give
          privately, or create a page for a cause of your own.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {causes.map((c) => (
            <CauseCard key={c.slug} cause={c} />
          ))}
          <Link
            href="/create"
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted hover:border-accent hover:text-accent"
          >
            + Create a donation page
          </Link>
        </div>

        <div className="mt-12">
          <ImpactWall />
        </div>
      </Container>
      <SiteFooter />
    </>
  );
}
