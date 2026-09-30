/**
 * LegitBlock Ecosystem Corporate Charter Initializer
 * Seals the Genesis governance blocks for the five commercial ventures in the Billama ecosystem.
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
    companyName: "Billama Inc.",
    templateId: "c_corp_delaware",
    jurisdiction: "Delaware",
    foundingMembers: [
      { id: "founder-josh", name: "Joshua Cox", role: "Chief Executive Officer & Director", votingWeight: 1 },
      { id: "director-tech", name: "Technical Co-Founder", role: "Chief Technology Officer & Director", votingWeight: 1 },
    ],
  },
  {
    companyName: "Syncromancer Cooperative",
    templateId: "platform_coop",
    jurisdiction: "California",
    foundingMembers: [
      { id: "founder-josh", name: "Joshua Cox", role: "Board President", votingWeight: 1 },
      { id: "artist-lead", name: "Artist Syndicate Representative", role: "Vice President", votingWeight: 1 },
      { id: "audio-lead", name: "Audio DSP Contributor", role: "Treasurer", votingWeight: 1 },
    ],
  },
  {
    companyName: "Monitaur Technologies Inc.",
    templateId: "c_corp_delaware",
    jurisdiction: "Delaware",
    foundingMembers: [
      { id: "founder-josh", name: "Joshua Cox", role: "Chief Executive Officer", votingWeight: 1 },
      { id: "edge-lead", name: "IoT Edge Engineering Lead", role: "VP of Engineering", votingWeight: 1 },
    ],
  },
  {
    companyName: "FitDjinn Health PBC",
    templateId: "benefit_corp",
    jurisdiction: "Delaware",
    foundingMembers: [
      { id: "founder-josh", name: "Joshua Cox", role: "Founder & CEO", votingWeight: 1 },
      { id: "clinical-advisor", name: "Medical & Metabolic Advisor", role: "Chief Medical Officer", votingWeight: 1 },
    ],
  },
  {
    companyName: "Ironclad Grants Foundation",
    templateId: "nonprofit_501c3_public",
    jurisdiction: "Delaware",
    foundingMembers: [
      { id: "founder-josh", name: "Joshua Cox", role: "Executive Director", votingWeight: 1 },
      { id: "compliance-cpa", name: "Uniform Guidance CPA", role: "Treasurer", votingWeight: 1 },
      { id: "community-rep", name: "Community Trustee", role: "Secretary", votingWeight: 1 },
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
