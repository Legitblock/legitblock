# Contributing to LegitBlock Monorepo

Thank you for contributing to the **LegitBlock Monorepo**!

This guide provides instructions for setting up the monorepo workspace, running tests, following code conventions, and submitting pull requests.

---

## 🛠️ Workspace Setup

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` (LTS)
- **pnpm**: `v12.x` or `v9.x`

### Installation
Clone the monorepo and install all dependencies:
```bash
git clone git@github.com:Legitblock/legitblock.git
cd legitblock
pnpm install
```

### Useful Workspace Commands
```bash
# Run all 15 test suites in the core library
pnpm test

# Build all applications in the monorepo
pnpm build:all

# Start Next.js governance web portal
pnpm --filter nextjs-legitblock dev

# Launch Ink terminal CLI
pnpm --filter ink-legitblock start
```

---

## 🧪 Testing & Verification

All 15 test suites in `packages/legitblock-utils/test/` must pass before opening a PR:

```bash
pnpm test
```

### Running Targeted Suites
```bash
pnpm --filter @legitblock/legitblock-utils test:storage
pnpm --filter @legitblock/legitblock-utils test:merkle
pnpm --filter @legitblock/legitblock-utils test:secret-ballot
pnpm --filter @legitblock/legitblock-utils test:proxy
pnpm --filter @legitblock/legitblock-utils test:recusal
pnpm --filter @legitblock/legitblock-utils test:jurisdictions
pnpm --filter @legitblock/legitblock-utils test:pdf
pnpm --filter @legitblock/legitblock-utils test:anchoring
pnpm --filter @legitblock/legitblock-utils test:kms
pnpm --filter @legitblock/legitblock-utils test:webauthn
pnpm --filter @legitblock/legitblock-utils test:covenants
pnpm --filter @legitblock/legitblock-utils test:oidc
pnpm --filter @legitblock/legitblock-utils test:exporter
pnpm --filter @legitblock/legitblock-utils test:workflows
```

---

## 📐 Coding Conventions

1. **Standard ES Modules**: All files in the monorepo use standard ECMAScript modules (`import` / `export` with `.js` extensions).
2. **Minimal Dependencies**: The core utility package `@legitblock/legitblock-utils` maintains strict dependency hygiene, relying on standard Node.js crypto and Web standards wherever possible.
3. **Deterministic Math**: All voting arithmetic, cryptographic leaf pairings, and Merkle tree hashes must be 100% deterministic and platform-agnostic.
4. **Conventional Commits**: Use descriptive commit messages following the Conventional Commits format (`feat:`, `fix:`, `docs:`, `chore:`).

---

## ✅ Pull Request Checklist

Before submitting a Pull Request, ensure:
- [ ] `pnpm test` passes 100% across all 15 test suites.
- [ ] `pnpm --filter nextjs-legitblock build` succeeds with zero errors.
- [ ] `node apps/ink-legitblock/src/cli.js --help` runs cleanly.
- [ ] Documentation in `docs/` or `README.md` is updated for any new feature.
