# Cosmic Compass

Build a premium onchain horoscope app called **GenOracle**. Connected to a real GenLayer intelligent contract on Bradbury Testnet.

**Install:** `npm install genlayer-js viem`

**Contract:**
```
Address: 0x90686cb029FEb48aCa3CBB0b4f87f284F13238F3
Chain ID: 4221 (0x107D)
RPC: https://rpc.testnet-chain.genlayer.com
Network name: GenLayer Bradbury Testnet
Currency: GEN
Explorer: https://explorer-bradbury.genlayer.com
```

**Wallet flow — exactly in this order on button click:**
```typescript
// 1. Connect
const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
const address = accounts[0];

// 2. Switch network
try {
  await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0x107D' }],
  });
} catch (err: any) {
  if (err.code === 4902 || err.code === -32603) {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x107D',
        chainName: 'GenLayer Bradbury Testnet',
        nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
        rpcUrls: ['https://rpc.testnet-chain.genlayer.com'],
        blockExplorerUrls: ['https://explorer-bradbury.genlayer.com'],
      }],
    });
  }
}

// 3. Check balance
const balance = await window.ethereum.request({
  method: 'eth_getBalance',
  params: [address, 'latest'],
});
const hasEnough = BigInt(balance) >= BigInt('50000000000000000');
```

If balance insufficient show faucet prompt: go to `https://studio.genlayer.com`, connect wallet, use faucet in top right. Button: "Open GenLayer Studio →". Secondary: "I have GEN now" re-checks balance.

**Contract call:**
```typescript
import { createClient } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';
import { TransactionStatus } from 'genlayer-js/types';

// @ts-ignore
BigInt.prototype.toJSON = function() { return this.toString(); };

const client = createClient({
  chain: testnetBradbury,
  account: address as `0x${string}`,
});

const today = new Date().toISOString().split('T')[0]; // "2026-05-01"

const txHash = await client.writeContract({
  address: '0x90686cb029FEb48aCa3CBB0b4f87f284F13238F3' as `0x${string}`,
  functionName: 'read_horoscope',
  args: [selectedSign, today],
  value: BigInt('50000000000000000'),
});

const receipt = await client.waitForTransactionReceipt({
  hash: txHash,
  status: TransactionStatus.FINALIZED,
  retries: 120,
  interval: 5000,
});
```

**Parse result from receipt:**
```typescript
const parseReadable = (readable: string) => {
  const fixed = readable
    .replace(/(\d)"(?=[a-zA-Z])/g, '$1,"')
    .replace(/"(\s*)"(?=[a-zA-Z])/g, '","')
    .replace(/}(\s*)"(?=[a-zA-Z])/g, '},"')
    .replace(/true"(?=[a-zA-Z])/g, 'true,"')
    .replace(/false"(?=[a-zA-Z])/g, 'false,"');
  return JSON.parse(fixed);
};

const leaderReceipt = receipt?.consensus_data?.leader_receipt?.[0];
const readable = leaderReceipt?.result?.payload?.readable;
const result = parseReadable(readable);
```

Result shape:
```typescript
{
  sign: string
  date: string
  horoscope: string
  lucky_number: number
  lucky_color: string
  energy: string
  lucky_token: string
  lucky_token_name: string
  lucky_token_reason: string
  cached: boolean
  streak: number
  free_reads: number
}
```

**App states:**
1. `idle` — sign selection + connect wallet button
2. `connected` — sign selected, wallet connected, "Read My Stars · 0.05 GEN" button
3. `loading` — transaction sent, waiting for validators
4. `revealed` — reading displayed

**Design — make it feel like the most premium astrology app ever made crossed with a Web3 terminal from the future.**

Dark deep space aesthetic. Stars, nebulas, celestial motion in the background. Each of the 12 zodiac signs has its own distinct color identity and personality — not just different colors but different feels. The sign selection should be a spatial, visual experience — constellation map, circular zodiac wheel, or something equally stunning. Not a dropdown. Not plain buttons.

The waiting/loading state should feel like the cosmos is literally computing your destiny. AI validators from across the network reaching consensus on what the stars say about you. Make it dramatic, immersive, worth the 5 minute wait.

The result display — the horoscope text is the hero. Lucky number, lucky color, energy word as beautiful side elements. The lucky token gets special treatment — feels like a cosmic market signal, show the symbol large and proud with the reason below. If `cached: false` show a special badge: "First soul to receive this reading today." Streak counter feels like a sacred achievement — "7 day streak" should feel meaningful. Free reads remaining shown as a small reward indicator.

Each zodiac sign should transform the entire app when selected — the color palette, the background energy, the feel of the UI shifts to match that sign's personality.

**Share button** on result card:
```typescript
const text = `The cosmos spoke through @GenLayer AI validators and told me:\n\n"${result.horoscope}"\n\nLucky token today: ${result.lucky_token} ✦\n\nRead yours 👇\nhttps://genoracle.xyz`;
window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
```

Label: "Share Your Reading ✦"

**Made by credit** at very bottom of result card: "Made by Zaksans" linking to `https://x.com/ZaksansPG` — small, muted, elegant.

Listen for chain changes — if user switches away from Bradbury show warning and disable the read button.

No demo mode. Real wallet. Real chain. Real cosmos.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ba994b59-d0cd-40f0-b67b-ff21c30f38a6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
