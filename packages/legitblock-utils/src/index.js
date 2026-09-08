// Blockchain core
export { Block } from "./blockchain/block.js";
export { Blockchain } from "./blockchain/blockchain.js";
export {
  sha256,
  hashObject,
  stringifyCanonical,
  generateMemberKeyPair,
  signData,
  verifySignature
} from "./blockchain/crypto.js";

// Document management & Diffing
export { Document, DocumentCategory, DocumentStatus } from "./documents/document.js";
export {
  computeStructuredDiff,
  computeUnifiedDiff,
  formatDiffTerminal,
  getDiffLines
} from "./documents/diff.js";

// Voting & Governance
export { Proposal, ProposalType, ProposalStatus, VoteDecision } from "./voting/proposal.js";
export { DefaultVotingRules, VotingRuleType, evaluateVotingRule } from "./voting/votingRules.js";
export { VotingEngine } from "./voting/engine.js";

// Organization Templates
export {
  ALL_TEMPLATES,
  FOR_PROFIT_TEMPLATES,
  NON_PROFIT_TEMPLATES,
  COOPERATIVE_TEMPLATES,
  getTemplateById,
  getTemplatesByCategory,
  searchTemplates,
  getTemplateCategories
} from "./templates/index.js";

// Authentication & LDAP
export { LDAPAuthProvider, signUserToken, verifyUserToken, MOCK_LDAP_USERS } from "./auth/ldap.js";

// Storage
export { LegitBlockStore } from "./storage/store.js";
