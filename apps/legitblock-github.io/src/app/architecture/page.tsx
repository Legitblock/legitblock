import React from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { CodeBlock } from "@/components/CodeBlock";
import { 
  Layers, 
  Cpu, 
  Database, 
  Terminal, 
  Globe, 
  ShieldCheck, 
  GitBranch, 
  FileCode,
  ArrowRight
} from "lucide-react";

export default function ArchitecturePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex gap-10">
        <Sidebar />

        <article className="flex-1 max-w-4xl min-w-0 space-y-12">
          {/* Title */}
          <div className="border-b border-slate-200 pb-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-300">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>System Design &amp; Data Flow</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              LegitBlock Architecture &amp; Monorepo Design
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              How the core blockchain engine, Next.js web application, and Ink CLI terminal client seamlessly synchronize corporate state with cryptographic guarantees.
            </p>
          </div>

          {/* Monorepo Structure */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-emerald-600" />
              1. Monorepo Organization
            </h2>
            <p className="text-slate-700 text-sm leading-relaxed">
              LegitBlock is structured as a high-performance pnpm workspace separating headless cryptographic primitives from web and terminal user interfaces:
            </p>

            <CodeBlock
              language="text"
              title="Repository Directory Tree"
              code={`legitblock/
├── packages/
│   └── legitblock-utils/         # Core JS headless library
│       ├── src/
│       │   ├── blockchain/       # Block, Blockchain, SHA-256, PoW, Ed25519
│       │   ├── documents/        # Document class & structured DiffEngine
│       │   ├── voting/           # VotingEngine, Proposal, 5 Quorum Rules
│       │   ├── templates/        # 32 Organization templates (For-Profit, Non-Profit, Co-op)
│       │   ├── auth/             # LDAPAuthProvider, Mock LDAP directory, JWT
│       │   └── storage/          # LegitBlockStore file persistence with mtime sync
│       └── test/                 # 14 comprehensive test suites (100% pass)
│
├── apps/
│   ├── nextjs-legitblock/        # Next.js 14 App Router web portal (17 API routes)
│   ├── ink-legitblock/           # React Ink terminal CLI with $EDITOR integration
│   └── legitblock-github.io/     # Static GitHub Pages documentation website`}
            />
          </section>

          {/* Amendment Lifecycle Diagram */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-600" />
              2. Document Amendment &amp; Ratification Lifecycle
            </h2>
            <p className="text-slate-700 text-sm leading-relaxed">
              Every document transition on LegitBlock follows a deterministic 6-phase state machine that guarantees only quorum-approved diffs are committed to the chain:
            </p>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-mono text-slate-400 font-bold">STAGE 1</div>
                  <div className="font-bold text-sm text-slate-900">Local Edit</div>
                  <p className="text-xs text-slate-500 mt-1">User edits document via Web UI or Terminal <code className="text-emerald-700">$EDITOR</code>.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-mono text-slate-400 font-bold">STAGE 2</div>
                  <div className="font-bold text-sm text-slate-900">Diff Generation</div>
                  <p className="text-xs text-slate-500 mt-1"><code className="text-slate-800">DiffEngine</code> computes unified diff and structured line delta.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-mono text-slate-400 font-bold">STAGE 3</div>
                  <div className="font-bold text-sm text-slate-900">On-Chain Proposal</div>
                  <p className="text-xs text-slate-500 mt-1">Proposal assigned ID, voting deadline, and statutory quorum rule.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-mono text-slate-400 font-bold">STAGE 4</div>
                  <div className="font-bold text-sm text-slate-900">Ballot Casting</div>
                  <p className="text-xs text-slate-500 mt-1">Members vote YES/NO with LDAP or Ed25519 digital signatures.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-mono text-slate-400 font-bold">STAGE 5</div>
                  <div className="font-bold text-sm text-slate-900">Quorum Evaluation</div>
                  <p className="text-xs text-slate-500 mt-1"><code className="text-slate-800">VotingEngine</code> computes affirmative % against active membership.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-mono text-emerald-600 font-bold">STAGE 6</div>
                  <div className="font-bold text-sm text-emerald-900">Block Mined</div>
                  <p className="text-xs text-slate-500 mt-1">Proof-of-work block mined, new document version active, chain updated.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Cryptographic Standards */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              3. Cryptographic Specification
            </h2>
            <p className="text-slate-700 text-sm leading-relaxed">
              LegitBlock uses open standard cryptographic algorithms implemented via native Node.js crypto:
            </p>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <strong className="text-slate-900">Deterministic Object Hashing:</strong> JSON serialization can vary depending on key order. LegitBlock implements <code className="text-emerald-700 font-mono">stringifyCanonical()</code> to recursively sort object keys, guaranteeing byte-identical hashes across disparate platforms and architectures.
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <strong className="text-slate-900">Proof-of-Work (PoW):</strong> A lightweight difficulty nonce requirement ensures blocks require intentional computation to append, preventing denial-of-service spam and accidental chain splits.
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <strong className="text-slate-900">Ed25519 Digital Signatures:</strong> Each member can generate an Ed25519 public/private keypair. Votes and proposals can be signed off-chain and mathematically validated on-chain without exposing private keys.
              </div>
            </div>
          </section>

          {/* Multi-Process Storage Engine */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              4. Storage &amp; Multi-Process Synchronization
            </h2>
            <p className="text-slate-700 text-sm leading-relaxed">
              The Next.js web application and the Ink CLI terminal client frequently run concurrently. The <code className="text-slate-900 font-mono">LegitBlockStore</code> class implements an intelligent file-based JSON persistence engine:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
              <li>Monitors file modification timestamps (<code className="text-slate-800 font-mono">mtimeMs</code>) before reading or writing.</li>
              <li>Re-synchronizes in-memory state automatically when another process mines a block or registers a ballot.</li>
              <li>Supports zero-configuration local deployment with zero external database dependencies.</li>
            </ul>
          </section>

          {/* Navigation link */}
          <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-sm font-semibold">
            <Link href="/why-blockchain" className="text-slate-500 hover:text-slate-800">
              ← Why Blockchain?
            </Link>
            <Link href="/core-library" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              Core Library API Guide →
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
