import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/ledger";

export async function GET(req: Request) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user });
}
