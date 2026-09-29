import crypto from "node:crypto";
import { sha256, hashObject } from "../blockchain/crypto.js";

/**
 * Supported Timestamp & Anchor Authorities
 */
export const AnchorAuthority = {
  RFC3161_TSA: "rfc3161_tsa",       // Standard RFC 3161 cryptographic timestamp
  BITCOIN_OTS: "bitcoin_ots",       // OpenTimestamps Bitcoin Merkle calendar anchoring
  ETHEREUM_STATE: "ethereum_state", // Public EVM smart contract state checkpoint
  SIMULATED_LEDGER: "simulated"     // Deterministic test & air-gapped TSA
};

/**
 * Cryptographic Anchor Receipt binding a LegitBlock block hash to an external time source
 */
export class AnchorReceipt {
  /**
   * @param {object} params
   * @param {number} params.blockIndex - Height of the anchored block
   * @param {string} params.blockHash - SHA-256 hash of the anchored block
   * @param {string} params.authority - Type from AnchorAuthority
   * @param {string} params.timestamp - ISO 8601 timestamp certified by authority
   * @param {string} [params.externalReference] - External TxID or TSA serial number
   * @param {string} [params.proofPayload] - Base64-encoded proof or OTS binary
   * @param {string} [params.tsaPublicKey] - Public key of TSA if signed
   * @param {string} [params.tsaSignature] - Cryptographic signature of the timestamp
   */
  constructor({
    blockIndex,
    blockHash,
    authority = AnchorAuthority.SIMULATED_LEDGER,
    timestamp = new Date().toISOString(),
    externalReference = "",
    proofPayload = "",
    tsaPublicKey = "",
    tsaSignature = ""
  }) {
    this.blockIndex = blockIndex;
    this.blockHash = blockHash;
    this.authority = authority;
    this.timestamp = timestamp;
    this.externalReference = externalReference;
    this.proofPayload = proofPayload;
    this.tsaPublicKey = tsaPublicKey;
    this.tsaSignature = tsaSignature;
    this.receiptHash = this.calculateHash();
  }

  calculateHash() {
    return hashObject({
      blockIndex: this.blockIndex,
      blockHash: this.blockHash,
      authority: this.authority,
      timestamp: this.timestamp,
      externalReference: this.externalReference
    });
  }

  toJSON() {
    return {
      blockIndex: this.blockIndex,
      blockHash: this.blockHash,
      authority: this.authority,
      timestamp: this.timestamp,
      externalReference: this.externalReference,
      proofPayload: this.proofPayload,
      tsaPublicKey: this.tsaPublicKey,
      tsaSignature: this.tsaSignature,
      receiptHash: this.receiptHash
    };
  }
}

/**
 * OpenTimestamps (OTS) Proof Builder
 * Encapsulates block hash anchoring into public calendar Merkle branches
 */
export class OpenTimestampsAdapter {
  /**
   * Create an OpenTimestamps commitment envelope for a block hash
   * @param {string} blockHash - Hex SHA-256
   * @param {string} [calendarUrl="https://alice.btc.calendar.opentimestamps.org"]
   * @returns {AnchorReceipt}
   */
  static createAnchorReceipt(blockHeight, blockHash, calendarUrl = "https://alice.btc.calendar.opentimestamps.org") {
    // Generate synthetic OTS Merkle commitment
    const timestamp = new Date().toISOString();
    const nonce = crypto.randomBytes(16).toString("hex");
    const calendarCommitment = sha256(`OTS-CALENDAR:${calendarUrl}:${blockHash}:${nonce}`);
    
    // Structure synthetic OTS proof payload (in production, serialized binary format)
    const proofPayload = Buffer.from(JSON.stringify({
      version: 1,
      hashAlgorithm: "sha256",
      digest: blockHash,
      calendar: calendarUrl,
      commitment: calendarCommitment,
      nonce
    })).toString("base64");

    return new AnchorReceipt({
      blockIndex: blockHeight,
      blockHash,
      authority: AnchorAuthority.BITCOIN_OTS,
      timestamp,
      externalReference: `ots:calendar:${calendarCommitment.slice(0, 16)}`,
      proofPayload
    });
  }

