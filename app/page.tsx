import Link from "next/link";
import { Container, SiteHeader, SiteFooter } from "@/components/site";
import { ThreatModelPanel } from "@/components/ThreatModelPanel";
import { DonateWidget } from "@/components/DonateWidget";
import { GlobalRepression } from "@/components/GlobalRepression";
import { ImpactStats } from "@/components/ImpactStats";
import { WhoFor } from "@/components/WhoFor";
import { getCauses } from "@/lib/causes";
import { BASE_PATH } from "@/lib/basePath";

const STEPS = [
  {
    n: "01",
    t: "Deposit into the pool",
    d: "You deposit ETH into a shared Privacy Pool. This step is public, like any transaction.",
  },
  {
    n: "02",
    t: "The link is broken",
    d: "The donation moves from the pool to the cause, with no on-chain trail back to you.",
  },
  {
    n: "03",
    t: "Clean and accountable",
    d: "The cause can prove the funds are not from illicit sources, so it can accept them openly.",
  },
];

export default function Home() {
  const causes = getCauses();

  return (
    <>
      <SiteHeader />

      {/* Hero with the donate widget instantly visible */}
      <section className="relative overflow-hidden">
        <div className="veil pointer-events-none absolute inset-0 -z-10" />
        <Container className="grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <p className="reveal text-sm font-medium tracking-wide text-accent" style={{ animationDelay: "0ms" }}>
              Private, accountable giving · built on Privacy Pools v2
            </p>
            <h1
              className="reveal font-display mt-5 max-w-2xl text-5xl font-light leading-[1.05] tracking-tight sm:text-6xl"
              style={{ animationDelay: "80ms" }}
            >
              Give to what you believe in, without{" "}
              <em className="italic text-accent">becoming a target.</em>
            </h1>
            <p
              className="reveal mt-6 max-w-xl text-lg leading-8 text-muted"
              style={{ animationDelay: "180ms" }}
            >
              Around the world, supporting democracy, a free press, and human rights can
              make you a target - and every traceable donation, by card, bank, or public
              blockchain, is permanent proof of who you backed. Cloak breaks the link
              between you and the cause, so standing up for what you believe in no longer
              puts you at risk.
            </p>
            <div className="reveal mt-7 flex flex-wrap gap-3" style={{ animationDelay: "280ms" }}>
              <Link href="/create" className="rounded-full border border-border bg-surface/70 px-5 py-2.5 text-sm font-medium backdrop-blur transition hover:bg-accent-soft">
                Create a donation page
              </Link>
              <Link href="#how" className="rounded-full px-5 py-2.5 text-sm font-medium text-accent hover:underline">
                How it works
              </Link>
            </div>
          </div>

          <div className="reveal lg:pt-6" style={{ animationDelay: "360ms" }}>
            <DonateWidget causes={causes} />
          </div>
        </Container>
      </section>

      {/* Anchor story */}
      <Container className="py-8">
        <figure className="relative rounded-3xl border border-border bg-surface px-7 py-10 sm:px-12 sm:py-14">
          <span aria-hidden className="font-display absolute left-6 top-3 select-none text-7xl italic leading-none text-accent/20">
            &ldquo;
          </span>
          <blockquote className="font-display relative text-2xl font-light italic leading-relaxed sm:text-[28px]">
            I am Norvelian and I live abroad. I still will not donate to Lantern Post, because one
            day I might need to go back. And my friends who visit family in Norvelia? They
            give nothing at all. We are not afraid of the cause. We are afraid of being
            seen supporting it.
          </blockquote>
          <figcaption className="mt-6 text-sm text-muted">
            The reason millions of quiet supporters give nothing.
          </figcaption>
        </figure>
      </Container>

      {/* Scale of the problem */}
      <ImpactStats />

      {/* It happens everywhere */}
      <GlobalRepression />

      {/* How it works */}
      <Container id="how" className="scroll-mt-20 py-16">
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

      {/* Who Cloak is for */}
      <WhoFor />

      {/* Cases - expandable */}
      <Container className="py-8">
        <h2 className="font-display max-w-md text-3xl font-light leading-snug tracking-tight">
          The causes, and why they matter
        </h2>
        <div className="mt-8 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {causes.map((c) => (
            <details key={c.slug} className="group px-6 py-5">
              <summary className="flex cursor-pointer items-start justify-between gap-4 list-none transition hover:opacity-80">
                <span className="flex flex-col">
                  <span className="font-display text-xl font-light">{c.name}</span>
                  <span className="text-sm text-muted">{c.blurb}</span>
                  <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent">
                    <span className="group-open:hidden">Why it matters</span>
                    <span className="hidden group-open:inline">Show less</span>
                    <svg
                      viewBox="0 0 12 12"
                      aria-hidden
                      className="h-3 w-3 transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 4.5 L6 7.5 L9 4.5" />
                    </svg>
                  </span>
                </span>
                <span
                  className="shrink-0 rounded-full px-3 py-1 text-xs font-medium"
                  style={{ backgroundColor: `${c.accent}1a`, color: c.accent }}
                >
                  {c.category}
                </span>
              </summary>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-foreground/85">{c.story}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <Link href={`/give/${c.slug}`} className="font-medium text-accent hover:underline">
                  Give to {c.name} →
                </Link>
                {c.officialDonationUrl && (
                  <a href={c.officialDonationUrl} target="_blank" rel="noreferrer" className="text-muted hover:text-foreground">
                    Official page ↗
                  </a>
                )}
              </div>
            </details>
          ))}
        </div>
      </Container>

      {/* Threat model */}
      <Container className="py-12">
        <ThreatModelPanel />
      </Container>

      {/* About */}
      <Container id="about" className="scroll-mt-20 py-12">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <h2 className="font-display text-3xl font-light tracking-tight">About Cloak</h2>
          <div className="space-y-4 text-base leading-7 text-foreground/85">
            <p>
              Cloak was built at the ctrl/shift 2026 hackathon around one idea: defending
              democracy, free expression, and human rights should not require courage you
              can be punished for. In dozens of countries, supporting independent media, an
              LGBTQ+ group, a reproductive-health fund, a banned faith, or humanitarian aid
              in a sanctioned region is treated as a crime - and the money trail, by card,
              bank, or public blockchain, is permanent proof of who you backed.
            </p>
            <p>
              The problem is not that people stopped caring - giving simply became a legal
              risk. In some countries, even a small transfer to the wrong cause can trigger a
              criminal case, so supporters were pushed toward cash, the diaspora, and
              crypto. Cloak makes that channel safe and accountable: people keep giving, the
              cause can still prove the funds are clean, and no public trail ties the two
              together. It is one honest layer of protection - not a promise of anonymity.
            </p>
          </div>
        </div>
      </Container>

      {/* FAQ */}
      <Container id="faq" className="scroll-mt-20 py-12">
        <h2 className="font-display text-3xl font-light tracking-tight">FAQ</h2>
        <div className="mt-8 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {FAQ.map((item) => (
            <details key={item.q} className="px-6 py-5">
              <summary className="cursor-pointer list-none text-base font-medium">
                {item.q}
              </summary>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-foreground/85">{item.a}</p>
            </details>
          ))}
        </div>
      </Container>

      {/* Powered by */}
      <Container className="py-12">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface px-6 py-10 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Powered by</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${BASE_PATH}/vendor/0xbow.svg`} alt="0xbow Privacy Pools" className="h-8 w-auto" />
          <div className="flex items-center gap-2 rounded-full border border-border px-4 py-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${BASE_PATH}/vendor/dedaub.svg`} alt="Dedaub" className="h-5 w-5" />
            <span className="text-sm font-semibold tracking-tight">Audited by Dedaub</span>
            <span className="rounded-full bg-warm-soft px-2 py-0.5 text-xs font-medium text-warm">
              Coming soon
            </span>
          </div>
          <p className="max-w-md text-sm text-muted">
            Cloak deploys no new smart contracts. It calls 0xbow&rsquo;s deployed,
            open-source Privacy Pools v2 contracts directly, so it adds no new on-chain
            attack surface. Errors are monitored with Sentry.
          </p>
        </div>
      </Container>

      <SiteFooter />
    </>
  );
}

