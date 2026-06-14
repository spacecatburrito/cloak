/**
 * Simulated private withdrawal. Used when NEXT_PUBLIC_SIMULATE_PROOFS is on (the
 * default) so the live demo never breaks on in-browser ZK proof generation.
 * The real deposit still happens on-chain; only this disbursement is simulated.
 * The UI labels it honestly as simulated.
 */
export type Disbursement = {
  txHash: string;
  simulated: boolean;
};

function pseudoHash(seed: string): string {
  let h = 0n;
  for (const ch of seed) h = (h * 131n + BigInt(ch.charCodeAt(0))) % (1n << 256n);
  return "0x" + h.toString(16).padStart(64, "0").slice(0, 64);
}

export async function simulateWithdrawal(
  recipient: string,
  amountEth: string,
): Promise<Disbursement> {
  // mimic proof-gen + relay latency
  await new Promise((r) => setTimeout(r, 1400));
  return {
    txHash: pseudoHash(`${recipient}:${amountEth}:${Date.now()}`),
    simulated: true,
  };
}
