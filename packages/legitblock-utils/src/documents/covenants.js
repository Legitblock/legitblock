import { sha256, stringifyCanonical } from "../blockchain/crypto.js";
import { ZkRangeProofEngine } from "../crypto/zk.js";

/**
 * Smart Legal Covenants & Constitutional Rule Assertions for LegitBlock.
 * Enforces programmatic constitutional guardrails on proposals, amendments, and corporate actions.
 */

export const CovenantType = {
  BUDGET_CEILING: "BUDGET_CEILING",
  SUPERMAJORITY_REQUIRED: "SUPERMAJORITY_REQUIRED",
  MIN_REVIEW_HOURS: "MIN_REVIEW_HOURS",
  MANDATORY_ROLE_APPROVAL: "MANDATORY_ROLE_APPROVAL",
  ZERO_KNOWLEDGE_RANGE: "ZERO_KNOWLEDGE_RANGE",
  CUSTOM_PREDICATE: "CUSTOM_PREDICATE"
};

export class Covenant {
  /**
   * @param {object} params
   * @param {string} [params.id]
   * @param {string} params.type - One of CovenantType
   * @param {string} params.title
   * @param {string} [params.description]
   * @param {string} [params.targetDocumentId] - Optional document constraint target
   * @param {object} [params.parameters={}] - Type-specific thresholds/parameters
   * @param {Function} [params.predicate] - Optional custom boolean predicate
   * @param {boolean} [params.active=true]
   */
  constructor({
    id,
    type = CovenantType.CUSTOM_PREDICATE,
    title,
    description = "",
    targetDocumentId = null,
    parameters = {},
    predicate = null,
    active = true
  }) {
    this.id = id || "cov-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
    this.type = type;
    this.title = title;
    this.description = description;
    this.targetDocumentId = targetDocumentId;
    this.parameters = parameters;
    this.predicate = predicate;
    this.active = active;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      description: this.description,
      targetDocumentId: this.targetDocumentId,
      parameters: this.parameters,
      active: this.active
    };
  }

  static fromJSON(json) {
    return new Covenant(json);
  }
}

export class CovenantEngine {
  constructor({ covenants = [] } = {}) {
    this.covenants = new Map();
    for (const c of covenants) {
      const cov = c instanceof Covenant ? c : Covenant.fromJSON(c);
      this.covenants.set(cov.id, cov);
    }
  }

  /**
   * Register a new covenant
   * @param {Covenant|object} covenant
   * @returns {Covenant}
   */
  registerCovenant(covenant) {
    const cov = covenant instanceof Covenant ? covenant : new Covenant(covenant);
    this.covenants.set(cov.id, cov);
    return cov;
  }

  /**
   * Remove covenant by ID
   * @param {string} covenantId
   * @returns {boolean}
   */
  removeCovenant(covenantId) {
    return this.covenants.delete(covenantId);
  }

  /**
   * List covenants with optional filter
   * @param {object} [filter={}]
   * @returns {Covenant[]}
   */
  listCovenants({ activeOnly = true, targetDocumentId = null } = {}) {
    let list = Array.from(this.covenants.values());
    if (activeOnly) {
      list = list.filter(c => c.active);
    }
    if (targetDocumentId) {
      list = list.filter(c => !c.targetDocumentId || c.targetDocumentId === targetDocumentId);
    }
    return list;
  }

