import { NextResponse } from "next/server";
import { getVotingEngine, getBlockchain, saveAll, getUserFromRequest } from "@/lib/ledger";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Active authenticated session required to vote" }, { status: 401 });
    }

    const body = await req.json();
    const { decision, signature } = body;

    if (!decision || !["APPROVE", "REJECT", "ABSTAIN"].includes(decision)) {
      return NextResponse.json({ error: "Decision must be APPROVE, REJECT, or ABSTAIN" }, { status: 400 });
    }

    const voterIdentifier = user.username;
    const voterDisplayName = user.name || user.username;

    const bc = getBlockchain();
    const members = bc.getMembers();

    // Verify voter is a recognized member
    if (!members || members.length === 0) {
      return NextResponse.json({ error: "Forbidden: No eligible voting members are configured for this organization" }, { status: 403 });
    }
    const isMember = members.some((m: any) => m.id === voterIdentifier || m.username === voterIdentifier);
    if (!isMember) {
      return NextResponse.json({ error: "Forbidden: User is not an active eligible member of this organization" }, { status: 403 });
    }

    const engine = getVotingEngine();
    const existingProp = engine.getProposal(params.id);
    if (!existingProp) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    if (existingProp.votes && existingProp.votes[voterIdentifier]) {
      return NextResponse.json({ error: "Conflict: Member has already cast a vote on this proposal" }, { status: 409 });
    }

    const proposal = engine.castVote({
      proposalId: params.id,
      voterId: voterIdentifier,
      voterName: voterDisplayName,
      decision,
      signature: signature || null,
      totalEligibleMembers: members.length
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