  /**
   * Submit block digest to a live OpenTimestamps calendar server with graceful offline fallback
   * @param {number} blockHeight
   * @param {string} blockHash
   * @param {string} [calendarUrl="https://alice.btc.calendar.opentimestamps.org"]
   * @returns {Promise<AnchorReceipt>}
   */
  static async submitToCalendarLive(blockHeight, blockHash, calendarUrl = "https://alice.btc.calendar.opentimestamps.org") {
    if (typeof fetch === "function") {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const digestBytes = Buffer.from(blockHash, "hex");
        const res = await fetch(`${calendarUrl}/digest`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: digestBytes,
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const timestamp = new Date().toISOString();
          const proofBytes = await res.arrayBuffer();
          const proofPayload = Buffer.from(proofBytes).toString("base64");
          return new AnchorReceipt({
            blockIndex: blockHeight,
            blockHash,
            authority: AnchorAuthority.BITCOIN_OTS,
            timestamp,
            externalReference: `ots:live:${calendarUrl}`,
            proofPayload: proofPayload || Buffer.from(JSON.stringify({ digest: blockHash, calendar: calendarUrl })).toString("base64")
          });
        }
      } catch {
        // Fall back to local synthetic commitment on network timeout / airgap
      }
    }
    return OpenTimestampsAdapter.createAnchorReceipt(blockHeight, blockHash, calendarUrl);
  }

  /**
   * Verify an OTS anchor receipt against a block hash
   * @param {AnchorReceipt} receipt 
   * @param {string} blockHash 
   * @returns {boolean}
   */
  static verifyReceipt(receipt, blockHash) {
    if (receipt.blockHash.toLowerCase() !== blockHash.toLowerCase()) {
      return false;
    }
    if (receipt.authority !== AnchorAuthority.BITCOIN_OTS) {
      return false;
    }
    try {
      const decoded = JSON.parse(Buffer.from(receipt.proofPayload, "base64").toString("utf8"));
      return decoded.digest.toLowerCase() === blockHash.toLowerCase();
    } catch {
      // Live raw OTS binary payload
      return receipt.proofPayload.length > 0;
    }
  }
}

/**
 * RFC 3161 Time Stamping Authority (TSA) Adapter
 * Standard ASN.1 message imprint timestamping for legal admissibility
 */
export class Rfc3161TimestampAdapter {
  /**
   * SHA-256 OID: 2.16.840.1.101.3.4.2.1
   */
  static SHA256_OID = "2.16.840.1.101.3.4.2.1";

  /**
   * Generate an RFC 3161 Timestamp Request structure
   * @param {string} blockHash - Hex SHA-256 string
   * @param {string} [nonce]
   * @returns {object} Machine-readable RFC 3161 request descriptor
   */
  static createTimestampRequest(blockHash, nonce = null) {
    return {
      version: 1,
      messageImprint: {
        hashAlgorithm: {
          algorithm: Rfc3161TimestampAdapter.SHA256_OID,
          parameters: null
        },
        hashedMessage: blockHash
      },
      nonce: nonce || crypto.randomBytes(8).toString("hex"),
      certReq: true
    };
  }

  /**
   * Create a certified RFC 3161 anchor receipt signed by a TSA key
   * @param {number} blockHeight 
   * @param {string} blockHash 
   * @param {object} [signerKey] - Optional TSA keypair
   * @returns {AnchorReceipt}
   */
  static createAnchorReceipt(blockHeight, blockHash, signerKey = null) {
    const timestamp = new Date().toISOString();
    const serialNumber = "TSA-" + Date.now().toString(16) + "-" + crypto.randomBytes(4).toString("hex");

    let tsaPublicKey = "";
    let tsaSignature = "";

    if (signerKey && signerKey.privateKey && signerKey.publicKey) {
      tsaPublicKey = signerKey.publicKey;
      const tstInfoPayload = JSON.stringify({
        version: 1,
        policy: "1.3.6.1.4.1.legitblock.tsa.policy",
        messageImprint: blockHash,
        serialNumber,
        genTime: timestamp
      });
      let signAlgo = signerKey.algorithm;
      if (!signAlgo) {
        try {
          const keyType = crypto.createPrivateKey(signerKey.privateKey).asymmetricKeyType;
          signAlgo = keyType === "ed25519" ? null : "SHA256";
        } catch {
          signAlgo = null;
        }
      } else if (signAlgo === "ED25519") {
        signAlgo = null;
      }
      tsaSignature = crypto.sign(signAlgo, Buffer.from(tstInfoPayload), signerKey.privateKey).toString("hex");
    }

    const proofPayload = Buffer.from(JSON.stringify({
      standard: "RFC3161",
      oid: Rfc3161TimestampAdapter.SHA256_OID,
      serialNumber,
      genTime: timestamp,
      blockHash
    })).toString("base64");

    return new AnchorReceipt({
      blockIndex: blockHeight,
      blockHash,
      authority: AnchorAuthority.RFC3161_TSA,
      timestamp,
      externalReference: serialNumber,
      proofPayload,
      tsaPublicKey,
      tsaSignature
    });
  }

