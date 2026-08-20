# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
from datetime import datetime, timezone
import json


READING_PRICE = 1_000_000_000_000_000_000  # 1 GEN

VALID_SIGNS = [
    "aries", "taurus", "gemini", "cancer", "leo", "virgo",
    "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
]

SIGN_TRAITS = {
    "aries": "bold initiative and courageous momentum",
    "taurus": "patience, stability, and grounded abundance",
    "gemini": "curiosity, communication, and mental agility",
    "cancer": "intuition, care, and emotional wisdom",
    "leo": "confidence, creativity, and generous leadership",
    "virgo": "discernment, practical care, and precise improvement",
    "libra": "balance, diplomacy, and harmonious connection",
    "scorpio": "depth, transformation, and magnetic focus",
    "sagittarius": "optimism, exploration, and expansive vision",
    "capricorn": "discipline, ambition, and lasting achievement",
    "aquarius": "originality, independence, and future-minded insight",
    "pisces": "imagination, compassion, and spiritual sensitivity",
}

ENERGIES = [
    "grounded", "magnetic", "expansive", "focused", "radiant",
    "intuitive", "restorative", "electric", "harmonious", "courageous",
    "creative", "reflective",
]

COLORS = [
    "deep violet", "celestial blue", "sage green", "solar gold",
    "rose quartz", "midnight indigo", "ember red", "silver moon",
    "ocean teal", "amethyst", "copper", "pearl white",
]

# A curated, static token set keeps consensus deterministic. These are symbolic
# associations for the reading, not live market recommendations.
TOKENS = [
    {
        "symbol": "BTC",
        "name": "Bitcoin",
        "theme": "resilience and foundational strength",
    },
    {
        "symbol": "ETH",
        "name": "Ethereum",
        "theme": "creation and transformation",
    },
    {
        "symbol": "SOL",
        "name": "Solana",
        "theme": "speed and forward movement",
    },
    {
        "symbol": "LINK",
        "name": "Chainlink",
        "theme": "connection and trustworthy signals",
    },
    {
        "symbol": "AVAX",
        "name": "Avalanche",
        "theme": "momentum and adaptable growth",
    },
    {
        "symbol": "DOT",
        "name": "Polkadot",
        "theme": "collaboration and many paths becoming one",
    },
    {
        "symbol": "ATOM",
        "name": "Cosmos",
        "theme": "interconnection and expansive perspective",
    },
    {
        "symbol": "AAVE",
        "name": "Aave",
        "theme": "resourcefulness and fluid opportunity",
    },
    {
        "symbol": "UNI",
        "name": "Uniswap",
        "theme": "exchange, balance, and open possibility",
    },
    {
        "symbol": "ADA",
        "name": "Cardano",
        "theme": "patience and methodical progress",
    },
    {
        "symbol": "XRP",
        "name": "XRP",
        "theme": "movement and clear channels",
    },
    {
        "symbol": "DOGE",
        "name": "Dogecoin",
        "theme": "optimism, community, and playful confidence",
    },
]


def _stable_seed(sign: str, date: str) -> int:
    """Create the same seed on every validator without external randomness."""
    seed = 17
    for character in f"{sign}|{date}":
        seed = ((seed * 131) + ord(character)) % 2_147_483_647
    return seed


