"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldCheck, FileText, Vote, Layers, Users, LogIn, LogOut, CheckCircle, AlertTriangle, Compass } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.ok ? res.json() : { authenticated: false })
      .then(data => {
        if (data.authenticated) setUser(data.user);
      })
      .catch(() => {});

    fetch("/api/blockchain/status")
      .then(res => res.json())
      .then(data => setStatus(data))
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  const navItems = [
    { href: "/", label: "Dashboard", icon: Compass },
    { href: "/setup", label: "Setup Wizard", icon: ShieldCheck },
    { href: "/documents", label: "Documents", icon: FileText },
    { href: "/proposals", label: "Voting", icon: Vote },
    { href: "/blockchain", label: "Explorer", icon: Layers },
    { href: "/members", label: "Members", icon: Users },
  ];

  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2 font-bold text-xl tracking-tight text-emerald-400">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
              <span>LegitBlock</span>
            </Link>
            {status?.isInitialized && (
              <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                <CheckCircle className="w-3 h-3 mr-1 text-emerald-400" />
                Block #{status.blockHeight - 1} | {status.organization?.name}
              </span>
            )}
            {status && !status.isInitialized && (
              <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-950 text-amber-300 border border-amber-800">
                <AlertTriangle className="w-3 h-3 mr-1 text-amber-400" />
                Uninitialized
              </span>
            )}
          </div>

          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-800 text-emerald-400"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-white">{user.name}</div>
                  <div className="text-xs text-emerald-400 capitalize">{user.role} ({user.title})</div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-md text-sm font-medium transition shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>LDAP Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
