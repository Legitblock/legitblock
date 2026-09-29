import { DefaultVotingRules, VotingRuleType, evaluateVotingRule } from "./votingRules.js";
import { verifyBallotSignature } from "../auth/webauthn.js";

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
  QUEUED: "QUEUED",
  VETOED: "VETOED",
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
    executedBlockIndex = null,
    timelockDelaySeconds = 0,
    queuedAt = null,
    unlockAt = null,
    vetoRecord = null
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
    this.timelockDelaySeconds = timelockDelaySeconds;
    this.queuedAt = queuedAt;
    this.unlockAt = unlockAt;
    this.vetoRecord = vetoRecord;
    this.tally = tally || this.calculateTally(1);
  }

  queueForExecution(delaySeconds = null) {
    const delay = delaySeconds !== null ? delaySeconds : (this.timelockDelaySeconds || 0);
    this.status = ProposalStatus.QUEUED;
    const now = Date.now();
    this.queuedAt = new Date(now).toISOString();
    this.unlockAt = new Date(now + delay * 1000).toISOString();
    return this;
  }

  isReadyForExecution(currentTime = Date.now()) {
    if (this.status === ProposalStatus.PASSED) {
      return (this.timelockDelaySeconds || 0) === 0;
    }
    if (this.status === ProposalStatus.QUEUED) {
      if (!this.unlockAt) return true;
      return currentTime >= new Date(this.unlockAt).getTime();
    }
    return false;
  }

  veto({ complianceOfficerId, role = "Compliance Officer", reason, signature = null }) {
    if (this.status === ProposalStatus.EXECUTED) {
      throw new Error("Cannot veto a proposal that has already been executed on the blockchain");
    }
    this.status = ProposalStatus.VETOED;
    this.vetoRecord = {
      vetoedBy: complianceOfficerId,
      role,
      reason,
      timestamp: new Date().toISOString(),
      signature
    };
    return this.vetoRecord;
  }

  castVote({ voterId, voterName, decision, signature = null }) {
    if (this.status === ProposalStatus.EXECUTED || this.status === ProposalStatus.CANCELLED) {
      throw new Error("Cannot vote on proposal with status: " + this.status);
    }
    if (this.expiresAt && new Date() > new Date(this.expiresAt)) {
      throw new Error("Voting window for proposal " + this.id + " has expired");
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

  /**
   * Verify the cryptographic signature on a cast ballot
   * Supports both Ed25519 signatures and WebAuthn ES256 biometric passkey assertions
   * @param {string} voterId
   * @param {string} publicKeyPem
   * @returns {{ valid: boolean, type: string, biometric?: boolean, reason?: string }}
   */
  verifyVoteSignature(voterId, publicKeyPem) {
    const vote = this.votes[voterId];
    if (!vote) {
      return { valid: false, type: "none", reason: "No vote found for voter: " + voterId };
    }
    if (!vote.signature) {
      return { valid: false, type: "none", reason: "Vote cast without cryptographic signature" };
    }
    return verifyBallotSignature({
      proposalId: this.id,
      voterId,
      decision: vote.decision,
      signature: vote.signature,
      publicKeyPem
    });
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
    if (
      this.status === ProposalStatus.EXECUTED ||
      this.status === ProposalStatus.CANCELLED ||
      this.status === ProposalStatus.QUEUED ||
      this.status === ProposalStatus.VETOED
    ) {
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
      executedBlockIndex: this.executedBlockIndex,
      timelockDelaySeconds: this.timelockDelaySeconds,
      queuedAt: this.queuedAt,
      unlockAt: this.unlockAt,
      vetoRecord: this.vetoRecord
    };
  }

  static fromJSON(json) {
    return new Proposal(json);
  }
}
