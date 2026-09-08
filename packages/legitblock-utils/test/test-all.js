import * as LegitBlock from "../index.js";
import assert from "node:assert";

async function runTests() {
  console.log("=== Testing LegitBlock Core Utils ===");

  // 1. Templates
  console.log("1. Testing Organization Templates...");
  assert(LegitBlock.ALL_TEMPLATES.length >= 27, "Must have at least 27 templates");
  console.log(`   Found ${LegitBlock.ALL_TEMPLATES.length} total templates`);
  const categories = LegitBlock.getTemplateCategories();
  console.log("   Categories:", categories.map(c => `${c.name} (${c.count})`).join(", "));
  const cCorp = LegitBlock.getTemplateById("c_corp");
  assert(cCorp, "c_corp template must exist");
  assert(cCorp.initialDocuments.length >= 2, "c_corp must have initial documents");
  const workerCoop = LegitBlock.getTemplateById("worker_coop");
  assert(workerCoop, "worker_coop template must exist");
  const charity = LegitBlock.getTemplateById("nonprofit_501c3_public");
  assert(charity, "charity template must exist");
  console.log("   ✓ Templates verification passed");

  // 2. Crypto & Blockchain
  console.log("2. Testing Blockchain Engine...");
  const bc = new LegitBlock.Blockchain({ difficulty: 1 });
  const genesis = bc.initializeGenesis({
    orgName: "Democracy Tech Co-op",
    orgType: "worker_coop",
    jurisdiction: "California",
    foundingMembers: [
      { id: "alice", name: "Alice Walker", role: "Worker-Owner", votingWeight: 1 },
      { id: "bob", name: "Bob Chen", role: "Worker-Owner", votingWeight: 1 },
      { id: "carol", name: "Carol Martinez", role: "Worker-Owner", votingWeight: 1 }
    ],
    initialDocuments: workerCoop.initialDocuments,
    validator: "alice"
  });

  assert(genesis.index === 0, "Genesis index must be 0");
  assert(genesis.isValid(), "Genesis block must be valid");
  assert(bc.chain.length === 1 + workerCoop.initialDocuments.length, "Chain should include genesis + initial documents");
  assert(bc.isChainValid().valid, "Chain must be cryptographically valid");
  console.log(`   ✓ Blockchain initialized with ${bc.chain.length} blocks, chain valid`);

  // 3. Document Management & History
  console.log("3. Testing Document Retrieval & History...");
  const docs = bc.getAllDocuments();
  assert(docs.length === workerCoop.initialDocuments.length, "All initial docs must be retrievable");
  const articles = docs.find(d => d.id === "doc-worker-coop-articles");
  assert(articles, "Articles of incorporation must be found");
  const history = bc.getDocumentHistory("doc-worker-coop-articles");
  assert(history.length === 1, "Should have 1 history event initially");
  console.log("   ✓ Document state reconstructed from chain");

  // 4. Document Diff
  console.log("4. Testing Document Diff Engine...");
  const oldText = "# Title\n\nArticle 1: Initial rule\nArticle 2: Keep this";
  const newText = "# Title\n\nArticle 1: Modified rule with amendment\nArticle 2: Keep this\nArticle 3: Added rule";
  const diffLines = LegitBlock.getDiffLines(oldText, newText);
  assert(diffLines.some(l => l.type === "added"), "Diff should identify additions");
  assert(diffLines.some(l => l.type === "removed"), "Diff should identify deletions");
  console.log("   ✓ Document diff engine working");

  // 5. Voting Engine & Proposals
  console.log("5. Testing Voting System & Blockchain Commit...");
  const engine = new LegitBlock.VotingEngine();
  const proposal = engine.createProposal({
    type: LegitBlock.ProposalType.AMENDMENT,
    title: "Amend Articles to expand worker assembly powers",
    description: "Proposed amendment to Article II of Articles of Incorporation",
    proposer: { id: "alice", name: "Alice Walker" },
    targetDocumentId: "doc-worker-coop-articles",
    targetDocumentTitle: "Articles of Incorporation",
    documentData: {
      content: articles.content + "\n\n## Article IV: Additional Powers\nApproved by member vote.",
      proposedVersion: "1.1",
      diff: LegitBlock.computeUnifiedDiff(articles.content, articles.content + "\n\n## Article IV: Additional Powers\nApproved by member vote.")
    },
    votingRule: LegitBlock.DefaultVotingRules[LegitBlock.VotingRuleType.SIMPLE_MAJORITY]
  });

  // Cast votes
  engine.castVote({ proposalId: proposal.id, voterId: "alice", decision: "APPROVE", totalEligibleMembers: 3 });
  engine.castVote({ proposalId: proposal.id, voterId: "bob", decision: "APPROVE", totalEligibleMembers: 3 });

  // Tally & execute
  const { proposal: executedProp, block } = engine.executeProposal(proposal.id, bc, "alice");
  assert(executedProp.status === LegitBlock.ProposalStatus.EXECUTED, "Proposal should be EXECUTED");
  assert(bc.isChainValid().valid, "Chain must remain cryptographically valid after execution");

  const updatedDocs = bc.getAllDocuments();
  const updatedArticles = updatedDocs.find(d => d.id === "doc-worker-coop-articles");
  assert(updatedArticles.version === "1.1", "Document version must be 1.1");
  const updatedHistory = bc.getDocumentHistory("doc-worker-coop-articles");
  assert(updatedHistory.length === 2, "History must have 2 entries now");
  console.log("   ✓ Voting and automatic blockchain commit verified!");

  // 6. LDAP Authentication
  console.log("6. Testing LDAP Authentication & JWT...");
  const auth = new LegitBlock.LDAPAuthProvider({ useMock: true });
  const authRes = await auth.authenticate("alice", "password123");
  assert(authRes.success, "Alice should authenticate via LDAP");
  assert(authRes.user.username === "alice", "Username should match");
  assert(authRes.token, "JWT token must be generated");
  const verified = auth.verifySession(authRes.token);
  assert(verified && verified.username === "alice", "Token must decode to Alice");
  const invalidRes = await auth.authenticate("alice", "wrongpass");
  assert(!invalidRes.success, "Invalid password must fail");
  console.log("   ✓ LDAP authentication and JWT sessions verified");

  console.log("\n==========================================");
  console.log("ALL 6 TEST SUITES PASSED SUCCESSFULLY!");
  console.log("==========================================");
}

runTests().catch(err => {
  console.error("Test failure:", err);
  process.exit(1);
});
