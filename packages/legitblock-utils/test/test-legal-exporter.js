import assert from "node:assert";
import {
  Blockchain,
  LegalPacketExporter,
  getTemplateById
} from "../src/index.js";

console.log("=== Testing Automated Legal Packet Exporter (DGCL § 224) ===");

function testLegalPacketExport() {
  console.log("1. Setting up blockchain with C-Corporation template...");
  const template = getTemplateById("c_corp");
  assert(template, "C-Corporation template should exist");

  const bc = new Blockchain({ difficulty: 1 });
  bc.initializeGenesis({
    orgName: "Acme Quantum Technologies Inc.",
    orgType: template.id,
    jurisdiction: "Delaware",
    foundingMembers: [
      { id: "founder1", name: "Alice Founder", role: "CEO & Director" },
      { id: "founder2", name: "Bob Founder", role: "CTO & Director" }
    ],
    initialDocuments: template.initialDocuments.map(d => ({
      id: d.id,
      title: d.title,
      category: d.category,
      version: "1.0",
      content: d.content
    }))
  });

  assert.strictEqual(bc.chain.length, 1 + template.initialDocuments.length);

  console.log("2. Recording an amendment to Certificate of Incorporation...");
  const certDoc = template.initialDocuments.find(d => d.id === "cert_incorporation") || template.initialDocuments[0];
  const newContent = certDoc.content + "\n\n### ARTICLE IX: ADVANCED AI & QUANTUM COMPUTING DIVISION\nAuthorized capital expanded to 20,000,000 shares.";
  
  bc.recordDocumentAmendment({
    documentId: certDoc.id,
    title: certDoc.title,
    newContent,
    newVersion: "1.1",
    diff: "@@ -100,5 +100,8 @@\n+### ARTICLE IX: ADVANCED AI & QUANTUM COMPUTING DIVISION\n+Authorized capital expanded to 20,000,000 shares.",
    proposalId: "prop-quantum-expansion",
    validator: "board-chair",
    notes: "Shareholder expansion resolution ratified"
  });

  console.log("3. Exporting Legal Packet as Markdown...");
  const packetMd = bc.exportLegalPacket({ format: "markdown" });
  assert.strictEqual(packetMd.statute, "DGCL § 224");
  assert(typeof packetMd.cryptographicSeal === "string" && packetMd.cryptographicSeal.length === 64, "Seal must be valid SHA-256");
  assert(packetMd.content.includes("OFFICIAL CORPORATE GOVERNANCE PACKET"), "Markdown must include title");
  assert(packetMd.content.includes("ACME QUANTUM TECHNOLOGIES INC."), "Must include org name");
  assert(packetMd.content.includes("Delaware General Corporation Law (DGCL) § 224"), "Must cite DGCL § 224");
  assert(packetMd.content.includes("ARTICLE IX: ADVANCED AI & QUANTUM COMPUTING DIVISION"), "Must include amended content");
  assert(packetMd.content.includes("Chronological Minute Book & Quorum Audit Trail"), "Must include minute book audit trail");
  assert(packetMd.content.includes("AMENDMENT_RATIFIED"), "Must include amendment in audit trail");

  console.log("4. Exporting Legal Packet as JSON...");
  const packetJson = LegalPacketExporter.exportLegalPacket(bc, { format: "json" });
  assert.strictEqual(packetJson.statute, "Delaware General Corporation Law (DGCL) § 224");
  assert.strictEqual(packetJson.attestationType, "OFFICIAL_CORPORATE_RECORDS_PACKET");
  assert.strictEqual(packetJson.reconstructedAtBlockHeight, bc.chain.length - 1);
  assert(Array.isArray(packetJson.documents), "Documents must be an array");
  assert(Array.isArray(packetJson.minuteBookAuditLog), "Minute book log must be an array");
  
  const reconstructedCert = packetJson.documents.find(d => d.id === certDoc.id);
  assert(reconstructedCert, "Reconstructed Certificate must exist");
  assert.strictEqual(reconstructedCert.version, "1.1", "Version must be updated to 1.1");
  assert(reconstructedCert.content.includes("ARTICLE IX: ADVANCED AI"), "Must contain amended content");

  console.log("5. Testing Historical Time-Travel Reconstruction at Genesis height...");
  // Reconstruct before amendment
  const historicalPacket = bc.exportLegalPacket({ blockHeight: template.initialDocuments.length, format: "json" });
  const historicalCert = historicalPacket.documents.find(d => d.id === certDoc.id);
  assert.strictEqual(historicalCert.version, "1.0", "Historical version at earlier block height must be 1.0");
  assert(!historicalCert.content.includes("ARTICLE IX: ADVANCED AI"), "Historical doc must not include subsequent amendment");

  console.log("   ✓ LegalPacketExporter passed all tests");
}

try {
  testLegalPacketExport();
  console.log("\n>>> ALL LEGAL PACKET EXPORTER TESTS PASSED!\n");
} catch (err) {
  console.error("Legal packet exporter test failed:", err);
  process.exit(1);
}
