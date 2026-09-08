import { NextResponse } from "next/server";
import { getBlockchain } from "@/lib/ledger";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const bc = getBlockchain();
  const history = bc.getDocumentHistory(params.id);
  return NextResponse.json({ documentId: params.id, history });
}
