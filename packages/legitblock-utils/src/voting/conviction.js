import { sha256, stringifyCanonical } from "../blockchain/crypto.js";

/**
 * Continuous Conviction Voting Engine for LegitBlock Organizations.
 * Implements token-weighted conviction accumulation over time:
 *   y_t = alpha * y_{t-1} + x_t
 * Where:
 *   alpha: Decay half-life parameter in [0, 1)
 *   x_t: Staked voting weight
 *   y_t: Accumulated conviction
 *
 * Proposals pass automatically when accumulated conviction exceeds a dynamic threshold:
 *   Threshold = (beta * totalPool) / (1 - requestedAmount / totalPool)^2
 */

export class ConvictionProposal {
  constructor({
    id,
    title,
    requestedAmount = 0,
    beneficiary = null,
    totalPool = 1000000,
    decayAlpha = 0.9,
    beta = 0.2
  }) {
    this.id = id || "conv-prop-" + Date.now();
    this.title = title;
    this.requestedAmount = requestedAmount;
    this.beneficiary = beneficiary;
    this.totalPool = totalPool;
    this.decayAlpha = decayAlpha;
    this.beta = beta;

    this.currentConviction = 0;
    this.stakedWeights = new Map(); // voterId -> weight
    this.lastUpdatedStep = 0;
    this.status = "ACTIVE"; // ACTIVE, TRIGGERED, CANCELLED
    this.triggeredAt = null;
  }

  /**
   * Calculate dynamic passing threshold based on requested treasury funds
   * @returns {number}
   */
  calculateThreshold() {
    if (this.totalPool <= 0) return Infinity;
    const share = this.requestedAmount / this.totalPool;
    if (share >= 1) return Infinity; // Cannot request 100% or more of treasury
    const denominator = (1 - share) ** 2;
    return (this.beta * this.totalPool) / denominator;
  }

  /**
   * Stake or change voter weight on proposal
   * @param {string} voterId
   * @param {number} weight
   */
  stake(voterId, weight) {
    if (this.status !== "ACTIVE") {
      throw new Error(`Cannot stake on proposal with status: ${this.status}`);
    }
    if (weight <= 0) {
      this.stakedWeights.delete(voterId);
    } else {
      this.stakedWeights.set(voterId, weight);
    }
  }

  /**
   * Total actively staked weight currently supporting proposal
   * @returns {number}
   */
  getTotalStakedWeight() {
    let sum = 0;
    for (const w of this.stakedWeights.values()) {
      sum += w;
    }
    return sum;
  }

  /**
   * Step the continuous conviction calculation forward by 1 time step
   * y_t = alpha * y_{t-1} + x_t
   * @returns {{ conviction: number, threshold: number, triggered: boolean }}
   */
  step() {
    if (this.status !== "ACTIVE") {
      return {
        conviction: this.currentConviction,
        threshold: this.calculateThreshold(),
        triggered: this.status === "TRIGGERED"
      };
    }

    const currentStaked = this.getTotalStakedWeight();
    this.currentConviction = this.decayAlpha * this.currentConviction + currentStaked;
    this.lastUpdatedStep += 1;

    const threshold = this.calculateThreshold();
    const triggered = this.currentConviction >= threshold;

    if (triggered) {
      this.status = "TRIGGERED";
      this.triggeredAt = new Date().toISOString();
    }

    return {
      conviction: Number(this.currentConviction.toFixed(4)),
      threshold: Number(threshold.toFixed(4)),
      triggered
    };
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      requestedAmount: this.requestedAmount,
      totalPool: this.totalPool,
      currentConviction: Number(this.currentConviction.toFixed(4)),
      threshold: Number(this.calculateThreshold().toFixed(4)),
      stakedWeights: Object.fromEntries(this.stakedWeights),
      status: this.status,
      triggeredAt: this.triggeredAt
    };
  }
}

export class ConvictionVotingEngine {
  constructor({ totalPool = 1000000, defaultAlpha = 0.9, defaultBeta = 0.2 } = {}) {
    this.totalPool = totalPool;
    this.defaultAlpha = defaultAlpha;
    this.defaultBeta = defaultBeta;
    this.proposals = new Map();
  }

  createProposal(params) {
    const prop = new ConvictionProposal({
      totalPool: this.totalPool,
      decayAlpha: this.defaultAlpha,
      beta: this.defaultBeta,
      ...params
    });
    this.proposals.set(prop.id, prop);
    return prop;
  }

  getProposal(id) {
    return this.proposals.get(id) || null;
  }

  stepAll() {
    const results = {};
    for (const [id, prop] of this.proposals.entries()) {
      results[id] = prop.step();
    }
    return results;
  }
}
