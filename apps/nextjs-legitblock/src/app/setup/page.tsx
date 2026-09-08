"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Building2,
  HeartHandshake,
  Users,
  FileText,
  Vote,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Search,
  Sparkles,
  Plus,
  Trash2,
  Cpu
} from "lucide-react";

export default function SetupWizardPage() {
  const router = useRouter();

  // Wizard step: 1 (Template), 2 (Details), 3 (Founding Members), 4 (Review Documents), 5 (Founding Vote & Genesis)
  const [step, setStep] = useState(1);

  // Templates
  const [categories, setCategories] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("c_corp");
  const [selectedTemplateFull, setSelectedTemplateFull] = useState<any>(null);

  // Form State
  const [orgName, setOrgName] = useState("LegitBlock Innovations Inc.");
  const [jurisdiction, setJurisdiction] = useState("Delaware");
  const [votingRuleType, setVotingRuleType] = useState("SIMPLE_MAJORITY");

  // Founding Members
  const [members, setMembers] = useState<any[]>([
    { id: "alice", name: "Alice Walker", email: "alice@legitblock.org", role: "Board President", votingWeight: 1 },
    { id: "bob", name: "Bob Chen", email: "bob@legitblock.org", role: "Corporate Secretary", votingWeight: 1 },
    { id: "carol", name: "Carol Martinez", email: "carol@legitblock.org", role: "Treasurer / CFO", votingWeight: 1 },
  ]);

  // Initial Documents
  const [documents, setDocuments] = useState<any[]>([]);
  const [activeDocIndex, setActiveDocIndex] = useState(0);

  // Founding Vote State
  const [founderVotes, setFounderVotes] = useState<Record<string, string>>({
    alice: "APPROVE",
    bob: "APPROVE",
    carol: "APPROVE",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [genesisSuccess, setGenesisSuccess] = useState<any>(null);

  // Load templates list
  useEffect(() => {
    fetch("/api/templates")
      .then(res => res.json())
      .then(data => {
        setCategories(data.categories || []);
        setTemplates(data.templates || []);
      });
  }, []);

  // When selectedTemplateId changes, fetch full template details
  useEffect(() => {
    if (!selectedTemplateId) return;
    fetch(`/api/templates/${selectedTemplateId}`)
      .then(res => res.json())
      .then(full => {
        setSelectedTemplateFull(full);
        setDocuments(full.initialDocuments || []);
        if (full.name) {
          if (full.category === "cooperative") {
            setOrgName("Community Democracy Cooperative");
          } else if (full.category === "non-profit") {
            setOrgName("Global Public Benefit Foundation");
          } else {
            setOrgName("Pioneer Enterprise Inc.");
          }
        }
      });
  }, [selectedTemplateId]);

  const filteredTemplates = templates.filter(t => {
    const matchesCat = selectedCategory === "all" || t.category === selectedCategory;
    const matchesQuery = !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleDocumentChange = (index: number, newContent: string) => {
    const updated = [...documents];
    updated[index] = { ...updated[index], content: newContent };
    setDocuments(updated);
  };

  const handleAddMember = () => {
    const newId = `founder-${members.length + 1}`;
    setMembers([...members, { id: newId, name: `Founder ${members.length + 1}`, email: `${newId}@org.local`, role: "Member", votingWeight: 1 }]);
    setFounderVotes(prev => ({ ...prev, [newId]: "APPROVE" }));
  };

  const handleRemoveMember = (idx: number) => {
    const memberToRemove = members[idx];
    setMembers(members.filter((_, i) => i !== idx));
    setFounderVotes(prev => {
      const copy = { ...prev };
      delete copy[memberToRemove.id];
      return copy;
    });
  };

  const handleVoteToggle = (memberId: string, decision: string) => {
    setFounderVotes(prev => ({ ...prev, [memberId]: decision }));
  };

  const handleInitializeBlockchain = async () => {
    setError("");
    setLoading(true);

    try {
      const approvals = Object.entries(founderVotes)
        .filter(([_, dec]) => dec === "APPROVE")
        .map(([id]) => id);

      if (approvals.length === 0) {
        throw new Error("At least one founding member must vote APPROVE to ratify the founding documents.");
      }

      const res = await fetch("/api/blockchain/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgName,
          orgType: selectedTemplateId,
          jurisdiction,
          foundingMembers: members,
          initialDocuments: documents,
          initialVoteApprovals: approvals,
          governanceRules: {
            votingRuleType,
            governingBody: selectedTemplateFull?.governance?.governingBody || "Board of Directors"
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize blockchain");
      }

      setGenesisSuccess(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6">
      {/* Stepper Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-emerald-600" />
          <span>LegitBlock Genesis Setup Wizard</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Create an organizational blockchain from scratch, select founding documents, and conduct the founding ratification vote.
        </p>

        {/* Progress Bar Steps */}
        <div className="flex items-center justify-between mt-6 bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-xs font-medium">
          {[
            { s: 1, label: "1. Entity Template", icon: Building2 },
            { s: 2, label: "2. Details & Governance", icon: ShieldCheck },
            { s: 3, label: "3. Founding Members", icon: Users },
            { s: 4, label: "4. Founding Documents", icon: FileText },
            { s: 5, label: "5. Founding Vote & Genesis", icon: Vote },
          ].map((item) => {
            const Icon = item.icon;
            const isDone = step > item.s;
            const isCurrent = step === item.s;
            return (
              <div
                key={item.s}
                className={`flex items-center gap-1.5 px-2 py-1 rounded transition ${
                  isCurrent
                    ? "bg-emerald-50 text-emerald-700 font-bold border border-emerald-200"
                    : isDone
                    ? "text-slate-700 font-medium"
                    : "text-slate-400"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* STEP 1: Template Selection */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Select Organization Entity Template</h2>
            <p className="text-sm text-slate-600 mb-4">
              Choose from 32+ comprehensive pre-built templates covering For-Profit Corporations, LLCs, Partnerships, Non-Profit Charities, and Cooperatives.
            </p>

            {/* Category Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    selectedCategory === "all"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  All Templates ({templates.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                      selectedCategory === cat.id
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {cat.name} ({cat.count})
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[460px] overflow-y-auto p-1 border border-slate-100 rounded-lg">
              {filteredTemplates.map((t) => {
                const isSelected = selectedTemplateId === t.id;
                let badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
                if (t.category === "cooperative") badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                if (t.category === "non-profit") badgeColor = "bg-purple-50 text-purple-700 border-purple-200";

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTemplateId(t.id)}
                    className={`p-3.5 rounded-lg border text-left cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badgeColor} capitalize`}>
                          {t.category.replace("-", " ")}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {t.documentCount} docs
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 leading-snug mb-1">{t.name}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2 mb-2">{t.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100/80 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>{t.governance?.governingBody}</span>
                      <span className="font-semibold text-emerald-700">{isSelected ? "Selected ✓" : "Select"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition"
            >
              <span>Next: Details & Governance</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Details & Governance */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-slate-900">Configure Organization Details</h2>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Legal Entity Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Jurisdiction / State
                </label>
                <input
                  type="text"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Selected Entity Template
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedTemplateFull?.name || selectedTemplateId}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Default Blockchain Governance & Voting Rule
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {[
                  { id: "SIMPLE_MAJORITY", name: "Simple Majority (>50%)", desc: "Standard corporate & cooperative majority rule with 50% quorum." },
                  { id: "TWO_THIRDS_SUPERMAJORITY", name: "Two-Thirds Supermajority (66.7%)", desc: "Recommended for fundamental Bylaw amendments and mergers." },
                  { id: "THREE_QUARTERS_SUPERMAJORITY", name: "Three-Quarters Supermajority (75%)", desc: "Strict standard for admission of worker-owners or charter amendments." },
                  { id: "CONSENSUS", name: "Consensus Governance", desc: "Consensus process where zero blocks/vetos are permitted." },
                ].map((rule) => (
                  <div
                    key={rule.id}
                    onClick={() => setVotingRuleType(rule.id)}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition ${
                      votingRuleType === rule.id
                        ? "border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-semibold text-sm text-slate-900">{rule.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{rule.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 text-sm font-medium flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition"
            >
              <span>Next: Founding Members</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Founding Members */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Founding Members & Board</h2>
                <p className="text-xs text-slate-500">
                  These initial members will be registered in the Genesis block and will cast the initial ratification vote.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddMember}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Member
              </button>
            </div>

            <div className="space-y-2.5">
              {members.map((m, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                    <input
                      type="text"
                      placeholder="Name"
                      value={m.name}
                      onChange={(e) => {
                        const copy = [...members];
                        copy[idx].name = e.target.value;
                        setMembers(copy);
                      }}
                      className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded outline-none"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={m.email}
                      onChange={(e) => {
                        const copy = [...members];
                        copy[idx].email = e.target.value;
                        setMembers(copy);
                      }}
                      className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Role (e.g. Director)"
                      value={m.role}
                      onChange={(e) => {
                        const copy = [...members];
                        copy[idx].role = e.target.value;
                        setMembers(copy);
                      }}
                      className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded outline-none"
                    />
                  </div>
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 text-sm font-medium flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition"
            >
              <span>Next: Review Initial Documents</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Review Founding Documents */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Review & Edit Initial Founding Documents</h2>
              <p className="text-xs text-slate-500">
                These documents will be inserted into the blockchain during genesis once ratified by the initial vote.
              </p>
            </div>

            {/* Document Tabs */}
            <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
              {documents.map((d, idx) => (
                <button
                  key={d.id || idx}
                  type="button"
                  onClick={() => setActiveDocIndex(idx)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                    activeDocIndex === idx
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {d.title}
                </button>
              ))}
            </div>

            {documents[activeDocIndex] && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Category: <strong className="uppercase">{documents[activeDocIndex].category}</strong></span>
                  <span>Version: <strong>{documents[activeDocIndex].version || "1.0"}</strong></span>
                </div>
                <textarea
                  rows={14}
                  value={documents[activeDocIndex].content}
                  onChange={(e) => handleDocumentChange(activeDocIndex, e.target.value)}
                  className="w-full p-3 font-mono text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                />
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 text-sm font-medium flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              type="button"
              onClick={() => setStep(5)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition"
            >
              <span>Next: Initial Founding Vote</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Initial Founding Vote & Genesis */}
      {step === 5 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Vote className="w-5 h-5 text-emerald-600" />
                <span>Conduct Initial Founding Vote</span>
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Before the blockchain genesis block can be mined, the founding members must officially cast an affirmative vote to ratify the initial documents ({documents.map(d => d.title).join(", ")}).
              </p>
            </div>

            {/* Voting Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-semibold">Founding Member</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Role</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Ratification Vote</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {members.map((m) => {
                    const currentVote = founderVotes[m.id] || "APPROVE";
                    return (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-medium text-slate-900">{m.name}</td>
                        <td className="px-4 py-2.5 text-slate-500">{m.role}</td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="inline-flex rounded-md shadow-sm">
                            <button
                              type="button"
                              onClick={() => handleVoteToggle(m.id, "APPROVE")}
                              className={`px-3 py-1 rounded-l-md text-xs font-semibold transition ${
                                currentVote === "APPROVE"
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              }`}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleVoteToggle(m.id, "REJECT")}
                              className={`px-3 py-1 rounded-r-md text-xs font-semibold transition ${
                                currentVote === "REJECT"
                                  ? "bg-rose-600 text-white"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              }`}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary Box */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1 text-slate-600">
              <div><strong>Organization:</strong> {orgName} ({selectedTemplateFull?.name})</div>
              <div><strong>Jurisdiction:</strong> {jurisdiction}</div>
              <div><strong>Initial Documents:</strong> {documents.length} ({documents.map(d => d.title).join(", ")})</div>
              <div><strong>Founding Approvals:</strong> {Object.values(founderVotes).filter(v => v === "APPROVE").length} of {members.length} Founders Approving</div>
            </div>

            {/* Mine Genesis Button */}
            {!genesisSuccess ? (
              <button
                type="button"
                disabled={loading}
                onClick={handleInitializeBlockchain}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                <Cpu className="w-5 h-5" />
                <span>{loading ? "Mining Genesis Block & Generating Cryptographic Ledger..." : "Mine Genesis Block & Launch Organization Blockchain"}</span>
              </button>
            ) : (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-emerald-900">Blockchain Successfully Initialized!</h3>
                <p className="text-xs text-emerald-800">
                  Genesis Block #0 has been mined. Initial documents ratified and permanently recorded on the LegitBlock ledger.
                </p>
                <div className="text-[11px] font-mono bg-white p-2.5 rounded border border-emerald-300 text-slate-700 break-all">
                  Hash: {genesisSuccess.genesisBlock?.hash}
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition"
                >
                  Go to Organization Dashboard
                </button>
              </div>
            )}
          </div>

          {!genesisSuccess && (
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 text-sm font-medium flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
