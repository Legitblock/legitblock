import React from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  FileCheck2, 
  Vote, 
  Lock, 
  Terminal, 
  Globe, 
  Scale, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Fingerprint,
  Building2,
  HeartHandshake,
  Users2,
  BookOpen,
  History,
  Layers,
  FileDiff
} from "lucide-react";
import { InteractiveChainSimulator } from "@/components/InteractiveChainSimulator";
import { TerminalDemo } from "@/components/TerminalDemo";
import { CodeBlock } from "@/components/CodeBlock";

export default function HomePage() {
  return (
    <main className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28 bg-gradient-to-b from-emerald-50/60 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-300/80 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Institutional Blockchain Governance Framework</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Keep Your Founding Documents &amp; Voting History on an{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                Immutable Blockchain
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
              No more lost corporate minute books, disputed equity agreements, or retroactive board alterations. 
              LegitBlock anchors articles of incorporation, bylaws, and member ratifications in a deterministic, tamper-proof cryptographic ledger.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/why-blockchain"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 group"
              >
                Why Blockchain for Organizations?
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/playground"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-300 shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Try Interactive Sandbox
              </Link>
              <Link
                href="/templates"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-all flex items-center justify-center gap-2"
              >
                Explore 32 Templates
              </Link>
            </div>

            {/* Key highlights bar */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-slate-200/80">
              <div className="p-3">
                <div className="text-2xl font-black text-slate-900 font-mono">100%</div>
                <div className="text-xs text-slate-500">Tamper-Proof Audit Trail</div>
              </div>
              <div className="p-3">
                <div className="text-2xl font-black text-slate-900 font-mono">32</div>
                <div className="text-xs text-slate-500">Corporate &amp; Co-op Templates</div>
              </div>
              <div className="p-3">
                <div className="text-2xl font-black text-emerald-700 font-mono">DGCL § 224</div>
                <div className="text-xs text-slate-500">Delaware Law Compliant</div>
              </div>
              <div className="p-3">
                <div className="text-2xl font-black text-slate-900 font-mono">0ms</div>
                <div className="text-xs text-slate-500">Instant Due Diligence Check</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Blockchain Sandbox Live on Homepage */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            See the Cryptographic Guarantee in Action
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Try tampering with an older block below. Watch how SHA-256 chaining mathematically exposes unauthorized modifications immediately.
          </p>
        </div>

        <InteractiveChainSimulator />
      </section>

      {/* The 4 Fundamental Reasons Why Organizations Need LegitBlock */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Governance Revolution
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
            Why Traditional Corporate Recordkeeping Fails
          </h2>
          <p className="text-slate-600 mt-3 text-sm sm:text-base leading-relaxed">
            Paper binders, cloud PDFs, and email threads are fragile and easily manipulated. LegitBlock transforms organizational governance into an immutable, mathematically verifiable asset.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">
                No Silent Alterations or Backdating
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                In contentious founder splits or shareholder lawsuits, bad actors routinely backdate board resolutions or alter signed agreements. On LegitBlock, changing even one comma breaks the cryptographic hash chain.
              </p>
            </div>
            <Link href="/why-blockchain#backdating" className="mt-4 text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              Read legal analysis <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <Vote className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">
                Mathematical Proof-of-Quorum
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every amendment requires a verified quorum of members (Simple Majority, 2/3, 3/4, or Consensus). Votes are signed with LDAP or Ed25519 credentials and permanently bonded into the mined block.
              </p>
            </div>
            <Link href="/why-blockchain#proof-of-quorum" className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Quorum rules spec <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">
                Instant Audit &amp; Due Diligence
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                During venture rounds, acquisitions, or bank loans, legal teams spend weeks and tens of thousands of dollars re-creating messy minute books. With LegitBlock, auditors run one command to verify 100% of corporate records in seconds.
              </p>
            </div>
            <Link href="/why-blockchain#audit-cost" className="mt-4 text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1">
              Due diligence savings <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <Fingerprint className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">
                Delaware § 224 Statutory Compliance
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Delaware General Corporation Law § 219 and § 224 explicitly authorize corporations to maintain stock ledgers, minutes, and corporate records on electronic networks and distributed blockchain databases.
              </p>
            </div>
            <Link href="/why-blockchain#statutory-basis" className="mt-4 text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1">
              Statutory references <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Comparison Table: Traditional Governance vs LegitBlock */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 bg-slate-900 text-white">
            <h3 className="text-xl font-bold">Paper / PDF Governance vs. LegitBlock Blockchain</h3>
            <p className="text-xs text-slate-400 mt-1">
              Why high-trust institutions are migrating away from fragmented file cabinets and DocuSign PDFs.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4 w-1/4">Governance Feature</th>
                  <th className="p-4 w-3/8 text-rose-700 bg-rose-50/50">Traditional Paper &amp; PDFs</th>
                  <th className="p-4 w-3/8 text-emerald-800 bg-emerald-50/50">LegitBlock On-Chain Governance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-4 font-semibold text-slate-900">Founding Charter Protection</td>
                  <td className="p-4 text-slate-600 bg-rose-50/20">Stored in folders; prone to loss or conflicting version drafts.</td>
                  <td className="p-4 text-emerald-900 font-medium bg-emerald-50/20">Ratified into Genesis Block with SHA-256 cryptographic fingerprint.</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-900">Amendment Approvals</td>
                  <td className="p-4 text-slate-600 bg-rose-50/20">Email threads, verbal votes, informal signatures without verified quorum.</td>
                  <td className="p-4 text-emerald-900 font-medium bg-emerald-50/20">Automated Voting Engine enforcing exact statutory quorum thresholds.</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-900">Version Diffing</td>
                  <td className="p-4 text-slate-600 bg-rose-50/20">Manual Word &quot;track changes&quot; that can be stripped or fabricated.</td>
                  <td className="p-4 text-emerald-900 font-medium bg-emerald-50/20">Cryptographic line-by-line unified diff attached to proposal on-chain.</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-900">Historical Audit</td>
                  <td className="p-4 text-slate-600 bg-rose-50/20">Weeks of expensive attorney paralegal review during M&amp;A / Series A.</td>
                  <td className="p-4 text-emerald-900 font-medium bg-emerald-50/20">Instant verification via <code className="text-emerald-700 font-mono">blockchain.isValid()</code> in milliseconds.</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-900">Member Identity &amp; Auth</td>
                  <td className="p-4 text-slate-600 bg-rose-50/20">Easily forged paper signatures; email account takeovers.</td>
                  <td className="p-4 text-emerald-900 font-medium bg-emerald-50/20">Integrated enterprise LDAP authentication + Ed25519 digital signatures.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* The Monorepo Architecture: 3 Unified Components */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Architecture
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
            Three Pillars of LegitBlock
          </h2>
          <p className="text-slate-600 mt-2 text-sm">
            A modular monorepo providing a headless blockchain library, a modern web dashboard, and a command-line terminal client.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pillar 1: Library */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-emerald-500 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-mono font-bold text-sm mb-4">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                packages/legitblock-utils
              </h3>
              <p className="text-xs text-slate-500 font-mono mb-4">Core Headless Blockchain Engine</p>
              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  SHA-256 &amp; Proof-of-Work blockchain engine
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  VotingEngine with 5 quorum threshold rules
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Structured line-by-line DiffEngine
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  32 Pre-built legal templates (Corp, Non-Profit, Co-op)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  LDAP authentication provider &amp; mock directory
                </li>
              </ul>
            </div>
            <Link
              href="/core-library"
              className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold text-center transition-colors"
            >
              Explore Core Library API
            </Link>
          </div>

          {/* Pillar 2: Web App */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-emerald-500 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-mono font-bold text-sm mb-4">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                apps/nextjs-legitblock
              </h3>
              <p className="text-xs text-slate-500 font-mono mb-4">Full-Featured Governance Web Portal</p>
              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  Interactive setup wizard for genesis initialization
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  Document management &amp; version history viewer
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  Voting portal with real-time quorum progress
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  Full blockchain explorer with hash verification
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  17 Dynamic REST API endpoints
                </li>
              </ul>
            </div>
            <Link
              href="/web-app"
              className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold text-center transition-colors"
            >
              Tour Web Application
            </Link>
          </div>

          {/* Pillar 3: Ink CLI */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-emerald-500 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-mono font-bold text-sm mb-4">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                apps/ink-legitblock
              </h3>
              <p className="text-xs text-slate-500 font-mono mb-4">Terminal UI with $EDITOR Workflow</p>
              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  React Ink terminal user interface
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  Spawns local <code className="text-slate-800">$EDITOR</code> (vim, nano, code)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  Computes unified diffs automatically
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  Submits amendment proposals from command line
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  Caches session tokens in ~/.legitblock-session.json
                </li>
              </ul>
            </div>
            <Link
              href="/cli"
              className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold text-center transition-colors"
            >
              Inspect Terminal Client
            </Link>
          </div>
        </div>
      </section>

      {/* Terminal Demo Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Developer Experience
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Governance at the Speed of the Command Line
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            Engineers, legal engineers, and board secretaries can edit documents with vim or nano and cast cryptographic ballots without ever leaving the terminal.
          </p>
        </div>

        <TerminalDemo />
      </section>

      {/* Organization Templates Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 text-xs font-semibold border border-emerald-800">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Comprehensive Legal Template Library</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              32 Battle-Tested Organization Charters
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Every organization requires specific founding articles, bylaws, and voting thresholds. LegitBlock includes comprehensive templates with fully articulated founding texts across three sectors:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm mb-1">
                  <Building2 className="w-4 h-4" />
                  12 For-Profit Entities
                </div>
                <p className="text-xs text-slate-400">
                  C-Corp, S-Corp, Member &amp; Manager LLCs, Series LLC, B-Corp, LLP, Joint Venture.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                <div className="flex items-center gap-2 font-bold text-blue-400 text-sm mb-1">
                  <HeartHandshake className="w-4 h-4" />
                  12 Non-Profit Charters
                </div>
                <p className="text-xs text-slate-400">
                  501(c)(3) Charities &amp; Foundations, 501(c)(4) Welfare, 501(c)(6) Leagues, Trusts.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                <div className="flex items-center gap-2 font-bold text-amber-400 text-sm mb-1">
                  <Users2 className="w-4 h-4" />
                  8 Cooperative Charters
                </div>
                <p className="text-xs text-slate-400">
                  Worker Co-op, Housing Co-op, Consumer Co-op, Platform Co-op, Credit Union, Mutuals.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/templates"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all"
              >
                Browse All 32 Templates
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <h2 className="text-3xl font-bold text-slate-900">
          Ready to Modernize Your Organizational Governance?
        </h2>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Explore the documentation, review the legal justification, or run the monorepo locally in minutes.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/why-blockchain"
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md"
          >
            Read &quot;Why Blockchain?&quot; Whitepaper
          </Link>
          <Link
            href="/core-library"
            className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm"
          >
            Developer Quick Start
          </Link>
        </div>
      </section>
    </main>
  );
}
