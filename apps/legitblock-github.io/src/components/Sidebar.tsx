"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAVIGATION_SECTIONS } from "../lib/navigation";
import { Sparkles, ArrowRight } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:block pr-6 py-6 border-r border-slate-200 sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="space-y-8">
        {NAVIGATION_SECTIONS.map((section, idx) => (
          <div key={idx}>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href.includes("#") && pathname === item.href.split("#")[0]);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`group flex items-center justify-between px-2.5 py-1.5 text-sm rounded-lg transition-all ${
                        isActive
                          ? "bg-emerald-50 text-emerald-800 font-semibold border-l-2 border-emerald-600 pl-2"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                      }`}
                    >
                      <span className="truncate">{item.title}</span>
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          item.badge === "Essential"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : item.badge === "Interactive"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* Quick Sandbox Callout */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-200 text-emerald-950">
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Live Sandbox
          </div>
          <p className="text-xs text-slate-600 mb-3">
            Mine blocks, simulate quorum votes, and test blockchain tamper detection.
          </p>
          <Link
            href="/playground"
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            Launch simulator <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