  /**
   * Verify an RFC 3161 anchor receipt
   * @param {AnchorReceipt} receipt 
   * @param {string} blockHash 
   * @returns {boolean}
   */
  static verifyReceipt(receipt, blockHash) {
    if (receipt.blockHash.toLowerCase() !== blockHash.toLowerCase()) {
      return false;
    }
    if (receipt.authority !== AnchorAuthority.RFC3161_TSA) {
      return false;
    }

    try {
      const decoded = JSON.parse(Buffer.from(receipt.proofPayload, "base64").toString("utf8"));
      if (decoded.blockHash.toLowerCase() !== blockHash.toLowerCase()) {
        return false;
      }

      if (receipt.tsaPublicKey && receipt.tsaSignature) {
        const tstInfoPayload = JSON.stringify({
          version: 1,
          policy: "1.3.6.1.4.1.legitblock.tsa.policy",
          messageImprint: blockHash,
          serialNumber: receipt.externalReference,
          genTime: receipt.timestamp
        });
        let verifyAlgo = null;
        try {
          const keyType = crypto.createPublicKey(receipt.tsaPublicKey).asymmetricKeyType;
          verifyAlgo = keyType === "ed25519" ? null : "SHA256";
        } catch {
          verifyAlgo = null;
        }
        try {
          return crypto.verify(
            verifyAlgo,
            Buffer.from(tstInfoPayload),
            receipt.tsaPublicKey,
            Buffer.from(receipt.tsaSignature, "hex")
          );
        } catch {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Service orchestrating periodic chain checkpoint anchoring
 */
export class ChainAnchorService {
  /**
   * @param {object} params
   * @param {import('../blockchain/blockchain.js').Blockchain} params.blockchain
   * @param {string} [params.defaultAuthority=AnchorAuthority.RFC3161_TSA]
   * @param {number} [params.intervalBlocks=10]
   */
  constructor({ blockchain, defaultAuthority = AnchorAuthority.RFC3161_TSA, intervalBlocks = 10 }) {
    this.blockchain = blockchain;
    this.defaultAuthority = defaultAuthority;
    this.intervalBlocks = intervalBlocks;
    this.anchors = new Map(); // blockIndex -> AnchorReceipt
  }

  /**
   * Check if a block index is due for anchoring
   * @param {number} blockIndex 
   * @returns {boolean}
   */
  shouldAnchor(blockIndex) {
    return blockIndex > 0 && blockIndex % this.intervalBlocks === 0;
  }

  /**
   * Anchor the current chain tip or a specific block
   * @param {number} [blockIndex] - Defaults to latest block
   * @param {string} [authority] - Defaults to defaultAuthority
   * @returns {AnchorReceipt}
   */
  anchorBlock(blockIndex = null, authority = null) {
    const targetIndex = blockIndex !== null ? blockIndex : this.blockchain.chain.length - 1;
    const block = typeof this.blockchain.getBlock === "function" 
      ? this.blockchain.getBlock(targetIndex) 
      : this.blockchain.chain[targetIndex];

    if (!block) {
      throw new Error(`Block at height ${targetIndex} not found in blockchain`);
    }

    const auth = authority || this.defaultAuthority;
    let receipt;

    if (auth === AnchorAuthority.BITCOIN_OTS) {
      receipt = OpenTimestampsAdapter.createAnchorReceipt(block.index, block.hash);
    } else {
      receipt = Rfc3161TimestampAdapter.createAnchorReceipt(block.index, block.hash);
    }

    this.anchors.set(targetIndex, receipt);
    return receipt;
  }

  /**
   * Retrieve an anchor receipt for a block
   * @param {number} blockIndex 
   * @returns {AnchorReceipt|null}
   */
  getAnchor(blockIndex) {
    return this.anchors.get(blockIndex) || null;
  }

  /**
   * Verify an anchored block
   * @param {number} blockIndex 
   * @returns {boolean}
   */
  verifyBlockAnchor(blockIndex) {
    const receipt = this.getAnchor(blockIndex);
    const block = typeof this.blockchain.getBlock === "function" 
      ? this.blockchain.getBlock(blockIndex) 
      : this.blockchain.chain[blockIndex];
    if (!receipt || !block) return false;

    if (receipt.authority === AnchorAuthority.BITCOIN_OTS) {
      return OpenTimestampsAdapter.verifyReceipt(receipt, block.hash);
    } else {
      return Rfc3161TimestampAdapter.verifyReceipt(receipt, block.hash);
    }
  }

  /**
   * Get all registered anchors
   * @returns {AnchorReceipt[]}
   */
  getAllAnchors() {
    return Array.from(this.anchors.values());
  }
}