  /**
   * Evaluate a proposal against all active covenants
   * @param {import("../voting/proposal.js").Proposal} proposal
   * @param {import("../blockchain/blockchain.js").Blockchain} [blockchain]
   * @returns {{ passed: boolean, violations: Array<object>, receipts: Array<object>, complianceSeal: string }}
   */
  evaluateProposal(proposal, blockchain = null) {
    const activeCovenants = this.listCovenants({ activeOnly: true });
    const receipts = [];
    const violations = [];

    const now = Date.now();

    for (const cov of activeCovenants) {
      // Check target document scope: if covenant targets a document, skip if proposal does not target it
      if (cov.targetDocumentId) {
        if (!proposal.targetDocumentId || cov.targetDocumentId !== proposal.targetDocumentId) {
          continue;
        }
      }

      let satisfied = true;
      let reason = "Covenant condition fully satisfied";

      switch (cov.type) {
        case CovenantType.BUDGET_CEILING: {
          const maxAmount = cov.parameters.maxAmount;
          const proposedAmount = proposal.documentData?.spendingAmount ?? proposal.documentData?.budgetAmount;
          if (typeof proposedAmount === "number" && typeof maxAmount === "number") {
            if (proposedAmount > maxAmount) {
              satisfied = false;
              reason = `Proposed expenditure ($${proposedAmount.toLocaleString()}) exceeds budget ceiling of $${maxAmount.toLocaleString()}`;
            }
          }
          break;
        }

        case CovenantType.SUPERMAJORITY_REQUIRED: {
          const minThreshold = cov.parameters.minThresholdPercentage || 66.67;
          const propThreshold = proposal.votingRule?.passingThresholdPercentage || proposal.votingRule?.thresholdPercentage || 50;
          if (propThreshold < minThreshold) {
            satisfied = false;
            reason = `Proposal voting threshold (${propThreshold}%) is below mandatory constitutional supermajority (${minThreshold}%)`;
          }
          break;
        }

        case CovenantType.MIN_REVIEW_HOURS: {
          const minHours = cov.parameters.minHours || 24;
          const createdTime = new Date(proposal.createdAt).getTime();
          const elapsedHours = (now - createdTime) / (1000 * 60 * 60);
          if (elapsedHours < minHours) {
            satisfied = false;
            reason = `Mandatory constitutional review period not met: ${elapsedHours.toFixed(1)}h elapsed of ${minHours}h required`;
          }
          break;
        }

        case CovenantType.MANDATORY_ROLE_APPROVAL: {
          const requiredRole = cov.parameters.requiredRole;
          if (requiredRole && blockchain) {
            const members = blockchain.getMembers();
            const roleMemberIds = members.filter(m => m.role === requiredRole).map(m => m.id);
            const approvedByRole = Object.values(proposal.votes || {}).some(
              v => roleMemberIds.includes(v.voterId) && v.decision === "APPROVE"
            );
            if (!approvedByRole) {
              satisfied = false;
              reason = `Mandatory affirmative vote required from member holding role: ${requiredRole}`;
            }
          }
          break;
        }

        case CovenantType.ZERO_KNOWLEDGE_RANGE: {
          const metricName = cov.parameters.metricName || "financialMetric";
          const requiredMin = cov.parameters.min !== undefined ? cov.parameters.min : null;
          const requiredMax = cov.parameters.max !== undefined ? cov.parameters.max : null;
          const expectedCommitment = cov.parameters.commitment || null;

          const zkPayload = proposal.documentData?.zkProofs?.[metricName] ||
                            proposal.documentData?.zkCovenantProof ||
                            proposal.zkProof;

          if (!zkPayload || !zkPayload.proof) {
            satisfied = false;
            reason = `Missing required Zero-Knowledge range proof for covenant: ${cov.title} (${metricName})`;
          } else {
            const verification = ZkRangeProofEngine.verifyRangeProof(zkPayload.proof, {
              min: requiredMin,
              max: requiredMax,
              commitment: expectedCommitment || zkPayload.commitment
            });

            if (!verification.valid) {
              satisfied = false;
              reason = `Zero-Knowledge proof rejected: ${verification.reason}`;
            } else {
              satisfied = true;
              reason = `Zero-Knowledge proof cryptographically verified: ${metricName} satisfies threshold without revealing confidential value (Commitment: ${zkPayload.proof.commitment.substring(0, 16)}...)`;
            }
          }
          break;
        }

        case CovenantType.CUSTOM_PREDICATE: {
          if (typeof cov.predicate === "function") {
            try {
              satisfied = Boolean(cov.predicate(proposal, blockchain));
              if (!satisfied) {
                reason = cov.parameters.customFailureMessage || "Custom legal predicate evaluated to false";
              }
            } catch (err) {
              satisfied = false;
              reason = `Predicate evaluation error: ${err.message}`;
            }
          }
          break;
        }

        default:
          break;
      }

      const receipt = {
        covenantId: cov.id,
        title: cov.title,
        type: cov.type,
        satisfied,
        reason,
        evaluatedAt: new Date(now).toISOString()
      };

      receipts.push(receipt);

      if (!satisfied) {
        violations.push({
          covenantId: cov.id,
          title: cov.title,
          type: cov.type,
          reason
        });
      }
    }

    const passed = violations.length === 0;
    const complianceSeal = sha256(stringifyCanonical({
      proposalId: proposal.id,
      passed,
      violationsCount: violations.length,
      receiptsSummary: receipts.map(r => ({ id: r.covenantId, satisfied: r.satisfied }))
    }));

    return {
      passed,
      violations,
      receipts,
      complianceSeal
    };
  }

  toJSON() {
    return Array.from(this.covenants.values()).map(c => c.toJSON());
  }

  static fromJSON(json) {
    const engine = new CovenantEngine();
    for (const item of json) {
      engine.registerCovenant(Covenant.fromJSON(item));
    }
    return engine;
  }
}
