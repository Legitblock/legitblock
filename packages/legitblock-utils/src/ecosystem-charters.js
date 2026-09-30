/**
 * LegitBlock Ecosystem Corporate Charter Initializer
 * Seals the Genesis governance blocks for sample corporate charters and legal entities.
 */

import { Blockchain } from "./blockchain/blockchain.js";
import { getTemplateById } from "./templates/index.js";

/**
 * @typedef {Object} MemberConfig
 * @property {string} id
 * @property {string} name
 * @property {string} role
 * @property {number} votingWeight
 */

/**
 * @typedef {Object} CompanyCharterConfig
 * @property {string} companyName
 * @property {string} templateId
 * @property {string} jurisdiction
 * @property {MemberConfig[]} foundingMembers
 */

/** @type {CompanyCharterConfig[]} */
export const ECOSYSTEM_VENTURES = [
  {
    companyName: "Acme Quantum Dynamics Inc.",
    templateId: "c_corp_delaware",
    jurisdiction: "Delaware",
    foundingMembers: [
      { id: "founder-joshua", name: "Joshua Edward McLaughlin Cox", role: "Chief Executive Officer & Director", votingWeight: 1 },
      { id: "director-jem", name: "J EM Cox", role: "Chief Technology Officer & Director", votingWeight: 1 },
    ],
  },
  {
    companyName: "Hyperion Sonic Collective",
    templateId: "platform_coop",
    jurisdiction: "California",
    foundingMembers: [
      { id: "founder-eddymac", name: "Eddy Mac", role: "Board President", votingWeight: 1 },
      { id: "artist-maccox", name: "Mac Cox", role: "Vice President", votingWeight: 1 },
      { id: "audio-edmccox", name: "Ed McCox", role: "Treasurer", votingWeight: 1 },
    ],
  },
  {
    companyName: "Vanguard Cybernetics Corp.",
    templateId: "c_corp_delaware",
    jurisdiction: "Delaware",
    foundingMembers: [
      { id: "founder-jedmclaughlin", name: "J Ed McLaughlin", role: "Chief Executive Officer", votingWeight: 1 },
      { id: "edge-edcox", name: "Ed Cox", role: "VP of Engineering", votingWeight: 1 },
    ],
  },
  {
    companyName: "Sovereign BioVentures PBC",
    templateId: "benefit_corp",
    jurisdiction: "Delaware",
    foundingMembers: [
      { id: "founder-joshed", name: "Josh Ed", role: "Founder & CEO", votingWeight: 1 },
      { id: "clinical-eddylin", name: "Eddy Lin", role: "Chief Scientific Officer", votingWeight: 1 },
    ],
  },
  {
    companyName: "Prometheus Open Knowledge Foundation",
    templateId: "nonprofit_501c3_public",
    jurisdiction: "Delaware",
    foundingMembers: [
      { id: "founder-coxedward", name: "Cox Edward", role: "Executive Director", votingWeight: 1 },
      { id: "compliance-mccox", name: "Mc Cox", role: "Treasurer", votingWeight: 1 },
      { id: "community-mced", name: "McEd", role: "Secretary", votingWeight: 1 },
    ],
  },
];

/**
 * Initializes the Genesis block and statutory corporate charter for a specified ecosystem company.
 * @param {CompanyCharterConfig} venture
 */
export function foundEcosystemCompany(venture) {
  const tpl = getTemplateById(venture.templateId) || getTemplateById("c_corp_delaware");
  const chain = new Blockchain({ difficulty: 1 });

  const genesisBlock = chain.initializeGenesis({
    orgName: venture.companyName,
    orgType: venture.templateId,
    jurisdiction: venture.jurisdiction,
    foundingMembers: venture.foundingMembers,
    initialDocuments: tpl?.initialDocuments || [],
    governanceRules: {
      governingBody: tpl?.governance?.governingBody || "Board of Directors",
      votingMethod: tpl?.governance?.votingMethod || "majority",
      quorumPercentage: tpl?.governance?.quorumPercentage || 50,
      approvalThreshold: tpl?.governance?.approvalThreshold || 50,
      officerRoles: tpl?.governance?.officerRoles || ["President", "Secretary", "Treasurer"],
    },
  });

  return {
    chain,
    genesisBlock,
    orgName: venture.companyName,
    blockHash: genesisBlock.hash,
    timestamp: genesisBlock.timestamp,
  };
}
