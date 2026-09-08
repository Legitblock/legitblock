import React from "react";
import Link from "next/link";
import { ShieldCheck, Heart, Github, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              LegitBlock
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Open-source cryptographic governance for modern organizations. Immutable documents, democratic voting quorum, and automated tamper-proof legal recordkeeping.
            </p>
            <div className="flex items-center gap-3 text-sm">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">
                MIT Licensed
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono">
                DGCL § 219/224
              </span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Core Architecture
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/why-blockchain" className="hover:text-white transition-colors">Why Blockchain?</Link></li>
              <li><Link href="/architecture" className="hover:text-white transition-colors">System Architecture</Link></li>
              <li><Link href="/core-library" className="hover:text-white transition-colors">legitblock-utils Library</Link></li>
              <li><Link href="/core-library#voting-rules" className="hover:text-white transition-colors">Quorum & Thresholds</Link></li>
              <li><Link href="/core-library#diff-engine" className="hover:text-white transition-colors">Structured Diff Engine</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Applications & Tools
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/web-app" className="hover:text-white transition-colors">Next.js Web Portal</Link></li>
              <li><Link href="/cli" className="hover:text-white transition-colors">Ink Terminal CLI ($EDITOR)</Link></li>
              <li><Link href="/templates" className="hover:text-white transition-colors">32 Organization Templates</Link></li>
              <li><Link href="/api-reference" className="hover:text-white transition-colors">REST API Reference</Link></li>
              <li><Link href="/playground" className="hover:text-white transition-colors">Interactive Sandbox</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Organization Types
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/templates?cat=for-profit" className="hover:text-white transition-colors">C-Corp, S-Corp, LLC, Series LLC</Link></li>
              <li><Link href="/templates?cat=non-profit" className="hover:text-white transition-colors">501(c)(3) Charities & Foundations</Link></li>
              <li><Link href="/templates?cat=cooperative" className="hover:text-white transition-colors">Worker & Housing Cooperatives</Link></li>
              <li><Link href="/templates?cat=cooperative" className="hover:text-white transition-colors">Platform Co-ops & Mutual Aid</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} LegitBlock Project. Designed for legal precision and mathematical trust.</p>
          <div className="flex items-center gap-6">
            <Link href="/why-blockchain" className="hover:text-slate-300">Legal Whitepaper</Link>
            <Link href="/architecture" className="hover:text-slate-300">Security Model</Link>
            <a href="https://github.com/legitblock/legitblock" target="_blank" rel="noreferrer" className="hover:text-slate-300 flex items-center gap-1">
              GitHub <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
