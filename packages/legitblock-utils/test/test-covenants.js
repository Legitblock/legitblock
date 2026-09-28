import assert from "node:assert";
import {
  Covenant,
  CovenantType,
  CovenantEngine,
  Proposal,
  ProposalType,
  ProposalStatus,
  VoteDecision,
  VotingEngine,
  Blockchain,
  DefaultVotingRules,
  VotingRuleType
} from "../src/index.js";

console.log("=== Testing Smart Legal Covenants & Constitutional Rule Assertions ===");

function testCovenants() {
  console.log("1. Initializing CovenantEngine and registering covenants...");
  const engine = new CovenantEngine();

  // Covenant 1: Budget ceiling of $50,000 for standard proposals
  const budgetCov = engine.registerCovenant(new Covenant({
    id: "cov-budget-ceiling",
    type: CovenantType.BUDGET_CEILING,
    title: "Capital Expenditure Ceiling",
    parameters: { maxAmount: 50000 }
  }));
  assert(budgetCov, "Budget covenant registered");

  // Covenant 2: Supermajority required for charter amendments
  const superCov = engine.registerCovenant(new Covenant({
    id: "cov-charter-supermajority",
    type: CovenantType.SUPERMAJORITY_REQUIRED,
    title: "Constitutional Supermajority Requirement",
    targetDocumentId: "cert-incorporation",
    parameters: { minThresholdPercentage: 66.67 }
  }));
  assert(superCov, "Supermajority covenant registered");

  // Covenant 3: Mandatory Lead Investor / Outside Director approval
  const roleCov = engine.registerCovenant(new Covenant({
    id: "cov-lead-investor-veto",
    type: CovenantType.MANDATORY_ROLE_APPROVAL,
    title: "Lead Investor Affirmative Vote Required",
    parameters: { requiredRole: "Lead Investor" }
  }));
  assert(roleCov, "Mandatory role covenant registered");

  console.log("2. Testing Budget Ceiling Covenant Evaluation...");
  // Test proposal with excessive budget ($100k > $50k)
  const excessiveProp = new Proposal({
    id: "prop-high-budget",
    title: "Office Renovation",
    documentData: { spendingAmount: 100000 }
  });
  const resExcessive = engine.evaluateProposal(excessiveProp);
  assert.strictEqual(resExcessive.passed, false, "Excessive budget proposal must fail");
  assert(resExcessive.violations.some(v => v.covenantId === "cov-budget-ceiling"), "Should report budget ceiling violation");

  // Test proposal within budget ($30k <= $50k)
  const okBudgetProp = new Proposal({
    id: "prop-ok-budget",
    title: "Server Hardware",
    documentData: { spendingAmount: 30000 }
  });
  const resOk = engine.evaluateProposal(okBudgetProp);
  assert(!resOk.violations.some(v => v.covenantId === "cov-budget-ceiling"), "Budget should pass");

  console.log("3. Testing Supermajority Covenant for Target Document...");
  // Amendment with simple majority (50%) targeting cert-incorporation
  const simpleMajProp = new Proposal({
    id: "prop-amend-cert",
    title: "Amend Authorized Shares",
    targetDocumentId: "cert-incorporation",
    votingRule: DefaultVotingRules[VotingRuleType.SIMPLE_MAJORITY]
  });
  const resSimple = engine.evaluateProposal(simpleMajProp);
  assert.strictEqual(resSimple.passed, false, "Simple majority should fail for constitutional amendment");
  assert(resSimple.violations.some(v => v.covenantId === "cov-charter-supermajority"));

  // Amendment with 75% Supermajority targeting cert-incorporation
  const superMajProp = new Proposal({
    id: "prop-amend-cert-super",
    title: "Amend Authorized Shares (Supermajority)",
    targetDocumentId: "cert-incorporation",
    votingRule: DefaultVotingRules[VotingRuleType.THREE_QUARTERS_SUPERMAJORITY]
  });
  const resSuper = engine.evaluateProposal(superMajProp);
  assert(!resSuper.violations.some(v => v.covenantId === "cov-charter-supermajority"));

  console.log("4. Testing Integration with VotingEngine.executeProposal()...");
  const blockchain = new Blockchain({ difficulty: 1 });
  blockchain.initializeGenesis({
    orgName: "Quantum Covenants Corp",
    orgType: "c_corp",
    foundingMembers: [
      { id: "founder", name: "Alice Founder", role: "CEO" },
      { id: "investor", name: "Bob Capital", role: "Lead Investor" }
    ]
  });

  const votingEngine = new VotingEngine({ covenantEngine: engine });
  
  // Create proposal that breaches budget ceiling
  const badProp = votingEngine.createProposal({
    id: "prop-bad-exec",
    type: ProposalType.GOVERNANCE_RULE_CHANGE,
    title: "Massive Acquisition",
    documentData: { spendingAmount: 500000 }
  });

  votingEngine.castVote({ proposalId: "prop-bad-exec", voterId: "founder", decision: VoteDecision.APPROVE });
  votingEngine.castVote({ proposalId: "prop-bad-exec", voterId: "investor", decision: VoteDecision.APPROVE });

  // Execution must throw error due to covenant breach
  assert.throws(() => {
    votingEngine.executeProposal("prop-bad-exec", blockchain);
  }, /Constitutional covenant violation/);

  // Now create valid proposal adhering to all covenants
  const goodProp = votingEngine.createProposal({
    id: "prop-good-exec",
    type: ProposalType.GOVERNANCE_RULE_CHANGE,
    title: "Authorized R&D Compute",
    documentData: { spendingAmount: 40000 }
  });

  votingEngine.castVote({ proposalId: "prop-good-exec", voterId: "founder", decision: VoteDecision.APPROVE });
  votingEngine.castVote({ proposalId: "prop-good-exec", voterId: "investor", decision: VoteDecision.APPROVE });

  const execRes = votingEngine.executeProposal("prop-good-exec", blockchain);
  assert(execRes.block, "Valid proposal must successfully execute into blockchain block");
  assert.strictEqual(execRes.proposal.status, ProposalStatus.EXECUTED);

  console.log("   ✓ Smart Legal Covenants engine passed all tests");
}

try {
  testCovenants();
  console.log("\n>>> ALL COVENANT TESTS PASSED!\n");
} catch (err) {
  console.error("Covenant test failed:", err);
  process.exit(1);
}
