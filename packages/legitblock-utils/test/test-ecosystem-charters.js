import assert from "node:assert";
import { ECOSYSTEM_VENTURES, foundEcosystemCompany } from "../src/ecosystem-charters.js";

console.log("=== Testing LegitBlock Ecosystem Company Formation ===");
assert.strictEqual(ECOSYSTEM_VENTURES.length, 5);

for (const venture of ECOSYSTEM_VENTURES) {
  const result = foundEcosystemCompany(venture);
  const docCount = result.genesisBlock.data.initialDocumentsSummary ? result.genesisBlock.data.initialDocumentsSummary.length : 0;
  console.log(`✓ Founded: ${result.orgName} | Block Hash: ${result.blockHash.slice(0, 16)}... | Total Blocks: ${result.chain.chain.length} | Initial Docs: ${docCount}`);
  assert.ok(result.blockHash);
  assert.strictEqual(result.chain.chain[0].index, 0);
  assert.strictEqual(result.chain.chain[0].type, "GENESIS");
  assert.strictEqual(result.chain.chain.length, 1 + docCount);
  assert.ok(result.genesisBlock.isValid());
  assert.ok(result.chain.isChainValid());
}

console.log("All 5 ecosystem corporate charters successfully sealed into Genesis blocks!");
