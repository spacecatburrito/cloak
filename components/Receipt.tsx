import type { Cause } from "@/lib/causes";
import type { Disbursement } from "@/lib/privacypool/simulate";
import { explorerTx } from "@/lib/privacypool/config";

export function Receipt({
  cause,
  amount,
  depositTx,
  disbursement,
}: {
  cause: Cause;
  amount: string;
  depositTx: string;
  disbursement: Disbursement;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-accent">
          ✓
        </span>
        <h3 className="text-lg font-semibold tracking-tight">
          {disbursement.simulated ? "Deposited to the pool" : "Private gift sent"}
        </h3>
      </div>
      <p className="mt-2 text-sm text-muted">
        {disbursement.simulated
          ? `${amount} ETH is in the Privacy Pool under your control. Delivery to ${cause.name} is simulated in this demo - switch to 2-step to complete the real private withdrawal.`
          : `${amount} ETH reached ${cause.name} with no public link back to your wallet.`}
      </p>

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted">Funds check</dt>
          <dd className="font-medium text-accent">Verified clean (Association Set)</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted">Deposit (public, your wallet → pool)</dt>
          <dd>
            <a
              className="font-medium text-accent hover:underline"
              href={explorerTx(depositTx)}
              target="_blank"
              rel="noreferrer"
            >
              View on Etherscan ↗
            </a>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted">Disbursement (private, pool → cause)</dt>
          <dd>
            {disbursement.simulated ? (
              <span className="rounded-full bg-warm-soft px-2.5 py-1 text-xs font-medium text-warm">
                Simulated (demo)
              </span>
            ) : (
              <a
                className="font-medium text-accent hover:underline"
                href={explorerTx(disbursement.txHash)}
                target="_blank"
                rel="noreferrer"
              >
                View on Etherscan ↗
              </a>
            )}
          </dd>
        </div>
      </dl>

      <p className="mt-5 rounded-lg bg-foreground/5 p-3 text-xs leading-5 text-muted">
        Honest note: the deposit above is a real on-chain transaction.{" "}
        {disbursement.simulated
          ? "The private disbursement is simulated in this demo so it never fails live; the real path uses an in-browser ZK proof plus a relayer."
          : "The disbursement was relayed privately on-chain."}{" "}
        This breaks the public donor→cause link. It is not full anonymity - see the
        threat model.
      </p>
    </div>
  );
}
