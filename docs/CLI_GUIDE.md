# LegitBlock Ink CLI User Guide

`ink-legitblock` is an interactive Terminal User Interface (TUI) client for the LegitBlock corporate governance blockchain, built with [Ink](https://github.com/vadimdemedes/ink) (React for command-line interfaces).

---

## 🚀 Getting Started

### Launching the CLI
From the root of the repository, execute:
```bash
node apps/ink-legitblock/src/cli.js
```

Or via pnpm:
```bash
pnpm --filter ink-legitblock start
```

### CLI Command Options
```text
Usage:
  legitblock-cli [options]

Options:
  --url <url>    Next.js API server base URL (default: http://localhost:3000)
  --help, -h     Show this help message
```

Example connecting to a remote governance API:
```bash
node apps/ink-legitblock/src/cli.js --url https://governance.internal.corp
```

---

## 💻 Features & Workflows

### 1. Enterprise Authentication
Upon launching the CLI, select **Login** to authenticate via LDAP / Active Directory credentials:
- Enter your organizational username and password.
- The client receives a signed JWT token and stores the active session in memory.
- Pre-configured test accounts include:
  - `alice` (Director / Board Member)
  - `bob` (Executive Officer)
  - `charlie` (Shareholder)

### 2. Document Browsing & Diff Review
Navigate to **Browse Documents**:
- Use the arrow keys (`↑` / `↓`) to scroll through existing organizational charters, bylaws, and minutes.
- Select a document to inspect its status, revision count, and latest cryptographic hash.
- Select **View Revision History** to inspect chronological diffs with green additions and red deletions.

### 3. Proposing Amendments with `$EDITOR`
- When viewing a document, select **Propose Amendment**.
- The CLI automatically writes the current document content to a secure temporary file and launches your system's preferred editor (`$EDITOR` or `$VISUAL`, defaulting to `nano` or `vim`).
- Make your proposed legal modifications, save, and exit the editor.
- The CLI computes a structured semantic diff, calculates new clause hashes, and prompts you to enter a proposal title and rationale.
- The amendment proposal is submitted to the blockchain governance state machine.

### 4. Democratic Ballot Casting
Navigate to **Active Proposals**:
- Select an open proposal to inspect the proposed changes, required quorum, and current vote counts.
- Choose your ballot decision:
  - `[APPROVE]`
  - `[REJECT]`
  - `[ABSTAIN]`
- The CLI signs the ballot with your member private key or WebAuthn assertion and submits it to the ledger.

### 5. Executing Proposals & Sealing Blocks
- When an active proposal achieves the statutory quorum and approval threshold, an **[EXECUTE PROPOSAL]** option becomes available.
- Executing the proposal updates the document to its new ratified state and seals a new immutable block onto the blockchain.

### 6. Chain Inspection & Integrity Validation
Navigate to **Blockchain Explorer**:
- Inspect the block height, total blocks, and recent transactions.
- Select **Verify Chain Integrity**: Audits all cryptographic hashes from the Genesis block to the tip, verifying that every `previousHash` matches and all validator signatures are valid.
