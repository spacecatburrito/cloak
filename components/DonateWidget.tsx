"use client";

import { useState } from "react";
import { createPublicClient, http, parseEther, isAddress, toHex } from "viem";
import { sepolia } from "viem/chains";
import {
  useAccount,
  useConnect,
  useChainId,
  useSwitchChain,
  useWriteContract,
  useSignMessage,
  useSendTransaction,
} from "wagmi";
import * as Sentry from "@sentry/nextjs";
import type { Cause } from "@/lib/causes";
import {
  ENTRYPOINT_DEPOSIT_ABI,
  buildDepositNote,
  saveDepositNote,
} from "@/lib/privacypool/deposit";
import { simulateWithdrawal, type Disbursement } from "@/lib/privacypool/simulate";
import { depositForViaV2 } from "@/lib/privacypool/v2";
import { ENTRYPOINT_ADDRESS, RPC_URL, USE_V2 } from "@/lib/privacypool/config";
import { recordGift } from "@/lib/impact";
import { Receipt } from "@/components/Receipt";

const PRESETS = ["0.005", "0.01", "0.05"];
type Step = "form" | "depositing" | "disbursing" | "done";
const CUSTOM = "__custom__";

const publicClient = createPublicClient({ chain: sepolia, transport: http(RPC_URL) });

