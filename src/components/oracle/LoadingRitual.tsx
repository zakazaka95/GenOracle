import { useEffect, useState } from "react";
import type { ZodiacSign } from "@/lib/zodiac";

const STAGES = [
  "Transmitting your sign to the network…",
  "Validators awakening across the cosmos…",
  "Consulting the celestial archive…",
  "Cross-referencing planetary alignments…",
  "Validators reaching consensus…",
  "Sealing your reading on-chain…",
];

export function LoadingRitual({ sign }: { sign: ZodiacSign }) {
  const [stage, setStage] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const i = setInterval(() => {
      setStage((s) => (s + 1) % STAGES.length);
    }, 4500);
    return () => clearInterval(i);
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-10 py-8 animate-[fade-up_0.8s_cubic-bezier(0.16,1,0.3,1)]">
      {/* Sigil with orbits */}
      <div className="relative h-64 w-64">
        {/* outer orbit */}
        <div
          className="absolute inset-0 rounded-full border"
          style={{ borderColor: "var(--sign-glow)", animation: "orbit 8s linear infinite" }}
        >
          <div
            className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full"
            style={{ background: "var(--sign)", boxShadow: "0 0 12px var(--sign-glow)" }}
          />
        </div>
        {/* mid orbit */}
        <div
          className="absolute inset-6 rounded-full border"
          style={{ borderColor: "oklch(1 0 0 / 0.1)", animation: "orbit 14s linear infinite reverse" }}
        >
          <div
            className="absolute top-1/2 -right-1 h-2 w-2 -translate-y-1/2 rounded-full"
            style={{ background: "oklch(0.85 0.16 85)", boxShadow: "0 0 10px oklch(0.85 0.16 85 / 0.7)" }}
          />
        </div>
        {/* inner orbit */}
        <div
          className="absolute inset-12 rounded-full border border-white/10"
          style={{ animation: "orbit 22s linear infinite" }}
        />
        {/* core glyph */}
        <div
          className="absolute inset-16 flex items-center justify-center rounded-full"
          style={{
            background: "radial-gradient(circle at 50% 50%, var(--sign-soft), transparent 70%)",
            animation: "pulse-glow 3s ease-in-out infinite",
          }}
        >
          <span className="text-7xl" style={{ color: sign.color }}>{sign.symbol}</span>
        </div>
      </div>

      {/* Stage text */}
      <div className="text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/40">
          {mm}:{ss} · validating
        </div>
        <div
          key={stage}
          className="mt-3 text-2xl font-light tracking-wide animate-[fade-up_0.6s_ease-out]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {STAGES[stage]}
        </div>
        <p className="mt-3 max-w-md text-sm text-white/50">
          Your reading is reaching consensus. This may take a few minutes.
        </p>
      </div>

      {/* Validator pulse */}
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full"
            style={{
              background: "var(--sign)",
              animation: `pulse-glow 1.4s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}