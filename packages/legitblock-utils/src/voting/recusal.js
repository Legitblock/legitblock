import { hashObject } from "../blockchain/crypto.js";

/**
 * Statutory Categories of Conflicts of Interest
 * Grounded in Delaware General Corporation Law (DGCL § 144) & IRS Form 990 Schedule L
 */
export const RecusalType = {
  RELATED_PARTY_TRANSACTION: "related_party_transaction", // Contract, lease, or vendor agreement with affiliate
  FINANCIAL_INTEREST: "financial_interest",               // Direct/indirect equity, debt, or commercial stake
  FAMILY_RELATIONSHIP: "family_relationship",             // Material interest held by immediate family member
  EXECUTIVE_COMPENSATION: "executive_compensation",       // Director evaluating personal salary, bonus, or grant
  ETHICAL_DISCRETIONARY: "ethical_discretionary"          // Voluntary recusal to prevent appearance of impropriety
};

/**
 * Formal Disclosure and Recusal Filing
 */
export class RecusalRecord {
  /**
   * @param {object} params
   * @param {string} params.memberId - ID or email of the recusing director/officer
   * @param {string} [params.memberName] - Full name of director
   * @param {string} params.proposalId - Target proposal ID
   * @param {string} params.recusalType - Type from RecusalType
   * @param {string} params.disclosureStatement - Factual disclosure of nature and extent of interest
   * @param {string} [params.timestamp] - ISO date string
   * @param {string} [params.signature] - Cryptographic signature of disclosure
   */
  constructor({
    memberId,
    memberName = "",
    proposalId,
    recusalType = RecusalType.RELATED_PARTY_TRANSACTION,
    disclosureStatement,
    timestamp = new Date().toISOString(),
    signature = ""
  }) {
    this.id = `recusal-${proposalId}-${memberId}`;
    this.memberId = memberId;
    this.memberName = memberName;
    this.proposalId = proposalId;
    this.recusalType = recusalType;
    this.disclosureStatement = disclosureStatement;
    this.timestamp = timestamp;
    this.signature = signature;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return hashObject({
      memberId: this.memberId,
      proposalId: this.proposalId,
      recusalType: this.recusalType,
      disclosureStatement: this.disclosureStatement,
      timestamp: this.timestamp
    });
  }

  toJSON() {
    return {
      id: this.id,
      memberId: this.memberId,
      memberName: this.memberName,
      proposalId: this.proposalId,
      recusalType: this.recusalType,
      disclosureStatement: this.disclosureStatement,
      timestamp: this.timestamp,
      signature: this.signature,
      hash: this.hash
    };
  }
}

/**
 * Recusal and Disinterested Quorum Evaluation Engine
 */
export class RecusalEngine {
  constructor() {
    this.recusals = new Map(); // proposalId -> Map(memberId -> RecusalRecord)
  }

  /**
   * Register a member recusal
   * @param {RecusalRecord} recusalRecord
   */
  registerRecusal(recusalRecord) {
    if (!this.recusals.has(recusalRecord.proposalId)) {
      this.recusals.set(recusalRecord.proposalId, new Map());
    }
    this.recusals.get(recusalRecord.proposalId).set(recusalRecord.memberId, recusalRecord);
    return recusalRecord;
  }

  /**
   * Check if a member is recused from a proposal
   * @param {string} proposalId
   * @param {string} memberId
   * @returns {boolean}
   */
  isMemberRecused(proposalId, memberId) {
    const proposalMap = this.recusals.get(proposalId);
    return proposalMap ? proposalMap.has(memberId) : false;
  }

  /**
   * Get all registered recusals for a proposal
   * @param {string} proposalId
   * @returns {RecusalRecord[]}
   */
  getRecusalsForProposal(proposalId) {
    const proposalMap = this.recusals.get(proposalId);
    return proposalMap ? Array.from(proposalMap.values()) : [];
  }

