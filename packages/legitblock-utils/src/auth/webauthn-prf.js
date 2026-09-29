import crypto from "node:crypto";
import { sha256 } from "../blockchain/crypto.js";

/**
 * WebAuthn PRF (Pseudo-Random Function) Hardware-Anchored Document Encryption for LegitBlock.
 * Utilizes the W3C WebAuthn PRF extension to derive hardware-isolated symmetric AES-256-GCM
 * encryption keys directly inside TouchID/FaceID/YubiKey enclaves.
 */

export class WebAuthnPrfEngine {
  /**
   * Derive a 256-bit AES-GCM key from WebAuthn PRF output using HKDF-SHA256
   * @param {Uint8Array|Buffer|string} prfOutput - 32-byte secret emitted by hardware enclave
   * @param {string} [salt="LegitBlock-PRF-Salt-v1"]
   * @returns {Buffer} 32-byte symmetric key
   */
  static deriveAesKeyFromPrf(prfOutput, salt = "LegitBlock-PRF-Salt-v1") {
    const inputKey = Buffer.isBuffer(prfOutput)
      ? prfOutput
      : Buffer.from(typeof prfOutput === "string" ? prfOutput : Array.from(prfOutput));

    const saltBuffer = Buffer.from(salt, "utf-8");
    const infoBuffer = Buffer.from("aes-256-gcm-document-key", "utf-8");

    return Buffer.from(crypto.hkdfSync("sha256", inputKey, saltBuffer, infoBuffer, 32));
  }

  /**
   * Encrypt document plaintext using derived PRF AES-256-GCM key
   * @param {string} plaintext
   * @param {Buffer} key - 32-byte key
   * @returns {object} Encrypted packet with IV and Auth Tag
   */
  static encryptDocument(plaintext, key) {
    const iv = crypto.randomBytes(12); // Standard 96-bit IV for GCM
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

    let ciphertext = cipher.update(plaintext, "utf-8", "hex");
    ciphertext += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");

    return {
      version: "1.0-WEBAUTHN-PRF-GCM",
      iv: iv.toString("hex"),
      ciphertext,
      authTag,
      digest: sha256(plaintext),
      encryptedAt: new Date().toISOString()
    };
  }

  /**
   * Decrypt document packet using derived PRF AES-256-GCM key
   * @param {object} encryptedPacket
   * @param {Buffer} key - 32-byte key
   * @returns {string} Decrypted plaintext
   */
  static decryptDocument(encryptedPacket, key) {
    if (!encryptedPacket || encryptedPacket.version !== "1.0-WEBAUTHN-PRF-GCM") {
      throw new Error("Invalid or unsupported encrypted packet format");
    }

    const iv = Buffer.from(encryptedPacket.iv, "hex");
    const authTag = Buffer.from(encryptedPacket.authTag, "hex");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    let plaintext = decipher.update(encryptedPacket.ciphertext, "hex", "utf-8");
    plaintext += decipher.final("utf-8");

    // Verify hash integrity
    if (encryptedPacket.digest && sha256(plaintext) !== encryptedPacket.digest) {
      throw new Error("Integrity violation: decrypted document hash does not match declared digest");
    }

    return plaintext;
  }

  /**
   * Create W3C WebAuthn creation options requesting PRF extension
   * @param {string} rpId
   * @param {string} username
   * @returns {object} navigator.credentials.create options
   */
  static createPrfRegistrationOptions(rpId = "legitblock.github.io", username = "director@legitblock") {
    const challenge = crypto.randomBytes(32);
    const userId = crypto.randomBytes(16);

    return {
      publicKey: {
        rp: { name: "LegitBlock Corporate Enclave", id: rpId },
        user: {
          id: userId,
          name: username,
          displayName: username
        },
        challenge,
        pubKeyCredParams: [
          { type: "public-key", alg: -7 }, // ES256
          { type: "public-key", alg: -257 } // RS256
        ],
        authenticatorSelection: {
          userVerification: "required",
          residentKey: "preferred"
        },
        extensions: {
          prf: {}
        }
      }
    };
  }

  /**
   * Create W3C WebAuthn get assertion options evaluating PRF extension
   * @param {string} credentialIdHex
   * @param {string} [saltHex]
   * @returns {object} navigator.credentials.get options
   */
  static createPrfAuthenticationOptions(credentialIdHex, saltHex = null) {
    const challenge = crypto.randomBytes(32);
    const salt = saltHex ? Buffer.from(saltHex, "hex") : crypto.randomBytes(32);

    return {
      publicKey: {
        challenge,
        allowCredentials: [
          {
            type: "public-key",
            id: Buffer.from(credentialIdHex, "hex")
          }
        ],
        userVerification: "required",
        extensions: {
          prf: {
            eval: {
              first: salt
            }
          }
        }
      }
    };
  }
}
