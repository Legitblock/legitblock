import assert from "node:assert";
import { Blockchain } from "../src/blockchain/blockchain.js";
import { VotingEngine } from "../src/voting/engine.js";
import { Proposal, ProposalStatus, ProposalType, VoteDecision } from "../src/voting/proposal.js";

console.log("=== Testing Statutory Time-Lock Queues & Emergency Compliance Veto ===");

const blockchain = new Blockchain();
blockchain.initializeGenesis({
  orgName: "Acme Corp",
  orgType: "c_corp",
  foundingMembers: [
    { id: "member-alice", name: "Alice", role: "Director" },
    { id: "member-bob", name: "Bob", role: "Director" },
    { id: "member-clara", name: "Clara", role: "Compliance Officer" }
  ]
});

const votingEngine = new VotingEngine();

// 1. Create a proposal with a 48-hour statutory timelock (172,800 seconds)
console.log("1. Creating Proposal with 48h statutory timelock...");
const proposal = votingEngine.createProposal({
  id: "prop-major-merger-2026",
  type: ProposalType.AMENDMENT,
  title: "Statutory Merger Agreement Approval",
  timelockDelaySeconds: 172800, // 48 hours
  documentData: {
    content: "Articles of Merger with Target Corp."
  }
});

assert.strictEqual(proposal.timelockDelaySeconds, 172800);
console.log("   ✓ Proposal created with timelock delay of 48h");

// 2. Cast affirmative votes to achieve passing threshold
console.log("2. Casting affirmative votes...");
votingEngine.castVote({
  proposalId: proposal.id,
  voterId: "member-alice",
  decision: VoteDecision.APPROVE,
  totalEligibleMembers: 3
});
votingEngine.castVote({
  proposalId: proposal.id,
  voterId: "member-bob",
  decision: VoteDecision.APPROVE,
  totalEligibleMembers: 3
});

assert.strictEqual(proposal.status, ProposalStatus.PASSED);
console.log("   ✓ Proposal passed statutory voting threshold");

// 3. First execution attempt enters QUEUED status
console.log("3. Attempting execution -> should automatically enter QUEUED status...");
const queueResult = votingEngine.executeProposal(proposal.id, blockchain);
assert.strictEqual(queueResult.queued, true);
assert.strictEqual(proposal.status, ProposalStatus.QUEUED);
assert.ok(proposal.unlockAt, "Should establish unlockAt timestamp");
console.log("   ✓ Proposal safely queued in statutory timelock until:", proposal.unlockAt);

// 4. Execution attempt before unlockAt must be rejected
console.log("4. Attempting premature execution while in queue...");
assert.throws(() => {
  votingEngine.executeProposal(proposal.id, blockchain, "system", {
    currentTime: Date.now() + 3600 * 1000 // 1 hour later (still locked)
  });
}, /Statutory timelock has not expired/, "Should block execution before unlock time");
console.log("   ✓ Premature execution correctly blocked by timelock guardrails");

// 5. Test Emergency Compliance Veto
console.log("5. Testing Emergency Compliance Veto on a separate proposal...");
const vetoableProp = votingEngine.createProposal({
  id: "prop-risky-bylaw",
  type: ProposalType.AMENDMENT,
  title: "Risky Governance Modification",
  timelockDelaySeconds: 86400
});

votingEngine.castVote({
  proposalId: vetoableProp.id,
  voterId: "member-alice",
  decision: VoteDecision.APPROVE,
  totalEligibleMembers: 3
});
votingEngine.castVote({
  proposalId: vetoableProp.id,
  voterId: "member-bob",
  decision: VoteDecision.APPROVE,
  totalEligibleMembers: 3
});

votingEngine.executeProposal(vetoableProp.id, blockchain);
assert.strictEqual(vetoableProp.status, ProposalStatus.QUEUED);

// Compliance Officer exercises emergency veto
const vetoResult = votingEngine.vetoProposal({
  proposalId: vetoableProp.id,
  complianceOfficerId: "member-clara",
  role: "Chief Compliance Officer",
  reason: "Violation of DGCL § 102(b)(7) exculpatory charter protections"
});

assert.strictEqual(vetoableProp.status, ProposalStatus.VETOED);
assert.strictEqual(vetoResult.vetoRecord.vetoedBy, "member-clara");
assert.match(vetoResult.vetoRecord.reason, /DGCL § 102/);

// Execution after veto must be rejected even if time expires
assert.throws(() => {
  votingEngine.executeProposal(vetoableProp.id, blockchain, "system", {
    currentTime: Date.now() + 200000 * 1000
  });
}, /vetoed by Compliance Officer/, "Vetoed proposal must never be executable");
console.log("   ✓ Emergency compliance veto exercised and permanently enforced");

// 6. Legitimate execution after timelock expires
console.log("6. Testing successful execution after timelock expires...");
const postTimelockResult = votingEngine.executeProposal(proposal.id, blockchain, "system", {
  currentTime: Date.now() + 200000 * 1000 // 55+ hours later (unlocked!)
});

assert.strictEqual(proposal.status, ProposalStatus.EXECUTED);
assert.ok(postTimelockResult.block, "Resulting block should be sealed into blockchain");
console.log("   ✓ Proposal ratified and block sealed at height:", postTimelockResult.block.index);

console.log("\n>>> ALL STATUTORY TIMELOCK & VETO TESTS PASSED (100%)!\n");
