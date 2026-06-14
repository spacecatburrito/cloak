const PROTECTS = [
  "Breaks the public on-chain link between your wallet and the cause you support.",
  "Lets a cause prove the funds it received are not from sanctioned or illicit sources (the Association Set), so it can accept them accountably.",
  "Removes the permanent, searchable record that says \"this address funded this organisation\".",
];

const DOES_NOT = [
  "Does not hide how you originally obtained the crypto (a KYC exchange still knows you bought it).",
  "Does not protect your network metadata - use Tor / a trusted VPN if that matters for you.",
  "Does not defend against timing correlation if you deposit and withdraw the exact same unusual amount seconds apart.",
  "Is not anonymity. It is one layer that reduces a specific, real risk.",
];

export function ThreatModelPanel() {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <h3 className="font-display text-2xl font-light tracking-tight">
        What Cloak does, and does not, protect
      </h3>
      <p className="mt-2 text-sm text-muted">
        Honesty matters most when people could get hurt relying on a tool. Read this
        before you trust it with anything that matters.
      </p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-accent">It protects</p>
          <ul className="mt-3 space-y-2">
            {PROTECTS.map((t) => (
              <li key={t} className="flex gap-2 text-sm text-foreground/90">
                <span aria-hidden className="mt-0.5 text-accent">+</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-danger">It does not</p>
          <ul className="mt-3 space-y-2">
            {DOES_NOT.map((t) => (
              <li key={t} className="flex gap-2 text-sm text-foreground/90">
                <span aria-hidden className="mt-0.5 text-danger">×</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
