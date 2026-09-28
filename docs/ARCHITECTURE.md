# LegitBlock Monorepo Technical Architecture

This document details the architectural design, system topology, data structures, and cryptographic state machine implemented across the LegitBlock monorepo.

---

## 1. Monorepo Topology & Workspace Structure

LegitBlock is organized as a high-performance pnpm monorepo:

```
legitblock/
├── packages/
│   └── legitblock-utils/       # Reusable core library (@legitblock/legitblock-utils)
└── apps/
    ├── nextjs-legitblock/      # Web portal & API service (Next.js 14 App Router)
    └── ink-legitblock/         # Interactive Terminal UI (TUI) client (React Ink)
```

### Dependency Graph
- `@legitblock/legitblock-utils` has zero internal workspace dependencies and serves as the single source of truth for all business logic, cryptography, governance math, and storage.
- `apps/nextjs-legitblock` depends on `@legitblock/legitblock-utils` via `workspace:*`.
- `apps/ink-legitblock` depends on `@legitblock/legitblock-utils` via `workspace:*` for local diff formatting and validation, while communicating with the Next.js API server over HTTP.

---

## 2. Core Blockchain & State Machine Architecture

### 2.1. Block Data Structure
Every block in the LegitBlock ledger encapsulates an immutable snapshot of organizational actions:

```javascript
{
  index: 4,
  timestamp: "2026-09-28T12:00:00.000Z",
  previousHash: "a1b2c3d4...",
  hash: "e5f6g7h8...",
  data: {
    type: "PROPOSAL_EXECUTION",
    proposalId: "prop-amend-bylaws-2026",
    action: "AMEND_DOCUMENT",
    documentId: "doc-bylaws",
    documentHash: "9f8e7d6c...",
    executedBy: "director-alice",
    merkleRoot: "c3c36cf9..."
  },
  validator: "0x1234...abcd",
  signature: "3045022100..."
}
```

### 2.2. Block Hash Computation
Block headers are hashed deterministically using SHA-256 over a canonical JSON serialization:
$$\text{Block Hash} = \text{SHA-256}\left(\text{CanonicalJSON}\left(\{\text{index}, \text{timestamp}, \text{previousHash}, \text{data}\}\right)\right)$$

### 2.3. State Transition Model
The blockchain enforces strict invariant transitions:
1. **Genesis Initialization**: A genesis block anchors initial organizational templates, charter documents, and founding members.
2. **Proposal Submission**: Proposes document creation, amendment, or governance action.
3. **Ballot Casting**: Members cast cryptographically signed ballots (Ed25519, WebAuthn passkey, or Pedersen commitments).
4. **Execution & Sealing**: Upon meeting voting rule thresholds (quorum and approval criteria), the proposal is executed and sealed into a new block.

---

## 3. Cryptographic Subsystems

### 3.1. Section-Level Merkle Legal Trees (`MerkleLegalTree`)
Documents are parsed into semantic clauses and indexed into a balanced binary Merkle tree:
- **Leaf Hash**: `SHA-256(clause.id + ":" + clause.content)`
- **Inclusion Proofs**: Allows proving that a specific clause (e.g., *Article IV: Indemnification*) belongs to an authenticated charter without disclosing confidential financial terms.

### 3.2. Verifiable Secret Ballots (`SecretBallotEngine`)
Uses **Homomorphic Pedersen Commitments** over a large prime field:
- **Commitment**: $C_i = g^{v_i} \cdot h^{r_i} \pmod p$
  - $v_i \in \{0, 1\}$ represents the vote (NO = 0, YES = 1).
  - $r_i$ is a cryptographically secure 256-bit blinding factor.
- **Homomorphic Tally Aggregation**:
  $$C_{\text{total}} = \prod_{i=1}^n C_i = g^{\sum v_i} \cdot h^{\sum r_i} \pmod p$$
- **Verification**: Tally opening discloses $\sum v_i$ and $\sum r_i$ without ever revealing individual voter choices.

### 3.3. Public Checkpoint Anchoring (`ChainAnchorService`)
Internal enterprise consortium blocks can be anchored to public trust infrastructure:
- **OpenTimestamps**: Derives Bitcoin block calendar attestations.
- **RFC 3161 TSA**: Submits SHA-256 block hashes to standard cryptographic Timestamp Authorities, obtaining X.509 signed timestamps for courtroom admissibility.

---

## 4. Governance & Statutory Compliance Engine

### 4.1. Conflict-of-Interest & Recusal (`RecusalEngine`)
Codifies Delaware General Corporation Law (DGCL § 144):
- Detects interested transactions (e.g., leases, mergers, officer compensation).
- Automatically removes interested directors from the quorum denominator:
  $$\text{Disinterested Quorum} = \frac{\text{Disinterested Present}}{\text{Total Disinterested Members}}$$
- Emits a non-repudiable statutory compliance receipt.

### 4.2. Delegated Proxy Voting (`ProxyEngine`)
Codifies DGCL § 212:
- Supports scope-restricted delegation (e.g., proxy valid only for *Budget* proposals).
- Graph cycle detection prevents circular delegations (e.g., $A \to B \to C \to A$).
- Automatically routes and aggregates effective voting weight.

---

## 5. Applications Architecture

### 5.1. Next.js Web Portal (`apps/nextjs-legitblock`)
- **Next.js 14 App Router**: Hybrid architecture with server-rendered management pages and client-side interactive widgets.
- **Real-Time SSE Ledger Stream (`/api/ledger/stream`)**: Server-Sent Events push block creations and proposal status updates to connected clients in real time.
- **RESTful Governance API**: Comprehensive API endpoints for authentication, proposals, voting, execution, and document history diffs.

### 5.2. Ink Terminal Client (`apps/ink-legitblock`)
- **Interactive Terminal UI**: Built with React Ink, providing rich CLI components (spinners, selectors, text inputs).
- **External Editor Integration**: Spawns the user's preferred `$EDITOR` (nano, vim, code) to draft and edit legal documents locally with full syntax support.
