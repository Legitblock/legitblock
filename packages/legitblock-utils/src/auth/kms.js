import crypto from "node:crypto";
import { stringifyCanonical, sha256 } from "../blockchain/crypto.js";

/**
 * Cloud KMS and Hardware Security Module Provider Types
 */
export const KmsProviderType = {
  AWS_KMS: "aws_kms",
  GCP_KMS: "gcp_kms",
  AZURE_KEYVAULT: "azure_keyvault",
  PKCS11_HSM: "pkcs11_hsm",
  MOCK_HSM: "mock_hsm"
};

/**
 * Supported cryptographic signing algorithms
 */
export const KmsAlgorithm = {
  RSASSA_PKCS1_V1_5_SHA_256: "RSASSA_PKCS1_V1_5_SHA_256",
  ECDSA_SHA_256: "ECDSA_SHA_256",
  ED25519: "ED25519"
};

/**
 * Abstract Base Class for Cloud KMS / HSM Providers
 */
export class KmsProvider {
  /**
   * @param {string} type - Provider type from KmsProviderType
   */
  constructor(type) {
    this.type = type;
  }

  /**
   * Sign a message payload or hash using hardware-protected key
   * @param {object} params
   * @param {string} params.keyId - Unique key ARN, Resource ID, or alias
   * @param {Buffer|string} params.data - Data to sign
   * @param {string} [params.algorithm] - Signing algorithm
   * @returns {Promise<{ signature: string, algorithm: string, keyId: string }>}
   */
  async sign(params) {
    throw new Error("KmsProvider.sign() must be implemented by subclass");
  }

  /**
   * Retrieve the public key (PEM) for signature verification
   * @param {string} keyId
   * @returns {Promise<string>} PEM encoded public key
   */
  async getPublicKey(keyId) {
    throw new Error("KmsProvider.getPublicKey() must be implemented by subclass");
  }

  /**
   * Verify signature using the provider or local verification
   * @param {object} params
   * @param {string} params.keyId
   * @param {Buffer|string} params.data
   * @param {string} params.signature - Base64 or hex signature
   * @param {string} [params.algorithm]
   * @returns {Promise<boolean>}
   */
  async verify(params) {
    throw new Error("KmsProvider.verify() must be implemented by subclass");
  }
}

/**
 * Hardware Security Module / Cloud KMS Simulator
 * Compliant with FIPS-140 Level 3 mock semantics for local unit testing and air-gapped testing
 */
export class MockKmsProvider extends KmsProvider {
  constructor() {
    super(KmsProviderType.MOCK_HSM);
    this.keys = new Map(); // keyId -> { privateKey, publicKey, algorithm, metadata }
  }

  /**
   * Generate and provision a hardware-isolated key inside the mock HSM
   * @param {string} keyId
   * @param {string} [algorithm=KmsAlgorithm.ECDSA_SHA_256]
   * @returns {{ keyId: string, publicKey: string, algorithm: string }}
   */
  generateKey(keyId, algorithm = KmsAlgorithm.ECDSA_SHA_256) {
    let keyPair;
    if (algorithm === KmsAlgorithm.RSASSA_PKCS1_V1_5_SHA_256) {
      keyPair = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" }
      });
    } else if (algorithm === KmsAlgorithm.ED25519) {
      keyPair = crypto.generateKeyPairSync("ed25519", {
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" }
      });
    } else {
      // Default: ECDSA P-256 (prime256v1)
      keyPair = crypto.generateKeyPairSync("ec", {
        namedCurve: "prime256v1",
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" }
      });
    }

    this.keys.set(keyId, {
      ...keyPair,
      algorithm,
      createdAt: new Date().toISOString(),
      fipsCertified: true
    });

    return {
      keyId,
      publicKey: keyPair.publicKey,
      algorithm
    };
  }

  async getPublicKey(keyId) {
    const key = this.keys.get(keyId);
    if (!key) {
      throw new Error(`KMS Key ID not found: ${keyId}`);
    }
    return key.publicKey;
  }

  async sign({ keyId, data, algorithm }) {
    const key = this.keys.get(keyId);
    if (!key) {
      throw new Error(`KMS Key ID not found: ${keyId}`);
    }

    const payload = typeof data === "string" ? Buffer.from(data) : Buffer.from(stringifyCanonical(data));
    const algo = algorithm || key.algorithm;

    let signatureBuffer;
    if (algo === KmsAlgorithm.ED25519) {
      signatureBuffer = crypto.sign(null, payload, key.privateKey);
    } else {
      signatureBuffer = crypto.sign("SHA256", payload, key.privateKey);
    }

    return {
      signature: signatureBuffer.toString("base64"),
      algorithm: algo,
      keyId,
      fipsCertified: key.fipsCertified
    };
  }

  async verify({ keyId, data, signature, algorithm }) {
    const key = this.keys.get(keyId);
    if (!key) {
      throw new Error(`KMS Key ID not found: ${keyId}`);
    }

    const payload = typeof data === "string" ? Buffer.from(data) : Buffer.from(stringifyCanonical(data));
    const sigBuffer = Buffer.from(signature, "base64");
    const algo = algorithm || key.algorithm;

    if (algo === KmsAlgorithm.ED25519) {
      return crypto.verify(null, payload, key.publicKey, sigBuffer);
    } else {
      return crypto.verify("SHA256", payload, key.publicKey, sigBuffer);
    }
  }
}

/**
 * Sign an institutional governance ballot using Cloud KMS / HSM
 * @param {object} params
 * @param {string} params.proposalId
 * @param {string} params.voterId
 * @param {string} params.decision - "YES", "NO", "ABSTAIN"
 * @param {string} params.keyId
 * @param {KmsProvider} params.provider
 * @param {string} [params.notes]
 * @returns {Promise<object>} Universal KMS ballot signature object
 */
export async function kmsSignBallot({
  proposalId,
  voterId,
  decision,
  keyId,
  provider,
  notes = "Signed via Enterprise Cloud KMS / HSM"
}) {
  const ballotPayload = {
    proposalId,
    voterId,
    decision,
    signedAt: new Date().toISOString()
  };

  const canonicalString = stringifyCanonical({ proposalId, voterId, decision });
  const signResult = await provider.sign({
    keyId,
    data: canonicalString
  });

  const publicKey = await provider.getPublicKey(keyId);

  return {
    type: "kms",
    providerType: provider.type,
    keyId,
    algorithm: signResult.algorithm,
    signature: signResult.signature,
    publicKey,
    notes
  };
}

/**
 * Verify a KMS ballot signature
 * @param {object} params
 * @param {string} params.proposalId
 * @param {string} params.voterId
 * @param {string} params.decision
 * @param {object} params.signature - KMS signature object
 * @returns {boolean}
 */
export function verifyKmsBallotSignature({
  proposalId,
  voterId,
  decision,
  signature
}) {
  try {
    if (!signature || signature.type !== "kms") {
      return false;
    }

    const canonicalString = stringifyCanonical({ proposalId, voterId, decision });
    const payload = Buffer.from(canonicalString);
    const sigBuffer = Buffer.from(signature.signature, "base64");
    const publicKey = signature.publicKey;

    if (signature.algorithm === KmsAlgorithm.ED25519) {
      return crypto.verify(null, payload, publicKey, sigBuffer);
    } else {
      return crypto.verify("SHA256", payload, publicKey, sigBuffer);
    }
  } catch {
    return false;
  }
}
