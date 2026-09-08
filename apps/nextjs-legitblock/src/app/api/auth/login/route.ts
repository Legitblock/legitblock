import { NextResponse } from "next/server";
import { getAuthProvider } from "@/lib/ledger";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const auth = getAuthProvider();
    const result = await auth.authenticate(username, password);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Authentication failed" }, { status: 401 });
    }

    const res = NextResponse.json({ success: true, user: result.user, token: result.token });
    res.cookies.set("legitblock_token", result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
