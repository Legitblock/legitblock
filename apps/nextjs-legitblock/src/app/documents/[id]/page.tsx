"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FileText, Edit, History, Layers, ArrowLeft, CheckCircle2 } from "lucide-react";
import { DiffViewer } from "@/components/DiffViewer";

export default function DocumentDetailPage() {
  const params = useParams();
  const docId = params.id as string;
  const [doc, setDoc] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"content" | "history">("content");

  useEffect(() => {
    fetch(`/api/documents/${docId}`)
      .then(res => res.json())
      .then(data => {
        setDoc(data.document);
        setHistory(data.history || []);
      })
      .finally(() => setLoading(false));
  }, [docId]);

  if (loading) {
    return <div className="py-20 text-center text-slate-500 text-sm">Loading document from blockchain...</div>;
  }

  if (!doc) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900">Document Not Found</h2>
        <Link href="/documents" className="text-emerald-600 text-xs font-semibold mt-2 inline-block">
          Return to Documents
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/documents" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-medium">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Documents Repository
      </Link>

      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {doc.category}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Version {doc.version}
            </span>
            <span className="text-xs text-slate-500">
              Block #{doc.latestBlockIndex}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{doc.title}</h1>
          <p className="text-[11px] font-mono text-slate-400 mt-1 break-all">
            Cryptographic Content Hash: {doc.contentHash}
          </p>
        </div>

        <Link
          href={`/documents/${doc.id}/edit`}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow-sm whitespace-nowrap"
        >
          <Edit className="w-4 h-4" />
          <span>Propose Amendment</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("content")}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeTab === "content"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Effective Document Text
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "history"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Blockchain Version History & Diffs ({history.length})</span>
        </button>
      </div>

      {/* Tab 1: Current Document Text */}
      {activeTab === "content" && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm prose max-w-none text-slate-800 text-sm whitespace-pre-wrap font-sans">
          {doc.content}
        </div>
      )}

      {/* Tab 2: History & Diffs */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {history.map((event, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-start text-xs">
                <div>
                  <span className="font-bold uppercase tracking-wider text-slate-700">
                    {event.action} • Version {event.version}
                  </span>
                  <div className="text-slate-500 mt-0.5">
                    Ratified in Block #{event.blockIndex} on {new Date(event.timestamp).toLocaleString()}
                  </div>
                  {event.notes && (
                    <div className="text-emerald-700 font-medium mt-0.5">{event.notes}</div>
                  )}
                </div>
                <span className="font-mono text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                  Validator: {event.validator}
                </span>
              </div>

              {event.diff && (
                <div>
                  <div className="text-[11px] font-semibold text-slate-600 mb-1">Ratified Diff:</div>
                  <DiffViewer diffText={event.diff} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
