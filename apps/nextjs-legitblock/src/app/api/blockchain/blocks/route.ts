export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getBlockchain } from "@/lib/ledger";

export async function GET() {
  const bc = getBlockchain();
  return NextResponse.json({
    chain: bc.chain.map(b => b.toJSON()),
    count: bc.chain.length
  });
}
