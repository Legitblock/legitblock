# Core Library Module Reference (`@legitblock/legitblock-utils`)

`@legitblock/legitblock-utils` is the foundational SDK powering LegitBlock's blockchain state machine, governance engines, document lifecycle, and cryptographic verifications.

---

## 📦 Module Structure Overview

```
packages/legitblock-utils/src/
├── blockchain/         # Blockchain data structures, block hashing & validation
├── crypto/             # Merkle legal trees & public timestamp anchoring
├── documents/          # Document models, semantic diffing, covenants & exporters
├── voting/             # Proposal lifecycle, voting rules, recusal, secret ballots & proxies
├── compliance/         # Multi-jurisdictional statutory rulesets
├── templates/          # Pre-configured corporate governance document templates
├── auth/               # LDAP, WebAuthn passkeys, OIDC federation & Cloud KMS
└── storage/            # Pluggable persistence layer (Memory, File, IndexedDB)
```

---

## 1. Blockchain Core (`src/blockchain/`)

### `Block` (`src/blockchain/block.js`)
Represents an individual immutable block on the ledger.
- `constructor(index, timestamp, previousHash, data, validator, signature)`
- `calculateHash()`: Computes deterministic SHA-256 hash over canonical JSON representation.
- `hasValidHash()`: Validates that block contents match its declared hash.

### `Blockchain` (`src/blockchain/blockchain.js`)
Manages the linear sequence of blocks and cryptographic chain validation.
- `createGenesisBlock(genesisData)`: Initializes the ledger with founding parameters.
- `getLatestBlock()`: Returns the current chain tip.
- `addBlock(data, validator, signature)`: Validates and appends a new block.
- `isChainValid()`: Traverses the entire chain, confirming hash continuity and block integrity.

### `crypto.js` (`src/blockchain/crypto.js`)
- `sha256(data)`: Computes SHA-256 hexadecimal digest.
- `hashObject(obj)`: Hashes an object after sorting keys lexicographically.
- `stringifyCanonical(obj)`: Deterministic JSON serialization.
- `generateMemberKeyPair()`: Generates Ed25519 / ECDSA keypairs for member identity.
- `signData(data, privateKey)` / `verifySignature(data, signature, publicKey)`: Cryptographic signature routines.

---

## 2. Advanced Cryptography (`src/crypto/`)

### `MerkleLegalTree` (`src/crypto/merkle.js`)
Deconstructs legal documents into clause leaves and synthesizes balanced binary Merkle trees.
- `constructor(clauses)`: Builds the tree from array of `{ id, content }` objects.
- `getRootHash()`: Returns 64-character hexadecimal Merkle root.
- `getProof(clauseId)`: Computes the audit path (sibling hashes and positions) for a given clause.
- `static verifyProof(clauseContent, proof, rootHash)`: Cryptographically confirms inclusion without the full document.
- `static fromMarkdown(markdownText)`: Automatically parses Markdown headers into discrete clause leaves.
- `exportAuditPacket(clauseId)`: Generates complete verifiable audit package.

### `ChainAnchorService` (`src/crypto/anchoring.js`)
Anchors internal block hashes to public trust roots.
- `OpenTimestampsAdapter`: Submits hashes to Bitcoin calendar servers.
- `Rfc3161TimestampAdapter`: Submits hashes to standard RFC 3161 Timestamp Authorities (TSA), validating returned X.509 cryptographic signatures.
- `AnchorReceipt`: Encapsulates proof tokens, timestamps, and authority signatures.

---

## 3. Documents & Exporters (`src/documents/`)

### `Document` (`src/documents/document.js`)
- Manages organizational documents (charters, bylaws, minutes).
- Tracks revision history, statuses (`DRAFT`, `PROPOSED`, `RATIFIED`, `SUPERSEDED`), and authors.

