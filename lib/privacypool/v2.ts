import {
  PoolSessionBuilder,
  CryptoService,
  DEFAULT_CIRCUIT_MANIFEST,
} from "@0xbow-io/privacy-pools-v2-sdk";
import { keccak256, type Address, type Hex } from "viem";
import { RPC_URL } from "./config";

// Defined locally: these are not reliably resolvable as named runtime exports
// of the V2 SDK under the bundler. The ETH sentinel is the protocol constant.
const NATIVE_ASSET_ADDRESS =
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" as Address;
const IPFS_GATEWAY_URLS = [
  "https://gateway.pinata.cloud/ipfs",
  "https://ipfs.io/ipfs",
  "https://cloudflare-ipfs.com/ipfs",
];

/**
 * Real Privacy Pools V2 "depositFor" flow: the donor deposits straight to the
 * cause's account inside the pool, so the donation reaches the recipient in one
 * real on-chain transaction with no public donor->cause link, and no separate
 * withdrawal step.
 *
 * This is a cold-start ZK deposit. It requires: a wallet signature to derive
 * protocol keys, a one-time on-chain keystore registration, and an in-browser
 * Groth16 proof using circuit artifacts fetched from IPFS. Heavy and wallet-
 * interactive - the caller wraps it with a fallback so a demo never breaks.
 */
const DERIVATION_MESSAGE =
  "Cloak: derive my private donation keys.\nSign to continue. This is not a transaction and costs nothing.";

type SendTx = (tx: { to: Address; data: Hex; value: bigint }) => Promise<Hex>;

export type V2DepositDeps = {
  ownerAddress: Address;
  recipient: Address;
  amountWeiHex: Hex;
  signMessage: (message: string) => Promise<Hex>;
  sendTransaction: SendTx;
  onStep?: (label: string) => void;
};

export async function depositForViaV2(deps: V2DepositDeps): Promise<Hex> {
  const { ownerAddress, recipient, amountWeiHex, signMessage, sendTransaction, onStep } = deps;

  onStep?.("Sign to derive your private keys");
  const signature = await signMessage(DERIVATION_MESSAGE);

  // Two-stage HKDF key derivation from the signature (no on-chain cost).
  const crypto = new CryptoService();
  const derived = crypto.deriveKeysFromSignature({
    signature,
    signerAddress: ownerAddress,
    revocableKeyIndex: "0x0",
    addressHash: keccak256(ownerAddress),
  });
  const protocolKeys = { ...derived, revocableKeyIndex: "0x0" };

  onStep?.("Preparing the private pool session");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await PoolSessionBuilder.create({
    chainId: 11155111,
    rpcUrl: RPC_URL,
    ownerAddress,
    protocolKeys,
    ipfsGatewayUrl: IPFS_GATEWAY_URLS[0],
    circuitGatewayUrls: [...IPFS_GATEWAY_URLS],
    circuitManifest: DEFAULT_CIRCUIT_MANIFEST,
    relayers: [
      {
        name: "self",
        url: "https://relayer.invalid",
        address: ownerAddress,
        processorAddress: ownerAddress,
        chainId: 11155111,
        chainType: "evm",
        status: "active",
      },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  // One-time keystore registration for this account.
  const registered = await session.isKeystoreRegistered();
  if (!registered) {
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

  onStep?.("Generating the private proof (can take a moment)");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dep: any = await session.prepareDepositFor({
    tokenId: NATIVE_ASSET_ADDRESS,
    value: amountWeiHex,
    discoveryData: { evmAddress: recipient },
  });

  if (dep.approvalTx) {
    await sendTransaction({
      to: dep.approvalTx.to,
      data: dep.approvalTx.data,
      value: BigInt(dep.approvalTx.value ?? "0x0"),
    });
  }

  onStep?.("Confirm the deposit in your wallet");
  return sendTransaction({
    to: dep.to,
    data: dep.callData,
    value: BigInt(dep.msgValue ?? "0x0"),
  });
}
