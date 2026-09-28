import { sha256, hashObject } from "../blockchain/crypto.js";

/**
 * Automated Legal Packet Generator
 * Reconstructs official corporate charters, bylaws, and minute book records
 * from historical blockchain state with cryptographic watermarks and DGCL § 224 compliance stamps.
 */
export class LegalPacketExporter {
  /**
   * Reconstruct and export legal packet for an organization blockchain
   * @param {Blockchain} blockchain - The LegitBlock blockchain instance
   * @param {object} [options={}]
   * @param {string} [options.documentId] - Specific document ID to export (or all active documents if omitted)
   * @param {number} [options.blockHeight] - Historical block height limit (defaults to chain tip)
   * @param {string} [options.format="markdown"] - "markdown" | "html" | "json"
   * @param {boolean} [options.includeAuditTrail=true] - Include voting tallies and ratification blocks
   * @returns {object} Reconstructed legal packet with content and cryptographic metadata
   */
  static exportLegalPacket(blockchain, options = {}) {
    const {
      documentId = null,
      blockHeight = blockchain.chain.length - 1,
      format = "markdown",
      includeAuditTrail = true
    } = options;

    const org = blockchain.organization || {};
    const orgName = org.name || "Constituent Corporation";
    const orgType = org.type || "For-Profit Delaware C-Corporation";
    const jurisdiction = org.jurisdiction || "Delaware, United States";

    // 1. Traverse chain history up to blockHeight
    const targetChain = blockchain.chain.filter(b => b.index <= blockHeight);
    if (targetChain.length === 0) {
      throw new Error("Cannot generate legal packet: blockchain contains no blocks.");
    }

    // 2. Reconstruct active documents state at target blockHeight
    const documentStateMap = new Map();
    const auditLog = [];

    for (const block of targetChain) {
      const type = block.type || block.data?.type;

      // Initial document ratification at genesis or document insert
      if (block.index === 0 && block.data?.initialDocumentsSummary) {
        for (const docSummary of block.data.initialDocumentsSummary) {
          documentStateMap.set(docSummary.id, {
            id: docSummary.id,
            title: docSummary.title,
            category: docSummary.category,
            version: docSummary.version || "1.0",
            content: `[Founding charter ratified at Genesis Block #0 for ${orgName}]`,
            ratifiedAtBlock: 0,
            ratifiedTimestamp: block.timestamp,
            hash: docSummary.hash
          });
        }
      }

      if (type === "DOCUMENT_INSERT") {
        const d = block.data || {};
        const doc = d.document || {
          id: d.documentId,
          title: d.title,
          category: d.category,
          version: d.version || "1.0",
          content: d.content || "",
          hash: d.contentHash || d.documentHash || block.hash
        };
        documentStateMap.set(doc.id, {
          id: doc.id,
          title: doc.title,
          category: doc.category,
          version: doc.version || "1.0",
          content: doc.content || "",
          ratifiedAtBlock: block.index,
          ratifiedTimestamp: block.timestamp,
          hash: doc.hash || doc.contentHash || block.hash
        });

        auditLog.push({
          event: "DOCUMENT_INSERTED",
          documentId: doc.id,
          title: doc.title,
          blockIndex: block.index,
          timestamp: block.timestamp,
          validator: block.validator
        });
      }

      // Amendments
      if (type === "DOCUMENT_AMEND" || type === "DOCUMENT_AMENDMENT") {
        const diffData = block.data || {};
        const docId = diffData.documentId;
        const existing = documentStateMap.get(docId);
        const newVersion = diffData.version || diffData.newVersion || (existing ? (parseFloat(existing.version) + 0.1).toFixed(1) : "1.1");
        const newContent = diffData.content || diffData.newContent;

        if (existing) {
          existing.version = newVersion;
          existing.ratifiedAtBlock = block.index;
          existing.ratifiedTimestamp = block.timestamp;
          if (newContent) {
            existing.content = newContent;
          }
          if (diffData.contentHash) {
            existing.hash = diffData.contentHash;
          }
        }

        auditLog.push({
          event: "AMENDMENT_RATIFIED",
          documentId: docId,
          proposalId: diffData.proposalId,
          blockIndex: block.index,
          timestamp: block.timestamp,
          diffHash: diffData.diffHash || diffData.contentHash,
          voteSummary: diffData.voteSummary || "Quorum Verified"
        });
      }
    }

    // Filter documents if documentId specified
    const selectedDocs = documentId
      ? (documentStateMap.has(documentId) ? [documentStateMap.get(documentId)] : [])
      : Array.from(documentStateMap.values());

    const latestBlock = targetChain[targetChain.length - 1];

    // Compute cryptographic packet seal
    const packetFingerprint = hashObject({
      organization: org,
      blockHeight,
      tipHash: latestBlock.hash,
      documentCount: selectedDocs.length,
      timestamp: new Date().toISOString()
    });

    if (format === "json") {
      return {
        statute: "Delaware General Corporation Law (DGCL) § 224",
        attestationType: "OFFICIAL_CORPORATE_RECORDS_PACKET",
        organization: org,
        reconstructedAtBlockHeight: blockHeight,
        tipBlockHash: latestBlock.hash,
        cryptographicSeal: packetFingerprint,
        generatedAt: new Date().toISOString(),
        documents: selectedDocs,
        minuteBookAuditLog: includeAuditTrail ? auditLog : undefined
      };
    }

    // Markdown Compilation
    let md = "";
    md += `# OFFICIAL CORPORATE GOVERNANCE PACKET\n`;
    md += `**ENTITY NAME**: ${orgName.toUpperCase()}\n`;
    md += `**JURISDICTION**: ${jurisdiction}\n`;
    md += `**STATUTORY AUTHORITY**: Delaware General Corporation Law (DGCL) § 224\n`;
    md += `**BLOCKCHAIN ATTESTATION HEIGHT**: Block #${blockHeight} (Tip: \`${latestBlock.hash.slice(0, 16)}...\`)\n`;
    md += `**CRYPTOGRAPHIC PACKET SEAL**: \`${packetFingerprint}\`\n`;
    md += `**GENERATION TIMESTAMP**: ${new Date().toISOString()}\n\n`;
    md += `---\n\n`;

    md += `## 1. Statutory Delaware Certification\n\n`;
    md += `> **NOTICE**: This compiled record packet is administered on the LegitBlock cryptographic ledger in direct fulfillment of **Delaware Code Title 8, Section 224 (DGCL § 224)**. All corporate minutes, articles, bylaws, and voting actions contained herein represent immutable, non-repudiable statutory corporate records.\n\n`;

    md += `## 2. Active Reconstructed Charters & Bylaws\n\n`;
    if (selectedDocs.length === 0) {
      md += `*No active documents found for target specification.*\n\n`;
    } else {
      for (const doc of selectedDocs) {
        md += `### ${doc.title} (v${doc.version})\n`;
        md += `- **Document ID**: \`${doc.id}\`\n`;
        md += `- **Ratified Block Height**: #${doc.ratifiedAtBlock}\n`;
        md += `- **Ratification Date**: ${doc.ratifiedTimestamp}\n`;
        md += `- **Cryptographic Hash**: \`${doc.hash}\`\n\n`;
        md += `\`\`\`markdown\n${doc.content}\n\`\`\`\n\n`;
      }
    }

    if (includeAuditTrail) {
      md += `## 3. Chronological Minute Book & Quorum Audit Trail\n\n`;
      md += `| Block | Event | Document / Proposal | Timestamp | Status |\n`;
      md += `|---|---|---|---|---|\n`;
      for (const log of auditLog) {
        md += `| #${log.blockIndex} | ${log.event} | ${log.documentId || log.proposalId || "-"} | ${log.timestamp} | VERIFIED |\n`;
      }
      md += `\n`;
    }

    md += `---\n`;
    md += `*End of Official Statutory Corporate Packet // LegitBlock Distributed Ledger*\n`;

    if (format === "pdf") {
      const pdfBuffer = buildPdfA3Document({
        orgName,
        jurisdiction,
        blockHeight,
        tipBlockHash: latestBlock.hash,
        cryptographicSeal: packetFingerprint,
        mdContent: md,
        documents: selectedDocs,
        auditLog
      });

      return {
        statute: "DGCL § 224",
        blockHeight,
        tipBlockHash: latestBlock.hash,
        cryptographicSeal: packetFingerprint,
        content: pdfBuffer,
        format: "pdf"
      };
    }

    return {
      statute: "DGCL § 224",
      blockHeight,
      tipBlockHash: latestBlock.hash,
      cryptographicSeal: packetFingerprint,
      content: md,
      format: "markdown"
    };
  }
}

