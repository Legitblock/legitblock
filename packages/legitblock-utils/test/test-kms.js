import assert from "node:assert";
import { 
  MockKmsProvider, 
  KmsAlgorithm, 
  KmsProviderType, 
  kmsSignBallot, 
  verifyKmsBallotSignature 
} from "../src/auth/kms.js";
import { verifyBallotSignature } from "../src/auth/webauthn.js";

console.log("=== Testing Enterprise Cloud KMS & Hardware Security Module (HSM) Signing ===");

// 1. Mock KMS Provider Initialization
console.log("1. Initializing MockKmsProvider and generating hardware keys...");
const kms = new MockKmsProvider();
assert.strictEqual(kms.type, KmsProviderType.MOCK_HSM);

// Generate ECDSA P-256 key
const ecKey = kms.generateKey("key-cfo-ecdsa", KmsAlgorithm.ECDSA_SHA_256);
assert.strictEqual(ecKey.keyId, "key-cfo-ecdsa");
assert(ecKey.publicKey.includes("BEGIN PUBLIC KEY"));

// Generate RSA-2048 key
const rsaKey = kms.generateKey("key-counsel-rsa", KmsAlgorithm.RSASSA_PKCS1_V1_5_SHA_256);
assert.strictEqual(rsaKey.keyId, "key-counsel-rsa");

// Generate Ed25519 key
const edKey = kms.generateKey("key-director-ed25519", KmsAlgorithm.ED25519);
assert.strictEqual(edKey.keyId, "key-director-ed25519");
console.log("   ✓ Generated 3 HSM keys (ECDSA P-256, RSA-2048, Ed25519)");

// 2. Direct sign & verify
console.log("2. Testing KMS sign and verify operations...");
const testMessage = { action: "TREASURY_TRANSFER", amount: 5000000, recipient: "Apex Vault" };
const signRes = await kms.sign({ keyId: "key-cfo-ecdsa", data: testMessage });
assert(signRes.signature, "Must return signature");
assert.strictEqual(signRes.fipsCertified, true);

const isValid = await kms.verify({
  keyId: "key-cfo-ecdsa",
  data: testMessage,
  signature: signRes.signature
});
assert.strictEqual(isValid, true, "KMS signature must verify");

const isTampered = await kms.verify({
  keyId: "key-cfo-ecdsa",
  data: { ...testMessage, amount: 9999999 }, // Tampered
  signature: signRes.signature
});
assert.strictEqual(isTampered, false, "Altered payload must fail KMS verification");
console.log("   ✓ KMS direct sign and verification passed");

// 3. Governance Ballot Signing with KMS
console.log("3. Testing kmsSignBallot() governance ballot...");
const ballotSig = await kmsSignBallot({
  proposalId: "prop-merger-2026",
  voterId: "cfo@legitblock.corp",
  decision: "YES",
  keyId: "key-cfo-ecdsa",
  provider: kms,
  notes: "CFO Approval via AWS CloudHSM"
});

assert.strictEqual(ballotSig.type, "kms");
assert.strictEqual(ballotSig.keyId, "key-cfo-ecdsa");
assert(ballotSig.publicKey);
assert(ballotSig.signature);

const isBallotValid = verifyKmsBallotSignature({
  proposalId: "prop-merger-2026",
  voterId: "cfo@legitblock.corp",
  decision: "YES",
  signature: ballotSig
});
assert.strictEqual(isBallotValid, true, "KMS ballot signature must verify");

const isBallotAltered = verifyKmsBallotSignature({
  proposalId: "prop-merger-2026",
  voterId: "cfo@legitblock.corp",
  decision: "NO", // Tampered vote!
  signature: ballotSig
});
assert.strictEqual(isBallotAltered, false, "Altered vote must fail verification");
console.log("   ✓ kmsSignBallot and verifyKmsBallotSignature passed");

// 4. Universal Ballot Signature Verifier Integration
console.log("4. Testing verifyBallotSignature() integration with KMS signature...");
const universalRes = verifyBallotSignature({
  proposalId: "prop-merger-2026",
  voterId: "cfo@legitblock.corp",
  decision: "YES",
  signature: ballotSig,
  publicKeyPem: ballotSig.publicKey
});

assert.strictEqual(universalRes.valid, true, "Universal verifier must accept valid KMS ballot");
assert.strictEqual(universalRes.type, "kms");
assert.strictEqual(universalRes.hsm, true);
console.log("   ✓ Universal verifier successfully routed and verified KMS signature");

console.log("\n>>> ALL CLOUD KMS & HSM TESTS PASSED!");
