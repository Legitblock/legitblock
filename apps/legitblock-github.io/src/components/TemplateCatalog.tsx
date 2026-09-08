"use client";

import React, { useState, useMemo } from "react";
import { TEMPLATES_DATA, TemplateItem } from "@/content/templateData";
import { 
  Building2, 
  HeartHandshake, 
  Users2, 
  Search, 
  FileText, 
  CheckCircle2, 
  Scale, 
  ChevronRight,
  ExternalLink,
  ShieldAlert
} from "lucide-react";

export function TemplateCatalog() {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "for-profit" | "non-profit" | "cooperative">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTemplate, setActiveTemplate] = useState<TemplateItem | null>(null);

  const filteredTemplates = useMemo(() => {
    return TEMPLATES_DATA.filter((t) => {
      const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        t.name.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              selectedCategory === "all"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Templates ({TEMPLATES_DATA.length})
          </button>
          <button
            onClick={() => setSelectedCategory("for-profit")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              selectedCategory === "for-profit"
                ? "bg-white text-emerald-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            For-Profit (12)
          </button>
          <button
            onClick={() => setSelectedCategory("non-profit")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              selectedCategory === "non-profit"
                ? "bg-white text-blue-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 text-blue-600" />
            Non-Profit (12)
          </button>
          <button
            onClick={() => setSelectedCategory("cooperative")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              selectedCategory === "cooperative"
                ? "bg-white text-amber-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users2 className="w-3.5 h-3.5 text-amber-600" />
            Cooperatives (8)
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search 32 templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-full sm:w-64 bg-white"
          />
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => {
          const isForProfit = template.category === "for-profit";
          const isNonProfit = template.category === "non-profit";

          return (
            <div
              key={template.id}
              onClick={() => setActiveTemplate(template)}
              className="group bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    isForProfit
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : isNonProfit
                      ? "bg-blue-50 text-blue-800 border-blue-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}>
                    {template.category}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {template.initialDocuments?.length || 0} Docs
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-2 text-sm leading-snug">
                  {template.name}
                </h4>

                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                  {template.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="truncate max-w-[170px]">
                  <strong>Quorum:</strong> {template.governance?.defaultQuorumPercentage || 50}%
                </span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-xs">
                  Inspect <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500">No organizational templates found matching your search.</p>
        </div>
      )}

      {/* Template Detail Modal */}
      {activeTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 mb-2 inline-block">
                  {activeTemplate.category}
                </span>
                <h3 className="text-xl font-bold text-slate-900">{activeTemplate.name}</h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">Template ID: {activeTemplate.id}</p>
              </div>
              <button
                onClick={() => setActiveTemplate(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              {activeTemplate.description}
            </p>

            {/* Governance Specifications */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-emerald-600" />
                On-Chain Governance Parameters
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Governing Body:</span>
                  <span className="font-semibold text-slate-800">{activeTemplate.governance.governingBody}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Voting Method:</span>
                  <span className="font-semibold text-slate-800 capitalize">{activeTemplate.governance.votingMethod}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Default Quorum:</span>
                  <span className="font-semibold text-emerald-700">{activeTemplate.governance.defaultQuorumPercentage}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Pass Threshold:</span>
                  <span className="font-semibold text-emerald-700">{activeTemplate.governance.defaultPassingThresholdPercentage}%</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px]">Officer Roles:</span>
                  <span className="font-medium text-slate-700">{activeTemplate.governance.officerRoles?.join(", ")}</span>
                </div>
              </div>
            </div>

            {/* Initial Documents List */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                Pre-Packaged Legal Documents ({activeTemplate.initialDocuments?.length || 0})
              </h4>
              <div className="space-y-3">
                {activeTemplate.initialDocuments?.map((doc) => (
                  <div key={doc.id} className="p-3.5 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-slate-900">{doc.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        v{doc.version} • {doc.category}
                      </span>
                    </div>
                    <pre className="text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-lg overflow-x-auto max-h-36 whitespace-pre-wrap">
                      {doc.content.substring(0, 320)}...
                    </pre>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveTemplate(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
