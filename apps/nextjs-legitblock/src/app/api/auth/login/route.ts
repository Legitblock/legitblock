import { NextResponse } from "next/server";
import { getAuthProvider } from "@/lib/ledger";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    // 1. Attempt FreeIPA LDAP directory authentication via Billama SDK
    try {
      const { loginWithFreeIpaLdap } = await import("@/lib/billama");
      const ldapRes = await loginWithFreeIpaLdap({ username, password });
      if (ldapRes?.user && ldapRes?.token) {
        const res = NextResponse.json({
          success: true,
          user: {
            username: ldapRes.user.username,
            name: ldapRes.user.displayName || ldapRes.user.username,
            email: ldapRes.user.email,
            dn: ldapRes.user.dn,
          },
          token: ldapRes.token,
        });
        res.cookies.set("legitblock_token", ldapRes.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24, // 24 hours
        });
        return res;
      }
    } catch (sdkErr) {
      console.warn("[LegitBlock FreeIPA] Billama SDK LDAP attempt failed, falling back:", sdkErr);
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
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
