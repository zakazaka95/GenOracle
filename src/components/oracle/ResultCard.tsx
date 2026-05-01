import type { HoroscopeResult } from "@/lib/oracle";
import type { ZodiacSign } from "@/lib/zodiac";

function shareToTwitter(result: HoroscopeResult) {
  const text = `The cosmos spoke through @GenLayer AI validators and told me:\n\n"${result.horoscope}"\n\nLucky token today: ${result.lucky_token} ✦\n\nRead yours 👇\nhttps://genoracle.xyz`;
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
}

export function ResultCard({
  result,
  sign,
  onReset,
}: {
  result: HoroscopeResult;
  sign: ZodiacSign;
  onReset: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl animate-[scale-in_0.7s_cubic-bezier(0.16,1,0.3,1)]">
      <div className="glass-sign relative overflow-hidden rounded-3xl p-8 sm:p-12">
        {/* corner ornaments */}
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div
            className="absolute -left-32 -top-32 h-64 w-64 rounded-full blur-3xl"
            style={{ background: "var(--sign)" }}
          />
          <div
            className="absolute -bottom-40 -right-32 h-72 w-72 rounded-full blur-3xl"
            style={{ background: "var(--sign)", opacity: 0.6 }}
          />
        </div>

        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/40">
                {result.date} · validated on-chain
              </div>
              <h2
                className="mt-2 text-5xl sm:text-6xl text-gradient-sign"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {sign.name}
              </h2>
              <div className="mt-1 text-sm uppercase tracking-[0.3em] text-white/40">
                {sign.element} · {sign.personality}
              </div>
            </div>
            <div
              className="text-7xl sm:text-8xl leading-none"
              style={{ color: sign.color, textShadow: `0 0 40px ${sign.glow}` }}
            >
              {sign.symbol}
            </div>
          </div>

          {/* Cached badge */}
          {!result.cached && (
            <div
              className="mt-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.25em]"
              style={{
                borderColor: "var(--sign)",
                background: "var(--sign-soft)",
                color: "var(--sign)",
              }}
            >
              ✦ First soul to receive this reading today
            </div>
          )}

          {/* Hero horoscope */}
          <div className="my-10 border-y py-10" style={{ borderColor: "oklch(1 0 0 / 0.08)" }}>
            <div
              className="text-2xl sm:text-[28px] leading-[1.5] font-light"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="text-4xl align-top mr-1" style={{ color: sign.color }}>“</span>
              {result.horoscope}
              <span className="text-4xl align-bottom ml-1" style={{ color: sign.color }}>”</span>
            </div>
          </div>

          {/* Trio: number, color, energy */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            <Stat label="Lucky Number" value={String(result.lucky_number)} />
            <Stat
              label="Lucky Color"
              value={result.lucky_color}
              swatch
            />
            <Stat label="Energy" value={result.energy} />
          </div>

          {/* Lucky token */}
          <div
            className="mt-8 overflow-hidden rounded-2xl border p-6 sm:p-8"
            style={{
              borderColor: "var(--sign-glow)",
              background:
                "linear-gradient(135deg, var(--sign-soft), oklch(0.08 0.04 280 / 0.6))",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/40">
                ✦ Cosmic Market Signal
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">
                {sign.name.toUpperCase()} · {result.date}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-1">
              <div
                className="text-6xl sm:text-7xl font-bold tracking-tight text-gradient-gold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                ${result.lucky_token}
              </div>
              <div className="text-lg text-white/70">{result.lucky_token_name}</div>
            </div>
            <p className="mt-4 text-sm text-white/65 leading-relaxed">
              {result.lucky_token_reason}
            </p>
          </div>

          {/* Streak + free reads */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="glass flex items-center gap-4 rounded-xl px-5 py-4">
              <div className="text-3xl">🔥</div>
              <div>
                <div className="text-2xl font-semibold" style={{ color: sign.color }}>
                  {result.streak} day{result.streak === 1 ? "" : "s"}
                </div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                  sacred streak
                </div>
              </div>
            </div>
            <div className="glass flex items-center gap-4 rounded-xl px-5 py-4">
              <div className="text-3xl">✦</div>
              <div>
                <div className="text-2xl font-semibold text-gradient-gold">
                  {result.free_reads}
                </div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                  free reads remaining
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => shareToTwitter(result)}
              className="flex-1 rounded-full px-6 py-4 text-sm uppercase tracking-[0.3em] font-medium transition-transform hover:scale-[1.02]"
              style={{
                background: `linear-gradient(135deg, ${sign.color}, oklch(0.85 0.16 85))`,
                color: "oklch(0.1 0.04 280)",
                boxShadow: `0 10px 40px ${sign.glow}`,
              }}
            >
              Share Your Reading ✦
            </button>
            <button
              onClick={onReset}
              className="rounded-full border border-white/15 bg-white/[0.04] px-6 py-4 text-sm uppercase tracking-[0.3em] text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              New Reading
            </button>
          </div>

          {/* Made by */}
          <div className="mt-10 text-center">
            <a
              href="https://x.com/ZaksansPG"
              target="_blank"
              rel="noreferrer"
              className="text-[10px] uppercase tracking-[0.4em] text-white/30 hover:text-white/60 transition-colors"
            >
              Made by Zaksans
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, swatch }: { label: string; value: string; swatch?: boolean }) {
  return (
    <div className="glass rounded-xl p-4 sm:p-5">
      <div className="text-[9px] uppercase tracking-[0.3em] text-white/40">{label}</div>
      <div className="mt-2 flex items-center gap-2">
        {swatch && (
          <span
            className="inline-block h-4 w-4 rounded-full border border-white/20"
            style={{ background: value.toLowerCase().replace(/\s+/g, "") }}
          />
        )}
        <div
          className="text-xl sm:text-2xl font-medium truncate"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}