const FAQ = [
  {
    q: "Is this anonymous?",
    a: "No. Cloak breaks the public on-chain link between your wallet and the cause, but it is not anonymity. It does not hide how you originally bought the crypto, your network metadata, or unusual timing patterns. Treat it as one layer of protection.",
  },
  {
    q: "Do I have to trust Cloak with my money?",
    a: "No custody. You sign every transaction from your own wallet. Cloak deploys no new smart contracts - it only calls 0xbow's deployed, open-source Privacy Pools v2 contracts.",
  },
  {
    q: "Where does my money actually go?",
    a: "This is a Sepolia testnet demo, so no real funds move. Each cause links to its real official donation page. The deposit is a genuine on-chain transaction; the private disbursement is simulated in this demo and labelled as such.",
  },
  {
    q: "What chain and token does it use?",
    a: "Ethereum Sepolia testnet, in ETH. On mainnet it would use the same Privacy Pools v2 contracts.",
  },
  {
    q: "Can I raise funds for my own cause?",
    a: "Yes. Create a donation page in seconds, then share the link or embed the widget on your own site - no account needed.",
  },
  {
    q: "How do I use the 2-step method?",
    a: "Set the toggle at the top of the page to \"2 steps\". Step 1: connect your wallet and deposit ETH into your own balance inside the Privacy Pool - a single on-chain transaction. Step 2: wait about 10-15 minutes for the deposit to be approved by the Association Set, then open the Privacy Pools app, connect the same wallet, and withdraw privately to the cause's address (Cloak shows it for you to copy). Because the deposit and the withdrawal are unlinked, there is no public trail from you to the cause. The 1-step method does both at once; the 2-step method gives you more control and completes the withdrawal in the official Privacy Pools app.",
  },
];
