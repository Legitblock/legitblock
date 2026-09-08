import React from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { TemplateCatalog } from "@/components/TemplateCatalog";
import { 
  Building2, 
  HeartHandshake, 
  Users2, 
  ShieldCheck, 
  FileText,
  ArrowRight
} from "lucide-react";

export default function TemplatesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex gap-10">
        <Sidebar />

        <article className="flex-1 max-w-5xl min-w-0 space-y-10">
          {/* Header */}
          <div className="border-b border-slate-200 pb-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Legal Charters &amp; Frameworks</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Organization Template Encyclopedia (32 Templates)
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Explore 32 pre-configured, battle-tested entity charters across For-Profit Corporations, Non-Profit Charities, and Democratic Cooperatives. Each template includes complete initial founding documents, default quorum rules, and statutory governance parameters.
            </p>
          </div>

          {/* Interactive Catalog Component */}
          <TemplateCatalog />

          {/* Bottom Guidance */}
          <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-3">
            <h3 className="text-lg font-bold">Customizing Template Charters</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              All templates in LegitBlock are written in standard Markdown and can be customized before or after genesis ratification. Once ratified into a block, subsequent modifications require a democratic quorum vote through the blockchain.
            </p>
            <div className="pt-2">
              <Link
                href="/playground"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
              >
                Test Ratification in Sandbox <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