export function DonateWidget({
  causes,
  lockedSlug,
  compact = false,
}: {
  causes: Cause[];
  lockedSlug?: string;
  compact?: boolean;
}) {
  const [selected, setSelected] = useState(lockedSlug ?? causes[0]?.slug ?? CUSTOM);
  const [customAddr, setCustomAddr] = useState("");
  const [amount, setAmount] = useState("0.005");
  const [step, setStep] = useState<Step>("form");
  const [error, setError] = useState<string | null>(null);
  const [depositTx, setDepositTx] = useState("");
  const [disbursement, setDisbursement] = useState<Disbursement | null>(null);
  const [stepNote, setStepNote] = useState("");

  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { connectAsync, connectors } = useConnect();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const { signMessageAsync } = useSignMessage();
  const { sendTransactionAsync } = useSendTransaction();

  const isCustom = selected === CUSTOM;
  const selectedCause = causes.find((c) => c.slug === selected);
  const recipient = isCustom ? customAddr : selectedCause?.testnetRecipient ?? "";
  const recipientName = isCustom ? "this address" : selectedCause?.name ?? "the cause";
  const recipientValid = isAddress(recipient);
  const busy = step === "depositing" || step === "disbursing";

  // The cause object the Receipt needs (works for custom too).
  const receiptCause: Cause = selectedCause ?? {
    slug: "custom",
    name: "Custom address",
    category: "Custom",
    blurb: "",
    story: "",
    officialDonationUrl: "",
    testnetRecipient: recipient || "0x0000000000000000000000000000000000000000",
    accent: "#2e6657",
  };

  async function handleGive() {
    setError(null);
    if (!recipientValid) {
      setError("Enter a valid recipient address.");
      return;
    }
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

      // Preferred path: real V2 depositFor - one transaction straight to the
      // cause, no simulated step. Falls back to the path below on any error.
      if (USE_V2 && address) {
        try {
          setStep("depositing");
          const hash = await depositForViaV2({
            ownerAddress: address,
            recipient: recipient as `0x${string}`,
            amountWeiHex: toHex(parseEther(amount)),
            signMessage: (message) => signMessageAsync({ message }),
            sendTransaction: ({ to, data, value }) =>
              sendTransactionAsync({ to, data, value }),
            onStep: setStepNote,
          });
          setDepositTx(hash);
          setDisbursement({ txHash: hash, simulated: false });
          recordGift(isCustom ? "custom" : selected, parseFloat(amount) || 0);
          setStep("done");
          return;
        } catch (e) {
          Sentry.captureException(e);
          setStepNote("Real path unavailable, using the safe demo path…");
          // fall through to the deposit + simulated-disbursement path below
        }
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

      // 2. Private disbursement to the recipient (simulated by default).
      setStep("disbursing");
      const disb = await simulateWithdrawal(recipient, amount);
      setDisbursement(disb);
      recordGift(isCustom ? "custom" : selected, parseFloat(amount) || 0);
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

  function reset() {
    setStep("form");
    setDisbursement(null);
    setDepositTx("");
    setError(null);
  }

  return (
    <div className={`rounded-2xl border border-border bg-surface ${compact ? "p-5" : "p-6 sm:p-7"}`}>
      {step === "done" && disbursement ? (
        <>
          <Receipt
            cause={receiptCause}
            amount={amount}
            depositTx={depositTx}
            disbursement={disbursement}
          />
          <button
            onClick={reset}
            className="mt-6 w-full rounded-full bg-accent px-5 py-3 font-medium text-white hover:opacity-90"
          >
            Give again
          </button>
        </>
      ) : (
        <>
          <h3 className="font-display text-2xl font-light tracking-tight">Give privately</h3>
          <p className="mt-1 text-sm text-muted">
            Send from your wallet. No public link back to you.
          </p>

          {/* Network badge - always explicit about which chain this runs on */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent-soft px-3 py-1 font-medium text-accent">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
              Network: Ethereum Sepolia (testnet)
            </span>
            {isConnected && chainId !== sepolia.id && (
              <span className="font-medium text-danger">
                Wrong network - switch to Sepolia
              </span>
            )}
          </div>

          {/* Recipient selector */}
          {!lockedSlug && (
            <div className="mt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Who to support
              </p>
              <div className="mt-2 grid gap-2">
                {causes.map((c) => (
                  <button
                    key={c.slug}
                    disabled={busy}
                    onClick={() => setSelected(c.slug)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-left text-sm transition ${
                      selected === c.slug
                        ? "border-accent bg-accent-soft"
                        : "border-border hover:bg-accent-soft/50"
                    }`}
                  >
                    <span className="font-medium">{c.name}</span>
                    <span className="text-xs text-muted">{c.category}</span>
                  </button>
                ))}
                <button
                  disabled={busy}
                  onClick={() => setSelected(CUSTOM)}
                  className={`rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition ${
                    isCustom ? "border-accent bg-accent-soft" : "border-border hover:bg-accent-soft/50"
                  }`}
                >
                  Custom address
                </button>
              </div>
            </div>
          )}

          {isCustom && (
            <input
              value={customAddr}
              disabled={busy}
              onChange={(e) => setCustomAddr(e.target.value)}
              placeholder="0x… recipient address"
              className={`mt-3 w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:border-accent ${
                customAddr && !recipientValid ? "border-danger" : "border-border"
              }`}
            />
          )}

          {/* Why this matters (expandable) */}
          {!isCustom && selectedCause && (
            <details className="mt-3 rounded-xl bg-accent-soft/40 px-4 py-3">
              <summary className="cursor-pointer text-sm font-medium text-accent">
                Why {selectedCause.name} matters
              </summary>
              <p className="mt-2 text-sm leading-6 text-foreground/80">{selectedCause.story}</p>
              {selectedCause.officialDonationUrl && (
                <a
                  href={selectedCause.officialDonationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs font-medium text-accent hover:underline"
                >
                  Official donation page ↗
                </a>
              )}
            </details>
          )}

          {/* Amount */}
          <p className="mt-5 text-xs font-medium uppercase tracking-wide text-muted">Amount (ETH)</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                disabled={busy}
                onClick={() => setAmount(p)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  amount === p ? "border-accent bg-accent-soft text-accent" : "border-border hover:bg-accent-soft/50"
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

          {/* Steps */}
          {busy && (
            <ol className="mt-5 space-y-1.5 text-sm">
              <li className={step === "depositing" ? "font-medium text-accent" : "text-muted"}>
                1. Depositing into the Privacy Pool…
              </li>
              <li className={step === "disbursing" ? "font-medium text-accent" : "text-muted"}>
                2. Sending privately to {recipientName}…
              </li>
            </ol>
          )}

          {busy && stepNote && (
            <p className="mt-2 text-xs text-muted">{stepNote}</p>
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-danger/10 p-3 text-sm text-danger">{error}</p>
          )}

          <button
            onClick={handleGive}
            disabled={busy || (isCustom && !recipientValid)}
            className="mt-5 w-full rounded-full bg-accent px-5 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {busy
              ? step === "depositing"
                ? "Confirm in your wallet…"
                : "Sending privately…"
              : isConnected
                ? `Give ${amount} ETH to ${recipientName}`
                : "Connect wallet & give"}
          </button>
        </>
      )}
    </div>
  );
}
