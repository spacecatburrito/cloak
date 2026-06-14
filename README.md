# Cloak

**Give to what you believe in, without becoming a target.**

Cloak is private, accountable giving to causes that are dangerous to support in public.
In Norvelia, Ardenia, Velmora and beyond, a public on-chain donation to independent media or
a human-rights group is permanent evidence that can be used against the donor. Cloak
breaks the public link between donor and cause, built as a UI on top of
[0xbow Privacy Pools v2](https://docs.privacypools.com).

> Built at the ctrl/shift 2026 Hackathon (Naples). Testnet demo - no real funds move.

## The problem

"I am Norvelian and I live abroad. I still will not donate to Lantern Post, because one day I
might need to go back. And my friends who visit family in Norvelia give nothing at all.
We are not afraid of the cause. We are afraid of being seen supporting it."

Millions of quiet supporters give nothing because supporting a cause publicly is the risk.

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

## Seeded causes

- **Lantern Post** - independent Norvelian anti-war media.
- **Open Docket** - supports political prisoners; added to Norvelia's "extremist" registry on 4 June 2026.
- **Harbor Relief Fund** - humanitarian/medical relief (non-military).

Donation pages link to each organization's official donation page. The live demo sends
testnet ETH to a demo recipient; no real money moves.

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
