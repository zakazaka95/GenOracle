import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ZODIAC, type ZodiacSign, getSign } from "@/lib/zodiac";
import {
  CHAIN_ID_HEX,
  READ_PRICE_WEI,
  connectWallet,
  ensureStudio,
  getBalance,
  getCurrentChainId,
  readHoroscope,
  type HoroscopeResult,
} from "@/lib/oracle";
import { Starfield } from "@/components/oracle/Starfield";
import { ZodiacWheel } from "@/components/oracle/ZodiacWheel";
import { LoadingRitual } from "@/components/oracle/LoadingRitual";
import { ResultCard } from "@/components/oracle/ResultCard";

export const Route = createFileRoute("/")({
  component: GenOracle,
  head: () => ({
    meta: [
      { title: "GenOracle — Onchain Horoscopes by GenLayer AI Validators" },
      {
        name: "description",
        content:
          "Premium onchain horoscope readings sealed by GenLayer's AI validator network on GenLayer Studio. Your destiny, validated by consensus.",
      },
      { property: "og:title", content: "GenOracle — Onchain Horoscopes" },
      {
        property: "og:description",
        content:
          "Premium onchain horoscope readings sealed by GenLayer's AI validator network. Your destiny, validated by consensus.",
      },
    ],
  }),
});

type AppState = "idle" | "connected" | "loading" | "revealed";

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function GenOracle() {
  const [sign, setSign] = useState<ZodiacSign | null>(null);
  const [state, setState] = useState<AppState>("idle");
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [needsFaucet, setNeedsFaucet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HoroscopeResult | null>(null);

  const onWrongChain = chainId !== null && chainId.toLowerCase() !== CHAIN_ID_HEX.toLowerCase();
  const hasEnough = balance !== null && balance >= READ_PRICE_WEI;

  // Apply sign palette globally
  useEffect(() => {
    const root = document.documentElement;
    if (sign) {
      root.style.setProperty("--sign", sign.color);
      root.style.setProperty("--sign-glow", sign.glow);
      root.style.setProperty("--sign-soft", sign.soft);
    } else {
      root.style.setProperty("--sign", "oklch(0.85 0.16 85)");
      root.style.setProperty("--sign-glow", "oklch(0.85 0.16 85 / 0.5)");
      root.style.setProperty("--sign-soft", "oklch(0.85 0.16 85 / 0.12)");
    }
  }, [sign]);

  // Listen to wallet events
  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return;
    const onChain = (cid: string) => setChainId(cid);
    const onAccounts = (accs: string[]) => {
      if (!accs?.length) {
        setAddress(null);
        setBalance(null);
        setState("idle");
      } else {
        setAddress(accs[0]);
      }
    };
    eth.on?.("chainChanged", onChain);
    eth.on?.("accountsChanged", onAccounts);
    return () => {
      eth.removeListener?.("chainChanged", onChain);
      eth.removeListener?.("accountsChanged", onAccounts);
    };
  }, []);

  // Refresh balance when address or chain changes
  useEffect(() => {
    if (!address) return;
    (async () => {
      try {
        const b = await getBalance(address);
        setBalance(b);
        setNeedsFaucet(b < READ_PRICE_WEI);
      } catch (e) {
        // ignore
      }
    })();
  }, [address, chainId]);

  async function handleConnect() {
    setError(null);
    try {
      const addr = await connectWallet();
      setAddress(addr);
      await ensureStudio();
      const cid = await getCurrentChainId();
      setChainId(cid);
      const b = await getBalance(addr);
      setBalance(b);
      if (b < READ_PRICE_WEI) {
        setNeedsFaucet(true);
      } else {
        setNeedsFaucet(false);
        setState("connected");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to connect wallet");
    }
  }

  async function recheckBalance() {
    if (!address) return;
    setError(null);
    try {
      const b = await getBalance(address);
      setBalance(b);
      if (b >= READ_PRICE_WEI) {
        setNeedsFaucet(false);
        setState("connected");
      }
    } catch (e: any) {
      setError(e?.message || "Could not check balance");
    }
  }

  async function handleRead() {
    if (!address || !sign) return;
    setError(null);
    setState("loading");
    try {
      const r = await readHoroscope(address, sign.name);
      setResult(r);
      setState("revealed");
    } catch (e: any) {
      setError(e?.message || "The cosmos was unreachable. Try again.");
      setState("connected");
    }
  }

  function reset() {
    setResult(null);
    setSign(null);
    setState(address ? "connected" : "idle");
  }

  return (
    <div className="cosmic-bg relative min-h-screen text-foreground">
      <Starfield />

      {/* Top bar */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full border"
            style={{ borderColor: "var(--sign-glow)", background: "var(--sign-soft)" }}
          >
            <span style={{ color: "var(--sign)" }}>✦</span>
          </div>
          <div>
            <div
              className="text-lg leading-none"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "0.15em" }}
            >
              GENORACLE
            </div>
            <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.3em] text-white/40">
              onchain · bradbury
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onWrongChain && (
            <button
              onClick={ensureStudio}
              className="rounded-full border border-destructive/50 bg-destructive/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-destructive hover:bg-destructive/20"
            >
              ⚠ Wrong Network · Switch
            </button>
          )}
          {address ? (
            <div className="glass rounded-full px-4 py-1.5 font-mono text-xs text-white/70">
              {shortAddr(address)}
              {balance !== null && (
                <span className="ml-2 text-white/40">
                  · {(Number(balance) / 1e18).toFixed(3)} GEN
                </span>
              )}
            </div>
          ) : null}
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        {state !== "revealed" && state !== "loading" && (
          <section className="pt-8 pb-16 text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.5em] text-white/40">
              ✦ daily reading · sealed by ai consensus ✦
            </div>
            <h1
              className="mx-auto mt-6 max-w-3xl text-5xl sm:text-7xl font-light leading-[1.05]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              The cosmos, <span className="shimmer-text italic">validated</span>.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base text-white/60 leading-relaxed">
              A network of independent AI validators reads the stars and seals your daily horoscope on-chain.
              No oracles. No middlemen. Just consensus and constellations.
            </p>
          </section>
        )}

        {(state === "idle" || state === "connected") && (
          <section className="space-y-12">
            <ZodiacWheel selected={sign} onSelect={setSign} />

            {sign && (
              <div
                className="mx-auto max-w-2xl rounded-2xl glass-sign p-6 text-center animate-[fade-up_0.5s_ease-out]"
              >
                <div className="text-[10px] uppercase tracking-[0.4em] text-white/40">
                  {sign.element} · {sign.dates}
                </div>
                <h3
                  className="mt-2 text-4xl text-gradient-sign"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {sign.name}
                </h3>
                <p className="mt-1 text-sm text-white/60 italic">{sign.personality}</p>
              </div>
            )}

            <div className="flex flex-col items-center gap-4">
              {!address ? (
                <button
                  onClick={handleConnect}
                  disabled={!sign}
                  className="group relative overflow-hidden rounded-full border px-10 py-5 text-sm uppercase tracking-[0.3em] font-medium transition-all disabled:cursor-not-allowed"
                  style={{
                    background: sign
                      ? `linear-gradient(135deg, ${sign.color}, oklch(0.85 0.16 85))`
                      : "oklch(0.18 0.05 280 / 0.8)",
                    color: sign ? "oklch(0.1 0.04 280)" : "oklch(0.95 0.02 85)",
                    borderColor: sign ? "transparent" : "oklch(0.85 0.16 85 / 0.6)",
                    boxShadow: sign
                      ? `0 10px 50px var(--sign-glow)`
                      : "0 0 24px oklch(0.85 0.16 85 / 0.25)",
                  }}
                >
                  {sign ? "Connect Wallet ✦" : "↑ Choose a sign first"}
                </button>
              ) : needsFaucet ? (
                <FaucetPrompt onRecheck={recheckBalance} balance={balance} />
              ) : (
                <button
                  onClick={handleRead}
                  disabled={!sign || onWrongChain}
                  className="group relative overflow-hidden rounded-full px-10 py-5 text-sm uppercase tracking-[0.3em] font-medium transition-all disabled:cursor-not-allowed disabled:opacity-30"
                  style={{
                    background: sign
                      ? `linear-gradient(135deg, ${sign.color}, oklch(0.85 0.16 85))`
                      : "oklch(0.2 0.04 280)",
                    color: "oklch(0.1 0.04 280)",
                    boxShadow: sign && !onWrongChain ? `0 10px 50px var(--sign-glow)` : "none",
                  }}
                >
                  {onWrongChain
                    ? "Switch to GenLayer Studio to read"
                    : sign
                    ? "Read My Stars · 0.05 GEN"
                    : "Choose a sign"}
                </button>
              )}

              {error && (
                <div className="max-w-md rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-center text-xs text-destructive">
                  {error}
                </div>
              )}
            </div>
          </section>
        )}

        {state === "loading" && sign && <LoadingRitual sign={sign} />}

        {state === "revealed" && result && sign && (
          <ResultCard result={result} sign={sign} onReset={reset} />
        )}

        {/* Footer trust strip */}
        {state !== "revealed" && (
          <footer className="mt-24 border-t border-white/5 pt-8 text-center">
            <div className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/30">
              contract 0xC0B4…9306 · chain 61999 · genlayer studio
            </div>
            <div className="mt-3">
              <a
                href="https://x.com/ZaksansPG"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] uppercase tracking-[0.4em] text-white/30 hover:text-white/60"
              >
                Made by Zaksans
              </a>
            </div>
          </footer>
        )}
      </main>
    </div>
  );
}

