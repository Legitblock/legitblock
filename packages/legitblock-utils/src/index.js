// Blockchain core
export { Block } from "./blockchain/block.js";
export { Blockchain } from "./blockchain/blockchain.js";
export { EvmBridge } from "./blockchain/evmBridge.js";
export {
  sha256,
  hashObject,
  stringifyCanonical,
  generateMemberKeyPair,
  signData,
  verifySignature
} from "./blockchain/crypto.js";

// Advanced Cryptography: Merkle Trees, ZK Proofs, Post-Quantum & Public Anchoring
export {
  MerkleLegalTree,
  hashLeaf,
  hashBranch
} from "./crypto/merkle.js";
export {
  ZkRangeProofEngine
} from "./crypto/zk.js";
export {
  PqcHybridSigner
} from "./crypto/pqc.js";
export {
  AnchorAuthority,
  AnchorReceipt,
  OpenTimestampsAdapter,
  Rfc3161TimestampAdapter,
  ChainAnchorService
} from "./crypto/anchoring.js";

// Document management & Diffing
export { Document, DocumentCategory, DocumentStatus } from "./documents/document.js";
export {
  computeStructuredDiff,
  computeUnifiedDiff,
  formatDiffTerminal,
  getDiffLines
} from "./documents/diff.js";
export { LegalPacketExporter } from "./documents/exporter.js";
export { StatutoryTaxExporter } from "./documents/taxExporter.js";
export { Covenant, CovenantType, CovenantEngine } from "./documents/covenants.js";

// Voting & Governance
export { Proposal, ProposalType, ProposalStatus, VoteDecision } from "./voting/proposal.js";
export { DefaultVotingRules, VotingRuleType, evaluateVotingRule } from "./voting/votingRules.js";
export { VotingEngine } from "./voting/engine.js";
export { RecusalType, RecusalRecord, RecusalEngine } from "./voting/recusal.js";
export { BlindedBallot, SecretBallotEngine } from "./voting/secret-ballot.js";
export { ProxyGrant, ProxyEngine, ProxyScope } from "./voting/proxy.js";
export { QuadraticVotingSession } from "./voting/quadratic.js";
export { ConvictionProposal, ConvictionVotingEngine } from "./voting/conviction.js";

// Multi-Jurisdiction Compliance
export {
  JurisdictionCode,
  JurisdictionValidator,
  STATUTORY_RULESETS
} from "./compliance/jurisdictions.js";

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

// Authentication, LDAP, OIDC & KMS
export { LDAPAuthProvider, signUserToken, verifyUserToken, MOCK_LDAP_USERS } from "./auth/ldap.js";
export {
  createBallotChallenge,
  createWebAuthnCredential,
  signBallotWebAuthn,
  verifyWebAuthnAssertion,
  verifyBallotSignature
} from "./auth/webauthn.js";
export { WebAuthnPrfEngine } from "./auth/webauthn-prf.js";
export {
  verifyOidcToken,
  decodeJwt,
  createMockOidcToken,
  mapOidcClaimsToRoles,
  OIDCAuthProvider
} from "./auth/oidc.js";
export {
  KmsProvider,
  KmsProviderType,
  KmsAlgorithm,
  MockKmsProvider,
  kmsSignBallot,
  verifyKmsBallotSignature
} from "./auth/kms.js";

// Storage
export { LegitBlockStore } from "./storage/store.js";
export { StorageAdapter } from "./storage/adapter.js";
export { MemoryStorageAdapter } from "./storage/memoryAdapter.js";
export { FileStorageAdapter } from "./storage/fileAdapter.js";
export { IndexedDBStorageAdapter } from "./storage/indexedDbAdapter.js";

// Developer Tooling & Git Pre-Commit Hooks
export { GitNotarizer } from "./cli/gitHook.js";
