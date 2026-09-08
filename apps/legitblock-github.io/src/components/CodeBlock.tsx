"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({ code, language = "bash", title, showLineNumbers = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code", err);
    }
  };

  const lines = code.trim().split("\n");

  return (
    <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 my-4 shadow-lg">
      {(title || language) && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            {language === "bash" || language === "sh" ? (
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            )}
            <span className="font-mono font-medium text-slate-300">{title || language}</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-[11px]"
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}

      <div className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed">
        {showLineNumbers ? (
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40">
                  <td className="pr-4 select-none text-slate-600 text-right w-8">{idx + 1}</td>
                  <td className="text-slate-200 whitespace-pre">{line}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <pre className="text-slate-200 whitespace-pre">
            <code>{code.trim()}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
