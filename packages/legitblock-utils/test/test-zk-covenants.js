import assert from "node:assert";
import { ZkRangeProofEngine } from "../src/crypto/zk.js";
import { Covenant, CovenantType, CovenantEngine } from "../src/documents/covenants.js";
import { Proposal } from "../src/voting/proposal.js";

console.log("=== Testing Zero-Knowledge Covenant Range Proofs (NIZKRP) ===");

// 1. Basic Pedersen Commitment test
console.log("1. Testing Pedersen Commitment generation...");
const value = 15000000; // $15M EBITDA
const { commitment, blindingFactor } = ZkRangeProofEngine.commit(value);
assert.ok(commitment, "Commitment should be generated");
assert.ok(blindingFactor, "Blinding factor should be generated");
console.log("   ✓ Pedersen commitment generated:", commitment.substring(0, 16) + "...");

// 2. Range Proof generation & verification: value >= min
console.log("2. Testing ZK Range Proof (value >= min)...");
const minThreshold = 10000000; // $10M threshold
const proof = ZkRangeProofEngine.generateRangeProof({
  value,
  blindingFactor,
  min: minThreshold,
  statementId: "test-ebitda-statement"
});

assert.strictEqual(proof.version, "1.0-NIZKRP");
assert.strictEqual(proof.min, minThreshold.toString());

const verification = ZkRangeProofEngine.verifyRangeProof(proof, { min: minThreshold });
assert.strictEqual(verification.valid, true, "Proof should be valid for value >= min");
console.log("   ✓ Zero-Knowledge range proof verified without disclosing value ($15M >= $10M)");

// 3. Testing rejection when value is below required min
console.log("3. Testing rejection when attempting to generate proof for value < min...");
assert.throws(() => {
  ZkRangeProofEngine.generateRangeProof({
    value: 5000000, // $5M
    min: 10000000   // $10M
  });
}, /below min threshold/, "Should throw error when generating fraudulent proof");
console.log("   ✓ Honest prover property enforced: cannot generate proof for value < min");

// 4. Testing verifier rejection on fraudulent constraints
console.log("4. Testing verifier rejection when proof does not satisfy stricter constraint...");
const verificationStrict = ZkRangeProofEngine.verifyRangeProof(proof, { min: 20000000 });
assert.strictEqual(verificationStrict.valid, false, "Proof with min $10M should be rejected if $20M required");
console.log("   ✓ Verifier correctly rejected proof that does not meet higher threshold");

// 5. Testing integration with CovenantEngine & Proposal
console.log("5. Testing integration with CovenantEngine & Proposal execution guardrails...");
const covenantEngine = new CovenantEngine();
covenantEngine.registerCovenant(new Covenant({
  id: "cov-ebitda-zk",
  type: CovenantType.ZERO_KNOWLEDGE_RANGE,
  title: "Solvency & EBITDA Compliance",
  parameters: {
    metricName: "EBITDA",
    min: 10000000 // $10M minimum
  }
}));

// Case A: Proposal with valid ZK proof
const validZkPacket = ZkRangeProofEngine.generateCovenantProof({
  metricName: "EBITDA",
  value: 12500000, // $12.5M
  min: 10000000,
  proposalId: "prop-dividend-dist-2026"
});

const proposalA = new Proposal({
  id: "prop-dividend-dist-2026",
  title: "Special Shareholder Dividend Distribution",
  documentData: {
    spendingAmount: 2000000,
    zkProofs: {
      EBITDA: validZkPacket
    }
  }
});

const evalA = covenantEngine.evaluateProposal(proposalA);
assert.strictEqual(evalA.passed, true, "Proposal with valid ZK covenant proof should pass");
assert.strictEqual(evalA.violations.length, 0);
console.log("   ✓ Proposal with valid ZK proof passed constitutional covenant evaluation");

// Case B: Proposal missing required ZK proof
const proposalB = new Proposal({
  id: "prop-unauthorized-dist",
  title: "Unauthorized Distribution",
  documentData: {
    spendingAmount: 2000000
  }
});

const evalB = covenantEngine.evaluateProposal(proposalB);
assert.strictEqual(evalB.passed, false, "Proposal missing ZK proof should fail");
assert.strictEqual(evalB.violations.length, 1);
assert.match(evalB.violations[0].reason, /Missing required Zero-Knowledge/);
console.log("   ✓ Proposal missing ZK proof was rejected by constitutional covenant engine");

console.log("\n>>> ALL ZERO-KNOWLEDGE COVENANT TESTS PASSED (100%)!\n");
