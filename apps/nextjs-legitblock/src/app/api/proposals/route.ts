export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getVotingEngine, getBlockchain, saveAll, getUserFromRequest } from "@/lib/ledger";
import { ProposalType, DefaultVotingRules, VotingRuleType } from "@legitblock/legitblock-utils";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status") || undefined;
  const engine = getVotingEngine();
  const bc = getBlockchain();

  const members = bc.getMembers();
  const list = engine.listProposals({ status });

  // Update tallies with current member count
  const enriched = list.map(p => {
    p.updateStatus(members.length || 1);
    return p.toJSON();
  });

  return NextResponse.json({ proposals: enriched, count: enriched.length });
}

export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req);
    const body = await req.json();
    const {
      title,
      description = "",
      type = ProposalType.GOVERNANCE_RULE_CHANGE,
      targetDocumentId = null,
      targetDocumentTitle = null,
      documentData = {},
      votingRuleType = VotingRuleType.SIMPLE_MAJORITY
    } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const proposer = user
      ? { id: user.username, name: user.name || user.username }
      : { id: "member", name: "Voting Member" };

    const rule = DefaultVotingRules[votingRuleType] || DefaultVotingRules[VotingRuleType.SIMPLE_MAJORITY];
    const engine = getVotingEngine();

    const proposal = engine.createProposal({
      type,
      title,
      description,
      proposer,
      targetDocumentId,
      targetDocumentTitle,
      documentData,
      votingRule: rule
    });

    saveAll();

    return NextResponse.json({ success: true, proposal });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
