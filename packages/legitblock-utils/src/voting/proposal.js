import { DefaultVotingRules, VotingRuleType, evaluateVotingRule } from "./votingRules.js";

export const ProposalType = {
  INITIAL_DOCUMENT: "INITIAL_DOCUMENT",
  NEW_DOCUMENT: "NEW_DOCUMENT",
  AMENDMENT: "AMENDMENT",
  REMOVE_DOCUMENT: "REMOVE_DOCUMENT",
  MEMBER_ACTION: "MEMBER_ACTION",
  GOVERNANCE_RULE_CHANGE: "GOVERNANCE_RULE_CHANGE"
};

export const ProposalStatus = {
  ACTIVE: "ACTIVE",
  PASSED: "PASSED",
  REJECTED: "REJECTED",
  EXECUTED: "EXECUTED",
  CANCELLED: "CANCELLED"
};

export const VoteDecision = {
  APPROVE: "APPROVE",
  REJECT: "REJECT",
  ABSTAIN: "ABSTAIN"
};

export class Proposal {
  constructor({
    id,
    type = ProposalType.AMENDMENT,
    title,
    description = "",
    proposer = { id: "system", name: "System" },
    targetDocumentId = null,
    targetDocumentTitle = null,
    documentData = {},
    votingRule = DefaultVotingRules[VotingRuleType.SIMPLE_MAJORITY],
    votes = {},
    status = ProposalStatus.ACTIVE,
    tally = null,
    createdAt = null,
    expiresAt = null,
    executedBlockIndex = null
  }) {
    this.id = id || "prop-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
    this.type = type;
    this.title = title;
    this.description = description;
    this.proposer = proposer;
    this.targetDocumentId = targetDocumentId;
    this.targetDocumentTitle = targetDocumentTitle;
    this.documentData = documentData;
    this.votingRule = votingRule;
    this.votes = votes;
    this.status = status;
    this.createdAt = createdAt || new Date().toISOString();
    this.expiresAt = expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    this.executedBlockIndex = executedBlockIndex;
    this.tally = tally || this.calculateTally(1);
  }

  castVote({ voterId, voterName, decision, signature = null }) {
    if (this.status === ProposalStatus.EXECUTED || this.status === ProposalStatus.CANCELLED) {
      throw new Error("Cannot vote on proposal with status: " + this.status);
    }
    if (!Object.values(VoteDecision).includes(decision)) {
      throw new Error("Invalid vote decision: " + decision + ". Must be APPROVE, REJECT, or ABSTAIN");
    }

    this.votes[voterId] = {
      voterId,
      voterName: voterName || voterId,
      decision,
      timestamp: new Date().toISOString(),
      signature
    };
  }

  calculateTally(totalEligibleMembers = 1) {
    let approve = 0;
    let reject = 0;
    let abstain = 0;

    for (const v of Object.values(this.votes)) {
      if (v.decision === VoteDecision.APPROVE) approve++;
      else if (v.decision === VoteDecision.REJECT) reject++;
      else if (v.decision === VoteDecision.ABSTAIN) abstain++;
    }

    const totalCast = approve + reject + abstain;
    const evaluation = evaluateVotingRule(
      { totalEligible: totalEligibleMembers, totalCast, approve, reject, abstain },
      this.votingRule
    );

    this.tally = {
      totalEligible: totalEligibleMembers,
      total: totalCast,
      approve,
      reject,
      abstain,
      quorumMet: evaluation.quorumMet,
      thresholdMet: evaluation.thresholdMet,
      passed: evaluation.passed,
      reason: evaluation.reason
    };

    return this.tally;
  }

  updateStatus(totalEligibleMembers = 1) {
    if (this.status === ProposalStatus.EXECUTED || this.status === ProposalStatus.CANCELLED) {
      return this.status;
    }

    const tally = this.calculateTally(totalEligibleMembers);
    if (tally.passed) {
      this.status = ProposalStatus.PASSED;
    } else if (tally.total >= totalEligibleMembers && !tally.passed) {
      this.status = ProposalStatus.REJECTED;
    } else {
      this.status = ProposalStatus.ACTIVE;
    }
    return this.status;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      description: this.description,
      proposer: this.proposer,
      targetDocumentId: this.targetDocumentId,
      targetDocumentTitle: this.targetDocumentTitle,
      documentData: this.documentData,
      votingRule: this.votingRule,
      votes: this.votes,
      status: this.status,
      tally: this.tally,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      executedBlockIndex: this.executedBlockIndex
    };
  }

  static fromJSON(json) {
    return new Proposal(json);
  }
}
