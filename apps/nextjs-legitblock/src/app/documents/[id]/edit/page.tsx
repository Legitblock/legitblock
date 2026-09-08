"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Edit3, ArrowLeft, Eye, Send, AlertTriangle } from "lucide-react";
import { DiffViewer } from "@/components/DiffViewer";

export default function DocumentEditProposePage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.id as string;

  const [doc, setDoc] = useState<any>(null);
  const [newContent, setNewContent] = useState("");
  const [proposalTitle, setProposalTitle] = useState("");
  const [proposalDescription, setProposalDescription] = useState("");
  const [diffLines, setDiffLines] = useState<any[]>([]);
  const [showDiff, setShowDiff] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/documents/${docId}`)
      .then(res => res.json())
      .then(data => {
        setDoc(data.document);
        setNewContent(data.document?.content || "");
        setProposalTitle(`Amend ${data.document?.title}`);
      })
      .finally(() => setLoading(false));
  }, [docId]);

  const handleComputeDiff = async () => {
    try {
      const res = await fetch(`/api/documents/${docId}/diff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newContent })
      });
      const data = await res.json();
      setDiffLines(data.diffLines || []);
      setShowDiff(true);
    } catch {}
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newContent,
          proposalTitle,
          proposalDescription
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit proposal");

      router.push(`/proposals/${data.proposalId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-slate-500 text-sm">Loading document...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href={`/documents/${docId}`} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-medium">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Document
      </Link>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
        <div>
          <strong className="font-semibold">Blockchain Governance Notice:</strong> Direct overwrites are cryptographically prohibited. Submitting your changes creates an Amendment Proposal on the LegitBlock network that must be voted on and ratified by authorized members before taking effect.
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmitProposal} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-emerald-600" />
            <span>Propose Amendment to {doc?.title}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Current version: v{doc?.version} • Next proposed version: v{(parseFloat(doc?.version || "1.0") + 0.1).toFixed(1)}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Proposal Title</label>
            <input
              type="text"
              required
              value={proposalTitle}
              onChange={(e) => setProposalTitle(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Rationale / Description of Amendment</label>
            <input
              type="text"
              placeholder="Explain why this amendment is necessary..."
              value={proposalDescription}
              onChange={(e) => setProposalDescription(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-700">Amended Document Content (Markdown)</label>
              <button
                type="button"
                onClick={handleComputeDiff}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" /> Preview Changes Diff
              </button>
            </div>
            <textarea
              rows={14}
              required
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full p-3 font-mono text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
            />
          </div>
        </div>

        {showDiff && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800">Computed Cryptographic Diff:</h3>
            <DiffViewer diffLines={diffLines} />
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleComputeDiff}
            className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Compute Diff
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? "Submitting to Blockchain..." : "Submit Amendment Proposal for Voting"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
