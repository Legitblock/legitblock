export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getBlockchain } from "@/lib/ledger";

export async function GET() {
  const bc = getBlockchain();
  const validation = bc.isChainValid();
  return NextResponse.json({
    valid: validation.valid,
    error: validation.error || null,
    brokenBlockIndex: validation.brokenBlockIndex ?? null,
    blockCount: bc.chain.length,
    timestamp: new Date().toISOString()
  });
}
