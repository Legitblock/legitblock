"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, KeyRound, User, Lock, AlertCircle, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("alice");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const demoAccounts = [
    { username: "alice", role: "Board President / Founder", name: "Alice Walker" },
    { username: "bob", role: "Secretary", name: "Bob Chen" },
    { username: "carol", role: "Treasurer / CFO", name: "Carol Martinez" },
    { username: "admin", role: "System Admin", name: "Admin" },
    { username: "david", role: "Shareholder / Member", name: "David Kim" },
    { username: "elena", role: "Worker-Owner", name: "Elena Rostova" },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication failed");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 600);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-900 p-6 text-white text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mb-3">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold">LDAP Member Authentication</h1>
        <p className="text-sm text-slate-400 mt-1">Sign in with your organization directory credentials</p>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Authentication verified! Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              LDAP Username / UID
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. alice"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <KeyRound className="w-4 h-4" />
            <span>{loading ? "Authenticating via LDAP..." : "Sign In with LDAP"}</span>
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Quick Switch Demo Directory Accounts
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {demoAccounts.map((acc) => (
              <button
                key={acc.username}
                type="button"
                onClick={() => {
                  setUsername(acc.username);
                  setPassword("password123");
                }}
                className={`p-2 rounded border text-left transition ${
                  username === acc.username
                    ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="font-medium truncate">{acc.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{acc.role}</div>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 text-center">
            Default password for all demo accounts is <code className="bg-slate-100 px-1 py-0.5 rounded">password123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
