import assert from "node:assert";
import { MerkleLegalTree, hashLeaf, hashBranch } from "../src/crypto/merkle.js";

console.log("=== Testing Section-Level Merkle Tree & Inclusion Proofs ===");

// 1. Direct clause tree construction
console.log("1. Testing basic MerkleLegalTree creation with explicit clauses...");
const sampleClauses = [
  { id: "art-1", title: "Article I: Name", content: "The name of the corporation is LegitBlock Corp." },
  { id: "art-2", title: "Article II: Purpose", content: "The purpose is institutional governance." },
  { id: "art-3", title: "Article III: Board", content: "The board shall consist of 5 members." },
  { id: "art-4", title: "Article IV: Voting", content: "All decisions require a 60% majority." }
];

const tree = new MerkleLegalTree(sampleClauses);
assert(tree.getRootHash(), "Merkle tree must have a non-empty root hash");
assert.strictEqual(tree.getClauses().length, 4, "Should have 4 clauses");
console.log(`   ✓ Root hash calculated: ${tree.getRootHash()}`);

// 2. Inclusion proof generation and verification
console.log("2. Testing proof generation for Article III...");
const proofObj = tree.getProof("art-3");
assert.strictEqual(proofObj.clause.id, "art-3");
assert(Array.isArray(proofObj.proof), "Proof must be an array of steps");
assert.strictEqual(proofObj.proof.length, 2, "Binary tree with 4 leaves has proof depth 2");

const isValid = MerkleLegalTree.verifyProof(
  { id: "art-3", content: "The board shall consist of 5 members." },
  proofObj.proof,
  tree.getRootHash()
);
assert.strictEqual(isValid, true, "Proof verification must succeed for untampered clause");
console.log("   ✓ Inclusion proof verified successfully");

// 3. Tamper detection on clause content
console.log("3. Testing tamper detection on altered clause text...");
const isTamperedValid = MerkleLegalTree.verifyProof(
  { id: "art-3", content: "The board shall consist of 999 members." }, // Tampered text!
  proofObj.proof,
  tree.getRootHash()
);
assert.strictEqual(isTamperedValid, false, "Proof verification MUST fail on tampered content");
console.log("   ✓ Tampered content correctly rejected");

// 4. Testing odd number of leaves (tree balancing)
console.log("4. Testing odd-numbered clauses (3 leaves)...");
const oddTree = new MerkleLegalTree(sampleClauses.slice(0, 3));
assert(oddTree.getRootHash(), "Odd-sized tree must compute valid root");
const proofOdd = oddTree.getProof("art-2");
const isOddValid = MerkleLegalTree.verifyProof(
  { id: "art-2", content: "The purpose is institutional governance." },
  proofOdd.proof,
  oddTree.getRootHash()
);
assert.strictEqual(isOddValid, true, "Odd-sized tree proof must verify");
console.log("   ✓ Odd-sized tree leaf pairing passed");

// 5. Testing Markdown parser
console.log("5. Testing MerkleLegalTree.fromMarkdown()...");
const markdownCharter = `
# Certificate of Incorporation of Apex Holdings

## ARTICLE I: NAME
The corporate name is Apex Holdings, Inc.

## ARTICLE II: REGISTERED AGENT
The registered agent address is 1209 Orange St, Wilmington, DE 19801.

## ARTICLE III: AUTHORIZED CAPITAL
The total number of shares of stock authorized is 10,000,000 shares of Common Stock.

## ARTICLE IV: DIRECTOR LIABILITY
To the fullest extent permitted by the Delaware General Corporation Law, directors shall not be liable.
`;

const mdTree = MerkleLegalTree.fromMarkdown(markdownCharter);
assert(mdTree.getClauses().length >= 4, "Markdown parser should identify all sections");
console.log(`   Found ${mdTree.getClauses().length} structured sections from Markdown`);

const capitalProof = mdTree.getProof(mdTree.getClauses()[3].id);
const isCapitalValid = MerkleLegalTree.verifyProof(
  { id: capitalProof.clause.id, content: capitalProof.clause.content },
  capitalProof.proof,
  mdTree.getRootHash()
);
assert.strictEqual(isCapitalValid, true, "Markdown parsed section proof must verify");
console.log("   ✓ Markdown charter section proof verified");

// 6. Audit packet export
console.log("6. Testing exportAuditPacket()...");
const auditPacket = mdTree.exportAuditPacket(mdTree.getClauses()[3].id);
assert.strictEqual(auditPacket.standard, "LEGITBLOCK-MERKLE-INCLUSION-v1");
assert(auditPacket.leafHash);
assert(auditPacket.merkleRoot);
assert(auditPacket.proof.length > 0);
console.log("   ✓ Audit packet exported successfully");

console.log("\n>>> ALL MERKLE LEGAL TREE TESTS PASSED!");
