# GenOracle Architecture Constitution

## ADR-001: GenLayer is the source of truth

The frontend must obtain horoscope readings from the deployed GenLayer Intelligent Contract. It must not generate, replace, or silently rewrite a contract result using a browser model, backend model, or static fallback.

Pending, failed, and validated readings must be clearly distinguished.

## ADR-002: Transactions stay on GenLayer Bradbury

Production transactions must use the configured GenLayer Bradbury chain ID, RPC endpoint, explorer, and deployed Intelligent Contract address.

Network and contract values must come from one shared configuration. The application must never silently fall back to another EVM network.

## ADR-003: Standard wallet connection and verified execution

Wallet connection must use standard EIP-1193 methods. The normal connection flow must not require MetaMask Snaps or call `wallet_getSnaps`.

An `ACCEPTED` consensus status alone is not sufficient. The interface may display a validated reading only after a successful execution return is decoded or the expected result is retrieved from accepted contract state.

Execution errors and missing return values must be shown as errors, not successful readings.
