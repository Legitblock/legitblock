"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Vote, ArrowLeft, CheckCircle2, XCircle, MinusCircle, ShieldCheck, Layers, Cpu } from "lucide-react";
import { VotingProgressBar } from "@/components/VotingProgressBar";
import { DiffViewer } from "@/components/DiffViewer";

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propId = params.id as string;

  const [proposal, setProposal] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [feedback, setFeedback] = useState("");

  const refreshProposal = () => {
    Promise.all([
      fetch(`/api/proposals/${propId}`).then(r => r.json()),
      fetch("/api/auth/me").then(r => r.ok ? r.json() : { authenticated: false })
    ])
      .then(([pData, authData]) => {
        setProposal(pData.proposal);
        if (authData.authenticated) setCurrentUser(authData.user);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refreshProposal();
  }, [propId]);

  const handleCastVote = async (decision: "APPROVE" | "REJECT" | "ABSTAIN") => {
    setVoting(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/proposals/${propId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Voting failed");

      setFeedback(`Vote cast successfully: ${decision}`);
      refreshProposal();
    } catch (err: any) {
      setFeedback("Error: " + err.message);
    } finally {
      setVoting(false);
    }
  };

  const handleExecuteProposal = async () => {
    setExecuting(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/proposals/${propId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Execution failed");

      setFeedback("Proposal ratified and permanent block committed to blockchain!");
      refreshProposal();
    } catch (err: any) {
      setFeedback("Error: " + err.message);
    } finally {
      setExecuting(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-slate-500 text-sm">Loading proposal...</div>;

  if (!proposal) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900">Proposal Not Found</h2>
        <Link href="/proposals" className="text-emerald-600 text-xs font-semibold mt-2 inline-block">
          Return to Proposals
        </Link>
      </div>
    );
  }

  const userVote = currentUser && proposal.votes?.[currentUser.username]?.decision;
  const canExecute = (proposal.status === "PASSED" || (proposal.status === "ACTIVE" && proposal.tally?.passed)) && proposal.status !== "EXECUTED";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/proposals" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-medium">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Governance Center
      </Link>

      {/* Header Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                proposal.status === "ACTIVE" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                proposal.status === "EXECUTED" ? "bg-purple-50 text-purple-700 border border-purple-200" :
                proposal.status === "PASSED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                "bg-slate-100 text-slate-700"
              }`}>
                {proposal.status}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {proposal.type.replace("_", " ")}
              </span>
              {proposal.executedBlockIndex !== null && (
                <span className="text-xs text-purple-700 font-semibold flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> Ratified in Block #{proposal.executedBlockIndex}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{proposal.title}</h1>
            <p className="text-xs text-slate-600 mt-1">{proposal.description}</p>
          </div>

          <div className="text-xs text-slate-500 text-left sm:text-right bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div>Proposer: <strong className="text-slate-800">{proposal.proposer?.name || proposal.proposer?.id}</strong></div>
            <div>Voting Rule: <strong className="text-slate-800">{proposal.votingRule?.name}</strong></div>
            <div>Created: {new Date(proposal.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        {feedback && (
          <div className={`p-3 rounded-lg text-xs font-semibold ${
            feedback.startsWith("Error") ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}>
            {feedback}
          </div>
        )}

        {/* Voting Progress */}
        {proposal.tally && (
          <VotingProgressBar tally={proposal.tally} votingRule={proposal.votingRule} />
        )}

        {/* Interactive Voting Buttons */}
        {proposal.status === "ACTIVE" && (
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs">
              {currentUser ? (
                <span>
                  Logged in as <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.username}).
                  {userVote && <span className="ml-2 font-bold text-emerald-700">Your Vote: {userVote}</span>}
                </span>
              ) : (
                <span className="text-slate-500">
                  <Link href="/login" className="text-emerald-600 underline font-medium">Log in with LDAP</Link> to vote with your verified member credentials.
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={voting}
                onClick={() => handleCastVote("APPROVE")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                  userVote === "APPROVE"
                    ? "bg-emerald-700 text-white ring-2 ring-emerald-500"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" /> Approve
              </button>
              <button
                type="button"
                disabled={voting}
                onClick={() => handleCastVote("REJECT")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                  userVote === "REJECT"
                    ? "bg-rose-700 text-white ring-2 ring-rose-500"
                    : "bg-rose-600 hover:bg-rose-500 text-white"
                }`}
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
              <button
                type="button"
                disabled={voting}
                onClick={() => handleCastVote("ABSTAIN")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  userVote === "ABSTAIN"
                    ? "bg-slate-700 text-white ring-2 ring-slate-400"
                    : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                }`}
              >
                <MinusCircle className="w-4 h-4" /> Abstain
              </button>
            </div>
          </div>
        )}

        {/* Execute on Blockchain Button */}
        {canExecute && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-xs text-emerald-900">
              <strong className="text-sm font-bold block">Quorum and Passing Threshold Met!</strong>
              This proposal has passed member scrutiny. Ready to be sealed into an immutable block on the LegitBlock blockchain.
            </div>
            <button
              type="button"
              disabled={executing}
              onClick={handleExecuteProposal}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition shadow-md flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
            >
              <Cpu className="w-4 h-4" />
              <span>{executing ? "Committing Block..." : "Execute & Seal Block to Blockchain"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Target Document & Diff Preview */}
      {proposal.documentData?.diff && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Proposed Document Changes (Cryptographic Diff):</h3>
          <DiffViewer diffText={proposal.documentData.diff} />
        </div>
      )}

      {/* Document Content if New Document */}
      {proposal.documentData?.content && !proposal.documentData?.diff && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Proposed Document Content:</h3>
          <div className="p-4 bg-slate-50 rounded-lg text-xs font-mono text-slate-800 whitespace-pre-wrap">
            {proposal.documentData.content}
          </div>
        </div>
      )}

      {/* Cast Votes Ledger */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Cast Votes Audit Log ({Object.keys(proposal.votes || {}).length})</h3>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Voter</th>
                <th className="px-4 py-2 text-left font-semibold">Decision</th>
                <th className="px-4 py-2 text-right font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {Object.values(proposal.votes || {}).map((v: any, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium text-slate-900">{v.voterName || v.voterId}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      v.decision === "APPROVE" ? "bg-emerald-100 text-emerald-800" :
                      v.decision === "REJECT" ? "bg-rose-100 text-rose-800" :
                      "bg-slate-100 text-slate-700"
                    }`}>
                      {v.decision}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right text-slate-400">
                    {new Date(v.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
