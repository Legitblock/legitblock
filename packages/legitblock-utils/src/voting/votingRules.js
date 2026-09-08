/**
 * Predefined voting rules supported by LegitBlock
 */
export const VotingRuleType = {
  SIMPLE_MAJORITY: "SIMPLE_MAJORITY",
  TWO_THIRDS_SUPERMAJORITY: "TWO_THIRDS_SUPERMAJORITY",
  THREE_QUARTERS_SUPERMAJORITY: "THREE_QUARTERS_SUPERMAJORITY",
  UNANIMOUS: "UNANIMOUS",
  CONSENSUS: "CONSENSUS"
};

export const DefaultVotingRules = {
  [VotingRuleType.SIMPLE_MAJORITY]: {
    type: VotingRuleType.SIMPLE_MAJORITY,
    name: "Simple Majority (>50%)",
    quorumPercentage: 50,
    passingThresholdPercentage: 50.01,
    description: "Requires more than 50% of cast non-abstaining votes to approve, with at least 50% member quorum."
  },
  [VotingRuleType.TWO_THIRDS_SUPERMAJORITY]: {
    type: VotingRuleType.TWO_THIRDS_SUPERMAJORITY,
    name: "Two-Thirds Supermajority (66.7%)",
    quorumPercentage: 50,
    passingThresholdPercentage: 66.67,
    description: "Requires at least 2/3 of cast non-abstaining votes to approve, typically for Bylaw amendments."
  },
  [VotingRuleType.THREE_QUARTERS_SUPERMAJORITY]: {
    type: VotingRuleType.THREE_QUARTERS_SUPERMAJORITY,
    name: "Three-Quarters Supermajority (75%)",
    quorumPercentage: 66.67,
    passingThresholdPercentage: 75,
    description: "Requires 75% approval, used for fundamental corporate transactions or dissolution."
  },
  [VotingRuleType.UNANIMOUS]: {
    type: VotingRuleType.UNANIMOUS,
    name: "Unanimous Consent (100%)",
    quorumPercentage: 100,
    passingThresholdPercentage: 100,
    description: "Requires 100% participation and 100% approval from all voting members."
  },
  [VotingRuleType.CONSENSUS]: {
    type: VotingRuleType.CONSENSUS,
    name: "Consensus (No Block/Veto)",
    quorumPercentage: 66.67,
    passingThresholdPercentage: 100,
    description: "Consensus-based decision making where a single rejection acts as a block."
  }
};

/**
 * Check if a vote tally passes the voting rule and quorum
 * @param {object} tally - { totalEligible, totalCast, approve, reject, abstain }
 * @param {object} rule - Voting rule object
 * @returns {{ passed: boolean, quorumMet: boolean, thresholdMet: boolean, reason: string }}
 */
export function evaluateVotingRule(tally, rule = DefaultVotingRules.SIMPLE_MAJORITY) {
  const { totalEligible = 1, totalCast = 0, approve = 0, reject = 0, abstain = 0 } = tally;
  const quorumPercentage = rule.quorumPercentage ?? 50;
  const passingThreshold = rule.passingThresholdPercentage ?? 50.01;

  // Quorum check (total participants who cast vote vs total eligible members)
  const participationRate = totalEligible > 0 ? (totalCast / totalEligible) * 100 : 0;
  const quorumMet = participationRate >= quorumPercentage;

  if (!quorumMet) {
    return {
      passed: false,
      quorumMet: false,
      thresholdMet: false,
      reason: `Quorum not met: ${participationRate.toFixed(1)}% participated, required ${quorumPercentage}%`
    };
  }

  // Passing threshold check (approvals vs non-abstaining votes)
  const decidingVotes = approve + reject;
  if (decidingVotes === 0) {
    return {
      passed: false,
      quorumMet: true,
      thresholdMet: false,
      reason: "No deciding votes cast (all abstained)"
    };
  }

  const approvalRate = (approve / decidingVotes) * 100;
  const thresholdMet = approvalRate >= passingThreshold;

  if (!thresholdMet) {
    return {
      passed: false,
      quorumMet: true,
      thresholdMet: false,
      reason: `Threshold not met: ${approvalRate.toFixed(1)}% approval, required ${passingThreshold}%`
    };
  }

  return {
    passed: true,
    quorumMet: true,
    thresholdMet: true,
    reason: `Proposal approved with ${approvalRate.toFixed(1)}% votes and ${participationRate.toFixed(1)}% quorum`
  };
}
