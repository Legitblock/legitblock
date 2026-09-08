import React from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { InteractiveChainSimulator } from "@/components/InteractiveChainSimulator";
import { 
  PlayCircle, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Hammer, 
  Lock,
  ArrowRight
} from "lucide-react";

export default function PlaygroundPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex gap-10">
        <Sidebar />

        <article className="flex-1 max-w-5xl min-w-0 space-y-10">
          {/* Header */}
          <div className="border-b border-slate-200 pb-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-300">
              <PlayCircle className="w-4 h-4 text-emerald-600" />
              <span>Browser-Based Simulator</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Interactive Blockchain &amp; Governance Sandbox
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Test how LegitBlock maintains organizational integrity in real-time. Cast member ballots to reach quorum, watch the browser calculate SHA-256 Proof-of-Work nonces, and simulate malicious tampering to observe how cryptographic hash chains expose fraud.
            </p>
          </div>

          {/* Simulator Component */}
          <InteractiveChainSimulator />

          {/* Explanation of Exercises */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
            <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <Hammer className="w-4 h-4 text-emerald-600" />
                Exercise 1: Reach Quorum
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Click &quot;Yes&quot; on 2 board member ballots above to satisfy the 2/3 Supermajority requirement. Notice how the &quot;Mine Block&quot; button unlocks only when quorum is achieved.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <Lock className="w-4 h-4 text-emerald-600" />
                Exercise 2: Mine Block
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Click &quot;Mine Block&quot;. Watch the client-side mining loop calculate SHA-256 hashes until a valid nonce is discovered, permanently appending the ratified amendment to the chain.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Exercise 3: Test Tampering
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Click &quot;Simulate Tampering with #1&quot;. Watch the entire chain turn RED as the cryptographic hash link breaks, mathematically proving that past corporate records cannot be altered.
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
