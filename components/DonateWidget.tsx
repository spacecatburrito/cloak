"use client";

import { useState } from "react";
import { createPublicClient, http, parseEther, isAddress, toHex, formatEther } from "viem";
import { sepolia } from "viem/chains";
import {
  useAccount,
  useConnect,
  useSwitchChain,
  useWriteContract,
  useSignMessage,
  useSendTransaction,
  useBalance,
} from "wagmi";
import * as Sentry from "@sentry/nextjs";
import type { Cause } from "@/lib/causes";
import {
  ENTRYPOINT_DEPOSIT_ABI,
  buildDepositNote,
  saveDepositNote,
} from "@/lib/privacypool/deposit";
import { simulateWithdrawal, type Disbursement } from "@/lib/privacypool/simulate";
import { depositForViaV2, depositToSelfViaV2 } from "@/lib/privacypool/v2";
import { ENTRYPOINT_ADDRESS, RPC_URL, USE_V2, explorerTx } from "@/lib/privacypool/config";
import { recordGift } from "@/lib/impact";
import { Receipt } from "@/components/Receipt";
import { useMethod } from "@/components/MethodContext";

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
  const [preset, setPreset] = useState("0.005");
  const [customAmount, setCustomAmount] = useState("");
  const [switching, setSwitching] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [error, setError] = useState<string | null>(null);
  const [depositTx, setDepositTx] = useState("");
  const [disbursement, setDisbursement] = useState<Disbursement | null>(null);
  const [stepNote, setStepNote] = useState("");
  const [twoStepTx, setTwoStepTx] = useState("");
  const [twoStepDone, setTwoStepDone] = useState(false);
  const [copied, setCopied] = useState(false);

  const { method } = useMethod();

  // chainId here is the wallet's ACTUAL connected chain (not the config default).
  const { isConnected, address, chainId } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const { signMessageAsync } = useSignMessage();
  const { sendTransactionAsync } = useSendTransaction();
  const { data: balanceData } = useBalance({
    address,
    chainId: sepolia.id,
    query: { enabled: !!address },
  });

  const isCustom = selected === CUSTOM;
  const selectedCause = causes.find((c) => c.slug === selected);
  const recipient = isCustom ? customAddr : selectedCause?.testnetRecipient ?? "";
  const recipientName = isCustom ? "this address" : selectedCause?.name ?? "the cause";
  const recipientValid = isAddress(recipient);
  const busy = step === "depositing" || step === "disbursing";

  // Amount: a preset, unless the user typed a custom value.
  const amount = customAmount.trim() !== "" ? customAmount.trim() : preset;
  const balanceEth = balanceData ? Number(formatEther(balanceData.value)) : null;
  // Leave a little ETH for gas when offering "Max".
  const maxAmount = balanceEth != null ? Math.max(0, balanceEth - 0.002) : null;
  const wrongChain = isConnected && chainId != null && chainId !== sepolia.id;

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

  async function handleSwitch() {
    setError(null);
    setSwitching(true);
    try {
      await switchChainAsync({ chainId: sepolia.id });
    } catch {
      setError("Could not switch automatically. Open your wallet and switch to Sepolia.");
    } finally {
      setSwitching(false);
    }
  }

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

      // 2-STEP: deposit into your own pool balance now; withdraw to the cause
      // yourself later at the Privacy Pools app once the deposit settles.
      if (method === "2step") {
        setStep("depositing");
        let hash: `0x${string}` | undefined;
        if (USE_V2 && address) {
          try {
            hash = await depositToSelfViaV2({
              ownerAddress: address,
              amountWeiHex: toHex(parseEther(amount)),
              signMessage: (message) => signMessageAsync({ message }),
              sendTransaction: ({ to, data, value }) => sendTransactionAsync({ to, data, value }),
              onStep: setStepNote,
            });
          } catch (e) {
            Sentry.captureException(e);
            setStepNote("Using a direct deposit…");
          }
        }
        if (!hash) {
          const note = buildDepositNote();
          hash = await writeContractAsync({
            address: ENTRYPOINT_ADDRESS,
            abi: ENTRYPOINT_DEPOSIT_ABI,
            functionName: "deposit",
            args: [note.precommitment],
            value: parseEther(amount),
            chainId: sepolia.id,
          });
          saveDepositNote(note.mnemonic, hash);
          await publicClient.waitForTransactionReceipt({ hash });
        }
        setTwoStepTx(hash);
        setTwoStepDone(true);
        setStep("form");
        return;
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

  async function copyRecipient() {
    try {
      await navigator.clipboard.writeText(recipient);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  }

  function reset() {
    setStep("form");
    setDisbursement(null);
    setDepositTx("");
    setError(null);
    setTwoStepDone(false);
    setTwoStepTx("");
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
      ) : twoStepDone ? (
        <>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft font-medium text-accent">
              1
            </span>
            <h3 className="font-display text-2xl font-light tracking-tight">Deposit done</h3>
          </div>
          <p className="mt-2 text-sm text-muted">
            Your funds are in the Privacy Pool. In about 10-15 minutes the deposit is
            approved by the Association Set and becomes withdrawable.
          </p>
          <ol className="mt-4 space-y-2 text-sm text-foreground/90">
            <li>
              <span className="font-medium">Wait ~10-15 min</span> for the deposit to settle.
            </li>
            <li>
              Open the Privacy Pools app and connect{" "}
              <span className="font-medium">this same wallet</span>.
            </li>
            <li>Withdraw privately to {recipientName}, using this address:</li>
          </ol>
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-foreground/5 p-2">
            <code className="flex-1 break-all text-xs">{recipient}</code>
            <button
              onClick={copyRecipient}
              className="rounded-full border border-border px-3 py-1 text-xs font-medium hover:bg-accent-soft"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <a
              href="https://testnet.privacypools.com"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-accent px-5 py-3 font-medium text-white hover:opacity-90"
            >
              Open Privacy Pools ↗
            </a>
            <a
              href={explorerTx(twoStepTx)}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-accent hover:underline"
            >
              View your deposit ↗
            </a>
          </div>
          <p className="mt-5 rounded-lg bg-foreground/5 p-3 text-xs leading-5 text-muted">
            Honest note: the withdrawal is completed at the Privacy Pools app with the same
            wallet so it can see your deposit. This keeps your gift unlinked from the cause.
          </p>
          <button
            onClick={reset}
            className="mt-4 w-full rounded-full border border-border px-5 py-3 font-medium hover:bg-accent-soft"
          >
            Done
          </button>
        </>
      ) : (
        <>
          <h3 className="font-display text-2xl font-light tracking-tight">Give privately</h3>
          <p className="mt-1 text-sm text-muted">
            {method === "2step"
              ? "Step 1: deposit to your own pool balance. You finish the private withdrawal yourself."
              : "Send from your wallet. No public link back to you."}
          </p>

          {/* Network badge - always explicit about which chain this runs on */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent-soft px-3 py-1 font-medium text-accent">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
              Network: Ethereum Sepolia (testnet)
            </span>
            {wrongChain && (
              <span className="font-medium text-danger">Wrong network</span>
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
          <div className="mt-5 flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Amount (ETH)</p>
            {balanceEth != null && (
              <p className="text-xs text-muted">
                Balance:{" "}
                <span className="font-medium text-foreground">{balanceEth.toFixed(4)}</span> ETH
              </p>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESETS.map((p) => {
              const active = customAmount.trim() === "" && preset === p;
              return (
                <button
                  key={p}
                  disabled={busy}
                  onClick={() => {
                    setPreset(p);
                    setCustomAmount("");
                  }}
                  className={`rounded-full border px-4 py-1.5 text-sm transition ${
                    active
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-border hover:bg-accent-soft/50"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            {maxAmount != null && maxAmount > 0 && (
              <button
                disabled={busy}
                onClick={() => setCustomAmount(maxAmount.toFixed(6))}
                className="rounded-full border border-border px-4 py-1.5 text-sm font-medium transition hover:bg-accent-soft/50"
              >
                Max
              </button>
            )}
            <input
              value={customAmount}
              disabled={busy}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Custom"
              inputMode="decimal"
              className="w-24 rounded-full border border-border px-3 py-1.5 text-sm outline-none focus:border-accent"
            />
          </div>

          {/* Steps */}
          {busy && (
            <ol className="mt-5 space-y-1.5 text-sm">
              <li className={step === "depositing" ? "font-medium text-accent" : "text-muted"}>
                {method === "2step"
                  ? "Depositing to your private balance…"
                  : "1. Depositing into the Privacy Pool…"}
              </li>
              {method !== "2step" && (
                <li className={step === "disbursing" ? "font-medium text-accent" : "text-muted"}>
                  2. Sending privately to {recipientName}…
                </li>
              )}
            </ol>
          )}

          {busy && stepNote && (
            <p className="mt-2 text-xs text-muted">{stepNote}</p>
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-danger/10 p-3 text-sm text-danger">{error}</p>
          )}

          {wrongChain ? (
            <button
              onClick={handleSwitch}
              disabled={switching}
              className="mt-5 w-full rounded-full bg-accent px-5 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {switching ? "Switching…" : "Switch wallet to Sepolia"}
            </button>
          ) : (
            <button
              onClick={handleGive}
              disabled={busy || (isCustom && !recipientValid)}
              className="mt-5 w-full rounded-full bg-accent px-5 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {busy
                ? step === "depositing"
                  ? "Confirm in your wallet…"
                  : "Sending privately…"
                : !isConnected
                  ? "Connect wallet & give"
                  : method === "2step"
                    ? `Deposit ${amount} ETH to your balance`
                    : `Give ${amount} ETH to ${recipientName}`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
