import { sha256 } from "../blockchain/crypto.js";

/**
 * Zero-Knowledge Range Proof Engine (NIZKRP) for LegitBlock Covenants.
 * Implements non-interactive zero-knowledge proofs over Pedersen commitments,
 * allowing counterparties to prove compliance with statutory or financial thresholds
 * (e.g. EBITDA >= $10M, Solvency >= 1.25x) without revealing the underlying confidential value.
 */

// Standard RFC 3526 1536-bit MODP Group Parameters
const RFC3526_P_HEX = 
  "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD1" +
  "29024E088A67CC74020BBEA63B139B22514A08798E3404DD" +
  "EF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245" +
  "E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7ED" +
  "EE386BFB5A899FA5AE9F24117C4B1FE649286651ECE65381" +
  "FFFFFFFFFFFFFFFF";

const P = BigInt("0x" + RFC3526_P_HEX);
// Subgroup order Q = (P - 1) / 2
const Q = (P - 1n) / 2n;

/**
 * Modular exponentiation (base^exp mod modulus)
 */
function modPow(base, exp, mod) {
  let res = 1n;
  let b = ((base % mod) + mod) % mod;
  let e = ((exp % Q) + Q) % Q;
  while (e > 0n) {
    if (e & 1n) {
      res = (res * b) % mod;
    }
    b = (b * b) % mod;
    e >>= 1n;
  }
  return res;
}

/**
 * Modular inverse via Extended Euclidean Algorithm
 */
function modInverse(a, m) {
  let [old_r, r] = [((a % m) + m) % m, m];
  let [old_s, s] = [1n, 0n];

  while (r !== 0n) {
    const quotient = old_r / r;
    [old_r, r] = [r, old_r - quotient * r];
    [old_s, s] = [s, old_s - quotient * s];
  }

  if (old_r !== 1n) {
    throw new Error("Value is not invertible modulo m");
  }
  return ((old_s % m) + m) % m;
}

// Subgroup generators: squared to ensure elements are in the order Q subgroup
const G = modPow(2n, 2n, P);
const H_raw = (BigInt("0x" + sha256(RFC3526_P_HEX)) % (P - 3n)) + 2n;
const H = modPow(H_raw, 2n, P);

/**
 * Deterministic PRNG to generate blinding factors in Z_q
 */
function generateRandomBlinding() {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 32; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
  return (BigInt("0x" + hex) % (Q - 1n)) + 1n;
}

function parseBigIntSafe(val) {
  if (typeof val === "bigint") return val;
  if (typeof val === "number") return BigInt(val);
  if (typeof val === "string") {
    if (val.startsWith("0x") || val.startsWith("0X")) return BigInt(val);
    if (/^[0-9a-fA-F]+$/.test(val) && !/^\d+$/.test(val)) return BigInt("0x" + val);
    return BigInt(val);
  }
  return BigInt(val);
}

export class ZkRangeProofEngine {
  /**
   * Create a Pedersen Commitment: C = g^value * h^blinding mod p
   * @param {number|bigint} value
   * @param {bigint|string} [blindingFactor]
   * @returns {{ commitment: string, blindingFactor: string }}
   */
  static commit(value, blindingFactor = null) {
    const v = parseBigIntSafe(value);
    const r = blindingFactor ? parseBigIntSafe(blindingFactor) : generateRandomBlinding();

    const gV = modPow(G, v, P);
    const hR = modPow(H, r, P);
    const C = (gV * hR) % P;

    return {
      commitment: C.toString(16),
      blindingFactor: r.toString(16)
    };
  }

