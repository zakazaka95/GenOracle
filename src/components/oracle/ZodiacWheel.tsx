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
          className="fill-[oklch(0.85_0.16_85)]"
          style={{ fontFamily: "var(--font-display)", fontSize: 30, letterSpacing: "0.3em" }}
        >
          GEN
        </text>
        <text
          x={center}
          y={center + 22}
          textAnchor="middle"
          className="fill-white/60"
          style={{ fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: "0.5em" }}
        >
          ORACLE
        </text>
        <line x1={center - 60} y1={center + 36} x2={center + 60} y2={center + 36} stroke="oklch(0.85 0.16 85 / 0.5)" />
        <text
          x={center}
          y={center + 56}
          textAnchor="middle"
          className="fill-white/40"
          style={{ fontSize: 9, letterSpacing: "0.4em" }}
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
            }}
            aria-label={sign.name}
          >
            <div
              className={`relative flex h-14 w-14 items-center justify-center rounded-full border transition-all duration-500
                ${isSelected
                  ? "scale-125 border-[var(--sign)] bg-[var(--sign-soft)]"
                  : "border-white/15 bg-white/[0.04] hover:scale-110 hover:border-[var(--sign)] hover:bg-[var(--sign-soft)]"}`}
              style={isSelected ? { boxShadow: `0 0 30px var(--sign-glow), 0 0 60px var(--sign-glow)` } : {}}
            >
              <span
                className="text-2xl transition-colors"
                style={{ color: isSelected ? sign.color : "oklch(0.95 0.02 280)" }}
              >
                {sign.symbol}
              </span>
            </div>
            <div
              className={`absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-[0.25em] transition-opacity ${
                isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-70"
              }`}
              style={{ color: sign.color }}
            >
              {sign.name}
            </div>
          </button>
        );
      })}
    </div>
  );
}