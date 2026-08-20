import { createClient } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";
import { ExecutionResult, TransactionStatus } from "genlayer-js/types";

// @ts-ignore
BigInt.prototype.toJSON = function () { return this.toString(); };

export const CONTRACT_ADDRESS = "0x798571b9E5E8c1388da823cb9e8d3Ce54Ea76cca" as const;
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

function extractHoroscope(result: unknown): string {
  if (typeof result === "string") {
    const value = result.trim();
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === "string") return parsed;
      if (parsed && typeof parsed.horoscope === "string") return parsed.horoscope;
    } catch {
      return value;
    }
    return value;
  }

  if (
    result &&
    typeof result === "object" &&
    "horoscope" in result &&
    typeof (result as any).horoscope === "string"
  ) {
    return (result as any).horoscope;
  }

  throw new Error("The contract returned an unreadable horoscope.");
}

const num = (v: any): number => (typeof v === "bigint" ? Number(v) : Number(v ?? 0));
const str = (v: any): string => (v === undefined || v === null ? "" : String(v));

export function cacheKey(address: string, sign: string, date: string) {
  return `genoracle:${address.toLowerCase()}:${sign}:${date}`;
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

export async function readHoroscope(address: string, sign: string): Promise<HoroscopeResult> {
  const date = new Date().toISOString().slice(0, 10);

  const readClient = createClient({
    chain: testnetBradbury,
  });

  const writeClient = createClient({
    chain: testnetBradbury,
    account: address as `0x${string}`,
    provider: eth(),
  } as any);

  await (writeClient as any).connect("testnetBradbury");

  let wasCachedBeforeTransaction = false;
  try {
    wasCachedBeforeTransaction = Boolean(
      await readClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: "is_cached",
        args: [sign, date],
        stateStatus: "accepted",
      } as any),
    );
  } catch {
    wasCachedBeforeTransaction = false;
  }

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

  if (receipt?.txExecutionResultName !== ExecutionResult.FINISHED_WITH_RETURN) {
    throw new Error("The horoscope transaction was accepted but contract execution failed.");
  }

  const returnValue =
    receipt?.returnValue ??
    receipt?.result ??
    receipt?.consensus_data?.leader_receipt?.[0]?.result?.payload?.readable;

  const horoscope = extractHoroscope(returnValue);

  const [profile, streak, freeReads, totalReadings] = await Promise.all([
    readClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      functionName: "get_daily_profile",
      args: [sign, date],
      stateStatus: "accepted",
    } as any) as Promise<any>,
    readClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      functionName: "get_streak",
      args: [address],
      stateStatus: "accepted",
    } as any) as Promise<any>,
    readClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      functionName: "get_free_reads",
      args: [address],
      stateStatus: "accepted",
    } as any) as Promise<any>,
    readClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      functionName: "get_total_readings",
      args: [],
      stateStatus: "accepted",
    } as any) as Promise<any>,
  ]);

  const result: HoroscopeResult = {
    sign,
    date,
    horoscope,
    lucky_number: num(profile?.lucky_number),
    lucky_color: str(profile?.lucky_color),
    energy: str(profile?.energy),
    lucky_token: str(profile?.lucky_token),
    lucky_token_name: str(profile?.lucky_token_name),
    lucky_token_reason: str(profile?.lucky_token_reason),
    cached: wasCachedBeforeTransaction,
    streak: num(streak),
    free_reads: num(freeReads),
    total_readings: num(totalReadings),
    tx_hash: String(txHash),
  };

  storeReading(address, result);
  return result;
}
