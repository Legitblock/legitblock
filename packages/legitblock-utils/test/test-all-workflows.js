import assert from "node:assert";
import * as LegitBlock from "../index.js";

async function runComprehensiveWorkflowTests() {
  console.log("================================================================================");
  console.log("   LEGITBLOCK — COMPREHENSIVE ORGANIZATIONAL WORKFLOW TEST SUITE");
  console.log("================================================================================\n");

  const templates = LegitBlock.ALL_TEMPLATES;
  console.log(`Discovered ${templates.length} total organization templates across 3 sectors:`);
  console.log(` - For-Profit Businesses: ${LegitBlock.FOR_PROFIT_TEMPLATES.length}`);
  console.log(` - Non-Profit Organizations: ${LegitBlock.NON_PROFIT_TEMPLATES.length}`);
  console.log(` - Cooperatives & Mutuals: ${LegitBlock.COOPERATIVE_TEMPLATES.length}\n`);

  // ==============================================================================
  // TEST SUITE 1: BATCH INITIALIZATION & GENESIS FOR ALL 32 TEMPLATES
  // ==============================================================================
  console.log(">>> [SUITE 1] Testing Genesis Block & Document Ratification for ALL 32 Templates...");

  let totalDocsProcessed = 0;

  for (let i = 0; i < templates.length; i++) {
    const tpl = templates[i];
    const chain = new LegitBlock.Blockchain({ difficulty: 1 });

    const foundingMembers = [
      { id: "founder-1", name: "Founder One", role: tpl.governance.officerRoles[0] || "Chair", votingWeight: 1 },
      { id: "founder-2", name: "Founder Two", role: tpl.governance.officerRoles[1] || "Officer", votingWeight: 1 },
      { id: "founder-3", name: "Founder Three", role: tpl.governance.officerRoles[2] || "Member", votingWeight: 1 },
    ];

    const genesis = chain.initializeGenesis({
      orgName: `Test ${tpl.name}`,
      orgType: tpl.id,
      jurisdiction: "Delaware",
      foundingMembers,
      initialDocuments: tpl.initialDocuments,
      governanceRules: {
        governingBody: tpl.governance.governingBody,
        votingMethod: tpl.governance.votingMethod,
        defaultQuorumPercentage: tpl.governance.defaultQuorumPercentage,
        defaultPassingThresholdPercentage: tpl.governance.defaultPassingThresholdPercentage
      },
      validator: "founder-1"
    });

    assert(genesis, `Genesis must exist for ${tpl.id}`);
    assert.strictEqual(genesis.index, 0, `Genesis index must be 0 for ${tpl.id}`);
    assert(genesis.isValid(), `Genesis hash must be cryptographically valid for ${tpl.id}`);

    // Verify all initial documents were converted to blocks
    const expectedBlockCount = 1 + tpl.initialDocuments.length;
    assert.strictEqual(
      chain.chain.length,
      expectedBlockCount,
      `Block count mismatch for ${tpl.id}: expected ${expectedBlockCount}, got ${chain.chain.length}`
    );

    // Verify chain integrity
    const val = chain.isChainValid();
    assert(val.valid, `Chain integrity failed for ${tpl.id}: ${val.error}`);

    // Verify reconstructed documents match template
    const onChainDocs = chain.getAllDocuments();
    assert.strictEqual(
      onChainDocs.length,
      tpl.initialDocuments.length,
      `Document count mismatch for ${tpl.id}`
    );

    totalDocsProcessed += onChainDocs.length;
  }

  console.log(` ✓ Successfully initialized all 32 templates with Genesis blocks!`);
  console.log(` ✓ Total founding documents ratified and hashed onto chains: ${totalDocsProcessed}`);
  console.log(` ✓ Cryptographic validation passed for all 32 independent blockchains.\n`);

  // ==============================================================================
  // TEST SUITE 2: FOR-PROFIT WORKFLOW (C-CORP & MULTI-MEMBER LLC)
  // ==============================================================================
  console.log(">>> [SUITE 2] Testing For-Profit Workflows (Shareholder & Board Governance)...");

  {
    const cCorpTpl = LegitBlock.getTemplateById("c_corp");
    const bc = new LegitBlock.Blockchain({ difficulty: 1 });
    const members = [
      { id: "alice", name: "Alice (Director)", role: "CEO", votingWeight: 1000 },
      { id: "bob", name: "Bob (Director)", role: "Secretary", votingWeight: 500 },
      { id: "carol", name: "Carol (Investor)", role: "Director", votingWeight: 500 }
    ];

    bc.initializeGenesis({
      orgName: "Acme Enterprise Corp",
      orgType: "c_corp",
      jurisdiction: "Delaware",
      foundingMembers: members,
      initialDocuments: cCorpTpl.initialDocuments,
      validator: "alice"
    });

    const engine = new LegitBlock.VotingEngine();
    const bylaws = bc.getAllDocuments().find(d => d.id === "doc-c-corp-bylaws");
    assert(bylaws, "C-Corp bylaws must exist");

    // Amendment proposal: Expand board from 3 to 5 directors
    const amendedBylaws = bylaws.content + "\n\n## Section 4: Expanded Board\nThe board is expanded to 5 voting directors.";
    const diff = LegitBlock.computeUnifiedDiff(bylaws.content, amendedBylaws, bylaws.title);

    const prop = engine.createProposal({
      type: LegitBlock.ProposalType.AMENDMENT,
      title: "Amend Bylaws: Section 4 Expanded Board",
      description: "Increase board seats to 5.",
      proposer: { id: "alice", name: "Alice" },
      targetDocumentId: bylaws.id,
      targetDocumentTitle: bylaws.title,
      documentData: {
        content: amendedBylaws,
        proposedVersion: "1.1",
        diff
      },
      votingRule: LegitBlock.DefaultVotingRules[LegitBlock.VotingRuleType.SIMPLE_MAJORITY]
    });

    // Alice votes APPROVE
    engine.castVote({ proposalId: prop.id, voterId: "alice", decision: "APPROVE", totalEligibleMembers: 3 });
    // Bob votes APPROVE
    engine.castVote({ proposalId: prop.id, voterId: "bob", decision: "APPROVE", totalEligibleMembers: 3 });

    // Execute proposal
    const exec = engine.executeProposal(prop.id, bc, "alice");
    assert.strictEqual(exec.proposal.status, LegitBlock.ProposalStatus.EXECUTED);

    // Verify document in blockchain updated
    const updatedDocs = bc.getAllDocuments();
    const updatedBylaws = updatedDocs.find(d => d.id === bylaws.id);
    assert.strictEqual(updatedBylaws.version, "1.1");
    assert(updatedBylaws.content.includes("Expanded Board"));

    // Verify history trail
    const history = bc.getDocumentHistory(bylaws.id);
    assert.strictEqual(history.length, 2, "Bylaws history must have 2 entries (Insert + Amend)");
    assert(history[1].diff.includes("Expanded Board"));
    assert(bc.isChainValid().valid, "Chain must be valid after C-Corp amendment");

    console.log(" ✓ C-Corporation board voting and Bylaws amendment ratified into block #" + exec.block.index);
  }

  // ==============================================================================
  // TEST SUITE 3: NON-PROFIT WORKFLOW (501(c)(3) PUBLIC CHARITY)
  // ==============================================================================
  console.log(">>> [SUITE 3] Testing Non-Profit 501(c)(3) Workflow (Charitable Quorum & Conflict Policy)...");

  {
    const npTpl = LegitBlock.getTemplateById("nonprofit_501c3_public");
    const bc = new LegitBlock.Blockchain({ difficulty: 1 });
    const trustees = [
      { id: "t1", name: "Trustee 1", role: "Board Chair", votingWeight: 1 },
      { id: "t2", name: "Trustee 2", role: "Treasurer", votingWeight: 1 },
      { id: "t3", name: "Trustee 3", role: "Secretary", votingWeight: 1 },
      { id: "t4", name: "Trustee 4", role: "Trustee", votingWeight: 1 }
    ];

    bc.initializeGenesis({
      orgName: "Global Clean Water Initiative",
      orgType: "nonprofit_501c3_public",
      jurisdiction: "New York",
      foundingMembers: trustees,
      initialDocuments: npTpl.initialDocuments,
      validator: "t1"
    });

    const engine = new LegitBlock.VotingEngine();

    // 1. Test Quorum Failure: Only 1 out of 4 votes (25% participation < 50% quorum)
    const grantProp = engine.createProposal({
      type: LegitBlock.ProposalType.GOVERNANCE_RULE_CHANGE,
      title: "Approve Major $500k Grant Program",
      description: "Charitable grant distribution program.",
      proposer: { id: "t1", name: "Trustee 1" },
      votingRule: LegitBlock.DefaultVotingRules[LegitBlock.VotingRuleType.SIMPLE_MAJORITY]
    });

    engine.castVote({ proposalId: grantProp.id, voterId: "t1", decision: "APPROVE", totalEligibleMembers: 4 });
    const tallyLowQuorum = grantProp.calculateTally(4);
    assert.strictEqual(tallyLowQuorum.quorumMet, false, "Quorum should NOT be met with only 1/4 votes");
    assert.strictEqual(tallyLowQuorum.passed, false, "Proposal should NOT pass without quorum");

    // Try to execute without quorum -> must throw error
    assert.throws(() => {
      engine.executeProposal(grantProp.id, bc, "t1");
    }, /does not meet passing criteria/);

    // Now cast additional votes to satisfy quorum and threshold
    engine.castVote({ proposalId: grantProp.id, voterId: "t2", decision: "APPROVE", totalEligibleMembers: 4 });
    engine.castVote({ proposalId: grantProp.id, voterId: "t3", decision: "APPROVE", totalEligibleMembers: 4 });

    const tallyMet = grantProp.calculateTally(4);
    assert.strictEqual(tallyMet.quorumMet, true, "Quorum met with 3/4 votes (75%)");
    assert.strictEqual(tallyMet.passed, true, "Proposal passes with 3/3 approvals");

    const execGrant = engine.executeProposal(grantProp.id, bc, "t1");
    assert.strictEqual(execGrant.proposal.status, LegitBlock.ProposalStatus.EXECUTED);
    assert(bc.isChainValid().valid);

    console.log(" ✓ 501(c)(3) Quorum enforcement verified: block rejected under quorum, ratified when quorum met");
  }

  // ==============================================================================
  // TEST SUITE 4: COOPERATIVE WORKFLOW (WORKER CO-OP & ONE-MEMBER-ONE-VOTE)
  // ==============================================================================
  console.log(">>> [SUITE 4] Testing Cooperative Workflows (Democratic Member Voting & Admission)...");

  {
    const coopTpl = LegitBlock.getTemplateById("worker_coop");
    const bc = new LegitBlock.Blockchain({ difficulty: 1 });
    const workerOwners = [
      { id: "worker-1", name: "Worker One", role: "Worker-Owner", votingWeight: 1 },
      { id: "worker-2", name: "Worker Two", role: "Worker-Owner", votingWeight: 1 },
      { id: "worker-3", name: "Worker Three", role: "Worker-Owner", votingWeight: 1 }
    ];

    bc.initializeGenesis({
      orgName: "Solidarity Bakery Cooperative",
      orgType: "worker_coop",
      jurisdiction: "California",
      foundingMembers: workerOwners,
      initialDocuments: coopTpl.initialDocuments,
      validator: "worker-1"
    });

    const engine = new LegitBlock.VotingEngine();

    // 1. Test Supermajority Requirement for Admitting New Worker-Owner (75% threshold)
    const admitProp = engine.createProposal({
      type: LegitBlock.ProposalType.MEMBER_ACTION,
      title: "Admit Elena as Worker-Owner after 6-Month Candidacy",
      description: "Elena has completed apprenticeship and is recommended for full membership.",
      proposer: { id: "worker-1", name: "Worker One" },
      documentData: {
        action: "ADD",
        member: {
          id: "worker-4",
          name: "Elena Rostova",
          email: "elena@solidarity.coop",
          role: "Worker-Owner",
          votingWeight: 1
        }
      },
      votingRule: LegitBlock.DefaultVotingRules[LegitBlock.VotingRuleType.THREE_QUARTERS_SUPERMAJORITY]
    });

    // 2 vote approve, 1 vote reject -> 2/3 = 66.7% < 75% threshold -> MUST FAIL
    engine.castVote({ proposalId: admitProp.id, voterId: "worker-1", decision: "APPROVE", totalEligibleMembers: 3 });
    engine.castVote({ proposalId: admitProp.id, voterId: "worker-2", decision: "APPROVE", totalEligibleMembers: 3 });
    engine.castVote({ proposalId: admitProp.id, voterId: "worker-3", decision: "REJECT", totalEligibleMembers: 3 });

    const tallyFailed = admitProp.calculateTally(3);
    assert.strictEqual(tallyFailed.thresholdMet, false, "66.7% should fail 75% supermajority requirement");
    assert.strictEqual(tallyFailed.passed, false);

    // Worker-3 changes vote to APPROVE after consensus discussion
    engine.castVote({ proposalId: admitProp.id, voterId: "worker-3", decision: "APPROVE", totalEligibleMembers: 3 });
    const tallyPassed = admitProp.calculateTally(3);
    assert.strictEqual(tallyPassed.thresholdMet, true, "100% meets 75% threshold");
    assert.strictEqual(tallyPassed.passed, true);

    // Execute member admission
    engine.executeProposal(admitProp.id, bc, "worker-1");
    const updatedMembers = bc.getMembers();
    assert.strictEqual(updatedMembers.length, 4, "Total members must be 4 after admission");
    const elena = updatedMembers.find(m => m.id === "worker-4");
    assert(elena, "Elena must be in official blockchain member ledger");
    assert.strictEqual(elena.role, "Worker-Owner");

    console.log(" ✓ Worker Cooperative 75% Supermajority membership vote and admission ratified onto blockchain!");
  }

  // ==============================================================================
  // TEST SUITE 5: CONSENSUS GOVERNANCE (PLATFORM & TECH COOPERATIVES)
  // ==============================================================================
  console.log(">>> [SUITE 5] Testing Consensus Governance Workflow (Zero Objections / Veto Check)...");

  {
    const platformTpl = LegitBlock.getTemplateById("platform_coop");
    const bc = new LegitBlock.Blockchain({ difficulty: 1 });
    const devs = [
      { id: "dev-1", name: "Dev One", role: "Contributor", votingWeight: 1 },
      { id: "dev-2", name: "Dev Two", role: "Contributor", votingWeight: 1 },
      { id: "dev-3", name: "Dev Three", role: "Contributor", votingWeight: 1 }
    ];

    bc.initializeGenesis({
      orgName: "Open Protocol Platform Co-op",
      orgType: "platform_coop",
      jurisdiction: "Decentralized",
      foundingMembers: devs,
      initialDocuments: platformTpl.initialDocuments,
      validator: "dev-1"
    });

    const engine = new LegitBlock.VotingEngine();

    const policyProp = engine.createProposal({
      type: LegitBlock.ProposalType.NEW_DOCUMENT,
      title: "Adopt Algorithmic Transparency Standard",
      description: "Strict audit requirements for all platform matching algorithms.",
      proposer: { id: "dev-1", name: "Dev One" },
      documentData: {
        category: "operational",
        content: "# Algorithmic Transparency Standard\n\nAll models must be open source.",
        proposedVersion: "1.0"
      },
      votingRule: LegitBlock.DefaultVotingRules[LegitBlock.VotingRuleType.CONSENSUS]
    });

    // 2 approve, 1 reject -> in CONSENSUS, 1 reject acts as a block
    engine.castVote({ proposalId: policyProp.id, voterId: "dev-1", decision: "APPROVE", totalEligibleMembers: 3 });
    engine.castVote({ proposalId: policyProp.id, voterId: "dev-2", decision: "APPROVE", totalEligibleMembers: 3 });
    engine.castVote({ proposalId: policyProp.id, voterId: "dev-3", decision: "REJECT", totalEligibleMembers: 3 });

    const consensusTally = policyProp.calculateTally(3);
    assert.strictEqual(consensusTally.passed, false, "Single rejection must block consensus");

    // Objection resolved, dev-3 abstains
    engine.castVote({ proposalId: policyProp.id, voterId: "dev-3", decision: "ABSTAIN", totalEligibleMembers: 3 });
    const consensusResolved = policyProp.calculateTally(3);
    assert.strictEqual(consensusResolved.passed, true, "Consensus reached when zero rejections are present");

    // Execute new document adoption
    engine.executeProposal(policyProp.id, bc, "dev-1");
    const docs = bc.getAllDocuments();
    assert(docs.some(d => d.title === "Adopt Algorithmic Transparency Standard"));

    console.log(" ✓ Consensus veto block and resolution ratified into blockchain!");
  }

  // ==============================================================================
  // TEST SUITE 6: UNANIMOUS CONSENT (CLOSE CORPORATION & PARTNERSHIPS)
  // ==============================================================================
  console.log(">>> [SUITE 6] Testing Unanimous Consent Governance Workflow (100% Approval)...");

  {
    const closeCorpTpl = LegitBlock.getTemplateById("close_corp");
    const bc = new LegitBlock.Blockchain({ difficulty: 1 });
    const partners = [
      { id: "p1", name: "Partner 1", role: "Partner", votingWeight: 1 },
      { id: "p2", name: "Partner 2", role: "Partner", votingWeight: 1 }
    ];

    bc.initializeGenesis({
      orgName: "Founders Close Corp",
      orgType: "close_corp",
      jurisdiction: "Delaware",
      foundingMembers: partners,
      initialDocuments: closeCorpTpl.initialDocuments,
      validator: "p1"
    });

    const engine = new LegitBlock.VotingEngine();
    const unanimousProp = engine.createProposal({
      type: LegitBlock.ProposalType.GOVERNANCE_RULE_CHANGE,
      title: "Authorize Capital Infusion",
      description: "Authorizing external equity sale requiring 100% consent.",
      proposer: { id: "p1", name: "Partner 1" },
      votingRule: LegitBlock.DefaultVotingRules[LegitBlock.VotingRuleType.UNANIMOUS]
    });

    engine.castVote({ proposalId: unanimousProp.id, voterId: "p1", decision: "APPROVE", totalEligibleMembers: 2 });
    assert.strictEqual(unanimousProp.calculateTally(2).passed, false, "Partial votes must fail unanimous consent");

    engine.castVote({ proposalId: unanimousProp.id, voterId: "p2", decision: "APPROVE", totalEligibleMembers: 2 });
    assert.strictEqual(unanimousProp.calculateTally(2).passed, true, "100% votes passes unanimous consent");

    engine.executeProposal(unanimousProp.id, bc, "p1");
    assert(bc.isChainValid().valid);

    console.log(" ✓ Unanimous consent verified and ratified into blockchain ledger!");
  }

  // ==============================================================================
  // TEST SUITE 7: TAMPER DETECTION & CRYPTOGRAPHIC SECURITY
  // ==============================================================================
  console.log(">>> [SUITE 7] Testing Cryptographic Tamper Detection...");

  {
    const bc = new LegitBlock.Blockchain({ difficulty: 1 });
    bc.initializeGenesis({
      orgName: "Tamper Test Corp",
      orgType: "c_corp",
      jurisdiction: "Delaware",
      foundingMembers: [{ id: "m1", name: "Member 1", role: "Officer" }],
      initialDocuments: [{ id: "doc-1", title: "Charter", category: "founding", content: "Original text" }],
      validator: "m1"
    });

    assert(bc.isChainValid().valid, "Chain initially valid");

    // Intentionally tamper with block data
    const originalHash = bc.chain[1].hash;
    bc.chain[1].data.content = "MALICIOUS TAMPERED TEXT";

    const tamperResult = bc.isChainValid();
    assert.strictEqual(tamperResult.valid, false, "Tampering must invalidate chain");
    assert(tamperResult.error.includes("tampered with"), "Error must specify tampering");
    assert.strictEqual(tamperResult.brokenBlockIndex, 1, "Tampered block index must be identified as #1");

    // Restore original content & verify valid again
    bc.chain[1].data.content = "Original text";
    assert.strictEqual(bc.chain[1].hash, originalHash);
    assert(bc.isChainValid().valid, "Chain valid after restoring integrity");

    console.log(" ✓ Cryptographic tamper detection verified (tampering immediately detected with exact block index)!");
  }

  // ==============================================================================
  // TEST SUITE 8: LDAP AUTHENTICATION AND ROLE-BASED ACCESS
  // ==============================================================================
  console.log(">>> [SUITE 8] Testing LDAP Authentication & Role-Based Authorization...");

  {
    const auth = new LegitBlock.LDAPAuthProvider({ useMock: true });

    // Test Admin
    const adminAuth = await auth.authenticate("admin", "password123");
    assert(adminAuth.success, "Admin auth must succeed");
    assert.strictEqual(adminAuth.user.role, "admin");

    // Test Board President (Chair)
    const aliceAuth = await auth.authenticate("alice", "password123");
    assert(aliceAuth.success, "Alice auth must succeed");
    assert.strictEqual(aliceAuth.user.role, "chair");

    // Test Secretary (Officer)
    const bobAuth = await auth.authenticate("bob", "password123");
    assert(bobAuth.success, "Bob auth must succeed");
    assert.strictEqual(bobAuth.user.role, "officer");

    // Test Member
    const davidAuth = await auth.authenticate("david", "password123");
    assert(davidAuth.success, "David auth must succeed");
    assert.strictEqual(davidAuth.user.role, "member");

    // Test Invalid Password
    const badAuth = await auth.authenticate("alice", "incorrect-pass");
    assert.strictEqual(badAuth.success, false);

    // Test Token verification
    const token = aliceAuth.token;
    const verified = auth.verifySession(token);
    assert.strictEqual(verified.username, "alice");
    assert.strictEqual(verified.role, "chair");

    // Test Directory Search
    const searchRes = await auth.searchMembers("Chen");
    assert.strictEqual(searchRes.length, 1);
    assert.strictEqual(searchRes[0].username, "bob");

    console.log(" ✓ LDAP authentication, role mapping, JWT tokens, and directory searches verified!");
  }

  console.log("\n================================================================================");
  console.log("   ALL 8 ORGANIZATIONAL WORKFLOW TEST SUITES PASSED (100% VERIFIED)!");
  console.log("================================================================================");
}

runComprehensiveWorkflowTests().catch(err => {
  console.error("Workflow test failure:", err);
  process.exit(1);
});
