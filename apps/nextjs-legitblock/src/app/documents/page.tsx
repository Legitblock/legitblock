"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Plus, Search, Filter, Layers, ArrowRight, ShieldAlert } from "lucide-react";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showNewModal, setShowNewModal] = useState(false);

  // New document form state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("governance");
  const [newContent, setNewContent] = useState("# New Organizational Document\n\n## Purpose\nDescribe purpose here.");
  const [newDescription, setNewDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  useEffect(() => {
    fetch("/api/documents")
      .then(res => res.json())
      .then(data => setDocuments(data.documents || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = documents.filter(d => {
    const matchesCat = categoryFilter === "all" || d.category === categoryFilter;
    const matchesSearch = !search ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.id.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCreateDocumentProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMsg("");

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          content: newContent,
          description: newDescription
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create document proposal");

      setSubmitMsg("Success! Proposal created on blockchain. Redirecting to voting...");
      setTimeout(() => {
        window.location.href = `/proposals/${data.proposalId}`;
      }, 800);
    } catch (err: any) {
      setSubmitMsg("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            <span>Organizational Documents Repository</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            All ratified documents are stored immutably on the LegitBlock blockchain. Every change requires an authorized member vote.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Propose New Document</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {["all", "founding", "governance", "financial", "operational", "resolution"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition ${
                categoryFilter === cat
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-sm">Loading documents from blockchain...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
          No documents found matching the filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                    {doc.category}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    v{doc.version}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 leading-snug">{doc.title}</h3>
                <p className="text-[11px] font-mono text-slate-400 mt-1 truncate">
                  SHA-256: {doc.contentHash}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> Block #{doc.latestBlockIndex}
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/documents/${doc.id}`}
                    className="text-slate-700 hover:text-slate-900 font-medium px-2 py-1 rounded hover:bg-slate-100 transition"
                  >
                    View
                  </Link>
                  <Link
                    href={`/documents/${doc.id}/edit`}
                    className="text-emerald-600 hover:text-emerald-700 font-semibold px-2 py-1 rounded hover:bg-emerald-50 transition"
                  >
                    Amend
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Propose New Document Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Propose New Organizational Document</h2>
                <p className="text-xs text-slate-500">
                  Submitting a new document creates a proposal that must be ratified by a blockchain member vote before becoming effective.
                </p>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {submitMsg && (
              <div className={`p-3 rounded text-xs ${submitMsg.startsWith("Success") ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                {submitMsg}
              </div>
            )}

            <form onSubmit={handleCreateDocumentProposal} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Remote Work Policy / Investment Policy"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="governance">Governance</option>
                  <option value="financial">Financial</option>
                  <option value="operational">Operational</option>
                  <option value="resolution">Resolution</option>
                  <option value="founding">Founding</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rationale / Proposal Description</label>
                <input
                  type="text"
                  placeholder="Why is this document needed?"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Content (Markdown)</label>
                <textarea
                  rows={8}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full p-2 font-mono border border-slate-300 rounded outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded transition disabled:opacity-50"
                >
                  {submitting ? "Creating Proposal..." : "Submit Proposal for Voting"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
