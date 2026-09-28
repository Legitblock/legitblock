/**
 * Multi-Jurisdictional Statutory Rulesets
 * Grounded in:
 * 1. Delaware General Corporation Law (DGCL Title 8)
 * 2. Wyoming Decentralized Unincorporated Nonprofit Association Act (W.S. 17-31, 2024)
 * 3. California Worker Cooperative Act (Cal. Corp. Code § 12200 / AB 816)
 * 4. UK Companies Act 2006 (SS 281-285, Resolutions)
 */

export const JurisdictionCode = {
  DELAWARE_CORP: "US-DE-CORP",
  WYOMING_DUNA_2024: "US-WY-DUNA-2024",
  CALIFORNIA_WORKER_COOP: "US-CA-COOP-AB816",
  UK_COMPANIES_ACT: "GB-UK-CA-2006"
};

/**
 * Statutory definition specifications
 */
export const STATUTORY_RULESETS = {
  [JurisdictionCode.DELAWARE_CORP]: {
    name: "Delaware General Corporation Law",
    statuteRef: "DGCL 8 Del. C. § 101 et seq.",
    defaultQuorum: 0.5,
    minimumQuorum: 0.3333, // DGCL § 216: By-laws may not reduce quorum below 1/3
    defaultPassThreshold: 0.5,
    allowsWeightedVoting: true,
    requiresEqualWorkerVote: false
  },
  [JurisdictionCode.WYOMING_DUNA_2024]: {
    name: "Wyoming Decentralized Unincorporated Nonprofit Association (DUNA)",
    statuteRef: "Wyo. Stat. § 17-31-101 et seq. (2024)",
    defaultQuorum: 0.5,
    minimumQuorum: 0.2,
    defaultPassThreshold: 0.5,
    allowsWeightedVoting: true,
    nonProfitAssetLockMandatory: true, // Cannot distribute profits to members
    prohibitedCharterActions: ["CONVERT_TO_FOR_PROFIT", "MEMBER_PROFIT_DIVIDEND"]
  },
  [JurisdictionCode.CALIFORNIA_WORKER_COOP]: {
    name: "California Worker Cooperative Corporation Act",
    statuteRef: "Cal. Corp. Code § 12200 et seq. (AB 816)",
    defaultQuorum: 0.5,
    minimumQuorum: 0.25,
    defaultPassThreshold: 0.5,
    allowsWeightedVoting: false, // MANDATORY: One member, one vote
    requiresEqualWorkerVote: true,
    indivisibleReserveMandate: true
  },
  [JurisdictionCode.UK_COMPANIES_ACT]: {
    name: "United Kingdom Companies Act 2006",
    statuteRef: "UK Companies Act 2006 (c. 46) ss. 281-285",
    defaultQuorum: 0.5,
    minimumQuorum: 0.2,
    defaultPassThreshold: 0.5, // Ordinary Resolution: > 50%
    specialResolutionThreshold: 0.75, // Special Resolution: >= 75%
    allowsWeightedVoting: true
  }
};

/**
 * Multi-Jurisdictional Legal Validator
 */
export class JurisdictionValidator {
  /**
   * Validate a proposal and voting configuration against statutory requirements
   * @param {object} params
   * @param {string} params.jurisdiction - Code from JurisdictionCode
   * @param {object} params.proposal - Proposal payload { quorumThreshold, passThreshold, type, title }
   * @param {Array<object>} [params.memberWeights] - Array of member voting weights [{ memberId, weight }]
   * @returns {{ valid: boolean, errors: string[], warnings: string[], jurisdiction: string }}
   */
  static validateProposal({
    jurisdiction = JurisdictionCode.DELAWARE_CORP,
    proposal,
    memberWeights = []
  }) {
    const rules = STATUTORY_RULESETS[jurisdiction];
    if (!rules) {
      return {
        valid: false,
        errors: [`Unrecognized statutory jurisdiction code: ${jurisdiction}`],
        warnings: [],
        jurisdiction
      };
    }

    const errors = [];
    const warnings = [];

    // 1. Quorum threshold checks
    const quorum = proposal.quorumThreshold !== undefined ? proposal.quorumThreshold : rules.defaultQuorum;
    if (rules.minimumQuorum && quorum < rules.minimumQuorum) {
      errors.push(
        `Statutory violation: Proposed quorum (${(quorum * 100).toFixed(1)}%) is below statutory minimum (${(rules.minimumQuorum * 100).toFixed(1)}%) for ${rules.name} (${rules.statuteRef})`
      );
    }

    // 2. California Worker Cooperative: Mandatory One Member One Vote
    if (rules.requiresEqualWorkerVote && memberWeights.length > 0) {
      const distinctWeights = new Set(memberWeights.map(m => m.weight));
      if (distinctWeights.size > 1) {
        errors.push(
          `Statutory violation: California Worker Co-op Act (AB 816) strictly mandates 'One Member, One Vote'. Unequal voting weights detected: [${Array.from(distinctWeights).join(", ")}]`
        );
      }
    }

    // 3. Wyoming DUNA Asset Lock & Non-Profit Restrictions
    if (rules.nonProfitAssetLockMandatory) {
      const actionType = (proposal.actionType || proposal.type || "").toUpperCase();
      const titleUpper = (proposal.title || "").toUpperCase();

      if (
        rules.prohibitedCharterActions.includes(actionType) ||
        titleUpper.includes("DIVIDEND") ||
        titleUpper.includes("EQUITY PAYOUT")
      ) {
        errors.push(
          `Statutory violation: Wyoming DUNA Act (W.S. § 17-31) strictly prohibits member profit distributions or for-profit conversion.`
        );
      }
    }

    // 4. UK Companies Act: Special Resolution Supermajority (75%)
    if (jurisdiction === JurisdictionCode.UK_COMPANIES_ACT) {
      const isSpecial = proposal.isSpecialResolution || (proposal.title && proposal.title.toLowerCase().includes("special resolution"));
      if (isSpecial) {
        const pass = proposal.passThreshold !== undefined ? proposal.passThreshold : rules.defaultPassThreshold;
        if (pass < rules.specialResolutionThreshold) {
          errors.push(
            `Statutory violation: UK Companies Act 2006 s. 283 mandates at least 75% affirmative supermajority for Special Resolutions. Current threshold is ${(pass * 100).toFixed(1)}%.`
          );
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      jurisdiction,
      statuteName: rules.name,
      statuteRef: rules.statuteRef
    };
  }

  /**
   * Get all registered statutory jurisdiction rulesets
   * @returns {object}
   */
  static getSupportedJurisdictions() {
    return STATUTORY_RULESETS;
  }
}
