import React from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { CodeBlock } from "@/components/CodeBlock";
import { 
  FileCode, 
  Layers, 
  Lock, 
  FileText, 
  Vote, 
  Users, 
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export default function ApiReferencePage() {
  const endpoints = [
    {
      group: "Authentication & LDAP",
      routes: [
        {
          method: "POST",
          path: "/api/auth/login",
          description: "Authenticate username and password against LDAP directory; returns HTTP-only JWT session cookie.",
          body: `{ "username": "alice.chair", "password": "password123" }`,
          response: `{ "success": true, "user": { "id": "alice.chair", "role": "Director", "displayName": "Alice Smith" } }`
        },
        {
          method: "GET",
          path: "/api/auth/me",
          description: "Get currently authenticated user session and role privileges.",
          response: `{ "authenticated": true, "user": { "id": "alice.chair", "role": "Director" } }`
        },
        {
          method: "POST",
          path: "/api/auth/logout",
          description: "Clears current user authentication session cookie.",
          response: `{ "success": true }`
        }
      ]
    },
    {
      group: "Blockchain & Ledger",
      routes: [
        {
          method: "GET",
          path: "/api/blockchain/status",
          description: "Returns ledger height, genesis state, active proposals count, and cryptographic validity.",
          response: `{ "initialized": true, "blockCount": 5, "isValid": true, "difficulty": 2 }`
        },
        {
          method: "GET",
          path: "/api/blockchain/blocks",
          description: "Returns all blocks on the chain with index, timestamp, hashes, and transaction payloads.",
          response: `[ { "index": 0, "hash": "000a4...", "previousHash": "00000...", "nonce": 142 } ]`
        },
        {
          method: "POST",
          path: "/api/blockchain/genesis",
          description: "Initializes Genesis Block #0 and ratifies initial template founding documents.",
          body: `{ "templateId": "c_corp", "organizationName": "Acme Inc.", "jurisdiction": "Delaware" }`,
          response: `{ "success": true, "genesisHash": "000a4...", "blocksCreated": 4 }`
        },
        {
          method: "GET",
          path: "/api/blockchain/verify",
          description: "Performs full cryptographic audit of all hashes and previousHash links across entire history.",
          response: `{ "valid": true, "totalBlocks": 5, "auditedAt": "2026-09-08T09:12:00Z" }`
        }
      ]
    },
    {
      group: "Documents & Diffing",
      routes: [
        {
          method: "GET",
          path: "/api/documents",
          description: "Lists all currently active, ratified organizational documents on-chain.",
          response: `[ { "id": "doc-1", "title": "Articles of Incorporation", "version": "1.1", "category": "founding" } ]`
        },
        {
          method: "GET",
          path: "/api/documents/[id]",
          description: "Retrieves the complete Markdown content and ratification block history for a document.",
          response: `{ "id": "doc-1", "title": "Articles of Incorporation", "content": "# Articles...", "version": "1.1" }`
        },
        {
          method: "POST",
          path: "/api/documents/[id]/diff",
          description: "Computes unified git diff and structured line changes between active document and proposed text.",
          body: `{ "proposedContent": "# Articles of Incorporation\\nNew clause..." }`,
          response: `{ "unifiedDiff": "--- a\\n+++ b\\n...", "additions": 1, "deletions": 0 }`
        }
      ]
    },
    {
      group: "Proposals & Voting",
      routes: [
        {
          method: "GET",
          path: "/api/proposals",
          description: "Lists all governance proposals with status, quorum thresholds, and ballot tallies.",
          response: `[ { "id": "prop-1", "title": "Amend Bylaws", "status": "VOTING", "yesVotes": 2, "required": 2 } ]`
        },
        {
          method: "POST",
          path: "/api/proposals",
          description: "Creates an amendment or new document proposal on-chain.",
          body: `{ "title": "Increase Option Pool", "documentId": "doc-1", "proposedContent": "...", "rule": "SUPERMAJORITY_TWO_THIRDS" }`,
          response: `{ "success": true, "proposalId": "prop-2" }`
        },
        {
          method: "POST",
          path: "/api/proposals/[id]/vote",
          description: "Submits signed ballot. Triggers automatic block mining if vote reaches statutory quorum.",
          body: `{ "decision": "yes", "comment": "Approved per board consensus" }`,
          response: `{ "success": true, "quorumReached": true, "minedBlock": 6 }`
        }
      ]
    },
    {
      group: "Templates & Members",
      routes: [
        {
          method: "GET",
          path: "/api/templates",
          description: "Returns summary of all 32 pre-built organizational templates across 3 sectors.",
          response: `[ { "id": "c_corp", "name": "C Corporation", "category": "for-profit" } ]`
        },
        {
          method: "GET",
          path: "/api/members",
          description: "Returns list of active voting members and governance roles.",
          response: `[ { "id": "alice.chair", "displayName": "Alice Smith", "role": "Director" } ]`
        }
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex gap-10">
        <Sidebar />

        <article className="flex-1 max-w-4xl min-w-0 space-y-12">
          {/* Header */}
          <div className="border-b border-slate-200 pb-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-300">
              <FileCode className="w-4 h-4 text-emerald-600" />
              <span>REST API Reference</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Next.js LegitBlock REST API
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Complete specification for all 17 REST API endpoints provided by <code className="text-slate-900 font-mono">apps/nextjs-legitblock</code>, serving both the web application and the Ink CLI terminal client.
            </p>
          </div>

          {/* Endpoint Groups */}
          <div className="space-y-10">
            {endpoints.map((group, gIdx) => (
              <section key={gIdx} className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {group.group}
                </h2>

                <div className="space-y-4">
                  {group.routes.map((route, rIdx) => (
                    <div key={rIdx} className="p-5 rounded-xl border border-slate-200 bg-white space-y-3">
                      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          route.method === "GET" 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {route.method}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{route.path}</span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {route.description}
                      </p>

                      {route.body && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Request Payload:</span>
                          <pre className="text-[11px] font-mono bg-slate-50 p-2 rounded-lg border border-slate-200 overflow-x-auto text-slate-700">
                            {route.body}
                          </pre>
                        </div>
                      )}

                      {route.response && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Response Sample:</span>
                          <pre className="text-[11px] font-mono bg-slate-900 p-2.5 rounded-lg text-emerald-400 overflow-x-auto">
                            {route.response}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
