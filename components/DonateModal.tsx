"use client";

import { useState } from "react";
import { createPublicClient, http, parseEther } from "viem";
import { sepolia } from "viem/chains";
import { useAccount, useConnect, useChainId, useSwitchChain, useWriteContract } from "wagmi";
import * as Sentry from "@sentry/nextjs";
import type { Cause } from "@/lib/causes";
import {
  ENTRYPOINT_DEPOSIT_ABI,
  buildDepositNote,
  saveDepositNote,
} from "@/lib/privacypool/deposit";
import { simulateWithdrawal, type Disbursement } from "@/lib/privacypool/simulate";
import { ENTRYPOINT_ADDRESS, RPC_URL, SIMULATE } from "@/lib/privacypool/config";
import { recordGift } from "@/lib/impact";
import { Receipt } from "@/components/Receipt";

const PRESETS = ["0.005", "0.01", "0.05"];
type Step = "form" | "depositing" | "disbursing" | "done";

const publicClient = createPublicClient({ chain: sepolia, transport: http(RPC_URL) });

export function DonateModal({ cause, onClose }: { cause: Cause; onClose: () => void }) {
  const [amount, setAmount] = useState("0.005");
  const [step, setStep] = useState<Step>("form");
  const [error, setError] = useState<string | null>(null);
  const [depositTx, setDepositTx] = useState<string>("");
  const [disbursement, setDisbursement] = useState<Disbursement | null>(null);

  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { connectAsync, connectors } = useConnect();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  async function handleGive() {
    setError(null);
    try {
      if (!isConnected) {
        const connector = connectors.find((c) => c.id === "injected") ?? connectors[0];
        if (!connector) throw new Error("No wallet found. Install MetaMask or Rabby.");
        await connectAsync({ connector });
      }
      if (chainId !== sepolia.id) {
        await switchChainAsync({ chainId: sepolia.id }).catch(() => {
          throw new Error("Please switch your wallet to the Sepolia testnet.");
        });
      }

      // 1. Real on-chain deposit into the Privacy Pool.
      setStep("depositing");
      const note = buildDepositNote();
      const hash = await writeContractAsync({
        address: ENTRYPOINT_ADDRESS,
        abi: ENTRYPOINT_DEPOSIT_ABI,
        functionName: "deposit",
        args: [note.precommitment],
        value: parseEther(amount),
        chainId: sepolia.id,
      });
      setDepositTx(hash);
      saveDepositNote(note.mnemonic, hash);
      await publicClient.waitForTransactionReceipt({ hash });

      // 2. Private disbursement to the cause (simulated by default, real in M5).
      setStep("disbursing");
      const disb = SIMULATE
        ? await simulateWithdrawal(cause.testnetRecipient, amount)
        : await simulateWithdrawal(cause.testnetRecipient, amount); // real path wired in M5
      setDisbursement(disb);
      recordGift(cause.slug, parseFloat(amount));
      setStep("done");
    } catch (e: unknown) {
      Sentry.captureException(e);
      const msg =
        (e as { shortMessage?: string; message?: string })?.shortMessage ||
        (e as { message?: string })?.message ||
        "Something went wrong.";
      setError(msg);
      setStep("form");
    }
  }

  const busy = step === "depositing" || step === "disbursing";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
      onClick={busy ? undefined : onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {step === "done" && disbursement ? (
          <>
            <Receipt
              cause={cause}
              amount={amount}
              depositTx={depositTx}
              disbursement={disbursement}
            />
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-full bg-accent px-5 py-3 font-medium text-surface hover:opacity-90"
            >
              Done
            </button>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold tracking-tight">
                Give privately to {cause.name}
              </h3>
              {!busy && (
                <button onClick={onClose} className="text-muted hover:text-foreground">
                  ✕
                </button>
              )}
            </div>

            <p className="mt-2 text-sm text-muted">
              Testnet demo on Sepolia. No real funds move.
            </p>

            <label className="mt-5 block text-sm font-medium">Amount (ETH)</label>
            <div className="mt-2 flex gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  disabled={busy}
                  onClick={() => setAmount(p)}
                  className={`rounded-full border px-4 py-1.5 text-sm ${
                    amount === p
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-border hover:bg-accent-soft"
                  }`}
                >
                  {p}
                </button>
              ))}
              <input
                value={amount}
                disabled={busy}
                onChange={(e) => setAmount(e.target.value)}
                className="w-24 rounded-full border border-border px-3 py-1.5 text-sm outline-none focus:border-accent"
              />
            </div>

            <ol className="mt-6 space-y-2 text-sm">
              <li className={step === "depositing" ? "font-medium text-accent" : "text-muted"}>
                1. Deposit into the Privacy Pool {step === "depositing" && "…"}
              </li>
              <li className={step === "disbursing" ? "font-medium text-accent" : "text-muted"}>
                2. Private disbursement to {cause.name} {step === "disbursing" && "…"}
              </li>
            </ol>

            {error && (
              <p className="mt-4 rounded-lg bg-danger/10 p-3 text-sm text-danger">{error}</p>
            )}

            <button
              onClick={handleGive}
              disabled={busy}
              className="mt-6 w-full rounded-full bg-accent px-5 py-3 font-medium text-surface hover:opacity-90 disabled:opacity-60"
            >
              {busy
                ? step === "depositing"
                  ? "Confirming deposit…"
                  : "Sending privately…"
                : isConnected
                  ? "Give privately"
                  : "Connect wallet & give"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
