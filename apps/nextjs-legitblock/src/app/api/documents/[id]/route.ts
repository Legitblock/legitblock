import { NextResponse } from "next/server";
import { getBlockchain, getVotingEngine, saveAll, getUserFromRequest } from "@/lib/ledger";
import { ProposalType, computeUnifiedDiff } from "@legitblock/legitblock-utils";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const bc = getBlockchain();
  const docs = bc.getAllDocuments();
  const doc = docs.find(d => d.id === params.id);

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const history = bc.getDocumentHistory(params.id);
  return NextResponse.json({ document: doc, history });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    const bc = getBlockchain();
    const docs = bc.getAllDocuments();
    const existingDoc = docs.find(d => d.id === params.id);

    if (!existingDoc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const body = await req.json();
    const { newContent, title, proposalTitle, proposalDescription } = body;

    if (!newContent) {
      return NextResponse.json({ error: "New content is required" }, { status: 400 });
    }

    // Compute diff and calculate next version
    const diff = computeUnifiedDiff(existingDoc.content, newContent, existingDoc.title);
    const prevVersionNum = parseFloat(existingDoc.version) || 1.0;
    const nextVersion = (prevVersionNum + 0.1).toFixed(1);

    const proposer = user
      ? { id: user.username, name: user.name || user.username }
      : { id: "anonymous-member", name: "Anonymous Member" };

    const engine = getVotingEngine();

    // Any document change requires a vote through the blockchain!
    const proposal = engine.createProposal({
      type: ProposalType.AMENDMENT,
      title: proposalTitle || `Amend ${existingDoc.title} to v${nextVersion}`,
      description: proposalDescription || `Proposed modifications to ${existingDoc.title}.`,
      proposer,
      targetDocumentId: existingDoc.id,
      targetDocumentTitle: existingDoc.title,
      documentData: {
        content: newContent,
        proposedVersion: nextVersion,
        diff,
        category: existingDoc.category
      }
    });

    saveAll();

    return NextResponse.json({
      success: true,
      message: "Amendment proposal created. Requires blockchain vote to ratify and update document.",
      proposalId: proposal.id,
      proposal,
      diff
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
