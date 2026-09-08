import { NextResponse } from "next/server";
import { getBlockchain } from "@/lib/ledger";
import { getDiffLines, computeUnifiedDiff } from "@legitblock/legitblock-utils";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const bc = getBlockchain();
  const docs = bc.getAllDocuments();
  const doc = docs.find(d => d.id === params.id);

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const body = await req.json();
  const { newContent = "" } = body;

  const diffLines = getDiffLines(doc.content, newContent);
  const unified = computeUnifiedDiff(doc.content, newContent, doc.title);

  return NextResponse.json({
    documentId: doc.id,
    diffLines,
    unifiedDiff: unified
  });
}