def _daily_profile(sign: str, date: str) -> dict:
    seed = _stable_seed(sign, date)
    energy = ENERGIES[seed % len(ENERGIES)]
    color = COLORS[(seed // len(ENERGIES)) % len(COLORS)]
    token = TOKENS[
        (seed // (len(ENERGIES) * len(COLORS))) % len(TOKENS)
    ]

    return {
        "lucky_number": (seed % 99) + 1,
        "lucky_color": color,
        "energy": energy,
        "lucky_token": token["symbol"],
        "lucky_token_name": token["name"],
        "lucky_token_theme": token["theme"],
        "lucky_token_reason": (
            f"{token['name']}'s theme of {token['theme']} resonates with "
            f"today's {energy} {sign.capitalize()} energy."
        ),
    }


def _utc_date() -> str:
    # GenVM pins this clock to the transaction timestamp, so every validator
    # observes exactly the same date.
    return datetime.now(timezone.utc).date().isoformat()


class Horoscope(gl.Contract):
    cache: TreeMap[str, str]
    users: TreeMap[str, str]
    total_readings: u64

    def __init__(self):
        self.cache = TreeMap[str, str]()
        self.users = TreeMap[str, str]()
        self.total_readings = u64(0)

    @gl.public.write.payable
    def read_horoscope(self, sign: str, date: str) -> dict:
        sign = sign.lower().strip()
        date = date.strip()

        if sign not in VALID_SIGNS:
            raise Exception("Invalid sign.")

        today = _utc_date()
        if date != today:
            raise Exception(f"Date must be today's UTC date: {today}")

        sender = str(gl.message.sender_address)
        cache_key = f"{sign}_{date}"

        if sender in self.users:
            user = json.loads(self.users[sender])
        else:
            user = {"last_read": "", "streak": 0, "free_reads": 0}

        sent_value = int(gl.message.value)
        is_paid_read = sent_value == READING_PRICE
        is_free_read = sent_value == 0 and user["free_reads"] > 0

        if not is_paid_read and not is_free_read:
            if sent_value == 0:
                raise Exception("Reading requires exactly 1 GEN")
            raise Exception(
                "Send exactly 1 GEN. Use value 0 only for a free read."
            )

        if is_free_read:
            user["free_reads"] -= 1

        if user["last_read"] != date:
            if user["last_read"] == "":
                user["streak"] = 1
            else:
                try:
                    last_date = datetime.strptime(
                        user["last_read"], "%Y-%m-%d"
                    ).date()
                    current_date = datetime.strptime(date, "%Y-%m-%d").date()
                    day_difference = (current_date - last_date).days
                    if day_difference == 1:
                        user["streak"] += 1
                    elif day_difference > 1:
                        user["streak"] = 1
                except Exception:
                    user["streak"] = 1

            user["last_read"] = date
            if user["streak"] > 0 and user["streak"] % 7 == 0:
                user["free_reads"] += 1

        if cache_key in self.cache:
            entry = json.loads(self.cache[cache_key])
            self.users[sender] = json.dumps(user)
            self.total_readings += u64(1)
            return {
                "sign": sign,
                "date": date,
                "horoscope": entry["horoscope"],
                "lucky_number": entry["lucky_number"],
                "lucky_color": entry["lucky_color"],
                "energy": entry["energy"],
                "lucky_token": entry["lucky_token"],
                "lucky_token_name": entry["lucky_token_name"],
                "lucky_token_reason": entry["lucky_token_reason"],
                "cached": True,
                "streak": user["streak"],
                "free_reads": user["free_reads"],
                "total_readings": int(self.total_readings),
            }

        profile = _daily_profile(sign, date)

        # The input is deterministic and identical on every validator. The
        # leader writes the open-ended horoscope; validators judge it against
        # clear criteria using GenLayer's native non-comparative EP template.
        def get_consensus_input() -> str:
            return json.dumps(
                {
                    "sign": sign.capitalize(),
                    "date": date,
                    "sign_traits": SIGN_TRAITS[sign],
                    "daily_energy": profile["energy"],
                    "guidance": (
                        "Offer reflective, encouraging guidance for the day. "
                        "This is entertainment, not a factual prediction."
                    ),
                },
                sort_keys=True,
            )

        horoscope = gl.eq_principle.prompt_non_comparative(
            get_consensus_input,
            task="""
Write a concise daily horoscope from the supplied context.
Return plain text only: exactly two complete sentences and roughly 30-55 words.
The first sentence should reflect the sign's traits and today's energy.
The second should give gentle, practical guidance for the day.
Do not output JSON, markdown, headings, labels, investment advice, profit
promises, guaranteed events, or claims of supernatural certainty.
""",
            criteria="""
The output must be a coherent daily horoscope grounded in the supplied sign,
date, traits, and energy. It must contain exactly two complete sentences, be
concise and supportive, and include practical guidance. It must be plain text
without JSON or markdown. It must not give financial advice, promise profit,
guarantee future events, or claim supernatural certainty.
""",
        )

        horoscope = str(horoscope).replace("```", "").strip()
        if horoscope == "":
            raise Exception("AI consensus returned an empty horoscope")

        entry = {
            "horoscope": horoscope,
            "lucky_number": profile["lucky_number"],
            "lucky_color": profile["lucky_color"],
            "energy": profile["energy"],
            "lucky_token": profile["lucky_token"],
            "lucky_token_name": profile["lucky_token_name"],
            "lucky_token_reason": profile["lucky_token_reason"],
        }

        # All state changes happen after AI consensus has returned a result.
        self.cache[cache_key] = json.dumps(entry)
        self.users[sender] = json.dumps(user)
        self.total_readings += u64(1)

        return {
            "sign": sign,
            "date": date,
            "horoscope": entry["horoscope"],
            "lucky_number": entry["lucky_number"],
            "lucky_color": entry["lucky_color"],
            "energy": entry["energy"],
            "lucky_token": entry["lucky_token"],
            "lucky_token_name": entry["lucky_token_name"],
            "lucky_token_reason": entry["lucky_token_reason"],
            "cached": False,
            "streak": user["streak"],
            "free_reads": user["free_reads"],
            "total_readings": int(self.total_readings),
        }

    @gl.public.view
    def get_daily_profile(self, sign: str, date: str) -> dict:
        sign = sign.lower().strip()
        date = date.strip()
        if sign not in VALID_SIGNS:
            raise Exception("Invalid sign.")
        profile = _daily_profile(sign, date)
        return {
            "sign": sign,
            "date": date,
            "lucky_number": profile["lucky_number"],
            "lucky_color": profile["lucky_color"],
            "energy": profile["energy"],
            "lucky_token": profile["lucky_token"],
            "lucky_token_name": profile["lucky_token_name"],
            "lucky_token_reason": profile["lucky_token_reason"],
        }

    @gl.public.view
    def get_cached_horoscope(self, sign: str, date: str) -> str:
        sign = sign.lower().strip()
        date = date.strip()
        cache_key = f"{sign}_{date}"
        if cache_key not in self.cache:
            raise Exception("No cached horoscope exists for this sign and date")
        entry = json.loads(self.cache[cache_key])
        return entry["horoscope"]

    @gl.public.view
    def get_cached_reading(self, sign: str, date: str, address: str) -> dict:
        sign = sign.lower().strip()
        date = date.strip()
        cache_key = f"{sign}_{date}"
        if cache_key not in self.cache:
            raise Exception("No cached reading exists for this sign and date")

        entry = json.loads(self.cache[cache_key])
        if address in self.users:
            user = json.loads(self.users[address])
        else:
            user = {"streak": 0, "free_reads": 0}

        return {
            "sign": sign,
            "date": date,
            "horoscope": entry["horoscope"],
            "lucky_number": entry["lucky_number"],
            "lucky_color": entry["lucky_color"],
            "energy": entry["energy"],
            "lucky_token": entry["lucky_token"],
            "lucky_token_name": entry["lucky_token_name"],
            "lucky_token_reason": entry["lucky_token_reason"],
            "cached": True,
            "streak": user["streak"],
            "free_reads": user["free_reads"],
            "total_readings": int(self.total_readings),
        }

    @gl.public.view
    def get_reading_price(self) -> u256:
        return u256(READING_PRICE)

    @gl.public.view
    def get_streak(self, address: str) -> u64:
        if address not in self.users:
            return u64(0)
        user = json.loads(self.users[address])
        return u64(user["streak"])

    @gl.public.view
    def get_free_reads(self, address: str) -> u64:
        if address not in self.users:
            return u64(0)
        user = json.loads(self.users[address])
        return u64(user["free_reads"])

    @gl.public.view
    def get_total_readings(self) -> u64:
        return self.total_readings

    @gl.public.view
    def is_cached(self, sign: str, date: str) -> bool:
        return f"{sign.lower().strip()}_{date.strip()}" in self.cache