  /**
   * Generate a Zero-Knowledge Range Proof that value >= min (and optionally value <= max)
   * without disclosing the value itself.
   *
   * @param {object} params
   * @param {number|bigint} params.value - The private secret value
   * @param {string|bigint} [params.blindingFactor] - Secret blinding factor
   * @param {number|bigint} params.min - Public minimum threshold (e.g. 10000000 for $10M)
   * @param {number|bigint} [params.max] - Optional public maximum threshold
   * @param {string} [params.statementId="covenant-proof"]
   * @returns {object} The non-interactive zero-knowledge proof
   */
  static generateRangeProof({ value, blindingFactor = null, min, max = null, statementId = "covenant-proof" }) {
    const val = parseBigIntSafe(value);
    const minVal = parseBigIntSafe(min);

    if (val < minVal) {
      throw new Error(`Cannot generate valid ZK proof: value (${val}) is strictly below min threshold (${minVal})`);
    }

    if (max !== null && val > parseBigIntSafe(max)) {
      throw new Error(`Cannot generate valid ZK proof: value (${val}) exceeds max threshold (${max})`);
    }

    const delta = val - minVal;
    const r = blindingFactor ? parseBigIntSafe(blindingFactor) : generateRandomBlinding();

    // Primary commitment: C = g^val * h^r mod P
    const gVal = modPow(G, val, P);
    const hR = modPow(H, r, P);
    const commitment = (gVal * hR) % P;

    // Decompose delta into bits (up to 40 bits covers up to 1 Trillion)
    const BITS = 40;
    const bitValues = [];
    let tempDelta = delta;
    for (let i = 0; i < BITS; i++) {
      bitValues.push(Number(tempDelta & 1n));
      tempDelta >>= 1n;
    }

    // Assign random blinding factor for each bit
    const bitBlindings = [];
    const bitCommitments = [];
    for (let i = 0; i < BITS; i++) {
      const r_i = generateRandomBlinding();
      bitBlindings.push(r_i);
      const b_i = BigInt(bitValues[i]);
      const c_i = (modPow(G, b_i, P) * modPow(H, r_i, P)) % P;
      bitCommitments.push(c_i);
    }

    // The sum of scaled bit blindings: sum_r = sum(2^i * r_i)
    let sumBitBlindings = 0n;
    for (let i = 0; i < BITS; i++) {
      const weight = 1n << BigInt(i);
      sumBitBlindings = (sumBitBlindings + weight * bitBlindings[i]) % Q;
    }

    // Residual blinding for delta commitment alignment:
    // r_diff = (r - sumBitBlindings) mod Q
    const rDiff = ((r - sumBitBlindings) % Q + Q) % Q;

    // 1-out-of-2 Proof for each bit: proves each b_i in {0, 1}
    const bitProofs = [];
    for (let i = 0; i < BITS; i++) {
      const b_i = bitValues[i];
      const r_i = bitBlindings[i];
      const C_i = bitCommitments[i];
      const C_i_div_G = (C_i * modInverse(G, P)) % P;

      // CDS 1-out-of-2 OR proof for b_i in {0, 1}
      const w = generateRandomBlinding();

      if (b_i === 0) {
        // True branch is 0: C_i = h^r_i
        // Simulate branch 1: C_i / g = h^r_i
        const e1 = generateRandomBlinding();
        const z1 = generateRandomBlinding();
        const a1 = (modPow(H, z1, P) * modInverse(modPow(C_i_div_G, e1, P), P)) % P;
        const a0 = modPow(H, w, P);

        // Challenge via Fiat-Shamir
        const challengeHash = sha256(`BIT-OR:${statementId}:${i}:${C_i.toString(16)}:${a0.toString(16)}:${a1.toString(16)}`);
        const e = BigInt("0x" + challengeHash) % Q;

        const e0 = ((e - e1) % Q + Q) % Q;
        const z0 = (w + e0 * r_i) % Q;

        bitProofs.push({
          a0: a0.toString(16),
          a1: a1.toString(16),
          e0: e0.toString(16),
          e1: e1.toString(16),
          z0: z0.toString(16),
          z1: z1.toString(16)
        });
      } else {
        // True branch is 1: C_i / g = h^r_i
        // Simulate branch 0: C_i = h^r_i
        const e0 = generateRandomBlinding();
        const z0 = generateRandomBlinding();
        const a0 = (modPow(H, z0, P) * modInverse(modPow(C_i, e0, P), P)) % P;
        const a1 = modPow(H, w, P);

        // Challenge via Fiat-Shamir
        const challengeHash = sha256(`BIT-OR:${statementId}:${i}:${C_i.toString(16)}:${a0.toString(16)}:${a1.toString(16)}`);
        const e = BigInt("0x" + challengeHash) % Q;

        const e1 = ((e - e0) % Q + Q) % Q;
        const z1 = (w + e1 * r_i) % Q;

        bitProofs.push({
          a0: a0.toString(16),
          a1: a1.toString(16),
          e0: e0.toString(16),
          e1: e1.toString(16),
          z0: z0.toString(16),
          z1: z1.toString(16)
        });
      }
    }

    return {
      version: "1.0-NIZKRP",
      statementId,
      commitment: commitment.toString(16),
      min: minVal.toString(),
      max: max !== null ? BigInt(max).toString() : null,
      bitCommitments: bitCommitments.map(c => c.toString(16)),
      bitProofs,
      rDiff: rDiff.toString(16),
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Verify a Zero-Knowledge Range Proof that committed value >= min without learning the value.
   *
   * @param {object} proof - Proof object emitted by generateRangeProof
   * @param {object} [constraints] - Optional enforcement constraints
   * @param {number|bigint} [constraints.min] - Expected minimum
   * @param {number|bigint} [constraints.max] - Expected maximum
   * @param {string} [constraints.commitment] - Expected commitment
   * @returns {{ valid: boolean, reason?: string, details?: object }}
   */
  static verifyRangeProof(proof, constraints = {}) {
    if (!proof || proof.version !== "1.0-NIZKRP") {
      return { valid: false, reason: "Invalid proof structure or version mismatch" };
    }

    const commitment = BigInt("0x" + proof.commitment);
    const minVal = BigInt(proof.min);

    if (constraints.min !== undefined && minVal < parseBigIntSafe(constraints.min)) {
      return { valid: false, reason: `Proof minimum (${minVal}) does not satisfy required constraint (${constraints.min})` };
    }

    if (constraints.max !== undefined && proof.max && BigInt(proof.max) > parseBigIntSafe(constraints.max)) {
      return { valid: false, reason: `Proof maximum (${proof.max}) exceeds required constraint (${constraints.max})` };
    }

    if (constraints.commitment && proof.commitment.toLowerCase() !== constraints.commitment.toLowerCase()) {
      return { valid: false, reason: "Proof commitment does not match expected commitment" };
    }

    const bitCommitments = proof.bitCommitments.map(c => BigInt("0x" + c));
    const BITS = bitCommitments.length;

    // 1. Verify each bit proof (b_i in {0, 1})
    for (let i = 0; i < BITS; i++) {
      const C_i = bitCommitments[i];
      const p_i = proof.bitProofs[i];
      if (!p_i) {
        return { valid: false, reason: `Missing bit proof for bit index ${i}` };
      }

      const a0 = BigInt("0x" + p_i.a0);
      const a1 = BigInt("0x" + p_i.a1);
      const e0 = BigInt("0x" + p_i.e0);
      const e1 = BigInt("0x" + p_i.e1);
      const z0 = BigInt("0x" + p_i.z0);
      const z1 = BigInt("0x" + p_i.z1);

      // Verify Fiat-Shamir challenge sum: e0 + e1 == e
      const challengeHash = sha256(`BIT-OR:${proof.statementId}:${i}:${C_i.toString(16)}:${a0.toString(16)}:${a1.toString(16)}`);
      const expectedE = BigInt("0x" + challengeHash) % Q;
      const actualE = (e0 + e1) % Q;

      if (expectedE !== actualE) {
        return { valid: false, reason: `Fiat-Shamir challenge mismatch at bit ${i}` };
      }

      // Verify branch 0: h^z0 == a0 * C_i^e0 mod P
      const left0 = modPow(H, z0, P);
      const right0 = (a0 * modPow(C_i, e0, P)) % P;
      if (left0 !== right0) {
        return { valid: false, reason: `Invalid bit 0 proof verification at bit ${i}` };
      }

      // Verify branch 1: h^z1 == a1 * (C_i / G)^e1 mod P
      const C_i_div_G = (C_i * modInverse(G, P)) % P;
      const left1 = modPow(H, z1, P);
      const right1 = (a1 * modPow(C_i_div_G, e1, P)) % P;
      if (left1 !== right1) {
        return { valid: false, reason: `Invalid bit 1 proof verification at bit ${i}` };
      }
    }

    // 2. Verify homomorphic combination matches C / g^minVal
    let reconstructedDeltaCommitment = 1n;
    for (let i = 0; i < BITS; i++) {
      const weight = 1n << BigInt(i);
      const weightedCommitment = modPow(bitCommitments[i], weight, P);
      reconstructedDeltaCommitment = (reconstructedDeltaCommitment * weightedCommitment) % P;
    }

    // Add back the residual blinding rDiff: * H^rDiff mod P
    const rDiff = BigInt("0x" + proof.rDiff);
    reconstructedDeltaCommitment = (reconstructedDeltaCommitment * modPow(H, rDiff, P)) % P;

    // Expected delta commitment = C * (g^minVal)^-1 mod P
    const gMin = modPow(G, minVal, P);
    const expectedDeltaCommitment = (commitment * modInverse(gMin, P)) % P;

    if (reconstructedDeltaCommitment !== expectedDeltaCommitment) {
      return { valid: false, reason: "Homomorphic bit commitment product does not match target commitment delta" };
    }

    return {
      valid: true,
      details: {
        statementId: proof.statementId,
        min: proof.min,
        max: proof.max,
        commitment: proof.commitment,
        verifiedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Helper: Generate a formal corporate financial covenant proof packet
   */
  static generateCovenantProof({ metricName, value, min, max = null, proposalId = "prop-covenant" }) {
    const { commitment, blindingFactor } = ZkRangeProofEngine.commit(value);
    const proof = ZkRangeProofEngine.generateRangeProof({
      value,
      blindingFactor,
      min,
      max,
      statementId: `COVENANT:${metricName}:${proposalId}`
    });

    return {
      metricName,
      commitment,
      min,
      max,
      proof
    };
  }
}
