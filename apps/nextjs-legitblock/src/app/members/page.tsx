"use client";

import React, { useEffect, useState } from "react";
import { Users, Shield, CheckCircle2, UserCheck } from "lucide-react";

export default function MembersPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/members")
      .then(res => res.json())
      .then(res => setData(res))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-20 text-center text-slate-500 text-sm">Loading members directory...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-emerald-600" />
          <span>Members & Stakeholders Directory</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Directory of registered voting members synchronized between the LDAP directory and the LegitBlock blockchain.
        </p>
      </div>

      {/* Blockchain Registered Members */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Ratified Blockchain Voting Members ({data?.chainMembers?.length || 0})</span>
        </h2>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-2.5 text-left font-semibold">Member Name</th>
                <th className="px-4 py-2.5 text-left font-semibold">ID / UID</th>
                <th className="px-4 py-2.5 text-left font-semibold">Role</th>
                <th className="px-4 py-2.5 text-center font-semibold">Voting Weight</th>
                <th className="px-4 py-2.5 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {(data?.chainMembers || []).map((m: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-bold text-slate-900">{m.name}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-500">{m.id}</td>
                  <td className="px-4 py-2.5 text-slate-700">{m.role}</td>
                  <td className="px-4 py-2.5 text-center font-semibold text-emerald-700">{m.votingWeight || 1}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LDAP Directory Members */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-blue-600" />
          <span>LDAP Organizational Directory</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {(data?.directoryMembers || []).map((u: any, idx: number) => (
            <div key={idx} className="p-3.5 border border-slate-200 rounded-lg bg-slate-50 space-y-1">
              <div className="font-bold text-xs text-slate-900">{u.name}</div>
              <div className="text-[11px] text-slate-500">{u.email}</div>
              <div className="text-[10px] text-emerald-700 font-semibold">{u.title}</div>
              <div className="text-[10px] font-mono text-slate-400 truncate mt-1">DN: {u.dn}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
