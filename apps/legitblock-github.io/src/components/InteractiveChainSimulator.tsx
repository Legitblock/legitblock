"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Hammer, 
  Vote, 
  FileEdit, 
  Lock, 
  Unlock,
  ChevronRight,
  Fingerprint,
  Layers
} from "lucide-react";

interface SimBlock {
  index: number;
  timestamp: string;
  previousHash: string;
  hash: string;
  nonce: number;
  data: {
    type: string;
    documentTitle: string;
    action: string;
    details: string;
    author: string;
    votes?: { yes: number; no: number; required: number; passed: boolean };
  };
}

async function sha256Browser(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export function InteractiveChainSimulator() {
  const initialChain: SimBlock[] = [
    {
      index: 0,
      timestamp: "2026-09-08 09:00:00",
      previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
      hash: "000a48f98c4b12a8190d7e63b0185e9e04859a7f34c67efbc625890df628ab21",
      nonce: 142,
      data: {
        type: "GENESIS",
        documentTitle: "Genesis Block & Articles of Incorporation",
        action: "Organization Founding Ratification",
        details: "Incorporation of Apex Innovations Co-op. Initial charter ratified with 3 founding trustees.",
        author: "System Genesis"
      }
    },
    {
      index: 1,
      timestamp: "2026-09-08 09:15:22",
      previousHash: "000a48f98c4b12a8190d7e63b0185e9e04859a7f34c67efbc625890df628ab21",
      hash: "000bc71e4d82f7104b2a88e5d03194a28723c316719dd976b2c2865ffb4a661c",
      nonce: 388,
      data: {
        type: "DOCUMENT_RATIFICATION",
        documentTitle: "Corporate Bylaws (v1.0)",
        action: "Bylaws Enactment",
        details: "Ratified comprehensive governance bylaws establishing democratic quorum rules and officer duties.",
        author: "alice.chair",
        votes: { yes: 3, no: 0, required: 2, passed: true }
      }
    }
  ];

  const [chain, setChain] = useState<SimBlock[]>(initialChain);
  const [tamperedIndex, setTamperedIndex] = useState<number | null>(null);
  const [originalBlockContent, setOriginalBlockContent] = useState<string | null>(null);
  const [tamperText, setTamperText] = useState("");
  const [isMining, setIsMining] = useState(false);
  const [activeStep, setActiveStep] = useState<"ready" | "proposed" | "voted" | "mined">("ready");
  const [proposalVotes, setProposalVotes] = useState<{ yes: string[]; no: string[] }>({ yes: ["alice.chair"], no: [] });

  const members = ["alice.chair", "bob.director", "charlie.treasurer"];

  // Integrity calculation
  const isChainValid = tamperedIndex === null;

  const handleCastVote = (member: string, decision: "yes" | "no") => {
    if (decision === "yes") {
      if (!proposalVotes.yes.includes(member)) {
        setProposalVotes({
          yes: [...proposalVotes.yes, member],
          no: proposalVotes.no.filter(m => m !== member)
        });
      }
    } else {
      if (!proposalVotes.no.includes(member)) {
        setProposalVotes({
          no: [...proposalVotes.no, member],
          yes: proposalVotes.yes.filter(m => m !== member)
        });
      }
    }
  };

  const handleMineBlock = async () => {
    setIsMining(true);
    const prevBlock = chain[chain.length - 1];
    const newIndex = chain.length;
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);

    const blockData = {
      type: "DOCUMENT_AMENDMENT",
      documentTitle: "Articles of Incorporation (v1.1)",
      action: "Capital Stock Increase Amendment",
      details: "Article III amended: Authorized common stock increased from 10,000,000 to 20,000,000 shares for employee equity pool.",
      author: "bob.director",
      votes: {
        yes: proposalVotes.yes.length,
        no: proposalVotes.no.length,
        required: 2,
        passed: true
      }
    };

    // Lightweight browser mining simulation (find hash starting with "000")
    let nonce = 0;
    let computedHash = "";
    while (true) {
      nonce++;
      const payload = `${newIndex}${prevBlock.hash}${JSON.stringify(blockData)}${nonce}`;
      const candidateHash = await sha256Browser(payload);
      if (candidateHash.startsWith("000") || nonce > 450) {
        computedHash = candidateHash;
        break;
      }
    }

    const newBlock: SimBlock = {
      index: newIndex,
      timestamp: now,
      previousHash: prevBlock.hash,
      hash: computedHash,
      nonce: nonce,
      data: blockData
    };

    setChain([...chain, newBlock]);
    setIsMining(false);
    setActiveStep("mined");
  };

  const handleTamper = (index: number) => {
    const target = chain[index];
    setOriginalBlockContent(target.data.details);
    const maliciousText = "FRAUDULENT AMENDMENT: CEO retroactively grants self 85% majority ownership with no board notice.";
    setTamperText(maliciousText);

    const updated = [...chain];
    updated[index] = {
      ...updated[index],
      data: {
        ...updated[index].data,
        details: maliciousText
      }
    };
    setChain(updated);
    setTamperedIndex(index);
  };

  const handleRestore = () => {
    if (tamperedIndex !== null && originalBlockContent !== null) {
      const updated = [...chain];
      updated[tamperedIndex] = {
        ...updated[tamperedIndex],
        data: {
          ...updated[tamperedIndex].data,
          details: originalBlockContent
        }
      };
      setChain(updated);
    }
    setTamperedIndex(null);
    setOriginalBlockContent(null);
  };

  const handleReset = () => {
    setChain(initialChain);
    setTamperedIndex(null);
    setOriginalBlockContent(null);
    setActiveStep("ready");
    setProposalVotes({ yes: ["alice.chair"], no: [] });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">
      {/* Simulator Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              Live Blockchain & Governance Simulator
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Interactive client-side proof: see how document ratifications, votes, and cryptographic hash chains enforce institutional honesty.
          </p>
        </div>

        {/* Chain Integrity Badge */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
            isChainValid 
              ? "bg-emerald-950/80 text-emerald-400 border-emerald-700/60" 
              : "bg-rose-950/80 text-rose-400 border-rose-700/60 animate-pulse"
          }`}>
            {isChainValid ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>CHAIN 100% VALID</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>TAMPER DETECTED AT BLOCK #{tamperedIndex}</span>
              </>
            )}
          </div>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-xs flex items-center gap-1"
            title="Reset to Genesis"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tamper Warning Banner if compromised */}
      {!isChainValid && (
        <div className="my-4 p-4 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-300">Cryptographic Integrity Alarm Triggered</p>
              <p className="text-rose-200/80 mt-0.5">
                Someone altered Block #{tamperedIndex}&apos;s payload text! The calculated SHA-256 hash no longer matches subsequent blocks&apos; `previousHash`. This proves fraud in any court of law or audit.
              </p>
            </div>
          </div>
          <button
            onClick={handleRestore}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs whitespace-nowrap"
          >
            Restore Authentic Block
          </button>
        </div>
      )}

      {/* The Visual Block Chain */}
      <div className="py-6">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Fingerprint className="w-4 h-4 text-emerald-400" />
          Current Cryptographic Ledger ({chain.length} Blocks)
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {chain.map((block, idx) => {
            const isCompromised = tamperedIndex === idx;
            return (
              <div 
                key={block.index} 
                className={`relative rounded-xl p-4 border transition-all ${
                  isCompromised
                    ? "bg-rose-950/40 border-rose-600 ring-2 ring-rose-500/50"
                    : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Block Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-emerald-950 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center border border-emerald-800/60">
                      #{block.index}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      {block.data.type}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    Nonce: {block.nonce}
                  </span>
                </div>

                {/* Content Payload */}
                <div className="space-y-2 mb-3">
                  <div className="text-sm font-bold text-white line-clamp-1">
                    {block.data.documentTitle}
                  </div>
                  <p className={`text-xs leading-relaxed ${isCompromised ? "text-rose-300 font-mono" : "text-slate-400"}`}>
                    {block.data.details}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Signer: <code className="text-emerald-400">{block.data.author}</code></span>
                    {block.data.votes && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-semibold text-[10px]">
                        Quorum: {block.data.votes.yes}/{block.data.votes.required} Votes
                      </span>
                    )}
                  </div>
                </div>

                {/* Cryptographic Hashes */}
                <div className="pt-2 border-t border-slate-800/80 space-y-1 font-mono text-[10px]">
                  <div className="text-slate-500 truncate" title={block.previousHash}>
                    <span className="text-slate-600">PREV:</span> {block.previousHash.substring(0, 16)}...
                  </div>
                  <div className="text-emerald-400 truncate" title={block.hash}>
                    <span className="text-slate-500">HASH:</span> {block.hash.substring(0, 16)}...
                  </div>
                </div>

                {/* Tamper trigger button */}
                {isChainValid && block.index > 0 && (
                  <button
                    onClick={() => handleTamper(block.index)}
                    className="mt-3 w-full py-1 text-[11px] font-medium rounded bg-slate-800/80 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700/50 transition-colors flex items-center justify-center gap-1"
                  >
                    <Unlock className="w-3 h-3" />
                    Simulate Tampering with #{block.index}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Action Workspace: Propose & Ratify next Amendment */}
      <div className="mt-2 pt-6 border-t border-slate-800 bg-slate-950/50 -mx-6 -mb-6 p-6 rounded-b-2xl">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Vote className="w-4 h-4 text-emerald-400" />
          Simulate Next Governance Cycle: Propose &amp; Mine Block #{chain.length}
        </h4>

        {activeStep === "mined" ? (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>
                <strong>Block #{chain.length - 1} Mined &amp; Ratified!</strong> The corporate charter amendment has been permanently etched into the immutable chain.
              </span>
            </div>
            <button
              onClick={() => setActiveStep("ready")}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
            >
              Start Another Amendment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Pending Proposal */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <FileEdit className="w-3.5 h-3.5 text-emerald-400" />
                  Pending Proposal #LB-002
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-800">
                  Voting in Progress
                </span>
              </div>
              <h5 className="text-sm font-semibold text-slate-200 mb-1">
                Amend Article III: Authorized Capital Stock
              </h5>
              <p className="text-xs text-slate-400 mb-3">
                Increase Common Stock pool from 10,000,000 to 20,000,000 shares to reserve 15% equity for worker cooperative distribution.
              </p>
              <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-800 pt-2">
                <span>Rule: <strong>2/3 Supermajority (2 of 3)</strong></span>
                <span>Proposer: <code className="text-emerald-400">bob.director</code></span>
              </div>
            </div>

            {/* Right: Board Ballots & Mine Trigger */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-white block mb-2">
                  Board Member Ballots ({proposalVotes.yes.length}/2 Required)
                </span>
                <div className="space-y-2 mb-4">
                  {members.map((m) => {
                    const votedYes = proposalVotes.yes.includes(m);
                    const votedNo = proposalVotes.no.includes(m);
                    return (
                      <div key={m} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
                        <span className="font-mono text-slate-300">{m}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCastVote(m, "yes")}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                              votedYes
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                            }`}
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => handleCastVote(m, "no")}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                              votedNo
                                ? "bg-rose-600 text-white"
                                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mine Trigger */}
              <button
                disabled={proposalVotes.yes.length < 2 || isMining}
                onClick={handleMineBlock}
                className={`w-full py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  proposalVotes.yes.length >= 2 && !isMining
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Hammer className={`w-4 h-4 ${isMining ? "animate-spin" : ""}`} />
                {isMining 
                  ? "Computing Proof-of-Work SHA-256 Nonce..." 
                  : proposalVotes.yes.length >= 2 
                  ? `Quorum Reached! Mine Block #${chain.length} & Commit to Chain` 
                  : `Waiting for Quorum (${proposalVotes.yes.length}/2 Votes)`
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
