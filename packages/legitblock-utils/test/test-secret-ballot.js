import assert from "node:assert";
import { SecretBallotEngine } from "../src/voting/secret-ballot.js";

console.log("=== Testing Verifiable Secret Ballots (Homomorphic Pedersen Commitments) ===");

// 1. Generate Blinded Ballots for 5 Directors
console.log("1. Generating 5 blinded secret ballots (3 YES, 2 NO)...");
const voters = [
  { id: "dir-1", vote: "YES" },
  { id: "dir-2", vote: "NO" },
  { id: "dir-3", vote: "YES" },
  { id: "dir-4", vote: "NO" },
  { id: "dir-5", vote: "YES" }
];

const ballots = [];
const blindingFactors = [];

for (const v of voters) {
  const { ballot, blindingFactor } = SecretBallotEngine.createBlindedBallot({
    proposalId: "prop-ceo-evaluation-2026",
    voterId: v.id,
    voteValue: v.vote
  });

  assert(ballot.commitment, "Ballot must have hex commitment");
  assert(blindingFactor, "Must return secret blinding factor");
  // Ensure commitments are different even for identical votes
  ballots.push(ballot);
  blindingFactors.push(blindingFactor);
}

assert.notStrictEqual(ballots[0].commitment, ballots[2].commitment, "Commitments for same vote must be blinded uniquely");
console.log("   ✓ 5 unique blinded ballots created with information-theoretic hiding");

// 2. Homomorphic Aggregation
console.log("2. Calculating homomorphic aggregate commitment...");
const aggregateCommitment = SecretBallotEngine.aggregateCommitments(ballots);
const aggregateBlindingFactor = SecretBallotEngine.aggregateBlindingFactors(blindingFactors);

assert(aggregateCommitment, "Must generate aggregate commitment");
assert(aggregateBlindingFactor, "Must generate aggregate blinding factor");
console.log(`   ✓ Aggregate commitment: ${aggregateCommitment.slice(0, 24)}...`);

// 3. Cryptographic Verification & Opening
console.log("3. Verifying correct tally (3 YES out of 5)...");
const openResult = SecretBallotEngine.verifyAndOpenTally({
  aggregateCommitmentHex: aggregateCommitment,
  aggregateBlindingFactorHex: aggregateBlindingFactor,
  claimedYesCount: 3,
  totalBallotsCast: 5
});

assert.strictEqual(openResult.verified, true, "Correct tally of 3 must verify");
assert.strictEqual(openResult.yesCount, 3);
assert.strictEqual(openResult.noCount, 2);
console.log("   ✓ Authentic tally opening cryptographically confirmed!");

// 4. Rejecting Fraudulent Tally Claims
console.log("4. Testing rejection of fraudulent claimed tallies...");
const fraudulentClaim = SecretBallotEngine.verifyAndOpenTally({
  aggregateCommitmentHex: aggregateCommitment,
  aggregateBlindingFactorHex: aggregateBlindingFactor,
  claimedYesCount: 4, // Fraudulent claim! (Actual is 3)
  totalBallotsCast: 5
});

assert.strictEqual(fraudulentClaim.verified, false, "Fraudulent tally must be rejected");
assert(fraudulentClaim.reason.includes("mismatch"));
console.log("   ✓ Fraudulent tally claims mathematically rejected");

// 5. Automated Tally Discovery Solver
console.log("5. Testing automated tally discovery from aggregate commitment...");
const discoveredYes = SecretBallotEngine.discoverTally(
  aggregateCommitment,
  aggregateBlindingFactor,
  5
);

assert.strictEqual(discoveredYes, 3, "Discrete log solver must find exactly 3 YES votes");
console.log(`   ✓ Discovered affirmative count: ${discoveredYes} YES / 2 NO`);

console.log("\n>>> ALL VERIFIABLE SECRET BALLOT TESTS PASSED!");
