import { StorageAdapter } from "./adapter.js";

/**
 * In-memory storage adapter for LegitBlock.
 * Ideal for unit testing, temporary instances, and ephemeral microservices.
 */
export class MemoryStorageAdapter extends StorageAdapter {
  constructor() {
    super("memory");
    this.blockchainData = null;
    this.proposalsData = null;
  }

  async isInitialized() {
    return this.blockchainData !== null && Array.isArray(this.blockchainData.chain) && this.blockchainData.chain.length > 0;
  }

  isInitializedSync() {
    return this.blockchainData !== null && Array.isArray(this.blockchainData.chain) && this.blockchainData.chain.length > 0;
  }

  async loadBlockchain() {
    return this.loadBlockchainSync();
  }

  loadBlockchainSync() {
    return this.blockchainData ? JSON.parse(JSON.stringify(this.blockchainData)) : null;
  }

  async saveBlockchain(chainData) {
    this.saveBlockchainSync(chainData);
  }

  saveBlockchainSync(chainData) {
    this.blockchainData = JSON.parse(JSON.stringify(chainData));
  }

  async loadProposals() {
    return this.loadProposalsSync();
  }

  loadProposalsSync() {
    return this.proposalsData ? JSON.parse(JSON.stringify(this.proposalsData)) : null;
  }

  async saveProposals(proposalsData) {
    this.saveProposalsSync(proposalsData);
  }

  saveProposalsSync(proposalsData) {
    this.proposalsData = JSON.parse(JSON.stringify(proposalsData));
  }

  async clear() {
    this.clearSync();
  }

  clearSync() {
    this.blockchainData = null;
    this.proposalsData = null;
  }
}
