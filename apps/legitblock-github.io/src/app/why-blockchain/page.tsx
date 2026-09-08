import React from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  AlertOctagon, 
  Scale, 
  FileCheck2, 
  Lock, 
  History, 
  CheckCircle2, 
  ArrowRight,
  HelpCircle,
  Building2,
  HeartHandshake,
  Users2,
  FileDiff,
  Award,
  BookOpen
} from "lucide-react";
import { Sidebar } from "../../components/Sidebar";
import { CodeBlock } from "../../components/CodeBlock";

export default function WhyBlockchainPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex gap-10">
        <Sidebar />

        <article className="flex-1 max-w-4xl min-w-0 space-y-12">
          {/* Header Banner */}
          <div className="border-b border-slate-200 pb-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Institutional Governance Whitepaper</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Why Organizations Want Founding Documents &amp; All Voting History in a Blockchain
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed font-normal">
              A comprehensive legal, technical, and fiduciary analysis of why paper records, PDFs, and traditional databases fail modern organizations — and how cryptographic ledgers permanently eliminate corporate governance disputes.
            </p>
          </div>

          {/* Section 1: The Core Dilemma */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <AlertOctagon className="w-6 h-6 text-rose-600" />
              1. The Fragility of the Traditional &quot;Corporate Minute Book&quot;
            </h2>
            <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
              For over a century, the authoritative history of corporations, non-profits, and cooperatives has been maintained in physical leather-bound &quot;Corporate Minute Books&quot; or, more recently, haphazard folders in Google Drive, Dropbox, and email attachments. 
            </p>
            <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
              This model possesses a catastrophic structural flaw: <strong>corporate records are mutable, privately controlled, and entirely devoid of cryptographic proof of existence or sequence</strong>. When leadership disputes arise, founders split, or multi-million-dollar acquisitions take place, the lack of an immutable record frequently leads to litigation, disputed ownership, and paralyzing legal uncertainty.
            </p>

            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-sm space-y-2 my-6">
              <h4 className="font-bold flex items-center gap-2 text-amber-900">
                <AlertOctagon className="w-4 h-4 text-amber-700" />
                The Classic Founder Split Scenario
              </h4>
              <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
                Two founders launch an LLC in 2022. They draft an Operating Agreement with 4-year vesting on a founder&apos;s laptop. In 2025, after raising \$5M, Founder A leaves. Founder A presents a PDF claiming 50% outright ownership with no vesting. Founder B presents another PDF with identical styling claiming 4-year monthly vesting. Neither document has cryptographic proof of when it was signed or whether the board ever ratified it. <strong>The litigation costs \$250,000 and delays the Series A round by six months.</strong>
              </p>
            </div>
          </section>

          {/* Section 2: The 5 Fatal Flaws */}
          <section id="backdating" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">
              2. The Seven Fatal Vulnerabilities of Paper &amp; Cloud Records
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-2">
                <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center font-mono">01</span>
                <h3 className="font-bold text-slate-900 text-sm">Silent, Untraceable Alterations</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Word documents and PDFs stored on cloud drives can be modified at any time without leaving a tamper-evident trace. Paragraphs can be inserted, share percentages adjusted, and dates shifted with simple PDF editing tools.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-2">
                <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center font-mono">02</span>
                <h3 className="font-bold text-slate-900 text-sm">Backdated Board Resolutions</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Corporate law strictly forbids backdating resolutions. Yet, in practice, corporate secretaries routinely &quot;reconstruct&quot; board consents months or years after the fact to satisfy auditors, creating profound legal and criminal exposure.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-2">
                <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center font-mono">03</span>
                <h3 className="font-bold text-slate-900 text-sm">The &quot;He-Said-She-Said&quot; Quorum Dispute</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Did a meeting actually satisfy the required 50% or 66% quorum? Were abstentions counted properly? Traditional paper minutes merely reflect the secretary&apos;s subjective recollection rather than cryptographic tallying.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-2">
                <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center font-mono">04</span>
                <h3 className="font-bold text-slate-900 text-sm">The $50,000 Due Diligence Tax</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  During M&amp;A or financing, acquirers hire outside law firms to perform &quot;corporate clean-up.&quot; Weeks are spent hunting down lost consents, missing signatures, and unratified amendments at \$850/hour.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-2">
                <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center font-mono">05</span>
                <h3 className="font-bold text-slate-900 text-sm">Loss of Historical Lineage</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  When a company has amended its bylaws 14 times over 10 years, nobody knows which clauses were modified by which specific resolution. Finding the exact wording in effect on June 4, 2021 is virtually impossible.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-2">
                <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center font-mono">06</span>
                <h3 className="font-bold text-slate-900 text-sm">Cooperative &amp; Member Distrust</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  In worker or housing co-ops, democratic legitimacy is paramount. If leadership controls the central voting spreadsheet, members suspect vote rigging or exclusion. Cryptographic consensus guarantees fairness.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: How Blockchain Solves It */}
          <section id="proof-of-quorum" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-6 h-6 text-emerald-600" />
              3. The Blockchain Guarantee: How Cryptography Solves Governance
            </h2>
            <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
              A blockchain is fundamentally an append-only, cryptographically linked state machine. When applied to corporate governance, it produces five immutable guarantees that cannot be replicated by any standard database:
            </p>

            {/* Guarantee Cards */}
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Guarantee 1: Immutable Chaining via SHA-256 Hashes
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">Hash Linked</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Each block contains the exact SHA-256 hash of the preceding block:
                </p>
                <code className="text-emerald-700 font-mono block p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs overflow-x-auto">
                  hash = SHA256(index + timestamp + previousHash + canonicalData + nonce)
                </code>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  If a bad actor attempts to retroactively modify a single character in the Articles of Incorporation in Block #1, that block&apos;s hash changes completely. Consequently, Block #2&apos;s <code className="text-slate-800 font-mono">previousHash</code> pointer becomes invalid, causing a cascading failure that breaks the entire chain up to the present. The fraud is mathematically exposed immediately.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Guarantee 2: Mathematical Proof-of-Quorum
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">Enforced Quorum</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  In LegitBlock, a proposal cannot transition from <code className="text-slate-800 font-mono">PENDING</code> to <code className="text-emerald-700 font-mono">PASSED</code> through executive whim. The core <code className="text-slate-800 font-mono">VotingEngine</code> evaluates the exact voting rule defined for that entity:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                  <li className="p-2.5 rounded bg-slate-50 border border-slate-100">
                    <strong>Simple Majority:</strong> &gt;50% affirmative votes with 50% quorum.
                  </li>
                  <li className="p-2.5 rounded bg-slate-50 border border-slate-100">
                    <strong>Supermajority (2/3):</strong> &ge;66.67% affirmative for charter amendments.
                  </li>
                  <li className="p-2.5 rounded bg-slate-50 border border-slate-100">
                    <strong>Supermajority (3/4):</strong> &ge;75% affirmative for dissolution or merger.
                  </li>
                  <li className="p-2.5 rounded bg-slate-50 border border-slate-100">
                    <strong>Unanimous Consent:</strong> 100% affirmative with 0 dissenting votes.
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Guarantee 3: Cryptographic Structured Line Diffs
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">Audit Provenance</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Whenever a member proposes an amendment to an existing document, the <code className="text-slate-800 font-mono">DiffEngine</code> computes a unified git-style diff and a structured delta object. When the proposal passes, the block records not just the new version, but the exact diff, the author, and the voting ballots.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Guarantee 4: Non-Repudiation via LDAP &amp; Ed25519 Signatures
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">Digital Signatures</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Ballots are tied to verified organizational identity. LegitBlock supports enterprise LDAP directories (Active Directory, OpenLDAP) and cryptographic Ed25519 digital signatures. A director cannot vote to approve an expenditure and later claim in court they were never present.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Statutory and Legal Recognition */}
          <section id="statutory-basis" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-6 h-6 text-emerald-600" />
              4. Legal &amp; Statutory Authorization (Delaware DGCL § 224)
            </h2>
            <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
              A common misconception is that corporate law requires physical paper filings. In reality, state legislatures have modernized corporate codes to explicitly embrace blockchain databases.
            </p>

            <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono text-emerald-400 font-semibold">
                  8 Del. C. § 224 — Delaware General Corporation Law
                </span>
                <span className="text-xs text-slate-400">Enacted July 2017</span>
              </div>
              <blockquote className="text-xs sm:text-sm text-slate-300 italic leading-relaxed border-l-2 border-emerald-500 pl-4">
                &quot;Any records administered by or on behalf of the corporation in the regular course of its business, including its stock ledger, books of account, and minute books, may be kept on, or by means of, or be in the form of, <strong>any information storage device, or method, or one or more distributed networks or databases (including electronic networks or databases)</strong>; provided that the records so kept can be converted into clearly legible paper form within a reasonable time...&quot;
              </blockquote>
              <p className="text-xs text-slate-400">
                Delaware § 224 explicitly legalizes the storage of corporate minute books and governance records on distributed blockchain networks. LegitBlock fully complies with this statutory mandate, generating human-readable Markdown exports alongside cryptographic ledger proofs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <h4 className="font-bold text-sm text-slate-900 mb-1">Delaware DGCL § 219 (Stock Ledgers)</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Authorizes corporations to maintain shareholder lists and equity issuances using blockchain ledgers, replacing archaic stock certificates.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <h4 className="font-bold text-sm text-slate-900 mb-1">Wyoming DAO LLC Statutes (W.S. 17-31)</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Grants full legal entity status to algorithmic and member-managed organizations where operating agreements and voting are recorded on-chain.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: Impact Across 3 Sectors */}
          <section id="audit-cost" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">
              5. Sector-Specific Value Proposition
            </h2>

            <div className="space-y-4">
              {/* For-Profit */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  For-Profit Startups &amp; Corporations (C-Corp, S-Corp, LLC)
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Investor Diligence:</strong> Venture capital firms and underwriters can verify 100% of charter amendments, SAFEs, and option pool authorizations in seconds during Series A/B rounds.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Protection Against Disputed Equity:</strong> Every grant of shares or change in authorized capitalization requires a verified on-chain board vote.</span>
                  </li>
                </ul>
              </div>

              {/* Non-Profit */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-blue-800 font-bold text-base">
                  <HeartHandshake className="w-5 h-5 text-blue-600" />
                  Non-Profit Organizations &amp; 501(c)(3) Charities
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>IRS Form 990 Audit Readiness:</strong> Part VI of IRS Form 990 demands strict evidence of independent board oversight, conflict-of-interest policies, and executive compensation votes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Fiduciary Protection for Trustees:</strong> Board trustees are shielded from personal liability by proving they followed formal statutory voting procedures before disbursing funds.</span>
                  </li>
                </ul>
              </div>

              {/* Cooperatives */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-base">
                  <Users2 className="w-5 h-5 text-amber-600" />
                  Worker, Housing &amp; Platform Cooperatives
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span><strong>Sacred Democratic Trust:</strong> The cornerstone of the cooperative movement is &quot;One Member, One Vote.&quot; LegitBlock mathematically guarantees that leaders cannot tamper with ballots or disenfranchise members.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span><strong>Transparent Patronage Allocation:</strong> Formula changes for annual surplus distribution are ratified openly on the chain for all members to inspect.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 6: Summary & Next Steps */}
          <section className="p-8 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white space-y-4">
            <h3 className="text-2xl font-bold">Conclusion: Governance as a Cryptographic Asset</h3>
            <p className="text-sm sm:text-base leading-relaxed text-emerald-50">
              By grounding your organization&apos;s founding documents and voting history in LegitBlock, corporate governance ceases to be a liability hidden in dusty binders. It becomes a permanent, tamper-evident asset that builds unwavering trust with investors, regulators, workers, and community members.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/architecture"
                className="px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-xs hover:bg-emerald-50 transition-colors flex items-center gap-1.5"
              >
                Learn System Architecture <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/playground"
                className="px-5 py-2.5 rounded-xl bg-emerald-800 text-white font-semibold text-xs hover:bg-emerald-900 transition-colors"
              >
                Test Tamper Simulator
              </Link>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
