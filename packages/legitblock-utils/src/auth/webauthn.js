import crypto from "node:crypto";
import { stringifyCanonical, verifySignature, sha256 } from "../blockchain/crypto.js";
import { verifyKmsBallotSignature } from "./kms.js";

/**
 * WebAuthn & Passkey Biometric Ballot Signing for LegitBlock.
 * Standardized FIDO2 / W3C WebAuthn assertion generation and ES256 (ECDSA P-256) signature verification.
 */

/**
 * Generate a cryptographically random ballot challenge linked to proposal and voter.
 * @param {object} params
 * @param {string} params.proposalId
 * @param {string} params.voterId
 * @param {string} params.decision - "APPROVE" | "REJECT" | "ABSTAIN"
 * @param {string} [params.origin="https://legitblock.org"]
 * @returns {{ challenge: string, ballotDigest: string, canonicalData: object, createdAt: string }}
 */
export function createBallotChallenge({ proposalId, voterId, decision, origin = "https://legitblock.org" }) {
  const nonce = crypto.randomBytes(32).toString("base64url");
  const createdAt = new Date().toISOString();
  
  const canonicalData = {
    proposalId,
    voterId,
    decision,
    origin,
    nonce,
    createdAt
  };

  const ballotDigest = sha256(stringifyCanonical(canonicalData));

  return {
    challenge: nonce,
    ballotDigest,
    canonicalData,
    createdAt
  };
}

/**
 * Generate a simulated or test WebAuthn Passkey credential pair (ECDSA P-256)
 * @param {string} [credentialId]
 * @returns {{ credentialId: string, publicKeyPem: string, privateKeyPem: string, algorithm: string }}
 */
export function createWebAuthnCredential(credentialId = null) {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ec", {
    namedCurve: "prime256v1",
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" }
  });

  const id = credentialId || crypto.randomBytes(16).toString("base64url");

  return {
    credentialId: id,
    publicKeyPem: publicKey,
    privateKeyPem: privateKey,
    algorithm: "ES256"
  };
}

/**
 * Sign a ballot using a WebAuthn biometric passkey keypair
 * Generates clientDataJSON, authenticatorData with User Presence (UP) and User Verified (UV) flags,
 * and ECDSA P-256 signature.
 * 
 * @param {object} params
 * @param {string} params.proposalId
 * @param {string} params.voterId
 * @param {"APPROVE"|"REJECT"|"ABSTAIN"} params.decision
 * @param {string} params.challenge - Challenge string from createBallotChallenge
 * @param {string} params.privateKeyPem - Voter's Passkey private key PEM
 * @param {string} params.credentialId - Passkey credential ID
 * @param {string} [params.rpId="legitblock.org"]
 * @param {string} [params.origin="https://legitblock.org"]
 * @param {boolean} [params.userVerified=true] - TouchID/FaceID biometric match flag
 * @returns {object} WebAuthn biometric signature payload
 */
export function signBallotWebAuthn({
  proposalId,
  voterId,
  decision,
  challenge,
  privateKeyPem,
  credentialId,
  rpId = "legitblock.org",
  origin = "https://legitblock.org",
  userVerified = true
}) {
  // 1. Construct clientDataJSON
  const clientData = {
    type: "webauthn.get",
    challenge,
    origin,
    crossOrigin: false,
    ballotData: {
      proposalId,
      voterId,
      decision
    }
  };
  const clientDataJSON = JSON.stringify(clientData);
  const clientDataBuffer = Buffer.from(clientDataJSON, "utf8");

  // 2. Construct authenticatorData (37 bytes minimum)
  // - 32 bytes: rpIdHash (SHA-256 of rpId)
  // - 1 byte: flags (bit 0 = User Present UP, bit 2 = User Verified UV)
  // - 4 bytes: signature counter (uint32be)
  const rpIdHash = crypto.createHash("sha256").update(rpId).digest();
  const flags = 0x01 | (userVerified ? 0x04 : 0x00);
  const counterBuffer = Buffer.alloc(4);
  counterBuffer.writeUInt32BE(1, 0);

  const authenticatorData = Buffer.concat([rpIdHash, Buffer.from([flags]), counterBuffer]);

  // 3. Compute hash of clientDataJSON
  const clientDataHash = crypto.createHash("sha256").update(clientDataBuffer).digest();

  // 4. Data signed is authenticatorData || clientDataHash
  const signedPayload = Buffer.concat([authenticatorData, clientDataHash]);

  // 5. Sign with ECDSA P-256 (ES256)
  const signature = crypto.createSign("SHA256").update(signedPayload).sign(privateKeyPem);

  return {
    type: "webauthn",
    algorithm: "ES256",
    credentialId,
    clientDataJSON: clientDataBuffer.toString("base64"),
    authenticatorData: authenticatorData.toString("base64"),
    signature: signature.toString("base64"),
    challenge,
    userVerified
  };
}

