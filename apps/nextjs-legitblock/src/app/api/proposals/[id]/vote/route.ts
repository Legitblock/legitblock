import { NextResponse } from "next/server";
import { getVotingEngine, getBlockchain, saveAll, getUserFromRequest } from "@/lib/ledger";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    const body = await req.json();
    const { decision, voterId, voterName, signature } = body;

    if (!decision || !["APPROVE", "REJECT", "ABSTAIN"].includes(decision)) {
      return NextResponse.json({ error: "Decision must be APPROVE, REJECT, or ABSTAIN" }, { status: 400 });
    }

    const voterIdentifier = user ? user.username : (voterId || "member-" + Date.now());
    const voterDisplayName = user ? (user.name || user.username) : (voterName || voterIdentifier);

    const bc = getBlockchain();
    const members = bc.getMembers();
    const engine = getVotingEngine();

    const proposal = engine.castVote({
      proposalId: params.id,
      voterId: voterIdentifier,
      voterName: voterDisplayName,
      decision,
      signature: signature || null,
      totalEligibleMembers: members.length || 1
    });

    saveAll();

    return NextResponse.json({
      success: true,
      proposal: proposal.toJSON(),
      tally: proposal.tally
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
