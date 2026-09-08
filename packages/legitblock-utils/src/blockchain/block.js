import { hashObject, sha256, stringifyCanonical } from "./crypto.js";

/**
 * Represents a single block in the LegitBlock organizational blockchain
 */
export class Block {
  /**
   * @param {object} params
   * @param {number} params.index - Block index in the chain (0 = genesis)
   * @param {string} params.timestamp - ISO 8601 timestamp of block creation
   * @param {string} params.previousHash - SHA-256 hash of previous block
   * @param {string} params.type - Type of block (GENESIS, DOCUMENT_INSERT, DOCUMENT_AMEND, DOCUMENT_REMOVE, VOTE_TALLY, MEMBER_UPDATE)
   * @param {any} params.data - Transaction payload (e.g. document details, proposal results, votes)
   * @param {number} [params.nonce=0] - Mining / consensus nonce
   * @param {string} [params.validator="system"] - Identifier of creator/validator node or user
   * @param {string} [params.hash=""] - Block SHA-256 hash
   */
  constructor({
    index,
    timestamp,
    previousHash,
    type = "GENESIS",
    data = {},
    nonce = 0,
    validator = "system",
    hash = ""
  }) {
    this.index = index;
    this.timestamp = timestamp || new Date().toISOString();
    this.previousHash = previousHash;
    this.type = type;
    this.data = data;
    this.nonce = nonce;
    this.validator = validator;
    this.hash = hash || this.calculateHash();
  }

  /**
   * Calculate the SHA-256 hash of the block header and payload
   * @returns {string}
   */
  calculateHash() {
    const header = {
      index: this.index,
      timestamp: this.timestamp,
      previousHash: this.previousHash,
      type: this.type,
      data: this.data,
      nonce: this.nonce,
      validator: this.validator
    };
    return hashObject(header);
  }

  /**
   * Mine block with a given difficulty (number of leading zeros in hash)
   * Useful for PoW or lightweight organizational consensus
   * @param {number} difficulty
   */
  mineBlock(difficulty = 1) {
    const target = "0".repeat(difficulty);
    while (!this.hash.startsWith(target)) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }

  /**
   * Verify whether the block hash matches its contents
   * @returns {boolean}
   */
  isValid() {
    return this.hash === this.calculateHash();
  }

  /**
   * Serialize block to plain JSON object
   * @returns {object}
   */
  toJSON() {
    return {
      index: this.index,
      timestamp: this.timestamp,
      previousHash: this.previousHash,
      type: this.type,
      data: this.data,
      nonce: this.nonce,
      validator: this.validator,
      hash: this.hash
    };
  }

  /**
   * Create Block instance from plain JSON object
   * @param {object} json
   * @returns {Block}
   */
  static fromJSON(json) {
    return new Block({
      index: json.index,
      timestamp: json.timestamp,
      previousHash: json.previousHash,
      type: json.type,
      data: json.data,
      nonce: json.nonce,
      validator: json.validator,
      hash: json.hash
    });
  }
}
