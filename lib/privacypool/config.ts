import { sepolia } from "viem/chains";
import type { Address } from "viem";

/**
 * Privacy Pools v2 testnet configuration (verified from 0xbow-io repos).
 * Chain: Ethereum Sepolia (11155111). Native-ETH pool.
 */
export const CHAIN = sepolia;

// Public default; for reliability (the SDK does heavy log reads) set
// NEXT_PUBLIC_RPC_URL to an Alchemy/Infura Sepolia endpoint in .env.local.
export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.drpc.org";

/** Current Privacy Pools v2 Sepolia deployment (matches the SDK DEPLOYMENTS table). */
export const POOL_ADDRESS: Address =
  "0x09b94d3127019298757A6ceeB7911922085f7C01";
export const ENTRYPOINT_ADDRESS: Address =
  "0xEB3e3961008952348445513e418ad6F43C23ca9a";

/** Pool max deposit is 1 ETH on testnet; we use small demo amounts. */
export const MAX_DEPOSIT_ETH = 1;

/**
 * When true, the private *withdrawal* step is simulated (the real deposit still
 * happens on-chain). Defaults to true until the real ASP+relayer path is proven,
 * so a live demo never breaks. Set NEXT_PUBLIC_SIMULATE_PROOFS=false to attempt
 * the real private withdrawal.
 */
export const SIMULATE =
  (process.env.NEXT_PUBLIC_SIMULATE_PROOFS ?? "true") !== "false";

/**
 * When true, the donate flow attempts the real Privacy Pools V2 "depositFor":
 * one on-chain transaction that deposits straight to the cause (no simulated
 * step). Falls back to the deposit + simulated-disbursement path on any error.
 */
export const USE_V2 = process.env.NEXT_PUBLIC_USE_V2 === "true";

// ASP (Association Set Provider) HTTP endpoint. Deposits need its public key,
// which the IPFS data source cannot serve, so an HTTP aspUrl is required.
export const ASP_ENDPOINT =
  process.env.NEXT_PUBLIC_ASP_ENDPOINT || "https://api-dev.0xbow.io";

/**
 * Privacy Pools v2 staging relayer (Sepolia). Withdrawals must be relayed - the
 * protocol rejects self-submitted withdrawals, which is what enforces privacy.
 * Signer EOA + PrivacyPoolRelay processor are from the official deployment docs.
 */
export const RELAYER_URL =
  process.env.NEXT_PUBLIC_RELAYER_URL ||
  "https://relayer-v2-staging-149184580131.us-east1.run.app";
export const RELAYER_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_RELAYER_ADDRESS as Address) ||
  "0x4Ba5fF376865b370790A56276C63e7984DCFf1f7";
export const RELAYER_PROCESSOR: Address =
  (process.env.NEXT_PUBLIC_RELAYER_PROCESSOR as Address) ||
  "0x87a5BFbAd7cA6B1FF3d9E631877B5930f17C24B0";

export function explorerTx(hash: string): string {
  return `https://sepolia.etherscan.io/tx/${hash}`;
}

export function explorerAddress(addr: string): string {
  return `https://sepolia.etherscan.io/address/${addr}`;
}
