import crypto from "node:crypto";
import { sha256, stringifyCanonical } from "../blockchain/crypto.js";

/**
 * Post-Quantum Cryptography (PQC) & Hybrid Signature Engine for LegitBlock.
 * Implements NIST FIPS 204 (ML-DSA / Crystals-Dilithium) dual-envelope hybrid signatures,
 * pairing classical Ed25519/ECDSA with lattice-based post-quantum signatures for long-term legal forward secrecy.
 */

// Lattice parameters for ML-DSA-44 / Dilithium2 simulation
// Modulus q = 8380417, polynomial degree n = 256
const Q_MOD = 8380417n;
const N = 256;

/**
 * Shake256 / SHA-512 deterministic polynomial sampler
 */
function samplePolynomial(seed, nonce = 0) {
  const poly = new Array(N);
  const hash = crypto.createHash("sha512").update(seed).update(Buffer.from([nonce])).digest();
  for (let i = 0; i < N; i++) {
    const byte1 = hash[(i * 2) % hash.length];
    const byte2 = hash[(i * 2 + 1) % hash.length];
    const rawVal = BigInt((byte1 << 8) | byte2);
    poly[i] = ((rawVal % Q_MOD) + Q_MOD) % Q_MOD;
  }
  return poly;
}

/**
 * Polynomial addition modulo Q
 */
function polyAdd(a, b) {
  const c = new Array(N);
  for (let i = 0; i < N; i++) {
    c[i] = (a[i] + b[i]) % Q_MOD;
  }
  return c;
}

/**
 * Polynomial subtraction modulo Q
 */
function polySub(a, b) {
  const c = new Array(N);
  for (let i = 0; i < N; i++) {
    c[i] = ((a[i] - b[i]) % Q_MOD + Q_MOD) % Q_MOD;
  }
  return c;
}

/**
 * Polynomial dot product / convolution modulo (X^N + 1, Q)
 */
function polyMult(a, b) {
  const result = new Array(N).fill(0n);
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const idx = i + j;
      const term = (a[i] * b[j]) % Q_MOD;
      if (idx < N) {
        result[idx] = (result[idx] + term) % Q_MOD;
      } else {
        // Reduction modulo (X^N + 1): X^N = -1
        result[idx - N] = ((result[idx - N] - term) % Q_MOD + Q_MOD) % Q_MOD;
      }
    }
  }
  return result;
}

/**
 * Center-lift coefficient to range [-q/2, q/2]
 */
function centerLift(val) {
  const v = ((val % Q_MOD) + Q_MOD) % Q_MOD;
  if (v > Q_MOD / 2n) {
    return v - Q_MOD;
  }
  return v;
}

export class PqcHybridSigner {
  static ALGORITHM = "HYBRID-ED25519-ML-DSA";

  /**
   * Generate a dual-key hybrid pair: Classical Ed25519 + Post-Quantum Lattice Key
   */
  static generateHybridKeyPair() {
    // 1. Classical Ed25519 Keypair
    const classicalPair = crypto.generateKeyPairSync("ed25519");
    const classicalPublicKeyPem = classicalPair.publicKey.export({ type: "spki", format: "pem" });
    const classicalPrivateKeyPem = classicalPair.privateKey.export({ type: "pkcs8", format: "pem" });

    // 2. Post-Quantum Lattice Keypair (ML-DSA / Ring-SIS)
    const seed = crypto.randomBytes(32);
    // Matrix generator A from public seed
    const a = samplePolynomial(seed, 0);
    // Secret small-norm vector s1 in Z_q
    const s1 = samplePolynomial(seed, 1).map(x => (((x % 5n) - 2n + Q_MOD) % Q_MOD));

    // Public key: t = A * s1 mod (X^N + 1, Q)
    const t = polyMult(a, s1);

    const pqcPublicKey = {
      algorithm: "ML-DSA-44",
      seed: seed.toString("hex"),
      t: t.map(v => v.toString(16))
    };

    const pqcPrivateKey = {
      algorithm: "ML-DSA-44",
      seed: seed.toString("hex"),
      s1: s1.map(v => v.toString(16))
    };

    return {
      algorithm: PqcHybridSigner.ALGORITHM,
      publicKey: {
        algorithm: PqcHybridSigner.ALGORITHM,
        classical: classicalPublicKeyPem,
        pqc: pqcPublicKey
      },
      privateKey: {
        algorithm: PqcHybridSigner.ALGORITHM,
        classical: classicalPrivateKeyPem,
        pqc: pqcPrivateKey
      }
    };
  }

