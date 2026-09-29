import assert from "node:assert";
import { QuadraticVotingSession } from "../src/voting/quadratic.js";
import { ConvictionVotingEngine } from "../src/voting/conviction.js";

console.log("=== Testing Quadratic & Conviction Voting Modules ===");

// Part A: Quadratic Voting
console.log("1. Testing Quadratic Voting (Vote Power = sqrt(Credits))...");
const qvSession = new QuadraticVotingSession({
  proposalId: "qv-budget-allocation-2026",
  title: "Cooperative Infrastructure Budget Allocation",
  defaultCreditBudget: 100,
  options: ["SOLAR_ARRAY", "COMMUNITY_KITCHEN", "EQUIPMENT_REPAIR"]
});

// Alice: Allocates 64 credits to SOLAR_ARRAY (8 votes) and 36 credits to EQUIPMENT_REPAIR (6 votes). Total = 100 credits
const ballotAlice = qvSession.castBallot({
  voterId: "alice",
  allocations: {
    SOLAR_ARRAY: 64,
    EQUIPMENT_REPAIR: 36
  }
});
assert.strictEqual(ballotAlice.computedVotes.SOLAR_ARRAY, 8);
assert.strictEqual(ballotAlice.computedVotes.EQUIPMENT_REPAIR, 6);
assert.strictEqual(ballotAlice.totalCreditsSpent, 100);

// Bob: Allocates 100 credits to COMMUNITY_KITCHEN (10 votes)
const ballotBob = qvSession.castBallot({
  voterId: "bob",
  allocations: {
    COMMUNITY_KITCHEN: 100
  }
});
assert.strictEqual(ballotBob.computedVotes.COMMUNITY_KITCHEN, 10);

// Charlie: Exceeding budget should throw error
assert.throws(() => {
  qvSession.castBallot({
    voterId: "charlie",
    allocations: {
      SOLAR_ARRAY: 81,
      COMMUNITY_KITCHEN: 25 // 81 + 25 = 106 > 100
    }
  });
}, /Voice credit budget exceeded/);

console.log("   ✓ Quadratic credit-to-vote power transformation and budget enforcement verified");

// Calculate tally
const tally = qvSession.calculateTally();
assert.strictEqual(tally.totalBallots, 2);
assert.ok(tally.winner);
assert.strictEqual(tally.winner.option, "COMMUNITY_KITCHEN");
assert.strictEqual(tally.winner.votes, 10);
assert.ok(typeof tally.giniCoefficient === "number");
console.log("   ✓ Quadratic tally computed: Winner is", tally.winner.option, "with Gini index:", tally.giniCoefficient);

// Part B: Continuous Conviction Voting
console.log("2. Testing Continuous Conviction Voting...");
const convictionEngine = new ConvictionVotingEngine({
  totalPool: 100000, // $100k treasury
  defaultAlpha: 0.8, // 80% persistence
  defaultBeta: 0.1   // 10% base threshold multiplier
});

const prop = convictionEngine.createProposal({
  id: "conv-roof-grant",
  title: "Solar Roof Grant",
  requestedAmount: 10000 // requesting 10% of treasury
});

const threshold = prop.calculateThreshold();
assert.ok(threshold > 0, "Threshold should be positive");
console.log("   ✓ Dynamic passing threshold for 10% request calculated:", threshold.toFixed(2));

// Stake voting weight
prop.stake("alice", 5000);
prop.stake("bob", 8000);
assert.strictEqual(prop.getTotalStakedWeight(), 13000);

// Step time intervals and observe conviction accumulation
console.log("   Stepping time intervals:");
let triggered = false;
for (let step = 1; step <= 8; step++) {
  const state = prop.step();
  console.log(`     Step ${step}: Conviction = ${state.conviction} / Threshold = ${state.threshold} (Triggered: ${state.triggered})`);
  if (state.triggered) {
    triggered = true;
    break;
  }
}

assert.strictEqual(triggered, true, "Proposal should trigger once conviction crosses threshold");
assert.strictEqual(prop.status, "TRIGGERED");
console.log("   ✓ Conviction successfully crossed threshold and triggered proposal ratification!");

console.log("\n>>> ALL QUADRATIC & CONVICTION VOTING TESTS PASSED (100%)!\n");
