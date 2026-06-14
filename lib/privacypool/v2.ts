import {
  PoolSessionBuilder,
  CryptoService,
  DEFAULT_CIRCUIT_MANIFEST,
} from "@0xbow-io/privacy-pools-v2-sdk";
import { keccak256, type Address, type Hex } from "viem";
import { RPC_URL, RELAYER_URL, RELAYER_ADDRESS, RELAYER_PROCESSOR, ASP_ENDPOINT } from "./config";

// Defined locally: these are not reliably resolvable as named runtime exports
// of the V2 SDK under the bundler. The ETH sentinel is the protocol constant.
const NATIVE_ASSET_ADDRESS =
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" as Address;
const IPFS_GATEWAY_URLS = [
  "https://gateway.pinata.cloud/ipfs",
  "https://ipfs.io/ipfs",
  "https://cloudflare-ipfs.com/ipfs",
];

const DERIVATION_MESSAGE =
  "Cloak: derive my private donation keys.\nSign to continue. This is not a transaction and costs nothing.";

/**
 * DEFAULT_CIRCUIT_MANIFEST ships its *Sha256 hashes without a 0x prefix, but the
 * builder's own schema requires 0x-prefixed hex. Without this, PoolSessionBuilder
 * .create() throws and every V2 operation silently falls back. Add the prefix.
 */
function patchCircuitManifest(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  manifest: Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out: Record<string, any> = {};
  for (const [circuit, fields] of Object.entries(manifest)) {
    out[circuit] = { ...fields };
    for (const key of Object.keys(fields)) {
      const v = fields[key];
      if (/Sha256$/i.test(key) && typeof v === "string" && !v.startsWith("0x")) {
        out[circuit][key] = "0x" + v;
      }
    }
  }
  return out;
}

const CIRCUIT_MANIFEST = patchCircuitManifest(
  DEFAULT_CIRCUIT_MANIFEST as unknown as Record<string, unknown>,
);

type SendTx = (tx: { to: Address; data: Hex; value: bigint }) => Promise<Hex>;

type BaseDeps = {
  ownerAddress: Address;
  amountWeiHex: Hex;
  signMessage: (message: string) => Promise<Hex>;
  sendTransaction: SendTx;
  onStep?: (label: string) => void;
};