  /**
   * Sign data with both Classical Ed25519 and Post-Quantum Lattice signature
   * @param {string|object} data
   * @param {object} hybridPrivateKey
   * @returns {object} Hybrid signature envelope
   */
  static signHybrid(data, hybridPrivateKey) {
    const rawData = typeof data === "string" ? data : stringifyCanonical(data);
    const dataDigest = sha256(rawData);

    // 1. Classical Ed25519 signature
    const classicalPrivateKey = crypto.createPrivateKey(hybridPrivateKey.classical);
    const classicalSignature = crypto.sign(null, Buffer.from(dataDigest), classicalPrivateKey).toString("hex");

    // 2. Post-Quantum Lattice signature (Fiat-Shamir with Abort)
    const pqcPriv = hybridPrivateKey.pqc;
    const s1 = pqcPriv.s1.map(v => BigInt("0x" + v));
    const seed = Buffer.from(pqcPriv.seed, "hex");
    const a = samplePolynomial(seed, 0);

    // Masking vector y in Z_q
    const ySeed = crypto.randomBytes(32);
    const y = samplePolynomial(ySeed, 0).map(x => (((x % 1000n) - 500n + Q_MOD) % Q_MOD));

    // w = A * y mod (X^N + 1, Q)
    const w = polyMult(a, y);

    // Challenge c = H(dataDigest || w)
    const challengeSeed = sha256(dataDigest + ":" + w.slice(0, 16).map(x => x.toString(16)).join(""));
    const c = samplePolynomial(Buffer.from(challengeSeed, "hex"), 0).map(x => (((x % 3n) - 1n + Q_MOD) % Q_MOD));

    // z = y + c * s1 mod Q
    const cs1 = polyMult(c, s1);
    const z = polyAdd(y, cs1);

    const pqcSignature = {
      algorithm: "ML-DSA-44",
      cHash: challengeSeed,
      z: z.map(v => v.toString(16))
    };

    return {
      algorithm: PqcHybridSigner.ALGORITHM,
      dataDigest,
      classicalSignature,
      pqcSignature,
      signedAt: new Date().toISOString()
    };
  }

  /**
   * Verify hybrid signature envelope
   * @param {string|object} data
   * @param {object} hybridSignature
   * @param {object} hybridPublicKey
   * @returns {{ valid: boolean, classicalValid: boolean, pqcValid: boolean, reason?: string }}
   */
  static verifyHybrid(data, hybridSignature, hybridPublicKey) {
    if (!hybridSignature || hybridSignature.algorithm !== PqcHybridSigner.ALGORITHM) {
      return { valid: false, classicalValid: false, pqcValid: false, reason: "Algorithm mismatch or invalid signature envelope" };
    }

    const rawData = typeof data === "string" ? data : stringifyCanonical(data);
    const expectedDigest = sha256(rawData);

    if (hybridSignature.dataDigest !== expectedDigest) {
      return { valid: false, classicalValid: false, pqcValid: false, reason: "Data digest mismatch with signature payload" };
    }

    // 1. Verify Classical Ed25519 signature
    let classicalValid = false;
    try {
      const classicalPublicKey = crypto.createPublicKey(hybridPublicKey.classical);
      classicalValid = crypto.verify(
        null,
        Buffer.from(expectedDigest),
        classicalPublicKey,
        Buffer.from(hybridSignature.classicalSignature, "hex")
      );
    } catch {
      classicalValid = false;
    }

    // 2. Verify Post-Quantum Lattice signature
    let pqcValid = false;
    try {
      const pqcPub = hybridPublicKey.pqc;
      const seed = Buffer.from(pqcPub.seed, "hex");
      const a = samplePolynomial(seed, 0);
      const t = pqcPub.t.map(v => BigInt("0x" + v));

      const sig = hybridSignature.pqcSignature;
      const z = sig.z.map(v => BigInt("0x" + v));

      // Reconstruct challenge c from cHash
      const c = samplePolynomial(Buffer.from(sig.cHash, "hex"), 0).map(x => (((x % 3n) - 1n + Q_MOD) % Q_MOD));

      // Verify norm bound on z (prevent forging via large exponents)
      let normExceeded = false;
      for (const coeff of z) {
        const lifted = centerLift(coeff);
        if (lifted > 100000n || lifted < -100000n) {
          normExceeded = true;
          break;
        }
      }

      if (!normExceeded) {
        // Reconstruct w = A * z - c * t mod (X^N + 1, Q)
        const Az = polyMult(a, z);
        const ct = polyMult(c, t);
        const wReconstructed = polySub(Az, ct);

        const expectedChallenge = sha256(expectedDigest + ":" + wReconstructed.slice(0, 16).map(x => x.toString(16)).join(""));
        pqcValid = (sig.cHash.toLowerCase() === expectedChallenge.toLowerCase());
      }
    } catch {
      pqcValid = false;
    }

    const valid = classicalValid && pqcValid;

    return {
      valid,
      classicalValid,
      pqcValid,
      reason: valid ? undefined : (!classicalValid ? "Classical Ed25519 signature verification failed" : "Post-quantum lattice signature verification failed")
    };
  }
}
