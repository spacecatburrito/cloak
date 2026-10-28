# Cloak

**Give to what you believe in, without becoming a target.**

Cloak is private, accountable giving to causes that are dangerous to support in public.
In many countries, a public on-chain donation to independent media or
a human-rights group is permanent evidence that can be used against the donor. Cloak
breaks the public link between donor and cause, built as a UI on top of
[0xbow Privacy Pools v2](https://docs.privacypools.com).

> Built solo at the ctrl/shift 2026 hackathon (NapulETH, Naples, June 2026); 1st prize from sponsor 0xbow / Privacy Pools. Testnet demo - no real funds move.

## Live demo

**https://tss.wtf/lena/demo-cloak** - the real app on Sepolia testnet, with fictional causes.

Real Privacy Pools v2 deposit on Sepolia. Example on-chain proof:
[deposit tx](https://sepolia.etherscan.io/tx/0x3e664e527d119a073464c668e42f78edf5708a59a160dfb3609dbac30d067ea7)
into the V2 entrypoint `0xEB3e3961008952348445513e418ad6F43C23ca9a`.

> **Demo data.** Everything about the causes is made up: the country "Norvelia" and the three
> organisations (Lantern Post, Open Docket, Harbor Relief Fund) do not exist, and the Impact Wall
> totals are seeded demo numbers, not real donations. The statistics in the "scale of the
> problem" sections are real and link to their public sources.

> Note for cloning: the `@0xbow-io/privacy-pools-v2-sdk` is a private hackathon-beta
> package on GitHub Packages and needs a (maintainer-issued) token in `.npmrc` to
> install. The live link above is the easiest way to see it working.

## The problem

"I am Norvelian and I live abroad. I still will not donate to Lantern Post, because one day I
might need to go back. And my friends who visit family in Norvelia give nothing at all.
We are not afraid of the cause. We are afraid of being seen supporting it."

(Norvelia is a fictional country used in this demo.) Millions of quiet supporters give nothing
because supporting a cause publicly is the risk.

## What it does

- **Give privately** to a cause: your wallet deposits into a Privacy Pool, then the gift
  reaches the cause with no on-chain trail back to you.
- **Accountable, not anonymous**: Privacy Pools' Association Set lets a cause prove the
  funds are not from illicit sources, so it can accept them openly.
- **Self-serve pages**: anyone can create a donation page (no backend, no gatekeeping)
  and get a shareable link plus an **embeddable widget** for their own site.
- **AI risk-explainer**: describe your situation and get an honest, personalized read on
  what Cloak does and does not change for you.
- **Impact Wall**: aggregate verified-clean giving per cause, with no donor identities.
- **Honest threat model**: a visible panel stating exactly what Cloak does NOT protect.

## Seeded causes (all fictional)

- **Lantern Post** - independent media in the made-up country of Norvelia.
- **Open Docket** - tracks political arrests and gives legal aid to detainees.
- **Harbor Relief Fund** - humanitarian relief for civilians (non-military).

The recipient for all three is a burn address on Sepolia; no real money moves.

## Run locally

```bash
cp .env.example .env.local   # fill in optional keys
npm install
npm run dev                  # http://localhost:3000
npm test                     # unit tests for the pure modules
```

### Environment

| Var | Purpose | Without it |
|---|---|---|
| `NEXT_PUBLIC_RPC_URL` | Sepolia RPC | falls back to a public RPC |
| `NEXT_PUBLIC_SIMULATE_PROOFS` | `true` simulates the private withdrawal | defaults to `true` |
| `ANTHROPIC_API_KEY` | live AI risk-explainer | falls back to pre-written copy |
| `NEXT_PUBLIC_SENTRY_DSN` | error monitoring (Sentry bounty) | Sentry no-ops |
| `NEXT_PUBLIC_ASP_ENDPOINT`, `NEXT_PUBLIC_RELAYER_URL` | real private withdrawal | simulated path used |

## What is real vs simulated (honest)

- **Real**: wallet connect and the **deposit into the Sepolia Privacy Pool** (verifiable on Etherscan).
- **Simulated by default**: the private **withdrawal** to the cause. In-browser ZK proof
  generation plus a relayer is the real path (`NEXT_PUBLIC_SIMULATE_PROOFS=false`), but it
  is gated by 0xbow testnet ASP/relayer endpoints that are not publicly documented, so the
  demo defaults to a clearly-labeled simulation that cannot break live.

## Threat model

Cloak breaks the public on-chain link between donor and cause, and lets the cause prove
the funds are clean. It does **not** hide how the crypto was acquired, network metadata,
or timing correlation. It is one layer that reduces a specific real risk - not anonymity.

## Architecture

Next.js (App Router) + TypeScript + Tailwind. Wallet via wagmi/viem (injected connector).
Privacy via `@0xbow/privacy-pools-core-sdk`. AI explainer via a server route calling Claude.
Causes are static JSON; user-created pages are URL-encoded (no database). Sentry for monitoring.

The public **marketing site** is built separately with [sitelab.build](https://www.sitelab.build/)
(see `docs/cloak-sitelab-brief.md`) and links into this app.

## Bounties

0xbow (Privacy Pools UI) · Blockchain for Good · SiteLab (marketing site) · Sentry · Main Track (AI x Web3) · Mood (innovative AI).

## License

MIT - see [LICENSE](./LICENSE).
