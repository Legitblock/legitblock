import fs from "node:fs";
import path from "node:path";
import { Blockchain } from "../blockchain/blockchain.js";
import { VotingEngine } from "../voting/engine.js";
import { StorageAdapter } from "./adapter.js";
import { FileStorageAdapter } from "./fileAdapter.js";

/**
 * State persistence store for LegitBlock.
 * Supports pluggable storage adapters (File, Memory, IndexedDB) with fallback to local filesystem.
 */
export class LegitBlockStore {
  /**
   * @param {string|StorageAdapter} [storageOrDir="./data/legitblock"] - Directory path or StorageAdapter instance
   */
  constructor(storageOrDir = "./data/legitblock") {
    if (storageOrDir instanceof StorageAdapter) {
      this.adapter = storageOrDir;
      this.dataDir = null;
      this.blockchainFile = null;
      this.proposalsFile = null;
    } else {
      this.dataDir = path.resolve(storageOrDir);
      this.blockchainFile = path.join(this.dataDir, "blockchain.json");
      this.proposalsFile = path.join(this.dataDir, "proposals.json");
      this.adapter = new FileStorageAdapter(this.dataDir);
    }

    this.lastChainMtime = 0;
    this.lastPropMtime = 0;
    this.ensureDir();

    this.blockchain = this.loadBlockchain();
    this.votingEngine = this.loadVotingEngine();
  }

  ensureDir() {
    if (this.dataDir && !fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  syncIfModified() {
    if (!this.blockchainFile) return;
    if (fs.existsSync(this.blockchainFile)) {
      const stat = fs.statSync(this.blockchainFile);
      if (stat.mtimeMs > this.lastChainMtime) {
        this.blockchain = this.loadBlockchain();
      }
    }
    if (fs.existsSync(this.proposalsFile)) {
      const stat = fs.statSync(this.proposalsFile);
      if (stat.mtimeMs > this.lastPropMtime) {
        this.votingEngine = this.loadVotingEngine();
      }
    }
  }

  /**
   * Check if organization blockchain has been initialized
   * @returns {boolean}
   */
  isInitialized() {
    this.syncIfModified();
    return this.blockchain.chain.length > 0;
  }

  /**
   * Load blockchain from storage or create fresh instance
   * @returns {Blockchain}
   */
  loadBlockchain() {
    if (this.blockchainFile && fs.existsSync(this.blockchainFile)) {
      try {
        const stat = fs.statSync(this.blockchainFile);
        this.lastChainMtime = stat.mtimeMs;
        return Blockchain.loadFromFile(this.blockchainFile);
      } catch (err) {
        console.error("Failed to load blockchain, creating new:", err);
      }
    } else if (this.adapter && typeof this.adapter.loadBlockchainSync === "function") {
      const data = this.adapter.loadBlockchainSync();
      if (data) return Blockchain.fromJSON(data);
    }
    return new Blockchain({ difficulty: 1 });
  }

  /**
   * Save blockchain to storage
   */
  saveBlockchain() {
    if (this.blockchainFile) {
      this.ensureDir();
      this.blockchain.saveToFile(this.blockchainFile);
      if (fs.existsSync(this.blockchainFile)) {
        this.lastChainMtime = fs.statSync(this.blockchainFile).mtimeMs;
      }
    } else if (this.adapter) {
      if (typeof this.adapter.saveBlockchainSync === "function") {
        this.adapter.saveBlockchainSync(this.blockchain.toJSON());
      } else {
        this.adapter.saveBlockchain(this.blockchain.toJSON());
      }
    }
  }

  /**
   * Load voting engine from storage or create fresh instance
   * @returns {VotingEngine}
   */
  loadVotingEngine() {
    if (this.proposalsFile && fs.existsSync(this.proposalsFile)) {
      try {
        const stat = fs.statSync(this.proposalsFile);
        this.lastPropMtime = stat.mtimeMs;
        const raw = fs.readFileSync(this.proposalsFile, "utf8");
        return VotingEngine.fromJSON(JSON.parse(raw));
      } catch (err) {
        console.error("Failed to load proposals, creating new:", err);
      }
    } else if (this.adapter && typeof this.adapter.loadProposalsSync === "function") {
      const data = this.adapter.loadProposalsSync();
      if (data) return VotingEngine.fromJSON(data);
    }
    return new VotingEngine();
  }

  /**
   * Save voting engine proposals to storage
   */
  saveVotingEngine() {
    if (this.proposalsFile) {
      this.ensureDir();
      fs.writeFileSync(this.proposalsFile, JSON.stringify(this.votingEngine.toJSON(), null, 2), "utf8");
      if (fs.existsSync(this.proposalsFile)) {
        this.lastPropMtime = fs.statSync(this.proposalsFile).mtimeMs;
      }
    } else if (this.adapter) {
      if (typeof this.adapter.saveProposalsSync === "function") {
        this.adapter.saveProposalsSync(this.votingEngine.toJSON());
      } else {
        this.adapter.saveProposals(this.votingEngine.toJSON());
      }
    }
  }

  /**
   * Asynchronously initialize state from asynchronous storage adapter
   */
  async initAsync() {
    if (this.adapter) {
      const chainData = await this.adapter.loadBlockchain();
      if (chainData) {
        this.blockchain = Blockchain.fromJSON(chainData);
      }
      const propData = await this.adapter.loadProposals();
      if (propData) {
        this.votingEngine = VotingEngine.fromJSON(propData);
      }
    }
  }

  /**
   * Asynchronously persist state to storage adapter
   */
  async saveAsync() {
    if (this.adapter) {
      await this.adapter.saveBlockchain(this.blockchain.toJSON());
      await this.adapter.saveProposals(this.votingEngine.toJSON());
    } else {
      this.saveBlockchain();
      this.saveVotingEngine();
    }
  }

  /**
   * Reset store (useful for testing or re-initialization)
   */
  reset() {
    if (this.blockchainFile && fs.existsSync(this.blockchainFile)) fs.unlinkSync(this.blockchainFile);
    if (this.proposalsFile && fs.existsSync(this.proposalsFile)) fs.unlinkSync(this.proposalsFile);
    if (this.adapter) this.adapter.clear();
    this.blockchain = new Blockchain({ difficulty: 1 });
    this.votingEngine = new VotingEngine();
    this.lastChainMtime = 0;
    this.lastPropMtime = 0;
  }
}
