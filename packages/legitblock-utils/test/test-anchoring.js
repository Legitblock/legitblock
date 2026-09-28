import assert from "node:assert";
import crypto from "node:crypto";
import { 
  AnchorAuthority, 
  AnchorReceipt, 
  OpenTimestampsAdapter, 
  Rfc3161TimestampAdapter, 
  ChainAnchorService 
} from "../src/crypto/anchoring.js";
import { Blockchain } from "../src/blockchain/blockchain.js";
import { generateMemberKeyPair } from "../src/blockchain/crypto.js";

console.log("=== Testing Public Blockchain & RFC 3161 Checkpoint Anchoring ===");

// 1. Basic AnchorReceipt
console.log("1. Testing AnchorReceipt creation and hashing...");
const receipt = new AnchorReceipt({
  blockIndex: 42,
  blockHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  authority: AnchorAuthority.BITCOIN_OTS,
  externalReference: "ots:calendar:test"
});
assert.strictEqual(receipt.blockIndex, 42);
assert(receipt.receiptHash, "Receipt must generate deterministic hash");
console.log(`   ✓ Receipt created: hash=${receipt.receiptHash.slice(0, 16)}...`);

// 2. OpenTimestamps Adapter
console.log("2. Testing OpenTimestampsAdapter...");
const testHash = "a1b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef";
const otsReceipt = OpenTimestampsAdapter.createAnchorReceipt(10, testHash);
assert.strictEqual(otsReceipt.authority, AnchorAuthority.BITCOIN_OTS);
assert(otsReceipt.proofPayload, "Must include base64 payload");

const isOtsValid = OpenTimestampsAdapter.verifyReceipt(otsReceipt, testHash);
assert.strictEqual(isOtsValid, true, "Valid OTS receipt must verify");

const isOtsTampered = OpenTimestampsAdapter.verifyReceipt(otsReceipt, "wronghashwronghashwronghashwronghashwronghashwronghashwronghashwr");
assert.strictEqual(isOtsTampered, false, "Altered hash must fail OTS verification");
console.log("   ✓ OpenTimestamps commitment and verification passed");

// 3. RFC 3161 Timestamping Adapter
console.log("3. Testing Rfc3161TimestampAdapter with TSA cryptographic signature...");
const tsaKeys = generateMemberKeyPair();
const req = Rfc3161TimestampAdapter.createTimestampRequest(testHash);
assert.strictEqual(req.messageImprint.hashAlgorithm.algorithm, Rfc3161TimestampAdapter.SHA256_OID);
assert.strictEqual(req.messageImprint.hashedMessage, testHash);

const rfcReceipt = Rfc3161TimestampAdapter.createAnchorReceipt(10, testHash, tsaKeys);
assert.strictEqual(rfcReceipt.authority, AnchorAuthority.RFC3161_TSA);
assert(rfcReceipt.tsaSignature, "Must contain TSA signature");

const isRfcValid = Rfc3161TimestampAdapter.verifyReceipt(rfcReceipt, testHash);
assert.strictEqual(isRfcValid, true, "Signed RFC 3161 receipt must verify against public key");

const isRfcTampered = Rfc3161TimestampAdapter.verifyReceipt(rfcReceipt, "tamperedhashtamperedhashtamperedhashtamperedhashtamperedhashtamper");
assert.strictEqual(isRfcTampered, false, "Tampered hash must fail RFC 3161 verification");
console.log("   ✓ RFC 3161 request, reply, and signature verification passed");

// 4. ChainAnchorService with Blockchain
console.log("4. Testing ChainAnchorService with Blockchain...");
const bc = new Blockchain({ difficulty: 0 });
bc.initializeGenesis({ orgName: "Anchor Test Corp", orgType: "c_corp" });
bc.addBlock("RECORD", { message: "Block 1 event" }, "miner-1"); // Block 1
bc.addBlock("RECORD", { message: "Block 2 event" }, "miner-1"); // Block 2

const anchorService = new ChainAnchorService({ blockchain: bc, intervalBlocks: 2 });
assert.strictEqual(anchorService.shouldAnchor(2), true, "Block 2 should trigger anchor interval");
assert.strictEqual(anchorService.shouldAnchor(1), false, "Block 1 should not trigger anchor");

const b2Receipt = anchorService.anchorBlock(2, AnchorAuthority.BITCOIN_OTS);
assert.strictEqual(b2Receipt.blockIndex, 2);
assert.strictEqual(anchorService.verifyBlockAnchor(2), true, "Service must verify anchor for block 2");
assert.strictEqual(anchorService.getAllAnchors().length, 1);
console.log("   ✓ ChainAnchorService interval monitoring and verification passed");

console.log("\n>>> ALL ANCHORING & TIMESTAMP TESTS PASSED!");
