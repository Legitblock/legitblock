"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShieldCheck, 
  BookOpen, 
  Layers, 
  Terminal, 
  FileText, 
  Cpu, 
  PlayCircle,
  Menu,
  X,
  ExternalLink
} from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/why-blockchain", label: "Why Blockchain?", highlight: true },
    { href: "/architecture", label: "Architecture" },
    { href: "/core-library", label: "Core Library" },
    { href: "/web-app", label: "Web App" },
    { href: "/cli", label: "Ink CLI" },
    { href: "/templates", label: "Templates (32)" },
    { href: "/api-reference", label: "API Reference" },
    { href: "/playground", label: "Sandbox", icon: PlayCircle }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xl tracking-tight text-slate-900">LegitBlock</span>
                  <span className="px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    v0.1.0
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">Cryptographic Organizational Governance</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 font-semibold"
                      : link.highlight
                      ? "text-emerald-700 hover:bg-emerald-50/70"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-emerald-600" />}
                  {link.label}
                  {link.highlight && !isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/playground"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-100/80 hover:bg-emerald-200/80 transition-colors border border-emerald-300/60"
            >
              <PlayCircle className="w-4 h-4" />
              Interactive Demo
            </Link>
            <a
              href="https://github.com/legitblock/legitblock"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="GitHub Repository"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-medium ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-100 flex gap-2">
            <Link
              href="/playground"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 px-4 rounded-lg bg-emerald-600 text-white font-medium text-sm"
            >
              Try Interactive Sandbox
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
