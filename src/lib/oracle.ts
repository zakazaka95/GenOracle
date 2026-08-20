import { createClient } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";
import { ExecutionResult, TransactionStatus } from "genlayer-js/types";

// @ts-ignore
BigInt.prototype.toJSON = function () { return this.toString(); };

export const CONTRACT_ADDRESS = "0x790bdED92Aef00B83369561D5aCfd3557F6D946d" as const;
export const CHAIN_ID_HEX = "0x107D";
export const CHAIN_ID_DEC = 4221;
export const CHAIN_NAME = "GenLayer Testnet Bradbury";
export const RPC_URL = "https://rpc-bradbury.genlayer.com";
export const EXPLORER_URL = "https://explorer-bradbury.genlayer.com";
export const READ_PRICE_WEI = 1_000_000_000_000_000_000n; // 1 GEN

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
  total_readings: number;
  tx_hash?: string;
};

const eth = () => {
  const e = (typeof window !== "undefined" ? (window as any).ethereum : null);
  if (!e) throw new Error("No wallet detected. Install MetaMask to commune with the cosmos.");
  return e;
};

export async function connectWallet(): Promise<string> {
  const ethereum = (typeof window !== "undefined" ? (window as any).ethereum : null);
  if (!ethereum) {
    throw new Error("Please install MetaMask or another compatible wallet.");
  }

  const accounts = (await ethereum.request({
    method: "eth_requestAccounts",
  })) as string[];

  if (!accounts?.[0]) {
    throw new Error("No wallet account was returned.");
  }

  await ensureBradbury();

  return accounts[0];
}

export async function ensureBradbury(): Promise<void> {
  const ethereum = (typeof window !== "undefined" ? (window as any).ethereum : null);
  if (!ethereum) {
    throw new Error("Please install MetaMask or another compatible wallet.");
  }

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CHAIN_ID_HEX }],
    });
  } catch (error: any) {
    const errorCode = error?.code ?? error?.data?.originalError?.code;

    if (errorCode !== 4902) {
      throw error;
    }

    await ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: CHAIN_ID_HEX,
          chainName: CHAIN_NAME,
          nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
          rpcUrls: [RPC_URL],
          blockExplorerUrls: [EXPLORER_URL],
        },
      ],
    });
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

const num = (v: any): number => {
  if (typeof v === "bigint") return Number(v);
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};
const str = (v: any): string => (v === undefined || v === null ? "" : String(v));

export function cacheKey(address: string, sign: string, date: string) {
  return `genoracle:${address.toLowerCase()}:${sign.toLowerCase()}:${date}`;
}

export function loadStoredReading(address: string, sign: string): HoroscopeResult | null {
  if (typeof window === "undefined") return null;
  const date = new Date().toISOString().slice(0, 10);
  try {
    const raw = window.localStorage.getItem(cacheKey(address, sign, date));
    return raw ? (JSON.parse(raw) as HoroscopeResult) : null;
  } catch {
    return null;
  }
}

function storeReading(address: string, result: HoroscopeResult) {
  try {
    window.localStorage.setItem(
      cacheKey(address, result.sign, result.date),
      JSON.stringify(result),
    );
  } catch {
    // ignore
  }
}

function normalizeReading(raw: unknown): any | null {
  let value: any = raw;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
      value = JSON.parse(trimmed);
    } catch {
      return null;
    }
  }
  if (!value || typeof value !== "object") return null;
  if (typeof value.horoscope !== "string" || !value.horoscope.trim()) return null;
  return value;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function readHoroscope(address: string, signName: string): Promise<HoroscopeResult> {
  const date = new Date().toISOString().slice(0, 10);
  const sign = signName.toLowerCase();

  const readClient = createClient({
    chain: testnetBradbury,
  });

  const writeClient = createClient({
    chain: testnetBradbury,
    account: address as `0x${string}`,
    provider: (typeof window !== "undefined" ? (window as any).ethereum : undefined),
  } as any);

  const txHash = await writeClient.writeContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName: "read_horoscope",
    args: [sign, date],
    value: READ_PRICE_WEI,
  });

  const receipt: any = await readClient.waitForTransactionReceipt({
    hash: txHash,
    status: TransactionStatus.ACCEPTED,
    retries: 200,
    interval: 3000,
    fullTransaction: false,
  } as any);

  if (
    receipt?.txExecutionResultName &&
    receipt.txExecutionResultName !== ExecutionResult.FINISHED_WITH_RETURN &&
    receipt.txExecutionResultName !== "FINISHED"
  ) {
    throw new Error("The horoscope transaction was accepted but contract execution failed.");
  }

  let reading: any = null;
  for (let attempt = 0; attempt < 200; attempt++) {
    try {
      const raw = await readClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: "get_cached_reading",
        args: [sign, date, address],
        stateStatus: "accepted",
      } as any);
      reading = normalizeReading(raw);
      if (reading) break;
    } catch {
      // keep polling
    }
    await sleep(3000);
  }

  if (!reading) {
    throw new Error("Your reading is still reaching consensus. Please try again in a few minutes.");
  }

  const result: HoroscopeResult = {
    sign: str(reading.sign) || sign,
    date: str(reading.date) || date,
    horoscope: str(reading.horoscope),
    lucky_number: num(reading.lucky_number),
    lucky_color: str(reading.lucky_color),
    energy: str(reading.energy),
    lucky_token: str(reading.lucky_token),
    lucky_token_name: str(reading.lucky_token_name),
    lucky_token_reason: str(reading.lucky_token_reason),
    cached: Boolean(reading.cached),
    streak: num(reading.streak ?? reading.current_streak ?? reading.profile?.streak ?? 0),
    free_reads: num(reading.free_reads ?? reading.profile?.free_reads ?? 0),
    total_readings: num(reading.total_readings),
    tx_hash: String(txHash),
  };

  storeReading(address, result);
  return result;
}
