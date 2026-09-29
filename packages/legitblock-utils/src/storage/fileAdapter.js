import fs from "node:fs";
import path from "node:path";
import { StorageAdapter } from "./adapter.js";

/**
 * File-based storage adapter for LegitBlock persistence in Node.js.
 */
export class FileStorageAdapter extends StorageAdapter {
  /**
   * @param {string} dataDir - Directory path to store blockchain and proposals
   */
  constructor(dataDir = "./data/legitblock") {
    super("file");
    this.dataDir = path.resolve(dataDir);
    this.blockchainFile = path.join(this.dataDir, "blockchain.json");
    this.proposalsFile = path.join(this.dataDir, "proposals.json");
    this.ensureDir();
  }

  ensureDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  async isInitialized() {
    if (!fs.existsSync(this.blockchainFile)) return false;
    try {
      const raw = fs.readFileSync(this.blockchainFile, "utf8");
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed.chain) && parsed.chain.length > 0;
    } catch {
      return false;
    }
  }

  async loadBlockchain() {
    if (!fs.existsSync(this.blockchainFile)) return null;
    try {
      const raw = fs.readFileSync(this.blockchainFile, "utf8");
      return JSON.parse(raw);
    } catch (err) {
      console.error("FileStorageAdapter: Failed to load blockchain:", err);
      return null;
    }
  }

  async saveBlockchain(chainData) {
    this.ensureDir();
    fs.writeFileSync(this.blockchainFile, JSON.stringify(chainData, null, 2), "utf8");
  }

  async loadProposals() {
    if (!fs.existsSync(this.proposalsFile)) return null;
    try {
      const raw = fs.readFileSync(this.proposalsFile, "utf8");
      return JSON.parse(raw);
    } catch (err) {
      console.error("FileStorageAdapter: Failed to load proposals:", err);
      return null;
    }
  }

  async saveProposals(proposalsData) {
    this.ensureDir();
    fs.writeFileSync(this.proposalsFile, JSON.stringify(proposalsData, null, 2), "utf8");
  }

  async clear() {
    if (fs.existsSync(this.blockchainFile)) fs.unlinkSync(this.blockchainFile);
    if (fs.existsSync(this.proposalsFile)) fs.unlinkSync(this.proposalsFile);
  }
}
