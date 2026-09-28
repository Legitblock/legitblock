import assert from "node:assert";
import {
  Blockchain,
  LegalPacketExporter,
  getTemplateById
} from "../src/index.js";

console.log("=== Testing Statutory PDF/A-3 Legal Packet Export ===");

function testPdfExport() {
  console.log("1. Setting up blockchain with Non-Profit 501(c)(3) template...");
  const template = getTemplateById("nonprofit_501c3_public");
  assert(template, "501(c)(3) template should exist");

  const bc = new Blockchain({ difficulty: 1 });
  bc.initializeGenesis({
    orgName: "Open Earth Conservation Foundation",
    orgType: template.id,
    jurisdiction: "Delaware",
    foundingMembers: [
      { id: "trustee1", name: "Dr. Elena Rostova", role: "Board Chair" },
      { id: "trustee2", name: "Marcus Vance", role: "Treasurer" }
    ],
    initialDocuments: template.initialDocuments.map(d => ({
      id: d.id,
      title: d.title,
      category: d.category,
      version: "1.0",
      content: d.content
    }))
  });

  console.log("2. Exporting Legal Packet as PDF/A-3...");
  const pdfPacket = bc.exportLegalPacket({ format: "pdf" });

  assert.strictEqual(pdfPacket.format, "pdf");
  assert.strictEqual(pdfPacket.statute, "DGCL § 224");
  assert(Buffer.isBuffer(pdfPacket.content), "Content must be a binary Buffer");
  assert(pdfPacket.content.length > 500, "PDF buffer must contain substantial document content");

  const pdfStr = pdfPacket.content.toString("utf8");

  // Validate PDF Structure markers
  assert(pdfStr.startsWith("%PDF-1.4"), "Must start with valid PDF 1.4 header");
  assert(pdfStr.trimEnd().endsWith("%%EOF"), "Must terminate with valid %%EOF marker");
  assert(pdfStr.includes("xref"), "Must contain cross-reference table");
  assert(pdfStr.includes("trailer"), "Must contain trailer dictionary");

  // Validate Statutory Content and Metadata
  assert(pdfStr.includes("OPEN EARTH CONSERVATION FOUNDATION"), "Must contain organization name");
  assert(pdfStr.includes("Delaware General Corporation Law") && pdfStr.includes("Section 224"), "Must cite statutory authority");
  assert(pdfStr.includes(pdfPacket.cryptographicSeal), "Must contain cryptographic packet seal in text/metadata");
  assert(pdfStr.includes("<?xpacket begin="), "Must contain embedded XMP metadata packet");

  console.log(`   ✓ Generated valid PDF (${pdfPacket.content.length} bytes) with DGCL § 224 attestation`);
}

try {
  testPdfExport();
  console.log("\n>>> ALL PDF EXPORTER TESTS PASSED!\n");
} catch (err) {
  console.error("PDF export test failed:", err);
  process.exit(1);
}
