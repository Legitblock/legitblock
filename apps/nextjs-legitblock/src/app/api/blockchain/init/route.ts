import { NextResponse } from "next/server";
import { getStore, getBlockchain, getVotingEngine, saveAll, getUserFromRequest } from "@/lib/ledger";
import { ProposalType, ProposalStatus } from "@legitblock/legitblock-utils";

export async function POST(req: Request) {
  try {
    const store = getStore();
    if (store.isInitialized()) {
      return NextResponse.json({ error: "Blockchain is already initialized" }, { status: 400 });
    }

    const body = await req.json();
    const {
      orgName,
      orgType,
      jurisdiction = "Delaware",
      foundingMembers = [],
      initialDocuments = [],
      governanceRules = {},
      initialVoteApprovals = [] // array of memberIds who voted APPROVE on founding docs
    } = body;

    if (!orgName || !orgType) {
      return NextResponse.json({ error: "Organization name and type are required" }, { status: 400 });
    }

    const user = getUserFromRequest(req);
    const validatorName = user ? user.username : (foundingMembers[0]?.name || "founder");

    const bc = getBlockchain();
    const genesisBlock = bc.initializeGenesis({
      orgName,
      orgType,
      jurisdiction,
      foundingMembers,
      initialDocuments,
      governanceRules,
      validator: validatorName
    });

    // Create the record of the initial founding ratification proposal
    const engine = getVotingEngine();
    const foundingProposal = engine.createProposal({
      id: "prop-genesis-founding",
      type: ProposalType.INITIAL_DOCUMENT,
      title: "Ratification of Organization Charter and Founding Documents",
      description: `Formal ratification of initial organizational documents and governance structure for ${orgName}.`,
      proposer: { id: validatorName, name: validatorName },
      documentData: {
        category: "founding",
        notes: "Genesis founding ratification vote"
      },
      status: ProposalStatus.ACTIVE,
      executedBlockIndex: genesisBlock.index
    });

    // Record the founder votes
    const voters = initialVoteApprovals.length > 0 ? initialVoteApprovals : foundingMembers.map((m: any) => m.id || m.username);
    for (const vId of voters) {
      const member = foundingMembers.find((m: any) => (m.id || m.username) === vId) || { name: vId };
      foundingProposal.castVote({
        voterId: vId,
        voterName: member.name,
        decision: "APPROVE"
      });
    }
    foundingProposal.calculateTally(foundingMembers.length || 1);
    foundingProposal.status = ProposalStatus.EXECUTED;

    saveAll();

    return NextResponse.json({
      success: true,
      blockHeight: bc.chain.length,
      genesisBlock,
      organization: bc.organization,
      proposal: foundingProposal
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
