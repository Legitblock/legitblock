"use client";

import React from "react";

interface DiffViewerProps {
  diffText?: string;
  diffLines?: Array<{ type: "added" | "removed" | "unchanged"; line: string }>;
}

export function DiffViewer({ diffText, diffLines }: DiffViewerProps) {
  if (diffLines && diffLines.length > 0) {
    return (
      <div className="font-mono text-xs bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto border border-slate-800 space-y-0.5">
        {diffLines.map((item, idx) => {
          let bgClass = "text-slate-300";
          let symbol = " ";
          if (item.type === "added") {
            bgClass = "bg-emerald-950/60 text-emerald-300 font-semibold";
            symbol = "+";
          } else if (item.type === "removed") {
            bgClass = "bg-rose-950/60 text-rose-300 line-through opacity-80";
            symbol = "-";
          }
          return (
            <div key={idx} className={`px-2 py-0.5 rounded ${bgClass} whitespace-pre-wrap break-all`}>
              <span className="select-none inline-block w-4 opacity-50">{symbol}</span>
              {item.line}
            </div>
          );
        })}
      </div>
    );
  }

  if (diffText) {
    const rawLines = diffText.split("\n");
    return (
      <div className="font-mono text-xs bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto border border-slate-800 space-y-0.5">
        {rawLines.map((line, idx) => {
          let color = "text-slate-300";
          if (line.startsWith("+") && !line.startsWith("+++")) {
            color = "bg-emerald-950/60 text-emerald-300 font-semibold";
          } else if (line.startsWith("-") && !line.startsWith("---")) {
            color = "bg-rose-950/60 text-rose-300 line-through opacity-80";
          } else if (line.startsWith("@@")) {
            color = "text-cyan-400 font-bold";
          }
          return (
            <div key={idx} className={`px-2 py-0.5 rounded ${color} whitespace-pre-wrap break-all`}>
              {line}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded border border-slate-200">
      No diff content available.
    </div>
  );
}
