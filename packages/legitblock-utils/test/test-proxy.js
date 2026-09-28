import assert from "node:assert";
import {
  ProxyGrant,
  ProxyEngine,
  ProxyScope
} from "../src/voting/proxy.js";
import { generateMemberKeyPair, signData, stringifyCanonical } from "../src/blockchain/crypto.js";

console.log("=== Testing Delegated Proxy Voting Engine (DGCL § 212) ===");

// 1. Basic Proxy Grant Creation
console.log("1. Testing ProxyGrant creation and deterministic hashing...");
const grant1 = new ProxyGrant({
  grantorId: "shareholder-alice",
  grantorName: "Alice Walker",
  agentId: "director-bob",
  agentName: "Bob Chen",
  scope: ProxyScope.ALL,
  delegatedWeight: 25
});

assert.strictEqual(grant1.grantorId, "shareholder-alice");
assert.strictEqual(grant1.agentId, "director-bob");
assert.strictEqual(grant1.delegatedWeight, 25);
assert.strictEqual(grant1.scope, ProxyScope.ALL);
assert.strictEqual(grant1.isActive(), true, "Newly created grant must be active");
assert(grant1.grantHash && grant1.grantHash.length === 64, "Grant must have 64-char SHA-256 hash");
console.log(`   ✓ Proxy grant created: id=${grant1.id}, hash=${grant1.grantHash.slice(0, 16)}...`);

// 2. Self-delegation rejection
console.log("2. Testing self-delegation prohibition...");
assert.throws(() => {
  new ProxyGrant({
    grantorId: "alice",
    agentId: "alice"
  });
}, /cannot delegate voting proxy to themselves/i);
console.log("   ✓ Self-delegation rejected");

// 3. Cryptographic Signature on Proxy Grant
console.log("3. Testing cryptographic signature verification on proxy appointment...");
const aliceKeys = generateMemberKeyPair();
const canonicalPayload = stringifyCanonical({
  grantorId: "shareholder-alice",
  agentId: "director-bob",
  scope: ProxyScope.ALL,
  targetProposalId: null,
  delegatedWeight: 25,
  validFrom: grant1.validFrom,
  expiresAt: grant1.expiresAt
});
const aliceSig = signData(canonicalPayload, aliceKeys.privateKey);
grant1.signature = aliceSig;

const engine = new ProxyEngine();
const registeredGrant = engine.registerGrant(grant1, aliceKeys.publicKey);
assert.strictEqual(registeredGrant.id, grant1.id);
console.log("   ✓ Cryptographically signed proxy grant registered successfully");

// 4. Circular delegation prevention
console.log("4. Testing circular delegation cycle detection...");
const circularGrant = new ProxyGrant({
  grantorId: "director-bob",
  agentId: "shareholder-alice",
  delegatedWeight: 10
});
assert.throws(() => {
  engine.registerGrant(circularGrant);
}, /circular proxy delegation detected/i);
console.log("   ✓ Circular delegation (Alice -> Bob -> Alice) successfully blocked");

// 5. Scope-specific Delegation (Budget Only)
console.log("5. Testing scope-specific proxy delegation (Budget scope)...");
const budgetGrant = new ProxyGrant({
  grantorId: "carol",
  agentId: "director-bob",
  scope: ProxyScope.BUDGET,
  delegatedWeight: 15
});
engine.registerGrant(budgetGrant);

const budgetProposal = {
  id: "prop-capex-01",
  type: "GOVERNANCE_RULE_CHANGE",
  documentData: { spendingAmount: 50000 }
};

const charterProposal = {
  id: "prop-bylaw-01",
  type: "AMENDMENT",
  documentData: { content: "New Bylaw" }
};

assert.strictEqual(budgetGrant.isActive(budgetProposal), true, "Budget grant must be active for spending proposal");
assert.strictEqual(budgetGrant.isActive(charterProposal), false, "Budget grant must NOT be active for charter amendment");
console.log("   ✓ Subject-matter scope filtering verified");

// 6. Effective Voting Power Calculation
console.log("6. Testing effective voting power aggregation (Grantor vs Proxy Agent)...");
// Bob's base weight = 20.
// Bob receives 25 from Alice (ALL) + 15 from Carol (BUDGET).
// For budget proposal: Bob's effective weight = 20 + 25 + 15 = 60.
// For charter proposal: Bob's effective weight = 20 + 25 = 45.
const bobBudgetPower = engine.calculateEffectiveWeight({
  memberId: "director-bob",
  baseWeight: 20,
  proposal: budgetProposal
});
assert.strictEqual(bobBudgetPower.effectiveWeight, 60, "Bob should have 60 votes on budget proposals");
assert.strictEqual(bobBudgetPower.delegatedInWeight, 40);

const bobCharterPower = engine.calculateEffectiveWeight({
  memberId: "director-bob",
  baseWeight: 20,
  proposal: charterProposal
});
assert.strictEqual(bobCharterPower.effectiveWeight, 45, "Bob should have 45 votes on charter amendments");

// Alice delegated 25 out of her 30 votes:
const alicePower = engine.calculateEffectiveWeight({
  memberId: "shareholder-alice",
  baseWeight: 30
});
assert.strictEqual(alicePower.retainedWeight, 5, "Alice retains 5 votes after delegating 25");
assert.strictEqual(alicePower.delegatedOutWeight, 25);
console.log("   ✓ Transitive effective voting power accurately aggregated");

// 7. Revocation of Proxy Appointment
console.log("7. Testing proxy appointment revocation...");
engine.revokeGrant(grant1.id, "shareholder-alice");
assert.strictEqual(grant1.revoked, true);
assert.strictEqual(grant1.isActive(), false, "Revoked grant must be inactive");

const bobPowerAfterRevoke = engine.calculateEffectiveWeight({
  memberId: "director-bob",
  baseWeight: 20,
  proposal: budgetProposal
});
assert.strictEqual(bobPowerAfterRevoke.effectiveWeight, 35, "Bob's weight drops to 35 (20 base + 15 Carol) after Alice revokes");
console.log("   ✓ Revocation immediately reflects in voting power calculation");

// 8. Statutory Audit Receipt Generation (DGCL § 212)
console.log("8. Testing generateProxyReceipt() statutory compliance receipt...");
const receipt = engine.generateProxyReceipt(budgetGrant.id);
assert.strictEqual(receipt.standard, "LEGITBLOCK-DGCL-212-PROXY-APPOINTMENT-v1");
assert.strictEqual(receipt.statute, "Delaware General Corporation Law § 212(b) & (c)");
assert(receipt.receiptHash && receipt.receiptHash.length === 64);
console.log(`   ✓ Statutory DGCL § 212 compliance receipt generated: ${receipt.receiptHash.slice(0, 16)}...`);

console.log("\n>>> ALL DELEGATED PROXY VOTING TESTS PASSED!\n");
