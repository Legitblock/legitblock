import crypto from "node:crypto";

/**
 * Compute SHA-256 hash of a string or buffer
 * @param {string|Buffer} data
 * @returns {string} Hex-encoded SHA-256 hash
 */
export function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Deterministically stringify an object with sorted keys
 * @param {any} obj
 * @returns {string}
 */
export function stringifyCanonical(obj) {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return "[" + obj.map(stringifyCanonical).join(",") + "]";
  }

  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map(k => `${JSON.stringify(k)}:${stringifyCanonical(obj[k])}`);
  return "{" + pairs.join(",") + "}";
}

/**
 * Compute deterministic SHA-256 hash of an object
 * Keys are sorted recursively to ensure reproducible hashing
 * @param {any} obj
 * @returns {string} Hex-encoded SHA-256 hash
 */
export function hashObject(obj) {
  const canonicalString = stringifyCanonical(obj);
  return sha256(canonicalString);
}

/**
 * Generate an asymmetric key pair for member cryptographic signatures (Ed25519)
 * @returns {{ publicKey: string, privateKey: string }} PEM-encoded keys
 */
export function generateMemberKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519", {
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  return { publicKey, privateKey };
}

/**
 * Sign data with a private key (Ed25519)
 * @param {string|object} data
 * @param {string} privateKeyPem
 * @returns {string} Hex-encoded signature
 */
export function signData(data, privateKeyPem) {
  const payload = typeof data === "string" ? data : stringifyCanonical(data);
  const signature = crypto.sign(null, Buffer.from(payload), privateKeyPem);
  return signature.toString("hex");
}

/**
 * Verify data signature using public key (Ed25519)
 * @param {string|object} data
 * @param {string} signatureHex
 * @param {string} publicKeyPem
 * @returns {boolean}
 */
export function verifySignature(data, signatureHex, publicKeyPem) {
  try {
    const payload = typeof data === "string" ? data : stringifyCanonical(data);
    const signatureBuffer = Buffer.from(signatureHex, "hex");
    return crypto.verify(null, Buffer.from(payload), publicKeyPem, signatureBuffer);
  } catch {
    return false;
  }
}
