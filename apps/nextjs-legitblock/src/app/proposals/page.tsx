"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Vote, Plus, Filter, CheckCircle2, Clock, XCircle, ArrowRight } from "lucide-react";
import { VotingProgressBar } from "@/components/VotingProgressBar";

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetch("/api/proposals")
      .then(res => res.json())
      .then(data => setProposals(data.proposals || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = proposals.filter(p => {
    if (statusFilter === "all") return true;
    return p.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Vote className="w-6 h-6 text-emerald-600" />
            <span>Governance & Voting Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Every organizational change, document amendment, and policy ratification is decided through democratic member voting.
          </p>
        </div>

        <Link
          href="/documents"
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Document Proposal</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-2">
        {[
          { id: "all", label: `All Proposals (${proposals.length})` },
          { id: "ACTIVE", label: `Active (${proposals.filter(p => p.status === "ACTIVE").length})` },
          { id: "PASSED", label: `Passed (${proposals.filter(p => p.status === "PASSED").length})` },
          { id: "EXECUTED", label: `Executed (${proposals.filter(p => p.status === "EXECUTED").length})` },
          { id: "REJECTED", label: `Rejected (${proposals.filter(p => p.status === "REJECTED").length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              statusFilter === tab.id
                ? "bg-slate-900 text-white font-semibold"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Proposals List */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-sm">Loading proposals...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
          No proposals found for status "{statusFilter}".
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => {
            let statusBadge = "bg-slate-100 text-slate-700 border-slate-200";
            if (p.status === "ACTIVE") statusBadge = "bg-blue-50 text-blue-700 border-blue-200";
            if (p.status === "PASSED") statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";
            if (p.status === "EXECUTED") statusBadge = "bg-purple-50 text-purple-700 border-purple-200";
            if (p.status === "REJECTED") statusBadge = "bg-rose-50 text-rose-700 border-rose-200";

            return (
              <div
                key={p.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusBadge}`}>
                        {p.status}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {p.type.replace("_", " ")}
                      </span>
                      <span className="text-xs text-slate-400">
                        Proposer: <strong className="text-slate-700">{p.proposer?.name || p.proposer?.id}</strong>
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900">{p.title}</h2>
                    <p className="text-xs text-slate-600 mt-0.5">{p.description}</p>
                  </div>

                  <Link
                    href={`/proposals/${p.id}`}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow-sm whitespace-nowrap self-end sm:self-auto"
                  >
                    <span>{p.status === "ACTIVE" ? "Cast Vote" : "View Details"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {p.tally && (
                  <VotingProgressBar tally={p.tally} votingRule={p.votingRule} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
