import { ZODIAC, type ZodiacSign } from "@/lib/zodiac";

type Props = {
  selected: ZodiacSign | null;
  onSelect: (s: ZodiacSign) => void;
};

export function ZodiacWheel({ selected, onSelect }: Props) {
  const size = 560;
  const center = size / 2;
  const radius = 220;

  return (
    <div className="relative mx-auto" style={{ width: size, maxWidth: "100%", aspectRatio: "1 / 1" }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-full w-full animate-[float_6s_ease-in-out_infinite]"
      >
        {/* concentric circles */}
        <circle cx={center} cy={center} r={radius + 40} fill="none" stroke="oklch(1 0 0 / 0.06)" strokeDasharray="2 6" />
        <circle cx={center} cy={center} r={radius - 60} fill="none" stroke="oklch(1 0 0 / 0.08)" />
        <circle cx={center} cy={center} r={radius - 120} fill="none" stroke="oklch(1 0 0 / 0.05)" />

        {/* slow orbit ring */}
        <g style={{ transformOrigin: `${center}px ${center}px`, animation: "orbit 60s linear infinite" }}>
          <circle cx={center + radius + 40} cy={center} r={2} fill="oklch(0.85 0.18 85)" opacity="0.7" />
        </g>

        {/* center monogram */}
        <text
          x={center}
          y={center - 8}
          textAnchor="middle"
          className="fill-[oklch(0.92_0.18_85)]"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 36,
            letterSpacing: "0.3em",
            filter: "drop-shadow(0 0 18px oklch(0.85 0.18 85 / 0.7))",
          }}
        >
          GEN
        </text>
        <text
          x={center}
          y={center + 24}
          textAnchor="middle"
          className="fill-white/85"
          style={{ fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: "0.5em" }}
        >
          ORACLE
        </text>
        <line x1={center - 70} y1={center + 40} x2={center + 70} y2={center + 40} stroke="oklch(0.85 0.16 85 / 0.6)" />
        <text
          x={center}
          y={center + 64}
          textAnchor="middle"
          className="fill-white/80 shimmer-text"
          style={{ fontSize: 12, letterSpacing: "0.45em", fontWeight: 500 }}
        >
          CHOOSE YOUR SIGN
        </text>
      </svg>

      {/* sign nodes */}
      {ZODIAC.map((sign, i) => {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        const isSelected = selected?.name === sign.name;
        return (
          <button
            key={sign.name}
            onClick={() => onSelect(sign)}
            className="group absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
            style={{
              left: `${(x / size) * 100}%`,
              top: `${(y / size) * 100}%`,
              ["--sign" as any]: sign.color,
              ["--sign-glow" as any]: sign.glow,
              ["--sign-soft" as any]: sign.soft,
              animationDelay: `${i * 0.15}s`,
            }}
            aria-label={sign.name}
          >
            {/* pulsing aura */}
            <div
              aria-hidden
              className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-500
                ${isSelected
                  ? "h-28 w-28 opacity-90"
                  : "h-20 w-20 opacity-50 group-hover:h-32 group-hover:w-32 group-hover:opacity-100"}`}
              style={{
                background: `radial-gradient(circle, ${sign.glow} 0%, transparent 70%)`,
                animation: `sign-pulse 3s ease-in-out ${i * 0.2}s infinite`,
                filter: "blur(2px)",
              }}
            />
            <div
              className={`relative flex items-center justify-center rounded-full border transition-all duration-500
                ${isSelected
                  ? "h-16 w-16 scale-125 border-2 border-[var(--sign)] bg-[var(--sign-soft)]"
                  : "h-14 w-14 border-white/20 bg-white/[0.04] group-hover:scale-[1.35] group-hover:border-[var(--sign)] group-hover:bg-[var(--sign-soft)]"}`}
              style={
                isSelected
                  ? { boxShadow: `0 0 35px var(--sign-glow), 0 0 70px var(--sign-glow), inset 0 0 20px var(--sign-soft)` }
                  : { boxShadow: `0 0 12px ${sign.glow}` }
              }
            >
              <span
                className="text-2xl transition-all duration-500 group-hover:text-3xl"
                style={{
                  color: isSelected ? sign.color : "oklch(0.95 0.02 280)",
                  textShadow: isSelected
                    ? `0 0 20px ${sign.glow}, 0 0 40px ${sign.glow}`
                    : `0 0 10px ${sign.glow}`,
                }}
              >
                {sign.symbol}
              </span>
            </div>
            <div
              className={`absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-[0.25em] transition-opacity ${
                isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-90"
              }`}
              style={{ color: sign.color, textShadow: `0 0 12px ${sign.glow}` }}
            >
              {sign.name}
            </div>
          </button>
        );
      })}
    </div>
  );
}