export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getBlockchain, getAuthProvider } from "@/lib/ledger";

export async function GET() {
  const bc = getBlockchain();
  const chainMembers = bc.getMembers();
  const auth = getAuthProvider();
  const directoryMembers = await auth.searchMembers();

  return NextResponse.json({
    chainMembers,
    directoryMembers,
    totalChainMembers: chainMembers.length
  });
}
