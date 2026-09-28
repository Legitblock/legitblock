import assert from "node:assert";
import { RecusalType, RecusalRecord, RecusalEngine } from "../src/voting/recusal.js";

console.log("=== Testing Statutory Conflict-of-Interest & Recusal Engine (DGCL § 144) ===");

// 1. Recusal Record Creation
console.log("1. Creating formal Conflict-of-Interest Recusal Record...");
const recusal = new RecusalRecord({
  memberId: "dir-alice",
  memberName: "Alice Vance",
  proposalId: "prop-office-lease-2026",
  recusalType: RecusalType.RELATED_PARTY_TRANSACTION,
  disclosureStatement: "I am a 40% equity partner in Vance Realty LLC, the prospective lessor."
});

assert.strictEqual(recusal.memberId, "dir-alice");
assert.strictEqual(recusal.recusalType, RecusalType.RELATED_PARTY_TRANSACTION);
assert(recusal.hash, "Recusal must have hash");
console.log(`   ✓ Recusal record created: id=${recusal.id}, hash=${recusal.hash.slice(0, 16)}...`);

// 2. Registering Recusals in RecusalEngine
console.log("2. Registering recusal in RecusalEngine...");
const engine = new RecusalEngine();
engine.registerRecusal(recusal);

assert.strictEqual(engine.isMemberRecused("prop-office-lease-2026", "dir-alice"), true);
assert.strictEqual(engine.isMemberRecused("prop-office-lease-2026", "dir-bob"), false);
assert.strictEqual(engine.getRecusalsForProposal("prop-office-lease-2026").length, 1);
console.log("   ✓ Recusal registration and member lookup passed");

// 3. Simulating 5-Member Board with 1 Recused Member
console.log("3. Testing Disinterested Quorum & Voting Math...");
const boardMembers = [
  { id: "dir-alice", name: "Alice Vance", votingWeight: 1 }, // RECUSED
  { id: "dir-bob", name: "Bob Smith", votingWeight: 1 },
  { id: "dir-charlie", name: "Charlie Davis", votingWeight: 1 },
  { id: "dir-diana", name: "Diana Prince", votingWeight: 1 },
  { id: "dir-evan", name: "Evan Wright", votingWeight: 1 }
];

const proposal = {
  id: "prop-office-lease-2026",
  title: "Approve 5-Year Office Lease with Vance Realty",
  quorumThreshold: 0.5, // 50%
  passThreshold: 0.5    // Simple majority
};

// Scenario A: 3 of 4 Disinterested Members Vote YES, Recused Alice attempts to vote YES
const votes = [
  { voterId: "dir-alice", decision: "YES", weight: 1 },     // Must be DISQUALIFIED!
  { voterId: "dir-bob", decision: "YES", weight: 1 },       // Disinterested YES
  { voterId: "dir-charlie", decision: "YES", weight: 1 },   // Disinterested YES
  { voterId: "dir-diana", decision: "NO", weight: 1 }       // Disinterested NO
  // dir-evan did not vote
];

const evalResult = engine.calculateDisinterestedQuorum({
  proposal,
  activeMembers: boardMembers,
  votes
});

assert.strictEqual(evalResult.disinterestedMembersCount, 4, "Should be 4 disinterested members (5 - 1)");
assert.strictEqual(evalResult.disinterestedTotalWeight, 4);
assert.strictEqual(evalResult.disinterestedCastWeight, 3, "Only 3 disinterested votes should be counted");
assert.strictEqual(evalResult.disqualifiedVotes.length, 1, "Alice's vote must be disqualified");
assert.strictEqual(evalResult.disqualifiedVotes[0].voterId, "dir-alice");
assert.strictEqual(evalResult.quorumMet, true, "3 of 4 is 75% >= 50% quorum");
assert.strictEqual(evalResult.affirmativeWeight, 2);
assert.strictEqual(evalResult.negativeWeight, 1);
assert.strictEqual(evalResult.approvalRatio, 2 / 3);
assert.strictEqual(evalResult.proposalPassed, true, "2 of 3 disinterested votes passes (> 50%)");
console.log("   ✓ Disinterested quorum and disqualified vote protection verified");

// 4. Compliance Receipt Generation
console.log("4. Testing generateComplianceReceipt()...");
const receipt = engine.generateComplianceReceipt({
  proposal,
  activeMembers: boardMembers,
  votes
});

assert.strictEqual(receipt.standard, "LEGITBLOCK-DGCL-144-DISINTERESTED-QUORUM-v1");
assert(receipt.receiptHash, "Must contain deterministic receipt hash");
assert.strictEqual(receipt.result.proposalPassed, true);
console.log(`   ✓ DGCL § 144 compliance receipt generated: ${receipt.receiptHash.slice(0, 16)}...`);

console.log("\n>>> ALL STATUTORY RECUSAL TESTS PASSED!");
