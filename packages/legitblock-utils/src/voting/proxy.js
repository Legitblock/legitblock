import { hashObject, stringifyCanonical, verifySignature } from "../blockchain/crypto.js";

/**
 * Scope of proxy voting authority under Delaware General Corporation Law (DGCL § 212).
 */
export const ProxyScope = {
  ALL: "ALL",                       // Full plenary voting authority on all organizational matters
  BUDGET: "BUDGET",                 // Limited to budget ceiling, treasury, and capital expenditures
  AMENDMENT: "AMENDMENT",           // Limited to charter and bylaw amendment resolutions
  MEMBER_ACTION: "MEMBER_ACTION",   // Limited to director elections and member admissions/removals
  PROPOSAL_SPECIFIC: "PROPOSAL"     // Restricted to a single nominated proposal ID
};

/**
 * Formal Delegated Proxy Grant binding a Grantor's voting power to an Agent.
 */
export class ProxyGrant {
  /**
   * @param {object} params
   * @param {string} [params.id]
   * @param {string} params.grantorId - Member delegating voting power
   * @param {string} [params.grantorName=""]
   * @param {string} params.agentId - Designated proxy holder
   * @param {string} [params.agentName=""]
   * @param {string} [params.scope=ProxyScope.ALL]
   * @param {string} [params.targetProposalId=null] - If scope is PROPOSAL_SPECIFIC
   * @param {number} [params.delegatedWeight=1] - Weight points or units delegated
   * @param {string} [params.validFrom] - ISO timestamp
   * @param {string} [params.expiresAt] - ISO timestamp (DGCL § 212: max 3 years unless specified)
   * @param {string} [params.signature=""] - Cryptographic signature of grantor
   * @param {boolean} [params.revoked=false]
   * @param {string} [params.revokedAt=null]
   */
  constructor({
    id,
    grantorId,
    grantorName = "",
    agentId,
    agentName = "",
    scope = ProxyScope.ALL,
    targetProposalId = null,
    delegatedWeight = 1,
    validFrom,
    expiresAt,
    signature = "",
    revoked = false,
    revokedAt = null
  }) {
    if (!grantorId || !agentId) {
      throw new Error("Proxy grant requires both grantorId and agentId");
    }
    if (grantorId === agentId) {
      throw new Error("Grantor cannot delegate voting proxy to themselves");
    }

    const now = new Date();
    this.id = id || `proxy-${grantorId}-${agentId}-${now.getTime()}`;
    this.grantorId = grantorId;
    this.grantorName = grantorName || grantorId;
    this.agentId = agentId;
    this.agentName = agentName || agentId;
    this.scope = scope;
    this.targetProposalId = targetProposalId;
    this.delegatedWeight = Math.max(1, delegatedWeight);
    this.validFrom = validFrom || now.toISOString();
    // Default expiration: 30 days (well within DGCL 3-year maximum)
    this.expiresAt = expiresAt || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    this.signature = signature;
    this.revoked = revoked;
    this.revokedAt = revokedAt;
    this.grantHash = this.calculateHash();
  }

  calculateHash() {
    return hashObject({
      grantorId: this.grantorId,
      agentId: this.agentId,
      scope: this.scope,
      targetProposalId: this.targetProposalId,
      delegatedWeight: this.delegatedWeight,
      validFrom: this.validFrom,
      expiresAt: this.expiresAt
    });
  }

  /**
   * Check if this proxy grant is currently valid for a proposal
   * @param {object} [proposal] - Target proposal object
   * @returns {boolean}
   */
  isActive(proposal = null) {
    if (this.revoked) return false;
    const now = new Date();
    if (now < new Date(this.validFrom) || now > new Date(this.expiresAt)) {
      return false;
    }
    if (this.scope === ProxyScope.ALL) return true;
    if (!proposal) return true;

    if (this.scope === ProxyScope.PROPOSAL_SPECIFIC) {
      return this.targetProposalId === proposal.id;
    }
    if (this.scope === ProxyScope.BUDGET) {
      return proposal.documentData?.spendingAmount !== undefined || proposal.documentData?.budgetAmount !== undefined;
    }
    if (this.scope === ProxyScope.AMENDMENT) {
      return proposal.type === "AMENDMENT";
    }
    if (this.scope === ProxyScope.MEMBER_ACTION) {
      return proposal.type === "MEMBER_ACTION";
    }
    return false;
  }

  revoke() {
    this.revoked = true;
    this.revokedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      grantorId: this.grantorId,
      grantorName: this.grantorName,
      agentId: this.agentId,
      agentName: this.agentName,
      scope: this.scope,
      targetProposalId: this.targetProposalId,
      delegatedWeight: this.delegatedWeight,
      validFrom: this.validFrom,
      expiresAt: this.expiresAt,
      signature: this.signature,
      revoked: this.revoked,
      revokedAt: this.revokedAt,
      grantHash: this.grantHash
    };
  }

  static fromJSON(json) {
    return new ProxyGrant(json);
  }
}

/**
 * Delegated Proxy Engine
 * Manages appointment, revocation, and transitive voting weight calculation under DGCL § 212.
 */