  /**
   * Calculate statutory disinterested quorum and vote tally under DGCL § 144
   * @param {object} params
   * @param {object} params.proposal - Proposal object with quorumThreshold, passThreshold
   * @param {Array<object>} params.activeMembers - Total active board or voting members [{ id, votingWeight }]
   * @param {Array<object>} params.votes - Array of votes cast [{ voterId, decision, weight }]
   * @returns {object} Disinterested quorum evaluation and statutory result
   */
  calculateDisinterestedQuorum({
    proposal,
    activeMembers = [],
    votes = []
  }) {
    const proposalId = proposal.id;
    const recusals = this.getRecusalsForProposal(proposalId);
    const recusedMemberIds = new Set(recusals.map(r => r.memberId));

    // 1. Filter out interested members
    const disinterestedMembers = activeMembers.filter(m => !recusedMemberIds.has(m.id));
    const disinterestedTotalWeight = disinterestedMembers.reduce((sum, m) => sum + (m.votingWeight || 1), 0);

    // 2. Validate that no recused member's vote is included
    const disqualifiedVotes = [];
    const validDisinterestedVotes = [];

    for (const v of votes) {
      if (recusedMemberIds.has(v.voterId)) {
        disqualifiedVotes.push({
          voterId: v.voterId,
          reason: "Vote disqualified: Member filed formal conflict-of-interest recusal"
        });
      } else {
        validDisinterestedVotes.push(v);
      }
    }

    // 3. Calculate disinterested quorum participation
    const disinterestedCastWeight = validDisinterestedVotes.reduce((sum, v) => sum + (v.weight || 1), 0);
    const quorumFraction = disinterestedTotalWeight > 0 ? disinterestedCastWeight / disinterestedTotalWeight : 0;
    const quorumRequired = proposal.quorumThreshold || 0.5; // default 50%
    const quorumMet = quorumFraction >= quorumRequired;

    // 4. Calculate affirmative disinterested votes
    let affirmativeWeight = 0;
    let negativeWeight = 0;
    let abstainWeight = 0;

    for (const v of validDisinterestedVotes) {
      const w = v.weight || 1;
      const dec = (v.decision || "").toUpperCase();
      if (dec === "YES" || dec === "APPROVE") {
        affirmativeWeight += w;
      } else if (dec === "NO" || dec === "REJECT") {
        negativeWeight += w;
      } else {
        abstainWeight += w;
      }
    }

    const passThreshold = proposal.passThreshold || 0.5; // default simple majority
    const totalVotesCounted = affirmativeWeight + negativeWeight;
    const approvalRatio = totalVotesCounted > 0 ? affirmativeWeight / totalVotesCounted : 0;
    const proposalPassed = quorumMet && approvalRatio > passThreshold;

    return {
      statute: "DGCL § 144 / IRS Form 990 Sched L",
      proposalId,
      disinterestedMembersCount: disinterestedMembers.length,
      disinterestedTotalWeight,
      disinterestedCastWeight,
      quorumRequired,
      quorumActual: quorumFraction,
      quorumMet,
      affirmativeWeight,
      negativeWeight,
      abstainWeight,
      approvalRatio,
      passThreshold,
      proposalPassed,
      recusalsCount: recusals.length,
      recusedMembers: recusals.map(r => ({ memberId: r.memberId, recusalType: r.recusalType })),
      disqualifiedVotes
    };
  }

  /**
   * Generate an immutable statutory compliance receipt
   * @param {object} params
   * @param {object} params.proposal
   * @param {Array<object>} params.activeMembers
   * @param {Array<object>} params.votes
   * @returns {object} Cryptographic receipt ready for blockchain block inclusion
   */
  generateComplianceReceipt({ proposal, activeMembers, votes }) {
    const result = this.calculateDisinterestedQuorum({ proposal, activeMembers, votes });
    const timestamp = new Date().toISOString();

    const receiptPayload = {
      standard: "LEGITBLOCK-DGCL-144-DISINTERESTED-QUORUM-v1",
      timestamp,
      result
    };

    return {
      ...receiptPayload,
      receiptHash: hashObject(receiptPayload)
    };
  }
}
