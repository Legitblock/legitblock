import crypto from "node:crypto";
import { sha256, hashObject, stringifyCanonical } from "../blockchain/crypto.js";

// Standard RFC 3526 1536-bit MODP Group Parameters
const RFC3526_P_HEX = 
  "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD1" +
  "29024E088A67CC74020BBEA63B139B22514A08798E3404DD" +
  "EF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245" +
  "E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7ED" +
  "EE386BFB5A899FA5AE9F24117C4B1FE649286651ECE65381" +
  "FFFFFFFFFFFFFFFF";

const P = BigInt("0x" + RFC3526_P_HEX);
const Q = (P - 1n) / 2n;
const G = 2n;
// Independent secondary generator derived deterministically: h = sha256(p) mod p
const H = (BigInt("0x" + sha256(RFC3526_P_HEX)) % (P - 3n)) + 2n;

/**
 * Modular exponentiation: (base^exp) mod mod
 */
function modPow(base, exp, mod) {
  let res = 1n;
  let b = base % mod;
  let e = exp;
  while (e > 0n) {
    if (e % 2n === 1n) {
      res = (res * b) % mod;
    }
    b = (b * b) % mod;
    e = e / 2n;
  }
  return res;
}

/**
 * Blinded Secret Ballot Commitment
 */
export class BlindedBallot {
  /**
   * @param {object} params
   * @param {string} params.proposalId
   * @param {string} params.voterId
   * @param {string} params.commitment - Hex commitment C = g^v * h^r mod p
   * @param {string} [params.signature] - Voter signature over commitment
   * @param {string} [params.timestamp]
   */
  constructor({
    proposalId,
    voterId,
    commitment,
    signature = "",
    timestamp = new Date().toISOString()
  }) {
    this.proposalId = proposalId;
    this.voterId = voterId;
    this.commitment = commitment;
    this.signature = signature;
    this.timestamp = timestamp;
  }

  toJSON() {
    return {
      proposalId: this.proposalId,
      voterId: this.voterId,
      commitment: this.commitment,
      signature: this.signature,
      timestamp: this.timestamp
    };
  }
}

/**
 * Privacy-Preserving Secret Ballot Engine
 * Uses homomorphic Pedersen commitments to tally secret votes without revealing individual voter decisions.
 */
export class SecretBallotEngine {
  /**
   * Generate a blinded commitment for a secret vote
   * @param {object} params
   * @param {string} params.proposalId
   * @param {string} params.voterId
   * @param {number|string} params.voteValue - 1 for YES, 0 for NO
   * @returns {{ ballot: BlindedBallot, blindingFactor: string }}
   */
  static createBlindedBallot({ proposalId, voterId, voteValue }) {
    const v = BigInt(voteValue === "YES" || voteValue === 1 ? 1 : 0);
    
    // Generate cryptographically secure random blinding factor r in [1, Q-1]
    const randomBytes = crypto.randomBytes(32);
    const r = (BigInt("0x" + randomBytes.toString("hex")) % (Q - 2n)) + 1n;

    // C = (g^v * h^r) mod p
    const gV = modPow(G, v, P);
    const hR = modPow(H, r, P);
    const commitmentBigInt = (gV * hR) % P;
    const commitmentHex = commitmentBigInt.toString(16);

    const ballot = new BlindedBallot({
      proposalId,
      voterId,
      commitment: commitmentHex
    });

    return {
      ballot,
      blindingFactor: r.toString(16)
    };
  }

  /**
   * Calculate homomorphic aggregate commitment of all cast secret ballots
   * C_aggregate = (product(C_i)) mod p
   * @param {BlindedBallot[]} ballots
   * @returns {string} Hex-encoded aggregate commitment
   */
  static aggregateCommitments(ballots) {
    if (!ballots || ballots.length === 0) return "0";

    let aggregate = 1n;
    for (const b of ballots) {
      const c = BigInt("0x" + b.commitment);
      aggregate = (aggregate * c) % P;
    }

    return aggregate.toString(16);
  }

  /**
   * Combine all voter blinding factors into aggregate blinding factor
   * R_aggregate = (sum(r_i)) mod q
   * @param {string[]} blindingFactorsHex - Array of individual hex blinding factors
   * @returns {string} Hex aggregate blinding factor
   */
  static aggregateBlindingFactors(blindingFactorsHex) {
    let sumR = 0n;
    for (const rHex of blindingFactorsHex) {
      sumR = (sumR + BigInt("0x" + rHex)) % Q;
    }
    return sumR.toString(16);
  }

  /**
   * Cryptographically verify and open the final secret tally
   * Asserts C_aggregate == (g^yesCount * h^aggregateBlindingFactor) mod p
   * @param {object} params
   * @param {string} params.aggregateCommitmentHex
   * @param {string} params.aggregateBlindingFactorHex
   * @param {number} params.claimedYesCount
   * @param {number} params.totalBallotsCast
   * @returns {{ verified: boolean, yesCount: number, noCount: number, totalCast: number }}
   */
  static verifyAndOpenTally({
    aggregateCommitmentHex,
    aggregateBlindingFactorHex,
    claimedYesCount,
    totalBallotsCast
  }) {
    const C_agg = BigInt("0x" + aggregateCommitmentHex);
    const R_agg = BigInt("0x" + aggregateBlindingFactorHex);
    const claimedYes = BigInt(claimedYesCount);

    const gV = modPow(G, claimedYes, P);
    const hR = modPow(H, R_agg, P);
    const expectedC = (gV * hR) % P;

    const verified = C_agg === expectedC;
    const noCount = totalBallotsCast - claimedYesCount;

    return {
      verified,
      yesCount: verified ? claimedYesCount : 0,
      noCount: verified ? noCount : 0,
      totalCast: totalBallotsCast,
      reason: verified ? undefined : "Homomorphic commitment opening mismatch: claimed tally is mathematically invalid"
    };
  }

  /**
   * Helper to solve small discrete log to determine affirmative count directly from opened commitment
   * @param {string} aggregateCommitmentHex 
   * @param {string} aggregateBlindingFactorHex 
   * @param {number} maxVoters 
   * @returns {number|null} Discovered affirmative vote count
   */
  static discoverTally(aggregateCommitmentHex, aggregateBlindingFactorHex, maxVoters = 1000) {
    const C_agg = BigInt("0x" + aggregateCommitmentHex);
    const R_agg = BigInt("0x" + aggregateBlindingFactorHex);
    const hR = modPow(H, R_agg, P);

    // g^T = (C_agg * hR^(-1)) mod p
    // Or equivalently compare (g^T * hR) mod p with C_agg
    for (let t = 0; t <= maxVoters; t++) {
      const gT = modPow(G, BigInt(t), P);
      const testC = (gT * hR) % P;
      if (testC === C_agg) {
        return t;
      }
    }

    return null;
  }
}