export class ProxyEngine {
  constructor({ grants = [] } = {}) {
    this.grants = new Map(); // grantId -> ProxyGrant
    for (const g of grants) {
      const grant = g instanceof ProxyGrant ? g : ProxyGrant.fromJSON(g);
      this.grants.set(grant.id, grant);
    }
  }

  /**
   * Register a new proxy appointment
   * @param {ProxyGrant|object} proxyGrant
   * @param {string} [grantorPublicKeyPem] - Optional public key to verify signature
   * @returns {ProxyGrant}
   */
  registerGrant(proxyGrant, grantorPublicKeyPem = null) {
    const grant = proxyGrant instanceof ProxyGrant ? proxyGrant : new ProxyGrant(proxyGrant);

    // Verify cryptographic signature if key is supplied
    if (grantorPublicKeyPem && grant.signature) {
      const canonicalPayload = stringifyCanonical({
        grantorId: grant.grantorId,
        agentId: grant.agentId,
        scope: grant.scope,
        targetProposalId: grant.targetProposalId,
        delegatedWeight: grant.delegatedWeight,
        validFrom: grant.validFrom,
        expiresAt: grant.expiresAt
      });
      const valid = verifySignature(canonicalPayload, grant.signature, grantorPublicKeyPem);
      if (!valid) {
        throw new Error("Proxy grant rejected: Grantor cryptographic signature is invalid");
      }
    }

    // Cycle detection: prevent circular delegations (e.g. A delegates to B, B delegates to A)
    if (this._detectCycle(grant.grantorId, grant.agentId)) {
      throw new Error(`Circular proxy delegation detected: ${grant.agentId} cannot accept delegation from ${grant.grantorId}`);
    }

    this.grants.set(grant.id, grant);
    return grant;
  }

  /**
   * Check for delegation cycles
   * @private
   */
  _detectCycle(grantorId, agentId, visited = new Set()) {
    if (visited.has(agentId)) return true;
    visited.add(agentId);

    // Find any grants where agentId has delegated to someone else
    for (const g of this.grants.values()) {
      if (g.grantorId === agentId && !g.revoked) {
        if (g.agentId === grantorId) return true;
        if (this._detectCycle(grantorId, g.agentId, visited)) return true;
      }
    }
    return false;
  }

  /**
   * Revoke an active proxy grant
   * @param {string} grantId
   * @param {string} [requestorId]
   * @returns {boolean}
   */
  revokeGrant(grantId, requestorId = null) {
    const grant = this.grants.get(grantId);
    if (!grant) return false;
    if (requestorId && grant.grantorId !== requestorId) {
      throw new Error(`Unauthorized: Only grantor ${grant.grantorId} may revoke this proxy appointment`);
    }
    grant.revoke();
    return true;
  }

  /**
   * Get all active grants appointing a member as proxy
   * @param {string} agentId
   * @param {object} [proposal]
   * @returns {ProxyGrant[]}
   */
  getActiveGrantsForAgent(agentId, proposal = null) {
    return Array.from(this.grants.values()).filter(
      g => g.agentId === agentId && g.isActive(proposal)
    );
  }

  /**
   * Calculate effective voting power for a member
   * Base Weight - Delegated Out + Delegated In
   * 
   * @param {object} params
   * @param {string} params.memberId
   * @param {number} [params.baseWeight=1]
   * @param {object} [params.proposal=null]
   * @returns {{ effectiveWeight: number, baseWeight: number, delegatedInWeight: number, delegatedOutWeight: number, proxyGrantsReceived: ProxyGrant[] }}
   */
  calculateEffectiveWeight({ memberId, baseWeight = 1, proposal = null }) {
    // Check if member has delegated their vote OUT
    let delegatedOutWeight = 0;
    for (const g of this.grants.values()) {
      if (g.grantorId === memberId && g.isActive(proposal)) {
        delegatedOutWeight += g.delegatedWeight;
      }
    }

    // Retained personal weight cannot be negative
    const retainedWeight = Math.max(0, baseWeight - delegatedOutWeight);

    // Sum all proxy grants delegated IN
    const receivedGrants = this.getActiveGrantsForAgent(memberId, proposal);
    const delegatedInWeight = receivedGrants.reduce((sum, g) => sum + g.delegatedWeight, 0);

    const effectiveWeight = retainedWeight + delegatedInWeight;

    return {
      effectiveWeight,
      baseWeight,
      retainedWeight,
      delegatedInWeight,
      delegatedOutWeight,
      proxyGrantsReceived: receivedGrants
    };
  }

  /**
   * Generate an immutable statutory audit receipt for a proxy appointment
   * @param {string} grantId
   * @returns {object} Machine-readable DGCL § 212 attestation packet
   */
  generateProxyReceipt(grantId) {
    const grant = this.grants.get(grantId);
    if (!grant) throw new Error(`Proxy grant not found: ${grantId}`);

    const payload = {
      standard: "LEGITBLOCK-DGCL-212-PROXY-APPOINTMENT-v1",
      statute: "Delaware General Corporation Law § 212(b) & (c)",
      timestamp: new Date().toISOString(),
      grant: grant.toJSON()
    };

    return {
      ...payload,
      receiptHash: hashObject(payload)
    };
  }

  toJSON() {
    return Array.from(this.grants.values()).map(g => g.toJSON());
  }

  static fromJSON(json) {
    return new ProxyEngine({ grants: json });
  }
}
