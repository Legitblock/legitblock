import React from "react";
import Link from "next/link";
import { Sidebar } from "../../components/Sidebar";
import { CodeBlock } from "../../components/CodeBlock";
import { TerminalDemo } from "../../components/TerminalDemo";
import { 
  Terminal, 
  FileEdit, 
  KeyRound, 
  Vote, 
  Layers, 
  ArrowRight,
  Sparkles,
  Command
} from "lucide-react";

export default function CliPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex gap-10">
        <Sidebar />

        <article className="flex-1 max-w-4xl min-w-0 space-y-12">
          {/* Header */}
          <div className="border-b border-slate-200 pb-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-300">
              <Terminal className="w-4 h-4 text-amber-600" />
              <span>Command-Line Governance</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              apps/ink-legitblock Terminal Client
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              A full-featured terminal UI powered by React and Ink that connects to the running Next.js API, enabling board members and legal engineers to manage governance using their local <code className="text-slate-800 font-mono">$EDITOR</code>.
            </p>
          </div>

          {/* Interactive Demo */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Interactive Terminal Simulation</h2>
            <p className="text-slate-700 text-sm leading-relaxed">
              Explore how common governance tasks are executed from the command line:
            </p>
            <TerminalDemo />
          </section>

          {/* Running the CLI */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Running the CLI</h2>
            <CodeBlock
              language="bash"
              title="Terminal"
              code={`# Run directly via pnpm:
pnpm --filter ink-legitblock cli --help

# Or specify a custom Next.js endpoint:
pnpm --filter ink-legitblock cli status --endpoint http://localhost:3000`}
            />
          </section>

          {/* The $EDITOR Integration Workflow */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileEdit className="w-5 h-5 text-emerald-600" />
              The $EDITOR In-Place Amendment Workflow
            </h2>
            <p className="text-slate-700 text-sm leading-relaxed">
              One of LegitBlock CLI&apos;s most powerful features is native text editor integration. Rather than forcing lawyers or engineers to edit complex legal text inside a cramped web textarea:
            </p>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
              <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm text-slate-600">
                <li>
                  Run <code className="text-slate-900 font-mono font-semibold">legitblock-cli edit &lt;documentId&gt;</code>.
                </li>
                <li>
                  The CLI fetches the latest on-chain version of the document from the Next.js API and writes it to a temporary Markdown file.
                </li>
                <li>
                  The CLI spawns your local configured editor (<code className="text-slate-900 font-mono">$EDITOR</code> or <code className="text-slate-900 font-mono">vim</code>, <code className="text-slate-900 font-mono">nano</code>, <code className="text-slate-900 font-mono">code</code>).
                </li>
                <li>
                  You make amendments using your personal editor tools, macros, and spellcheckers.
                </li>
                <li>
                  Upon saving and closing the editor, the CLI parses your changes, computes a structured git-style unified diff, displays the additions and deletions, and prompts you to submit the proposal to the blockchain!
                </li>
              </ol>
            </div>
          </section>

          {/* Command Reference */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Command className="w-5 h-5 text-emerald-600" />
              Command Reference
            </h2>

            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between font-mono text-xs text-emerald-700 font-bold mb-1">
                  <span>legitblock-cli status</span>
                  <span className="text-slate-400 font-normal">Network Diagnostics</span>
                </div>
                <p className="text-xs text-slate-600">
                  Inspects connection to Next.js API, reports chain block height, verified genesis status, active proposals, and chain validation result.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between font-mono text-xs text-emerald-700 font-bold mb-1">
                  <span>legitblock-cli login &lt;username&gt;</span>
                  <span className="text-slate-400 font-normal">Authentication</span>
                </div>
                <p className="text-xs text-slate-600">
                  Authenticates with LDAP credentials against the Next.js auth endpoint and securely writes the JWT session token to <code className="text-slate-800 font-mono">~/.legitblock-session.json</code>.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between font-mono text-xs text-emerald-700 font-bold mb-1">
                  <span>legitblock-cli docs</span>
                  <span className="text-slate-400 font-normal">Document Listing</span>
                </div>
                <p className="text-xs text-slate-600">
                  Lists all ratified organizational documents on-chain with their current versions, categories, ratification blocks, and SHA-256 hashes.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between font-mono text-xs text-emerald-700 font-bold mb-1">
                  <span>legitblock-cli proposals</span>
                  <span className="text-slate-400 font-normal">Governance Portal</span>
                </div>
                <p className="text-xs text-slate-600">
                  Displays active proposals with quorum progress, threshold percentage, and breakdown of affirmative vs dissenting ballots.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between font-mono text-xs text-emerald-700 font-bold mb-1">
                  <span>legitblock-cli vote &lt;id&gt; &lt;yes|no&gt;</span>
                  <span className="text-slate-400 font-normal">Ballot Casting</span>
                </div>
                <p className="text-xs text-slate-600">
                  Submits a signed ballot for an active proposal. If your vote satisfies the quorum requirement, the CLI automatically triggers block mining.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between font-mono text-xs text-emerald-700 font-bold mb-1">
                  <span>legitblock-cli edit &lt;doc-id&gt;</span>
                  <span className="text-slate-400 font-normal">$EDITOR Amendment</span>
                </div>
                <p className="text-xs text-slate-600">
                  Launches system editor on document content, computes diff on exit, and creates an amendment proposal on the blockchain.
                </p>
              </div>
            </div>
          </section>

          {/* Navigation link */}
          <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-sm font-semibold">
            <Link href="/web-app" className="text-slate-500 hover:text-slate-800">
              ← Next.js Web Application
            </Link>
            <Link href="/templates" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              Template Encyclopedia (32) →
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
