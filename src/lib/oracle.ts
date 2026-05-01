import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

// @ts-ignore
BigInt.prototype.toJSON = function () { return this.toString(); };

export const CONTRACT_ADDRESS = "0xC0B4526E0a674151C7393fD6c35AEDA3F5c29306" as const;
export const CHAIN_ID_HEX = "0xF22F";
export const CHAIN_ID_DEC = 61999;
export const READ_PRICE_WEI = BigInt("50000000000000000"); // 0.05 GEN

export type HoroscopeResult = {
  sign: string;
  date: string;
  horoscope: string;
  lucky_number: number;
  lucky_color: string;
  energy: string;
  lucky_token: string;
  lucky_token_name: string;
  lucky_token_reason: string;
  cached: boolean;
  streak: number;
  free_reads: number;
};

const eth = () => {
  const e = (typeof window !== "undefined" ? (window as any).ethereum : null);
  if (!e) throw new Error("No wallet detected. Install MetaMask to commune with the cosmos.");
  return e;
};

export async function connectWallet(): Promise<string> {
  const accounts: string[] = await eth().request({ method: "eth_requestAccounts" });
  if (!accounts?.[0]) throw new Error("No account returned by wallet");
  return accounts[0];
}

export async function ensureStudio(): Promise<void> {
  try {
    await eth().request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CHAIN_ID_HEX }],
    });
  } catch (err: any) {
    if (err?.code === 4902 || err?.code === -32603) {
      await eth().request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: CHAIN_ID_HEX,
          chainName: "GenLayer Studio",
          nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
          rpcUrls: ["https://studio.genlayer.com/api"],
          blockExplorerUrls: ["https://explorer-studio.genlayer.com"],
        }],
      });
    } else {
      throw err;
    }
  }
}

export async function getBalance(address: string): Promise<bigint> {
  const hex: string = await eth().request({
    method: "eth_getBalance",
    params: [address, "latest"],
  });
  return BigInt(hex);
}

export async function getCurrentChainId(): Promise<string> {
  return await eth().request({ method: "eth_chainId" });
}

const parseReadable = (readable: string) => {
  const fixed = readable
    .replace(/(\d)"(?=[a-zA-Z])/g, '$1,"')
    .replace(/"(\s*)"(?=[a-zA-Z])/g, '","')
    .replace(/}(\s*)"(?=[a-zA-Z])/g, '},"')
    .replace(/true"(?=[a-zA-Z])/g, 'true,"')
    .replace(/false"(?=[a-zA-Z])/g, 'false,"');
  return JSON.parse(fixed);
};

export async function readHoroscope(address: string, sign: string): Promise<HoroscopeResult> {
  const client = createClient({
    chain: studionet,
    account: address as `0x${string}`,
  });

  const today = new Date().toISOString().split("T")[0];

  const txHash = await client.writeContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName: "read_horoscope",
    args: [sign, today],
    value: READ_PRICE_WEI,
  });

  const receipt: any = await client.waitForTransactionReceipt({
    hash: txHash,
    status: TransactionStatus.ACCEPTED,
    retries: 200,
    interval: 5000,
  });

  const leaderReceipt = receipt?.consensus_data?.leader_receipt?.[0];
  const readable = leaderReceipt?.result?.payload?.readable;
  if (!readable) throw new Error("The validators returned no reading. Try again.");
  return parseReadable(readable) as HoroscopeResult;
}