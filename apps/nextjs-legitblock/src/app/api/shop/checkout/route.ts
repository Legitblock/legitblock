import { NextRequest, NextResponse } from "next/server";
import { getBillamaClient } from "@/lib/billama";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items = [], customerEmail, shippingAddress } = body;

    if (!items.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://legitblock.billama.net";
    const client = getBillamaClient();

    const session = await client.ecommerce.createCheckoutSession({
      storeId: process.env.BILLAMA_STORE_ID || "store_legitblock_legal",
      customerEmail: customerEmail || "incorporator@legitblock.billama.net",
      lineItems: items.map((item: any) => ({
        name: item.name || item.title,
        unitPriceUsd: item.price || item.unitPriceUsd,
        quantity: item.quantity || 1,
        imageUrl: item.imageUrl,
        isPhysical: !item.isDigital,
        sku: item.sku,
      })),
      shippingAddress,
      shippingAddressRequired: items.some((i: any) => !i.isDigital),
      allowedPaymentMethods: ["CARD", "APPLE_PAY", "GOOGLE_PAY", "SOLANA_PAY", "BILLAMA_GRID_CREDITS"],
      returnUrl: `${appUrl}/shop?checkout=success`,
      cancelUrl: `${appUrl}/shop?checkout=canceled`,
    });

    return NextResponse.json({
      success: true,
      url: session.url,
      checkoutUrl: session.url,
      sessionId: session.sessionId,
      orderNumber: session.orderNumber,
      totalAmount: session.totalAmount,
    });
  } catch (error: any) {
    console.error("[LegitBlock Shop] Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
