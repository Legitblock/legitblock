import assert from "node:assert";
import { JurisdictionCode, JurisdictionValidator, STATUTORY_RULESETS } from "../src/compliance/jurisdictions.js";

console.log("=== Testing Multi-Jurisdictional Statutory Rulesets ===");

// 1. Delaware DGCL § 216 Quorum Limit
console.log("1. Testing Delaware Corporation (DGCL § 216) 1/3 quorum minimum...");
const deFail = JurisdictionValidator.validateProposal({
  jurisdiction: JurisdictionCode.DELAWARE_CORP,
  proposal: {
    title: "Amend Bylaws for Ultra-Low Quorum",
    quorumThreshold: 0.15 // 15% is illegal under DGCL § 216
  }
});
assert.strictEqual(deFail.valid, false, "Must reject quorum below 33.3%");
assert(deFail.errors[0].includes("DGCL"));

const dePass = JurisdictionValidator.validateProposal({
  jurisdiction: JurisdictionCode.DELAWARE_CORP,
  proposal: {
    title: "Standard DGCL Board Meeting",
    quorumThreshold: 0.5
  }
});
assert.strictEqual(dePass.valid, true, "Standard Delaware quorum must pass");
console.log("   ✓ Delaware DGCL § 216 quorum enforcement verified");

// 2. California Worker Co-op AB 816 One-Member-One-Vote
console.log("2. Testing California Worker Co-op Act (AB 816) One-Worker-One-Vote...");
const caFail = JurisdictionValidator.validateProposal({
  jurisdiction: JurisdictionCode.CALIFORNIA_WORKER_COOP,
  proposal: { title: "Approve Annual Budget", quorumThreshold: 0.5 },
  memberWeights: [
    { memberId: "worker-1", weight: 1 },
    { memberId: "worker-2", weight: 5 } // Unequal capital weight!
  ]
});
assert.strictEqual(caFail.valid, false, "Must reject unequal voting weight in California worker co-op");
assert(caFail.errors[0].includes("One Member, One Vote"));

const caPass = JurisdictionValidator.validateProposal({
  jurisdiction: JurisdictionCode.CALIFORNIA_WORKER_COOP,
  proposal: { title: "Approve Annual Budget", quorumThreshold: 0.5 },
  memberWeights: [
    { memberId: "worker-1", weight: 1 },
    { memberId: "worker-2", weight: 1 },
    { memberId: "worker-3", weight: 1 }
  ]
});
assert.strictEqual(caPass.valid, true, "Equal worker-owner weights must pass");
console.log("   ✓ California Worker Co-op equal vote mandate verified");

// 3. Wyoming DUNA Act 2024 Non-Profit Asset Lock
console.log("3. Testing Wyoming DUNA Act (W.S. 17-31) Non-Profit Asset Lock...");
const wyFail = JurisdictionValidator.validateProposal({
  jurisdiction: JurisdictionCode.WYOMING_DUNA_2024,
  proposal: {
    title: "Distribute Q3 Member Profit Dividend",
    type: "MEMBER_PROFIT_DIVIDEND",
    quorumThreshold: 0.5
  }
});
assert.strictEqual(wyFail.valid, false, "Must prohibit for-profit dividends under DUNA asset lock");
assert(wyFail.errors[0].includes("Wyoming DUNA Act"));

const wyPass = JurisdictionValidator.validateProposal({
  jurisdiction: JurisdictionCode.WYOMING_DUNA_2024,
  proposal: {
    title: "Approve Open Source Community Grant Program",
    type: "GRANT_ALLOCATION",
    quorumThreshold: 0.5
  }
});
assert.strictEqual(wyPass.valid, true, "Charitable grant allocation under DUNA must pass");
console.log("   ✓ Wyoming DUNA statutory non-profit asset lock verified");

// 4. UK Companies Act 2006 Special Resolution (75% supermajority)
console.log("4. Testing UK Companies Act 2006 s. 283 Special Resolution...");
const ukFail = JurisdictionValidator.validateProposal({
  jurisdiction: JurisdictionCode.UK_COMPANIES_ACT,
  proposal: {
    title: "Special Resolution to Disapply Pre-emption Rights",
    isSpecialResolution: true,
    passThreshold: 0.60 // Illegal: must be >= 75%
  }
});
assert.strictEqual(ukFail.valid, false, "Special resolution below 75% must be rejected");
assert(ukFail.errors[0].includes("75% affirmative supermajority"));

const ukPass = JurisdictionValidator.validateProposal({
  jurisdiction: JurisdictionCode.UK_COMPANIES_ACT,
  proposal: {
    title: "Special Resolution to Disapply Pre-emption Rights",
    isSpecialResolution: true,
    passThreshold: 0.75
  }
});
assert.strictEqual(ukPass.valid, true, "75% UK Special Resolution must pass");
console.log("   ✓ UK Companies Act Special Resolution threshold verified");

console.log("\n>>> ALL MULTI-JURISDICTIONAL STATUTORY TESTS PASSED!");
