import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { GitNotarizer } from "../src/cli/gitHook.js";
import { OpenTimestampsAdapter } from "../src/crypto/anchoring.js";
import { generateMemberKeyPair, sha256 } from "../src/blockchain/crypto.js";

console.log("=== Testing Git Pre-Commit Notarization & Live OTS Anchoring ===\n");

// 1. Setup temporary sandbox repository
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "legitblock-git-test-"));
const gitDir = path.join(tempDir, ".git");
fs.mkdirSync(gitDir, { recursive: true });

// Create test legal documents
const bylawsPath = path.join(tempDir, "bylaws.md");
const charterPath = path.join(tempDir, "charter.json");
fs.writeFileSync(bylawsPath, "# Delaware C-Corp Bylaws\nQuorum requirement: 50% majority.", "utf8");
fs.writeFileSync(charterPath, JSON.stringify({ entity: "Acme Corp", shares: 10000000 }, null, 2), "utf8");

// 2. Test GitNotarizer.notarizeWorkspace()
console.log("1. Testing GitNotarizer.notarizeWorkspace()...");
const keyPair = generateMemberKeyPair();
const manifest = GitNotarizer.notarizeWorkspace({
  rootDir: tempDir,
  filePaths: ["bylaws.md", "charter.json"],
  author: "General Counsel",
  keyPair,
  writeLedger: true
});

assert.strictEqual(manifest.standard, "LEGITBLOCK-GIT-NOTARIZATION-v1");
assert.strictEqual(manifest.fileCount, 2);
assert.ok(manifest.merkleRoot);
assert.strictEqual(manifest.signature.signer, "General Counsel");
assert.ok(manifest.otsReceipt);
assert.ok(fs.existsSync(path.join(tempDir, ".legitblock", "notarizations.json")));
console.log(`   ✓ Notarization manifest generated with Merkle root: ${manifest.merkleRoot.slice(0, 16)}...`);

// 3. Test GitNotarizer.verifyNotarization()
console.log("2. Testing GitNotarizer.verifyNotarization() on intact repo...");
const verifyResult = GitNotarizer.verifyNotarization(manifest, tempDir);
assert.strictEqual(verifyResult.isValid, true);
assert.strictEqual(verifyResult.errors.length, 0);
console.log("   ✓ Verification passed with 0 errors!");

// 4. Test tamper detection
console.log("3. Testing tamper detection on modified legal document...");
fs.writeFileSync(bylawsPath, "# Tampered Bylaws\nQuorum requirement: 5% rogue takeover.", "utf8");
const tamperedResult = GitNotarizer.verifyNotarization(manifest, tempDir);
assert.strictEqual(tamperedResult.isValid, false);
assert.ok(tamperedResult.errors.some((e) => e.includes("File hash mismatch") || e.includes("Merkle root mismatch")));
console.log(`   ✓ Tamper correctly flagged: ${tamperedResult.errors[0]}`);

// Reset file
fs.writeFileSync(bylawsPath, "# Delaware C-Corp Bylaws\nQuorum requirement: 50% majority.", "utf8");

// 5. Test OpenTimestamps live submission with fallback
console.log("4. Testing OpenTimestamps live calendar adapter...");
const dummyHash = sha256("test-block-anchoring-payload");
const otsLive = await OpenTimestampsAdapter.submitToCalendarLive(1, dummyHash);
assert.ok(otsLive);
assert.strictEqual(otsLive.blockHash, dummyHash);
assert.ok(OpenTimestampsAdapter.verifyReceipt(otsLive, dummyHash));
console.log(`   ✓ OTS submission & receipt verification passed (Ref: ${otsLive.externalReference})`);

// 6. Test hook installation
console.log("5. Testing GitNotarizer.installPreCommitHook()...");
const hookPath = GitNotarizer.installPreCommitHook(tempDir);
assert.ok(fs.existsSync(hookPath));
const hookContent = fs.readFileSync(hookPath, "utf8");
assert.ok(hookContent.includes("LegitBlock"));
console.log(`   ✓ Pre-commit hook written to ${hookPath}`);

// Cleanup
fs.rmSync(tempDir, { recursive: true, force: true });

console.log("\n>>> ALL GIT PRE-COMMIT NOTARIZATION & OTS TESTS PASSED (100%)!\n");
