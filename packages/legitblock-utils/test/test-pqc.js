import assert from "node:assert";
import { PqcHybridSigner } from "../src/crypto/pqc.js";

console.log("=== Testing Post-Quantum Cryptography (PQC) & Hybrid Signatures ===");

// 1. Key generation
console.log("1. Generating dual-key Hybrid Keypair (Ed25519 + ML-DSA-44)...");
const keyPair = PqcHybridSigner.generateHybridKeyPair();
assert.ok(keyPair.publicKey.classical, "Should export classical public key PEM");
assert.ok(keyPair.publicKey.pqc.seed, "Should export PQC public seed");
assert.strictEqual(keyPair.publicKey.pqc.t.length, 256, "PQC public vector t should have degree 256");
console.log("   ✓ Hybrid keypair successfully generated!");

// 2. Signing data
console.log("2. Signing corporate resolution data with Hybrid Keypair...");
const documentData = {
  documentId: "doc-charter-2026",
  title: "Restated Certificate of Incorporation (Post-Quantum Anchor)",
  merkleRoot: "7d8f9e0a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789",
  ratifiedBy: "board-of-directors"
};

const signature = PqcHybridSigner.signHybrid(documentData, keyPair.privateKey);
assert.strictEqual(signature.algorithm, "HYBRID-ED25519-ML-DSA");
assert.ok(signature.classicalSignature, "Should contain classical signature");
assert.ok(signature.pqcSignature.z, "Should contain post-quantum lattice vector z");
console.log("   ✓ Hybrid signature created with dual classical & post-quantum assertions");

// 3. Verification
console.log("3. Verifying authentic Hybrid Signature...");
const verification = PqcHybridSigner.verifyHybrid(documentData, signature, keyPair.publicKey);
assert.strictEqual(verification.valid, true, "Valid hybrid signature must pass");
assert.strictEqual(verification.classicalValid, true, "Classical signature must be valid");
assert.strictEqual(verification.pqcValid, true, "PQC lattice signature must be valid");
console.log("   ✓ Both Classical Ed25519 and PQC ML-DSA-44 verified successfully!");

// 4. Tamper detection on data
console.log("4. Testing tamper detection on modified payload...");
const tamperedData = { ...documentData, title: "Fraudulent Amendment" };
const tamperedVerification = PqcHybridSigner.verifyHybrid(tamperedData, signature, keyPair.publicKey);
assert.strictEqual(tamperedVerification.valid, false, "Tampered payload must be rejected");
console.log("   ✓ Tampered payload rejected by hybrid verification");

// 5. Tamper detection on classical signature
console.log("5. Testing rejection if classical component is corrupt...");
const badClassicalSig = { ...signature, classicalSignature: "00".repeat(64) };
const badClassicalVerification = PqcHybridSigner.verifyHybrid(documentData, badClassicalSig, keyPair.publicKey);
assert.strictEqual(badClassicalVerification.valid, false, "Corrupted classical signature must be rejected");
assert.strictEqual(badClassicalVerification.classicalValid, false);
console.log("   ✓ Corrupted classical signature rejected");

// 6. Tamper detection on PQC component
console.log("6. Testing rejection if post-quantum lattice component is corrupt...");
const badPqcSig = {
  ...signature,
  pqcSignature: {
    ...signature.pqcSignature,
    cHash: "ff".repeat(32)
  }
};
const badPqcVerification = PqcHybridSigner.verifyHybrid(documentData, badPqcSig, keyPair.publicKey);
assert.strictEqual(badPqcVerification.valid, false, "Corrupted PQC signature must be rejected");
assert.strictEqual(badPqcVerification.pqcValid, false);
console.log("   ✓ Corrupted post-quantum signature rejected");

console.log("\n>>> ALL POST-QUANTUM HYBRID SIGNATURE TESTS PASSED (100%)!\n");