### `diff.js` (`src/documents/diff.js`)
- `computeStructuredDiff(oldText, newText)`: Returns array of additions, deletions, and unchanged lines.
- `computeUnifiedDiff(oldText, newText, filename)`: Standard unified diff format.
- `formatDiffTerminal(diff)`: Color-coded terminal output using Chalk.

### `LegalPacketExporter` (`src/documents/exporter.js`)
- `exportMarkdownPacket(blockchain, documents)`: Fulfills DGCL § 224 court conversion requirement in human-readable Markdown.
- `exportJsonPacket(blockchain, documents)`: Machine-readable historical audit packet.
- `exportPdfPacket(blockchain, documents)`: Compiles standalone ISO 19005-3 compliant PDF/A-3 document with embedded JSON catalog and cross-reference table.

### `CovenantEngine` (`src/documents/covenants.js`)
- Evaluates smart legal covenants (e.g., budget caps, supermajority requirements) before proposal execution.

---

## 4. Governance & Voting (`src/voting/`)

### `Proposal` (`src/voting/proposal.js`)
- Encapsulates governance proposals (`AMEND_DOCUMENT`, `CREATE_DOCUMENT`, `OFFICER_ELECTION`, `TREASURY_TRANSFER`).
- Tracks lifecycle: `DRAFT` $\to$ `ACTIVE` $\to$ `PASSED` / `REJECTED` $\to$ `EXECUTED`.

### `VotingEngine` (`src/voting/engine.js`)
- Manages proposal voting sessions, tallies ballots, and triggers execution.
- Integrates with `RecusalEngine`, `ProxyEngine`, and `SecretBallotEngine`.

### `RecusalEngine` (`src/voting/recusal.js`)
- Implements DGCL § 144 conflict-of-interest recusal.
- Removes interested members from the quorum denominator and logs formal recusal records.

### `ProxyEngine` (`src/voting/proxy.js`)
- Implements DGCL § 212 delegated proxy appointments.
- Validates cryptographic proxy grants, detects circular delegations, and routes proxy voting power.

### `SecretBallotEngine` (`src/voting/secret-ballot.js`)
- Implements verifiable secret voting using homomorphic Pedersen commitments ($C = g^v \cdot h^r \pmod p$).
- Aggregates blinded commitments homomorphically and discovers the affirmative tally without opening individual ballots.

---

## 5. Compliance & Statutory Rules (`src/compliance/`)

### `JurisdictionValidator` (`src/compliance/jurisdictions.js`)
Validates proposals against statutory legal rulesets:
- `DELAWARE_CORP`: DGCL § 216 quorum rules, § 144 disinterested majority, § 212 proxy validity.
- `CALIFORNIA_WORKER_COOP`: AB 816 equal vote mandate (*one-worker-one-vote* regardless of shareholding).
- `WYOMING_DUNA`: W.S. 17-31 statutory non-profit asset lock and algorithmic governance.
- `UK_COMPANIES_ACT`: Section 283 Special Resolution 75% threshold.

---

## 6. Authentication & Identity (`src/auth/`)

- `LDAPAuthProvider` (`src/auth/ldap.js`): Enterprise LDAP / Active Directory user authentication and role mapping.
- `WebAuthn` (`src/auth/webauthn.js`): Biometric hardware passkey voting assertions.
- `OIDCAuthProvider` (`src/auth/oidc.js`): Enterprise OIDC JWT identity federation.
- `KmsProvider` (`src/auth/kms.js`): Hardware Security Module (HSM) signing via AWS KMS, GCP KMS, or Azure Key Vault.

---

## 7. Storage Layer (`src/storage/`)

- `LegitBlockStore` (`src/storage/store.js`): High-level repository interface for blocks, documents, and proposals.
- `MemoryStorageAdapter`: Fast in-memory persistence for testing.
- `FileStorageAdapter`: JSON file-backed persistence for local CLI and server runtime.
- `IndexedDBStorageAdapter`: Browser IndexedDB adapter for client-side web applications.
