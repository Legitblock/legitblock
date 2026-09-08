"use client";

import React, { useEffect, useState } from "react";
import { Layers, ShieldCheck, CheckCircle2, AlertTriangle, Search, ChevronDown, ChevronUp, Cpu } from "lucide-react";

export default function BlockchainExplorerPage() {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [validation, setValidation] = useState<any>(null);
  const [validating, setValidating] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedBlockIndex, setExpandedBlockIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/blockchain/blocks")
      .then(res => res.json())
      .then(data => setBlocks(data.chain || []))
      .finally(() => setLoading(false));
  }, []);

  const handleVerifyChain = async () => {
    setValidating(true);
    try {
      const res = await fetch("/api/blockchain/validate");
      const data = await res.json();
      setValidation(data);
    } catch (err: any) {
      setValidation({ valid: false, error: err.message });
    } finally {
      setValidating(false);
    }
  };

  const filtered = blocks.filter(b => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      String(b.index).includes(q) ||
      b.hash.toLowerCase().includes(q) ||
      b.type.toLowerCase().includes(q) ||
      b.validator.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-600" />
            <span>Cryptographic Blockchain Explorer</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspect every block, SHA-256 hash, consensus nonce, and immutable transaction recorded on the chain.
          </p>
        </div>

        <button
          onClick={handleVerifyChain}
          disabled={validating}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{validating ? "Verifying SHA-256 Hashes..." : "Verify Chain Integrity"}</span>
        </button>
      </div>

      {/* Validation Result Banner */}
      {validation && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
          validation.valid
            ? "bg-emerald-50 border-emerald-300 text-emerald-800"
            : "bg-rose-50 border-rose-300 text-rose-800"
        }`}>
          {validation.valid ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <div>
            <div className="font-bold text-sm">
              {validation.valid
                ? "Cryptographic Verification Passed!"
                : "Integrity Verification Failed!"}
            </div>
            <div>
              {validation.valid
                ? `All ${validation.blockCount} blocks verified. Previous hash pointers and block contents are intact and unmodified.`
                : `Tampering detected: ${validation.error} at block #${validation.brokenBlockIndex}`}
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
        <span className="text-xs text-slate-500 font-medium">
          Total Height: <strong className="text-slate-900">{blocks.length} Blocks</strong>
        </span>
        <div className="relative w-full max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search block # or hash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Blocks List */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Loading blockchain ledger...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
          No blocks found.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => {
            const isExpanded = expandedBlockIndex === b.index;
            let typeBadge = "bg-slate-100 text-slate-700";
            if (b.type === "GENESIS") typeBadge = "bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold";
            if (b.type === "DOCUMENT_INSERT") typeBadge = "bg-blue-50 text-blue-800 border border-blue-200";
            if (b.type === "DOCUMENT_AMEND") typeBadge = "bg-amber-50 text-amber-800 border border-amber-200";
            if (b.type === "VOTE_TALLY") typeBadge = "bg-purple-50 text-purple-800 border border-purple-200";

            return (
              <div
                key={b.index}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-slate-300 transition"
              >
                <div
                  onClick={() => setExpandedBlockIndex(isExpanded ? null : b.index)}
                  className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shadow-inner">
                      #{b.index}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${typeBadge}`}>
                          {b.type.replace("_", " ")}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(b.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="font-mono text-xs text-slate-600 mt-1 flex items-center gap-2">
                        <span>Hash:</span>
                        <span className="text-emerald-700 font-semibold">{b.hash.substring(0, 20)}...{b.hash.substring(56)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto text-xs text-slate-500">
                    <span>Nonce: <strong>{b.nonce}</strong></span>
                    <span>Validator: <strong>{b.validator}</strong></span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs font-mono space-y-2">
                    <div>
                      <span className="text-slate-500">Full Block Hash:</span>
                      <div className="text-emerald-700 bg-white p-1.5 rounded border border-slate-200 break-all">{b.hash}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Previous Block Hash:</span>
                      <div className="text-slate-700 bg-white p-1.5 rounded border border-slate-200 break-all">{b.previousHash}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Payload Data:</span>
                      <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg overflow-x-auto text-[11px] leading-relaxed">
                        {JSON.stringify(b.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