function FaucetPrompt({
  onRecheck,
  balance,
}: {
  onRecheck: () => void;
  balance: bigint | null;
}) {
  return (
    <div className="glass-sign mx-auto max-w-md rounded-2xl p-6 text-center animate-[fade-up_0.5s_ease-out]">
      <div className="text-[10px] uppercase tracking-[0.4em]" style={{ color: "var(--sign)" }}>
        ✦ insufficient gen
      </div>
      <h3 className="mt-2 text-2xl" style={{ fontFamily: "var(--font-display)" }}>
        Fuel your reading
      </h3>
      <p className="mt-2 text-sm text-white/60">
        You need at least <span className="text-white">0.05 GEN</span> to call the oracle.
        {balance !== null && (
          <> Current balance: <span className="font-mono">{(Number(balance) / 1e18).toFixed(4)} GEN</span></>
        )}
      </p>
      <p className="mt-3 text-xs text-white/50">
        Open GenLayer Studio, connect your wallet, then use the faucet in the top right corner.
      </p>
      <div className="mt-5 flex flex-col gap-2">
        <a
          href="https://studio.genlayer.com"
          target="_blank"
          rel="noreferrer"
          className="rounded-full px-6 py-3 text-sm uppercase tracking-[0.3em] font-medium"
          style={{
            background: "linear-gradient(135deg, var(--sign), oklch(0.85 0.16 85))",
            color: "oklch(0.1 0.04 280)",
            boxShadow: "0 10px 40px var(--sign-glow)",
          }}
        >
          Open GenLayer Studio →
        </a>
        <button
          onClick={onRecheck}
          className="rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm uppercase tracking-[0.3em] text-white/70 hover:bg-white/[0.08] hover:text-white"
        >
          I have GEN now
        </button>
      </div>
    </div>
  );
}
