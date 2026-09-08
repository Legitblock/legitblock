import { NextResponse } from "next/server";
import { getVotingEngine, getBlockchain } from "@/lib/ledger";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const engine = getVotingEngine();
  const bc = getBlockchain();
  const proposal = engine.getProposal(params.id);

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  const members = bc.getMembers();
  proposal.updateStatus(members.length || 1);

  return NextResponse.json({
    proposal: proposal.toJSON(),
    totalMembers: members.length
  });
}
