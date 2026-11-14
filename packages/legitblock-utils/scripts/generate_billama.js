import fs from 'fs';
import { ECOSYSTEM_VENTURES, foundEcosystemCompany } from "../src/ecosystem-charters.js";

const billama = ECOSYSTEM_VENTURES.find(v => v.companyName === "Billama Inc.");
const result = foundEcosystemCompany(billama);

const output = {
  company: result.orgName,
  timestamp: result.timestamp,
  genesisBlockHash: result.blockHash,
  chain: result.chain.chain,
  governanceRules: result.genesisBlock.data.governanceRules,
  foundingMembers: billama.foundingMembers
};

fs.writeFileSync('billama_founding_minutes.json', JSON.stringify(output, null, 2));

console.log("Billama Inc. founding minutes and seals generated successfully!");
console.log(`Block Hash: ${result.blockHash}`);
console.log(`Saved to billama_founding_minutes.json`);
