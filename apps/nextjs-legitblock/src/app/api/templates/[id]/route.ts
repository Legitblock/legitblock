import { NextResponse } from "next/server";
import { getTemplateById } from "@legitblock/legitblock-utils";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const template = getTemplateById(params.id);
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }
  return NextResponse.json(template);
}
