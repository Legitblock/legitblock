import assert from "node:assert";
import crypto from "node:crypto";
import { Blockchain } from "../src/blockchain/blockchain.js";
import { EvmBridge } from "../src/blockchain/evmBridge.js";
import { StatutoryTaxExporter } from "../src/documents/taxExporter.js";
import { WebAuthnPrfEngine } from "../src/auth/webauthn-prf.js";

console.log("=== Testing EVM Bridge, Form 990 Tax Exporter & WebAuthn PRF Encryption ===");

// 1. Testing EVM Bridge
console.log("1. Testing EVM Bridge calldata encoding & Gnosis Safe transaction builder...");
const recipient = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const amount = 1000000000000000000n; // 1.0 Token (18 decimals)

// ERC-20 transfer encoding
const calldata = EvmBridge.encodeErc20Transfer(recipient, amount);
assert.ok(calldata.startsWith("0xa9059cbb"), "Should start with ERC-20 transfer selector");
console.log("   ✓ ERC-20 calldata encoded:", calldata.substring(0, 34) + "...");

// Generic function call
const genericCall = EvmBridge.encodeFunctionCall("setApproval(address,bool)", [recipient, 1]);
assert.ok(genericCall.startsWith("0x"), "Should encode generic call with selector");

// Gnosis Safe transaction payload
const safeTx = EvmBridge.buildSafeTransaction({
  safeAddress: "0x1234567890123456789012345678901234567890",
  to: recipient,
  value: 0,
  data: calldata,
  signatures: ["0x" + "11".repeat(65)]
});
assert.strictEqual(safeTx.to, recipient);
assert.strictEqual(safeTx.data, calldata);
console.log("   ✓ Gnosis Safe execTransaction payload built successfully");

// EIP-712 Typed Data Manifest
const eip712 = EvmBridge.createEip712ResolutionManifest({
  proposalId: "prop-dividend-2026",
  documentId: "doc-minutes-q3",
  targetContract: recipient,
  value: 0,
  calldata,
  blockIndex: 42,
  chainId: 1
});
assert.strictEqual(eip712.primaryType, "RatifiedResolution");
assert.strictEqual(eip712.domain.name, "LegitBlock Governance Bridge");
assert.strictEqual(eip712.message.proposalId, "prop-dividend-2026");
console.log("   ✓ EIP-712 Typed Data resolution manifest generated");

// 2. Testing Statutory Tax & Form 990 Exporter
console.log("2. Testing Statutory Tax & Form 990 Exporter...");
const blockchain = new Blockchain();
blockchain.initializeGenesis({
  orgName: "Global Non-Profit Foundation 501(c)(3)",
  orgType: "non_profit",
  foundingMembers: [
    { id: "member-1", name: "Alice President", role: "President & Director" },
    { id: "member-2", name: "Bob Treasurer", role: "Treasurer & Director" },
    { id: "member-3", name: "Charlie Independent", role: "Independent Director" }
  ]
});

// Record a bylaw amendment
blockchain.recordDocumentAmendment({
  documentId: "doc-bylaws",
  title: "Bylaws Revision 2026",
  newContent: "Restated Conflict of Interest Policy",
  notes: "Ratified by unanimous consent"
});

const taxPacket = StatutoryTaxExporter.exportForm990GovernancePacket(blockchain, 2026);
assert.strictEqual(taxPacket.organizationName, "Global Non-Profit Foundation 501(c)(3)");
assert.strictEqual(taxPacket.fiscalYear, 2026);
assert.strictEqual(taxPacket.line1a_votingMembersCount, 3);
assert.strictEqual(taxPacket.line4_significantChangesToOrganizingDocs, true);
assert.strictEqual(taxPacket.bylawAmendmentsSummary.length, 1);
assert.ok(taxPacket.blockchainAuditSeal, "Should generate cryptographic audit seal");

const scheduleOMarkdown = StatutoryTaxExporter.formatScheduleOMarkdown(taxPacket);
assert.ok(scheduleOMarkdown.includes("SCHEDULE O (Form 990)"));
assert.ok(scheduleOMarkdown.includes("Bylaws Revision 2026"));
console.log("   ✓ Form 990 Part VI packet & Schedule O Markdown generated successfully");

// 3. Testing WebAuthn PRF Document Encryption
console.log("3. Testing WebAuthn PRF Document Encryption...");
// Mock 32-byte hardware PRF enclave output
const prfHardwareSecret = crypto.randomBytes(32);
const symmetricKey = WebAuthnPrfEngine.deriveAesKeyFromPrf(prfHardwareSecret);
assert.strictEqual(symmetricKey.length, 32, "Should derive 256-bit AES key");

const secretCharter = "CONFIDENTIAL: Merger consideration terms - $50,000,000 cash plus equity.";
const encrypted = WebAuthnPrfEngine.encryptDocument(secretCharter, symmetricKey);
assert.strictEqual(encrypted.version, "1.0-WEBAUTHN-PRF-GCM");
assert.notStrictEqual(encrypted.ciphertext, secretCharter);
assert.ok(encrypted.iv);
assert.ok(encrypted.authTag);

const decrypted = WebAuthnPrfEngine.decryptDocument(encrypted, symmetricKey);
assert.strictEqual(decrypted, secretCharter, "Decrypted text must match original plaintext");

// Decryption with wrong key must fail authentication
const wrongKey = crypto.randomBytes(32);
assert.throws(() => {
  WebAuthnPrfEngine.decryptDocument(encrypted, wrongKey);
}, /Unsupported state or unable to authenticate data/, "Authentication tag mismatch must reject decryption");

console.log("   ✓ WebAuthn PRF hardware-derived AES-256-GCM encryption & decryption verified");

console.log("\n>>> ALL EVM BRIDGE, TAX EXPORTER & WEBAUTHN PRF TESTS PASSED (100%)!\n");
