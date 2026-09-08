import React from "react";
import Link from "next/link";
import { Sidebar } from "../../components/Sidebar";
import { CodeBlock } from "../../components/CodeBlock";
import { 
  Globe, 
  Sparkles, 
  FileText, 
  Vote, 
  Layers, 
  ShieldCheck, 
  Users, 
  CheckCircle2,
  ArrowRight
} from "lucide-react";

export default function WebAppPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex gap-10">
        <Sidebar />

        <article className="flex-1 max-w-4xl min-w-0 space-y-12">
          {/* Title */}
          <div className="border-b border-slate-200 pb-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold border border-blue-300">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>Application Guide</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              apps/nextjs-legitblock Web Application
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              A comprehensive Next.js 14 web portal featuring a guided genesis setup wizard, document versioning, live voting portal, blockchain explorer, and LDAP authentication.
            </p>
          </div>

          {/* Quick Start Running */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Running the Web Application</h2>
            <CodeBlock
              language="bash"
              title="Terminal"
              code={`# From the monorepo root:
pnpm --filter nextjs-legitblock dev

# The app will start on http://localhost:3000`}
            />
            <p className="text-xs text-slate-500">
              Default login credentials are provided in the UI for test users: <code className="text-slate-800 font-mono">alice.chair</code> (password: <code className="text-slate-800 font-mono">password123</code>).
            </p>
          </section>

          {/* Feature 1: Guided Genesis Setup Wizard */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              1. Guided Genesis Setup Wizard (/setup)
            </h2>
            <p className="text-slate-700 text-sm leading-relaxed">
              When starting an organization, the setup wizard guides founders through initial governance configuration:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <span className="font-bold text-sm text-slate-900 block mb-1">Step 1: Entity Template</span>
                <p className="text-xs text-slate-600">Choose from 32 templates (C-Corp, S-Corp, Worker Co-op, 501(c)(3), etc.) which pre-load authentic legal charter documents.</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <span className="font-bold text-sm text-slate-900 block mb-1">Step 2: Legal Parameters</span>
                <p className="text-xs text-slate-600">Specify organization legal name, jurisdiction (e.g. Delaware, Wyoming), and initial board directors.</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <span className="font-bold text-sm text-slate-900 block mb-1">Step 3: Charter Ratification</span>
                <p className="text-xs text-slate-600">Founders cast initial votes to ratify Articles of Incorporation, Bylaws, and Board Consents.</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <span className="font-bold text-sm text-slate-900 block mb-1">Step 4: Blockchain Genesis</span>
                <p className="text-xs text-slate-600">Computes the cryptographic Genesis Block (#0) and ratifies founding documents into Blocks #1, #2, and #3.</p>
              </div>
            </div>
          </section>

          {/* Feature 2: Document Repository */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              2. Document Repository &amp; Version History (/documents)
            </h2>
            <p className="text-slate-700 text-sm leading-relaxed">
              Provides a central repository of all active organizational documents:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-600">
              <li><strong>Live Document Viewer:</strong> View the current ratified version of any founding document, bylaw, or policy.</li>
              <li><strong>Version History:</strong> See which block each version was ratified in, along with block hash and timestamp.</li>
              <li><strong>Propose Amendments:</strong> Edit document text directly in the browser; the system automatically calculates a unified diff and creates a proposal.</li>
            </ul>
          </section>

          {/* Feature 3: Voting Portal */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Vote className="w-5 h-5 text-emerald-600" />
              3. Member Voting Portal (/proposals)
            </h2>
            <p className="text-slate-700 text-sm leading-relaxed">
              A transparent voting system where members review proposed text changes and cast cryptographic ballots:
            </p>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Automated Quorum Lifecycle</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Deterministic</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                As ballots are cast, the portal updates affirmative percentages in real-time. The moment statutory quorum and voting threshold are reached (e.g. 2/3 Supermajority), the backend automatically triggers the mining engine to commit the new document version to the blockchain.
              </p>
            </div>
          </section>

          {/* Feature 4: Blockchain Explorer */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              4. Blockchain Explorer (/blockchain)
            </h2>
            <p className="text-slate-700 text-sm leading-relaxed">
              An institutional block explorer allowing directors, members, auditors, and legal counsel to inspect every block on the ledger:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-600">
              <li>Block index, creation timestamp, and Proof-of-Work nonce.</li>
              <li>Cryptographic <code className="text-slate-800 font-mono">previousHash</code> and <code className="text-slate-800 font-mono">hash</code> pointers.</li>
              <li>Transaction data payload: document titles, diffs, voter identities, and ballot results.</li>
              <li>Live <strong>Chain Integrity Validator</strong> that executes <code className="text-emerald-700 font-mono">chain.isValid()</code> across all blocks.</li>
            </ul>
          </section>

          {/* Navigation link */}
          <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-sm font-semibold">
            <Link href="/core-library" className="text-slate-500 hover:text-slate-800">
              ← Core Library API
            </Link>
            <Link href="/cli" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              Ink Terminal CLI Guide →
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