export type V2DepositDeps = BaseDeps & { recipient: Address };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function buildSession(ownerAddress: Address, signMessage: BaseDeps["signMessage"], onStep?: BaseDeps["onStep"]): Promise<any> {
  onStep?.("Sign to derive your private keys");
  const signature = await signMessage(DERIVATION_MESSAGE);

  const crypto = new CryptoService();
  const derived = crypto.deriveKeysFromSignature({
    signature,
    signerAddress: ownerAddress,
    revocableKeyIndex: "0x0",
    addressHash: keccak256(ownerAddress),
  });
  const protocolKeys = { ...derived, revocableKeyIndex: "0x0" };

  onStep?.("Preparing the private pool session");
  return PoolSessionBuilder.create({
    chainId: 11155111,
    rpcUrl: RPC_URL,
    ownerAddress,
    protocolKeys,
    aspUrl: ASP_ENDPOINT,
    circuitGatewayUrls: [...IPFS_GATEWAY_URLS],
    circuitManifest: CIRCUIT_MANIFEST,
    relayers: [
      {
        name: "0xbow staging relayer",
        url: RELAYER_URL,
        address: RELAYER_ADDRESS,
        processorAddress: RELAYER_PROCESSOR,
        chainId: 11155111,
        chainType: "evm",
        status: "active",
      },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ensureKeystore(session: any, sendTransaction: SendTx, onStep?: BaseDeps["onStep"]) {
  const registered = await session.isKeystoreRegistered();
  if (registered) return;
  onStep?.("Registering your keystore (one-time)");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reg: Record<string, any> = await session.prepareRegisterKeystore();
  for (const v of Object.values(reg)) {
    if (v && typeof v === "object" && "to" in v && "data" in v) {
      await sendTransaction({
        to: v.to as Address,
        data: v.data as Hex,
        value: BigInt(v.value ?? "0x0"),
      });
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function submitDeposit(dep: any, sendTransaction: SendTx): Promise<Hex> {
  if (dep.approvalTx) {
    await sendTransaction({
      to: dep.approvalTx.to,
      data: dep.approvalTx.data,
      value: BigInt(dep.approvalTx.value ?? "0x0"),
    });
  }
  return sendTransaction({
    to: dep.to,
    data: dep.callData,
    value: BigInt(dep.msgValue ?? "0x0"),
  });
}

/** 1-step: deposit straight to the cause's account (no separate withdrawal). */
export async function depositForViaV2(deps: V2DepositDeps): Promise<Hex> {
  const { ownerAddress, recipient, amountWeiHex, signMessage, sendTransaction, onStep } = deps;
  const session = await buildSession(ownerAddress, signMessage, onStep);
  await ensureKeystore(session, sendTransaction, onStep);
  onStep?.("Generating the private proof (can take a moment)");
  const dep = await session.prepareDepositFor({
    tokenId: NATIVE_ASSET_ADDRESS,
    value: amountWeiHex,
    discoveryData: { evmAddress: recipient },
  });
  onStep?.("Confirm the deposit in your wallet");
  return submitDeposit(dep, sendTransaction);
}

/** 2-step: deposit into your OWN pool balance; withdraw later (e.g. at the Privacy Pools app). */
export async function depositToSelfViaV2(deps: BaseDeps): Promise<Hex> {
  const { ownerAddress, amountWeiHex, signMessage, sendTransaction, onStep } = deps;
  const session = await buildSession(ownerAddress, signMessage, onStep);
  await ensureKeystore(session, sendTransaction, onStep);
  onStep?.("Generating your deposit");
  const dep = await session.prepareDeposit({
    tokenId: NATIVE_ASSET_ADDRESS,
    value: amountWeiHex,
  });
  onStep?.("Confirm the deposit in your wallet");
  return submitDeposit(dep, sendTransaction);
}

/** Thrown when the deposit isn't yet ASP-approved, so it can't be withdrawn. */
export const NOT_APPROVED = "NOT_APPROVED";

export type V2WithdrawDeps = {
  ownerAddress: Address;
  recipient: Address;
  signMessage: (message: string) => Promise<Hex>;
  onStep?: (label: string) => void;
};

/**
 * Has the Association Set approved a deposit yet? Returns true when the account
 * has a spendable (ACTIVE) native-ETH note - i.e. the withdrawal is available.
 */
export async function isWithdrawReadyViaV2(deps: {
  ownerAddress: Address;
  signMessage: (message: string) => Promise<Hex>;
  onStep?: (label: string) => void;
}): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session: any = await buildSession(deps.ownerAddress, deps.signMessage, deps.onStep);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const notes: any[] = (session.getNotes ? session.getNotes() : []) || [];
  const isEth = (t: string) =>
    (t || "").toLowerCase() === NATIVE_ASSET_ADDRESS.toLowerCase();
  return notes.some(
    (n) =>
      String(n.status).toUpperCase().includes("ACTIVE") &&
      isEth(n.tokenId) &&
      BigInt(n.value) > 0n,
  );
}

/**
 * Step 2, fully in-app: discover the user's deposited note. If the Association
 * Set has approved it (note is ACTIVE), generate the withdrawal proof and submit
 * it privately to the cause via the relayer. Throws NOT_APPROVED if the deposit
 * is not yet withdrawable.
 */
export async function withdrawToCauseViaV2(deps: V2WithdrawDeps): Promise<Hex> {
  const { ownerAddress, recipient, signMessage, onStep } = deps;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session: any = await buildSession(ownerAddress, signMessage, onStep);

  onStep?.("Finding your deposit");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const notes: any[] = (session.getNotes ? session.getNotes() : []) || [];
  const isEth = (t: string) =>
    (t || "").toLowerCase() === NATIVE_ASSET_ADDRESS.toLowerCase();
  const active = notes.find(
    (n) =>
      String(n.status).toUpperCase().includes("ACTIVE") &&
      isEth(n.tokenId) &&
      BigInt(n.value) > 0n,
  );
  if (!active) throw new Error(NOT_APPROVED);

  onStep?.("Generating the withdrawal proof (can take a moment)");
  const prep = await session.prepareWithdraw({
    inputCommitments: [active.commitment],
    amount: active.value,
    tokenId: NATIVE_ASSET_ADDRESS,
    recipientAddress: recipient,
  });

  const option = prep.relayerOptions?.[0];
  if (!option) throw new Error("No relayer quote available.");

  onStep?.("Submitting via relayer");
  const res = await session.relayWithdraw(option);
  const hash =
    typeof res === "string" ? res : res?.txHash ?? res?.hash ?? res?.transactionHash;
  if (!hash) throw new Error("Relayer did not return a transaction hash.");
  return hash as Hex;
}
