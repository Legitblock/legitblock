import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "LegitBlock — Organizational Blockchain & Governance",
  description: "Maintain corporate and cooperative organizational documents, votes, and amendments on an immutable cryptographic blockchain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-100 min-h-screen flex flex-col text-slate-900 antialiased">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-center text-sm">
          <div className="max-w-7xl mx-auto px-4">
            <p>LegitBlock — Cryptographic Organizational Ledger & Democratic Voting Engine</p>
            <p className="text-xs text-slate-500 mt-1">Built with @legitblock/legitblock-utils & LDAP Authentication</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
