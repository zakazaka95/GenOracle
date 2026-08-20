# GenOracle

**One canonical daily horoscope, accepted through GenLayer AI-validator consensus.**

[Live Application](https://genoracle.xyz) · [Open Contract in GenLayer Studio](https://studio.genlayer.com/?import-contract=0x790bdED92Aef00B83369561D5aCfd3557F6D946d) · [Accepted Transaction](https://explorer-bradbury.genlayer.com/tx/0x59bc1944ebc72edc73cf8aa2e78793686cc5b774c68bd4e2e86bcd3041d0b28b)

## Overview

GenOracle is an on-chain horoscope application deployed on GenLayer Bradbury Testnet.

For every zodiac sign and UTC date, the Intelligent Contract creates one canonical daily reading. A validator leader proposes the open-ended horoscope, while other validators evaluate it against explicit relevance, format and safety criteria through GenLayer’s non-comparative Equivalence Principle.

Only an accepted result becomes shared on-chain state and is reused for that sign and date.

## The trust problem

A centralized AI service can return different answers to different users, silently change its output or depend entirely on one model provider.

GenOracle replaces that centralized process with a transparent workflow:

1. A user submits a zodiac sign and the current UTC date.
2. Deterministic contract logic produces the daily profile.
3. A validator leader generates a concise daily horoscope.
4. GenLayer validators judge the proposal against contract-defined criteria.
5. Only an accepted result is stored in the contract.
6. Every subsequent user receives the same canonical reading for that sign and date.

The frontend does not generate or decide the horoscope.

## Why GenLayer?

Traditional smart contracts require deterministic, byte-for-byte output. Open-ended natural language cannot satisfy that requirement because multiple differently worded answers may all be valid.

GenLayer’s Equivalence Principle allows decentralized AI validators to agree that a generated result satisfies the same meaning, quality and safety criteria without requiring identical wording.

GenOracle demonstrates:

- open-ended LLM output evaluated by AI validators
- criteria-based non-comparative consensus
- deterministic and non-deterministic logic inside one contract
- shared on-chain state for accepted AI output
- a payable Intelligent Contract interaction
- complete frontend transaction lifecycle handling
- contract-state retrieval after consensus
- daily global caching by zodiac sign and UTC date

## Hybrid consensus design

### Deterministic contract logic

The contract deterministically handles:

- zodiac-sign validation
- current UTC-date validation
- exact payment of 1 GEN
- lucky number
- lucky color
- daily energy
- symbolic token alignment
- daily sign/date cache
- user streaks
- free-reading rewards
- total reading counter

The same sign and date always produce the same deterministic daily profile.

### AI-validator consensus

Only the two-sentence horoscope is open-ended.

The contract asks the validator leader to create the reading. Other validators evaluate whether the proposed result satisfies the contract’s criteria through the non-comparative Equivalence Principle.

The horoscope must:

- contain exactly two complete sentences
- be approximately 30–55 words
- reflect the selected sign and daily energy
- provide gentle and practical guidance
- return plain text without JSON or Markdown
- avoid financial and investment advice
- avoid profit promises
- avoid guaranteed future events
- avoid claims of supernatural certainty

Contract state is updated only after the AI consensus operation returns an accepted result.

## Architecture

```text
User
  │
  │ Selects sign, connects wallet and pays 1 GEN
  ▼
GenOracle frontend
  │
  │ Calls read_horoscope(sign, UTC date)
  ▼
GenLayer Intelligent Contract
  │
  ├── Validates sign, date and payment
  ├── Creates deterministic daily profile
  ├── Checks the global sign/date cache
  └── Requests AI-validator consensus when no cache exists
        │
        ▼
  Leader proposes horoscope
        │
        ▼
  Validators judge it against explicit criteria
        │
        ▼
  Accepted result stored as shared on-chain state
        │
        ▼
Frontend reads get_cached_reading(...)
        │
        ▼
Canonical daily reading displayed to the user
```

## Deployed Intelligent Contract

| Property | Value |
|---|---|
| Network | GenLayer Bradbury Testnet |
| Chain ID | `4221` / `0x107D` |
| Contract address | `0x790bdED92Aef00B83369561D5aCfd3557F6D946d` |
| Reading price | `1 GEN` |
| Consensus method | Non-Comparative Equivalence Principle |
| Contract language | Python |
| Frontend language | TypeScript |
| Application | [genoracle.xyz](https://genoracle.xyz) |

[Open the deployed contract in GenLayer Studio](https://studio.genlayer.com/?import-contract=0x790bdED92Aef00B83369561D5aCfd3557F6D946d)

## Contract methods

### Write method

#### `read_horoscope(sign, date)`

This payable method:

1. Validates the zodiac sign.
2. Requires the current UTC date.
3. Accepts exactly 1 GEN for a paid reading or zero for an available free reading.
4. Updates the user’s streak and free-reading rewards.
5. Returns the existing canonical reading if it is already cached.
6. Otherwise triggers AI-validator consensus.
7. Stores the accepted horoscope as shared state.
8. Returns the complete reading object.

### Read methods

#### `get_cached_reading(sign, date, address)`

Returns the complete accepted reading, including:

- horoscope
- lucky number
- lucky color
- energy
- symbolic token
- token explanation
- streak
- free reads
- total readings

#### `get_cached_horoscope(sign, date)`

Returns only the accepted horoscope text.

#### `get_daily_profile(sign, date)`

Returns the deterministic daily profile without triggering a paid transaction.

#### `get_reading_price()`

Returns the exact reading price in wei.

#### `get_streak(address)`

Returns the user’s current daily streak.

#### `get_free_reads(address)`

Returns the number of available free readings.

#### `get_total_readings()`

Returns the total number of completed contract readings.

#### `is_cached(sign, date)`

Checks whether a canonical reading already exists for the supplied sign and date.

The complete Intelligent Contract source is available in [`contracts/Horoscope.py`](contracts/Horoscope.py).

## Application flow

1. Select one of the twelve zodiac signs.
2. Connect an EIP-1193-compatible wallet.
3. Switch to GenLayer Bradbury Testnet.
4. Submit `read_horoscope` with exactly 1 GEN.
5. Follow the transaction while GenLayer validators reach consensus.
6. Wait for the transaction to reach `ACCEPTED`.
7. Retrieve the accepted state through `get_cached_reading`.
8. Display the canonical horoscope and deterministic daily profile.
9. Open the accepted transaction in Bradbury Explorer.

The frontend does not depend on a decoded return value inside the write receipt. After consensus is accepted, it retrieves the complete result directly from contract state.

## Canonical daily cache

The cache key combines:

```text
zodiac sign + UTC date
```

The first successful request for a sign and date creates the canonical horoscope through validator consensus.

Later requests for the same sign and date reuse the previously accepted reading. This ensures that users receive the same shared daily result instead of unrelated answers generated by a centralized service.

## Streaks and free readings

The contract tracks activity separately for every wallet:

- the first reading starts a one-day streak
- consecutive UTC dates increase the streak
- missed days reset the streak
- every seven-day streak awards one free reading
- a free reading uses zero transaction value
- paid readings require exactly 1 GEN

These rules are deterministic and enforced by the Intelligent Contract.

## Network configuration

```text
Network: GenLayer Bradbury Testnet
Chain ID: 4221
Hex Chain ID: 0x107D
Currency: GEN
RPC: https://rpc.testnet-chain.genlayer.com
Explorer: https://explorer-bradbury.genlayer.com
```

## Run locally

### Requirements

- Node.js
- npm
- an EIP-1193-compatible wallet such as MetaMask
- Bradbury Testnet GEN

### Installation

```bash
git clone https://github.com/zakazaka95/GenOracle.git
cd GenOracle
npm install
npm run dev
```

Open the local development URL shown in the terminal.

## Evidence

- [Live GenOracle application](https://genoracle.xyz)
- [Open deployed contract in GenLayer Studio](https://studio.genlayer.com/?import-contract=0x790bdED92Aef00B83369561D5aCfd3557F6D946d)
- [Successful 1 GEN consensus transaction](https://explorer-bradbury.genlayer.com/tx/0x59bc1944ebc72edc73cf8aa2e78793686cc5b774c68bd4e2e86bcd3041d0b28b)
- Contract address: `0x790bdED92Aef00B83369561D5aCfd3557F6D946d`
- Transaction ID: `0x59bc1944ebc72edc73cf8aa2e78793686cc5b774c68bd4e2e86bcd3041d0b28b`
- Transaction value: `1 GEN`
- Consensus status: `ACCEPTED`

## Safety

GenOracle is a symbolic entertainment experience.

Horoscope content and token alignment are not:

- factual predictions
- financial advice
- investment recommendations
- guarantees of future events
- promises of profit

The Intelligent Contract explicitly requires validators to reject output that violates these criteria.

## Technology

- GenLayer Intelligent Contracts
- GenLayer Bradbury Testnet
- Python
- GenLayerJS
- TypeScript
- React
- Vite
- EIP-1193 wallet integration

## Author

Created by [Zaksans](https://x.com/ZaksansPG).

Built on GenLayer Bradbury Testnet.
