export type ZodiacSign = {
  name: string;
  symbol: string;
  glyph: string;
  dates: string;
  element: "Fire" | "Earth" | "Air" | "Water";
  personality: string;
  /** oklch base color for the sign palette */
  color: string;
  glow: string;
  soft: string;
};

export const ZODIAC: ZodiacSign[] = [
  { name: "Aries",       symbol: "♈", glyph: "Ram",        dates: "Mar 21 – Apr 19", element: "Fire",  personality: "Bold pioneer of fire",   color: "oklch(0.72 0.22 25)",  glow: "oklch(0.72 0.22 25 / 0.55)",  soft: "oklch(0.72 0.22 25 / 0.14)"  },
  { name: "Taurus",      symbol: "♉", glyph: "Bull",       dates: "Apr 20 – May 20", element: "Earth", personality: "Grounded sensualist",     color: "oklch(0.78 0.16 145)", glow: "oklch(0.78 0.16 145 / 0.55)", soft: "oklch(0.78 0.16 145 / 0.14)" },
  { name: "Gemini",      symbol: "♊", glyph: "Twins",      dates: "May 21 – Jun 20", element: "Air",   personality: "Quicksilver mind",        color: "oklch(0.85 0.18 95)",  glow: "oklch(0.85 0.18 95 / 0.55)",  soft: "oklch(0.85 0.18 95 / 0.14)"  },
  { name: "Cancer",      symbol: "♋", glyph: "Crab",       dates: "Jun 21 – Jul 22", element: "Water", personality: "Lunar empath",            color: "oklch(0.82 0.10 230)", glow: "oklch(0.82 0.10 230 / 0.55)", soft: "oklch(0.82 0.10 230 / 0.14)" },
  { name: "Leo",         symbol: "♌", glyph: "Lion",       dates: "Jul 23 – Aug 22", element: "Fire",  personality: "Solar sovereign",         color: "oklch(0.80 0.19 65)",  glow: "oklch(0.80 0.19 65 / 0.55)",  soft: "oklch(0.80 0.19 65 / 0.14)"  },
  { name: "Virgo",       symbol: "♍", glyph: "Maiden",     dates: "Aug 23 – Sep 22", element: "Earth", personality: "Sacred craftsperson",     color: "oklch(0.75 0.12 130)", glow: "oklch(0.75 0.12 130 / 0.55)", soft: "oklch(0.75 0.12 130 / 0.14)" },
  { name: "Libra",       symbol: "♎", glyph: "Scales",     dates: "Sep 23 – Oct 22", element: "Air",   personality: "Harmonic diplomat",       color: "oklch(0.82 0.12 340)", glow: "oklch(0.82 0.12 340 / 0.55)", soft: "oklch(0.82 0.12 340 / 0.14)" },
  { name: "Scorpio",     symbol: "♏", glyph: "Scorpion",   dates: "Oct 23 – Nov 21", element: "Water", personality: "Phoenix mystic",          color: "oklch(0.62 0.22 350)", glow: "oklch(0.62 0.22 350 / 0.55)", soft: "oklch(0.62 0.22 350 / 0.14)" },
  { name: "Sagittarius", symbol: "♐", glyph: "Archer",     dates: "Nov 22 – Dec 21", element: "Fire",  personality: "Cosmic explorer",         color: "oklch(0.70 0.22 305)", glow: "oklch(0.70 0.22 305 / 0.55)", soft: "oklch(0.70 0.22 305 / 0.14)" },
  { name: "Capricorn",   symbol: "♑", glyph: "Sea-Goat",   dates: "Dec 22 – Jan 19", element: "Earth", personality: "Stoic mountain",          color: "oklch(0.70 0.08 250)", glow: "oklch(0.70 0.08 250 / 0.55)", soft: "oklch(0.70 0.08 250 / 0.14)" },
  { name: "Aquarius",    symbol: "♒", glyph: "Water-Bearer",dates: "Jan 20 – Feb 18",element: "Air",   personality: "Electric visionary",      color: "oklch(0.78 0.16 200)", glow: "oklch(0.78 0.16 200 / 0.55)", soft: "oklch(0.78 0.16 200 / 0.14)" },
  { name: "Pisces",      symbol: "♓", glyph: "Fishes",     dates: "Feb 19 – Mar 20", element: "Water", personality: "Oceanic dreamer",         color: "oklch(0.75 0.14 270)", glow: "oklch(0.75 0.14 270 / 0.55)", soft: "oklch(0.75 0.14 270 / 0.14)" },
];

export const getSign = (name: string) => ZODIAC.find((s) => s.name === name);