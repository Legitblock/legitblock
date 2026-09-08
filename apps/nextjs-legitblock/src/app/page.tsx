"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  FileText,
  Vote,
  Layers,
  Users,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Clock,
  Building2,
  Sparkles
} from "lucide-react";
import { VotingProgressBar } from "@/components/VotingProgressBar";

export default function DashboardPage() {
  const [status, setStatus] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/blockchain/status").then(r => r.json()),
      fetch("/api/proposals").then(r => r.json()).catch(() => ({ proposals: [] })),
      fetch("/api/documents").then(r => r.json()).catch(() => ({ documents: [] })),
    ])
      .then(([statusData, propData, docData]) => {
        setStatus(statusData);
        setProposals(propData.proposals || []);
        setDocuments(docData.documents || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-2"></div>
        <p className="text-sm">Connecting to organizational blockchain ledger...</p>
      </div>
    );
  }

  // If blockchain has not been initialized yet:
  if (!status?.isInitialized) {
    return (
      <div className="space-y-8 py-6">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-8 sm:p-12 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-4 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Immutable Organizational Governance</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Maintain All Organizational Documents & Voting on Blockchain
            </h1>
            <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
              LegitBlock empowers for-profit corporations, LLCs, non-profit charities, and cooperatives to manage their founding charters, bylaws, resolutions, and amendments with full cryptographic integrity. Every change requires an authorized vote.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/setup"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-sm transition flex items-center gap-2 shadow-md"
              >
                <span>Launch Organization Blockchain Wizard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-4 py-2.5 rounded-lg text-sm border border-slate-700 transition"
              >
                Sign In with LDAP
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">32+ Business & Co-op Templates</h3>
            <p className="text-xs text-slate-600">
              Pre-loaded with C-Corps, S-Corps, LLCs, 501(c)(3) charities, and worker/consumer cooperatives with authentic founding documents.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
              <Vote className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Blockchain Ratified Voting</h3>
            <p className="text-xs text-slate-600">
              Every amendment to articles, bylaws, or policies requires a proposal, democratic member voting, quorum checks, and a permanent block.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">LDAP Directory Authz</h3>
            <p className="text-xs text-slate-600">
              Native LDAP integration connects directly to your organizational directory so members and officers vote with verified identities.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If blockchain IS initialized:
  const activeProps = proposals.filter(p => p.status === "ACTIVE");

  return (
    <div className="space-y-6">
      {/* Organization Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Active Blockchain Ledger</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{status.organization?.name}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Type: <span className="font-semibold text-slate-700 capitalize">{status.organization?.type?.replace("_", " ")}</span> • Jurisdiction: <span className="font-semibold text-slate-700">{status.organization?.jurisdiction}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/documents"
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Propose Change</span>
          </Link>
          <Link
            href="/blockchain"
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3.5 py-2 rounded-lg transition flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4" />
            <span>Explorer</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Block Height</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{status.blockHeight}</div>
          <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Cryptographically Valid
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active Documents</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{status.totalDocuments}</div>
          <div className="text-[11px] text-slate-500 mt-1">Founding & Governance</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active Proposals</span>
            <Vote className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{activeProps.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Awaiting Member Votes</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Registered Members</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{status.organization?.foundingMembers?.length || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Voting Stakeholders</div>
        </div>
      </div>

      {/* Active Proposals Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Vote className="w-5 h-5 text-emerald-600" />
              <span>Active Governance Proposals</span>
            </h2>
            <p className="text-xs text-slate-500">
              Democratically cast votes on document amendments and new policies.
            </p>
          </div>
          <Link href="/proposals" className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1">
            View All ({proposals.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeProps.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-200 text-slate-500 text-xs">
            No active proposals awaiting votes. You can propose an amendment from any document.
          </div>
        ) : (
          <div className="space-y-4">
            {activeProps.map((p) => (
              <div key={p.id} className="p-4 border border-slate-200 rounded-lg space-y-3 hover:border-slate-300 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {p.type.replace("_", " ")}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">{p.title}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">{p.description}</p>
                  </div>
                  <Link
                    href={`/proposals/${p.id}`}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition shadow-sm"
                  >
                    Cast Vote
                  </Link>
                </div>

                {p.tally && (
                  <VotingProgressBar tally={p.tally} votingRule={p.votingRule} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Organizational Documents Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Ratified Organizational Documents</span>
            </h2>
            <p className="text-xs text-slate-500">
              Authoritative documents currently effective on the LegitBlock blockchain.
            </p>
          </div>
          <Link href="/documents" className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1">
            Browse Repository <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {documents.map((d) => (
            <div key={d.id} className="p-3.5 border border-slate-200 rounded-lg hover:border-slate-300 transition flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 px-1.5 py-0.5 bg-slate-100 rounded">
                    {d.category}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700">
                    v{d.version}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">{d.title}</h4>
                <p className="text-xs font-mono text-slate-400 mt-1 truncate">
                  Hash: {d.contentHash}
                </p>
              </div>

              <div className="pt-3 mt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-400 text-[11px]">Block #{d.latestBlockIndex}</span>
                <div className="flex gap-2">
                  <Link href={`/documents/${d.id}`} className="text-slate-600 hover:text-slate-900 font-medium">
                    View
                  </Link>
                  <Link href={`/documents/${d.id}/edit`} className="text-emerald-600 hover:text-emerald-700 font-semibold">
                    Propose Amendment
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
