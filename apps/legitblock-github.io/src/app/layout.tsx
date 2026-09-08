import type { Metadata } from "next";
import "./globals.css";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export const metadata: Metadata = {
  title: "LegitBlock — Cryptographic Governance & Document Ratification Blockchain",
  description: "Maintain organizational founding documents, member voting, and complete legal history on an immutable blockchain ledger.",
  keywords: ["blockchain", "corporate governance", "founding documents", "articles of incorporation", "bylaws", "voting", "quorum", "legaltech", "DGCL 224", "cooperatives", "non-profits"]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
