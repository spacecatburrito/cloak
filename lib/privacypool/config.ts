import { sepolia } from "viem/chains";
import type { Address } from "viem";

/**
 * Privacy Pools v2 testnet configuration (verified from 0xbow-io repos).
 * Chain: Ethereum Sepolia (11155111). Native-ETH pool.
 */
export const CHAIN = sepolia;

export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

/** Deployed Sepolia native-ETH Privacy Pool + its entrypoint. */
export const POOL_ADDRESS: Address =
  "0x644d5A2554d36e27509254F32ccfeBe8cd58861f";
export const ENTRYPOINT_ADDRESS: Address =
  "0x34A2068192b1297f2a7f85D7D8CdE66F8F0921cB";

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

export const ASP_ENDPOINT = process.env.NEXT_PUBLIC_ASP_ENDPOINT || "";
export const RELAYER_URL = process.env.NEXT_PUBLIC_RELAYER_URL || "";

export function explorerTx(hash: string): string {
  return `https://sepolia.etherscan.io/tx/${hash}`;
}

export function explorerAddress(addr: string): string {
  return `https://sepolia.etherscan.io/address/${addr}`;
}