/**
 * Verify a WebAuthn assertion signature
 * @param {object} params
 * @param {string} params.clientDataJSON - Base64 encoded or JSON string
 * @param {string} params.authenticatorData - Base64 encoded or buffer
 * @param {string} params.signature - Base64 encoded DER signature
 * @param {string} params.publicKeyPem - Public Key PEM (ECDSA P-256)
 * @param {string} [params.expectedChallenge]
 * @param {string} [params.expectedOrigin]
 * @returns {{ valid: boolean, userVerified: boolean, userPresent: boolean, reason?: string }}
 */
export function verifyWebAuthnAssertion({
  clientDataJSON,
  authenticatorData,
  signature,
  publicKeyPem,
  expectedChallenge = null,
  expectedOrigin = null
}) {
  try {
    // 1. Decode clientDataJSON
    const clientDataBuffer = typeof clientDataJSON === "string" && !clientDataJSON.startsWith("{")
      ? Buffer.from(clientDataJSON, "base64")
      : Buffer.from(clientDataJSON, "utf8");
    
    const parsedClientData = JSON.parse(clientDataBuffer.toString("utf8"));

    if (parsedClientData.type !== "webauthn.get") {
      return { valid: false, reason: `Invalid clientData type: ${parsedClientData.type}` };
    }

    if (expectedChallenge && parsedClientData.challenge !== expectedChallenge) {
      return { valid: false, reason: `Challenge mismatch: expected ${expectedChallenge}, got ${parsedClientData.challenge}` };
    }

    if (expectedOrigin && parsedClientData.origin !== expectedOrigin) {
      return { valid: false, reason: `Origin mismatch: expected ${expectedOrigin}, got ${parsedClientData.origin}` };
    }

    // 2. Decode authenticatorData
    const authDataBuffer = Buffer.isBuffer(authenticatorData)
      ? authenticatorData
      : Buffer.from(authenticatorData, "base64");

    if (authDataBuffer.length < 37) {
      return { valid: false, reason: "AuthenticatorData too short (< 37 bytes)" };
    }

    const flags = authDataBuffer[32];
    const userPresent = (flags & 0x01) !== 0;
    const userVerified = (flags & 0x04) !== 0;

    if (!userPresent) {
      return { valid: false, reason: "User presence (UP) flag not set" };
    }

    // 3. Compute clientDataHash
    const clientDataHash = crypto.createHash("sha256").update(clientDataBuffer).digest();

    // 4. Combined signed buffer
    const signedPayload = Buffer.concat([authDataBuffer, clientDataHash]);

    // 5. Decode signature buffer
    const signatureBuffer = Buffer.isBuffer(signature)
      ? signature
      : Buffer.from(signature, "base64");

    // 6. Verify ECDSA signature
    const verifier = crypto.createVerify("SHA256");
    verifier.update(signedPayload);
    const valid = verifier.verify(publicKeyPem, signatureBuffer);

    return {
      valid,
      userPresent,
      userVerified,
      reason: valid ? undefined : "ECDSA cryptographic signature verification failed"
    };
  } catch (err) {
    return {
      valid: false,
      userPresent: false,
      userVerified: false,
      reason: "Verification exception: " + err.message
    };
  }
}

/**
 * Universal ballot signature verifier supporting both Ed25519 and WebAuthn ES256 biometric signatures.
 * @param {object} params
 * @param {string} params.proposalId
 * @param {string} params.voterId
 * @param {string} params.decision
 * @param {string|object} params.signature
 * @param {string} params.publicKeyPem
 * @returns {{ valid: boolean, type: string, biometric?: boolean, reason?: string }}
 */
export function verifyBallotSignature({
  proposalId,
  voterId,
  decision,
  signature,
  publicKeyPem
}) {
  if (!signature) {
    return { valid: false, type: "none", reason: "Signature is missing" };
  }

  // 1. WebAuthn Biometric signature object
  if (typeof signature === "object" && signature.type === "webauthn") {
    const res = verifyWebAuthnAssertion({
      clientDataJSON: signature.clientDataJSON,
      authenticatorData: signature.authenticatorData,
      signature: signature.signature,
      publicKeyPem,
      expectedChallenge: signature.challenge
    });

    return {
      valid: res.valid,
      type: "webauthn",
      biometric: res.userVerified,
      userPresent: res.userPresent,
      reason: res.reason
    };
  }

  // 2. Cloud KMS / Hardware Security Module (HSM) signature
  if (typeof signature === "object" && signature.type === "kms") {
    const valid = verifyKmsBallotSignature({
      proposalId,
      voterId,
      decision,
      signature
    });

    return {
      valid,
      type: "kms",
      hsm: true,
      providerType: signature.providerType,
      reason: valid ? undefined : "KMS/HSM hardware cryptographic signature verification failed"
    };
  }

  // 3. Standard Ed25519 signature
  const sigHex = typeof signature === "string" ? signature : signature.signature;
  const ballotPayload = stringifyCanonical({ proposalId, voterId, decision });
  const valid = verifySignature(ballotPayload, sigHex, publicKeyPem);

  return {
    valid,
    type: "ed25519",
    reason: valid ? undefined : "Ed25519 signature verification failed"
  };
}
