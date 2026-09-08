import { NextResponse } from "next/server";
import { getVotingEngine, getBlockchain, saveAll, getUserFromRequest } from "@/lib/ledger";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    const validator = user ? user.username : "system-validator";

    const bc = getBlockchain();
    const engine = getVotingEngine();

    const result = engine.executeProposal(params.id, bc, validator);
    saveAll();

    return NextResponse.json({
      success: true,
      message: "Proposal successfully executed and ratified into the LegitBlock blockchain!",
      proposal: result.proposal.toJSON(),
      block: result.block.toJSON(),
      blockHeight: bc.chain.length
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
