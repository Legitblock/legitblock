"use client";

import React, { useState } from "react";
import { Terminal, Play, Check, Copy } from "lucide-react";

export function TerminalDemo() {
  const [activeTab, setActiveTab] = useState<"status" | "docs" | "edit" | "vote">("edit");

  const outputs = {
    status: `$ legitblock-cli status --endpoint http://localhost:3000

🔗 LEGITBLOCK NETWORK STATUS
────────────────────────────────────────
Node Status       : Connected (Genesis verified)
Chain Length      : 4 Blocks
Pending Proposals : 1 Active Proposal
Active Documents  : 3 Ratified Documents
Local User        : alice.chair (Board Director)
Session Token     : ~/.legitblock-session.json (Valid)
Chain Integrity   : 100% Valid (All SHA-256 links verified)
────────────────────────────────────────`,

    docs: `$ legitblock-cli docs

📄 RATIFIED ORGANIZATIONAL DOCUMENTS (Chain Height: 4)
────────────────────────────────────────────────────────────
[DOC-1] Articles of Incorporation (v1.1)
  Category : founding
  Ratified : Block #2 (2026-09-08 09:12:45)
  Hash     : e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855

[DOC-2] Corporate Governance Bylaws (v1.0)
  Category : governance
  Ratified : Block #3 (2026-09-08 09:15:30)
  Hash     : a79973693a65eacf3505865664b0253e655960add8ab2461a763901b8165b22b

[DOC-3] Shareholder & Member Equity Agreement (v1.0)
  Category : governance
  Ratified : Block #4 (2026-09-08 09:20:10)
  Hash     : b45cffe084dd3d20d928bee85e7b0f211a19973d4d7a8d56b0d9e7987e91d577`,

    edit: `$ legitblock-cli edit doc-1

Launching system $EDITOR (vim)...
[Vim session closed. Changes detected.]

📝 COMPUTING STRUCTURED CRYPTOGRAPHIC DIFF:
─────────────────────────────────────────────
--- Original: doc-1 (v1.0)
+++ Proposed: doc-1 (v1.1)
@@ -10,4 +10,4 @@
 ## Article III: Authorized Capital Stock
-The total number of shares of Common Stock is 10,000,000.
+The total number of shares of Common Stock is 20,000,000.

Title: Amend Capital Stock Pool
Proposal Type: AMENDMENT
Rule: 2/3 Supermajority

✔ Proposal #PROP-2026-004 created on LegitBlock API!
Members can now cast cryptographic ballots.`,

    vote: `$ legitblock-cli vote prop-2026-004 yes --comment "Approved by Alice per Q3 board resolution"

🗳️ SUBMITTING CRYPTOGRAPHIC BALLOT
────────────────────────────────────────
Proposal ID : prop-2026-004
Member      : alice.chair
Decision    : YES
Signature   : ed25519:8f9a4c11b... (Signed with member private key)

✔ Ballot accepted by Next.js API.
Current Quorum Status:
  YES: 3 / 2 Required (100.0%)
  NO : 0

🎉 QUORUM REACHED! Proposal automatically marked PASSED.
Mining Block #5 with new document version into blockchain...
Block #5 successfully committed. Hash: 000f72a1b920...`
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl my-6">
      {/* Terminal Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
          </div>
          <span className="text-xs font-mono text-slate-400 pl-2">
            apps/ink-legitblock — Terminal Client
          </span>
        </div>

        {/* Command tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
          <button
            onClick={() => setActiveTab("edit")}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === "edit" ? "bg-emerald-950 text-emerald-300 font-bold border border-emerald-800/80" : "text-slate-400 hover:text-white"
            }`}
          >
            $ legitblock edit ($EDITOR)
          </button>
          <button
            onClick={() => setActiveTab("vote")}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === "vote" ? "bg-emerald-950 text-emerald-300 font-bold border border-emerald-800/80" : "text-slate-400 hover:text-white"
            }`}
          >
            $ legitblock vote
          </button>
          <button
            onClick={() => setActiveTab("status")}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === "status" ? "bg-emerald-950 text-emerald-300 font-bold border border-emerald-800/80" : "text-slate-400 hover:text-white"
            }`}
          >
            $ legitblock status
          </button>
          <button
            onClick={() => setActiveTab("docs")}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === "docs" ? "bg-emerald-950 text-emerald-300 font-bold border border-emerald-800/80" : "text-slate-400 hover:text-white"
            }`}
          >
            $ legitblock docs
          </button>
        </div>
      </div>

      {/* Terminal Screen */}
      <div className="p-5 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto min-h-[260px] bg-slate-950">
        <pre className="text-slate-200 whitespace-pre">{outputs[activeTab]}</pre>
      </div>
    </div>
  );
}
