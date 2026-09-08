export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getStore, getBlockchain, getVotingEngine } from "@/lib/ledger";

export async function GET() {
  const store = getStore();
  const bc = getBlockchain();
  const engine = getVotingEngine();

  const isInitialized = store.isInitialized();
  const validation = bc.isChainValid();

  return NextResponse.json({
    isInitialized,
    blockHeight: bc.chain.length,
    totalDocuments: isInitialized ? bc.getAllDocuments().length : 0,
    totalProposals: isInitialized ? engine.listProposals().length : 0,
    activeProposals: isInitialized ? engine.listProposals({ status: "ACTIVE" }).length : 0,
    organization: bc.organization || null,
    chainValid: validation.valid,
    validationError: validation.error || null,
    latestBlock: bc.getLatestBlock()
  });
}
