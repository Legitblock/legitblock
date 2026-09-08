import { NextResponse } from "next/server";
import { ALL_TEMPLATES, getTemplateCategories, searchTemplates } from "@legitblock/legitblock-utils";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const query = url.searchParams.get("q") || "";

  let list = ALL_TEMPLATES;
  if (category) {
    list = list.filter(t => t.category === category);
  }
  if (query) {
    const q = query.toLowerCase();
    list = list.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q)
    );
  }

  // Summary list for template picker
  const summaries = list.map(t => ({
    id: t.id,
    name: t.name,
    category: t.category,
    description: t.description,
    governance: t.governance,
    documentCount: t.initialDocuments.length,
    initialDocumentTitles: t.initialDocuments.map(d => d.title)
  }));

  return NextResponse.json({
    categories: getTemplateCategories(),
    templates: summaries
  });
}
