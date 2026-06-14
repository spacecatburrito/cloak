import { generateMasterKeys, hashPrecommitment } from "@0xbow/privacy-pools-core-sdk";
import { generateMnemonic, english } from "viem/accounts";

/** Minimal ABI for the Entrypoint native-ETH deposit (payable). */
export const ENTRYPOINT_DEPOSIT_ABI = [
  {
    type: "function",
    name: "deposit",
    stateMutability: "payable",
    inputs: [{ name: "_precommitment", type: "uint256" }],
    outputs: [{ name: "_commitment", type: "uint256" }],
  },
] as const;

export type DepositNote = {
  /** BIP-39 mnemonic that "owns" this private deposit. Keep it secret. */
  mnemonic: string;
  /** Precommitment hash passed to the Entrypoint deposit(). */
  precommitment: bigint;
};

/**
 * Build a fresh deposit note. The mnemonic is the user's recovery secret for the
 * shielded balance; we persist it client-side so they retain control.
 */
export function buildDepositNote(): DepositNote {
  const mnemonic = generateMnemonic(english);
  const keys = generateMasterKeys(mnemonic);
  const precommitment = hashPrecommitment(
    keys.masterNullifier,
    keys.masterSecret,
  ) as unknown as bigint;
  return { mnemonic, precommitment };
}

const STORAGE_KEY = "cloak.deposit.notes";

/** Persist the mnemonic locally so the depositor keeps control of the note. */
export function saveDepositNote(mnemonic: string, depositTx: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const notes = raw ? JSON.parse(raw) : [];
    notes.push({ mnemonic, depositTx, at: Date.now() });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    /* non-fatal */
  }
}
