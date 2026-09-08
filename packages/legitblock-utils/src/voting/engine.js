import { Proposal, ProposalStatus, ProposalType } from "./proposal.js";
import { DefaultVotingRules, VotingRuleType } from "./votingRules.js";

/**
 * VotingEngine orchestrates proposals, vote casting, tallying,
 * and automatic blockchain recording upon ratified execution.
 */
export class VotingEngine {
  /**
   * @param {object} [options={}]
   * @param {Proposal[]} [options.proposals=[]]
   */
  constructor({ proposals = [] } = {}) {
    this.proposals = new Map();
    for (const p of proposals) {
      const prop = p instanceof Proposal ? p : Proposal.fromJSON(p);
      this.proposals.set(prop.id, prop);
    }
  }

  /**
   * Create a new proposal
   * @param {object} params
   * @returns {Proposal}
   */
  createProposal(params) {
    const proposal = new Proposal(params);
    this.proposals.set(proposal.id, proposal);
    return proposal;
  }

  /**
   * Get proposal by ID
   * @param {string} proposalId
   * @returns {Proposal|null}
   */
  getProposal(proposalId) {
    return this.proposals.get(proposalId) || null;
  }

  /**
   * List all proposals
   * @param {object} [filter={}]
   * @returns {Proposal[]}
   */
  listProposals(filter = {}) {
    let list = Array.from(this.proposals.values());
    if (filter.status) {
      list = list.filter(p => p.status === filter.status);
    }
    if (filter.type) {
      list = list.filter(p => p.type === filter.type);
    }
    if (filter.targetDocumentId) {
      list = list.filter(p => p.targetDocumentId === filter.targetDocumentId);
    }
    // Return latest first
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Cast a vote on a proposal
   * @param {object} params
   * @param {string} params.proposalId
   * @param {string} params.voterId
   * @param {string} [params.voterName]
   * @param {"APPROVE"|"REJECT"|"ABSTAIN"} params.decision
   * @param {string} [params.signature]
   * @param {number} [params.totalEligibleMembers=1]
   * @returns {Proposal}
   */
  castVote({ proposalId, voterId, voterName, decision, signature = null, totalEligibleMembers = 1 }) {
    const proposal = this.getProposal(proposalId);
    if (!proposal) {
      throw new Error("Proposal not found: " + proposalId);
    }

    proposal.castVote({ voterId, voterName, decision, signature });
    proposal.updateStatus(totalEligibleMembers);
    return proposal;
  }

  /**
   * Execute an approved proposal and commit its ratified changes to the Blockchain!
   * @param {string} proposalId
   * @param {import("../blockchain/blockchain.js").Blockchain} blockchain
   * @param {string} [validator="system"]
   * @returns {{ proposal: Proposal, block: import("../blockchain/block.js").Block }}
   */
  executeProposal(proposalId, blockchain, validator = "system") {
    const proposal = this.getProposal(proposalId);
    if (!proposal) {
      throw new Error("Proposal not found: " + proposalId);
    }

    const members = blockchain.getMembers();
    proposal.updateStatus(members.length);

    if (proposal.status !== ProposalStatus.PASSED && proposal.status !== ProposalStatus.ACTIVE) {
      throw new Error("Cannot execute proposal with status: " + proposal.status + ". Must be PASSED or meeting threshold.");
    }

    // Force final tally check
    const tally = proposal.calculateTally(members.length);
    if (!tally.passed) {
      throw new Error("Proposal does not meet passing criteria: " + tally.reason);
    }

    let resultingBlock;

    if (proposal.type === ProposalType.INITIAL_DOCUMENT || proposal.type === ProposalType.NEW_DOCUMENT) {
      const doc = {
        id: proposal.targetDocumentId || "doc-" + Date.now(),
        title: proposal.targetDocumentTitle || proposal.title,
        category: proposal.documentData?.category || "governance",
        version: proposal.documentData?.proposedVersion || "1.0",
        content: proposal.documentData?.content || "",
        effectiveDate: new Date().toISOString()
      };
      resultingBlock = blockchain.recordDocumentInsert({
        document: doc,
        proposalId: proposal.id,
        validator,
        notes: "Ratified through Proposal " + proposal.id + " (" + proposal.title + ")"
      });
    } else if (proposal.type === ProposalType.AMENDMENT) {
      resultingBlock = blockchain.recordDocumentAmendment({
        documentId: proposal.targetDocumentId,
        title: proposal.targetDocumentTitle || proposal.title,
        newContent: proposal.documentData?.content,
        newVersion: proposal.documentData?.proposedVersion || "1.1",
        diff: proposal.documentData?.diff || "",
        proposalId: proposal.id,
        validator,
        notes: "Ratified amendment via Proposal " + proposal.id
      });
    } else if (proposal.type === ProposalType.MEMBER_ACTION) {
      resultingBlock = blockchain.recordMemberUpdate(
        proposal.documentData?.member,
        proposal.documentData?.action || "ADD",
        validator
      );
    } else {
      resultingBlock = blockchain.recordVoteExecution(proposal, validator);
    }

    // Also record vote tally block if the action was a document block
    if (proposal.type !== ProposalType.GOVERNANCE_RULE_CHANGE) {
      blockchain.recordVoteExecution(proposal, validator);
    }

    proposal.status = ProposalStatus.EXECUTED;
    proposal.executedBlockIndex = resultingBlock.index;

    return { proposal, block: resultingBlock };
  }

  toJSON() {
    return Array.from(this.proposals.values()).map(p => p.toJSON());
  }

  static fromJSON(json) {
    const engine = new VotingEngine();
    for (const item of json) {
      const p = Proposal.fromJSON(item);
      engine.proposals.set(p.id, p);
    }
    return engine;
  }
}
