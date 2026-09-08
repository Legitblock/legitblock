export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getBlockchain, getVotingEngine, saveAll, getUserFromRequest } from "@/lib/ledger";
import { ProposalType } from "@legitblock/legitblock-utils";

export async function GET() {
  const bc = getBlockchain();
  const docs = bc.getAllDocuments();
  return NextResponse.json({ documents: docs, count: docs.length });
}

export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req);
    const body = await req.json();
    const { title, category = "operational", content = "", description = "" } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Document title and content are required" }, { status: 400 });
    }

    const docId = "doc-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
    const engine = getVotingEngine();

    // Any new document requires a vote through the blockchain!
    const proposer = user
      ? { id: user.username, name: user.name || user.username }
      : { id: "anonymous-member", name: "Anonymous Member" };

    const proposal = engine.createProposal({
      type: ProposalType.NEW_DOCUMENT,
      title: `Adopt New Document: ${title}`,
      description: description || `Proposal to ratify and insert new organizational document "${title}".`,
      proposer,
      targetDocumentId: docId,
      targetDocumentTitle: title,
      documentData: {
        category,
        content,
        proposedVersion: "1.0"
      }
    });

    saveAll();

    return NextResponse.json({
      success: true,
      message: "Proposal created to adopt new document. Requires blockchain vote to ratify.",
      proposalId: proposal.id,
      proposal
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
