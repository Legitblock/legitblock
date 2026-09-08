"use client";

import React from "react";
import { CheckCircle2, XCircle, MinusCircle, Users } from "lucide-react";

interface VotingProgressBarProps {
  tally: {
    totalEligible: number;
    total: number;
    approve: number;
    reject: number;
    abstain: number;
    quorumMet?: boolean;
    thresholdMet?: boolean;
    passed?: boolean;
    reason?: string;
  };
  votingRule?: {
    name?: string;
    quorumPercentage?: number;
    passingThresholdPercentage?: number;
  };
}

export function VotingProgressBar({ tally, votingRule }: VotingProgressBarProps) {
  const eligible = tally.totalEligible || 1;
  const quorumTarget = votingRule?.quorumPercentage ?? 50;
  const passingTarget = votingRule?.passingThresholdPercentage ?? 50.01;

  const participationPct = ((tally.total / eligible) * 100).toFixed(1);
  const decidingVotes = tally.approve + tally.reject;
  const approvalPct = decidingVotes > 0 ? ((tally.approve / decidingVotes) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
      {/* Participation & Quorum */}
      <div>
        <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            Member Quorum: {tally.total} of {eligible} voted ({participationPct}%)
          </span>
          <span className={tally.quorumMet ? "text-emerald-700 font-semibold" : "text-amber-700"}>
            Target: {quorumTarget}% {tally.quorumMet ? "✓ Met" : "Pending"}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 transition-all duration-500 ${tally.quorumMet ? "bg-emerald-500" : "bg-amber-500"}`}
            style={{ width: `${Math.min(parseFloat(participationPct), 100)}%` }}
          />
        </div>
      </div>

      {/* Approval vs Rejection Bar */}
      <div>
        <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
          <span>
            Approval Rate: <strong className="text-slate-900">{approvalPct}%</strong>
          </span>
          <span className={tally.thresholdMet ? "text-emerald-700 font-semibold" : "text-slate-600"}>
            Threshold Required: {passingTarget}%
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden flex">
          <div
            className="bg-emerald-500 h-3 transition-all duration-500"
            style={{ width: `${Math.min(parseFloat(approvalPct), 100)}%` }}
            title={`Approve: ${tally.approve}`}
          />
          <div
            className="bg-rose-500 h-3 transition-all duration-500"
            style={{ width: `${decidingVotes > 0 ? (tally.reject / decidingVotes) * 100 : 0}%` }}
            title={`Reject: ${tally.reject}`}
          />
        </div>
      </div>

      {/* Breakdown Badges */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-emerald-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approve: {tally.approve}
          </span>
          <span className="flex items-center gap-1 text-rose-700 font-medium">
            <XCircle className="w-3.5 h-3.5" /> Reject: {tally.reject}
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <MinusCircle className="w-3.5 h-3.5" /> Abstain: {tally.abstain}
          </span>
        </div>
        {tally.reason && (
          <span className="italic text-slate-500 max-w-xs truncate" title={tally.reason}>
            {tally.reason}
          </span>
        )}
      </div>
    </div>
  );
}
