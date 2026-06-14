import Link from "next/link";

export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-5xl px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
      <span
        aria-hidden
        className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-surface"
      >
        ◆
      </span>
      Cloak
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-surface/70 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-5 text-sm text-muted">
          <Link href="/gallery" className="hover:text-foreground">
            Causes
          </Link>
          <Link href="/create" className="hover:text-foreground">
            Create a page
          </Link>
          <Link
            href="/gallery"
            className="rounded-full bg-accent px-4 py-2 font-medium text-surface hover:opacity-90"
          >
            Give privately
          </Link>
        </nav>
      </Container>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <Container className="flex flex-col gap-2 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>Cloak - private, accountable giving. Testnet demo, no real funds move.</p>
        <p>
          Built on{" "}
          <a
            className="underline hover:text-foreground"
            href="https://docs.privacypools.com"
            target="_blank"
            rel="noreferrer"
          >
            Privacy Pools v2
          </a>{" "}
          · monitored by Sentry
        </p>
      </Container>
    </footer>
  );
}