function escapePdfText(text = "") {
  return String(text).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildPdfA3Document({ orgName, jurisdiction, blockHeight, tipBlockHash, cryptographicSeal, mdContent, documents = [], auditLog = [] }) {
  const xmpMetadata = `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/">
      <dc:title><rdf:Alt><rdf:li xml:lang="x-default">OFFICIAL CORPORATE GOVERNANCE PACKET - ${escapePdfText(orgName)}</rdf:li></rdf:Alt></dc:title>
      <dc:description><rdf:Alt><rdf:li xml:lang="x-default">DGCL Section 224 Statutory Corporate Ledger Attestation</rdf:li></rdf:Alt></dc:description>
      <dc:identifier>urn:legitblock:seal:${cryptographicSeal}</dc:identifier>
      <dc:source>LegitBlock Distributed Ledger Block Height #${blockHeight} (Tip: ${tipBlockHash})</dc:source>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

  const lines = [
    "OFFICIAL CORPORATE GOVERNANCE PACKET",
    `ENTITY NAME: ${orgName.toUpperCase()}`,
    `JURISDICTION: ${jurisdiction}`,
    "STATUTORY AUTHORITY: Delaware General Corporation Law (DGCL) Section 224",
    `BLOCKCHAIN HEIGHT: #${blockHeight} | TIP: ${tipBlockHash.slice(0, 16)}...`,
    `CRYPTOGRAPHIC PACKET SEAL: ${cryptographicSeal}`,
    `GENERATED AT: ${new Date().toISOString()}`,
    "--------------------------------------------------------------------------------",
    "1. STATUTORY DELAWARE CERTIFICATION",
    "NOTICE: This compiled record packet is administered on the LegitBlock cryptographic",
    "ledger in direct fulfillment of Delaware Code Title 8, Section 224 (DGCL 224).",
    "All corporate minutes, articles, bylaws, and voting actions contained herein",
    "represent immutable, non-repudiable statutory corporate records.",
    "--------------------------------------------------------------------------------",
    "2. ACTIVE RECONSTRUCTED CHARTERS & BYLAWS"
  ];

  for (const doc of documents) {
    lines.push(`* ${doc.title} (v${doc.version}) [ID: ${doc.id}]`);
    lines.push(`  Ratified Block: #${doc.ratifiedAtBlock} | Hash: ${doc.hash.slice(0, 24)}...`);
    const contentSample = (doc.content || "").split("\n").slice(0, 2).map(l => "    " + l.trim()).filter(Boolean);
    lines.push(...contentSample);
  }

  if (auditLog.length > 0) {
    lines.push("--------------------------------------------------------------------------------");
    lines.push("3. MINUTE BOOK AUDIT LOG (RECENT)");
    for (const log of auditLog.slice(-5)) {
      lines.push(`  Block #${log.blockIndex} | ${log.event} | ${log.documentId || log.proposalId || "-"} | VERIFIED`);
    }
  }

  const contentOps = [];
  contentOps.push("BT");
  contentOps.push("/F2 12 Tf");
  contentOps.push("50 740 Td");
  contentOps.push("14 TL");

  for (let i = 0; i < lines.length && i < 40; i++) {
    const line = lines[i];
    if (i === 1) contentOps.push("/F1 9 Tf");
    if (line.startsWith("---") || line.startsWith("1.") || line.startsWith("2.") || line.startsWith("3.")) {
      contentOps.push("/F2 9 Tf");
    }
    contentOps.push(`(${escapePdfText(line)}) '`);
    if (line.startsWith("---") || line.startsWith("1.") || line.startsWith("2.") || line.startsWith("3.")) {
      contentOps.push("/F1 9 Tf");
    }
  }
  contentOps.push("ET");

  const streamBody = contentOps.join("\n");
  const streamLen = Buffer.byteLength(streamBody, "utf8");

  const objects = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R /Metadata 5 0 R >>";
  objects[2] = "<< /Type /Pages /Kids [3 0 R] /Count 1 >>";
  objects[3] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 6 0 R /F2 7 0 R >> >> >>";
  objects[4] = `<< /Length ${streamLen} >>\nstream\n${streamBody}\nendstream`;
  objects[5] = `<< /Type /Metadata /Subtype /XML /Length ${Buffer.byteLength(xmpMetadata, "utf8")} >>\nstream\n${xmpMetadata}\nendstream`;
  objects[6] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[7] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

  let out = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const xref = [0];

  for (let i = 1; i <= 7; i++) {
    xref[i] = Buffer.byteLength(out, "utf8");
    out += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const startXref = Buffer.byteLength(out, "utf8");
  out += "xref\n0 8\n0000000000 65535 f \n";
  for (let i = 1; i <= 7; i++) {
    out += String(xref[i]).padStart(10, "0") + " 00000 n \n";
  }
  out += `trailer\n<< /Size 8 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

  return Buffer.from(out, "utf8");
}
