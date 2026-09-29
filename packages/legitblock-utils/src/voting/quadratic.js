import { sha256, stringifyCanonical } from "../blockchain/crypto.js";

/**
 * Quadratic Voting (QV) Engine for LegitBlock Organizations.
 * Implements non-linear preference aggregation: Vote Power = sqrt(Voice Credits).
 * Ideal for cooperative resource allocations, multi-candidate elections, and budget prioritizations.
 */

export class QuadraticVotingSession {
  /**
   * @param {object} params
   * @param {string} params.proposalId
   * @param {string} params.title
   * @param {number} [params.defaultCreditBudget=100]
   * @param {Array<string>} [params.options=[]]
   */
  constructor({
    proposalId,
    title,
    defaultCreditBudget = 100,
    options = ["APPROVE", "REJECT"]
  }) {
    this.proposalId = proposalId || "qv-" + Date.now();
    this.title = title;
    this.defaultCreditBudget = defaultCreditBudget;
    this.options = options;
    this.creditBudgets = new Map();
    this.ballots = new Map();
  }

  /**
   * Allocate specific voice credits to a voter
   * @param {string} voterId
   * @param {number} credits
   */
  allocateCredits(voterId, credits) {
    this.creditBudgets.set(voterId, credits);
  }

  /**
   * Get eligible voice credit budget for voter
   * @param {string} voterId
   * @returns {number}
   */
  getVoterBudget(voterId) {
    return this.creditBudgets.get(voterId) ?? this.defaultCreditBudget;
  }

  /**
   * Cast a quadratic ballot with credit allocations across options
   * @param {object} params
   * @param {string} params.voterId
   * @param {Object.<string, number>} params.allocations - e.g. { "APPROVE": 64, "REJECT": 0 }
   * @param {string|object} [params.signature=null]
   * @returns {object} Confirmed ballot receipt
   */
  castBallot({ voterId, allocations, signature = null }) {
    const budget = this.getVoterBudget(voterId);

    let totalCreditsSpent = 0;
    const computedVotes = {};

    for (const [option, credits] of Object.entries(allocations)) {
      if (!this.options.includes(option)) {
        throw new Error(`Invalid option in ballot allocation: ${option}`);
      }
      if (typeof credits !== "number" || credits < 0) {
        throw new Error(`Allocated credits must be non-negative numbers: ${credits}`);
      }
      totalCreditsSpent += credits;
      // Vote weight = sqrt(credits)
      computedVotes[option] = Math.sqrt(credits);
    }

    if (totalCreditsSpent > budget) {
      throw new Error(`Voice credit budget exceeded: spent ${totalCreditsSpent} of ${budget} available credits`);
    }

    const ballot = {
      voterId,
      allocations,
      computedVotes,
      totalCreditsSpent,
      remainingCredits: budget - totalCreditsSpent,
      signature,
      timestamp: new Date().toISOString()
    };

    this.ballots.set(voterId, ballot);
    return ballot;
  }

  /**
   * Compute the aggregate quadratic tally across all voters
   * @returns {object} Final tally summary
   */
  calculateTally() {
    const totalVotesPerOption = {};
    const totalCreditsPerOption = {};

    for (const opt of this.options) {
      totalVotesPerOption[opt] = 0;
      totalCreditsPerOption[opt] = 0;
    }

    for (const ballot of this.ballots.values()) {
      for (const [opt, votes] of Object.entries(ballot.computedVotes)) {
        totalVotesPerOption[opt] = (totalVotesPerOption[opt] || 0) + votes;
      }
      for (const [opt, credits] of Object.entries(ballot.allocations)) {
        totalCreditsPerOption[opt] = (totalCreditsPerOption[opt] || 0) + credits;
      }
    }

    // Determine ranking
    const ranking = Object.entries(totalVotesPerOption)
      .map(([option, votes]) => ({
        option,
        votes: Number(votes.toFixed(4)),
        creditsSpent: totalCreditsPerOption[option]
      }))
      .sort((a, b) => b.votes - a.votes);

    // Calculate Gini dispersion index of voice credits spent
    const allCredits = Array.from(this.ballots.values()).map(b => b.totalCreditsSpent);
    const gini = calculateGiniCoefficient(allCredits);

    const tallySeal = sha256(stringifyCanonical({
      proposalId: this.proposalId,
      ballotCount: this.ballots.size,
      ranking
    }));

    return {
      proposalId: this.proposalId,
      totalBallots: this.ballots.size,
      ranking,
      winner: ranking[0] || null,
      giniCoefficient: gini,
      tallySeal,
      calculatedAt: new Date().toISOString()
    };
  }

  toJSON() {
    return {
      proposalId: this.proposalId,
      title: this.title,
      defaultCreditBudget: this.defaultCreditBudget,
      options: this.options,
      creditBudgets: Object.fromEntries(this.creditBudgets),
      ballots: Object.fromEntries(this.ballots)
    };
  }
}

/**
 * Compute Gini coefficient of an array of numbers to measure inequality of power
 */
function calculateGiniCoefficient(values) {
  if (values.length <= 1) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  let totalSum = 0;
  let rankSum = 0;

  for (let i = 0; i < n; i++) {
    totalSum += sorted[i];
    rankSum += (i + 1) * sorted[i];
  }

  if (totalSum === 0) return 0;
  return Number(((2 * rankSum) / (n * totalSum) - (n + 1) / n).toFixed(4));
}
